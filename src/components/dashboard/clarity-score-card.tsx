"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { JournalEntry } from "@/lib/types";
import { motion } from "framer-motion";
import { ShieldCheck, Waves } from "lucide-react";
import { useLocale } from "@/hooks/use-locale";

type ClarityScoreCardProps = {
  entries: JournalEntry[];
};

export function ClarityScoreCard({ entries }: ClarityScoreCardProps) {
  const locale = useLocale();
  const isFr = locale === "fr";

  const score = useMemo(() => {
    if (entries.length === 0) return 0;

    const baseScore = Math.min(entries.length * 5, 40);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentEntries = entries.filter((e) => {
      const createdAt = e.createdAt as any;
      const d = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
      return d > weekAgo;
    });
    const consistencyScore = Math.min(recentEntries.length * 10, 40);

    const totalTags = entries.reduce(
      (acc, e) => acc + (e.tags?.length || 0),
      0
    );
    const depthScore = Math.min((totalTags / entries.length) * 10, 20);

    return baseScore + consistencyScore + depthScore;
  }, [entries]);

  const getStatus = (s: number) => {
    if (s > 80) {
      return {
        label: isFr ? "Optimale" : "Optimal",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      };
    }
    if (s > 50) {
      return {
        label: isFr ? "Stable" : "Stable",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      };
    }
    return {
      label: isFr ? "En progression" : "Improving",
      color: "text-stone-500",
      bg: "bg-stone-500/10",
    };
  };

  const status = getStatus(score);

  return (
    <Card className="relative overflow-hidden border-none bg-stone-900 text-stone-50 shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Waves className="h-32 w-32" />
      </div>

      <CardContent className="p-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="space-y-4">
            <div className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-100">
                {isFr ? "Performance mentale" : "Mental Performance"}
              </span>
            </div>

            <h2 className="font-headline text-3xl font-bold">
              {isFr ? "Indice de clarté" : "Clarity Index"}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-stone-400">
              {isFr
                ? "Votre score est basé sur la régularité de vos sessions et la profondeur de vos introspections."
                : "Your score is based on session consistency and depth of introspection."}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={264}
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-amber-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold">{Math.round(score)}</span>
                <span className="text-[10px] font-bold uppercase opacity-40">
                  / 100
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                {isFr ? "Statut actuel" : "Current status"}
              </span>
              <div
                className={`rounded-lg px-3 py-1 text-xs font-bold ${status.bg} ${status.color}`}
              >
                {status.label}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
