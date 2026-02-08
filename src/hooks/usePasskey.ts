'use client';

/**
 * Passkey Management Hook
 *
 * Provides a unified interface for passkey operations:
 * - Setup: Register a new passkey with PRF, wrap master key
 * - Unlock: Authenticate with passkey, unwrap master key
 * - Recovery: Use BIP39 phrase to recover master key
 *
 * This hook integrates with the existing encryption system (v2 passphrase)
 * and adds v3 passkey support on top.
 *
 * Usage:
 * ```tsx
 * const { setupPasskey, unlockWithPasskey, isPasskeyAvailable } = usePasskey();
 *
 * if (isPasskeyAvailable) {
 *   await unlockWithPasskey();
 * }
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import {
  isWebAuthnSupported,
  isPRFLikelySupported,
  registerPasskey,
  authenticateWithPasskey,
} from '@/lib/crypto/webauthn';
import {
  generateMasterKey,
  deriveWrappingKeyFromPRF,
  wrapMasterKey,
  unwrapMasterKey,
  wrapMasterKeyForRecovery,
  unwrapMasterKeyWithRecovery,
} from '@/lib/crypto/key-wrapping';
import {
  generateRecoveryPhrase,
  deriveKeyFromRecoveryPhrase,
} from '@/lib/crypto/bip39';
import {
  storeSessionKey,
  clearSessionKey,
} from '@/lib/crypto/session-manager';
import {
  getPasskeyRegistrationOptions,
  verifyPasskeyRegistration,
  getPasskeyAuthenticationOptions,
  verifyPasskeyAuthentication,
  hasPasskeysEnabled,
  getWrappedRecoveryKey,
} from '@/app/actions/passkey-actions';
import { useToast } from './use-toast';
import { logger } from '@/lib/logger/safe';

export interface PasskeySetupResult {
  success: boolean;
  recoveryPhrase?: string;
  error?: string;
}

export interface PasskeyUnlockResult {
  success: boolean;
  error?: string;
}

export function usePasskey() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasskeyAvailable, setIsPasskeyAvailable] = useState(false);
  const [hasPasskeys, setHasPasskeys] = useState(false);
  const { toast } = useToast();

  // Check passkey availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const webAuthnSupported = isWebAuthnSupported();
      const prfSupported = isPRFLikelySupported();

      setIsPasskeyAvailable(webAuthnSupported && prfSupported);

      if (webAuthnSupported && prfSupported) {
        const result = await hasPasskeysEnabled();
        setHasPasskeys(result.success && result.enabled === true);
      }
    };

    checkAvailability();
  }, []);

  /**
   * Sets up a new passkey for the user.
   *
   * Flow:
   * 1. Generate random master key
   * 2. Register passkey with PRF extension
   * 3. Derive wrapping key from PRF output
   * 4. Wrap master key with wrapping key
   * 5. Generate BIP39 recovery phrase
   * 6. Wrap master key with recovery key
   * 7. Store wrapped keys in Firestore
   * 8. Store master key in sessionStorage
   *
   * @returns Setup result with recovery phrase
   */
  const setupPasskey = useCallback(
    async (): Promise<PasskeySetupResult> => {
      setIsLoading(true);

      try {
        // 1. Get registration options from server
        const optionsResult = await getPasskeyRegistrationOptions();
        if (!optionsResult.success || !optionsResult.options) {
          return {
            success: false,
            error: optionsResult.error || 'Échec de la récupération des options.',
          };
        }

        // 2. Register passkey in browser (triggers biometric prompt)
        const registrationResult = await registerPasskey(optionsResult.options);
        if (!registrationResult.success || !registrationResult.prfOutput) {
          return {
            success: false,
            error: registrationResult.error || 'Échec de l\'enregistrement du passkey.',
          };
        }

        // 3. Generate master key
        const masterKey = await generateMasterKey();

        // 4. Derive wrapping key from PRF output
        const wrappingKey = await deriveWrappingKeyFromPRF(
          registrationResult.prfOutput
        );

        // 5. Wrap master key with PRF-derived key
        const wrappedMasterKey = await wrapMasterKey(masterKey, wrappingKey);

        // 6. Generate recovery phrase and wrap master key for recovery
        const recoveryPhrase = generateRecoveryPhrase();
        const recoveryKey = await deriveKeyFromRecoveryPhrase(recoveryPhrase);
        const wrappedRecoveryKey = await wrapMasterKeyForRecovery(
          masterKey,
          recoveryKey
        );

        // 7. Verify registration and store wrapped keys on server
        const verifyResult = await verifyPasskeyRegistration(
          registrationResult.credential!,
          wrappedMasterKey,
          wrappedRecoveryKey
        );

        if (!verifyResult.success) {
          return {
            success: false,
            error: verifyResult.error || 'Échec de la vérification.',
          };
        }

        // 8. Store master key in session
        await storeSessionKey(masterKey);

        setHasPasskeys(true);

        logger.infoSafe('Passkey setup completed successfully');

        return {
          success: true,
          recoveryPhrase,
        };
      } catch (error) {
        logger.errorSafe('Passkey setup failed', error);
        return {
          success: false,
          error: 'Erreur inattendue lors de la configuration du passkey.',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Unlocks the sanctuary using a passkey.
   *
   * Flow:
   * 1. Get authentication options from server
   * 2. Authenticate with passkey (triggers biometric prompt)
   * 3. Derive unwrapping key from PRF output
   * 4. Get wrapped master key from server
   * 5. Unwrap master key
   * 6. Store master key in sessionStorage
   *
   * @returns Unlock result
   */
  const unlockWithPasskey = useCallback(
    async (): Promise<PasskeyUnlockResult> => {
      setIsLoading(true);

      try {
        // 1. Get authentication options from server
        const optionsResult = await getPasskeyAuthenticationOptions();
        if (!optionsResult.success || !optionsResult.options) {
          return {
            success: false,
            error: optionsResult.error || 'Échec de la récupération des options.',
          };
        }

        // 2. Authenticate with passkey (triggers biometric prompt)
        const authResult = await authenticateWithPasskey(optionsResult.options);
        if (!authResult.success || !authResult.prfOutput) {
          return {
            success: false,
            error: authResult.error || 'Échec de l\'authentification.',
          };
        }

        // 3. Verify authentication and get wrapped master key
        const verifyResult = await verifyPasskeyAuthentication(
          authResult.credential!
        );

        if (!verifyResult.success || !verifyResult.wrappedMasterKey) {
          return {
            success: false,
            error: verifyResult.error || 'Échec de la vérification.',
          };
        }

        // 4. Derive unwrapping key from PRF output
        const unwrappingKey = await deriveWrappingKeyFromPRF(authResult.prfOutput);

        // 5. Unwrap master key
        const masterKey = await unwrapMasterKey(
          verifyResult.wrappedMasterKey,
          unwrappingKey
        );

        // 6. Store in session
        await storeSessionKey(masterKey);

        logger.infoSafe('Passkey unlock successful');

        return { success: true };
      } catch (error) {
        logger.errorSafe('Passkey unlock failed', error);
        return {
          success: false,
          error: 'Erreur inattendue lors du déverrouillage.',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Recovers access using BIP39 recovery phrase.
   *
   * Used when user loses their device or passkey is unavailable.
   *
   * @param recoveryPhrase - User's 12-word BIP39 phrase
   * @returns Recovery result
   */
  const recoverWithPhrase = useCallback(
    async (recoveryPhrase: string): Promise<PasskeyUnlockResult> => {
      setIsLoading(true);

      try {
        // 1. Get wrapped recovery key from server
        const wrappedResult = await getWrappedRecoveryKey();
        if (!wrappedResult.success || !wrappedResult.wrappedRecoveryKey) {
          return {
            success: false,
            error: wrappedResult.error || 'Clé de récupération non trouvée.',
          };
        }

        // 2. Derive recovery key from phrase
        const recoveryKey = await deriveKeyFromRecoveryPhrase(recoveryPhrase);

        // 3. Unwrap master key
        const masterKey = await unwrapMasterKeyWithRecovery(
          wrappedResult.wrappedRecoveryKey,
          recoveryKey
        );

        // 4. Store in session
        await storeSessionKey(masterKey);

        logger.infoSafe('Recovery with phrase successful');

        return { success: true };
      } catch (error) {
        logger.errorSafe('Recovery failed', error);
        return {
          success: false,
          error: 'Phrase de récupération invalide ou données corrompues.',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Locks the sanctuary.
   */
  const lock = useCallback(() => {
    clearSessionKey();
    toast({
      title: 'Sanctuaire verrouillé',
      description: 'Utilisez votre passkey pour déverrouiller.',
    });
  }, [toast]);

  return {
    // State
    isLoading,
    isPasskeyAvailable,
    hasPasskeys,

    // Actions
    setupPasskey,
    unlockWithPasskey,
    recoverWithPhrase,
    lock,
  };
}
