import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WifiOff } from 'lucide-react';

export const metadata = {
    title: "Hors Connexion | Aurum",
};

export default function OfflinePage() {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4 px-4 text-center">
            <div className="rounded-full bg-stone-100 p-4 dark:bg-stone-900">
                <WifiOff className="h-10 w-10 text-stone-500" />
            </div>
            <h1 className="text-4xl font-serif text-foreground">Connexion Perdue</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Vous êtes actuellement hors ligne. Pas d'inquiétude, votre sanctuaire reste sécurisé.
                Vos entrées seront synchronisées dès le retour de la connexion.
            </p>
            <div className="flex items-center justify-center space-x-4">
                <Button asChild>
                    <Link href="/dashboard">
                        Retour au Dashboard (Version Cache)
                    </Link>
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Réessayer
                </Button>
            </div>
        </div>
    );
}
