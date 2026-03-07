"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalEntry } from "@/lib/types";
import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useLocale } from "@/hooks/use-locale";

type LastInsightCardProps = {
  entry: JournalEntry;
};

export function LastInsightCard({ entry }: LastInsightCardProps) {
  const locale = useLocale();
  const isFr = locale === "fr";
  const createdAt = entry.createdAt as any;
  const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);

  return (
    <Card className="group h-full border-border/40 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-stone-500">
          <Compass className="h-4 w-4 text-stone-900" />
          {isFr ? "Dernier Écho Aurum" : "Latest Aurum Reflection"}
        </CardTitle>
        <span className="text-[10px] font-medium text-stone-400">
          {format(date, "d MMMM yyyy", { locale: isFr ? fr : enUS })}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <p className="line-clamp-3 border-l-2 border-stone-200 pl-4 italic leading-relaxed text-stone-700">
            {entry.insight ||
              (isFr
                ? "Aucun reflet disponible pour cette entrée. Commencez à écrire pour recevoir un écho d'Aurum."
                : "No reflection is available for this entry yet. Start writing to receive your first Aurum reflection.")}
          </p>
        </div>

        <Link
          href="/sanctuary"
          className="group flex items-center gap-2 text-xs font-bold text-stone-900 transition-colors hover:text-amber-600"
        >
          {isFr ? "Voir le journal complet" : "Open full journal"}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardContent>
    </Card>
  );
}
