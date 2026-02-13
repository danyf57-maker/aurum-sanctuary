/**
 * useEncryption Hook
 *
 * Manages encryption keys for the current user
 * - Derives key from Firebase UID (deterministic)
 * - Caches key in memory for performance
 * - Provides encrypt/decrypt functions
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import {
  deriveKeyFromUID,
  encrypt as cryptoEncrypt,
  decrypt as cryptoDecrypt,
  type EncryptedData,
} from '@/lib/crypto/encryption';

export function useEncryption() {
  const { user } = useAuth();
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Derive encryption key when user logs in
  useEffect(() => {
    async function initializeKey() {
      if (!user) {
        setEncryptionKey(null);
        setIsReady(false);
        return;
      }

      try {
        // Derive key from Firebase UID (deterministic, same key every time)
        const key = await deriveKeyFromUID(user.uid);
        setEncryptionKey(key);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize encryption key:', error);
        setIsReady(false);
      }
    }

    initializeKey();
  }, [user]);

  /**
   * Encrypt plaintext content
   */
  const encrypt = useCallback(
    async (plaintext: string): Promise<EncryptedData> => {
      if (!encryptionKey) {
        throw new Error('Encryption key not ready. User must be authenticated.');
      }

      return await cryptoEncrypt(plaintext, encryptionKey);
    },
    [encryptionKey]
  );

  /**
   * Decrypt encrypted content
   */
  const decrypt = useCallback(
    async (encryptedData: EncryptedData): Promise<string> => {
      if (!encryptionKey) {
        throw new Error('Encryption key not ready. User must be authenticated.');
      }

      return await cryptoDecrypt(encryptedData, encryptionKey);
    },
    [encryptionKey]
  );

  return {
    /** Whether encryption is ready to use */
    isReady,
    /** Encrypt plaintext to EncryptedData */
    encrypt,
    /** Decrypt EncryptedData to plaintext */
    decrypt,
  };
}
