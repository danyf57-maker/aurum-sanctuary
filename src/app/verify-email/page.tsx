'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/hooks/use-locale';

function LoadingState() {
  const locale = useLocale();
  const isFr = locale === 'fr';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            {isFr ? 'Vérifier votre email' : 'Verify your email'}
          </CardTitle>
          <CardDescription>
            {isFr
              ? "Ouverture de votre espace de réflexion privé..."
              : "Opening your private reflection space..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isFr ? 'Vérification en cours...' : 'Verifying...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function VerifyEmailClient() {
  const VerifyEmailContent = require('./verify-email-client').default;
  return <VerifyEmailContent />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
