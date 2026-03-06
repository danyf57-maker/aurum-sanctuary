/**
 * Firebase Authentication Helpers
 *
 * React hooks and utilities for Firebase Auth integration.
 */

'use client';

import { useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from './web-client';
import { logger } from '@/lib/logger/safe';
import { normalizeLocale } from '@/lib/locale';

function resolveAppUrl(): string {
  const fallbackOrigin = window.location.origin;
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configuredUrl) return fallbackOrigin;

  try {
    const parsed = new URL(configuredUrl);
    const isConfiguredLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    const isRuntimeLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isConfiguredLocalhost && !isRuntimeLocalhost) {
      logger.warnSafe('Ignoring NEXT_PUBLIC_APP_URL localhost value in non-local runtime', {
        configuredUrl: parsed.origin,
        runtimeOrigin: fallbackOrigin,
      });
      return fallbackOrigin;
    }

    return parsed.origin;
  } catch {
    logger.warnSafe('Invalid NEXT_PUBLIC_APP_URL format, falling back to window origin', {
      configuredUrl,
      runtimeOrigin: fallbackOrigin,
    });
    return fallbackOrigin;
  }
}

function readClientLocale(): "fr" | "en" {
  if (typeof document === "undefined") return "en";
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("aurum-locale="));
  const value = match?.split("=")[1] ?? "";
  return normalizeLocale(decodeURIComponent(value)) ?? "en";
}

function getEmailActionSettings() {
  const locale = readClientLocale();
  const appUrl = resolveAppUrl();
  return {
    locale,
    verificationUrl: `${appUrl}/auth/action?lang=${locale}`,
    resetUrl: `${appUrl}/login?lang=${locale}`,
  };
}

/**
 * Hook to get current authenticated user
 * 
 * @returns Current user object or null if not authenticated
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    const locale = readClientLocale();
    const message =
      locale === "fr"
        ? "NEXT_PUBLIC_GOOGLE_CLIENT_ID est manquant. Ajoutez-le pour activer la connexion Google."
        : "NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing. Add it to enable Google sign-in.";
    logger.warnSafe(message);
    return { user: null, error: message };
  }
  const provider = new GoogleAuthProvider();
  try {
    auth.languageCode = readClientLocale();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const settings = getEmailActionSettings();
    auth.languageCode = settings.locale;
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (!result.user.emailVerified) {
      await sendEmailVerification(result.user, {
        url: settings.verificationUrl,
        handleCodeInApp: false,
      });
      await firebaseSignOut(auth);
      return { user: null, error: "EMAIL_NOT_VERIFIED" };
    }
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  try {
    const settings = getEmailActionSettings();
    auth.languageCode = settings.locale;
    await sendPasswordResetEmail(auth, email, {
      url: settings.resetUrl,
      handleCodeInApp: false,
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Get current user's ID token
 * 
 * @param forceRefresh - Force token refresh (default: false)
 * @returns ID token string or null if not authenticated
 */
export async function getIdToken(forceRefresh: boolean = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    return await user.getIdToken(forceRefresh);
  } catch (error) {
    logger.errorSafe('Error getting ID token', error);
    return null;
  }
}
