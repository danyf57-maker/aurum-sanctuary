
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { AuthContext, CustomFirebaseUser, ALMA_USER_ID, ALMA_EMAIL } from '@/contexts/auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
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

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
