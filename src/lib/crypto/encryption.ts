/**
 * Client-Side Encryption Library
 *
 * AES-256-GCM protection layer for journal entries
 * - All crypto operations happen in the browser
 * - The current key derivation is deterministic from the Firebase UID
 * - Data is transformed before being sent to Firestore
 *
 * Important:
 * - This is not end-to-end encryption
 * - This does not provide a zero-knowledge or admin-blind guarantee
 * - The current scheme mainly reduces accidental plaintext exposure at rest
 */

export const ENCRYPTION_WARNING =
  "Current journal protection is client-side AES-GCM with a deterministic UID-derived key. It should not be marketed as end-to-end, zero-knowledge, or admin-blind encryption.";

export const LEGACY_ENCRYPTION_VERSION = 1;
export const PASSPHRASE_ENCRYPTION_VERSION = 2;
export const DEFAULT_PBKDF2_ITERATIONS = 310000;

export interface WrappedContentKeyEnvelope {
  version: number;
  algorithm: 'AES-GCM';
  kdf: 'PBKDF2-SHA-256';
  iterations: number;
  salt: string;
  iv: string;
  wrappedKey: string;
}

/**
 * Encrypted data structure stored in Firestore
 */
export interface EncryptedData {
  /** Base64-encoded encrypted content */
  ciphertext: string;
  /** Base64-encoded initialization vector */
  iv: string;
  /** Algorithm version for future migration */
  version: number;
}

/**
 * Generate a cryptographically secure encryption key
 * Uses WebCrypto API (native browser crypto)
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to raw bytes (for storage)
 */
export async function exportKey(key: CryptoKey): Promise<ArrayBuffer> {
  return await crypto.subtle.exportKey('raw', key);
}

/**
 * Import raw bytes to a CryptoKey
 */
export async function importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

async function derivePassphraseKey(
  passphrase: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const passphraseBytes = new TextEncoder().encode(passphrase);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function wrapKeyWithPassphrase(
  key: CryptoKey,
  passphrase: string,
  iterations = DEFAULT_PBKDF2_ITERATIONS
): Promise<WrappedContentKeyEnvelope> {
  const rawKey = await exportKey(key);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await derivePassphraseKey(passphrase, salt, iterations);

  const wrappedKey = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    wrappingKey,
    rawKey
  );

  return {
    version: PASSPHRASE_ENCRYPTION_VERSION,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2-SHA-256',
    iterations,
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer),
    wrappedKey: arrayBufferToBase64(wrappedKey),
  };
}

export async function unwrapKeyWithPassphrase(
  envelope: WrappedContentKeyEnvelope,
  passphrase: string
): Promise<CryptoKey> {
  const salt = new Uint8Array(base64ToArrayBuffer(envelope.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(envelope.iv));
  const wrappedKey = base64ToArrayBuffer(envelope.wrappedKey);
  const wrappingKey = await derivePassphraseKey(passphrase, salt, envelope.iterations);

  const rawKey = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    wrappingKey,
    wrappedKey
  );

  return await importKey(rawKey);
}

export function isWrappedContentKeyEnvelope(value: unknown): value is WrappedContentKeyEnvelope {
  if (!value || typeof value !== 'object') return false;
  const envelope = value as WrappedContentKeyEnvelope;
  return (
    envelope.version === PASSPHRASE_ENCRYPTION_VERSION &&
    envelope.algorithm === 'AES-GCM' &&
    envelope.kdf === 'PBKDF2-SHA-256' &&
    typeof envelope.iterations === 'number' &&
    typeof envelope.salt === 'string' &&
    typeof envelope.iv === 'string' &&
    typeof envelope.wrappedKey === 'string'
  );
}

/**
 * Derive a deterministic key from the Firebase UID.
 * This creates per-user separation, but the UID is not a secret.
 *
 * @param uid Firebase user UID
 * @param salt Optional salt (for key rotation)
 */
export async function deriveKeyFromUID(uid: string, salt?: string): Promise<CryptoKey> {
  const textEncoder = new TextEncoder();
  const uidBytes = textEncoder.encode(uid + (salt || 'aurum-v1'));

  // Hash UID to get deterministic key material
  const hashBuffer = await crypto.subtle.digest('SHA-256', uidBytes);

  // Import as AES key
  return await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt plaintext string with AES-256-GCM
 *
 * @param plaintext The content to encrypt
 * @param key The encryption key
 * @returns Encrypted data with IV
 */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<EncryptedData> {
  const textEncoder = new TextEncoder();
  const plaintextBytes = textEncoder.encode(plaintext);

  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128, // Authentication tag length
    },
    key,
    plaintextBytes
  );

  // Convert to base64 for storage
  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    iv: arrayBufferToBase64(iv.buffer),
    version: PASSPHRASE_ENCRYPTION_VERSION,
  };
}

/**
 * Decrypt AES-256-GCM encrypted data
 *
 * @param encryptedData The encrypted data object
 * @param key The decryption key
 * @returns Decrypted plaintext string
 */
export async function decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
  const ciphertextBuffer = base64ToArrayBuffer(encryptedData.ciphertext);
  const ivBuffer = base64ToArrayBuffer(encryptedData.iv);

  // Decrypt
  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
      tagLength: 128,
    },
    key,
    ciphertextBuffer
  );

  // Convert back to string
  const textDecoder = new TextDecoder();
  return textDecoder.decode(plaintextBuffer);
}

/**
 * Utility: Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Utility: Convert Base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Check if data is encrypted (has required fields)
 */
export function isEncrypted(data: any): data is EncryptedData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.ciphertext === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.version === 'number'
  );
}
