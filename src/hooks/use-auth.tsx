
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

// Déclare le type étendu pour inclure getIdToken
interface CustomFirebaseUser extends FirebaseUser {
  getIdToken(forceRefresh?: boolean): Promise<string>;
}

export const ALMA_USER_ID = "ALMA_SPECIAL_USER_ID";
const ALMA_EMAIL = "alma@aurum.com";

export const useAuth = () => {
  const [user, setUser] = useState<(CustomFirebaseUser & { uid: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAlma = firebaseUser.email === ALMA_EMAIL;
        const uid = isAlma ? ALMA_USER_ID : firebaseUser.uid;

        const customUser = firebaseUser as CustomFirebaseUser;
        const finalUser = { ...customUser, uid } as CustomFirebaseUser & { uid: string };
        
        const isNewUser = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;

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
                  stripeCustomerId: null,
                  subscriptionStatus: 'free',
                  entryCount: 0,
                }, { merge: true });
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
  
    // Intercepteur de fetch pour ajouter le token d'authentification pour les Server Actions
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const originalFetch = window.fetch;
        
        // @ts-ignore
        window.fetch = async (...args) => {
            const [url, config] = args;
            
            const isServerAction = typeof url === 'string' && url.includes('?_rsc') || (config?.body instanceof FormData);

            if (firebaseAuth.currentUser && isServerAction) {
                try {
                const token = await firebaseAuth.currentUser.getIdToken();
                const headers = new Headers(config?.headers);
                headers.set('Authorization', `Bearer ${token}`);
                const newConfig = { ...config, headers };
                return originalFetch(url, newConfig);
                } catch (e) {
                console.error("Could not get ID token.", e)
                }
            }

            return originalFetch(url, config);
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [user]);


  return { user, loading };
};
