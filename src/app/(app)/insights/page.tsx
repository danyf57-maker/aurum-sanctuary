
'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/web-client';
import { getEntries } from '@/lib/firebase/firestore';
import { useAuth } from '@/providers/auth-provider';
import { useSubscription } from '@/hooks/useSubscription';
import { InsightCard } from '@/components/insights/InsightCard';
import { PaywallModal } from '@/components/paywall/PaywallModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, TrendingUp, PieChart, Compass, Eye } from 'lucide-react';
import { MoodTrendsChart } from '@/components/stats/mood-trends-chart';
import { SentimentPieChart } from '@/components/stats/sentiment-pie-chart';
import { SentimentChart } from '@/components/journal/sentiment-chart';
import { JournalEntry } from '@/lib/types';
import { motion } from 'framer-motion';

interface Insight {
    id: string;
    insightText: string;
    periodStart: Date;
    periodEnd: Date;
    createdAt: Date;
    status: 'ready' | 'viewed';
}

export default function InsightsPage() {
    const { user, loading: authLoading } = useAuth();
    const { isPremium, loading: subscriptionLoading } = useSubscription();
    const [insights, setInsights] = useState<Insight[]>([]);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaywallOpen, setIsPaywallOpen] = useState(false);

    useEffect(() => {
        if (!user || authLoading) return;

        const fetchData = async () => {
            try {
                // Fetch Weekly Insights
                const insightsRef = collection(firestore, 'users', user.uid, 'insights');
                const q = query(insightsRef, orderBy('periodStart', 'desc'));
                
                const [insightSnap, userEntries] = await Promise.all([
                    getDocs(q),
                    getEntries(user.uid)
                ]);

                const fetchedInsights: Insight[] = insightSnap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        insightText: data.insightText,
                        periodStart: data.periodStart?.toDate() || new Date(),
                        periodEnd: data.periodEnd?.toDate() || new Date(),
                        createdAt: data.createdAt?.toDate() || new Date(),
                        status: data.status || 'ready',
                    };
                });

                setInsights(fetchedInsights);
                setEntries(userEntries);
            } catch (error) {
                console.error('Error fetching insights data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading]);

    if (loading || authLoading || subscriptionLoading) {
        return (
            <div className="container max-w-6xl mx-auto px-4 py-12 space-y-12">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64" />
                    <Skeleton className="h-6 w-full max-w-md" />
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                    <Skeleton className="h-[400px] rounded-2xl" />
                    <Skeleton className="h-[400px] rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-6xl mx-auto px-4 py-12">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold font-headline tracking-tight text-stone-900">
                        L'Écho Aurum
                    </h1>
                    <p className="text-stone-500 mt-2 font-medium">
                        Perspective approfondie sur vos schémas émotionnels et cognitifs.
                    </p>
                </div>
                {isPremium && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full">
                        <Crown className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-bold text-amber-700">Premium</span>
                    </div>
                )}
            </header>

            <div className="space-y-16">
                {/* 1. Visual Analytics Section */}
                <section className="space-y-8">
                    <div className="flex items-center gap-2 text-stone-400">
                        <TrendingUp className="h-4 w-4" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Trajectoires Émotionnelles</h2>
                    </div>
                    
                    <div className="grid gap-8 lg:grid-cols-2">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white/50 p-6 rounded-2xl border border-border/40 shadow-sm"
                        >
                            <MoodTrendsChart entries={entries} days={30} />
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/50 p-6 rounded-2xl border border-border/40 shadow-sm"
                        >
                            <SentimentPieChart entries={entries} />
                        </motion.div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/50 p-6 rounded-2xl border border-border/40 shadow-sm"
                    >
                        <SentimentChart entries={entries} />
                    </motion.div>
                </section>

                {/* 2. Weekly Insights (Synthesis) */}
                <section className="space-y-8">
                    <div className="flex items-center gap-2 text-stone-400">
                        <Compass className="h-4 w-4" />
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em]">Synthèses Hebdomadaires</h2>
                    </div>

                    {insights.length > 0 ? (
                        <div className="grid gap-6">
                            {insights.map((insight, i) => (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <InsightCard
                                        insight={insight}
                                        isPremium={isPremium}
                                        onShowPaywall={() => setIsPaywallOpen(true)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center">
                            <Eye className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-stone-400">En attente de données</h3>
                            <p className="text-stone-400 text-sm mt-2 max-w-md mx-auto">
                                Continuez à écrire pendant 7 jours pour générer votre première synthèse hebdomadaire.
                            </p>
                            <p className="text-stone-400 text-xs mt-3 italic">
                                &ldquo;Un mot après l&apos;autre.&rdquo; - Margaret Atwood
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <PaywallModal
                isOpen={isPaywallOpen}
                onClose={() => setIsPaywallOpen(false)}
            />
        </div>
    );
}
