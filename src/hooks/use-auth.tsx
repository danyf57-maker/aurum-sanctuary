
"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Déclare le type étendu pour inclure getIdToken
interface CustomFirebaseUser extends FirebaseUser {
  getIdToken(forceRefresh?: boolean): Promise<string>;
}

interface AuthContextType {
  user: (CustomFirebaseUser & { uid: string }) | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const ALMA_USER_ID = "ALMA_SPECIAL_USER_ID";
const ALMA_EMAIL = "alma@aurum.com";


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAlma = firebaseUser.email === ALMA_EMAIL;
        const uid = isAlma ? ALMA_USER_ID : firebaseUser.uid;

        // Assure que firebaseUser est traité comme CustomFirebaseUser
        const customUser = firebaseUser as CustomFirebaseUser;

        // Ensure the user object has the correct UID for Alma
        const finalUser = { ...customUser, uid } as CustomFirebaseUser & { uid: string };
        
        const isNewUser = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;


        // Only interact with Firestore for non-Alma users
        if (!isAlma) {
            const userRef = doc(db, "users", finalUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              try {
                await setDoc(userRef, {
                  uid: finalUser.uid,
                  email: finalUser.email,
                  displayName: finalUser.displayName,
                  photoURL: finalUser.photoURL,
                  createdAt: serverTimestamp(),
                  // Nouveaux champs pour Stripe
                  stripeCustomerId: null,
                  subscriptionStatus: 'free',
                });
              } catch (error) {
                 console.error("Error creating user document:", error);
              }
            }
        }
        
        setUser(finalUser);
        if(isNewUser) {
            router.push('/dashboard');
        }

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Intercepteur de fetch pour ajouter le token d'authentification
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const [url, config] = args;

        const isApiRoute = (typeof url === 'string' && url.startsWith('/api/')) ||
                           (url instanceof Request && url.url.includes('/api/'));

        // On n'ajoute le token que pour les appels à nos propres actions serveur (implicitement pas les API externes)
        // et on ne veut pas l'ajouter pour les appels API externes, car on ne veut pas leaker le token.
        // Ici on suppose que les actions serveur n'appellent pas d'API externes qui requièrent un fetch.
        // Une approche plus fine serait de vérifier le domaine.
        const isServerAction = config?.body instanceof FormData;

        if (user && (isServerAction || !isApiRoute)) {
            const token = await user.getIdToken();
            const headers = new Headers(config?.headers);
            headers.set('Authorization', `Bearer ${token}`);
            const newConfig = { ...config, headers };
            return originalFetch(url, newConfig);
        }

        return originalFetch(url, config);
    };

    return () => {
        window.fetch = originalFetch;
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
