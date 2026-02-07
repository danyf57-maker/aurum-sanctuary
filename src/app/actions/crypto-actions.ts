"use server";

/**
 * Crypto Server Actions
 *
 * Server-side actions for managing cryptographic metadata in Firestore.
 * These actions handle:
 * - Saving encrypted salt and passphrase hash
 * - Retrieving crypto metadata for unlocking/recovery
 * - Marking migration as complete
 *
 * Security: Admin-Blind architecture is preserved:
 * - Passphrase hash (not the passphrase itself)
 * - Encrypted salt (encrypted with BIP39 key, admin cannot decrypt)
 * - No encryption keys ever touch the server
 */

import { db } from "@/lib/firebase/server-config";
import { Timestamp } from "firebase-admin/firestore";
import { getAuthedUserId } from "@/app/actions/auth";
import { logger } from "@/lib/logger/safe";

export type CryptoMetadata = {
  encryptionVersion: number;
  saltBase64?: string; // Plaintext salt for normal unlock
  encryptedSalt?: string; // BIP39-encrypted salt for recovery
  passphraseHash?: string;
  recoveryPhraseBackupDate?: Date;
};

/**
 * Saves cryptographic metadata to Firestore user document.
 *
 * This is called after passphrase setup or migration.
 *
 * @param saltBase64 - PBKDF2 salt in base64 (plaintext, for normal unlock)
 * @param encryptedSalt - PBKDF2 salt encrypted with BIP39-derived key (for recovery)
 * @param passphraseHash - SHA-256 hash of passphrase for validation (base64)
 * @returns Success status
 *
 * @example
 * const salt = generateSalt();
 * const saltBase64 = saltToBase64(salt);
 * const recoveryKey = await deriveKeyFromRecoveryPhrase(recoveryPhrase);
 * const encryptedSalt = await encryptSaltWithRecoveryKey(salt, recoveryKey);
 * const passphraseHash = await hashPassphrase(passphrase);
 *
 * await saveCryptoMetadata(saltBase64, encryptedSalt, passphraseHash);
 */
export async function saveCryptoMetadata(
  saltBase64: string,
  encryptedSalt: string,
  passphraseHash: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: "Utilisateur non authentifié." };
    }

    const userDocRef = db.collection("users").doc(userId);

    await userDocRef.set(
      {
        encryptionVersion: 2, // v2 = passphrase + BIP39
        saltBase64, // Plaintext salt for normal unlock
        encryptedSalt, // Encrypted salt for recovery
        passphraseHash,
        recoveryPhraseBackupDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    logger.infoSafe("Crypto metadata saved successfully", { userId });
    return { success: true };
  } catch (error) {
    logger.errorSafe("Failed to save crypto metadata", error);
    return {
      success: false,
      error: "Échec de la sauvegarde des métadonnées de chiffrement.",
    };
  }
}

/**
 * Retrieves cryptographic metadata from Firestore.
 *
 * Used for:
 * - Checking encryption version (migration detection)
 * - Retrieving encrypted salt for recovery
 * - Validating passphrase on unlock
 *
 * @returns Crypto metadata or null if not found
 *
 * @example
 * const metadata = await getCryptoMetadata();
 * if (metadata.encryptionVersion === 1) {
 *   // Show migration modal
 * } else if (metadata.encryptionVersion === 2) {
 *   // Show passphrase unlock modal
 * }
 */
export async function getCryptoMetadata(): Promise<{
  success: boolean;
  data?: CryptoMetadata;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: "Utilisateur non authentifié." };
    }

    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "Document utilisateur introuvable.",
      };
    }

    const userData = userDoc.data();
    if (!userData) {
      return {
        success: false,
        error: "Données utilisateur vides.",
      };
    }

    const metadata: CryptoMetadata = {
      encryptionVersion: userData.encryptionVersion || 1, // Default to v1 if not set
      saltBase64: userData.saltBase64,
      encryptedSalt: userData.encryptedSalt,
      passphraseHash: userData.passphraseHash,
      recoveryPhraseBackupDate: userData.recoveryPhraseBackupDate?.toDate(),
    };

    return { success: true, data: metadata };
  } catch (error) {
    logger.errorSafe("Failed to get crypto metadata", error);
    return {
      success: false,
      error: "Échec de la récupération des métadonnées de chiffrement.",
    };
  }
}

/**
 * Marks the migration from v1 (random key) to v2 (passphrase + BIP39) as complete.
 *
 * This updates encryptionVersion to 2 and clears any legacy migration flags.
 *
 * @returns Success status
 *
 * @example
 * // After successful migration
 * await markMigrationComplete();
 */
export async function markMigrationComplete(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: "Utilisateur non authentifié." };
    }

    const userDocRef = db.collection("users").doc(userId);

    await userDocRef.set(
      {
        encryptionVersion: 2,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    logger.infoSafe("Migration marked as complete", { userId });
    return { success: true };
  } catch (error) {
    logger.errorSafe("Failed to mark migration complete", error);
    return {
      success: false,
      error: "Échec de la mise à jour du statut de migration.",
    };
  }
}

/**
 * Updates the recovery phrase backup date.
 *
 * Called when user views or re-generates their recovery phrase.
 *
 * @returns Success status
 *
 * @example
 * // User clicks "Show recovery phrase again"
 * await updateRecoveryPhraseBackupDate();
 */
export async function updateRecoveryPhraseBackupDate(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: "Utilisateur non authentifié." };
    }

    const userDocRef = db.collection("users").doc(userId);

    await userDocRef.set(
      {
        recoveryPhraseBackupDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    logger.infoSafe("Recovery phrase backup date updated", { userId });
    return { success: true };
  } catch (error) {
    logger.errorSafe("Failed to update recovery phrase backup date", error);
    return {
      success: false,
      error: "Échec de la mise à jour de la date de sauvegarde.",
    };
  }
}

/**
 * Validates a passphrase against the stored hash.
 *
 * @param passphraseHash - SHA-256 hash of the input passphrase
 * @returns true if hash matches stored hash, false otherwise
 *
 * @example
 * const inputHash = await hashPassphrase(userInputPassphrase);
 * const isValid = await validatePassphrase(inputHash);
 * if (isValid) {
 *   // Unlock sanctuary
 * } else {
 *   // Show error
 * }
 */
export async function validatePassphrase(
  passphraseHash: string
): Promise<{ success: boolean; isValid?: boolean; error?: string }> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: "Utilisateur non authentifié." };
    }

    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: "Document utilisateur introuvable.",
      };
    }

    const userData = userDoc.data();
    const storedHash = userData?.passphraseHash;

    if (!storedHash) {
      return {
        success: false,
        error: "Aucune passphrase configurée.",
      };
    }

    const isValid = passphraseHash === storedHash;
    return { success: true, isValid };
  } catch (error) {
    logger.errorSafe("Failed to validate passphrase", error);
    return {
      success: false,
      error: "Échec de la validation de la passphrase.",
    };
  }
}
