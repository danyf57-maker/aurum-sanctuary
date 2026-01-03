import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 px-4">
      <AlertTriangle className="w-16 h-16 text-amber-600 mb-6" />
      <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
        Page non trouvée
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md text-center">
        Désolé, cette page n'existe pas.
      </p>
      <Button asChild variant="default" size="lg">
        <Link href="/">
          Retour à l'accueil
        </Link>
      </Button>
    </div>
  );
}

export default NotFound;
