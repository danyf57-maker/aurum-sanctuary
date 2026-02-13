
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
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-b from-stone-50 via-[#F9F7F2] to-stone-50">
                <div className="w-full max-w-2xl">
                    {/* Main card */}
                    <div className="relative rounded-[32px] border border-[#D4AF37]/20 bg-gradient-to-br from-white/95 via-[#F9F7F2]/90 to-white/95 p-12 md:p-16 text-center shadow-[0_20px_60px_rgba(212,175,55,0.12)] space-y-8 backdrop-blur-sm">
                        {/* Decorative golden glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#D4AF37]/8 rounded-full blur-3xl" />

                        <div className="relative space-y-8">
                            {/* Icon */}
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C5A059] shadow-lg shadow-[#D4AF37]/20">
                                <Eye className="h-7 w-7 text-white" />
                            </div>

                            {/* Title */}
                            <div className="space-y-4">
                                <p className="font-body text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-semibold">
                                    ESPACE PRIVÉ
                                </p>
                                <h1 className="font-headline text-5xl md:text-6xl text-stone-900 tracking-tight leading-tight">
                                    Entre dans ton<br />Sanctuaire
                                </h1>
                            </div>

                            {/* Description */}
                            <div className="max-w-md mx-auto space-y-4">
                                <p className="text-stone-700 text-xl font-light leading-relaxed">
                                    Un espace chiffré où tes pensées deviennent clarté.
                                </p>
                                <div className="flex items-center justify-center gap-6 text-sm text-stone-600">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                                        <span>100% Privé</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                                        <span>Chiffré</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                                        <span>Sans jugement</span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <div className="pt-4">
                                <Button
                                    onClick={() => setIsAuthDialogOpen(true)}
                                    size="lg"
                                    className="h-14 px-10 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-900 hover:from-[#C5A059] hover:to-[#D4AF37] rounded-2xl shadow-[0_12px_28px_rgba(212,175,55,0.3)] text-lg font-semibold transition-all hover:shadow-[0_16px_36px_rgba(212,175,55,0.4)] hover:scale-105"
                                >
                                    Entrer dans le Sanctuaire
                                </Button>
                                <p className="mt-4 text-stone-500 text-sm">
                                    Connexion sécurisée via Google ou Email
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Subtle feature hints below */}
                    <div className="mt-12 grid grid-cols-3 gap-8 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl">✍️</div>
                            <p className="text-xs text-stone-600 font-medium">Écriture guidée</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl">🔮</div>
                            <p className="text-xs text-stone-600 font-medium">Reflets IA</p>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl">📖</div>
                            <p className="text-xs text-stone-600 font-medium">Magazine privé</p>
                        </div>
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
