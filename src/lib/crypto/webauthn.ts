/**
 * WebAuthn / Passkey Client Utilities
 *
 * Handles passkey registration and authentication with PRF extension support.
 * PRF (Pseudo-Random Function) allows deriving a stable secret from the passkey,
 * which we use to wrap/unwrap the master encryption key.
 *
 * Browser Support:
 * - Chrome 116+ (Desktop & Android)
 * - Safari 17+ (iOS 17+, macOS 14+)
 * - Edge 116+
 *
 * Security: All cryptographic operations happen client-side.
 * The server only sees credential IDs and public keys, never encryption keys.
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/browser';

// PRF extension salt - must be consistent for deriving the same key
const PRF_SALT = new TextEncoder().encode('aurum-sanctuary-prf-v1');

export interface PasskeyRegistrationResult {
  success: boolean;
  credential?: RegistrationResponseJSON;
  prfOutput?: ArrayBuffer;
  error?: string;
}

export interface PasskeyAuthenticationResult {
  success: boolean;
  credential?: AuthenticationResponseJSON;
  prfOutput?: ArrayBuffer;
  error?: string;
}

/**
 * Checks if the browser supports WebAuthn.
 */
export function isWebAuthnSupported(): boolean {
  return browserSupportsWebAuthn();
}

/**
 * Checks if the browser supports WebAuthn autofill (conditional UI).
 */
export async function isAutofillSupported(): Promise<boolean> {
  return browserSupportsWebAuthnAutofill();
}

/**
 * Checks if PRF extension is likely supported.
 *
 * Note: There's no reliable way to detect PRF support without attempting
 * a registration. This is a heuristic based on known browser versions.
 */
export function isPRFLikelySupported(): boolean {
  if (typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent;

  // Chrome 116+ supports PRF
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (chromeMatch && parseInt(chromeMatch[1]) >= 116) return true;

  // Safari 17+ supports PRF
  const safariMatch = ua.match(/Version\/(\d+).*Safari/);
  if (safariMatch && parseInt(safariMatch[1]) >= 17) return true;

  // Edge follows Chrome version
  const edgeMatch = ua.match(/Edg\/(\d+)/);
  if (edgeMatch && parseInt(edgeMatch[1]) >= 116) return true;

  return false;
}

/**
 * Registers a new passkey with PRF extension.
 *
 * Flow:
 * 1. Receive registration options from server
 * 2. Add PRF extension to options
 * 3. Prompt user to create passkey (biometric/PIN)
 * 4. Extract PRF output for key derivation
 * 5. Return credential and PRF output
 *
 * @param options - Registration options from server
 * @returns Registration result with credential and PRF output
 */
export async function registerPasskey(
  options: PublicKeyCredentialCreationOptionsJSON
): Promise<PasskeyRegistrationResult> {
  try {
    if (!isWebAuthnSupported()) {
      return {
        success: false,
        error: 'WebAuthn non supporté par ce navigateur.',
      };
    }

    // Add PRF extension to options
    const optionsWithPRF = {
      ...options,
      extensions: {
        ...options.extensions,
        prf: {
          eval: {
            first: Array.from(PRF_SALT),
          },
        },
      },
    };

    // Start registration ceremony
    const credential = await startRegistration({ optionsJSON: optionsWithPRF });

    // Extract PRF output from extensions
    const prfOutput = extractPRFOutput(credential);

    if (!prfOutput) {
      return {
        success: false,
        error: 'Extension PRF non supportée. Mise à jour du navigateur requise.',
      };
    }

    return {
      success: true,
      credential,
      prfOutput,
    };
  } catch (error) {
    return handleWebAuthnError(error);
  }
}

/**
 * Authenticates with an existing passkey.
 *
 * Flow:
 * 1. Receive authentication options from server
 * 2. Add PRF extension with same salt
 * 3. Prompt user to authenticate (biometric/PIN)
 * 4. Extract PRF output (will be same as during registration)
 * 5. Return credential and PRF output
 *
 * @param options - Authentication options from server
 * @returns Authentication result with credential and PRF output
 */
export async function authenticateWithPasskey(
  options: PublicKeyCredentialRequestOptionsJSON
): Promise<PasskeyAuthenticationResult> {
  try {
    if (!isWebAuthnSupported()) {
      return {
        success: false,
        error: 'WebAuthn non supporté par ce navigateur.',
      };
    }

    // Add PRF extension to options
    const optionsWithPRF = {
      ...options,
      extensions: {
        ...options.extensions,
        prf: {
          eval: {
            first: Array.from(PRF_SALT),
          },
        },
      },
    };

    // Start authentication ceremony
    const credential = await startAuthentication({ optionsJSON: optionsWithPRF });

    // Extract PRF output
    const prfOutput = extractPRFOutputFromAuth(credential);

    if (!prfOutput) {
      return {
        success: false,
        error: 'Extension PRF non disponible lors de l\'authentification.',
      };
    }

    return {
      success: true,
      credential,
      prfOutput,
    };
  } catch (error) {
    return handleWebAuthnError(error);
  }
}

/**
 * Extracts PRF output from registration response.
 */
function extractPRFOutput(
  credential: RegistrationResponseJSON
): ArrayBuffer | null {
  try {
    // The PRF output is in clientExtensionResults
    const extensions = credential.clientExtensionResults as {
      prf?: {
        results?: {
          first?: ArrayBuffer | { buffer: ArrayBuffer };
        };
      };
    };

    const prfResults = extensions?.prf?.results;
    if (!prfResults?.first) return null;

    // Handle both ArrayBuffer and typed array
    const first = prfResults.first;
    if (first instanceof ArrayBuffer) return first;
    if ('buffer' in first) return first.buffer;

    // If it's a base64 string (some browsers)
    if (typeof first === 'string') {
      return base64ToArrayBuffer(first);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extracts PRF output from authentication response.
 */
function extractPRFOutputFromAuth(
  credential: AuthenticationResponseJSON
): ArrayBuffer | null {
  try {
    const extensions = credential.clientExtensionResults as {
      prf?: {
        results?: {
          first?: ArrayBuffer | Uint8Array | { buffer: ArrayBuffer } | string;
        };
      };
    };

    const prfResults = extensions?.prf?.results;
    if (!prfResults?.first) return null;

    const first = prfResults.first;

    // Handle ArrayBuffer
    if (first instanceof ArrayBuffer) return first;

    // Handle Uint8Array
    if (first instanceof Uint8Array) return first.buffer as ArrayBuffer;

    // Handle object with buffer property
    if (typeof first === 'object' && first !== null && 'buffer' in first) {
      return (first as { buffer: ArrayBuffer }).buffer;
    }

    // Handle base64 string
    if (typeof first === 'string') {
      return base64ToArrayBuffer(first);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Handles WebAuthn errors with user-friendly messages.
 */
function handleWebAuthnError(error: unknown): { success: false; error: string } {
  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
  const errorName = error instanceof Error ? error.name : '';

  // User cancelled
  if (errorName === 'NotAllowedError') {
    return {
      success: false,
      error: 'Opération annulée par l\'utilisateur.',
    };
  }

  // No authenticator available
  if (errorName === 'InvalidStateError') {
    return {
      success: false,
      error: 'Ce passkey est déjà enregistré sur cet appareil.',
    };
  }

  // Security error (e.g., non-HTTPS)
  if (errorName === 'SecurityError') {
    return {
      success: false,
      error: 'Erreur de sécurité. Assurez-vous d\'utiliser HTTPS.',
    };
  }

  // Timeout
  if (errorName === 'AbortError') {
    return {
      success: false,
      error: 'Opération expirée. Veuillez réessayer.',
    };
  }

  return {
    success: false,
    error: `Erreur WebAuthn: ${errorMessage}`,
  };
}

/**
 * Gets the RP ID (Relying Party Identifier) for the current origin.
 * This should match what's configured on the server.
 */
export function getRpId(): string {
  if (typeof window === 'undefined') return 'localhost';
  return window.location.hostname;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Handle base64url encoding
  const base64Standard = base64.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64Standard);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
