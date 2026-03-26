'use client';

/**
 * useEncryption Hook
 *
 * v2 model:
 * - Generates a random per-user content key
 * - Wraps that key with a passphrase-derived key
 * - Stores only the wrapped key envelope in Firestore
 * - Keeps the unwrapped content key in sessionStorage for the current browser session
 *
 * Legacy v1 entries remain readable through the old deterministic UID-derived key
 * and are migrated opportunistically to v2 when opened.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '@/providers/auth-provider';
import { firestore } from '@/lib/firebase/web-client';
import { logger } from '@/lib/logger/safe';
import {
  decrypt as cryptoDecrypt,
  deriveKeyFromUID,
  encrypt as cryptoEncrypt,
  exportKey,
  generateEncryptionKey,
  importKey,
  isWrappedContentKeyEnvelope,
  LEGACY_ENCRYPTION_VERSION,
  PASSPHRASE_ENCRYPTION_VERSION,
  type EncryptedData,
  type WrappedContentKeyEnvelope,
  wrapKeyWithPassphrase,
  unwrapKeyWithPassphrase,
} from '@/lib/crypto/encryption';

type EncryptionStatus = 'loading' | 'setup-required' | 'locked' | 'ready' | 'error';

type SessionCachePayload = {
  uid: string;
  version: number;
  rawKey: string;
};

const SESSION_STORAGE_PREFIX = 'aurum.encryption.session.';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function getSessionKey(uid: string) {
  return `${SESSION_STORAGE_PREFIX}${uid}`;
}

function readSessionCache(uid: string): SessionCachePayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(getSessionKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionCachePayload;
    if (
      parsed.uid !== uid ||
      parsed.version !== PASSPHRASE_ENCRYPTION_VERSION ||
      typeof parsed.rawKey !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSessionCache(uid: string, rawKeyBase64: string) {
  if (typeof window === 'undefined') return;
  const payload: SessionCachePayload = {
    uid,
    version: PASSPHRASE_ENCRYPTION_VERSION,
    rawKey: rawKeyBase64,
  };
  window.sessionStorage.setItem(getSessionKey(uid), JSON.stringify(payload));
}

function clearSessionCache(uid: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(getSessionKey(uid));
}

export function useEncryption() {
  const { user } = useAuth();
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [status, setStatus] = useState<EncryptionStatus>('loading');
  const [vaultEnvelope, setVaultEnvelope] = useState<WrappedContentKeyEnvelope | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadVaultState = useCallback(async () => {
    if (!user) {
      setEncryptionKey(null);
      setVaultEnvelope(null);
      setError(null);
      setStatus('loading');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const securityRef = doc(firestore, 'users', user.uid, 'settings', 'security');
      const securitySnap = await getDoc(securityRef);
      const rawEnvelope = securitySnap.data()?.encryption ?? null;

      if (!isWrappedContentKeyEnvelope(rawEnvelope)) {
        clearSessionCache(user.uid);
        setVaultEnvelope(null);
        setEncryptionKey(null);
        setStatus('setup-required');
        return;
      }

      setVaultEnvelope(rawEnvelope);

      const cached = readSessionCache(user.uid);
      if (cached) {
        try {
          const cachedKey = await importKey(base64ToArrayBuffer(cached.rawKey));
          setEncryptionKey(cachedKey);
          setStatus('ready');
          return;
        } catch (cacheError) {
          logger.warnSafe('Failed to restore cached content key from session storage', {
            uid: user.uid,
            reason: cacheError instanceof Error ? cacheError.message : String(cacheError),
          });
          clearSessionCache(user.uid);
        }
      }

      setEncryptionKey(null);
      setStatus('locked');
    } catch (loadError) {
      logger.errorSafe('Failed to load encryption vault state', loadError, { uid: user.uid });
      setEncryptionKey(null);
      setVaultEnvelope(null);
      setError('Impossible de charger le coffre de chiffrement.');
      setStatus('error');
    }
  }, [user]);

  useEffect(() => {
    void loadVaultState();
  }, [loadVaultState]);

  const persistActiveKey = useCallback(
    async (key: CryptoKey) => {
      if (!user) return;
      const rawKey = await exportKey(key);
      writeSessionCache(user.uid, arrayBufferToBase64(rawKey));
    },
    [user]
  );

  const setupVault = useCallback(
    async (passphrase: string) => {
      if (!user) {
        throw new Error('User must be authenticated.');
      }

      const trimmedPassphrase = passphrase.trim();
      if (trimmedPassphrase.length < 12) {
        throw new Error('Passphrase must contain at least 12 characters.');
      }

      setStatus('loading');
      setError(null);

      try {
        const key = await generateEncryptionKey();
        const envelope = await wrapKeyWithPassphrase(key, trimmedPassphrase);
        const securityRef = doc(firestore, 'users', user.uid, 'settings', 'security');

        await setDoc(
          securityRef,
          {
            encryption: envelope,
            scheme: 'passphrase_v2',
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );

        await persistActiveKey(key);
        setVaultEnvelope(envelope);
        setEncryptionKey(key);
        setStatus('ready');
      } catch (setupError) {
        logger.errorSafe('Failed to initialize encryption vault', setupError, { uid: user.uid });
        setEncryptionKey(null);
        setError('Impossible d’initialiser le coffre de chiffrement.');
        setStatus('error');
        throw setupError;
      }
    },
    [persistActiveKey, user]
  );

  const unlockVault = useCallback(
    async (passphrase: string) => {
      if (!user) {
        throw new Error('User must be authenticated.');
      }

      const envelope = vaultEnvelope;
      if (!envelope) {
        throw new Error('Encryption vault is not initialized yet.');
      }

      setStatus('loading');
      setError(null);

      try {
        const key = await unwrapKeyWithPassphrase(envelope, passphrase);
        await persistActiveKey(key);
        setEncryptionKey(key);
        setStatus('ready');
      } catch (unlockError) {
        logger.warnSafe('Failed to unlock encryption vault', {
          uid: user.uid,
          reason: unlockError instanceof Error ? unlockError.message : String(unlockError),
        });
        setEncryptionKey(null);
        setStatus('locked');
        throw new Error('Invalid passphrase.');
      }
    },
    [persistActiveKey, user, vaultEnvelope]
  );

  const lockVault = useCallback(() => {
    if (user) {
      clearSessionCache(user.uid);
    }
    setEncryptionKey(null);
    setError(null);
    setStatus(vaultEnvelope ? 'locked' : 'setup-required');
  }, [user, vaultEnvelope]);

  const encrypt = useCallback(
    async (plaintext: string): Promise<EncryptedData> => {
      if (!encryptionKey) {
        throw new Error('Encryption key not ready. Unlock the vault first.');
      }

      const encrypted = await cryptoEncrypt(plaintext, encryptionKey);
      return {
        ...encrypted,
        version: PASSPHRASE_ENCRYPTION_VERSION,
      };
    },
    [encryptionKey]
  );

  const decrypt = useCallback(
    async (encryptedData: EncryptedData): Promise<string> => {
      const version = Number(encryptedData.version || LEGACY_ENCRYPTION_VERSION);

      if (version >= PASSPHRASE_ENCRYPTION_VERSION) {
        if (!encryptionKey) {
          throw new Error('Encryption key not ready. Unlock the vault first.');
        }

        return await cryptoDecrypt(encryptedData, encryptionKey);
      }

      if (!user) {
        throw new Error('Legacy decryption requires an authenticated user.');
      }

      const legacyKey = await deriveKeyFromUID(user.uid);
      return await cryptoDecrypt(
        {
          ...encryptedData,
          version: LEGACY_ENCRYPTION_VERSION,
        },
        legacyKey
      );
    },
    [encryptionKey, user]
  );

  const migrateEntry = useCallback(
    async (entryId: string, plaintext: string) => {
      if (!user || !encryptionKey) return false;

      try {
        const encrypted = await cryptoEncrypt(plaintext, encryptionKey);
        const entryRef = doc(firestore, 'users', user.uid, 'entries', entryId);
        await updateDoc(entryRef, {
          encryptedContent: encrypted.ciphertext,
          iv: encrypted.iv,
          version: PASSPHRASE_ENCRYPTION_VERSION,
          content: deleteField(),
          migratedToPassphraseAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return true;
      } catch (migrationError) {
        logger.warnSafe('Failed to migrate entry to passphrase-based encryption', {
          uid: user.uid,
          entryId,
          reason: migrationError instanceof Error ? migrationError.message : String(migrationError),
        });
        return false;
      }
    },
    [encryptionKey, user]
  );

  return {
    status,
    error,
    isReady: status === 'ready' && !!encryptionKey,
    isLocked: status === 'locked',
    needsSetup: status === 'setup-required',
    hasVault: !!vaultEnvelope,
    setupVault,
    unlockVault,
    lockVault,
    encrypt,
    decrypt,
    migrateEntry,
  };
}
