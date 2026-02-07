/**
 * BIP39 Recovery Phrase Management
 *
 * This module handles BIP39 mnemonic generation and validation for recovery phrases.
 * The recovery phrase allows users to recover their encryption key on a new device.
 *
 * Flow:
 * 1. Generate 12-word BIP39 mnemonic (128 bits entropy)
 * 2. Derive a key from the mnemonic
 * 3. Use this key to encrypt the PBKDF2 salt
 * 4. Store encrypted salt in Firestore
 * 5. User can recover salt on new device with the 12 words
 *
 * Security: The recovery phrase is shown ONE-TIME only. User must save it securely.
 */

import * as bip39 from 'bip39';

/**
 * Generates a BIP39 mnemonic recovery phrase (12 words).
 *
 * This phrase provides 128 bits of entropy and follows the BIP39 standard.
 * The user must save this phrase securely to recover their data on a new device.
 *
 * @returns 12-word mnemonic phrase (space-separated)
 *
 * @example
 * const recoveryPhrase = generateRecoveryPhrase();
 * // Example output: "witch collapse practice feed shame open despair creek road again ice least"
 */
export function generateRecoveryPhrase(): string {
  // Generate 128 bits of entropy (12 words)
  const mnemonic = bip39.generateMnemonic(128);
  return mnemonic;
}

/**
 * Validates a BIP39 mnemonic phrase.
 *
 * Checks that the phrase is valid according to BIP39 standard:
 * - Correct number of words (12, 15, 18, 21, or 24)
 * - Words are from the BIP39 wordlist
 * - Valid checksum
 *
 * @param phrase - Mnemonic phrase to validate
 * @returns true if valid, false otherwise
 *
 * @example
 * const isValid = validateRecoveryPhrase("witch collapse practice feed shame open despair creek road again ice least");
 * // Returns: true
 *
 * const isInvalid = validateRecoveryPhrase("invalid words here");
 * // Returns: false
 */
export function validateRecoveryPhrase(phrase: string): boolean {
  return bip39.validateMnemonic(phrase);
}

/**
 * Derives a CryptoKey from a BIP39 recovery phrase.
 *
 * This key is used to encrypt the PBKDF2 salt for storage in Firestore.
 * The same recovery phrase will always produce the same key, allowing
 * users to decrypt the salt on a new device.
 *
 * @param phrase - BIP39 mnemonic phrase
 * @returns CryptoKey for AES-GCM encryption
 *
 * @example
 * const recoveryKey = await deriveKeyFromRecoveryPhrase("witch collapse...");
 * // Use this key to encrypt/decrypt the salt
 */
export async function deriveKeyFromRecoveryPhrase(
  phrase: string
): Promise<CryptoKey> {
  // Convert mnemonic to seed (512 bits)
  const seed = await bip39.mnemonicToSeed(phrase);

  // Use first 256 bits of seed as key material
  const keyMaterial = seed.slice(0, 32); // 32 bytes = 256 bits

  // Import as AES-GCM key
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    'AES-GCM',
    true,
    ['encrypt', 'decrypt']
  );

  return key;
}

/**
 * Encrypts the PBKDF2 salt with the recovery key (derived from BIP39 phrase).
 *
 * The encrypted salt is stored in Firestore. This allows users to recover
 * the salt on a new device by entering their 12-word recovery phrase.
 *
 * @param salt - PBKDF2 salt (16 bytes)
 * @param recoveryKey - Key derived from BIP39 phrase
 * @returns Base64-encoded encrypted salt with IV
 *
 * @example
 * const salt = generateSalt();
 * const recoveryKey = await deriveKeyFromRecoveryPhrase("witch collapse...");
 * const encryptedSalt = await encryptSaltWithRecoveryKey(salt, recoveryKey);
 * // Store encryptedSalt in Firestore
 */
export async function encryptSaltWithRecoveryKey(
  salt: Uint8Array,
  recoveryKey: CryptoKey
): Promise<string> {
  // Generate IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM

  // Encrypt salt
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    recoveryKey,
    salt
  );

  const encryptedArray = new Uint8Array(encryptedBuffer);

  // Combine IV + encrypted data
  const combined = new Uint8Array(iv.length + encryptedArray.length);
  combined.set(iv);
  combined.set(encryptedArray, iv.length);

  // Convert to base64 for storage
  const combinedArray = Array.from(combined);
  return btoa(String.fromCharCode(...combinedArray));
}

/**
 * Decrypts the PBKDF2 salt using the recovery phrase.
 *
 * When a user enters their 12-word recovery phrase on a new device,
 * this function recovers the salt from Firestore.
 *
 * @param encryptedSalt - Base64-encoded encrypted salt (from Firestore)
 * @param recoveryPhrase - User's 12-word BIP39 phrase
 * @returns Decrypted PBKDF2 salt (16 bytes)
 * @throws Error if decryption fails (invalid phrase or corrupted data)
 *
 * @example
 * const encryptedSalt = getUserDocFromFirestore().encryptedSalt;
 * const recoveryPhrase = "witch collapse practice feed...";
 *
 * try {
 *   const salt = await decryptSaltWithRecoveryPhrase(encryptedSalt, recoveryPhrase);
 *   // Now derive key with this salt and new passphrase
 * } catch (error) {
 *   console.error("Invalid recovery phrase or corrupted data");
 * }
 */
export async function decryptSaltWithRecoveryPhrase(
  encryptedSalt: string,
  recoveryPhrase: string
): Promise<Uint8Array> {
  // Validate recovery phrase first
  if (!validateRecoveryPhrase(recoveryPhrase)) {
    throw new Error('Phrase de récupération invalide.');
  }

  // Derive key from recovery phrase
  const recoveryKey = await deriveKeyFromRecoveryPhrase(recoveryPhrase);

  // Decode base64
  const combinedString = atob(encryptedSalt);
  const combined = new Uint8Array(
    combinedString.split('').map(char => char.charCodeAt(0))
  );

  // Extract IV (first 12 bytes) and encrypted data
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);

  // Decrypt
  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      recoveryKey,
      encryptedData
    );

    return new Uint8Array(decryptedBuffer);
  } catch (error) {
    throw new Error(
      'Échec du déchiffrement. Phrase de récupération incorrecte ou données corrompues.'
    );
  }
}

/**
 * Converts a recovery phrase to a printable format.
 *
 * Formats the 12 words into a numbered list for easy printing/writing.
 *
 * @param phrase - BIP39 mnemonic phrase
 * @returns Formatted numbered list
 *
 * @example
 * const phrase = "witch collapse practice feed shame open despair creek road again ice least";
 * const formatted = formatRecoveryPhraseForPrint(phrase);
 * // Returns:
 * // 1. witch
 * // 2. collapse
 * // 3. practice
 * // ...
 */
export function formatRecoveryPhraseForPrint(phrase: string): string {
  const words = phrase.split(' ');
  return words.map((word, index) => `${index + 1}. ${word}`).join('\n');
}

/**
 * Splits a recovery phrase into an array of words.
 *
 * Useful for UI components that display words individually (e.g., 12 input fields).
 *
 * @param phrase - BIP39 mnemonic phrase
 * @returns Array of 12 words
 *
 * @example
 * const words = splitRecoveryPhrase("witch collapse practice...");
 * // Returns: ["witch", "collapse", "practice", ...]
 */
export function splitRecoveryPhrase(phrase: string): string[] {
  return phrase.split(' ').filter(word => word.length > 0);
}

/**
 * Joins an array of words into a recovery phrase.
 *
 * Useful for UI components with separate input fields for each word.
 *
 * @param words - Array of 12 words
 * @returns Space-separated mnemonic phrase
 *
 * @example
 * const words = ["witch", "collapse", "practice", ...];
 * const phrase = joinRecoveryPhrase(words);
 * // Returns: "witch collapse practice..."
 */
export function joinRecoveryPhrase(words: string[]): string {
  return words.map(word => word.trim().toLowerCase()).join(' ');
}
