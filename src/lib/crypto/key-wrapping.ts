/**
 * Key Wrapping Utilities (AES-KW / AES-GCM)
 *
 * Provides secure key wrapping for Passkey-based encryption.
 * The master encryption key is wrapped using a key derived from WebAuthn PRF output.
 *
 * Flow:
 * 1. Generate random AES-256 master key
 * 2. Derive wrapping key from PRF output via HKDF
 * 3. Wrap master key with AES-GCM (not AES-KW for browser compatibility)
 * 4. Store wrapped key locally
 *
 * Security: Master key never leaves the browser in plaintext.
 */

const WRAPPING_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const HKDF_INFO = new TextEncoder().encode('aurum-sanctuary-passkey-v1');
const HKDF_SALT = new TextEncoder().encode('aurum-prf-salt-v1');

export interface WrappedKeyData {
  wrappedKey: string; // Base64 encoded
  iv: string; // Base64 encoded
  version: number;
}

/**
 * Generates a new random AES-256-GCM master key.
 *
 * This key will be used to encrypt/decrypt journal entries.
 * It should be wrapped with a passkey-derived key for storage.
 *
 * @returns New CryptoKey for encryption/decryption
 */
export async function generateMasterKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: KEY_LENGTH,
    },
    true, // extractable (needed for wrapping)
    ['encrypt', 'decrypt']
  );
}

/**
 * Derives a wrapping key from WebAuthn PRF output using HKDF.
 *
 * The PRF output is pseudorandom but we run it through HKDF for:
 * - Domain separation (HKDF info)
 * - Key stretching to exactly 256 bits
 *
 * @param prfOutput - Raw PRF output from WebAuthn (typically 32 bytes)
 * @returns CryptoKey suitable for wrapping/unwrapping
 */
export async function deriveWrappingKeyFromPRF(
  prfOutput: ArrayBuffer
): Promise<CryptoKey> {
  // Import PRF output as HKDF key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    prfOutput,
    'HKDF',
    false,
    ['deriveKey']
  );

  // Derive AES-GCM wrapping key via HKDF
  const wrappingKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: HKDF_SALT,
      info: HKDF_INFO,
    },
    keyMaterial,
    { name: WRAPPING_ALGORITHM, length: KEY_LENGTH },
    false, // not extractable
    ['wrapKey', 'unwrapKey']
  );

  return wrappingKey;
}

/**
 * Wraps the master key using AES-GCM.
 *
 * We use AES-GCM instead of AES-KW because:
 * - Better browser support
 * - Provides authentication (tampering detection)
 *
 * @param masterKey - The key to wrap
 * @param wrappingKey - Key derived from PRF output
 * @returns Wrapped key data for storage
 */
export async function wrapMasterKey(
  masterKey: CryptoKey,
  wrappingKey: CryptoKey
): Promise<WrappedKeyData> {
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Export master key to raw format
  const rawMasterKey = await crypto.subtle.exportKey('raw', masterKey);

  // Encrypt the raw key bytes with AES-GCM
  const wrappedBuffer = await crypto.subtle.encrypt(
    {
      name: WRAPPING_ALGORITHM,
      iv,
    },
    wrappingKey,
    rawMasterKey
  );

  return {
    wrappedKey: arrayBufferToBase64(wrappedBuffer),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    version: 3, // v3 = passkey encryption
  };
}

/**
 * Unwraps the master key using the PRF-derived wrapping key.
 *
 * @param wrappedData - The wrapped key data from storage
 * @param wrappingKey - Key derived from PRF output
 * @returns The unwrapped master CryptoKey
 * @throws Error if unwrapping fails (wrong key or tampered data)
 */
export async function unwrapMasterKey(
  wrappedData: WrappedKeyData,
  wrappingKey: CryptoKey
): Promise<CryptoKey> {
  const iv = base64ToArrayBuffer(wrappedData.iv);
  const wrappedKey = base64ToArrayBuffer(wrappedData.wrappedKey);

  // Decrypt to get raw key bytes
  const rawKeyBuffer = await crypto.subtle.decrypt(
    {
      name: WRAPPING_ALGORITHM,
      iv: new Uint8Array(iv),
    },
    wrappingKey,
    wrappedKey
  );

  // Import as AES-GCM key
  const masterKey = await crypto.subtle.importKey(
    'raw',
    rawKeyBuffer,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable (for session storage)
    ['encrypt', 'decrypt']
  );

  return masterKey;
}

/**
 * Wraps the master key with a BIP39-derived key for recovery.
 *
 * This provides a fallback if the user loses their passkey.
 *
 * @param masterKey - The key to wrap
 * @param recoveryKey - Key derived from BIP39 phrase
 * @returns Wrapped key data for Firestore storage
 */
export async function wrapMasterKeyForRecovery(
  masterKey: CryptoKey,
  recoveryKey: CryptoKey
): Promise<WrappedKeyData> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const rawMasterKey = await crypto.subtle.exportKey('raw', masterKey);

  const wrappedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    recoveryKey,
    rawMasterKey
  );

  return {
    wrappedKey: arrayBufferToBase64(wrappedBuffer),
    iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
    version: 3,
  };
}

/**
 * Unwraps the master key using a BIP39-derived recovery key.
 *
 * @param wrappedData - The recovery-wrapped key from Firestore
 * @param recoveryKey - Key derived from user's 12-word phrase
 * @returns The unwrapped master CryptoKey
 */
export async function unwrapMasterKeyWithRecovery(
  wrappedData: WrappedKeyData,
  recoveryKey: CryptoKey
): Promise<CryptoKey> {
  const iv = base64ToArrayBuffer(wrappedData.iv);
  const wrappedKey = base64ToArrayBuffer(wrappedData.wrappedKey);

  const rawKeyBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv),
    },
    recoveryKey,
    wrappedKey
  );

  const masterKey = await crypto.subtle.importKey(
    'raw',
    rawKeyBuffer,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  return masterKey;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
