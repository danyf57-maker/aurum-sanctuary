"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BookImage, PenSquare } from "lucide-react";
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
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import { firestore as db } from "@/lib/firebase/web-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MagazineStats } from "@/components/sanctuary/magazine-stats";
import { MoodChart } from "@/components/sanctuary/mood-chart";
import {
  CollectionManager,
  type MagazineCollection,
} from "@/components/sanctuary/collection-manager";
import {
  InsightsPanel,
  type WritingPatterns,
} from "@/components/sanctuary/insights-panel";
import { WritingPrompt } from "@/components/sanctuary/writing-prompt";
import { MagazineThemePicker } from "@/components/sanctuary/magazine-theme-picker";

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  createdAt: Date | null;
  mood: string | null;
};

type ThemeTemplate = "minimal" | "elegant" | "magazine" | "zen";

const PAGE_SIZE = 20;
const moodToScore: Record<string, number> = {
  triste: 1,
  anxieux: 2,
  neutre: 3,
  calme: 4,
  joyeux: 5,
  energique: 5,
};
const moodToChartColor: Record<string, string> = {
  joyeux: "#FACC15",
  calme: "#60A5FA",
  anxieux: "#FB923C",
  triste: "#818CF8",
  energique: "#4ADE80",
  neutre: "#A8A29E",
};

function parseCreatedAt(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const maybeToDate = (value as { toDate?: () => Date }).toDate;
    // Appeler toDate avec le contexte (this) pour éviter l'erreur "Cannot read properties of undefined (reading 'toMillis')"
    if (typeof maybeToDate === "function") {
      try {
        return (value as { toDate: () => Date }).toDate();
      } catch (e) {
        console.warn("[parseCreatedAt] Failed to call toDate:", e);
        return null;
      }
    }
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    const seconds = Number((value as { seconds?: number }).seconds);
    if (!Number.isNaN(seconds)) return new Date(seconds * 1000);
  }
  return null;
}

function toIssue(docSnap: QueryDocumentSnapshot<DocumentData>): MagazineIssue {
  const data = docSnap.data() as Record<string, unknown>;
  return {
    id: docSnap.id,
    title: String(data.title || "Entree"),
    excerpt: String(data.excerpt || ""),
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
      })
    )
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

function stripImageMarkdown(content: string) {
  return content
    .replace(/!\[[^\]]*]\(([^)]+)\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateIssueTitle(content: string) {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Entree";
  return words.slice(0, 8).join(" ") + (words.length > 8 ? "..." : "");
}

function generateIssueExcerpt(content: string, maxLength = 170) {
  const plain = stripImageMarkdown(content);
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}

export default function MagazinePage() {
  const { user, loading } = useAuth();
  const [issues, setIssues] = useState<MagazineIssue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [entryCount, setEntryCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [collections, setCollections] = useState<MagazineCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("all");
  const [patterns, setPatterns] = useState<WritingPatterns | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [digest, setDigest] = useState("");
  const [isDigestLoading, setIsDigestLoading] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [themeTemplate, setThemeTemplate] = useState<ThemeTemplate>("minimal");
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  const fetchIssuesPage = useCallback(
    async ({ reset }: { reset: boolean }) => {
      if (!user) return;

      if (reset) {
        setIsLoadingIssues(true);
        lastDocRef.current = null;
      }

      try {
        const issuesRef = collection(db, "users", user.uid, "magazineIssues");
        const cursor = reset ? null : lastDocRef.current;

        // Vérifier que le curseur a un createdAt valide avant d'utiliser startAfter
        // pour éviter l'erreur "Cannot read properties of undefined (reading 'toMillis')"
        const cursorData = cursor?.data();
        const createdAt = cursorData?.createdAt;

        // Debug logging pour diagnostiquer la source de l'erreur
        console.log("[Magazine Debug] Cursor:", cursor ? "exists" : "null");
        console.log("[Magazine Debug] cursorData:", cursorData);
        console.log("[Magazine Debug] createdAt:", createdAt);
        console.log("[Magazine Debug] typeof createdAt:", typeof createdAt);
        console.log(
          "[Magazine Debug] createdAt?.toMillis:",
          typeof createdAt?.toMillis
        );

        const hasValidCursor =
          cursor &&
          cursorData &&
          createdAt &&
          typeof createdAt.toMillis === "function";

        console.log("[Magazine Debug] hasValidCursor:", hasValidCursor);

        const q = hasValidCursor
          ? query(
              issuesRef,
              orderBy("createdAt", "desc"),
              startAfter(cursor),
              limit(PAGE_SIZE)
            )
          : query(issuesRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

        const snap = await getDocs(q);
        const nextBatch = snap.docs.map(toIssue);

        // Ne garder que les documents avec un createdAt valide comme curseur
        const validDocs = snap.docs.filter(
          (doc) => doc.data()?.createdAt != null
        );
        lastDocRef.current =
          validDocs.length > 0 ? validDocs[validDocs.length - 1] : null;
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
      } catch (err) {
        console.error("[Magazine] fetchIssuesPage error:", err);
        if (reset) setIssues([]);
      } finally {
        if (reset) {
          setIsLoadingIssues(false);
        }
      }
    },
    [user]
  );

  const fetchCollections = useCallback(async () => {
    if (!user) return;
    try {
      const collectionsRef = collection(db, "users", user.uid, "collections");
      const snap = await getDocs(collectionsRef);
      const nextCollections = snap.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        return {
          id: docSnap.id,
          name: String(data.name || "Collection"),
          color: String(data.color || "#C5A059"),
          entryIds: Array.isArray(data.entryIds)
            ? data.entryIds.map((id) => String(id))
            : [],
        } satisfies MagazineCollection;
      });
      setCollections(nextCollections);
    } catch (err) {
      console.error("[Magazine] fetchCollections error:", err);
    }
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
      await fetchIssuesPage({ reset: true });
      await fetchCollections();

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (cancelled) return;

      const userData = userSnap.data() as
        | { favorites?: string[]; entryCount?: number }
        | undefined;
      setFavorites(
        Array.isArray(userData?.favorites) ? userData.favorites : []
      );
      setEntryCount(
        typeof userData?.entryCount === "number" ? userData.entryCount : 0
      );
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [fetchCollections, fetchIssuesPage, user]);

  useEffect(() => {
    const stored = window.localStorage.getItem(
      "aurum:magazine-theme"
    ) as ThemeTemplate | null;
    if (stored && ["minimal", "elegant", "magazine", "zen"].includes(stored)) {
      setThemeTemplate(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("aurum:magazine-theme", themeTemplate);
  }, [themeTemplate]);

  const filteredIssues = useMemo(() => {
    return issues.sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.getTime() : 0;
      const dateB = b.createdAt ? b.createdAt.getTime() : 0;
      return dateB - dateA;
    });
  }, [issues]);

  const stats = useMemo(() => {
    const datedEntries = issues
      .filter((issue) => issue.createdAt)
      .map((issue) => issue.createdAt as Date);
    const now = new Date();
    const thisMonthCount = datedEntries.filter(
      (date) =>
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
    ).length;

    const avgWordsSource = issues
      .map((issue) => `${issue.title} ${issue.excerpt}`)
      .filter((text) => !text.includes("Ouvrir pour lire"));
    const totalWords = avgWordsSource.reduce(
      (sum, text) => sum + countWords(text),
      0
    );

    return {
      totalEntries: entryCount || issues.length,
      streakDays: computeStreak(datedEntries),
      thisMonthCount,
      avgWords:
        avgWordsSource.length > 0
          ? Math.round(totalWords / avgWordsSource.length)
          : 0,
    };
  }, [entryCount, issues]);

  const favoriteIssues = useMemo(() => {
    if (favorites.length === 0) return [];
    return filteredIssues
      .filter((issue) => favorites.includes(issue.id))
      .slice(0, 5);
  }, [favorites, filteredIssues]);

  const moodSeries = useMemo(() => {
    return filteredIssues
      .filter(
        (issue) => issue.createdAt && issue.mood && moodToScore[issue.mood]
      )
      .slice(0, 30)
      .reverse()
      .map((issue) => ({
        dateLabel: (issue.createdAt as Date).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        }),
        score: moodToScore[issue.mood as string],
      }));
  }, [filteredIssues]);

  const moodDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const issue of filteredIssues) {
      const mood = issue.mood || "neutre";
      counts.set(mood, (counts.get(mood) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([mood, value]) => ({
      mood,
      value,
      color: moodToChartColor[mood] || "#A8A29E",
    }));
  }, [filteredIssues]);

  const toggleFavorite = async (issueId: string) => {
    if (!user) return;

    const isFavorite = favorites.includes(issueId);
    setFavorites((prev) =>
      isFavorite ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {}, { merge: true });
      await updateDoc(userRef, {
        favorites: isFavorite ? arrayRemove(issueId) : arrayUnion(issueId),
      });
    } catch {
      setFavorites((prev) =>
        isFavorite ? [...prev, issueId] : prev.filter((id) => id !== issueId)
      );
    }
  };

  const createCollection = async (name: string, color: string) => {
    if (!user) return;
    await addDoc(collection(db, "users", user.uid, "collections"), {
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
    await deleteDoc(doc(db, "users", user.uid, "collections", collectionId));
    if (selectedCollectionId === collectionId) setSelectedCollectionId("all");
    await fetchCollections();
  };

  const toggleEntryInCollection = async (
    collectionId: string,
    entryId: string
  ) => {
    if (!user) return;
    const target = collections.find(
      (collectionItem) => collectionItem.id === collectionId
    );
    if (!target) return;
    const alreadyInCollection = target.entryIds.includes(entryId);

    await updateDoc(doc(db, "users", user.uid, "collections", collectionId), {
      entryIds: alreadyInCollection
        ? arrayRemove(entryId)
        : arrayUnion(entryId),
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

      const response = await fetch("/api/analyze-patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const response = await fetch("/api/generate-digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleBackfillMagazine = async () => {
    if (!user) return;
    setIsBackfilling(true);
    try {
      // Try secure server-side backfill first.
      const response = await fetch("/api/magazine/backfill", {
        method: "POST",
      });
      if (!response.ok) {
        // Fallback: rebuild client-side when session cookie is unavailable.
        const entriesRef = collection(db, "users", user.uid, "entries");
        const entriesSnap = await getDocs(
          query(entriesRef, orderBy("createdAt", "desc"), limit(200))
        );
        const batch = writeBatch(db);

        for (const docSnap of entriesSnap.docs) {
          const data = docSnap.data() as Record<string, unknown>;
          const isEncrypted = Boolean(data.encryptedContent);
          const content = typeof data.content === "string" ? data.content : "";

          // Format date for encrypted entries
          let dateTitle = "";
          if (isEncrypted && data.createdAt) {
            const entryDate =
              data.createdAt instanceof Date
                ? data.createdAt
                : (data.createdAt as any).toDate?.() || new Date();
            const options: Intl.DateTimeFormatOptions = {
              day: "numeric",
              month: "long",
            };
            dateTitle = `Réflexion du ${entryDate.toLocaleDateString(
              "fr-FR",
              options
            )}`;
          }

          const title = isEncrypted ? dateTitle : generateIssueTitle(content);
          const excerpt = isEncrypted
            ? "Ouvrir pour lire"
            : generateIssueExcerpt(content);
          const images = Array.isArray(data.images) ? data.images : [];
          const firstImage = images[0] as { url?: string } | undefined;

          const issueRef = doc(
            db,
            "users",
            user.uid,
            "magazineIssues",
            docSnap.id
          );
          batch.set(
            issueRef,
            {
              entryId: docSnap.id,
              title,
              excerpt,
              coverImageUrl: firstImage?.url || null,
              tags: Array.isArray(data.tags) ? data.tags : [],
              mood: data.mood || null,
              sentiment: data.sentiment || null,
              createdAt: data.createdAt || serverTimestamp(),
              publishedAt: data.createdAt || serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        await batch.commit();
      }

      setHasMore(true);
      await fetchIssuesPage({ reset: true });
    } finally {
      setIsBackfilling(false);
    }
  };

  const smartPrompts = useMemo(() => {
    const prompts: string[] = [];

    const lastEntryDate = issues
      .filter((issue) => issue.createdAt)
      .map((issue) => issue.createdAt as Date)
      .sort((a, b) => b.getTime() - a.getTime())[0];

    if (lastEntryDate) {
      const daysSince = Math.floor(
        (Date.now() - lastEntryDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      if (daysSince >= 3) {
        prompts.push(
          "Cela fait quelques jours sans ecriture. Qu'est-ce qui t'a marque recemment ?"
        );
      }
    }

    if (patterns?.themes?.[0]) {
      prompts.push(
        `Tu reviens souvent sur "${patterns.themes[0].name}". Que veux-tu approfondir sur ce theme ?`
      );
    }

    if (stats.thisMonthCount > 0) {
      prompts.push(
        `Tu as ecrit ${stats.thisMonthCount} fois ce mois-ci. Quelle intention pour ta prochaine entree ?`
      );
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
        <h1 className="font-headline text-4xl tracking-tight text-stone-900">
          Magazine
        </h1>
        <p className="text-stone-600">
          Tes pensees en vue editoriale: image a la une, extrait, memoire.
        </p>
      </header>

      {issues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <BookImage className="h-6 w-6 text-stone-500" />
          </div>
          <p className="text-stone-700">Aucune edition pour l'instant.</p>
          <p className="mt-1 text-sm text-stone-500">
            Ecris une entree avec une image pour composer ton magazine.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              <Link href="/sanctuary/write">
                <PenSquare className="mr-2 h-4 w-4" />
                Ecrire une entree
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleBackfillMagazine()}
              disabled={isBackfilling}
              className="border-stone-300 text-stone-700"
            >
              {isBackfilling ? "Reconstruction..." : "Reconstruire le magazine"}
            </Button>
          </div>
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
            <MoodChart
              last30Days={moodSeries}
              distribution={moodDistribution}
            />
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
            <MagazineThemePicker
              value={themeTemplate}
              onChange={setThemeTemplate}
            />
          </div>

          {favoriteIssues.length > 0 && (
            <section className="rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/5 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A5D24]">
                Highlights
              </p>
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

          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <BookImage className="h-6 w-6 text-stone-500" />
            </div>
            <p className="text-stone-700">
              Vos entrées sont maintenant dans le Journal.
            </p>
            <p className="mt-1 text-sm text-stone-500">
              Retrouvez toutes vos écritures et échanges avec Aurum dans la page
              Journal.
            </p>
            <div className="mt-5">
              <Button
                asChild
                className="bg-stone-900 text-stone-50 hover:bg-stone-800"
              >
                <Link href="/sanctuary">Voir le Journal</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
