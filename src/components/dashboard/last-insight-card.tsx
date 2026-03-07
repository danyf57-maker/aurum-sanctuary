"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalEntry } from "@/lib/types";
import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import { useLocalizedHref } from "@/hooks/use-localized-href";

type LastInsightCardProps = {
  entry: JournalEntry;
};

export function LastInsightCard({ entry }: LastInsightCardProps) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const to = useLocalizedHref();
  const createdAt = entry.createdAt as any;
  const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  const formattedDate = new Intl.DateTimeFormat(isFr ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return (
    <Card className="h-full border-border/40 bg-white/50 backdrop-blur-sm group hover:border-amber-500/20 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
          <Compass className="h-4 w-4 text-stone-900" />
          {isFr ? "Dernier Écho Aurum" : "Latest Aurum Echo"}
        </CardTitle>
        <span className="text-[10px] font-medium text-stone-400">{formattedDate}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <p className="text-stone-700 italic leading-relaxed line-clamp-3 pl-4 border-l-2 border-stone-200">
            {entry.insight ||
              (isFr
                ? "Aucun reflet disponible pour cette entrée. Commencez à écrire pour recevoir un premier écho d'Aurum."
                : "No reflection is available for this entry yet. Start writing to receive your first Aurum echo.")}
          </p>
        </div>

        <Link
          href={to("/sanctuary")}
          className="flex items-center gap-2 text-xs font-bold text-stone-900 hover:text-amber-600 transition-colors group"
        >
          {isFr ? "Voir le journal complet" : "View full journal"}
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  );
}
