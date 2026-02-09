'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  resetPassword as resetPasswordHelper,
  signInWithEmail as signInWithEmailHelper,
  signOut as signOutHelper,
  signUpWithEmail as signUpWithEmailHelper,
  useAuth as useFirebaseAuth,
} from '@/lib/firebase/auth';
import { isFirebaseWebClientEnabled } from '@/lib/firebase/web-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  termsAccepted: boolean | null;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  acceptTerms: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Client-side constant for UI display only
export const ALMA_EMAIL = 'alma.lawson@aurum.inc';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useFirebaseAuth();
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(true);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await signInWithEmailHelper(email, password);
    if (error) throw new Error(error);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await signUpWithEmailHelper(email, password);
    if (error) throw new Error(error);
  };

  const logout = async () => {
    const { error } = await signOutHelper();
    if (error) throw new Error(error);
  };

  const acceptTerms = async () => {
    setTermsAccepted(true);
  };

  const resetPassword = async (email: string) => {
    const { error } = await resetPasswordHelper(email);
    if (error) throw new Error(error);
  };

  const contextValue = useMemo(
    () => ({
      user: isFirebaseWebClientEnabled ? user : null,
      loading: isFirebaseWebClientEnabled ? loading : false,
      termsAccepted,
      signInWithEmail,
      signUpWithEmail,
      logout,
      acceptTerms,
      resetPassword
    }),
    [user, loading, termsAccepted]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
