/**
 * Passphrase-based Key Derivation (PBKDF2)
 *
 * This module provides secure key derivation from user passphrases using PBKDF2-SHA256.
 * Keys are derived with 210,000 iterations (OWASP 2024 recommendation) for resistance
 * against brute-force attacks.
 *
 * Security: Admin-Blind architecture is preserved - passphrases never leave the browser.
 */

/**
 * PBKDF2 parameters (OWASP 2024 recommendations)
 */
const PBKDF2_ITERATIONS = 210_000; // Protection against brute-force
const SALT_LENGTH = 16; // 128 bits
const KEY_LENGTH = 256; // 256 bits for AES-256-GCM

/**
 * Derives an AES-256-GCM encryption key from a user passphrase.
 *
 * Uses PBKDF2-SHA256 with 210,000 iterations to slow down brute-force attacks.
 * The derived key is suitable for AES-GCM encryption.
 *
 * @param passphrase - User's passphrase (recommended min 12 characters)
 * @param salt - Unique salt for this user (16 bytes)
 * @returns CryptoKey for AES-GCM encryption/decryption
 *
 * @example
 * const salt = generateSalt();
 * const key = await deriveKeyFromPassphrase("MySecurePassphrase123!", salt);
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  // Convert passphrase to bytes
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);

  // Import passphrase as a key for PBKDF2
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passphraseBytes,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive AES-GCM key using PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true, // extractable (needed for sessionStorage serialization)
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

/**
 * Generates a cryptographically secure random salt.
 *
 * Each user should have a unique salt to prevent rainbow table attacks.
 *
 * @returns 16-byte random salt
 *
 * @example
 * const salt = generateSalt();
 * // Store this salt securely (encrypted with BIP39 key in Firestore)
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Creates a SHA-256 hash of the passphrase for verification.
 *
 * This hash is stored in Firestore to validate the passphrase without storing
 * the passphrase itself. The hash cannot be reversed to obtain the passphrase.
 *
 * @param passphrase - User's passphrase
 * @returns Base64-encoded SHA-256 hash
 *
 * @example
 * const hash = await hashPassphrase("MySecurePassphrase123!");
 * // Store hash in Firestore user doc for validation
 *
 * // Later, to verify:
 * const inputHash = await hashPassphrase(userInputPassphrase);
 * const isValid = inputHash === storedHash;
 */
export async function hashPassphrase(passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);

  const hashBuffer = await crypto.subtle.digest('SHA-256', passphraseBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return hashBase64;
}

/**
 * Validates passphrase strength.
 *
 * Minimum requirements:
 * - At least 12 characters
 * - Contains uppercase letter
 * - Contains lowercase letter
 * - Contains digit
 * - Contains special character
 *
 * @param passphrase - Passphrase to validate
 * @returns Object with validation result and error message if invalid
 *
 * @example
 * const validation = validatePassphraseStrength("weak");
 * if (!validation.isValid) {
 *   console.error(validation.error);
 * }
 */
export function validatePassphraseStrength(passphrase: string): {
  isValid: boolean;
  error?: string;
} {
  if (passphrase.length < 12) {
    return {
      isValid: false,
      error: 'La passphrase doit contenir au moins 12 caractères.'
    };
  }

  if (!/[A-Z]/.test(passphrase)) {
    return {
      isValid: false,
      error: 'La passphrase doit contenir au moins une lettre majuscule.'
    };
  }

  if (!/[a-z]/.test(passphrase)) {
    return {
      isValid: false,
      error: 'La passphrase doit contenir au moins une lettre minuscule.'
    };
  }

  if (!/[0-9]/.test(passphrase)) {
    return {
      isValid: false,
      error: 'La passphrase doit contenir au moins un chiffre.'
    };
  }

  if (!/[^A-Za-z0-9]/.test(passphrase)) {
    return {
      isValid: false,
      error: 'La passphrase doit contenir au moins un caractère spécial.'
    };
  }

  return { isValid: true };
}

/**
 * Converts a Uint8Array salt to base64 string for storage.
 *
 * @param salt - Salt bytes
 * @returns Base64-encoded salt
 */
export function saltToBase64(salt: Uint8Array): string {
  const saltArray = Array.from(salt);
  return btoa(String.fromCharCode(...saltArray));
}

/**
 * Converts a base64 string back to Uint8Array salt.
 *
 * @param saltBase64 - Base64-encoded salt
 * @returns Salt bytes
 */
export function base64ToSalt(saltBase64: string): Uint8Array {
  const saltString = atob(saltBase64);
  return new Uint8Array(saltString.split('').map(char => char.charCodeAt(0)));
}
