
"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase/config';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Logo } from '@/components/icons';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          // Add a check for Alma's specific email to assign the static ID
          const isAlma = firebaseUser.email === process.env.NEXT_PUBLIC_ALMA_EMAIL;
          const uid = isAlma ? (process.env.NEXT_PUBLIC_ALMA_USER_ID || 'alma_user_placeholder_id') : firebaseUser.uid;

          await setDoc(doc(db, "users", uid), {
            uid: uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp(),
          });
          
          // We need to reload the user to get the new custom UID if it's Alma
          if (isAlma) {
             // This is tricky on client side. For this simple case, we'll just set the user object.
             // In a real app, you might need a custom token flow.
             // @ts-ignore
             firebaseUser.uid = uid;
          }
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <Logo className="h-12 w-12 text-primary" />
            <p className="text-muted-foreground">Réveil du Sanctuaire...</p>
        </div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
