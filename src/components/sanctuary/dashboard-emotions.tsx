'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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

const MOOD_COLORS: Record<string, string> = {
  joyeux: '#FACC15',
  calme: '#60A5FA',
  anxieux: '#FB923C',
  triste: '#818CF8',
  energique: '#4ADE80',
  neutre: '#A8A29E',
};

const MOOD_SCORES: Record<string, number> = {
  triste: 1,
  anxieux: 2,
  neutre: 3,
  calme: 4,
  joyeux: 5,
  energique: 5,
};

const MOOD_LABELS: Record<number, string> = {
  1: 'triste',
  2: 'anxieux',
  3: 'neutre',
  4: 'calme',
  5: 'joyeux',
};

type DashboardEmotionsProps = {
  issues: MagazineIssue[];
};

export function DashboardEmotions({ issues }: DashboardEmotionsProps) {
  const moodDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const issue of issues) {
      const mood = issue.mood || 'neutre';
      counts.set(mood, (counts.get(mood) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([mood, value]) => ({
        mood,
        value,
        color: MOOD_COLORS[mood] || '#A8A29E',
      }))
      .sort((a, b) => b.value - a.value);
  }, [issues]);

  const dominantMood = moodDistribution[0]?.mood || 'neutre';

  const moodTimeline = useMemo(() => {
    return issues
      .filter((i) => i.createdAt && i.mood && MOOD_SCORES[i.mood])
      .slice(0, 30)
      .reverse()
      .map((issue) => ({
        date: (issue.createdAt as Date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
        }),
        score: MOOD_SCORES[issue.mood as string],
      }));
  }, [issues]);

  const tagFrequency = useMemo(() => {
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
      .slice(0, 10);
  }, [issues]);

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-center">
        <p className="text-sm text-stone-500">
          Pas encore assez de données pour afficher les statistiques émotionnelles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Donut + Area Chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Donut Chart - Mood Distribution */}
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Répartition des humeurs
          </p>
          <div className="relative mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  dataKey="value"
                  nameKey="mood"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {moodDistribution.map((entry) => (
                    <Cell key={entry.mood} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`${value} entrées`, name]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E7E5E4',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold capitalize text-stone-800">{dominantMood}</p>
                <p className="text-[10px] text-stone-400">dominant</p>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {moodDistribution.map((entry) => (
              <div key={entry.mood} className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[10px] capitalize text-stone-500">
                  {entry.mood} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Area Chart - Mood Evolution */}
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Évolution de l&apos;humeur
          </p>
          {moodTimeline.length < 3 ? (
            <div className="mt-3 flex h-56 items-center justify-center text-sm text-stone-400">
              Pas assez de données (minimum 3 entrées avec humeur)
            </div>
          ) : (
            <div className="mt-3 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodTimeline}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C5A059" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#A8A29E' }}
                    tickMargin={8}
                    minTickGap={20}
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(v) => MOOD_LABELS[v] || ''}
                    tick={{ fontSize: 10, fill: '#A8A29E' }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number) => [MOOD_LABELS[Math.round(value)] || value, 'Humeur']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E7E5E4',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#C5A059"
                    strokeWidth={2}
                    fill="url(#goldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </div>

      {/* Row 2: Tag Frequency Bar Chart */}
      {tagFrequency.length > 0 && (
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Tags les plus fréquents
          </p>
          <div className="mt-3 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagFrequency} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#A8A29E' }} />
                <YAxis
                  type="category"
                  dataKey="tag"
                  tick={{ fontSize: 11, fill: '#57534E' }}
                  width={100}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} entrées`, 'Fréquence']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E7E5E4',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#C5A059" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      )}
    </div>
  );
}
