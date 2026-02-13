'use client';

import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type MoodPoint = {
  dateLabel: string;
  score: number;
};

type MoodChartProps = {
  last30Days: MoodPoint[];
  distribution: { mood: string; value: number; color: string }[];
};

const scoreLabel: Record<number, string> = {
  1: 'triste',
  2: 'anxieux',
  3: 'neutre',
  4: 'calme',
  5: 'joyeux',
};

export function MoodChart({ last30Days, distribution }: MoodChartProps) {
  if (last30Days.length === 0 && distribution.length === 0) return null;

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">Humeur - 30 jours</p>
        <div className="mt-3 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last30Days}>
              <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} tickMargin={8} minTickGap={16} />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) => scoreLabel[value] || String(value)}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => scoreLabel[Math.round(value)] || String(value)}
                labelFormatter={(label: string) => `Jour: ${label}`}
              />
              <Line type="monotone" dataKey="score" stroke="#C5A059" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">Distribution</p>
        <div className="mt-3 h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={distribution} dataKey="value" nameKey="mood" cx="50%" cy="50%" outerRadius={72} label>
                {distribution.map((entry) => (
                  <Cell key={entry.mood} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
