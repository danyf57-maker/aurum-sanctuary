'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { getEntries } from '@/lib/firebase/firestore';
import { JournalEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JournalCard } from '@/components/journal/journal-card';
import { SentimentChart } from '@/components/journal/sentiment-chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, Smile } from 'lucide-react';

function getMostCommonMood(entries: JournalEntry[]): string {
    if (entries.length === 0) return 'N/A';
    const moodCounts = entries.reduce((acc, entry) => {
        const mood = entry.mood || 'Inconnu';
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(moodCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
}


export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                redirect('/');
            } else {
                getEntries(user.uid).then(userEntries => {
                    setEntries(userEntries);
                    setLoading(false);
                });
            }
        }
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="container max-w-7xl py-8 md:py-12">
                <div className="space-y-12">
                    <Skeleton className="h-10 w-1/3" />
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                    <Skeleton className="h-[350px] w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-[220px] w-full" /> ))}
                    </div>
                </div>
            </div>
        );
    }
    
    if (!user) {
        // This is a fallback, the useEffect hook should have already redirected.
        return null;
    }
    
    const mostCommonMood = getMostCommonMood(entries);

    return (
        <div className="container max-w-7xl py-8 md:py-12">
            <header className="mb-12">
                <h1 className="text-4xl font-bold font-headline tracking-tight">
                    Tableau de bord
                </h1>
                <p className="mt-2 text-muted-foreground">Ravi de vous revoir, {user.displayName || 'cher explorateur'}.</p>
            </header>

            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-headline font-semibold mb-4">Vos Statistiques</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Entrées Totales
                                </CardTitle>
                                <Book className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{entries.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Continuez votre voyage intérieur.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Humeur Dominante</CardTitle>
                                <Smile className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold capitalize">{mostCommonMood}</div>
                                <p className="text-xs text-muted-foreground">
                                    Basé sur vos dernières entrées.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
                
                <section>
                    <SentimentChart entries={entries} />
                </section>

                <section>
                    <h2 className="text-2xl font-headline font-semibold mb-4">Historique des Entrées</h2>
                    {entries.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {entries.map((entry, i) => (
                                <JournalCard key={entry.id} entry={entry} style={{ animationDelay: `${i * 50}ms` }} className="animate-fade-in" />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center">
                            <h3 className="text-xl font-semibold">Aucune entrée pour le moment.</h3>
                            <p className="text-muted-foreground mt-2">Votre voyage commence avec le premier mot que vous écrivez.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
