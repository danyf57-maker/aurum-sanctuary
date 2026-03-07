'use client';

import Link from 'next/link';
import { Loader2, Activity } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { RyffDimensionScores } from '@/lib/types';
import { useLocale } from '@/hooks/use-locale';

type WellbeingRadarProps = {
  aiScores: RyffDimensionScores | null;
  questionnaireScores: RyffDimensionScores | null;
  narrative: string | null;
  computedAt: Date | null;
  isLoading: boolean;
  onRequestAnalysis: () => void;
  onOpenQuestionnaire: () => void;
  canAnalyze: boolean;
};

const DIMENSION_KEYS: (keyof RyffDimensionScores)[] = [
  'acceptationDeSoi',
  'developpementPersonnel',
  'sensDeLaVie',
  'maitriseEnvironnement',
  'autonomie',
  'relationsPositives',
];
const ACTIVE_PLAN_STORAGE_KEY = "aurum-active-plan";

function buildChartData(
  aiScores: RyffDimensionScores | null,
  questionnaireScores: RyffDimensionScores | null,
  labels: Record<keyof RyffDimensionScores, string>
) {
  return DIMENSION_KEYS.map((key) => ({
    dimension: labels[key],
    ai: aiScores?.[key] ?? 0,
    questionnaire: questionnaireScores?.[key] ?? 0,
  }));
}

export function WellbeingRadar({
  aiScores,
  questionnaireScores,
  narrative,
  computedAt,
  isLoading,
  onRequestAnalysis,
  onOpenQuestionnaire,
  canAnalyze,
}: WellbeingRadarProps) {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const t = useTranslations('sanctuary.wellbeingRadar');
  const labels = t.raw('labels') as Record<keyof RyffDimensionScores, string>;
  const fullLabels = t.raw('fullLabels') as Record<keyof RyffDimensionScores, string>;
  const hints = t.raw('hints') as Record<keyof RyffDimensionScores, string>;
  const writingBenefits = t.raw('writingBenefits') as Record<keyof RyffDimensionScores, string>;
  const starters = t.raw('starters') as Record<keyof RyffDimensionScores, string>;
  const plans = t.raw('plans') as Record<keyof RyffDimensionScores, string[]>;

  const hasAny = aiScores || questionnaireScores;
  const data = buildChartData(aiScores, questionnaireScores, labels);
  const activeScores = aiScores ?? questionnaireScores;
  const sortedDimensions = activeScores
    ? (Object.entries(activeScores) as [keyof RyffDimensionScores, number][]).sort(
        (a, b) => b[1] - a[1]
      )
    : [];
  const strongestDimension = sortedDimensions[0]?.[0] ?? null;
  const growthDimension = sortedDimensions[sortedDimensions.length - 1]?.[0] ?? null;
  const journalHref =
    growthDimension != null
      ? `/sanctuary/write?initial=${encodeURIComponent(
          `${t('planTitle')}\n${plans[growthDimension][0]}\n\n${t('actionPrompt')}`
        )}`
      : '/sanctuary/write';

  const handleApplyPlan = () => {
    if (typeof window === "undefined" || !growthDimension) return;
    const steps = plans[growthDimension];
    localStorage.setItem(
      ACTIVE_PLAN_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        source: "wellbeing",
        title: t('planTitle'),
        steps,
        currentStep: 0,
        createdAt: new Date().toISOString(),
      })
    );
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C5A059]/10">
              <Activity className="h-3.5 w-3.5 text-[#C5A059]" />
            </div>
            <h2 className="font-headline text-xl text-stone-900">
              {t('title')}
            </h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {t('subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRequestAnalysis}
            disabled={isLoading || !canAnalyze}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:border-[#C5A059] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : t('analyzePages')}
          </button>
          <button
            type="button"
            onClick={onOpenQuestionnaire}
            className="rounded-xl border border-[#C5A059]/50 bg-[#C5A059]/10 px-3 py-1.5 text-xs text-[#7A5D24] transition-colors hover:bg-[#C5A059]/20"
          >
            {t('guidedPath')}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!hasAny && !isLoading && (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-6 text-center">
          <Activity className="mx-auto h-8 w-8 text-stone-400" />
          <div className="mt-3 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            {t('recommended')}
          </div>
          <p className="mt-3 text-sm text-stone-600">
            {t('emptyQuickOption')}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            {t('emptyOutcome')}
          </p>
          {!canAnalyze && (
            <p className="mt-1 text-xs text-stone-400">
              {t('emptyAnalyzeRequirement')}
            </p>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !hasAny && (
        <div className="mt-6 flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#C5A059]" />
          <span className="ml-3 text-sm text-stone-500">
            {t('analysisInProgress')}
          </span>
        </div>
      )}

      {/* Chart */}
      {hasAny && (
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
              <PolarGrid stroke="#D6D3D1" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fill: '#78716C' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 6]}
                tick={{ fontSize: 9, fill: '#A8A29E' }}
                tickCount={4}
              />
              {aiScores && (
                <Radar
                  name={t('analysisLegend')}
                  dataKey="ai"
                  stroke="#C5A059"
                  fill="#C5A059"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              )}
              {questionnaireScores && (
                <Radar
                  name={t('questionnaireLegend')}
                  dataKey="questionnaire"
                  stroke="#78716C"
                  fill="transparent"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
              )}
              <Tooltip
                formatter={(value: number, name: string) => [`${value.toFixed(1)} / 6`, name]}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid #E7E5E4',
                  fontSize: '12px',
                }}
              />
              {aiScores && questionnaireScores && <Legend wrapperStyle={{ fontSize: '11px' }} />}
            </RadarChart>
          </ResponsiveContainer>

          {/* Narrative */}
          {(narrative || (strongestDimension && growthDimension)) && (
            <div className="mt-2 rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/5 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A5D24]">
                {t('premiumReading')}
              </p>
              {narrative && (
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{narrative}</p>
              )}
              {strongestDimension && (
                <p className="mt-2 text-xs text-stone-600">
                  <span className="font-medium text-stone-700">
                    {t('currentStrength')}
                  </span>{" "}
                  {fullLabels[strongestDimension]}.
                </p>
              )}
              {growthDimension && (
                <p className="mt-1 text-xs text-stone-600">
                  <span className="font-medium text-stone-700">
                    {t('suggestedMicroAction')}
                  </span>{" "}
                  {hints[growthDimension]}
                </p>
              )}
              {growthDimension && (
                <div className="mt-2 rounded-xl border border-stone-200 bg-white/70 px-3 py-2">
                  <p className="text-xs text-stone-700">
                    <span className="font-medium">
                      {t('whyWriteNow')}
                    </span>{" "}
                    {writingBenefits[growthDimension]}
                  </p>
                  <p className="mt-1 text-xs text-stone-600">
                    <span className="font-medium">
                      {t('helpfulFirstSentence')}
                    </span>{" "}
                    {starters[growthDimension]}
                  </p>
                </div>
              )}
              {growthDimension && (
                <div className="mt-3 rounded-xl border border-[#C5A059]/20 bg-white/70 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7A5D24]/90">
                    {t('planTitle')}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-stone-700">
                    {plans[growthDimension].map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                  <Link
                    href={journalHref}
                    onClick={handleApplyPlan}
                    className="mt-3 inline-flex rounded-lg bg-[#C5A059] px-3 py-1.5 text-xs font-medium text-stone-900 transition-colors hover:bg-[#b8924e]"
                  >
                    {t('applyPlan')}
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Micro-bars breakdown */}
          <div className="mt-4 space-y-2">
            {DIMENSION_KEYS.map((key) => {
              const score = aiScores?.[key] ?? questionnaireScores?.[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-40 truncate text-xs text-stone-600">
                    {fullLabels[key]}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-stone-100">
                    <div
                      className="h-1.5 rounded-full bg-[#C5A059] transition-all duration-500"
                      style={{ width: `${(score / 6) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-stone-500">
                    {score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {computedAt && (
            <p className="mt-4 text-[10px] text-stone-400">
              {t('lastAnalysis')}{' '}
              {computedAt.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
