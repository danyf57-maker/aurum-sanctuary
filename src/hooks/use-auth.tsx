
'use client';

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/contexts/auth-context';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ALMA_USER_ID est maintenant défini dans le contexte, mais peut être exporté d'ici si nécessaire.
export const ALMA_USER_ID = "ALMA_SPECIAL_USER_ID";
