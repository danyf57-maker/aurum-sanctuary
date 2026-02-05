
"use client";

import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { JournalEntry } from "@/lib/types";
import { motion } from "framer-motion";
import { Sparkles, Activity, ShieldCheck } from "lucide-react";

type ClarityScoreCardProps = {
  entries: JournalEntry[];
};

export function ClarityScoreCard({ entries }: ClarityScoreCardProps) {
  // Logic: Calculate a "Clarity Score" (0-100)
  // Higher if: regular entries, balanced sentiment (not just extreme highs/lows), and tags variety
  const score = useMemo(() => {
    if (entries.length === 0) return 0;
    
    const baseScore = Math.min(entries.length * 5, 40); // Base for usage (max 40)
    
    // Recent consistency (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentEntries = entries.filter(e => {
        const d = e.createdAt?.toDate ? e.createdAt.toDate() : new Date(e.createdAt);
        return d > weekAgo;
    });
    const consistencyScore = Math.min(recentEntries.length * 10, 40); // (max 40)
    
    // Depth (avg content length or tags)
    const totalTags = entries.reduce((acc, e) => acc + (e.tags?.length || 0), 0);
    const depthScore = Math.min((totalTags / entries.length) * 10, 20); // (max 20)
    
    return baseScore + consistencyScore + depthScore;
  }, [entries]);

  const getStatus = (s: number) => {
    if (s > 80) return { label: "Optimale", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (s > 50) return { label: "Stable", color: "text-amber-500", bg: "bg-amber-500/10" };
    return { label: "En progression", color: "text-stone-500", bg: "bg-stone-500/10" };
  };

  const status = getStatus(score);

  return (
    <Card className="relative overflow-hidden border-none bg-stone-900 text-stone-50 shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles className="h-32 w-32" />
      </div>
      
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-100">Performance Mentale</span>
            </div>
            
            <h2 className="text-3xl font-bold font-headline">Indice de Clarté</h2>
            <p className="text-stone-400 max-w-sm text-sm leading-relaxed">
              Votre score est basé sur la régularité de vos sessions et la profondeur de vos introspections.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center">
              <svg className="h-24 w-24 transform -rotate-90">
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
                <span className="text-[10px] uppercase font-bold opacity-40">/ 100</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Statut actuel</span>
                <div className={`px-3 py-1 rounded-lg font-bold text-xs ${status.bg} ${status.color}`}>
                    {status.label}
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
