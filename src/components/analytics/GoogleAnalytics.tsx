
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import Script from 'next/script'
import { pageview, GA_TRACKING_ID } from '@/lib/gtag'
import { useAuth } from '@/hooks/use-auth';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';


export default function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth();
  const { toast } = useToast();


  useEffect(() => {
    if (!GA_TRACKING_ID) {
        return;
    }
    const url = pathname + searchParams.toString()
    pageview(new URL(url, window.location.origin))
  }, [pathname, searchParams])

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


  if (!GA_TRACKING_ID) {
    return null;
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" async defer />
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

declare global {
    interface Window {
        google?: any;
    }
}
