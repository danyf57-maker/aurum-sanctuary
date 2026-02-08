'use server';

/**
 * Passkey Server Actions
 *
 * Handles WebAuthn ceremony orchestration:
 * - Generate registration options (challenge, user info, RP config)
 * - Verify registration responses
 * - Generate authentication options
 * - Verify authentication responses
 *
 * Security:
 * - Challenges are single-use and time-limited
 * - Credential public keys stored in Firestore (user can have multiple passkeys)
 * - No encryption keys ever touch the server
 */

import { db } from '@/lib/firebase/server-config';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getAuthedUserId, getAuthedUserEmail } from '@/app/actions/auth';
import { logger } from '@/lib/logger/safe';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
  VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const RP_NAME = 'Aurum Sanctuary';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:9002';
const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface StoredCredential {
  credentialId: string;
  credentialPublicKey: string; // Base64 encoded
  counter: number;
  transports?: string[];
  createdAt: Date;
  lastUsedAt?: Date;
  deviceName?: string;
}

interface StoredChallenge {
  challenge: string;
  type: 'registration' | 'authentication';
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// Registration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates WebAuthn registration options.
 *
 * Called when user wants to add a new passkey.
 *
 * @returns Registration options for the browser
 */
export async function getPasskeyRegistrationOptions(): Promise<{
  success: boolean;
  options?: PublicKeyCredentialCreationOptionsJSON;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié.' };
    }

    const userEmail = await getAuthedUserEmail();

    // Get existing credentials to exclude
    const existingCredentials = await getUserCredentials(userId);

    const opts: GenerateRegistrationOptionsOpts = {
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new Uint8Array(new TextEncoder().encode(userId)),
      userName: userEmail || userId,
      userDisplayName: userEmail?.split('@')[0] || 'Utilisateur',
      attestationType: 'none', // We don't need attestation for this use case
      authenticatorSelection: {
        residentKey: 'preferred', // Allows discoverable credentials
        userVerification: 'required', // Biometric/PIN required
        authenticatorAttachment: 'platform', // Platform authenticator (TouchID/FaceID)
      },
      excludeCredentials: existingCredentials.map((cred) => ({
        id: cred.credentialId,
        transports: cred.transports as AuthenticatorTransport[] | undefined,
      })),
      // PRF extension is requested on the client side
    };

    const options = await generateRegistrationOptions(opts);

    // Store challenge for verification
    await storeChallenge(userId, options.challenge, 'registration');

    logger.infoSafe('Passkey registration options generated', { userId });

    return { success: true, options };
  } catch (error) {
    logger.errorSafe('Failed to generate registration options', error);
    return {
      success: false,
      error: 'Échec de la génération des options d\'enregistrement.',
    };
  }
}

/**
 * Verifies a passkey registration response.
 *
 * Called after the browser completes the registration ceremony.
 *
 * @param response - The registration response from the browser
 * @param wrappedMasterKey - The wrapped master key (encrypted with PRF-derived key)
 * @param wrappedRecoveryKey - The wrapped master key (encrypted with BIP39 key)
 * @returns Verification result
 */
export async function verifyPasskeyRegistration(
  response: RegistrationResponseJSON,
  wrappedMasterKey: { wrappedKey: string; iv: string; version: number },
  wrappedRecoveryKey: { wrappedKey: string; iv: string; version: number }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié.' };
    }

    // Retrieve stored challenge
    const storedChallenge = await getStoredChallenge(userId, 'registration');
    if (!storedChallenge) {
      return { success: false, error: 'Challenge expiré ou invalide.' };
    }

    const opts: VerifyRegistrationResponseOpts = {
      response,
      expectedChallenge: storedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    };

    const verification: VerifiedRegistrationResponse =
      await verifyRegistrationResponse(opts);

    if (!verification.verified || !verification.registrationInfo) {
      return { success: false, error: 'Vérification du passkey échouée.' };
    }

    const { credential } = verification.registrationInfo;

    // Store credential in Firestore
    const storedCredential: StoredCredential = {
      credentialId: credential.id,
      credentialPublicKey: bufferToBase64(credential.publicKey),
      counter: credential.counter,
      transports: response.response.transports,
      createdAt: new Date(),
    };

    await storeCredential(userId, storedCredential);

    // Store wrapped keys in user document
    await updatePasskeyMetadata(userId, wrappedMasterKey, wrappedRecoveryKey);

    // Clean up challenge
    await clearChallenge(userId);

    logger.infoSafe('Passkey registered successfully', { userId });

    return { success: true };
  } catch (error) {
    logger.errorSafe('Failed to verify passkey registration', error);
    return {
      success: false,
      error: 'Échec de la vérification de l\'enregistrement.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates WebAuthn authentication options.
 *
 * Called when user wants to unlock with their passkey.
 *
 * @returns Authentication options for the browser
 */
export async function getPasskeyAuthenticationOptions(): Promise<{
  success: boolean;
  options?: PublicKeyCredentialRequestOptionsJSON;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié.' };
    }

    // Get user's credentials
    const credentials = await getUserCredentials(userId);
    if (credentials.length === 0) {
      return { success: false, error: 'Aucun passkey enregistré.' };
    }

    const opts: GenerateAuthenticationOptionsOpts = {
      rpID: RP_ID,
      allowCredentials: credentials.map((cred) => ({
        id: cred.credentialId,
        transports: cred.transports as AuthenticatorTransport[] | undefined,
      })),
      userVerification: 'required',
      // PRF extension is requested on the client side
    };

    const options = await generateAuthenticationOptions(opts);

    // Store challenge for verification
    await storeChallenge(userId, options.challenge, 'authentication');

    logger.infoSafe('Passkey authentication options generated', { userId });

    return { success: true, options };
  } catch (error) {
    logger.errorSafe('Failed to generate authentication options', error);
    return {
      success: false,
      error: 'Échec de la génération des options d\'authentification.',
    };
  }
}

/**
 * Verifies a passkey authentication response.
 *
 * Called after the browser completes the authentication ceremony.
 *
 * @param response - The authentication response from the browser
 * @returns Verification result with wrapped key data
 */
export async function verifyPasskeyAuthentication(
  response: AuthenticationResponseJSON
): Promise<{
  success: boolean;
  wrappedMasterKey?: { wrappedKey: string; iv: string; version: number };
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié.' };
    }

    // Retrieve stored challenge
    const storedChallenge = await getStoredChallenge(userId, 'authentication');
    if (!storedChallenge) {
      return { success: false, error: 'Challenge expiré ou invalide.' };
    }

    // Get the credential from Firestore
    const credential = await getCredentialById(userId, response.id);
    if (!credential) {
      return { success: false, error: 'Credential non trouvé.' };
    }

    const opts: VerifyAuthenticationResponseOpts = {
      response,
      expectedChallenge: storedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
      credential: {
        id: credential.credentialId,
        publicKey: base64ToBuffer(credential.credentialPublicKey),
        counter: credential.counter,
        transports: credential.transports as AuthenticatorTransport[] | undefined,
      },
    };

    const verification: VerifiedAuthenticationResponse =
      await verifyAuthenticationResponse(opts);

    if (!verification.verified) {
      return { success: false, error: 'Vérification du passkey échouée.' };
    }

    // Update counter
    await updateCredentialCounter(
      userId,
      credential.credentialId,
      verification.authenticationInfo.newCounter
    );

    // Clean up challenge
    await clearChallenge(userId);

    // Get wrapped master key
    const wrappedMasterKey = await getWrappedMasterKey(userId);
    if (!wrappedMasterKey) {
      return { success: false, error: 'Clé chiffrée non trouvée.' };
    }

    logger.infoSafe('Passkey authentication successful', { userId });

    return { success: true, wrappedMasterKey };
  } catch (error) {
    logger.errorSafe('Failed to verify passkey authentication', error);
    return {
      success: false,
      error: 'Échec de la vérification de l\'authentification.',
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Passkey Management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lists all passkeys for the current user.
 */
export async function listUserPasskeys(): Promise<{
  success: boolean;
  passkeys?: Array<{
    id: string;
    createdAt: Date;
    lastUsedAt?: Date;
    deviceName?: string;
  }>;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié.' };
    }

    const credentials = await getUserCredentials(userId);

    return {
      success: true,
      passkeys: credentials.map((cred) => ({
        id: cred.credentialId,
        createdAt: cred.createdAt,
        lastUsedAt: cred.lastUsedAt,
        deviceName: cred.deviceName,
      })),
    };
  } catch (error) {
    logger.errorSafe('Failed to list passkeys', error);
    return { success: false, error: 'Échec de la récupération des passkeys.' };
  }
}

/**
 * Checks if the user has passkeys enabled.
 */
export async function hasPasskeysEnabled(): Promise<{
  success: boolean;
  enabled?: boolean;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié.' };
    }

    const credentials = await getUserCredentials(userId);
    return { success: true, enabled: credentials.length > 0 };
  } catch (error) {
    logger.errorSafe('Failed to check passkeys status', error);
    return { success: false, error: 'Échec de la vérification.' };
  }
}

/**
 * Deletes a passkey.
 */
export async function deletePasskey(credentialId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié.' };
    }

    const credentialsRef = db
      .collection('users')
      .doc(userId)
      .collection('passkeys');
    const snapshot = await credentialsRef
      .where('credentialId', '==', credentialId)
      .get();

    if (snapshot.empty) {
      return { success: false, error: 'Passkey non trouvé.' };
    }

    await snapshot.docs[0].ref.delete();

    // Check if this was the last passkey
    const remainingCredentials = await getUserCredentials(userId);
    if (remainingCredentials.length === 0) {
      // Clear passkey metadata from user document
      await db.collection('users').doc(userId).update({
        encryptionVersion: 2, // Revert to passphrase-only
        wrappedMasterKey: FieldValue.delete(),
      });
    }

    logger.infoSafe('Passkey deleted', { userId, credentialId });

    return { success: true };
  } catch (error) {
    logger.errorSafe('Failed to delete passkey', error);
    return { success: false, error: 'Échec de la suppression du passkey.' };
  }
}

/**
 * Gets the wrapped recovery key for BIP39 recovery.
 */
export async function getWrappedRecoveryKey(): Promise<{
  success: boolean;
  wrappedRecoveryKey?: { wrappedKey: string; iv: string; version: number };
  error?: string;
}> {
  try {
    const userId = await getAuthedUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non authentifié.' };
    }

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.wrappedRecoveryKey) {
      return { success: false, error: 'Clé de récupération non trouvée.' };
    }

    return { success: true, wrappedRecoveryKey: userData.wrappedRecoveryKey };
  } catch (error) {
    logger.errorSafe('Failed to get wrapped recovery key', error);
    return { success: false, error: 'Échec de la récupération.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Firestore Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function getUserCredentials(userId: string): Promise<StoredCredential[]> {
  const credentialsRef = db
    .collection('users')
    .doc(userId)
    .collection('passkeys');
  const snapshot = await credentialsRef.orderBy('createdAt', 'desc').get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      credentialId: data.credentialId,
      credentialPublicKey: data.credentialPublicKey,
      counter: data.counter,
      transports: data.transports,
      createdAt: data.createdAt?.toDate() || new Date(),
      lastUsedAt: data.lastUsedAt?.toDate(),
      deviceName: data.deviceName,
    };
  });
}

async function getCredentialById(
  userId: string,
  credentialId: string
): Promise<StoredCredential | null> {
  // credentialId from browser is base64url, stored as base64
  const credentialIdBase64 = base64urlToBase64(credentialId);

  const credentialsRef = db
    .collection('users')
    .doc(userId)
    .collection('passkeys');
  const snapshot = await credentialsRef
    .where('credentialId', '==', credentialIdBase64)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const data = snapshot.docs[0].data();
  return {
    credentialId: data.credentialId,
    credentialPublicKey: data.credentialPublicKey,
    counter: data.counter,
    transports: data.transports,
    createdAt: data.createdAt?.toDate() || new Date(),
    lastUsedAt: data.lastUsedAt?.toDate(),
    deviceName: data.deviceName,
  };
}

async function storeCredential(
  userId: string,
  credential: StoredCredential
): Promise<void> {
  const credentialsRef = db
    .collection('users')
    .doc(userId)
    .collection('passkeys');
  await credentialsRef.add({
    ...credential,
    createdAt: Timestamp.fromDate(credential.createdAt),
  });
}

async function updateCredentialCounter(
  userId: string,
  credentialId: string,
  newCounter: number
): Promise<void> {
  const credentialsRef = db
    .collection('users')
    .doc(userId)
    .collection('passkeys');
  const snapshot = await credentialsRef
    .where('credentialId', '==', credentialId)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update({
      counter: newCounter,
      lastUsedAt: Timestamp.now(),
    });
  }
}

async function storeChallenge(
  userId: string,
  challenge: string,
  type: 'registration' | 'authentication'
): Promise<void> {
  await db.collection('users').doc(userId).update({
    currentChallenge: {
      challenge,
      type,
      createdAt: Timestamp.now(),
    } as StoredChallenge,
  });
}

async function getStoredChallenge(
  userId: string,
  expectedType: 'registration' | 'authentication'
): Promise<string | null> {
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  const storedChallenge = userData?.currentChallenge as
    | StoredChallenge
    | undefined;

  if (!storedChallenge) return null;
  if (storedChallenge.type !== expectedType) return null;

  // Check TTL
  const createdAt = storedChallenge.createdAt.toMillis();
  if (Date.now() - createdAt > CHALLENGE_TTL_MS) return null;

  return storedChallenge.challenge;
}

async function clearChallenge(userId: string): Promise<void> {
  await db.collection('users').doc(userId).update({
    currentChallenge: FieldValue.delete(),
  });
}

async function updatePasskeyMetadata(
  userId: string,
  wrappedMasterKey: { wrappedKey: string; iv: string; version: number },
  wrappedRecoveryKey: { wrappedKey: string; iv: string; version: number }
): Promise<void> {
  await db.collection('users').doc(userId).update({
    encryptionVersion: 3, // v3 = passkey
    wrappedMasterKey,
    wrappedRecoveryKey,
    passkeyEnabledAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
}

async function getWrappedMasterKey(userId: string): Promise<{
  wrappedKey: string;
  iv: string;
  version: number;
} | null> {
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();
  return userData?.wrappedMasterKey || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Buffer Helpers
// ─────────────────────────────────────────────────────────────────────────────

function bufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return Buffer.from(binary, 'binary').toString('base64');
}

function base64ToBuffer(base64: string): Uint8Array<ArrayBuffer> {
  const binary = Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64urlToBase64(base64url: string): string {
  return base64url.replace(/-/g, '+').replace(/_/g, '/');
}
