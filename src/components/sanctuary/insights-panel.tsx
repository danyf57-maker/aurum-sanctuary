'use client';

import { Loader2, Sparkles } from 'lucide-react';

export type WritingPatterns = {
  themes: Array<{
    name: string;
    frequency: number;
    trend: 'up' | 'down' | 'stable';
    entries: string[];
  }>;
  writingTimes: {
    mostActive: 'morning' | 'afternoon' | 'evening' | 'night';
    weekdayVsWeekend: { weekday: number; weekend: number };
  };
  sentimentTrend: {
    current: number;
    change: number;
    trajectory: 'improving' | 'declining' | 'stable';
  };
  suggestions: string[];
};

type InsightsPanelProps = {
  patterns: WritingPatterns | null;
  digest: string;
  isAnalyzing: boolean;
  isDigestLoading: boolean;
  onAnalyze: () => Promise<void>;
  onGenerateDigest: () => Promise<void>;
};

export function InsightsPanel({
  patterns,
  digest,
  isAnalyzing,
  isDigestLoading,
  onAnalyze,
  onGenerateDigest,
}: InsightsPanelProps) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-600">Insights AI</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void onAnalyze()}
            disabled={isAnalyzing}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-1 text-xs text-stone-700 hover:border-[#C5A059] disabled:opacity-60"
          >
            {isAnalyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Analyser'}
          </button>
          <button
            type="button"
            onClick={() => void onGenerateDigest()}
            disabled={isDigestLoading}
            className="rounded-xl border border-[#C5A059]/50 bg-[#C5A059]/10 px-3 py-1 text-xs text-[#7A5D24] disabled:opacity-60"
          >
            {isDigestLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Digest'}
          </button>
        </div>
      </div>

      {!patterns ? (
        <div className="mt-3 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-4 text-sm text-stone-600">
          Lance une analyse pour voir themes recurrents, rythmes decriture et evolution emotionnelle.
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-stone-700">Themes recurrents</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {patterns.themes.map((theme) => (
                <span key={theme.name} className="rounded-full border border-stone-300 bg-stone-50 px-2 py-1 text-xs text-stone-600">
                  {theme.name} ({theme.frequency})
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
              <p className="font-semibold text-stone-700">Moment actif</p>
              <p className="mt-1">{patterns.writingTimes.mostActive}</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
              <p className="font-semibold text-stone-700">Tendance emotionnelle</p>
              <p className="mt-1">
                {patterns.sentimentTrend.trajectory} ({patterns.sentimentTrend.change > 0 ? '+' : ''}
                {patterns.sentimentTrend.change})
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-700">Suggestions</p>
            <ul className="mt-2 space-y-1 text-sm text-stone-600">
              {patterns.suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={`${suggestion}-${index}`} className="flex gap-2">
                  <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[#C5A059]" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {digest && (
        <article className="mt-4 rounded-xl border border-[#C5A059]/30 bg-[#C5A059]/5 p-4">
          <p className="text-xs font-semibold text-[#7A5D24]">Digest hebdomadaire</p>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-stone-700">{digest}</pre>
        </article>
      )}
    </section>
  );
}
