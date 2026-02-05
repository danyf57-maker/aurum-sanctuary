'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth as firebaseAuth, firestore as db } from '@/lib/firebase/web-client';
import { logger } from '@/lib/logger/safe';
import { useToast } from '@/hooks/use-toast';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  termsAccepted: boolean | null; // null = loading/unknown
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  acceptTerms: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Client-side constant for UI display only
// ⚠️ DO NOT import in server actions - use @/lib/firebase/server-config instead
export const ALMA_EMAIL = 'alma.lawson@aurum.inc';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    logger.infoSafe('AuthProvider mounted');

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      logger.infoSafe('AuthStateChanged', {
        loggedIn: !!firebaseUser,
        uid: firebaseUser?.uid
      });

      if (firebaseUser) {
        // Sync token to cookie for middleware via API route (HttpOnly)
        try {
          const token = await firebaseUser.getIdToken();
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: token }),
          });
        } catch (e) {
          logger.errorSafe('Failed to sync auth token to cookie via API', e);
        }

        const isAlma = firebaseUser.email === ALMA_EMAIL;

        // Use a type assertion or helper if needed, but for now just pass firebaseUser
        const finalUser = firebaseUser;
        setUser(finalUser);

        if (!isAlma) {
          // Listen to user document (created by server-side trigger)
          const userRef = doc(db, "users", finalUser.uid);

          let userSnap = await getDoc(userRef);

          // FALLBACK FOR DEV: If trigger didn't run (no emulators), create doc client-side
          if (!userSnap.exists() && process.env.NODE_ENV === 'development') {
            logger.warnSafe("DEV MODE: Creating user doc client-side because Cloud Trigger is missing.", { userId: finalUser.uid });
            try {
              await setDoc(userRef, {
                uid: finalUser.uid,
                email: finalUser.email,
                displayName: finalUser.displayName,
                photoURL: finalUser.photoURL,
                createdAt: serverTimestamp(),
                stripeCustomerId: null,
                subscriptionStatus: 'free',
                entryCount: 0,
              }, { merge: true });

              // Init settings
              await setDoc(doc(db, "users", finalUser.uid, "settings", "legal"), {
                termsAccepted: false,
                termsAcceptedAt: null,
                updatedAt: serverTimestamp(),
              });

              logger.infoSafe("DEV MODE: User doc created", { userId: finalUser.uid });
              userSnap = await getDoc(userRef); // Refresh
            } catch (e) {
              logger.errorSafe("DEV MODE: Failed to force create user doc", e, { userId: finalUser.uid });
            }
          }

          if (userSnap.exists()) {
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
          setTermsAccepted(true); // Special user always accepted
        }
      } else {
        setUser(null);
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

    return () => unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
    try {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      console.log("GOOGLE_CLIENT_ID check:", googleClientId ? `${googleClientId.substring(0, 5)}...` : "MISSING");
      if (!googleClientId) {
        const message =
          "NEXT_PUBLIC_GOOGLE_CLIENT_ID est manquant. Ajoutez-le pour activer la connexion Google.";
        logger.warnSafe(message);
        toast({
          title: "Connexion Google indisponible",
          description: message,
          variant: "destructive",
        });
        throw new Error(message);
      }
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
      // Redirect logic handled by component or useEffect
    } catch (error) {
      logger.errorSafe('Google Sign In Failed', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter avec Google.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithEmail = async (e: string, p: string) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, e, p);
    } catch (error) {
      logger.errorSafe('Email Sign In Failed', error);
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUpWithEmail = async (e: string, p: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(firebaseAuth, e, p);
      await updateProfile(cred.user, { displayName: name });
    } catch (error) {
      logger.errorSafe('Sign Up Failed', error);
      toast({
        title: "Erreur d'inscription",
        description: "Impossible de créer le compte.",
        variant: "destructive",
      });
      throw error;
    }
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
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (error) {
      logger.errorSafe('Password Reset Failed', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      termsAccepted,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      acceptTerms,
      resetPassword // Exported here
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
