'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase/web-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Status = 'idle' | 'verifying' | 'success' | 'error';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (!mode || !oobCode || mode !== 'verifyEmail') {
      setStatus('error');
      setError('Lien de vérification invalide ou expiré.');
      return;
    }

    const verify = async () => {
      setStatus('verifying');
      try {
        await applyActionCode(auth, oobCode);
        setStatus('success');
      } catch (e) {
        setStatus('error');
        setError('Impossible de vérifier votre email. Merci de réessayer.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Vérification Aurum</CardTitle>
          <CardDescription>
            Aurum est un miroir intime pour déposer vos pensées et retrouver de la clarté.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'verifying' && (
            <p className="text-sm text-muted-foreground">Vérification en cours...</p>
          )}
          {status === 'success' && (
            <>
              <p className="text-sm text-stone-700">
                Votre email est vérifié. Vous pouvez maintenant vous connecter.
              </p>
              <Button onClick={() => router.push('/login?verified=1')} className="w-full">
                Se connecter
              </Button>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={() => router.push('/login')} className="w-full">
                Retour à la connexion
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
