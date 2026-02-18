"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookImage, PenSquare } from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import { firestore as db } from "@/lib/firebase/web-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CollectionManager,
  type MagazineCollection,
} from "@/components/sanctuary/collection-manager";
import { DashboardStats } from "@/components/sanctuary/dashboard-stats";
import type { AurumConversationStats } from "@/components/sanctuary/dashboard-aurum";
import { WellbeingRadar } from "@/components/sanctuary/wellbeing-radar";
import { RyffQuestionnaire } from "@/components/sanctuary/ryff-questionnaire";
import { PersonalityRadar } from "@/components/sanctuary/personality-radar";
import { PersonalityQuestionnaire } from "@/components/sanctuary/personality-questionnaire";
import type {
  RyffDimensionScores,
  WellbeingScore,
  PersonalityScores,
  PersonalityResult,
} from "@/lib/types";

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  createdAt: Date | null;
  mood: string | null;
};


function parseCreatedAt(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  try {
    if (typeof value === "object" && value !== null && "toDate" in value) {
      return (value as { toDate: () => Date }).toDate();
    }
    if (typeof value === "object" && value !== null && "seconds" in value) {
      const seconds = Number((value as { seconds?: number }).seconds);
      if (!Number.isNaN(seconds)) return new Date(seconds * 1000);
    }
  } catch {
    return null;
  }
  return null;
}

function toIssue(docSnap: QueryDocumentSnapshot<DocumentData>): MagazineIssue {
  const data = docSnap.data() as Record<string, unknown>;
  return {
    id: docSnap.id,
    title: String(data.title || "Entrée"),
    excerpt: String(data.excerpt || ""),
    coverImageUrl: data.coverImageUrl ? String(data.coverImageUrl) : null,
    tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
    createdAt: parseCreatedAt(data.createdAt),
    mood: data.mood ? String(data.mood).toLowerCase() : null,
  };
}

function stripImageMarkdown(content: string) {
  return (content ?? "")
    .replace(/!\[[^\]]*]\(([^)]+)\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateIssueTitle(content: string) {
  const words = (content ?? "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Entrée";
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
  const [collections, setCollections] = useState<MagazineCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("all");
  const [isBackfilling, setIsBackfilling] = useState(false);

  // Aurum stats
  const [aurumStats, setAurumStats] =
    useState<AurumConversationStats | null>(null);
  const [isAurumLoading, setIsAurumLoading] = useState(false);

  // Wellbeing (Ryff)
  const [wellbeingScore, setWellbeingScore] = useState<WellbeingScore | null>(
    null
  );
  const [isWellbeingLoading, setIsWellbeingLoading] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [isQuestionnaireSubmitting, setIsQuestionnaireSubmitting] =
    useState(false);

  // Personality
  const [personalityResult, setPersonalityResult] =
    useState<PersonalityResult | null>(null);
  const [isPersonalityLoading, setIsPersonalityLoading] = useState(false);
  const [personalityQuestionnaireOpen, setPersonalityQuestionnaireOpen] =
    useState(false);
  const [isPersonalitySubmitting, setIsPersonalitySubmitting] = useState(false);

  const fetchIssues = useCallback(async () => {
    if (!user) return;
    setIsLoadingIssues(true);
    try {
      const issuesRef = collection(db, "users", user.uid, "magazineIssues");
      const q = query(issuesRef, orderBy("createdAt", "desc"), limit(200));
      const snap = await getDocs(q);
      setIssues(snap.docs.map(toIssue));
    } catch (err) {
      console.error("[Magazine] fetchIssues error:", err);
      setIssues([]);
    } finally {
      setIsLoadingIssues(false);
    }
  }, [user]);

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

  const fetchLatestWellbeingScore = useCallback(async () => {
    if (!user) return;
    try {
      const scoresRef = collection(
        db,
        "users",
        user.uid,
        "wellbeingScores"
      );
      const q = query(scoresRef, orderBy("computedAt", "desc"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0].data() as Record<string, unknown>;
        const computedAt = parseCreatedAt(d.computedAt);
        setWellbeingScore({
          id: snap.docs[0].id,
          source: (d.source as WellbeingScore["source"]) || "ai",
          computedAt: computedAt || new Date(),
          entryCount: typeof d.entryCount === "number" ? d.entryCount : 0,
          scores: {
            acceptationDeSoi: Number(d.acceptationDeSoi) || 3,
            developpementPersonnel: Number(d.developpementPersonnel) || 3,
            sensDeLaVie: Number(d.sensDeLaVie) || 3,
            maitriseEnvironnement: Number(d.maitriseEnvironnement) || 3,
            autonomie: Number(d.autonomie) || 3,
            relationsPositives: Number(d.relationsPositives) || 3,
          },
          aiConfidence:
            typeof d.aiConfidence === "number" ? d.aiConfidence : undefined,
          narrative:
            typeof d.narrative === "string" ? d.narrative : undefined,
        });
      }
    } catch (err) {
      console.error("[Magazine] fetchWellbeingScore error:", err);
    }
  }, [user]);

  const fetchLatestPersonalityScore = useCallback(async () => {
    if (!user) return;
    try {
      const scoresRef = collection(
        db,
        "users",
        user.uid,
        "personalityScores"
      );
      const q = query(scoresRef, orderBy("computedAt", "desc"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0].data() as Record<string, unknown>;
        const computedAt = parseCreatedAt(d.computedAt);
        setPersonalityResult({
          id: snap.docs[0].id,
          source: (d.source as PersonalityResult["source"]) || "ai",
          computedAt: computedAt || new Date(),
          entryCount: typeof d.entryCount === "number" ? d.entryCount : 0,
          scores: {
            determination: Number(d.determination) || 3,
            influence: Number(d.influence) || 3,
            stabilite: Number(d.stabilite) || 3,
            rigueur: Number(d.rigueur) || 3,
          },
          archetype:
            typeof d.archetype === "string" ? d.archetype : undefined,
          aiConfidence:
            typeof d.aiConfidence === "number" ? d.aiConfidence : undefined,
          narrative:
            typeof d.narrative === "string" ? d.narrative : undefined,
        });
      }
    } catch (err) {
      console.error("[Magazine] fetchPersonalityScore error:", err);
    }
  }, [user]);

  const fetchAurumStats = useCallback(async () => {
    if (!user || issues.length === 0) return;
    setIsAurumLoading(true);
    try {
      const recentEntries = issues.slice(0, 50);
      let totalConversations = 0;
      let totalMessages = 0;
      let thisMonth = 0;
      const messagesByMonthMap = new Map<string, number>();
      const now = new Date();
      const currentMonthKey = now.toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
      });

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString("fr-FR", {
          month: "short",
          year: "2-digit",
        });
        messagesByMonthMap.set(key, 0);
      }

      // Check conversations for each entry (batched)
      const batchSize = 10;
      for (let i = 0; i < recentEntries.length; i += batchSize) {
        const batch = recentEntries.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (entry) => {
            const convRef = collection(
              db,
              "users",
              user.uid,
              "entries",
              entry.id,
              "aurumConversation"
            );
            const snap = await getDocs(convRef);
            return { entry, count: snap.size };
          })
        );

        for (const { entry, count } of results) {
          if (count > 0) {
            totalConversations++;
            totalMessages += count;
            if (entry.createdAt) {
              const monthKey = entry.createdAt.toLocaleDateString("fr-FR", {
                month: "short",
                year: "2-digit",
              });
              if (messagesByMonthMap.has(monthKey)) {
                messagesByMonthMap.set(
                  monthKey,
                  (messagesByMonthMap.get(monthKey) || 0) + count
                );
              }
              if (monthKey === currentMonthKey) {
                thisMonth++;
              }
            }
          }
        }
      }

      const messagesByMonth = Array.from(messagesByMonthMap.entries()).map(
        ([month, count]) => ({ month, count })
      );

      setAurumStats({
        totalConversations,
        totalMessages,
        thisMonth,
        avgMessagesPerConversation:
          totalConversations > 0 ? totalMessages / totalConversations : 0,
        messagesByMonth,
        recentThemes: [],
      });
    } catch (err) {
      console.error("[Magazine] fetchAurumStats error:", err);
    } finally {
      setIsAurumLoading(false);
    }
  }, [user, issues]);

  useEffect(() => {
    if (!user) {
      setIssues([]);
      setCollections([]);
      setWellbeingScore(null);
      setPersonalityResult(null);
      setAurumStats(null);
      setIsLoadingIssues(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      await fetchIssues();
      if (cancelled) return;
      await fetchCollections();
      if (cancelled) return;
      await fetchLatestWellbeingScore();
      if (cancelled) return;
      await fetchLatestPersonalityScore();
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [fetchCollections, fetchIssues, fetchLatestWellbeingScore, fetchLatestPersonalityScore, user]);

  // Fetch Aurum stats after issues are loaded
  useEffect(() => {
    if (issues.length > 0) {
      void fetchAurumStats();
    }
  }, [issues.length, fetchAurumStats]);

  const nonEncryptedCount = useMemo(
    () =>
      issues.filter((i) => !i.excerpt?.includes("Contenu chiffré")).length,
    [issues]
  );

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

  const handleAnalyzeWellbeing = async () => {
    if (!user || nonEncryptedCount < 5) return;
    setIsWellbeingLoading(true);
    try {
      const payload = issues
        .filter((i) => !i.excerpt?.includes("Contenu chiffré"))
        .slice(0, 30)
        .map((issue) => ({
          id: issue.id,
          title: issue.title,
          excerpt: issue.excerpt,
          tags: issue.tags,
          mood: issue.mood,
          createdAt: issue.createdAt ? issue.createdAt.toISOString() : null,
        }));

      const response = await fetch("/api/analyze-wellbeing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: payload, userId: user.uid }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          source: string;
          computedAt: string;
          entryCount: number;
          scores: RyffDimensionScores;
          aiConfidence: number;
          narrative: string;
        };
        setWellbeingScore({
          source: "ai",
          computedAt: new Date(data.computedAt),
          entryCount: data.entryCount,
          scores: data.scores,
          aiConfidence: data.aiConfidence,
          narrative: data.narrative,
        });
      }
    } catch {
      // silent
    } finally {
      setIsWellbeingLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (scores: RyffDimensionScores) => {
    if (!user) return;
    setIsQuestionnaireSubmitting(true);
    try {
      const scoresRef = collection(db, "users", user.uid, "wellbeingScores");
      await addDoc(scoresRef, {
        source: "questionnaire",
        computedAt: serverTimestamp(),
        entryCount: 0,
        acceptationDeSoi: scores.acceptationDeSoi,
        developpementPersonnel: scores.developpementPersonnel,
        sensDeLaVie: scores.sensDeLaVie,
        maitriseEnvironnement: scores.maitriseEnvironnement,
        autonomie: scores.autonomie,
        relationsPositives: scores.relationsPositives,
      });

      setWellbeingScore({
        source: "questionnaire",
        computedAt: new Date(),
        scores,
      });
      setQuestionnaireOpen(false);
    } catch {
      // silent
    } finally {
      setIsQuestionnaireSubmitting(false);
    }
  };

  const handleAnalyzePersonality = async () => {
    if (!user || nonEncryptedCount < 5) return;
    setIsPersonalityLoading(true);
    try {
      const payload = issues
        .filter((i) => !i.excerpt?.includes("Contenu chiffré"))
        .slice(0, 30)
        .map((issue) => ({
          id: issue.id,
          title: issue.title,
          excerpt: issue.excerpt,
          tags: issue.tags,
          mood: issue.mood,
          createdAt: issue.createdAt ? issue.createdAt.toISOString() : null,
        }));

      const response = await fetch("/api/analyze-personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: payload, userId: user.uid }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          source: string;
          computedAt: string;
          entryCount: number;
          scores: PersonalityScores;
          archetype: string;
          aiConfidence: number;
          narrative: string;
        };
        setPersonalityResult({
          source: "ai",
          computedAt: new Date(data.computedAt),
          entryCount: data.entryCount,
          scores: data.scores,
          archetype: data.archetype,
          aiConfidence: data.aiConfidence,
          narrative: data.narrative,
        });
      }
    } catch {
      // silent
    } finally {
      setIsPersonalityLoading(false);
    }
  };

  const handlePersonalityQuestionnaireComplete = async (
    scores: PersonalityScores,
    archetype: string
  ) => {
    if (!user) return;
    setIsPersonalitySubmitting(true);
    try {
      const scoresRef = collection(
        db,
        "users",
        user.uid,
        "personalityScores"
      );
      await addDoc(scoresRef, {
        source: "questionnaire",
        computedAt: serverTimestamp(),
        entryCount: 0,
        determination: scores.determination,
        influence: scores.influence,
        stabilite: scores.stabilite,
        rigueur: scores.rigueur,
        archetype,
      });

      setPersonalityResult({
        source: "questionnaire",
        computedAt: new Date(),
        scores,
        archetype,
      });
      setPersonalityQuestionnaireOpen(false);
    } catch {
      // silent
    } finally {
      setIsPersonalitySubmitting(false);
    }
  };

  const handleBackfillMagazine = async () => {
    if (!user) return;
    setIsBackfilling(true);
    try {
      const response = await fetch("/api/magazine/backfill", {
        method: "POST",
      });
      if (!response.ok) {
        const entriesRef = collection(db, "users", user.uid, "entries");
        const entriesSnap = await getDocs(
          query(entriesRef, orderBy("createdAt", "desc"), limit(200))
        );
        const batch = writeBatch(db);

        for (const docSnap of entriesSnap.docs) {
          const data = docSnap.data() as Record<string, unknown>;
          const isEncrypted = Boolean(data.encryptedContent);
          const content = typeof data.content === "string" ? data.content : "";

          let dateTitle = "";
          if (isEncrypted && data.createdAt) {
            const entryDate =
              data.createdAt instanceof Date
                ? data.createdAt
                : (data.createdAt as { toDate?: () => Date }).toDate?.() ||
                  new Date();
            dateTitle = `Réflexion du ${entryDate.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}`;
          }

          const title = isEncrypted ? dateTitle : generateIssueTitle(content);
          const excerpt = isEncrypted
            ? "Contenu chiffré"
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

      await fetchIssues();
    } finally {
      setIsBackfilling(false);
    }
  };

  if (loading || isLoadingIssues) {
    return (
      <div className="container max-w-7xl space-y-6 py-8 md:py-12">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-[360px] rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
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
          Tes pensées en vue éditoriale : image à la une, extrait, mémoire.
        </p>
      </header>

      {issues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <BookImage className="h-6 w-6 text-stone-500" />
          </div>
          <p className="text-stone-700">Aucune édition pour l&apos;instant.</p>
          <p className="mt-1 text-sm text-stone-500">
            Écris une entrée avec une image pour composer ton magazine.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              <Link href="/sanctuary/write">
                <PenSquare className="mr-2 h-4 w-4" />
                Écrire une entrée
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
          {/* Bien-être psychologique — Modèle de Ryff */}
          <WellbeingRadar
            aiScores={
              wellbeingScore?.source !== "questionnaire"
                ? wellbeingScore?.scores ?? null
                : null
            }
            questionnaireScores={
              wellbeingScore?.source === "questionnaire" ||
              wellbeingScore?.source === "combined"
                ? wellbeingScore.scores
                : null
            }
            narrative={wellbeingScore?.narrative ?? null}
            computedAt={wellbeingScore?.computedAt ?? null}
            isLoading={isWellbeingLoading}
            onRequestAnalysis={() => void handleAnalyzeWellbeing()}
            onOpenQuestionnaire={() => setQuestionnaireOpen(true)}
            canAnalyze={nonEncryptedCount >= 5}
          />

          <RyffQuestionnaire
            open={questionnaireOpen}
            onOpenChange={setQuestionnaireOpen}
            onComplete={handleQuestionnaireComplete}
            isSubmitting={isQuestionnaireSubmitting}
          />

          {/* Profil de personnalité — 4 dimensions */}
          <PersonalityRadar
            aiScores={
              personalityResult?.source !== "questionnaire"
                ? personalityResult?.scores ?? null
                : null
            }
            questionnaireScores={
              personalityResult?.source === "questionnaire" ||
              personalityResult?.source === "combined"
                ? personalityResult.scores
                : null
            }
            archetype={personalityResult?.archetype ?? null}
            narrative={personalityResult?.narrative ?? null}
            computedAt={personalityResult?.computedAt ?? null}
            isLoading={isPersonalityLoading}
            onRequestAnalysis={() => void handleAnalyzePersonality()}
            onOpenQuestionnaire={() => setPersonalityQuestionnaireOpen(true)}
            canAnalyze={nonEncryptedCount >= 5}
          />

          <PersonalityQuestionnaire
            open={personalityQuestionnaireOpen}
            onOpenChange={setPersonalityQuestionnaireOpen}
            onComplete={handlePersonalityQuestionnaireComplete}
            isSubmitting={isPersonalitySubmitting}
          />

          {/* Dashboard Statistiques */}
          <DashboardStats
            issues={issues}
            aurumStats={aurumStats}
            isAurumLoading={isAurumLoading}
          />

          {collections.length > 0 && (
            <CollectionManager
              collections={collections}
              selectedCollectionId={selectedCollectionId}
              onSelectCollection={setSelectedCollectionId}
              onCreateCollection={createCollection}
              onDeleteCollection={deleteCollectionById}
            />
          )}
        </div>
      )}
    </div>
  );
}
