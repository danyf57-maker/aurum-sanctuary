'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  createdAt: Date | null;
  mood: string | null;
};

const LIFE_CATEGORIES: Record<string, string[]> = {
  Travail: ['travail', 'boulot', 'carrière', 'projet', 'réunion', 'bureau', 'professionnel', 'emploi', 'collègue'],
  Relations: ['famille', 'ami', 'amis', 'couple', 'parent', 'enfant', 'relation', 'amour', 'frère', 'soeur'],
  Santé: ['santé', 'sport', 'sommeil', 'méditation', 'énergie', 'corps', 'fatigue', 'repos', 'exercice'],
  Émotions: ['anxiété', 'stress', 'joie', 'tristesse', 'colère', 'peur', 'gratitude', 'bonheur', 'introspection'],
  Loisirs: ['lecture', 'musique', 'voyage', 'nature', 'créativité', 'art', 'film', 'cuisine', 'jeu'],
};

const CATEGORY_COLORS: Record<string, string> = {
  Travail: '#C5A059',
  Relations: '#60A5FA',
  Santé: '#4ADE80',
  Émotions: '#818CF8',
  Loisirs: '#FB923C',
  Autre: '#A8A29E',
};

type DashboardThemesProps = {
  issues: MagazineIssue[];
};

function categorizeTag(tag: string): string {
  const normalized = tag.toLowerCase().trim();
  for (const [category, keywords] of Object.entries(LIFE_CATEGORIES)) {
    if (keywords.some((kw) => normalized.includes(kw))) {
      return category;
    }
  }
  return 'Autre';
}

export function DashboardThemes({ issues }: DashboardThemesProps) {
  const tagCloud = useMemo(() => {
    const counts = new Map<string, number>();
    for (const issue of issues) {
      for (const tag of issue.tags) {
        const normalized = tag.toLowerCase().trim();
        if (normalized) {
          counts.set(normalized, (counts.get(normalized) || 0) + 1);
        }
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25);
  }, [issues]);

  const maxTagCount = tagCloud[0]?.count || 1;

  const categoryByMonth = useMemo(() => {
    const months = new Map<string, Record<string, number>>();

    for (const issue of issues) {
      if (!issue.createdAt) continue;
      const monthKey = issue.createdAt.toLocaleDateString('fr-FR', {
        month: 'short',
        year: '2-digit',
      });

      if (!months.has(monthKey)) {
        months.set(monthKey, {
          Travail: 0,
          Relations: 0,
          Santé: 0,
          Émotions: 0,
          Loisirs: 0,
          Autre: 0,
        });
      }

      const monthData = months.get(monthKey)!;
      for (const tag of issue.tags) {
        const category = categorizeTag(tag);
        monthData[category] = (monthData[category] || 0) + 1;
      }
    }

    // Take last 6 months
    return Array.from(months.entries())
      .map(([month, data]) => ({ month, ...data }))
      .slice(0, 6)
      .reverse();
  }, [issues]);

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-center">
        <p className="text-sm text-stone-500">
          Pas encore assez de données pour afficher les thèmes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tag Cloud */}
      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
          Nuage de sujets
        </p>
        {tagCloud.length === 0 ? (
          <p className="mt-4 text-sm text-stone-400">Aucun tag disponible.</p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2.5 px-2">
            {tagCloud.map((item) => {
              const ratio = item.count / maxTagCount;
              const fontSize = 12 + ratio * 14;
              const opacity = 0.45 + ratio * 0.55;
              return (
                <span
                  key={item.tag}
                  className="inline-block cursor-default rounded-full border border-stone-200 bg-stone-50 px-3 py-1 capitalize transition-transform hover:scale-105"
                  style={{
                    fontSize: `${fontSize}px`,
                    color: ratio > 0.5 ? '#C5A059' : `rgba(120, 113, 108, ${opacity})`,
                    borderColor: ratio > 0.5 ? 'rgba(197, 160, 89, 0.3)' : undefined,
                  }}
                >
                  {item.tag}
                  <span className="ml-1 text-[10px] opacity-60">{item.count}</span>
                </span>
              );
            })}
          </div>
        )}
      </article>

      {/* Life Categories Stacked Bar */}
      {categoryByMonth.length > 0 && (
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Catégories de vie par mois
          </p>
          <div className="mt-3 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#57534E' }} />
                <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E7E5E4',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  iconType="circle"
                  iconSize={8}
                />
                {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={color}
                    radius={category === 'Autre' ? [4, 4, 0, 0] : undefined}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      )}
    </div>
  );
}
