'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useAuth } from '@/providers/auth-provider';
import { auth } from '@/lib/firebase/web-client';
import { isFirebaseWebClientEnabled } from '@/lib/firebase/web-client';
import { logger } from '@/lib/logger/safe';

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleOneTapPrompt() {
  const { user } = useAuth();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseWebClientEnabled) return;
    if (user) return;
    if (!window.google?.accounts?.id) return;
    if (initializedRef.current) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    initializedRef.current = true;

    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: false,
      callback: async (response: { credential?: string }) => {
        try {
          if (!response?.credential) return;
          const credential = GoogleAuthProvider.credential(response.credential);
          await signInWithCredential(auth, credential);
        } catch (error) {
          logger.errorSafe('Google One Tap sign-in failed', error);
        }
      },
    });

    window.google.accounts.id.prompt();

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
      initializedRef.current = false;
    };
  }, [user]);

  if (!isFirebaseWebClientEnabled) return null;
  if (user) return null;
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
    />
  );
}
