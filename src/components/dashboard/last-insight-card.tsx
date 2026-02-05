
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JournalEntry } from "@/lib/types";
import { Sparkles, ArrowRight, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type LastInsightCardProps = {
  entry: JournalEntry;
};

export function LastInsightCard({ entry }: LastInsightCardProps) {
  const date = entry.createdAt?.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt);
  
  return (
    <Card className="h-full border-border/40 bg-white/50 backdrop-blur-sm group hover:border-amber-500/20 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-stone-900" />
          Dernier Écho IA
        </CardTitle>
        <span className="text-[10px] font-medium text-stone-400">
          {format(date, "d MMMM yyyy", { locale: fr })}
        </span>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <p className="text-stone-700 italic leading-relaxed line-clamp-3 pl-4 border-l-2 border-stone-200">
            {entry.analysis || "Aucune analyse disponible pour cette entrée. Commencez à écrire pour recevoir un écho de l'IA."}
          </p>
        </div>
        
        <Link 
          href={`/sanctuary`} 
          className="flex items-center gap-2 text-xs font-bold text-stone-900 hover:text-amber-600 transition-colors group"
        >
          Voir le journal complet
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardContent>
    </Card>
  );
}
