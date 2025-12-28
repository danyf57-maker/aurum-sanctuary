
"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: (FirebaseUser & { uid: string }) | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const ALMA_USER_ID = "ALMA_SPECIAL_USER_ID";
const ALMA_EMAIL = "alma@aurum.com";


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const isAlma = firebaseUser.email === ALMA_EMAIL;
        const uid = isAlma ? ALMA_USER_ID : firebaseUser.uid;

        // Ensure the user object has the correct UID for Alma
        const finalUser = { ...firebaseUser.toJSON(), uid } as FirebaseUser & { uid: string };

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
                });
              } catch (error) {
                 console.error("Error creating user document:", error);
              }
            }
        }
        
        setUser(finalUser);

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
