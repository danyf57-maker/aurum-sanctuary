
'use client';

import { createContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';

// Déclare le type étendu pour inclure getIdToken
export interface CustomFirebaseUser extends FirebaseUser {
  getIdToken(forceRefresh?: boolean): Promise<string>;
}

export const ALMA_USER_ID = "ALMA_SPECIAL_USER_ID";
export const ALMA_EMAIL = "alma@aurum.com";

export interface AuthContextType {
  user: (CustomFirebaseUser & { uid: string }) | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
