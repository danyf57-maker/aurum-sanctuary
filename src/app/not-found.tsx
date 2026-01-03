
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

function NotFoundContent() {
  const searchParams = useSearchParams();
  // Vous pouvez utiliser les searchParams ici si nécessaire.
  // Par exemple : const invalidQuery = searchParams.get('some_param');

  return (
    <div className="container max-w-2xl mx-auto py-20 md:py-28 text-center animate-fade-in">
        <AlertTriangle className="mx-auto h-16 w-16 text-amber-500 mb-8" />
        <h1 className="text-4xl font-bold font-headline">Page Non Trouvée</h1>
        <p className="mt-4 text-muted-foreground">
            Désolé, la page que vous cherchez semble s'être égarée dans le silence.
        </p>
        <Button asChild className="mt-8">
            <Link href="/">Retourner à l'accueil</Link>
        </Button>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
