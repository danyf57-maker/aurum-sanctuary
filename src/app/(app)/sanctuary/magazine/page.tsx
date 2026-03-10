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
import { useLocale } from "@/hooks/use-locale";
import { useLocalizedHref } from "@/hooks/use-localized-href";
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
};

const PROFILE_TITLES: Record<"fr" | "en", Record<string, string>> = {
  fr: {
    D: "Le Pionnier",
    I: "Le Connecteur",
    S: "Le Pilier",
    C: "L'Architecte",
    MIXTE: "Profil équilibré • L'Équilibriste",
  },
  en: {
    D: "The Pioneer",
    I: "The Connector",
    S: "The Anchor",
    C: "The Architect",
    MIXTE: "Balanced profile • The Equilibrist",
  },
};
const RYFF_DIMENSION_LABELS: Record<"fr" | "en", Record<keyof RyffDimensionScores, string>> = {
  fr: {
    acceptationDeSoi: "l'acceptation de soi",
    developpementPersonnel: "la croissance personnelle",
    sensDeLaVie: "le sens",
    maitriseEnvironnement: "la maîtrise du quotidien",
    autonomie: "l'autonomie",
    relationsPositives: "les relations positives",
  },
  en: {
    acceptationDeSoi: "self-acceptance",
    developpementPersonnel: "personal growth",
    sensDeLaVie: "purpose in life",
    maitriseEnvironnement: "daily mastery",
    autonomie: "autonomy",
    relationsPositives: "positive relationships",
  },
};

function buildWellbeingNarrative(scores: RyffDimensionScores, locale: "fr" | "en"): string {
  const entries = Object.entries(scores) as [keyof RyffDimensionScores, number][];
  if (entries.length === 0) {
    return locale === "fr"
      ? "Ton profil est prêt. Prends un instant pour l'observer avec douceur."
      : "Your profile is ready. Take a moment to observe it gently.";
  }

  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = sorted[0];
  const [lowKey, lowValue] = sorted[sorted.length - 1];
  const average = entries.reduce((sum, [, value]) => sum + value, 0) / entries.length;

  if (locale === "fr") {
    const tone =
      average >= 4.3
        ? "Tu traverses une période plutôt stable."
        : average >= 3.3
        ? "Tu es dans une phase de rééquilibrage."
        : "Tu sembles passer par une période plus exigeante.";

    return `${tone} Ton point d'appui principal du moment : ${RYFF_DIMENSION_LABELS.fr[topKey]} (${topValue.toFixed(
      1
    )}/6). L'axe à soutenir en priorité : ${RYFF_DIMENSION_LABELS.fr[lowKey]} (${lowValue.toFixed(
      1
    )}/6). Écrire quelques lignes dans Aurum peut t'aider à clarifier cette zone et à suivre des progrès concrets.`;
  }

  const tone =
    average >= 4.3
      ? "You are going through a fairly steady period."
      : average >= 3.3
      ? "You are in a phase of building balance."
      : "You seem to be in a more demanding period.";

  return `${tone} Your strongest area right now: ${RYFF_DIMENSION_LABELS.en[topKey]} (${topValue.toFixed(
    1
  )}/6). The top area to support first: ${RYFF_DIMENSION_LABELS.en[lowKey]} (${lowValue.toFixed(
    1
  )}/6). Writing a few lines in Aurum will help you clarify this weaker area and track concrete progress.`;
}

const PERSONALITY_DIMENSION_LABELS: Record<"fr" | "en", Record<keyof PersonalityScores, string>> = {
  fr: {
    determination: "la détermination",
    influence: "l'influence",
    stabilite: "la stabilité",
    rigueur: "la rigueur",
  },
  en: {
    determination: "determination",
    influence: "influence",
    stabilite: "stability",
    rigueur: "discipline",
  },
};

function buildPersonalityNarrative(scores: PersonalityScores, archetype: string, locale: "fr" | "en"): string {
  const entries = Object.entries(scores) as [keyof PersonalityScores, number][];
  if (entries.length === 0) {
    return locale === "fr"
      ? "Ton profil est prêt. Concentre-toi sur ce qui t'aide à avancer avec plus de clarté."
      : "Your profile is ready. Focus on what helps you move forward with more clarity.";
  }
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const [topKey, topValue] = sorted[0];
  const [lowKey, lowValue] = sorted[sorted.length - 1];
  if (locale === "fr") {
    return `Tu montres aujourd'hui un style ${archetype} bien marqué. Ta force dominante du moment : ${PERSONALITY_DIMENSION_LABELS.fr[topKey]} (${topValue.toFixed(
      1
    )}/6). Pour avancer avec plus de fluidité, travaille doucement ${PERSONALITY_DIMENSION_LABELS.fr[
      lowKey
    ]} (${lowValue.toFixed(1)}/6) à travers une action simple et répétée cette semaine. Écrire dans Aurum t'aide à préparer cette action, à la garder visible et à mesurer son effet réel.`;
  }
  return `You show a clear ${archetype} style. Your dominant strength today: ${PERSONALITY_DIMENSION_LABELS.en[topKey]} (${topValue.toFixed(
    1
  )}/6). To progress with more fluidity, gently work on ${PERSONALITY_DIMENSION_LABELS.en[
    lowKey
  ]} (${lowValue.toFixed(1)}/6) through one simple repeated action this week. Writing in Aurum helps you prepare that action, keep it visible, and measure its real effect.`;
}


function parseCreatedAt(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
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
    title: String(data.title || "Entry"),
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
  if (words.length === 0) return "Entry";
  return words.slice(0, 8).join(" ") + (words.length > 8 ? "..." : "");
}

function generateIssueExcerpt(content: string, maxLength = 170) {
  const plain = stripImageMarkdown(content);
  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}

export default function MagazinePage() {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const to = useLocalizedHref();
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
      let latestDoc: QueryDocumentSnapshot<DocumentData> | null = null;
      try {
        const q = query(scoresRef, orderBy("computedAt", "desc"), limit(1));
        const snap = await getDocs(q);
        latestDoc = snap.empty ? null : snap.docs[0];
      } catch {
        // Fallback for heterogeneous historical data (timestamp/string)
        const snap = await getDocs(scoresRef);
        latestDoc =
          snap.docs
            .map((docSnap) => ({
              docSnap,
              when: parseCreatedAt((docSnap.data() as Record<string, unknown>).computedAt),
            }))
            .sort((a, b) => (b.when?.getTime() ?? 0) - (a.when?.getTime() ?? 0))[0]?.docSnap ??
          null;
      }

      if (latestDoc) {
        const d = latestDoc.data() as Record<string, unknown>;
        const computedAt = parseCreatedAt(d.computedAt);
        setWellbeingScore({
          id: latestDoc.id,
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
      let latestDoc: QueryDocumentSnapshot<DocumentData> | null = null;
      try {
        const q = query(scoresRef, orderBy("computedAt", "desc"), limit(1));
        const snap = await getDocs(q);
        latestDoc = snap.empty ? null : snap.docs[0];
      } catch {
        // Fallback for heterogeneous historical data (timestamp/string)
        const snap = await getDocs(scoresRef);
        latestDoc =
          snap.docs
            .map((docSnap) => ({
              docSnap,
              when: parseCreatedAt((docSnap.data() as Record<string, unknown>).computedAt),
            }))
            .sort((a, b) => (b.when?.getTime() ?? 0) - (a.when?.getTime() ?? 0))[0]?.docSnap ??
          null;
      }

      if (latestDoc) {
        const d = latestDoc.data() as Record<string, unknown>;
        const computedAt = parseCreatedAt(d.computedAt);
        setPersonalityResult({
          id: latestDoc.id,
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
          profileTitle:
            PROFILE_TITLES[isFr ? 'fr' : 'en'][String(latest.d.profile || "MIXTE")] ||
            String(latest.d.profileTitle || (isFr ? "Profil personnel" : "Personal profile")),
          answers: Array.isArray(latest.d.answers)
            ? latest.d.answers.map((entry) => String(entry))
            : [],
          completedAt: latest.completedAt,
        });
        return;
      }

      // Fallback: sync quiz data from local storage when no result exists yet in Firestore.
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
          const profileTitle = PROFILE_TITLES[isFr ? 'fr' : 'en'][profile] || (isFr ? "Profil personnel" : "Personal profile");

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
            locale,
            profile: landingAssessment.profile,
            profileTitle: landingAssessment.profileTitle,
            answers: landingAssessment.answers,
          }),
        });

        if (!response.ok) return;
        const data = (await response.json()) as {
          narrative?: unknown;
        };

        const narrative =
          typeof data.narrative === "string" && data.narrative.trim()
            ? data.narrative.trim()
            : isFr
              ? "Ton profil d'entrée est prêt. Avance avec des pas simples et réguliers."
              : "Your entry profile is ready. Move forward with simple, steady steps.";
        if (!cancelled) {
          setLandingInsight({ narrative });
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
      issues.filter(
        (i) =>
          !i.excerpt?.includes("Contenu chiffré") &&
          !i.excerpt?.includes("Encrypted content")
      ).length,
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
        .filter(
          (i) =>
            !i.excerpt?.includes("Contenu chiffré") &&
            !i.excerpt?.includes("Encrypted content")
        )
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
    let narrative = buildWellbeingNarrative(scores, isFr ? 'fr' : 'en');

    try {
      const explainResponse = await fetch("/api/analyze-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "wellbeing",
          locale,
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
        title: isFr ? "Profil prêt" : "Profile ready",
        description: isFr
          ? "Ton résultat est visible. Nous finalisons l'enregistrement en arrière-plan."
          : "Your result is visible. We are finalizing the save in the background.",
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
        .filter(
          (i) =>
            !i.excerpt?.includes("Contenu chiffré") &&
            !i.excerpt?.includes("Encrypted content")
        )
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
    let narrative = buildPersonalityNarrative(scores, archetype, isFr ? 'fr' : 'en');

    try {
      const explainResponse = await fetch("/api/analyze-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "personality",
          locale,
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
        title: isFr ? "Profil prêt" : "Profile ready",
        description: isFr
          ? "Ton résultat est visible. Nous finalisons l'enregistrement en arrière-plan."
          : "Your result is visible. We are finalizing the save in the background.",
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
            dateTitle = `${isFr ? 'Réflexion du' : 'Reflection from'} ${entryDate.toLocaleDateString(isFr ? "fr-FR" : "en-US", {
              day: "numeric",
              month: "long",
            })}`;
          }

          const title = isEncrypted ? dateTitle : generateIssueTitle(content);
          const excerpt = isEncrypted
            ? (isFr ? "Contenu chiffré" : "Encrypted content")
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
          {isFr ? 'Magazine' : 'Magazine'}
        </h1>
        <p className="mt-2 max-w-xl text-stone-500">
          {isFr
            ? 'Ton espace de lecture et d’analyse. Aurum relie tes pages et tes reflets pour faire émerger thèmes récurrents, évolutions émotionnelles et lectures guidées dans le temps.'
            : 'Your reading and analysis space. Aurum connects your pages and reflections to surface recurring themes, emotional shifts, and guided readings over time.'}
        </p>
      </header>

      {landingAssessment && (
        <div className="mb-6 rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 md:p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-amber-700/80">
            {isFr ? 'Profil d’entrée' : 'Entry profile'}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-stone-900">
            {landingAssessment.profileTitle}
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            {isFr ? 'Résultat enregistré dans Magazine' : 'Result saved in Magazine'}
            {landingAssessment.completedAt
              ? ` ${isFr ? 'le' : 'on'} ${landingAssessment.completedAt.toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}`
              : ''}.
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {isFr ? 'Réponses enregistrées' : 'Answers captured'}: {landingAssessment.answers.length}
          </p>

          {isLandingInsightLoading && (
            <p className="mt-4 text-sm text-stone-600">
              {isFr
                ? 'Aurum approfondit ton profil pour affiner cette lecture...'
                : 'Aurum is deepening your profile for a more precise reading...'}
            </p>
          )}

          {landingInsight && (
            <div className="mt-4 rounded-2xl border border-amber-200/70 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700/80">
                {isFr ? 'Lecture Aurum premium' : 'Premium Aurum reading'}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                {landingInsight.narrative}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mb-6 space-y-6">
        {/* Psychological wellbeing — Ryff model */}
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

        {/* Personality profile — 4 dimensions */}
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
          {/* Hero section */}
          <div className="border-b border-stone-100 bg-gradient-to-b from-stone-50 to-white px-10 py-12 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200/70">
              <BookImage className="h-7 w-7 text-amber-700" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900">
              {isFr ? 'Là où tes pages deviennent des motifs' : 'Where your pages become patterns'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
              {isFr
                ? 'Aurum relie tes pages, tes reflets et tes parcours guidés pour faire apparaître les thèmes récurrents, les évolutions émotionnelles et les fils qui méritent d’être suivis.'
                : 'Aurum connects your pages, reflections, and guided paths to reveal recurring themes, emotional shifts, and the threads worth following over time.'}
            </p>
          </div>

          {/* Pillars — what Magazine does */}
          <div className="grid divide-x divide-stone-100 sm:grid-cols-3">
            <div className="flex flex-col items-center p-7 text-center">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100">
                <ImageIcon className="h-4 w-4 text-stone-600" />
              </div>
              <p className="text-sm font-medium text-stone-900">{isFr ? 'Thèmes récurrents' : 'Recurring themes'}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                {isFr
                  ? 'Les fils communs de ton écriture et les extraits qui les rendent tangibles.'
                  : 'The common threads in your writing, along with the excerpts that make them tangible.'}
              </p>
            </div>
            <div className="flex flex-col items-center p-7 text-center">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100">
                <AlignLeft className="h-4 w-4 text-stone-600" />
              </div>
              <p className="text-sm font-medium text-stone-900">{isFr ? 'Évolutions dans le temps' : 'Shifts over time'}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                {isFr
                  ? 'Lis comment le ton, le bien-être et certains repères changent à travers les semaines.'
                  : 'See how tone, wellbeing, and key signals move across weeks and months.'}
              </p>
            </div>
            <div className="flex flex-col items-center p-7 text-center">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100">
                <Archive className="h-4 w-4 text-stone-600" />
              </div>
              <p className="text-sm font-medium text-stone-900">{isFr ? 'Lectures guidées' : 'Guided readings'}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
                {isFr
                  ? 'Chaque page peut devenir une lecture avec contexte, extraits et pistes pour continuer à réfléchir.'
                  : 'Each page can become a reading with context, excerpts, and cues for where to reflect next.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-stone-100 bg-stone-50/60 px-10 py-6">
            <Button
              asChild
              className="bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              <Link href={to("/sanctuary/write")}>
                <PenSquare className="mr-2 h-4 w-4" />
                {isFr ? 'Écrire une page' : 'Write an entry'}
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
              {isBackfilling ? (isFr ? 'Actualisation...' : 'Refreshing...') : (isFr ? 'Actualiser depuis Journal' : 'Refresh from Journal')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dashboard stats */}
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
