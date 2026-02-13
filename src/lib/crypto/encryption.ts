/**
 * Client-Side Encryption Library
 *
 * AES-256-GCM encryption for journal entries
 * - All encryption happens in the browser
 * - Keys are derived from Firebase UID + user passphrase
 * - Data is encrypted before being sent to Firestore
 *
 * Security model:
 * - Encryption key stored in browser's IndexedDB (encrypted with passphrase-derived key)
 * - Firestore only stores encrypted data (admin-blind)
 * - Decryption happens client-side only
 */

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

/**
 * Derive an encryption key from user's Firebase UID
 * This ensures each user has a unique key
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
    version: 1, // Algorithm version
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
