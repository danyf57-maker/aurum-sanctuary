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

type MoodKey = 'happy' | 'calm' | 'anxious' | 'sad' | 'energized' | 'neutral';

const MOOD_COLORS: Record<MoodKey, string> = {
  happy: '#FACC15',
  calm: '#60A5FA',
  anxious: '#FB923C',
  sad: '#818CF8',
  energized: '#4ADE80',
  neutral: '#A8A29E',
};

const MOOD_SCORES: Record<MoodKey, number> = {
  sad: 1,
  anxious: 2,
  neutral: 3,
  calm: 4,
  happy: 5,
  energized: 5,
};

const MOOD_LABELS: Record<MoodKey, { fr: string; en: string }> = {
  happy: { fr: 'joyeux', en: 'happy' },
  calm: { fr: 'calme', en: 'calm' },
  anxious: { fr: 'anxieux', en: 'anxious' },
  sad: { fr: 'triste', en: 'sad' },
  energized: { fr: 'energique', en: 'energized' },
  neutral: { fr: 'neutre', en: 'neutral' },
};

const SCORE_LABELS: Record<number, MoodKey> = {
  1: 'sad',
  2: 'anxious',
  3: 'neutral',
  4: 'calm',
  5: 'happy',
};

function normalizeMood(rawMood: string | null | undefined): MoodKey {
  const mood = (rawMood || 'neutral')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  const aliases: Record<string, MoodKey> = {
    joyeux: 'happy',
    heureux: 'happy',
    happy: 'happy',
    calm: 'calm',
    calme: 'calm',
    anxious: 'anxious',
    anxieux: 'anxious',
    anxiety: 'anxious',
    sad: 'sad',
    triste: 'sad',
    energized: 'energized',
    energetic: 'energized',
    energique: 'energized',
    neutral: 'neutral',
    neutre: 'neutral',
  };

  return aliases[mood] || 'neutral';
}

function getMoodLabel(mood: MoodKey, isFr: boolean): string {
  return MOOD_LABELS[mood][isFr ? 'fr' : 'en'];
}

type DashboardEmotionsProps = {
  issues: MagazineIssue[];
};

export function DashboardEmotions({ issues }: DashboardEmotionsProps) {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const dateLocale = isFr ? 'fr-FR' : 'en-US';

  const moodDistribution = useMemo(() => {
    const counts = new Map<MoodKey, number>();
    for (const issue of issues) {
      const mood = normalizeMood(issue.mood);
      counts.set(mood, (counts.get(mood) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([mood, value]) => ({
        mood,
        value,
        color: MOOD_COLORS[mood],
      }))
      .sort((a, b) => b.value - a.value);
  }, [issues]);

  const dominantMood = moodDistribution[0]?.mood || 'neutral';

  const moodTimeline = useMemo(() => {
    return issues
      .filter((issue) => issue.createdAt)
      .slice(0, 30)
      .reverse()
      .map((issue) => {
        const mood = normalizeMood(issue.mood);
        return {
          date: (issue.createdAt as Date).toLocaleDateString(dateLocale, {
            day: '2-digit',
            month: '2-digit',
          }),
          score: MOOD_SCORES[mood],
        };
      });
  }, [dateLocale, issues]);

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
          {isFr
            ? 'Pas encore assez de données pour afficher les statistiques émotionnelles.'
            : 'Not enough data yet to show emotional statistics.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            {isFr ? 'Repartition des humeurs' : 'Mood distribution'}
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
                  formatter={(value: number, name: MoodKey) => [
                    `${value} ${isFr ? 'entrees' : 'entries'}`,
                    getMoodLabel(name, isFr),
                  ]}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E7E5E4',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold capitalize text-stone-800">
                  {getMoodLabel(dominantMood, isFr)}
                </p>
                <p className="text-[10px] text-stone-400">{isFr ? 'dominant' : 'dominant mood'}</p>
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {moodDistribution.map((entry) => (
              <div key={entry.mood} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] capitalize text-stone-500">
                  {getMoodLabel(entry.mood, isFr)} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            {isFr ? "Evolution de l'humeur" : 'Mood evolution'}
          </p>
          {moodTimeline.length < 3 ? (
            <div className="mt-3 flex h-56 items-center justify-center text-sm text-stone-400">
              {isFr
                ? 'Pas assez de donnees (minimum 3 entrees avec humeur)'
                : 'Not enough data yet (minimum 3 entries with mood)'}
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
                    tickFormatter={(value) => getMoodLabel(SCORE_LABELS[value as 1 | 2 | 3 | 4 | 5], isFr)}
                    tick={{ fontSize: 10, fill: '#A8A29E' }}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      getMoodLabel(SCORE_LABELS[Math.round(value) as 1 | 2 | 3 | 4 | 5], isFr),
                      isFr ? 'Humeur' : 'Mood',
                    ]}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E7E4E4',
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

      {tagFrequency.length > 0 && (
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            {isFr ? 'Tags les plus frequents' : 'Most frequent tags'}
          </p>
          <div className="mt-3 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagFrequency} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#A8A29E' }} />
                <YAxis type="category" dataKey="tag" tick={{ fontSize: 11, fill: '#57534E' }} width={100} />
                <Tooltip
                  formatter={(value: number) => [
                    `${value} ${isFr ? 'entrees' : 'entries'}`,
                    isFr ? 'Frequence' : 'Frequency',
                  ]}
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
