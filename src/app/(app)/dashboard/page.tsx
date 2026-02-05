
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { getEntries } from '@/lib/firebase/firestore';
import { JournalEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ShieldAlert, PenSquare, ArrowRight, Sparkles } from 'lucide-react';
import { StatsSummaryCards } from '@/components/stats/stats-summary-cards';
import { EntryHeatmap } from '@/components/stats/entry-heatmap';
import { ClarityScoreCard } from '@/components/dashboard/clarity-score-card';
import { LastInsightCard } from '@/components/dashboard/last-insight-card';
import { motion } from 'framer-motion';

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
            <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <div className="grid gap-6 md:grid-cols-3">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="p-4 rounded-full bg-red-50 text-red-600 mb-6">
                    <ShieldAlert className="h-12 w-12" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Accès restreint</h1>
                <p className="text-stone-500 mb-8 max-w-sm">
                    Vous devez être connecté pour accéder à votre centre de commande.
                </p>
                <Button asChild size="lg">
                    <Link href="/login">Se connecter</Link>
                </Button>
            </div>
        );
    }

    const lastEntryWithAnalysis = entries.find(e => e.insight) || entries[0];

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                >
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-stone-900">
                        Command Center
                    </h1>
                    <p className="text-stone-500 font-medium">
                        Heureux de vous revoir, {user?.displayName?.split(' ')[0] || 'Daniel'}.
                    </p>
                </motion.div>

                <Button asChild size="lg" className="bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-xl px-8 shadow-xl hover:shadow-2xl transition-all group">
                    <Link href="/sanctuary/write">
                        <PenSquare className="h-4 w-4 mr-2" />
                        Ouvrir la Forge
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </header>

            <div className="grid gap-8">
                {/* 1. Main Insight / Clarity Score */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <ClarityScoreCard entries={entries} />
                </motion.div>

                <div className="grid gap-8 md:grid-cols-12">
                    {/* 2. Last AI Insight (L'Écho) */}
                    <motion.div 
                        className="md:col-span-8"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {lastEntryWithAnalysis ? (
                            <LastInsightCard entry={lastEntryWithAnalysis} />
                        ) : (
                            <div className="h-full rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center p-8 text-center bg-stone-50">
                                <Sparkles className="h-8 w-8 text-stone-300 mb-4" />
                                <h3 className="font-bold text-stone-400">Aucun Écho</h3>
                                <p className="text-sm text-stone-400 mt-1 max-w-[200px]">Écrivez pour recevoir une analyse de l'IA.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* 3. Quick Stats (Compact) */}
                    <motion.div 
                        className="md:col-span-4 space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <StatsSummaryCards entries={entries} layout="stack" />
                    </motion.div>
                </div>

                {/* 4. Activity Heatmap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/50 p-6 rounded-2xl border border-border/40"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-sm uppercase tracking-widest text-stone-500">Fréquence d'introspection</h3>
                        <Link href="/insights" className="text-xs font-bold text-amber-600 hover:underline">Voir les analyses complètes</Link>
                    </div>
                    <EntryHeatmap entries={entries} />
                </motion.div>
            </div>
        </div>
    );
}
