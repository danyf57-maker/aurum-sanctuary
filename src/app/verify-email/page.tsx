'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Vérification Aurum</CardTitle>
          <CardDescription>
            Aurum est un miroir intime pour déposer vos pensées et retrouver de la clarté.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Vérification en cours...</p>
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
