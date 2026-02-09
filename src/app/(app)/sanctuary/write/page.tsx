
'use client';

import { useState, useEffect } from 'react';
import { JournalEntryForm } from '@/components/journal/journal-entry-form';
import { AurumChat } from '@/components/chat/AurumChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookText, Lock, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { WelcomePresence } from '@/components/sanctuary/welcome-presence';
import { PremiumJournalForm } from '@/components/sanctuary/premium-journal-form';

export default function WritePage() {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("write");
    const { isPremium, loading: subscriptionLoading } = useSubscription();
    const [postWrite, setPostWrite] = useState<{
        freeQuestion: string;
        lockedQuestions: string[];
    } | null>(null);

    if (loading || subscriptionLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-20">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-96 w-full bg-muted rounded-md animate-pulse" />
                </div>
            </div>
        );
    }

    // Premium experience: spacious, presence-focused (authenticated users only)
    if (user && isPremium) {
        return (
            <>
                <WelcomePresence userName={user.displayName || undefined} />
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

    // Free experience: available to guests and authenticated free users
    return (
        <div className="container max-w-4xl mx-auto py-20">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write">
                        <BookText className="mr-2 h-4 w-4" />
                        Mode Écriture
                    </TabsTrigger>
                    <TabsTrigger value="chat">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Dialogue avec Aurum
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Écriture Libre</CardTitle>
                            <CardDescription>Votre espace pour déposer vos pensées, sans filtre.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <JournalEntryForm onSave={(payload) => {
                                if (payload?.freeQuestion && payload?.lockedQuestions) {
                                    setPostWrite({
                                        freeQuestion: payload.freeQuestion,
                                        lockedQuestions: payload.lockedQuestions,
                                    });
                                }
                            }} />
                        </CardContent>
                    </Card>
                    {postWrite && (
                        <Card className="border-amber-200/60 bg-gradient-to-b from-amber-50/40 to-white">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-amber-600" />
                                    Votre pensée est scellée.
                                </CardTitle>
                                <CardDescription>
                                    Ici, personne ne lit vos mots. Aurum vous accompagne, pas vos données.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-lg border bg-white p-4">
                                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                                        Question‑miroir (gratuite)
                                    </p>
                                    <p className="text-base">{postWrite.freeQuestion}</p>
                                    <div className="mt-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveTab("chat")}
                                        >
                                            Répondre à la question gratuite
                                        </Button>
                                    </div>
                                </div>

                                <div className="rounded-lg border border-dashed p-4 bg-stone-50/60">
                                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                                        <Lock className="h-4 w-4" />
                                        <span>2 questions plus profondes (Pro)</span>
                                    </div>
                                    <ul className="space-y-2 text-base text-stone-500">
                                        <li>• {postWrite.lockedQuestions[0]}</li>
                                        <li>• {postWrite.lockedQuestions[1]}</li>
                                    </ul>
                                    <div className="mt-4 flex gap-3 flex-wrap">
                                        <Button asChild>
                                            <Link href="/pricing">Continuer avec Aurum (Pro)</Link>
                                        </Button>
                                        <p className="text-xs text-muted-foreground self-center">
                                            Chiffré. Privé. Non‑lu par des humains.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="chat" className="mt-6">
                    <AurumChat prompt={postWrite?.freeQuestion} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
