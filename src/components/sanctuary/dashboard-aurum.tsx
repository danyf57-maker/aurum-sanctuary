'use client';

import { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export type AurumConversationStats = {
  totalConversations: number;
  totalMessages: number;
  thisMonth: number;
  avgMessagesPerConversation: number;
  messagesByMonth: { month: string; count: number }[];
  recentThemes: string[];
};

type DashboardAurumProps = {
  stats: AurumConversationStats | null;
  isLoading: boolean;
};

export function DashboardAurum({ stats, isLoading }: DashboardAurumProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!stats || stats.totalConversations === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-8 text-center">
        <MessageCircle className="mx-auto h-8 w-8 text-stone-400" />
        <p className="mt-3 text-sm text-stone-600">
          Pas encore de conversations avec Aurum.
        </p>
        <p className="mt-1 text-xs text-stone-400">
          Écris une entrée et lance une réflexion pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Conversations totales"
          value={stats.totalConversations}
          subtitle="avec Aurum"
        />
        <KpiCard
          label="Ce mois"
          value={stats.thisMonth}
          subtitle="conversations"
        />
        <KpiCard
          label="Moy. messages"
          value={stats.avgMessagesPerConversation.toFixed(1)}
          subtitle="par conversation"
        />
      </div>

      {/* Messages by Month Area Chart */}
      {stats.messagesByMonth.length > 1 && (
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Messages par mois
          </p>
          <div className="mt-3 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.messagesByMonth}>
                <defs>
                  <linearGradient id="aurumGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#57534E' }} />
                <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} />
                <Tooltip
                  formatter={(value: number) => [`${value} messages`, 'Messages']}
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
                  fill="url(#aurumGold)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      )}

      {/* Recent Themes */}
      {stats.recentThemes.length > 0 && (
        <article className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">
            Thèmes abordés avec Aurum
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {stats.recentThemes.map((theme) => (
              <span
                key={theme}
                className="rounded-full border border-[#C5A059]/30 bg-[#C5A059]/10 px-3 py-1 text-xs text-[#7A5D24]"
              >
                {theme}
              </span>
            ))}
          </div>
        </article>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string | number;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 border-l-4 border-l-[#C5A059] bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
        {label}
      </p>
      <p className="mt-1 font-headline text-2xl text-stone-900">{value}</p>
      <p className="text-[10px] text-stone-400">{subtitle}</p>
    </div>
  );
}
