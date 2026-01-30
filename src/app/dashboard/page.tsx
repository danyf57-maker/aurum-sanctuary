'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { getEntries } from '@/lib/firebase/firestore';
import { JournalEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldAlert, PenSquare } from 'lucide-react';
import { StatsSummaryCards } from '@/components/stats/stats-summary-cards';
import { MoodTrendsChart } from '@/components/stats/mood-trends-chart';
import { SentimentPieChart } from '@/components/stats/sentiment-pie-chart';
import { EntryHeatmap } from '@/components/stats/entry-heatmap';
import { SentimentChart } from '@/components/journal/sentiment-chart';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            return;
        }

        async function fetchEntries() {
            if (!user) return;
            try {
                const userEntries = await getEntries(user.uid);
                setEntries(userEntries);
            } catch (error) {
                console.error('Failed to fetch entries:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchEntries();
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Skeleton className="h-12 w-[300px] mb-8" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-[120px]" />
                    ))}
                </div>
                <div className="grid gap-6 md:grid-cols-2 mb-8">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-[350px]" />
                    ))}
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container max-w-2xl mx-auto py-20 md:py-28 text-center">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Accès restreint</AlertTitle>
                    <AlertDescription>
                        Vous devez être connecté pour voir votre tableau de bord.
                    </AlertDescription>
                </Alert>
                <Button asChild className="mt-6">
                    <Link href="/login">Se connecter</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <header className="mb-12">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                        <h1 className="text-4xl font-bold font-headline tracking-tight">
                            Tableau de Bord
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Bonjour, {user?.displayName?.split(' ')[0] || 'Voyageur'}. Voici vos statistiques.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/sanctuary/write">
                            <PenSquare className="h-4 w-4 mr-2" />
                            Nouvelle Entrée
                        </Link>
                    </Button>
                </div>
            </header>

            {entries.length > 0 ? (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="animate-fade-in">
                        <StatsSummaryCards entries={entries} />
                    </div>

                    {/* Main Charts Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                            <MoodTrendsChart entries={entries} days={30} />
                        </div>
                        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                            <SentimentPieChart entries={entries} />
                        </div>
                    </div>

                    {/* Mood Distribution */}
                    <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <SentimentChart entries={entries} />
                    </div>

                    {/* Heatmap */}
                    <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
                        <EntryHeatmap entries={entries} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Commencez votre voyage</h3>
                    <p className="text-muted-foreground mt-2 mb-6">
                        Écrivez votre première entrée pour voir vos statistiques.
                    </p>
                    <Button asChild>
                        <Link href="/sanctuary/write">
                            <PenSquare className="h-4 w-4 mr-2" />
                            Écrire maintenant
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}