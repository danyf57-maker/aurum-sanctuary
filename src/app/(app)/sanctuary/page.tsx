'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { JournalMagazineCard } from '@/components/journal/journal-magazine-card';
import { TagFilter } from '@/components/journal/tag-filter';
import { Button } from '@/components/ui/button';
import { getEntries, getUniqueTags } from '@/lib/firebase/firestore';
import { useAuth } from '@/providers/auth-provider';
import { JournalEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import placeholderImages from '@/lib/placeholder-images.json';
import { PenSquare, ShieldAlert, Sparkles, BookOpen, Flame, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore as db } from '@/lib/firebase/web-client';

export const dynamic = 'force-dynamic';

type AurumExchange = {
  id: string;
  role: 'user' | 'aurum';
  text: string;
  createdAt: Date;
};

async function getAurumExchanges(userId: string, entryId: string): Promise<AurumExchange[]> {
  try {
    const conversationRef = collection(db, 'users', userId, 'entries', entryId, 'aurumConversation');
    const q = query(conversationRef, orderBy('createdAt', 'desc'), limit(3));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role === 'user' ? 'user' : 'aurum',
        text: String(data.text || ''),
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  } catch (error) {
    console.error('Failed to fetch Aurum exchanges:', error);
    return [];
  }
}

function AurumExchangePreview({ exchanges }: { exchanges: AurumExchange[] }) {
  const aurumMessages = exchanges.filter((e) => e.role === 'aurum');
  if (aurumMessages.length === 0) return null;

  const latestAurum = aurumMessages[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border border-amber-200/30 bg-gradient-to-br from-amber-50/60 to-stone-50/40 p-4"
    >
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs font-medium uppercase tracking-wider text-amber-700">
          Réflexion d&apos;Aurum
        </span>
      </div>
      <p className="line-clamp-3 text-sm leading-relaxed text-stone-700">{latestAurum.text}</p>
    </motion.div>
  );
}

function EntryWithExchange({
  entry,
  index,
  userId,
}: {
  entry: JournalEntry;
  index: number;
  userId: string;
}) {
  const [exchanges, setExchanges] = useState<AurumExchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExchanges() {
      setLoading(true);
      const data = await getAurumExchanges(userId, entry.id);
      setExchanges(data);
      setLoading(false);
    }
    fetchExchanges();
  }, [userId, entry.id]);

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      className="flex flex-col"
    >
      <JournalMagazineCard entry={entry} index={index} />
      {!loading && exchanges.length > 0 && <AurumExchangePreview exchanges={exchanges} />}
    </motion.div>
  );
}

function computeStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  const uniqueDays = Array.from(
    new Set(
      entries.map((e) => {
        const d = new Date(e.createdAt);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      }),
    ),
  ).sort((a, b) => b - a);

  let streak = 1;
  const oneDay = 24 * 60 * 60 * 1000;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] <= oneDay * 2) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function SanctuaryPageContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag');
  const { toast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!user) {
      setLoading(false);
      setEntries([]);
      setTags([]);
      return;
    }

    setLoading(true);
    async function fetchData() {
      if (!user) {
        setEntries([]);
        setTags([]);
        setLoading(false);
        return;
      }
      try {
        const [userEntries, userTags] = await Promise.all([
          getEntries(user.uid, tag),
          getUniqueTags(user.uid),
        ]);
        setEntries(userEntries);
        setTags(userTags);
      } catch (error) {
        console.error('Failed to fetch sanctuary data:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger votre journal.',
          variant: 'destructive',
        });
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, authLoading, tag, toast]);

  // Stats
  const totalEntries = entries?.length ?? 0;
  const now = new Date();
  const thisMonthCount = entries?.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length ?? 0;
  const streak = entries ? computeStreak(entries) : 0;

  if (loading || authLoading) {
    return (
      <div className="container max-w-7xl py-8 md:py-12">
        <Skeleton className="mb-2 h-10 w-48" />
        <Skeleton className="mb-8 h-5 w-72" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[340px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl py-20 text-center md:py-28">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Accès restreint</AlertTitle>
          <AlertDescription>Vous devez être connecté pour voir votre historique.</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/sanctuary/write">Commencer à écrire</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container max-w-7xl py-8 md:py-12">
        {/* Header portfolio */}
        <header className="mb-10">
          <h1 className="font-headline text-4xl tracking-tight text-stone-900">Journal</h1>
          {totalEntries > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                {totalEntries} entrée{totalEntries > 1 ? 's' : ''}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {thisMonthCount} ce mois
              </span>
              {streak > 1 && (
                <span className="inline-flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-400" />
                  {streak} jours de suite
                </span>
              )}
            </div>
          )}
          {tags.length > 0 && (
            <div className="mt-5">
              <TagFilter tags={tags} />
            </div>
          )}
        </header>

        {entries && entries.length > 0 ? (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.07 } },
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {entries.map((entry, i) => (
              <EntryWithExchange key={entry.id} entry={entry} index={i} userId={user.uid} />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-stone-300 py-20 text-center">
            <Image
              src={placeholderImages['sanctuary-empty'].src}
              alt={placeholderImages['sanctuary-empty'].alt}
              width={placeholderImages['sanctuary-empty'].width}
              height={placeholderImages['sanctuary-empty'].height}
              data-ai-hint={placeholderImages['sanctuary-empty'].hint}
              className="mb-8 h-auto w-full max-w-sm rounded-lg opacity-80"
            />
            <h3 className="text-xl font-semibold">Votre sanctuaire attend.</h3>
            <p className="mt-2 text-muted-foreground">
              Le voyage de mille lieues commence par un seul mot.
            </p>
          </div>
        )}
      </div>
      <Button
        asChild
        className="fixed bottom-20 right-6 h-14 w-14 rounded-full bg-[#C5A059] text-white shadow-lg hover:bg-[#b08d4a] lg:bottom-8 lg:right-8 lg:h-16 lg:w-16"
      >
        <Link href="/sanctuary/write" aria-label="Rédiger une nouvelle entrée">
          <PenSquare className="h-6 w-6" />
        </Link>
      </Button>
    </>
  );
}

export default function SanctuaryPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-7xl py-8 md:py-12">
          <Skeleton className="mb-2 h-10 w-48" />
          <Skeleton className="mb-8 h-5 w-72" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[340px] rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <SanctuaryPageContent />
    </Suspense>
  );
}
