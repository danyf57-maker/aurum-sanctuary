
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { JournalCard } from '@/components/journal/journal-card';
import { SentimentChart } from '@/components/journal/sentiment-chart';
import { TagFilter } from '@/components/journal/tag-filter';
import { Button } from '@/components/ui/button';
import { getEntries, getUniqueTags } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { JournalEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import placeholderImages from '@/lib/placeholder-images.json';
import { PenSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

function SanctuaryPageContent() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const tag = searchParams.get('tag');

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (user) {
                setLoading(true);
                const [userEntries, userTags] = await Promise.all([
                    getEntries(user.uid, tag),
                    getUniqueTags(user.uid)
                ]);
                setEntries(userEntries);
                setTags(userTags);
                setLoading(false);
            } else if (!authLoading) {
                setLoading(false);
            }
        }
        fetchData();
    }, [user, authLoading, tag]);

    if (authLoading || (loading && user)) {
        return (
            <div className="container max-w-7xl py-8 md:py-12">
                <div className="mb-8 flex justify-between items-center">
                    <Skeleton className="h-10 w-[200px]" />
                </div>
                <div className="space-y-12">
                     <Skeleton className="h-[350px] w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-[220px] w-full" /> ))}
                    </div>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return (
            <div className="container max-w-4xl py-20 text-center animate-fade-in">
                <h2 className="text-3xl font-bold font-headline">Cet espace est sacré.</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Veuillez vous connecter pour accéder à votre sanctuaire privé.
                </p>
                <Button asChild className="mt-6 bg-stone-600 text-white hover:bg-stone-700">
                    <Link href="/sanctuary/write">Rédiger une entrée pour commencer</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
        <div className="container max-w-7xl py-8 md:py-12">
            <header className="mb-12 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                        <h1 className="text-4xl font-bold font-headline tracking-tight">
                           Votre Journal
                        </h1>
                        <p className="mt-2 text-muted-foreground">Bienvenue dans votre sanctuaire, {user.displayName || 'cher explorateur'}.</p>
                    </div>
                </div>
                 <div className="mt-8">
                    <TagFilter tags={tags} />
                </div>
            </header>

            {entries.length > 0 ? (
                <div className="space-y-12">
                    <div className="animate-fade-in" style={{ animationDelay: '150ms' }}><SentimentChart entries={entries} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {entries.map((entry, i) => (
                            <JournalCard key={entry.id} entry={entry} style={{ animationDelay: `${200 + i * 50}ms` }} className="animate-fade-in" />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg animate-fade-in flex flex-col items-center">
                    <Image
                        src={placeholderImages['sanctuary-empty'].src}
                        alt={placeholderImages['sanctuary-empty'].alt}
                        width={placeholderImages['sanctuary-empty'].width}
                        height={placeholderImages['sanctuary-empty'].height}
                        data-ai-hint={placeholderImages['sanctuary-empty'].hint}
                        className="max-w-sm w-full h-auto rounded-lg mb-8 opacity-80"
                    />
                    <h3 className="text-xl font-semibold">Votre sanctuaire attend.</h3>
                    <p className="text-muted-foreground mt-2">Le voyage de mille lieues commence par un seul mot.</p>
                </div>
            )}
        </div>
        <Button asChild className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-stone-600 text-white hover:bg-stone-700">
            <Link href="/sanctuary/write" aria-label="Rédiger une nouvelle entrée">
                <PenSquare className="h-6 w-6" />
            </Link>
        </Button>
        </>
    );
}

export default function SanctuaryPage() {
    return (
        <Suspense fallback={<div className="container max-w-7xl py-8 md:py-12"><div className="mb-8 flex justify-between items-center"><Skeleton className="h-10 w-[200px]" /></div><div className="space-y-12"><Skeleton className="h-[350px] w-full" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => ( <Skeleton key={i} className="h-[220px] w-full" /> ))}</div></div></div>}>
            <SanctuaryPageContent />
        </Suspense>
    )
}
