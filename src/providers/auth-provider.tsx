'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  auth as firebaseAuth,
  firestore as db,
  ensureAuthPersistence,
} from '@/lib/firebase/web-client';
import { logger } from '@/lib/logger/safe';
import { extractFirstName, resolveOptionalFirstName, sanitizeFirstName } from '@/lib/profile/first-name';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/hooks/use-locale';


interface AuthContextType {
  user: User | null;
  profileFirstName: string | null;
  loading: boolean;
  termsAccepted: boolean | null; // null = loading/unknown
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, firstName: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  updateFirstName: (firstName: string) => Promise<void>;
  logout: () => Promise<void>;
  acceptTerms: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profileFirstName, setProfileFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  const { toast } = useToast();
  const locale = useLocale();
  const isFr = locale === 'fr';
  const txt = (fr: string, en: string) => (isFr ? fr : en);
  const isInAppBrowser = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /FBAN|FBAV|Instagram|Line|LinkedInApp|Snapchat|Twitter|GSA|WebView|wv/i.test(ua);
  };

  const resolveAppUrl = () => {
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
  };

  const getEmailVerificationSettings = () => {
    const appUrl = resolveAppUrl();
    const lang = isFr ? "fr" : "en";
    return {
      url: `${appUrl}/auth/action?lang=${lang}`,
      handleCodeInApp: false, // False to use the custom action handler page
    };
  };

  const getResetPasswordSettings = () => {
    const appUrl = resolveAppUrl();
    const lang = isFr ? "fr" : "en";
    return {
      url: `${appUrl}/login?lang=${lang}`,
      handleCodeInApp: false,
    };
  };

  useEffect(() => {
    firebaseAuth.languageCode = isFr ? "fr" : "en";
  }, [isFr]);

  const sendVerificationEmailServer = async (email: string) => {
    const response = await fetch("/api/auth/send-verification-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        locale: isFr ? "fr" : "en",
      }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(errorBody?.error || "VERIFICATION_EMAIL_SEND_FAILED");
    }
  };

  const sendVerificationEmailWithFallback = async (email: string, currentUser?: User | null) => {
    try {
      await sendVerificationEmailServer(email);
      return;
    } catch (serverError) {
      logger.warnSafe("Server verification email send failed; falling back to Firebase client email", {
        email,
        serverError:
          serverError instanceof Error ? serverError.message : String(serverError),
      });

      if (currentUser) {
        await sendEmailVerification(currentUser, getEmailVerificationSettings());
        return;
      }

      throw serverError;
    }
  };

  useEffect(() => {
    logger.infoSafe('AuthProvider mounted');
    let isCancelled = false;
    let unsubscribe = () => {};

    void (async () => {
      try {
        await ensureAuthPersistence();
      } catch (error) {
        logger.errorSafe('Failed to initialize auth persistence', error);
      }

      if (isCancelled) return;

      unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        logger.infoSafe('AuthStateChanged', {
          loggedIn: !!firebaseUser,
          uid: firebaseUser?.uid
        });

        if (firebaseUser) {
          // Sync token to cookie for middleware via API route (HttpOnly)
          // This runs on EVERY auth state check (including page reload),
          // which refreshes the cookie and prevents session expiration.
          const syncCookie = async (attempt = 0): Promise<void> => {
            try {
              const token = await firebaseUser.getIdToken(attempt > 0);
              const res = await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: token }),
              });
              if (!res.ok && attempt < 1) {
                return syncCookie(attempt + 1);
              }
            } catch (e) {
              if (attempt < 1) {
                return syncCookie(attempt + 1);
              }
              logger.errorSafe('Failed to sync auth token to cookie via API (after retry)', e);
            }
          };
          await syncCookie();

          // Use a type assertion or helper if needed, but for now just pass firebaseUser
          const finalUser = firebaseUser;
          setUser(finalUser);

          // Listen to user document (created by server-side trigger)
          const userRef = doc(db, "users", finalUser.uid);

          let userSnap = await getDoc(userRef);
          const displayFirstName = extractFirstName(finalUser.displayName);
          const inferredFirstName = displayFirstName;

          // FALLBACK: If trigger didn't run, create doc client-side
          // This ensures users can still use the app even if Cloud Functions aren't deployed yet
          if (!userSnap.exists()) {
            logger.warnSafe("Creating user doc client-side because Cloud Trigger is missing.", { userId: finalUser.uid });
            try {
              // Security hardening: client fallback creates profile metadata only.
              // Billing/subscription state is server-managed.
              await setDoc(userRef, {
                uid: finalUser.uid,
                email: finalUser.email,
                displayName: finalUser.displayName,
                firstName: inferredFirstName || null,
                photoURL: finalUser.photoURL,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                entryCount: 0,
              }, { merge: true });

              await setDoc(doc(db, "users", finalUser.uid, "settings", "legal"), {
                termsAccepted: false,
                termsAcceptedAt: null,
                updatedAt: serverTimestamp(),
              });

              logger.infoSafe("User doc created client-side", { userId: finalUser.uid });
              setTermsAccepted(false);
              setProfileFirstName(inferredFirstName || null);
              userSnap = await getDoc(userRef);
            } catch (e) {
              logger.errorSafe("Failed to create user doc client-side", e, { userId: finalUser.uid });
            }
          }

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const storedFirstName = sanitizeFirstName(userData.firstName);
            const profilePatch: Record<string, unknown> = {};
            const emailLocalPart = finalUser.email?.split('@')[0]?.trim().toLowerCase() || null;
            const storedLooksLikeEmail = Boolean(
              storedFirstName &&
              emailLocalPart &&
              storedFirstName.trim().toLowerCase() === emailLocalPart
            );

            if ((!storedFirstName || storedLooksLikeEmail) && inferredFirstName) {
              profilePatch.firstName = inferredFirstName;
            }

            if ((userData.displayName ?? null) !== (finalUser.displayName ?? null)) {
              profilePatch.displayName = finalUser.displayName ?? null;
            }

            if (Object.keys(profilePatch).length > 0) {
              await setDoc(userRef, {
                ...profilePatch,
                updatedAt: serverTimestamp(),
              }, { merge: true });
            }

            setProfileFirstName(
              storedLooksLikeEmail ? inferredFirstName || null : storedFirstName || inferredFirstName || null
            );

            // User exists, check terms in settings/legal
            const legalRef = doc(db, "users", finalUser.uid, "settings", "legal");
            const legalSnap = await getDoc(legalRef);

            if (legalSnap.exists()) {
              setTermsAccepted(legalSnap.data().termsAccepted);
            } else {
              setTermsAccepted(false);
            }
          } else {
            // User doc doesn't exist yet (Cloud Function might be slow)
            setTermsAccepted(false);
            logger.warnSafe('User document not found (waiting for trigger)', { userId: finalUser.uid });
          }
        } else {
          setUser(null);
          setProfileFirstName(null);
          setTermsAccepted(null);
          // Remove cookie via API
          try {
            await fetch('/api/auth/logout', { method: 'POST' });
          } catch (e) {
            logger.errorSafe('Failed to remove session cookie via API', e);
          }
          logger.infoSafe('User signed out');
        }
        setLoading(false);
      });
    })();

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [toast]);

  const signInWithGoogle = async () => {
    try {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      logger.infoSafe('Google Client ID check', { present: !!googleClientId });
      if (!googleClientId) {
        const message =
          txt(
            "NEXT_PUBLIC_GOOGLE_CLIENT_ID est manquant. Ajoutez-le pour activer la connexion Google.",
            "NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing. Add it to enable Google sign-in."
          );
        logger.warnSafe(message);
        toast({
          title: txt("Connexion Google indisponible", "Google sign-in unavailable"),
          description: message,
          variant: "destructive",
        });
        throw new Error(message);
      }
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(firebaseAuth, provider);
      } catch (popupError: unknown) {
        const code =
          typeof popupError === "object" &&
          popupError !== null &&
          "code" in popupError
            ? String((popupError as { code?: unknown }).code)
            : "";
        const message =
          typeof popupError === "object" &&
          popupError !== null &&
          "message" in popupError
            ? String((popupError as { message?: unknown }).message)
            : "";

        // Known cases where popup fails on mobile / strict browsers.
        if (
          code === "auth/popup-blocked" ||
          code === "auth/operation-not-supported-in-this-environment" ||
          code === "auth/cancelled-popup-request" ||
          message.includes("disallowed_useragent")
        ) {
          await signInWithRedirect(firebaseAuth, provider);
          return;
        }
        throw popupError;
      }
      // Redirect logic handled by component or useEffect
    } catch (error) {
      logger.errorSafe('Google Sign In Failed', error);
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? String((error as { message?: unknown }).message)
          : "";
      const isDisallowedUserAgent = message.includes("disallowed_useragent");
      toast({
        title: txt("Erreur de connexion", "Sign-in error"),
        description: isDisallowedUserAgent
          ? txt(
              "Google bloque ce navigateur intégré. Ouvre Aurum dans Safari ou Chrome, puis réessaie.",
              "Google blocks this in-app browser. Open Aurum in Safari or Chrome and try again."
            )
          : txt("Impossible de se connecter avec Google.", "Unable to sign in with Google."),
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithEmail = async (e: string, p: string) => {
    try {
      const cred = await signInWithEmailAndPassword(firebaseAuth, e, p);
      if (!cred.user.emailVerified) {
        let resendFailed = false;
        try {
          await sendVerificationEmailWithFallback(e, cred.user);
        } catch (resendError) {
          resendFailed = true;
          logger.errorSafe('Unable to resend verification email during login', resendError, { email: e });
        }
        await signOut(firebaseAuth);
        toast({
          title: txt("Email non vérifié", "Email not verified"),
          description: resendFailed
            ? txt(
                "Votre email n'est pas encore vérifié. Utilisez le bouton de renvoi pour demander un nouveau mail de vérification.",
                "Your email is not verified yet. Use the resend button to request a new verification email."
              )
            : txt(
                "Nous venons de renvoyer un email de vérification. Vérifiez votre boîte de réception pour ouvrir votre espace de réflexion privé.",
                "We sent a new verification email. Please check your inbox to unlock your private reflection space."
              ),
          variant: "destructive",
        });
        throw new Error("EMAIL_NOT_VERIFIED");
      }
    } catch (error) {
      logger.errorSafe('Email Sign In Failed', error);
      if ((error as Error)?.message !== "EMAIL_NOT_VERIFIED") {
        const authCode =
          typeof error === 'object' &&
          error !== null &&
          'code' in error
            ? String((error as { code?: unknown }).code)
            : '';
        const inAppBrowser = isInAppBrowser();
        let description = txt("Email ou mot de passe incorrect.", "Invalid email or password.");
        let errorTag: string | null = null;

        if (
          authCode === 'auth/invalid-credential' ||
          authCode === 'auth/invalid-login-credentials' ||
          authCode === 'auth/wrong-password' ||
          authCode === 'auth/user-not-found'
        ) {
          try {
            const methods = await fetchSignInMethodsForEmail(firebaseAuth, e);
            const usesGoogleOnly =
              methods.includes(GoogleAuthProvider.PROVIDER_ID) && !methods.includes('password');

            if (usesGoogleOnly) {
              errorTag = inAppBrowser ? 'ACCOUNT_USES_GOOGLE_INAPP' : 'ACCOUNT_USES_GOOGLE';
              description = inAppBrowser
                ? txt(
                    "Ce compte utilise Google. Ouvre Aurum dans Safari ou Chrome, puis continue avec Google.",
                    "This account uses Google. Open Aurum in Safari or Chrome, then continue with Google."
                  )
                : txt(
                    "Ce compte utilise Google. Utilise le bouton Google pour retrouver ton espace.",
                    "This account uses Google. Use the Google button to get back into your space."
                  );
            } else if (inAppBrowser) {
              description = txt(
                "Email ou mot de passe incorrect. Si tu utilises Google d'habitude, ouvre Aurum dans Safari ou Chrome pour continuer.",
                "Invalid email or password. If you usually use Google, open Aurum in Safari or Chrome to continue."
              );
            }
          } catch (methodsError) {
            logger.warnSafe('Unable to inspect sign-in methods after email login failure', {
              email: e,
              authCode,
              methodsError,
            });
            if (inAppBrowser) {
              description = txt(
                "Email ou mot de passe incorrect. Si tu utilises Google d'habitude, ouvre Aurum dans Safari ou Chrome pour continuer.",
                "Invalid email or password. If you usually use Google, open Aurum in Safari or Chrome to continue."
              );
            }
          }
        }

        toast({
          title: txt("Erreur de connexion", "Sign-in error"),
          description,
          variant: "destructive",
        });
        if (errorTag) {
          throw new Error(errorTag);
        }
      }
      throw error;
    }
  };

  const signUpWithEmail = async (e: string, p: string, firstName: string) => {
    try {
      const safeFirstName = sanitizeFirstName(firstName) || 'Aurum';
      const cred = await createUserWithEmailAndPassword(firebaseAuth, e, p);
      await updateProfile(cred.user, { displayName: safeFirstName });
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        firstName: safeFirstName,
        displayName: safeFirstName,
        photoURL: cred.user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        entryCount: 0,
      }, { merge: true });
      let verificationSent = true;
      try {
        await sendVerificationEmailWithFallback(e, cred.user);
      } catch (verificationError) {
        verificationSent = false;
        logger.errorSafe('Unable to send verification email after signup', verificationError, { email: e });
      }
      await signOut(firebaseAuth);
      toast({
        title: verificationSent
          ? txt("Vérifiez votre email", "Check your email")
          : txt("Compte créé", "Account created"),
        description: verificationSent
          ? txt(
              "Un message de vérification vient d'être envoyé pour activer votre espace de réflexion privé.",
              "A verification email has just been sent to activate your private reflection space."
            )
          : txt(
              "Le compte a bien été créé, mais le mail de vérification n'a pas pu partir tout de suite. Utilise l'écran de connexion pour renvoyer le mail.",
              "Your account was created, but the verification email could not be sent right away. Use the sign-in page to send it again."
            ),
        variant: verificationSent ? "default" : "destructive",
      });
    } catch (error) {
      logger.errorSafe('Sign Up Failed', error);
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? String((error as { code?: unknown }).code)
          : "";
      toast({
        title: errorCode === "auth/email-already-in-use"
          ? txt("Compte déjà existant", "Account already exists")
          : txt("Erreur d'inscription", "Sign-up error"),
        description: errorCode === "auth/email-already-in-use"
          ? txt(
              "Cet email correspond déjà à un compte. Connectez-vous pour retrouver votre espace.",
              "This email already has an account. Sign in to return to your space."
            )
          : txt("Impossible de créer le compte.", "Unable to create your account."),
        variant: "destructive",
      });
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      await sendVerificationEmailServer(email);
      toast({
        title: txt("Email renvoyé", "Email sent again"),
        description: txt(
          "Un nouveau mail de vérification vient d'être envoyé. Vérifiez aussi vos spams.",
          "A new verification email has been sent. Please check your spam folder too."
        ),
      });
    } catch (error) {
      logger.errorSafe('Resend verification email failed', error, { email });
      toast({
        title: txt("Envoi impossible", "Unable to send"),
        description: txt(
          "Impossible de renvoyer le mail de vérification pour le moment. Réessaie dans quelques minutes.",
          "We couldn't resend the verification email right now. Please try again in a few minutes."
        ),
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateFirstName = async (firstName: string) => {
    if (!user) {
      throw new Error("AUTH_REQUIRED");
    }

    const nextFirstName = sanitizeFirstName(firstName);
    if (!nextFirstName) {
      throw new Error("INVALID_FIRST_NAME");
    }

    await setDoc(doc(db, "users", user.uid), {
      firstName: nextFirstName,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    try {
      await updateProfile(user, { displayName: nextFirstName });
    } catch (error) {
      logger.warnSafe('Unable to mirror firstName to Firebase auth displayName', {
        userId: user.uid,
        error,
      });
    }

    setProfileFirstName(nextFirstName);
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      logger.errorSafe('Logout Failed', error);
    }
  };

  const acceptTerms = async () => {
    if (!user) return;
    try {
      // Write to settings/legal (Writable by client)
      const legalRef = doc(db, "users", user.uid, "settings", "legal");

      // Use setDoc with merge to ensure document exists if not already present
      // For dev fallback, we might have just created it, but merge is safe
      await setDoc(legalRef, {
        termsAccepted: true,
        termsAcceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setTermsAccepted(true);
      logger.infoSafe('Terms accepted by user', { userId: user.uid });
    } catch (error) {
      logger.errorSafe('Failed to accept terms', error, { userId: user.uid });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email, getResetPasswordSettings());
      toast({
        title: txt("Email envoyé", "Email sent"),
        description: txt(
          "Vérifiez vos mails et vos spams pour réinitialiser votre mot de passe.",
          "Check your inbox and spam folder to reset your password."
        ),
      });
    } catch (error) {
      logger.errorSafe('Password Reset Failed', error);
      toast({
        title: txt("Erreur de réinitialisation", "Reset error"),
        description: txt(
          "Impossible d'envoyer l'email de réinitialisation.",
          "Unable to send the password reset email."
        ),
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profileFirstName,
      loading,
      termsAccepted,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resendVerificationEmail,
      updateFirstName,
      logout,
      acceptTerms,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
