/**
 * Encryption System Migration
 *
 * Handles migration from v1 (random key in localStorage) to v2 (passphrase + BIP39).
 *
 * Migration Flow:
 * 1. Detect legacy encryption (localStorage key exists)
 * 2. Retrieve old key from localStorage
 * 3. Fetch all user entries from Firestore
 * 4. Decrypt each entry with old key
 * 5. Re-encrypt with new passphrase-derived key
 * 6. Update Firestore with new encrypted data
 * 7. Clean up localStorage
 * 8. Mark migration complete in Firestore
 *
 * Security: All operations happen client-side. Server never sees decrypted content.
 */

import { firestore as db } from "@/lib/firebase/web-client";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { importKey, decryptEntry, encryptEntry } from "./encryption";
import type { EncryptedData } from "./encryption";
import { logger } from "@/lib/logger/safe";
import { markMigrationComplete } from "@/app/actions/crypto-actions";

const LEGACY_STORAGE_KEY = "aurum_encryption_key_v1";

export type MigrationProgress = {
  total: number;
  current: number;
  percentage: number;
};

export type MigrationResult = {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  error?: string;
};

/**
 * Checks if the user is still using the legacy encryption system.
 *
 * @returns true if localStorage contains the old key
 *
 * @example
 * if (hasLegacyEncryption()) {
 *   // Show migration modal
 * }
 */
export function hasLegacyEncryption(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const legacyKey = localStorage.getItem(LEGACY_STORAGE_KEY);
  return legacyKey !== null;
}

/**
 * Retrieves the legacy encryption key from localStorage.
 *
 * @returns CryptoKey or null if not found
 *
 * @example
 * const oldKey = await getLegacyKey();
 * if (!oldKey) {
 *   throw new Error("Cannot migrate without legacy key");
 * }
 */
export async function getLegacyKey(): Promise<CryptoKey | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const legacyKeyBase64 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyKeyBase64) {
      return null;
    }

    // Import the old key
    const oldKey = await importKey(legacyKeyBase64);
    return oldKey;
  } catch (error) {
    logger.errorSafe("Failed to retrieve legacy key", error);
    return null;
  }
}

/**
 * Migrates all user entries from old encryption to new encryption.
 *
 * This function:
 * 1. Fetches all entries from Firestore
 * 2. Decrypts with old key
 * 3. Re-encrypts with new key
 * 4. Updates Firestore
 *
 * @param userId - User ID
 * @param oldKey - Legacy encryption key
 * @param newKey - New passphrase-derived key
 * @param onProgress - Optional callback for progress updates
 * @returns Migration result
 *
 * @example
 * const oldKey = await getLegacyKey();
 * const newKey = await deriveKeyFromPassphrase(passphrase, salt);
 *
 * const result = await migrateEntries(
 *   userId,
 *   oldKey,
 *   newKey,
 *   (progress) => setMigrationProgress(progress)
 * );
 *
 * if (result.success) {
 *   console.log(`Migrated ${result.migratedCount} entries`);
 * }
 */
export async function migrateEntries(
  userId: string,
  oldKey: CryptoKey,
  newKey: CryptoKey,
  onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationResult> {
  try {
    // Fetch all user entries
    const entriesRef = collection(db, "users", userId, "entries");
    const entriesQuery = query(entriesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(entriesQuery);

    const entries = snapshot.docs;
    const total = entries.length;

    if (total === 0) {
      // No entries to migrate
      await markMigrationComplete();
      return {
        success: true,
        migratedCount: 0,
        failedCount: 0,
      };
    }

    let migratedCount = 0;
    let failedCount = 0;

    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entryDoc = entries[i];
      const entryData = entryDoc.data();

      try {
        // Decrypt with old key
        const encryptedData: EncryptedData = {
          iv: entryData.iv,
          ciphertext: entryData.encryptedContent,
        };

        const decryptedContent = await decryptEntry(encryptedData, oldKey);

        // Re-encrypt with new key
        const reEncryptedData = await encryptEntry(decryptedContent, newKey);

        // Update Firestore
        const entryRef = doc(db, "users", userId, "entries", entryDoc.id);
        await updateDoc(entryRef, {
          encryptedContent: reEncryptedData.ciphertext,
          iv: reEncryptedData.iv,
          // Keep all other fields unchanged
        });

        migratedCount++;

        // Report progress
        if (onProgress) {
          onProgress({
            total,
            current: i + 1,
            percentage: Math.round(((i + 1) / total) * 100),
          });
        }
      } catch (error) {
        logger.errorSafe(`Failed to migrate entry ${entryDoc.id}`, error);
        failedCount++;
      }
    }

    // Mark migration complete in Firestore
    await markMigrationComplete();

    return {
      success: failedCount === 0,
      migratedCount,
      failedCount,
    };
  } catch (error) {
    logger.errorSafe("Migration failed", error);
    return {
      success: false,
      migratedCount: 0,
      failedCount: 0,
      error:
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors de la migration.",
    };
  }
}

/**
 * Cleans up localStorage after successful migration.
 *
 * This removes the old encryption key from localStorage.
 * Should only be called AFTER successful migration.
 *
 * @example
 * const result = await migrateEntries(userId, oldKey, newKey);
 * if (result.success) {
 *   cleanupLegacyStorage();
 *   toast({ title: "Migration réussie!" });
 * }
 */
export function cleanupLegacyStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(LEGACY_STORAGE_KEY);
  logger.infoSafe("Legacy encryption key removed from localStorage");
}

/**
 * Performs a dry-run migration to check if all entries can be decrypted.
 *
 * This doesn't modify any data - it just tests decryption.
 *
 * @param userId - User ID
 * @param oldKey - Legacy encryption key
 * @returns Object with decryptable/undecryptable counts
 *
 * @example
 * const validation = await validateMigration(userId, oldKey);
 * if (validation.undecryptableCount > 0) {
 *   alert("Some entries cannot be decrypted!");
 * }
 */
export async function validateMigration(
  userId: string,
  oldKey: CryptoKey
): Promise<{
  total: number;
  decryptableCount: number;
  undecryptableCount: number;
}> {
  try {
    const entriesRef = collection(db, "users", userId, "entries");
    const snapshot = await getDocs(entriesRef);

    const entries = snapshot.docs;
    const total = entries.length;

    let decryptableCount = 0;
    let undecryptableCount = 0;

    for (const entryDoc of entries) {
      const entryData = entryDoc.data();

      try {
        const encryptedData: EncryptedData = {
          iv: entryData.iv,
          ciphertext: entryData.encryptedContent,
        };

        await decryptEntry(encryptedData, oldKey);
        decryptableCount++;
      } catch (error) {
        undecryptableCount++;
      }
    }

    return {
      total,
      decryptableCount,
      undecryptableCount,
    };
  } catch (error) {
    logger.errorSafe("Validation failed", error);
    return {
      total: 0,
      decryptableCount: 0,
      undecryptableCount: 0,
    };
  }
}

/**
 * Backs up all entries (encrypted) before migration.
 *
 * Saves entries to a JSON file for download.
 * This provides a safety net in case migration fails.
 *
 * @param userId - User ID
 * @returns Backup data as JSON string
 *
 * @example
 * const backup = await createBackup(userId);
 * const blob = new Blob([backup], { type: 'application/json' });
 * const url = URL.createObjectURL(blob);
 * const a = document.createElement('a');
 * a.href = url;
 * a.download = `aurum-backup-${Date.now()}.json`;
 * a.click();
 */
export async function createBackup(userId: string): Promise<string> {
  try {
    const entriesRef = collection(db, "users", userId, "entries");
    const snapshot = await getDocs(entriesRef);

    const backup = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return JSON.stringify(
      {
        version: 1,
        userId,
        timestamp: new Date().toISOString(),
        entries: backup,
      },
      null,
      2
    );
  } catch (error) {
    logger.errorSafe("Backup creation failed", error);
    throw new Error("Échec de la création du backup.");
  }
}
