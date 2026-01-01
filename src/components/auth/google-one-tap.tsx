
'use client';

import { useEffect } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useAuth } from '@/hooks/use-auth';
import { auth as firebaseAuth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';

export function GoogleOneTap() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already logged in, don't show One Tap
    if (user) {
      return;
    }

    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!GOOGLE_CLIENT_ID) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google One Tap will not work.");
      return;
    }

    const handleCredentialResponse = async (response: any) => {
      try {
        const idToken = response.credential;
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(firebaseAuth, credential);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Aurum.",
        });
      } catch (error) {
        console.error("Google One Tap sign-in error:", error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter avec Google One Tap.",
          variant: "destructive",
        });
      }
    };

    if (window.google) {
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: true,
        });

        window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                // console.log('Google One Tap not displayed or skipped.');
            }
        });
    }

    // Cleanup function to cancel the prompt if the component unmounts
    return () => {
      if (window.google) {
        window.google.accounts.id.cancel();
      }
    };
  }, [user, toast]);

  return null; // This component does not render anything
}

// You need to declare the `google` object on the window type
declare global {
    interface Window {
        google?: any;
    }
}
