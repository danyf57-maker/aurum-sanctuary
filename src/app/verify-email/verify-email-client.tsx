'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase/web-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/use-locale';
import { localizeHref } from '@/lib/i18n/path';

type Status = 'idle' | 'verifying' | 'success' | 'error';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const to = (href: string) => localizeHref(href, locale);
  const isFr = locale === 'fr';
  const txt = (fr: string, en: string) => (isFr ? fr : en);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (!mode || !oobCode || mode !== 'verifyEmail') {
      setStatus('error');
      setError(txt('Lien de vérification invalide ou expiré.', 'Invalid or expired verification link.'));
      return;
    }

    const verify = async () => {
      setStatus('verifying');
      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
      } catch (e) {
        setStatus('error');
        setError(txt('Impossible de vérifier votre email. Merci de réessayer.', 'Unable to verify your email. Please try again.'));
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {txt('Vérifier votre email', 'Verify your email')}
          </CardTitle>
          <CardDescription>
            {txt(
              "Ouvrez votre espace d'écriture privé pour écrire librement et recevoir une lecture psychologique profonde de ce qui revient dans le temps.",
              'Open your private writing space to write freely and receive a deep psychological reading of what keeps returning over time.'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'verifying' && (
            <p className="text-sm text-muted-foreground">
              {txt('Vérification en cours...', 'Verifying...')}
            </p>
          )}
          {status === 'success' && (
            <>
              <p className="text-sm text-stone-700">
                {txt(
                  "Votre email est vérifié. Vous pouvez maintenant vous connecter et commencer votre écriture privée avec Aurum.",
                  'Your email is verified. You can now sign in and begin your private writing with Aurum.'
                )}
              </p>
              <Button onClick={() => router.push(to('/login?verified=1'))} className="w-full">
                {txt('Se connecter', 'Sign in')}
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={() => router.push(to('/login'))} className="w-full">
                {txt('Retour à la connexion', 'Back to sign in')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
