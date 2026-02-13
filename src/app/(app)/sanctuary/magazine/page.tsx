'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  BookImage,
  CalendarDays,
  LayoutGrid,
  PenSquare,
  Search,
  Star,
  List,
  SquarePen,
} from 'lucide-react';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
} from 'firebase/firestore';
import { useAuth } from '@/providers/auth-provider';
import { firestore as db } from '@/lib/firebase/web-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MagazineStats } from '@/components/sanctuary/magazine-stats';
import { MagazineTimeline } from '@/components/sanctuary/magazine-timeline';
import { MoodChart } from '@/components/sanctuary/mood-chart';
import { CollectionManager, type MagazineCollection } from '@/components/sanctuary/collection-manager';
import { InsightsPanel, type WritingPatterns } from '@/components/sanctuary/insights-panel';
import { WritingPrompt } from '@/components/sanctuary/writing-prompt';
import { MagazineThemePicker } from '@/components/sanctuary/magazine-theme-picker';
import { motion } from 'framer-motion';

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  createdAt: Date | null;
  mood: string | null;
};

type PeriodFilter = '7d' | '30d' | '3m' | '1y' | 'all';
type SortBy = 'date' | 'title';
type ViewMode = 'grid' | 'timeline' | 'calendar';
type ThemeTemplate = 'minimal' | 'elegant' | 'magazine' | 'zen';

const PAGE_SIZE = 20;
const moodToScore: Record<string, number> = {
  triste: 1,
  anxieux: 2,
  neutre: 3,
  calme: 4,
  joyeux: 5,
  energique: 5,
};
const moodToCardClass: Record<string, string> = {
  joyeux: 'border-l-4 border-l-yellow-400',
  calme: 'border-l-4 border-l-blue-400',
  anxieux: 'border-l-4 border-l-orange-400',
  triste: 'border-l-4 border-l-indigo-400',
  energique: 'border-l-4 border-l-green-400',
  neutre: 'border-l-4 border-l-stone-300',
};
const moodToChartColor: Record<string, string> = {
  joyeux: '#FACC15',
  calme: '#60A5FA',
  anxieux: '#FB923C',
  triste: '#818CF8',
  energique: '#4ADE80',
  neutre: '#A8A29E',
};

const themeCardClasses: Record<ThemeTemplate, string> = {
  minimal: 'rounded-3xl border border-stone-200 bg-white shadow-sm',
  elegant: 'rounded-[2.5rem] border border-stone-200 bg-white shadow-sm',
  magazine: 'rounded-2xl border border-stone-300 bg-white shadow-md',
  zen: 'rounded-3xl border border-stone-100 bg-stone-50 shadow-sm',
};

function parseCreatedAt(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const maybeToDate = (value as { toDate?: () => Date }).toDate;
    if (typeof maybeToDate === 'function') return maybeToDate();
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = Number((value as { seconds?: number }).seconds);
    if (!Number.isNaN(seconds)) return new Date(seconds * 1000);
  }
  return null;
}

function toIssue(docSnap: QueryDocumentSnapshot<DocumentData>): MagazineIssue {
  const data = docSnap.data() as Record<string, unknown>;
  return {
    id: docSnap.id,
    title: String(data.title || 'Entree'),
    excerpt: String(data.excerpt || ''),
    coverImageUrl: data.coverImageUrl ? String(data.coverImageUrl) : null,
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
    createdAt: parseCreatedAt(data.createdAt),
    mood: data.mood ? String(data.mood).toLowerCase() : null,
  };
}

function countWords(text: string): number {
  const cleaned = text.trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).length;
}

function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const uniqueDays = Array.from(
    new Set(
      dates.map((date) => {
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return d.getTime();
      }),
    ),
  ).sort((a, b) => b - a);

  let streak = 0;
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 0; i < uniqueDays.length; i += 1) {
    if (i === 0) {
      streak = 1;
      continue;
    }
    const delta = uniqueDays[i - 1] - uniqueDays[i];
    if (delta <= oneDayMs * 2) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}

export default function MagazinePage() {
  const { user, loading } = useAuth();
  const [issues, setIssues] = useState<MagazineIssue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [collections, setCollections] = useState<MagazineCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('all');
  const [patterns, setPatterns] = useState<WritingPatterns | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [digest, setDigest] = useState('');
  const [isDigestLoading, setIsDigestLoading] = useState(false);
  const [themeTemplate, setThemeTemplate] = useState<ThemeTemplate>('minimal');
  const loadMoreSentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchIssuesPage = useCallback(
    async ({ reset }: { reset: boolean }) => {
      if (!user) return;

      if (reset) {
        setIsLoadingIssues(true);
      } else {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
      }

      try {
        const issuesRef = collection(db, 'users', user.uid, 'magazineIssues');
        const q = reset || !lastDoc
          ? query(issuesRef, orderBy('createdAt', 'desc'), limit(PAGE_SIZE))
          : query(issuesRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));

        const snap = await getDocs(q);
        const nextBatch = snap.docs.map(toIssue);

        setLastDoc(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null);
        setHasMore(snap.docs.length === PAGE_SIZE);

        if (reset) {
          setIssues(nextBatch);
        } else {
          setIssues((prev) => {
            const seen = new Set(prev.map((issue) => issue.id));
            const merged = [...prev];
            for (const issue of nextBatch) {
              if (!seen.has(issue.id)) merged.push(issue);
            }
            return merged;
          });
        }
      } catch {
        if (reset) setIssues([]);
      } finally {
        if (reset) {
          setIsLoadingIssues(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [hasMore, isLoadingMore, lastDoc, user],
  );

  const fetchCollections = useCallback(async () => {
    if (!user) return;
    const collectionsRef = collection(db, 'users', user.uid, 'collections');
    const snap = await getDocs(collectionsRef);
    const nextCollections = snap.docs.map((docSnap) => {
      const data = docSnap.data() as Record<string, unknown>;
      return {
        id: docSnap.id,
        name: String(data.name || 'Collection'),
        color: String(data.color || '#C5A059'),
        entryIds: Array.isArray(data.entryIds) ? data.entryIds.map((id) => String(id)) : [],
      } satisfies MagazineCollection;
    });
    setCollections(nextCollections);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIssues([]);
      setCollections([]);
      setFavorites([]);
      setEntryCount(0);
      setIsLoadingIssues(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      setLastDoc(null);
      setHasMore(true);
      await fetchIssuesPage({ reset: true });
      await fetchCollections();

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (cancelled) return;

      const userData = userSnap.data() as { favorites?: string[]; entryCount?: number } | undefined;
      setFavorites(Array.isArray(userData?.favorites) ? userData.favorites : []);
      setEntryCount(typeof userData?.entryCount === 'number' ? userData.entryCount : 0);
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [fetchCollections, fetchIssuesPage, user]);

  useEffect(() => {
    if (!loadMoreSentinelRef.current || !hasMore || isLoadingIssues || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          void fetchIssuesPage({ reset: false });
        }
      },
      { rootMargin: '250px 0px' },
    );

    observer.observe(loadMoreSentinelRef.current);
    return () => observer.disconnect();
  }, [fetchIssuesPage, hasMore, isLoadingIssues, isLoadingMore]);

  useEffect(() => {
    const stored = window.localStorage.getItem('aurum:magazine-theme') as ThemeTemplate | null;
    if (stored && ['minimal', 'elegant', 'magazine', 'zen'].includes(stored)) {
      setThemeTemplate(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('aurum:magazine-theme', themeTemplate);
  }, [themeTemplate]);

  const allTags = useMemo(() => {
    return Array.from(new Set(issues.flatMap((issue) => issue.tags))).sort((a, b) => a.localeCompare(b));
  }, [issues]);

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId) || null,
    [collections, selectedCollectionId],
  );

  const filteredIssues = useMemo(() => {
    const now = new Date();
    const queryText = searchQuery.trim().toLowerCase();

    const minDateByPeriod: Record<Exclude<PeriodFilter, 'all'>, Date> = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '3m': new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      '1y': new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    };

    return issues
      .filter((issue) => {
        if (!queryText) return true;
        const haystack = `${issue.title} ${issue.excerpt}`.toLowerCase();
        return haystack.includes(queryText);
      })
      .filter((issue) => {
        if (selectedTags.length === 0) return true;
        return issue.tags.some((tag) => selectedTags.includes(tag));
      })
      .filter((issue) => {
        if (period === 'all' || !issue.createdAt) return true;
        return issue.createdAt >= minDateByPeriod[period];
      })
      .filter((issue) => {
        if (!selectedCollection || selectedCollectionId === 'all') return true;
        return selectedCollection.entryIds.includes(issue.id);
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        const dateA = a.createdAt ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt ? b.createdAt.getTime() : 0;
        return dateB - dateA;
      });
  }, [issues, period, searchQuery, selectedTags, sortBy, selectedCollection, selectedCollectionId]);

  const stats = useMemo(() => {
    const datedEntries = issues.filter((issue) => issue.createdAt).map((issue) => issue.createdAt as Date);
    const now = new Date();
    const thisMonthCount = datedEntries.filter(
      (date) => date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(),
    ).length;

    const avgWordsSource = issues
      .map((issue) => `${issue.title} ${issue.excerpt}`)
      .filter((text) => !text.includes('Entree chiffree'));
    const totalWords = avgWordsSource.reduce((sum, text) => sum + countWords(text), 0);

    return {
      totalEntries: entryCount || issues.length,
      streakDays: computeStreak(datedEntries),
      thisMonthCount,
      avgWords: avgWordsSource.length > 0 ? Math.round(totalWords / avgWordsSource.length) : 0,
    };
  }, [entryCount, issues]);

  const favoriteIssues = useMemo(() => {
    if (favorites.length === 0) return [];
    return filteredIssues.filter((issue) => favorites.includes(issue.id)).slice(0, 5);
  }, [favorites, filteredIssues]);

  const moodSeries = useMemo(() => {
    return filteredIssues
      .filter((issue) => issue.createdAt && issue.mood && moodToScore[issue.mood])
      .slice(0, 30)
      .reverse()
      .map((issue) => ({
        dateLabel: (issue.createdAt as Date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        score: moodToScore[issue.mood as string],
      }));
  }, [filteredIssues]);

  const moodDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const issue of filteredIssues) {
      const mood = issue.mood || 'neutre';
      counts.set(mood, (counts.get(mood) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([mood, value]) => ({
      mood,
      value,
      color: moodToChartColor[mood] || '#A8A29E',
    }));
  }, [filteredIssues]);

  const calendarDays = useMemo(() => {
    const dateCounts = new Map<string, number>();
    for (const issue of filteredIssues) {
      if (!issue.createdAt) continue;
      const key = `${issue.createdAt.getFullYear()}-${issue.createdAt.getMonth()}-${issue.createdAt.getDate()}`;
      dateCounts.set(key, (dateCounts.get(key) || 0) + 1);
    }

    const days: Array<{ label: string; count: number }> = [];
    for (let i = 83; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      days.push({
        label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        count: dateCounts.get(key) || 0,
      });
    }

    return days;
  }, [filteredIssues]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]));
  };

  const toggleFavorite = async (issueId: string) => {
    if (!user || favoriteLoadingIds.includes(issueId)) return;

    const isFavorite = favorites.includes(issueId);
    setFavoriteLoadingIds((prev) => [...prev, issueId]);
    setFavorites((prev) => (isFavorite ? prev.filter((id) => id !== issueId) : [...prev, issueId]));

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {}, { merge: true });
      await updateDoc(userRef, {
        favorites: isFavorite ? arrayRemove(issueId) : arrayUnion(issueId),
      });
    } catch {
      setFavorites((prev) => (isFavorite ? [...prev, issueId] : prev.filter((id) => id !== issueId)));
    } finally {
      setFavoriteLoadingIds((prev) => prev.filter((id) => id !== issueId));
    }
  };

  const createCollection = async (name: string, color: string) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'collections'), {
      name,
      color,
      entryIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await fetchCollections();
  };

  const deleteCollectionById = async (collectionId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'collections', collectionId));
    if (selectedCollectionId === collectionId) setSelectedCollectionId('all');
    await fetchCollections();
  };

  const toggleEntryInCollection = async (collectionId: string, entryId: string) => {
    if (!user) return;
    const target = collections.find((collectionItem) => collectionItem.id === collectionId);
    if (!target) return;
    const alreadyInCollection = target.entryIds.includes(entryId);

    await updateDoc(doc(db, 'users', user.uid, 'collections', collectionId), {
      entryIds: alreadyInCollection ? arrayRemove(entryId) : arrayUnion(entryId),
      updatedAt: serverTimestamp(),
    });

    await fetchCollections();
  };

  const handleAnalyzePatterns = async () => {
    if (!user || issues.length < 3) return;
    setIsAnalyzing(true);
    try {
      const payload = issues.slice(0, 30).map((issue) => ({
        id: issue.id,
        title: issue.title,
        excerpt: issue.excerpt,
        tags: issue.tags,
        mood: issue.mood,
        createdAt: issue.createdAt ? issue.createdAt.toISOString() : null,
      }));

      const response = await fetch('/api/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: payload, userId: user.uid }),
      });

      const data = await response.json();
      if (response.ok) {
        setPatterns(data as WritingPatterns);
      }
    } catch {
      // Keep UI silent on failure to avoid noisy UX.
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDigest = async () => {
    if (!user || issues.length === 0) return;
    setIsDigestLoading(true);
    try {
      const payload = issues.slice(0, 30).map((issue) => ({
        id: issue.id,
        title: issue.title,
        excerpt: issue.excerpt,
        tags: issue.tags,
        mood: issue.mood,
        createdAt: issue.createdAt ? issue.createdAt.toISOString() : null,
      }));

      const response = await fetch('/api/generate-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: payload, userId: user.uid }),
      });
      const data = (await response.json()) as { digest?: string };
      if (response.ok && data.digest) setDigest(data.digest);
    } catch {
      // Keep UI silent on failure to avoid noisy UX.
    } finally {
      setIsDigestLoading(false);
    }
  };

  const smartPrompts = useMemo(() => {
    const prompts: string[] = [];

    const lastEntryDate = issues
      .filter((issue) => issue.createdAt)
      .map((issue) => issue.createdAt as Date)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    if (lastEntryDate) {
      const daysSince = Math.floor((Date.now() - lastEntryDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysSince >= 3) {
        prompts.push("Cela fait quelques jours sans ecriture. Qu'est-ce qui t'a marque recemment ?");
      }
    }

    if (patterns?.themes?.[0]) {
      prompts.push(`Tu reviens souvent sur "${patterns.themes[0].name}". Que veux-tu approfondir sur ce theme ?`);
    }

    if (stats.thisMonthCount > 0) {
      prompts.push(`Tu as ecrit ${stats.thisMonthCount} fois ce mois-ci. Quelle intention pour ta prochaine entree ?`);
    }

    return prompts.slice(0, 3);
  }, [issues, patterns, stats.thisMonthCount]);

  if (loading || isLoadingIssues) {
    return (
      <div className="container max-w-7xl space-y-6 py-8 md:py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-[340px] rounded-3xl" />
          <Skeleton className="h-[340px] rounded-3xl" />
          <Skeleton className="h-[340px] rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8 md:py-12">
      <header className="mb-10 space-y-2">
        <h1 className="font-headline text-4xl tracking-tight text-stone-900">Magazine</h1>
        <p className="text-stone-600">Tes pensees en vue editoriale: image a la une, extrait, memoire.</p>
      </header>

      {issues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <BookImage className="h-6 w-6 text-stone-500" />
          </div>
          <p className="text-stone-700">Aucune edition pour l'instant.</p>
          <p className="mt-1 text-sm text-stone-500">Ecris une entree avec une image pour composer ton magazine.</p>
          <Button asChild className="mt-5 bg-stone-900 text-stone-50 hover:bg-stone-800">
            <Link href="/sanctuary/write">
              <PenSquare className="mr-2 h-4 w-4" />
              Ecrire une entree
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <MagazineStats
            totalEntries={stats.totalEntries}
            streakDays={stats.streakDays}
            thisMonthCount={stats.thisMonthCount}
            avgWords={stats.avgWords}
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
            <MoodChart last30Days={moodSeries} distribution={moodDistribution} />
            <CollectionManager
              collections={collections}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={setSelectedCollectionId}
              onCreateCollection={createCollection}
              onDeleteCollection={deleteCollectionById}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <InsightsPanel
              patterns={patterns}
              digest={digest}
              isAnalyzing={isAnalyzing}
              isDigestLoading={isDigestLoading}
              onAnalyze={handleAnalyzePatterns}
              onGenerateDigest={handleGenerateDigest}
            />
            <WritingPrompt prompts={smartPrompts} />
            <MagazineThemePicker value={themeTemplate} onChange={setThemeTemplate} />
          </div>

          {favoriteIssues.length > 0 && (
            <section className="rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/5 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A5D24]">Highlights</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {favoriteIssues.map((issue) => (
                  <Link
                    key={`favorite-${issue.id}`}
                    href={`/sanctuary/magazine/${issue.id}`}
                    className="rounded-full border border-[#C5A059]/40 bg-white px-3 py-1 text-xs text-stone-700 hover:border-[#C5A059]"
                  >
                    ★ {issue.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un titre ou un extrait..."
                  className="h-10 w-full rounded-xl border border-stone-300 bg-stone-50 pl-9 pr-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-[#C5A059] focus:bg-white"
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-stone-600">
                {sortBy === 'date' ? <ArrowDownWideNarrow className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="h-10 rounded-xl border border-stone-300 bg-stone-50 px-3 text-sm text-stone-900 outline-none transition-colors focus:border-[#C5A059] focus:bg-white"
                >
                  <option value="date">Tri: Date recente</option>
                  <option value="title">Tri: Titre A-Z</option>
                </select>
              </label>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
                className="h-10 rounded-xl border border-stone-300 bg-stone-50 px-3 text-sm text-stone-900 outline-none transition-colors focus:border-[#C5A059] focus:bg-white"
              >
                <option value="all">Periode: Tout</option>
                <option value="7d">Derniers 7 jours</option>
                <option value="30d">Derniers 30 jours</option>
                <option value="3m">3 derniers mois</option>
                <option value="1y">Derniere annee</option>
              </select>

              <div className="inline-flex rounded-xl border border-stone-300 bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg px-2 py-1 ${viewMode === 'grid' ? 'bg-white text-stone-900' : 'text-stone-500'}`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('timeline')}
                  className={`rounded-lg px-2 py-1 ${viewMode === 'timeline' ? 'bg-white text-stone-900' : 'text-stone-500'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`rounded-lg px-2 py-1 ${viewMode === 'calendar' ? 'bg-white text-stone-900' : 'text-stone-500'}`}
                >
                  <CalendarDays className="h-4 w-4" />
                </button>
              </div>
            </div>

            {allTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? 'border-[#C5A059] bg-[#C5A059]/10 text-[#7A5D24]'
                          : 'border-stone-300 bg-stone-50 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {filteredIssues.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <BookImage className="h-6 w-6 text-stone-500" />
              </div>
              <p className="text-stone-700">Aucune edition ne correspond a tes filtres.</p>
              <p className="mt-1 text-sm text-stone-500">Ajuste ta recherche, les tags ou la periode.</p>
            </div>
          ) : viewMode === 'timeline' ? (
            <MagazineTimeline issues={filteredIssues} favorites={favorites} />
          ) : viewMode === 'calendar' ? (
            <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">Calendrier d'ecriture (12 semaines)</p>
              <div className="mt-4 grid grid-cols-12 gap-2">
                {calendarDays.map((day) => {
                  const intensity = day.count >= 4 ? 'bg-[#C5A059]' : day.count >= 3 ? 'bg-[#C5A059]/70' : day.count >= 2 ? 'bg-[#C5A059]/40' : day.count >= 1 ? 'bg-[#C5A059]/20' : 'bg-stone-100';
                  return (
                    <div key={day.label} title={`${day.label} • ${day.count} entree(s)`} className={`h-5 w-5 rounded ${intensity} border border-stone-200`} />
                  );
                })}
              </div>
            </section>
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.06 } },
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredIssues.map((issue) => {
                const isFavorite = favorites.includes(issue.id);
                const isFavoriteLoading = favoriteLoadingIds.includes(issue.id);
                const moodClass = issue.mood ? moodToCardClass[issue.mood] : '';
                const issueCollections = collections.filter((collectionItem) => collectionItem.entryIds.includes(issue.id));

                return (
                  <Link key={issue.id} href={`/sanctuary/magazine/${issue.id}`} className="group block">
                    <motion.article
                      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                      className={`overflow-hidden ${themeCardClasses[themeTemplate]} transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md ${moodClass}`}
                    >
                      <div className="relative aspect-[16/10] w-full bg-stone-100">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void toggleFavorite(issue.id);
                          }}
                          disabled={isFavoriteLoading}
                          className={`absolute right-3 top-3 z-10 rounded-full border bg-white/90 p-2 shadow-sm transition-colors ${
                            isFavorite
                              ? 'border-[#C5A059] text-[#C5A059]'
                              : 'border-stone-200 text-stone-500 hover:text-[#C5A059]'
                          }`}
                          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <Star className={`h-4 w-4 ${isFavorite ? 'fill-[#C5A059]' : ''}`} />
                        </button>

                        <div className="absolute left-3 top-3 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              window.location.assign(`/sanctuary/magazine/${issue.id}`);
                            }}
                            className="rounded-full border border-stone-200 bg-white/90 p-2 text-stone-600 shadow-sm hover:text-[#C5A059]"
                            aria-label="Editer"
                          >
                            <SquarePen className="h-4 w-4" />
                          </button>
                        </div>

                        {issue.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={issue.coverImageUrl} alt={issue.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-stone-400">
                            <BookImage className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="line-clamp-2 font-headline text-2xl text-stone-900">{issue.title}</h2>
                          {isFavorite && (
                            <span className="rounded-full bg-[#C5A059]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#7A5D24]">
                              Favori
                            </span>
                          )}
                        </div>

                        {issue.excerpt && issue.excerpt !== issue.title && (
                          <p className="line-clamp-4 text-sm leading-relaxed text-stone-600">{issue.excerpt}</p>
                        )}

                        {issueCollections.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {issueCollections.map((collectionItem) => (
                              <button
                                key={`${issue.id}-${collectionItem.id}`}
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  void toggleEntryInCollection(collectionItem.id, issue.id);
                                }}
                                className="rounded-full border border-stone-300 bg-stone-50 px-2 py-1 text-[10px] uppercase tracking-[0.15em] text-stone-600"
                              >
                                {collectionItem.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {selectedCollectionId !== 'all' && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              void toggleEntryInCollection(selectedCollectionId, issue.id);
                            }}
                            className="rounded-xl border border-[#C5A059]/40 bg-[#C5A059]/10 px-3 py-1 text-xs text-[#7A5D24]"
                          >
                            {selectedCollection?.entryIds.includes(issue.id) ? 'Retirer de la collection' : 'Ajouter a la collection'}
                          </button>
                        )}
                      </div>
                    </motion.article>
                  </Link>
                );
              })}
            </motion.div>
          )}

          <p className="text-xs text-stone-500">Resultats: {filteredIssues.length}</p>

          {isLoadingMore && viewMode === 'grid' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Skeleton className="h-[340px] rounded-3xl" />
              <Skeleton className="h-[340px] rounded-3xl" />
              <Skeleton className="h-[340px] rounded-3xl" />
            </div>
          )}

          {viewMode === 'grid' && <div ref={loadMoreSentinelRef} className="h-1 w-full" aria-hidden="true" />}
          {viewMode === 'grid' && !hasMore && <p className="text-center text-xs text-stone-500">Toutes les entrees sont chargees.</p>}
        </div>
      )}
    </div>
  );
}
