'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Progress } from '@/components/ui/progress';

type MagazineIssue = {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  tags: string[];
  createdAt: Date | null;
  mood: string | null;
};

type DashboardProgressionProps = {
  issues: MagazineIssue[];
};

type Period = 30 | 90 | 365;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

export function DashboardProgression({ issues }: DashboardProgressionProps) {
  const [period, setPeriod] = useState<Period>(30);

  const now = useMemo(() => startOfDay(new Date()), []);

  // Daily entry counts for the selected period
  const dailyCounts = useMemo(() => {
    const cutoff = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
    const filtered = issues.filter((i) => i.createdAt && i.createdAt >= cutoff);

    const countMap = new Map<string, number>();
    for (const issue of filtered) {
      const key = (issue.createdAt as Date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      });
      countMap.set(key, (countMap.get(key) || 0) + 1);
    }

    // Fill in missing days for a smooth chart
    const result: { date: string; count: number }[] = [];
    const step = period <= 30 ? 1 : period <= 90 ? 2 : 7;
    for (let i = period - 1; i >= 0; i -= step) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      let count = 0;
      // Sum entries for this step range
      for (let j = 0; j < step; j++) {
        const dd = new Date(now.getTime() - (i + j) * 24 * 60 * 60 * 1000);
        const kk = dd.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        count += countMap.get(kk) || 0;
      }
      result.push({ date: key, count });
    }
    return result;
  }, [issues, period, now]);

  // Monthly entry counts (last 6 months)
  const monthlyCounts = useMemo(() => {
    const months = new Map<string, number>();
    const monthOrder: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      months.set(key, 0);
      monthOrder.push(key);
    }

    for (const issue of issues) {
      if (!issue.createdAt) continue;
      const key = issue.createdAt.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      if (months.has(key)) {
        months.set(key, (months.get(key) || 0) + 1);
      }
    }

    const currentMonth = monthOrder[monthOrder.length - 1];
    return monthOrder.map((month) => ({
      month,
      count: months.get(month) || 0,
      isCurrent: month === currentMonth,
    }));
  }, [issues, now]);

  // Period comparison
  const periodComparison = useMemo(() => {
    const cutoffCurrent = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
    const cutoffPrevious = new Date(now.getTime() - period * 2 * 24 * 60 * 60 * 1000);

    const current = issues.filter((i) => i.createdAt && i.createdAt >= cutoffCurrent).length;
    const previous = issues.filter(
      (i) => i.createdAt && i.createdAt >= cutoffPrevious && i.createdAt < cutoffCurrent
    ).length;

    const changePercent = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;
    const trend = current > previous ? 'up' : current < previous ? 'down' : 'stable';

    return { current, previous, changePercent, trend };
  }, [issues, period, now]);

  // Goals
  const goals = useMemo(() => {
    // This week
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const entriesThisWeek = issues.filter(
      (i) => i.createdAt && i.createdAt >= weekStart
    ).length;

    // This month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const entriesThisMonth = issues.filter(
      (i) => i.createdAt && i.createdAt >= monthStart
    ).length;

    // Streak
    const sortedDates = issues
      .filter((i) => i.createdAt)
      .map((i) => startOfDay(i.createdAt as Date).getTime())
      .sort((a, b) => b - a);

    const uniqueDays = [...new Set(sortedDates)];
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    if (uniqueDays.length > 0) {
      const todayTime = startOfDay(new Date()).getTime();
      const yesterday = todayTime - 24 * 60 * 60 * 1000;
      if (uniqueDays[0] === todayTime || uniqueDays[0] === yesterday) {
        currentStreak = 1;
        for (let i = 1; i < uniqueDays.length; i++) {
          if (uniqueDays[i - 1] - uniqueDays[i] === 24 * 60 * 60 * 1000) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      for (let i = 1; i < uniqueDays.length; i++) {
        if (uniqueDays[i - 1] - uniqueDays[i] === 24 * 60 * 60 * 1000) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      entriesThisWeek,
      entriesThisMonth,
      currentStreak,
      longestStreak,
    };
  }, [issues, now]);

  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-center">
        <p className="text-sm text-stone-500">
          Pas encore assez de données pour afficher la progression.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {([30, 90, 365] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`rounded-xl px-4 py-1.5 text-xs font-medium transition-colors ${
              period === p
                ? 'bg-stone-900 text-white'
                : 'border border-stone-300 bg-white text-stone-600 hover:border-stone-400'
            }`}
          >
            {p === 365 ? '1 an' : `${p} jours`}
          </button>
        ))}
      </div>

      {/* Writing Frequency Area Chart */}
      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
          Fréquence d&apos;écriture — {period === 365 ? '1 an' : `${period} jours`}
        </p>
        <div className="mt-3 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyCounts}>
              <defs>
                <linearGradient id="progressGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C5A059" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#A8A29E' }}
                tickMargin={8}
                minTickGap={30}
              />
              <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} allowDecimals={false} />
              <Tooltip
                formatter={(value: number) => [`${value} entrées`, 'Entrées']}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E7E5E4',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#C5A059"
                strokeWidth={2}
                fill="url(#progressGold)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Monthly Bar Chart */}
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Mois par mois
          </p>
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCounts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#57534E' }} />
                <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [`${value} entrées`, 'Entrées']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E7E5E4',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={30}>
                  {monthlyCounts.map((entry) => (
                    <Cell
                      key={entry.month}
                      fill={entry.isCurrent ? '#C5A059' : '#D6D3D1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Goals */}
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Objectifs
          </p>
          <div className="mt-4 space-y-5">
            <GoalItem
              label="3 entrées / semaine"
              current={goals.entriesThisWeek}
              target={3}
            />
            <GoalItem
              label="Série en cours"
              current={goals.currentStreak}
              target={Math.max(goals.longestStreak, 1)}
              suffix="jours"
              showRecord={goals.longestStreak > 0}
              record={goals.longestStreak}
            />
            <GoalItem
              label="Ce mois"
              current={goals.entriesThisMonth}
              target={12}
            />
          </div>
        </article>
      </div>

      {/* Period Comparison */}
      <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
          Comparaison — {period === 365 ? '1 an' : `${period} derniers jours`}
        </p>
        <div className="mt-4 flex items-center gap-6">
          <div>
            <p className="font-headline text-3xl text-stone-900">
              {periodComparison.current}
            </p>
            <p className="text-xs text-stone-500">entrées (période actuelle)</p>
          </div>
          <div className="text-stone-300">vs</div>
          <div>
            <p className="font-headline text-3xl text-stone-400">
              {periodComparison.previous}
            </p>
            <p className="text-xs text-stone-500">entrées (période précédente)</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {periodComparison.trend === 'up' && (
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            )}
            {periodComparison.trend === 'down' && (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )}
            {periodComparison.trend === 'stable' && (
              <Minus className="h-5 w-5 text-stone-400" />
            )}
            <span
              className={`text-sm font-semibold ${
                periodComparison.trend === 'up'
                  ? 'text-emerald-600'
                  : periodComparison.trend === 'down'
                    ? 'text-red-500'
                    : 'text-stone-500'
              }`}
            >
              {periodComparison.changePercent > 0 ? '+' : ''}
              {periodComparison.changePercent}%
            </span>
          </div>
        </div>
      </article>
    </div>
  );
}

function GoalItem({
  label,
  current,
  target,
  suffix,
  showRecord,
  record,
}: {
  label: string;
  current: number;
  target: number;
  suffix?: string;
  showRecord?: boolean;
  record?: number;
}) {
  const percent = Math.min(100, Math.round((current / target) * 100));
  const achieved = current >= target;

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-stone-500">
            {current}/{target} {suffix || 'entrées'}
          </span>
          {achieved && (
            <span className="rounded-full bg-[#C5A059]/15 px-2 py-0.5 text-[10px] font-medium text-[#7A5D24]">
              Atteint
            </span>
          )}
        </div>
      </div>
      <Progress value={percent} className="mt-1.5 h-2" />
      {showRecord && record !== undefined && (
        <p className="mt-1 text-[10px] text-stone-400">
          Record : {record} jours
        </p>
      )}
    </div>
  );
}
