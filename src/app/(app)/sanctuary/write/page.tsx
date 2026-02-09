
'use client';

import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { WelcomePresence } from '@/components/sanctuary/welcome-presence';
import { PremiumJournalForm } from '@/components/sanctuary/premium-journal-form';

export default function WritePage() {
    const { user, loading } = useAuth();

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
