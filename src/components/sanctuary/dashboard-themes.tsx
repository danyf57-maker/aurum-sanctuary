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
import { useLocale } from '@/hooks/use-locale';

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  createdAt: Date | null;
  mood: string | null;
};

type CategoryKey = 'work' | 'relationships' | 'health' | 'emotions' | 'leisure' | 'other';

const CATEGORY_CONFIG: Record<CategoryKey, { keywords: string[]; labels: { fr: string; en: string }; color: string }> = {
  work: {
    keywords: ['travail', 'boulot', 'carriere', 'career', 'work', 'projet', 'project', 'reunion', 'meeting', 'bureau', 'office', 'professionnel', 'professional', 'emploi', 'job', 'collegue', 'colleague'],
    labels: { fr: 'Travail', en: 'Work' },
    color: '#C5A059',
  },
  relationships: {
    keywords: ['famille', 'family', 'ami', 'amis', 'friend', 'friends', 'couple', 'partner', 'parent', 'enfant', 'child', 'children', 'relation', 'relationship', 'amour', 'love', 'frere', 'soeur', 'brother', 'sister'],
    labels: { fr: 'Relations', en: 'Relationships' },
    color: '#60A5FA',
  },
  health: {
    keywords: ['sante', 'health', 'sport', 'sommeil', 'sleep', 'meditation', 'energie', 'energy', 'corps', 'body', 'fatigue', 'repos', 'rest', 'exercice', 'exercise'],
    labels: { fr: 'Sante', en: 'Health' },
    color: '#4ADE80',
  },
  emotions: {
    keywords: ['anxiete', 'anxiety', 'stress', 'joie', 'joy', 'tristesse', 'sadness', 'colere', 'anger', 'peur', 'fear', 'gratitude', 'bonheur', 'happiness', 'emotion', 'emotions', 'introspection'],
    labels: { fr: 'Emotions', en: 'Emotions' },
    color: '#818CF8',
  },
  leisure: {
    keywords: ['lecture', 'reading', 'musique', 'music', 'voyage', 'travel', 'nature', 'creativite', 'creativity', 'art', 'film', 'movie', 'cinema', 'cuisine', 'cooking', 'jeu', 'game', 'games'],
    labels: { fr: 'Loisirs', en: 'Leisure' },
    color: '#FB923C',
  },
  other: {
    keywords: [],
    labels: { fr: 'Autre', en: 'Other' },
    color: '#A8A29E',
  },
};

function normalizeValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function categorizeTag(tag: string): CategoryKey {
  const normalized = normalizeValue(tag);
  for (const [category, config] of Object.entries(CATEGORY_CONFIG) as [CategoryKey, (typeof CATEGORY_CONFIG)[CategoryKey]][]) {
    if (category !== 'other' && config.keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }
  return 'other';
}

function getCategoryLabel(category: CategoryKey, isFr: boolean): string {
  return CATEGORY_CONFIG[category].labels[isFr ? 'fr' : 'en'];
}

type DashboardThemesProps = {
  issues: MagazineIssue[];
};

export function DashboardThemes({ issues }: DashboardThemesProps) {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const dateLocale = isFr ? 'fr-FR' : 'en-US';

  const tagCloud = useMemo(() => {
    const counts = new Map<string, number>();
    for (const issue of issues) {
      for (const tag of issue.tags) {
        const normalized = normalizeValue(tag);
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
    const months = new Map<string, Record<CategoryKey | 'month', number | string>>();

    for (const issue of issues) {
      if (!issue.createdAt) continue;
      const monthKey = issue.createdAt.toLocaleDateString(dateLocale, {
        month: 'short',
        year: '2-digit',
      });

      if (!months.has(monthKey)) {
        months.set(monthKey, {
          month: monthKey,
          work: 0,
          relationships: 0,
          health: 0,
          emotions: 0,
          leisure: 0,
          other: 0,
        });
      }

      const monthData = months.get(monthKey)!;
      for (const tag of issue.tags) {
        const category = categorizeTag(tag);
        monthData[category] = Number(monthData[category] || 0) + 1;
      }
    }

    return Array.from(months.values()).slice(0, 6).reverse();
  }, [dateLocale, issues]);

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-center">
        <p className="text-sm text-stone-500">
          {isFr ? 'Pas encore assez de donnees pour afficher les themes.' : 'Not enough data yet to show themes.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
          {isFr ? 'Nuage de sujets' : 'Topic cloud'}
        </p>
        {tagCloud.length === 0 ? (
          <p className="mt-4 text-sm text-stone-400">{isFr ? 'Aucun tag disponible.' : 'No tags available yet.'}</p>
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

      {categoryByMonth.length > 0 && (
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            {isFr ? 'Categories de vie par mois' : 'Life categories by month'}
          </p>
          <div className="mt-3 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#57534E' }} />
                <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value,
                    getCategoryLabel(name as CategoryKey, isFr),
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E7E5E4',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value: string) => getCategoryLabel(value as CategoryKey, isFr)}
                  wrapperStyle={{ fontSize: '11px' }}
                  iconType="circle"
                  iconSize={8}
                />
                {(Object.keys(CATEGORY_CONFIG) as CategoryKey[]).map((category) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    name={category}
                    fill={CATEGORY_CONFIG[category].color}
                    radius={category === 'other' ? [4, 4, 0, 0] : undefined}
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
