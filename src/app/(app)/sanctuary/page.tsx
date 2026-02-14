"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { JournalMagazineCard } from "@/components/journal/journal-magazine-card";
import { SentimentChart } from "@/components/journal/sentiment-chart";
import { MoodTrendsChart } from "@/components/stats/mood-trends-chart";
import { SentimentPieChart } from "@/components/stats/sentiment-pie-chart";
import { EntryHeatmap } from "@/components/stats/entry-heatmap";
import { TagFilter } from "@/components/journal/tag-filter";
import { Button } from "@/components/ui/button";
import { getEntries, getUniqueTags } from "@/lib/firebase/firestore";
import { useAuth } from "@/providers/auth-provider";
import { JournalEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import placeholderImages from "@/lib/placeholder-images.json";
import { PenSquare, ShieldAlert, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { firestore as db } from "@/lib/firebase/web-client";

export const dynamic = "force-dynamic";

type AurumExchange = {
  id: string;
  role: "user" | "aurum";
  text: string;
  createdAt: Date;
};

async function getAurumExchanges(
  userId: string,
  entryId: string
): Promise<AurumExchange[]> {
  try {
    const conversationRef = collection(
      db,
      "users",
      userId,
      "entries",
      entryId,
      "aurumConversation"
    );
    const q = query(conversationRef, orderBy("createdAt", "desc"), limit(3));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role === "user" ? "user" : "aurum",
        text: String(data.text || ""),
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  } catch (error) {
    console.error("Failed to fetch Aurum exchanges:", error);
    return [];
  }
}

function AurumExchangePreview({ exchanges }: { exchanges: AurumExchange[] }) {
  const aurumMessages = exchanges.filter((e) => e.role === "aurum");
  if (aurumMessages.length === 0) return null;

  const latestAurum = aurumMessages[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-50/60 to-stone-50/40 border border-amber-200/30"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">
          Réflexion d&apos;Aurum
        </span>
      </div>
      <p className="text-sm text-stone-700 line-clamp-3 leading-relaxed">
        {latestAurum.text}
      </p>
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
    <div className="flex flex-col">
      <JournalMagazineCard entry={entry} index={index} />
      {!loading && exchanges.length > 0 && (
        <AurumExchangePreview exchanges={exchanges} />
      )}
    </div>
  );
}

function SanctuaryPageContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const tag = searchParams.get("tag");
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
        console.error("Failed to fetch sanctuary data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger votre journal.",
          variant: "destructive",
        });
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user, authLoading, tag, toast]);

  if (loading || authLoading) {
    return (
      <div className="container max-w-7xl py-8 md:py-12">
        <div className="mb-8 flex justify-between items-center">
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <div className="space-y-12">
          <Skeleton className="h-[350px] w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[220px] w-full" />
            ))}
          </div>
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
            Vous devez être connecté pour voir votre historique.
          </AlertDescription>
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
        <header className="mb-12 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-4xl font-bold font-headline tracking-tight">
                Votre Journal
              </h1>
              <p className="mt-2 text-muted-foreground">
                Bienvenue dans votre sanctuaire,{" "}
                {(user.displayName ?? "") || "cher explorateur"}.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <TagFilter tags={tags} />
          </div>
        </header>

        {entries && entries.length > 0 ? (
          <div className="space-y-12">
            <div
              className="animate-fade-in"
              style={{ animationDelay: "150ms" }}
            >
              <SentimentChart entries={entries} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div
                className="animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                <MoodTrendsChart entries={entries} days={30} />
              </div>
              <div
                className="animate-fade-in"
                style={{ animationDelay: "250ms" }}
              >
                <SentimentPieChart entries={entries} />
              </div>
            </div>
            <div
              className="animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              <EntryHeatmap entries={entries} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry, i) => (
                <EntryWithExchange
                  key={entry.id}
                  entry={entry}
                  index={i}
                  userId={user.uid}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg animate-fade-in flex flex-col items-center">
            <Image
              src={placeholderImages["sanctuary-empty"].src}
              alt={placeholderImages["sanctuary-empty"].alt}
              width={placeholderImages["sanctuary-empty"].width}
              height={placeholderImages["sanctuary-empty"].height}
              data-ai-hint={placeholderImages["sanctuary-empty"].hint}
              className="max-w-sm w-full h-auto rounded-lg mb-8 opacity-80"
            />
            <h3 className="text-xl font-semibold">Votre sanctuaire attend.</h3>
            <p className="text-muted-foreground mt-2">
              Le voyage de mille lieues commence par un seul mot.
            </p>
          </div>
        )}
      </div>
      <Button
        asChild
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-stone-600 text-white hover:bg-stone-700"
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
          <div className="mb-8 flex justify-between items-center">
            <Skeleton className="h-10 w-[200px]" />
          </div>
          <div className="space-y-12">
            <Skeleton className="h-[350px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[220px] w-full" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SanctuaryPageContent />
    </Suspense>
  );
}
