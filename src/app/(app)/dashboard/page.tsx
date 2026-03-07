"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { getEntries } from "@/lib/firebase/firestore";
import { JournalEntry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ShieldAlert, PenSquare, ArrowRight, Eye } from "lucide-react";
import { StatsSummaryCards } from "@/components/stats/stats-summary-cards";
import { EntryHeatmap } from "@/components/stats/entry-heatmap";
import { ClarityScoreCard } from "@/components/dashboard/clarity-score-card";
import { LastInsightCard } from "@/components/dashboard/last-insight-card";
import { motion } from "framer-motion";
import { useLocale } from "@/hooks/use-locale";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const locale = useLocale();
  const isFr = locale === "fr";

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
        console.error("Failed to fetch entries:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 rounded-full bg-red-50 p-4 text-red-600">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">
          {isFr ? "Accès restreint" : "Restricted access"}
        </h1>
        <p className="mb-8 max-w-sm text-stone-500">
          {isFr
            ? "Vous devez être connecté pour accéder à votre centre de commande."
            : "You must be signed in to access your command center."}
        </p>
        <Button asChild size="lg">
          <Link href="/login">{isFr ? "Se connecter" : "Sign in"}</Link>
        </Button>
      </div>
    );
  }

  const firstName = (user?.displayName ?? "").split(" ")[0] || "Daniel";
  const lastEntryWithAnalysis = entries.find((e) => e.insight) || entries[0];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="font-headline text-4xl font-bold tracking-tight text-stone-900">
            {isFr ? "Centre de clarté" : "Command Center"}
          </h1>
          <p className="font-medium text-stone-500">
            {isFr
              ? `Heureux de vous revoir, ${firstName}.`
              : `Good to see you again, ${firstName}.`}
          </p>
        </motion.div>

        <Button
          asChild
          size="lg"
          className="group rounded-xl bg-stone-900 px-8 text-stone-50 shadow-xl transition-all hover:bg-stone-800 hover:shadow-2xl"
        >
          <Link href="/sanctuary/write">
            <PenSquare className="mr-2 h-4 w-4" />
            {isFr ? "Ouvrir la page d'écriture" : "Open writing space"}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </header>

      <div className="grid gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ClarityScoreCard entries={entries} />
        </motion.div>

        <div className="grid gap-8 md:grid-cols-12">
          <motion.div
            className="md:col-span-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {lastEntryWithAnalysis ? (
              <LastInsightCard entry={lastEntryWithAnalysis} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-8 text-center">
                <Eye className="mb-4 h-8 w-8 text-stone-300" />
                <h3 className="font-bold text-stone-400">
                  {isFr ? "Aucun écho" : "No reflection yet"}
                </h3>
                <p className="mt-1 max-w-[200px] text-sm text-stone-400">
                  {isFr
                    ? "Écrivez pour recevoir un premier reflet d'Aurum."
                    : "Write to receive your first reflection from Aurum."}
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            className="space-y-4 md:col-span-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatsSummaryCards entries={entries} layout="stack" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border/40 bg-white/50 p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500">
              {isFr ? "Fréquence d'introspection" : "Writing frequency"}
            </h3>
            <Link
              href="/insights"
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              {isFr ? "Voir les analyses complètes" : "View full insights"}
            </Link>
          </div>
          <EntryHeatmap entries={entries} />
        </motion.div>
      </div>
    </div>
  );
}
