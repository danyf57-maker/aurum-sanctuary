'use client';

import type { ComponentType } from 'react';
import { BookImage, Calendar, Flame, Type } from 'lucide-react';

type MagazineStatsProps = {
  totalEntries: number;
  streakDays: number;
  thisMonthCount: number;
  avgWords: number;
};

type StatCardProps = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-stone-500">
        <Icon className="h-4 w-4 text-[#C5A059]" />
        <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
      </div>
      <p className="mt-2 font-headline text-3xl text-stone-900">{value}</p>
    </article>
  );
}

export function MagazineStats({ totalEntries, streakDays, thisMonthCount, avgWords }: MagazineStatsProps) {
  return (
    <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard icon={BookImage} label="Entrees" value={String(totalEntries)} />
      <StatCard icon={Flame} label="Streak" value={`${streakDays} j`} />
      <StatCard icon={Calendar} label="Ce mois" value={String(thisMonthCount)} />
      <StatCard icon={Type} label="Moy. mots" value={String(avgWords)} />
    </section>
  );
}
