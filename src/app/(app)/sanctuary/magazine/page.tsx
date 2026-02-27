"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlignLeft, Archive, BookImage, ImageIcon, PenSquare, RefreshCw } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
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

type LandingAssessment = {
  id: string;
  profile: string;
  profileTitle: string;
  answers: string[];
  completedAt: Date | null;
};

type LandingInsight = {
  narrative: string;
  actionPlan: string[];
};

const PROFILE_TITLES: Record<string, string> = {
  D: "Le Pionnier",
  I: "Le Connecteur",
  S: "L'Ancre",
  C: "L'Architecte",
  MIXTE: "Profil mixte • L'Équilibriste",
};
const ACTIVE_PLAN_STORAGE_KEY = "aurum-active-plan";

const RYFF_DIMENSION_LABELS: Record<keyof RyffDimensionScores, string> = {
  acceptationDeSoi: "acceptation de soi",
  developpementPersonnel: "développement personnel",
  sensDeLaVie: "sens de la vie",
  maitriseEnvironnement: "maîtrise de ton quotidien",
  autonomie: "autonomie",
  relationsPositives: "relations positives",
};

function buildWellbeingNarrative(scores: RyffDimensionScores): string {
  const entries = Object.entries(scores) as [keyof RyffDimensionScores, number][];
  if (entries.length === 0) return "Ton profil est prêt. Prends quelques minutes pour l'observer avec douceur.";

  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = sorted[0];
  const [lowKey, lowValue] = sorted[sorted.length - 1];
  const average = entries.reduce((sum, [, value]) => sum + value, 0) / entries.length;

  const tone =
    average >= 4.3
      ? "Tu traverses une période plutôt solide."
      : average >= 3.3
      ? "Tu es dans une phase d'équilibre en construction."
      : "Tu sembles traverser une période plus chargée.";

  return `${tone} Ton point fort actuel: ${RYFF_DIMENSION_LABELS[topKey]} (${topValue.toFixed(
    1
  )}/6). Le point à soutenir en priorité: ${RYFF_DIMENSION_LABELS[lowKey]} (${lowValue.toFixed(
    1
  )}/6). Écrire quelques lignes dans Aurum t'aidera à clarifier ce point faible et à suivre tes progrès de façon concrète.`;
}

const PERSONALITY_DIMENSION_LABELS: Record<keyof PersonalityScores, string> = {
  determination: "détermination",
  influence: "influence",
  stabilite: "stabilité",
  rigueur: "rigueur",
};

function buildPersonalityNarrative(scores: PersonalityScores, archetype: string): string {
  const entries = Object.entries(scores) as [keyof PersonalityScores, number][];
  if (entries.length === 0) return "Ton profil est prêt. Observe surtout ce qui t'aide à avancer avec plus de clarté.";
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = sorted[0];
  const [lowKey, lowValue] = sorted[sorted.length - 1];
  return `Tu as un style ${archetype} bien marqué. Ta force dominante aujourd'hui: ${PERSONALITY_DIMENSION_LABELS[topKey]} (${topValue.toFixed(
    1
  )}/6). Pour progresser avec plus de fluidité, travaille doucement ${PERSONALITY_DIMENSION_LABELS[
    lowKey
  ]} (${lowValue.toFixed(1)}/6) avec une action simple et répétée cette semaine. L'écriture dans Aurum te permet de préparer cette action, de la garder visible, puis de mesurer son effet réel.`;
}


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
  const { toast } = useToast();
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
  const [landingAssessment, setLandingAssessment] =
    useState<LandingAssessment | null>(null);
  const [landingInsight, setLandingInsight] = useState<LandingInsight | null>(null);
  const [isLandingInsightLoading, setIsLandingInsightLoading] = useState(false);

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

  const fetchLatestLandingAssessment = useCallback(async () => {
    if (!user) return;
    try {
      const assessmentsRef = collection(db, "users", user.uid, "assessments");
      const snap = await getDocs(assessmentsRef);
      const landingDocs = snap.docs
        .filter((item) => String(item.data().source || "").startsWith("landing-quiz"))
        .map((item) => {
          const d = item.data() as Record<string, unknown>;
          const completedAt =
            parseCreatedAt(d.createdAt) ?? parseCreatedAt(d.completedAt) ?? new Date(0);
          return { item, d, completedAt };
        })
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

      if (landingDocs.length > 0) {
        const latest = landingDocs[0];
        setLandingAssessment({
          id: latest.item.id,
          profile: String(latest.d.profile || "MIXTE"),
          profileTitle: String(latest.d.profileTitle || "Profil personnel"),
          answers: Array.isArray(latest.d.answers)
            ? latest.d.answers.map((entry) => String(entry))
            : [],
          completedAt: latest.completedAt,
        });
        return;
      }

      // Fallback: synchroniser le quiz stocké localement si aucun résultat n'existe encore en base.
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("aurum-quiz-data");
          if (!raw) {
            setLandingAssessment(null);
            return;
          }

          const localQuiz = JSON.parse(raw) as {
            answers?: unknown;
            profile?: unknown;
            completedAt?: unknown;
          };
          const profile = String(localQuiz.profile || "MIXTE");
          const answers = Array.isArray(localQuiz.answers)
            ? localQuiz.answers.map((entry) => String(entry))
            : [];
          const completedAt = (() => {
            const parsed = parseCreatedAt(localQuiz.completedAt);
            return parsed ?? new Date();
          })();
          const profileTitle = PROFILE_TITLES[profile] || "Profil personnel";

          const created = await addDoc(assessmentsRef, {
            source: "landing-quiz",
            profile,
            profileTitle,
            answers,
            completedAt: completedAt.toISOString(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          setLandingAssessment({
            id: created.id,
            profile,
            profileTitle,
            answers,
            completedAt,
          });
        } catch (error) {
          console.error("[Magazine] local quiz sync error:", error);
          setLandingAssessment(null);
        }
      }
    } catch (err) {
      console.error("[Magazine] fetchLatestLandingAssessment error:", err);
      setLandingAssessment(null);
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
      if (cancelled) return;
      await fetchLatestLandingAssessment();
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [
    fetchCollections,
    fetchIssues,
    fetchLatestLandingAssessment,
    fetchLatestWellbeingScore,
    fetchLatestPersonalityScore,
    user,
  ]);

  // Fetch Aurum stats after issues are loaded
  useEffect(() => {
    if (issues.length > 0) {
      void fetchAurumStats();
    }
  }, [issues.length, fetchAurumStats]);

  useEffect(() => {
    if (!landingAssessment) {
      setLandingInsight(null);
      setIsLandingInsightLoading(false);
      return;
    }

    let cancelled = false;
    setIsLandingInsightLoading(true);

    const loadLandingInsight = async () => {
      try {
        const response = await fetch("/api/analyze-questionnaire", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "landing",
            profile: landingAssessment.profile,
            profileTitle: landingAssessment.profileTitle,
            answers: landingAssessment.answers,
          }),
        });

        if (!response.ok) return;
        const data = (await response.json()) as {
          narrative?: unknown;
          actionPlan?: unknown;
        };

        const narrative =
          typeof data.narrative === "string" && data.narrative.trim()
            ? data.narrative.trim()
            : "Ton profil d'entrée est prêt. Avance par étapes simples et régulières.";
        const actionPlan = Array.isArray(data.actionPlan)
          ? data.actionPlan
              .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
              .filter(Boolean)
              .slice(0, 7)
          : [];

        if (!cancelled) {
          setLandingInsight({ narrative, actionPlan });
        }
      } catch {
        // silent fallback
      } finally {
        if (!cancelled) {
          setIsLandingInsightLoading(false);
        }
      }
    };

    void loadLandingInsight();
    return () => {
      cancelled = true;
    };
  }, [landingAssessment]);

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
      const idToken = await user.getIdToken();

      const response = await fetch("/api/analyze-wellbeing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ entries: payload }),
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
    const optimisticComputedAt = new Date();
    let narrative = buildWellbeingNarrative(scores);

    try {
      const explainResponse = await fetch("/api/analyze-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "wellbeing",
          scores,
        }),
      });
      if (explainResponse.ok) {
        const explainData = (await explainResponse.json()) as { narrative?: unknown };
        if (typeof explainData.narrative === "string" && explainData.narrative.trim()) {
          narrative = explainData.narrative.trim();
        }
      }
    } catch {
      // fallback narrative already set
    }

    setWellbeingScore({
      source: "questionnaire",
      computedAt: optimisticComputedAt,
      scores,
      narrative,
    });
    setQuestionnaireOpen(false);

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
        narrative,
      });
    } catch (error) {
      console.error("[Magazine] wellbeing questionnaire save error:", error);
      // Retry once in background to absorb transient mobile/network issues.
      setTimeout(async () => {
        try {
          await addDoc(collection(db, "users", user.uid, "wellbeingScores"), {
            source: "questionnaire",
            computedAt: serverTimestamp(),
            entryCount: 0,
            acceptationDeSoi: scores.acceptationDeSoi,
            developpementPersonnel: scores.developpementPersonnel,
            sensDeLaVie: scores.sensDeLaVie,
            maitriseEnvironnement: scores.maitriseEnvironnement,
            autonomie: scores.autonomie,
            relationsPositives: scores.relationsPositives,
            narrative,
          });
        } catch (retryError) {
          console.error("[Magazine] wellbeing questionnaire retry save error:", retryError);
        }
      }, 1200);
      toast({
        title: "Profil prêt",
        description:
          "Ton résultat est affiché. On finalise sa sauvegarde en arrière-plan.",
      });
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
      const idToken = await user.getIdToken();

      const response = await fetch("/api/analyze-personality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ entries: payload }),
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
    let narrative = buildPersonalityNarrative(scores, archetype);

    try {
      const explainResponse = await fetch("/api/analyze-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "personality",
          scores,
          archetype,
        }),
      });
      if (explainResponse.ok) {
        const explainData = (await explainResponse.json()) as { narrative?: unknown };
        if (typeof explainData.narrative === "string" && explainData.narrative.trim()) {
          narrative = explainData.narrative.trim();
        }
      }
    } catch {
      // fallback narrative already set
    }

    const optimisticComputedAt = new Date();
    setPersonalityResult({
      source: "questionnaire",
      computedAt: optimisticComputedAt,
      scores,
      archetype,
      narrative,
    });
    setPersonalityQuestionnaireOpen(false);

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
        narrative,
      });
    } catch (error) {
      console.error("[Magazine] personality questionnaire save error:", error);
      setTimeout(async () => {
        try {
          await addDoc(collection(db, "users", user.uid, "personalityScores"), {
            source: "questionnaire",
            computedAt: serverTimestamp(),
            entryCount: 0,
            determination: scores.determination,
            influence: scores.influence,
            stabilite: scores.stabilite,
            rigueur: scores.rigueur,
            archetype,
            narrative,
          });
        } catch (retryError) {
          console.error("[Magazine] personality questionnaire retry save error:", retryError);
        }
      }, 1200);
      toast({
        title: "Profil prêt",
        description: "Ton résultat est affiché. On finalise sa sauvegarde en arrière-plan.",
      });
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
      <header className="mb-10">
        <div className="mb-4 h-px w-10 bg-amber-600/50" />
        <h1 className="font-headline text-4xl tracking-tight text-stone-900">
          Magazine
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          La lecture éditoriale et analytique de ton parcours. Aurum y assemble tes pages pour faire émerger les thèmes, les extraits marquants et ton évolution.
        </p>
      </header>

      {landingAssessment && (
        <div className="mb-6 rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 md:p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-700/80">
            Parcours d'entrée
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-900">
            {landingAssessment.profileTitle}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Résultat enregistré dans Magazine{landingAssessment.completedAt
              ? ` le ${landingAssessment.completedAt.toLocaleDateString("fr-FR")}`
              : ""}.
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Réponses captées: {landingAssessment.answers.length}
          </p>

          {isLandingInsightLoading && (
            <p className="mt-4 text-sm text-stone-600">
              Aurum approfondit ton profil pour te proposer une lecture plus fine...
            </p>
          )}

          {landingInsight && (
            <div className="mt-4 rounded-2xl border border-amber-200/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700/80">
                Lecture Aurum premium
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {landingInsight.narrative}
              </p>
              {landingInsight.actionPlan.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
                    Plan d'action 7 jours
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-stone-700">
                    {landingInsight.actionPlan.map((step) => (
                      <li key={step} className="flex gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500/70" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/sanctuary/write?initial=${encodeURIComponent(
                      `Plan d'action 7 jours\n${landingInsight.actionPlan[0]}\n\nIntention du jour:`
                    )}`}
                    onClick={() => {
                      if (typeof window === "undefined") return;
                      localStorage.setItem(
                        ACTIVE_PLAN_STORAGE_KEY,
                        JSON.stringify({
                          version: 1,
                          source: "landing",
                          title: "Plan d'action 7 jours",
                          steps: landingInsight.actionPlan,
                          currentStep: 0,
                          createdAt: new Date().toISOString(),
                        })
                      );
                    }}
                    className="mt-3 inline-flex rounded-lg bg-[#C5A059] px-3 py-1.5 text-xs font-medium text-stone-900 transition-colors hover:bg-[#b8924e]"
                  >
                    Appliquer ce plan dans mon journal
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mb-6 space-y-6">
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
      </div>

      {issues.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {/* Zone héro */}
          <div className="border-b border-stone-100 bg-gradient-to-b from-stone-50 to-white px-10 py-12 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200/70">
              <BookImage className="h-7 w-7 text-amber-700" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              Ton parcours, révélé par Aurum
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
              Aurum assemble tes pages enregistrées et tes parcours guidés pour faire émerger
              les thèmes récurrents, les extraits marquants et ton évolution dans le temps.
            </p>
          </div>

          {/* Piliers — ce que fait le Magazine */}
          <div className="grid divide-x divide-stone-100 sm:grid-cols-3">
            <div className="flex flex-col items-center p-7 text-center">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100">
                <ImageIcon className="h-4 w-4 text-stone-600" />
              </div>
              <p className="text-sm font-medium text-stone-900">Thèmes & extraits</p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                Les fils conducteurs de tes écrits, mis en lumière automatiquement par Aurum.
              </p>
            </div>
            <div className="flex flex-col items-center p-7 text-center">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100">
                <AlignLeft className="h-4 w-4 text-stone-600" />
              </div>
              <p className="text-sm font-medium text-stone-900">Évolution</p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                Ton profil de bien-être et de personnalité tracé dans le temps, page après page.
              </p>
            </div>
            <div className="flex flex-col items-center p-7 text-center">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100">
                <Archive className="h-4 w-4 text-stone-600" />
              </div>
              <p className="text-sm font-medium text-stone-900">Vue éditoriale</p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                Chaque page devient une édition avec image, extrait et date. Ton journal, magnifié.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-stone-100 bg-stone-50/60 px-10 py-6">
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
              className="border-stone-200 text-stone-600 hover:bg-stone-100"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isBackfilling ? "animate-spin" : ""}`} />
              {isBackfilling ? "Reconstruction..." : "Reconstruire depuis le journal"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
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
