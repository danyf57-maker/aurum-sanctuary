
'use client';

import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { WelcomePresence } from '@/components/sanctuary/welcome-presence';
import { PremiumJournalForm } from '@/components/sanctuary/premium-journal-form';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export default function WritePage() {
    const { user, loading } = useAuth();
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto py-20">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-96 w-full bg-muted rounded-md animate-pulse" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container max-w-3xl mx-auto py-20 px-4">
                <div className="rounded-3xl border border-stone-200 bg-white/90 p-8 md:p-12 text-center shadow-sm space-y-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                        <Eye className="h-5 w-5" />
                    </div>
                    <h1 className="font-headline text-4xl text-stone-900 tracking-tight">
                        Entre dans ton Sanctuaire
                    </h1>
                    <p className="text-stone-600 text-lg">
                        Connecte-toi avec Google pour écrire et préserver tes pensées.
                    </p>
                    <div>
                        <Button
                            onClick={() => setIsAuthDialogOpen(true)}
                            className="bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-full px-8"
                        >
                            Se connecter avec Google
                        </Button>
                    </div>
                </div>
                <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
            </div>
        );
    }

    return (
        <>
            <WelcomePresence userName={user?.displayName || undefined} />
            <div className="container max-w-5xl mx-auto py-12 md:py-20 px-4">
                <div className="mb-12 text-center space-y-3">
                    <h1 className="font-headline text-4xl md:text-5xl text-stone-900 tracking-tight">
                        Ton Sanctuaire
                    </h1>
                    <p className="text-stone-600 text-lg">
                        Écris ce qui demande à être posé.
                    </p>
                </div>
                <PremiumJournalForm />
            </div>
        </>
    );
}
