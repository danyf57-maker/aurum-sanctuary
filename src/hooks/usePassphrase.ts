'use client';

/**
 * Passphrase Management Hook
 *
 * Manages passphrase state, unlock/lock functionality, and session key lifecycle.
 *
 * Features:
 * - Unlock/lock sanctuary with passphrase
 * - Setup passphrase for new users
 * - Auto-lock after 30 minutes of inactivity
 * - Activity tracking
 * - Integration with sessionStorage
 *
 * Usage:
 * ```tsx
 * const { isUnlocked, unlock, lock, setupPassphrase } = usePassphrase();
 *
 * if (!isUnlocked) {
 *   return <PassphraseUnlockModal />;
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import {
  deriveKeyFromPassphrase,
  generateSalt,
  hashPassphrase,
  base64ToSalt,
  saltToBase64,
} from '@/lib/crypto/passphrase';
import {
  generateRecoveryPhrase,
  deriveKeyFromRecoveryPhrase,
  encryptSaltWithRecoveryKey,
} from '@/lib/crypto/bip39';
import {
  getSessionKey,
  storeSessionKey,
  clearSessionKey,
  hasSessionKey,
  setupAutoLock,
  trackActivity,
} from '@/lib/crypto/session-manager';
import {
  getCryptoMetadata,
  saveCryptoMetadata,
  validatePassphrase as validatePassphraseServer,
} from '@/app/actions/crypto-actions';
import { useToast } from './use-toast';
import { logger } from '@/lib/logger/safe';

export type PassphraseSetupResult = {
  success: boolean;
  recoveryPhrase?: string;
  error?: string;
};

export type UnlockResult = {
  success: boolean;
  error?: string;
};

export function usePassphrase() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session key on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const key = await getSessionKey();
        if (key) {
          setEncryptionKey(key);
          setIsUnlocked(true);
        }
      } catch (error) {
        logger.errorSafe('Failed to initialize session', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  // Setup auto-lock
  useEffect(() => {
    const cleanup = setupAutoLock(() => {
      setIsUnlocked(false);
      setEncryptionKey(null);
      toast({
        title: 'Session verrouillée',
        description: 'Votre sanctuaire a été verrouillé après 30 minutes d\'inactivité.',
      });
    });

    return cleanup;
  }, [toast]);

  // Track activity
  useEffect(() => {
    const handleActivity = () => trackActivity();

    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  /**
   * Sets up passphrase for a new user.
   *
   * Flow:
   * 1. Validate passphrase strength
   * 2. Generate salt
   * 3. Derive key from passphrase
   * 4. Generate BIP39 recovery phrase
   * 5. Encrypt salt with recovery key
   * 6. Save metadata to Firestore
   * 7. Store key in sessionStorage
   *
   * @param passphrase - User's new passphrase
   * @returns Result with recovery phrase
   */
  const setupPassphrase = useCallback(async (
    passphrase: string
  ): Promise<PassphraseSetupResult> => {
    try {
      // Generate salt
      const salt = generateSalt();

      // Derive key from passphrase
      const key = await deriveKeyFromPassphrase(passphrase, salt);

      // Generate recovery phrase
      const recoveryPhrase = generateRecoveryPhrase();

      // Derive recovery key from phrase
      const recoveryKey = await deriveKeyFromRecoveryPhrase(recoveryPhrase);

      // Convert salt to base64 for storage
      const saltBase64 = saltToBase64(salt);

      // Encrypt salt with recovery key
      const encryptedSalt = await encryptSaltWithRecoveryKey(salt, recoveryKey);

      // Hash passphrase for validation
      const passphraseHash = await hashPassphrase(passphrase);

      // Save to Firestore (both plaintext salt and encrypted salt)
      const saveResult = await saveCryptoMetadata(saltBase64, encryptedSalt, passphraseHash);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || 'Échec de la sauvegarde des métadonnées.',
        };
      }

      // Store key in sessionStorage
      await storeSessionKey(key);

      // Update state
      setEncryptionKey(key);
      setIsUnlocked(true);

      return {
        success: true,
        recoveryPhrase,
      };
    } catch (error) {
      logger.errorSafe('Failed to setup passphrase', error);
      return {
        success: false,
        error: 'Échec de la configuration de la passphrase.',
      };
    }
  }, []);

  /**
   * Unlocks the sanctuary with a passphrase.
   *
   * Flow:
   * 1. Fetch crypto metadata from Firestore
   * 2. Validate passphrase hash
   * 3. Decrypt salt (requires recovery phrase in some scenarios)
   * 4. Derive key from passphrase + salt
   * 5. Store key in sessionStorage
   *
   * @param passphrase - User's passphrase
   * @returns Unlock result
   */
  const unlock = useCallback(async (
    passphrase: string
  ): Promise<UnlockResult> => {
    try {
      // Fetch crypto metadata
      const metadataResult = await getCryptoMetadata();
      if (!metadataResult.success || !metadataResult.data) {
        return {
          success: false,
          error: metadataResult.error || 'Métadonnées introuvables.',
        };
      }

      const { saltBase64, passphraseHash } = metadataResult.data;

      if (!saltBase64 || !passphraseHash) {
        return {
          success: false,
          error: 'Passphrase non configurée.',
        };
      }

      // Validate passphrase
      const inputHash = await hashPassphrase(passphrase);
      const validationResult = await validatePassphraseServer(inputHash);

      if (!validationResult.success || !validationResult.isValid) {
        return {
          success: false,
          error: 'Passphrase incorrecte.',
        };
      }

      // Convert base64 salt to Uint8Array
      const salt = base64ToSalt(saltBase64);

      // Derive key
      const key = await deriveKeyFromPassphrase(passphrase, salt);

      // Store in sessionStorage
      await storeSessionKey(key);

      // Update state
      setEncryptionKey(key);
      setIsUnlocked(true);

      return { success: true };
    } catch (error) {
      logger.errorSafe('Failed to unlock', error);
      return {
        success: false,
        error: 'Échec du déverrouillage.',
      };
    }
  }, []);

  /**
   * Locks the sanctuary.
   *
   * Clears the session key and updates state.
   */
  const lock = useCallback(() => {
    clearSessionKey();
    setEncryptionKey(null);
    setIsUnlocked(false);
    toast({
      title: 'Sanctuaire verrouillé',
      description: 'Entrez votre passphrase pour déverrouiller.',
    });
  }, [toast]);

  return {
    isUnlocked,
    encryptionKey,
    isLoading,
    setupPassphrase,
    unlock,
    lock,
  };
}
