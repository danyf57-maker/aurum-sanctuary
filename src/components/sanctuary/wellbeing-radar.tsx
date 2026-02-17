'use client';

import { Loader2, Activity } from 'lucide-react';
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

const DIMENSION_LABELS: Record<keyof RyffDimensionScores, string> = {
  acceptationDeSoi: 'Acceptation de soi',
  developpementPersonnel: 'Développement',
  sensDeLaVie: 'Sens de la vie',
  maitriseEnvironnement: 'Maîtrise',
  autonomie: 'Autonomie',
  relationsPositives: 'Relations',
};

const DIMENSION_FULL_LABELS: Record<keyof RyffDimensionScores, string> = {
  acceptationDeSoi: 'Acceptation de soi',
  developpementPersonnel: 'Développement personnel',
  sensDeLaVie: 'Sens de la vie',
  maitriseEnvironnement: "Maîtrise de l'environnement",
  autonomie: 'Autonomie',
  relationsPositives: 'Relations positives',
};

const DIMENSION_KEYS = Object.keys(DIMENSION_LABELS) as (keyof RyffDimensionScores)[];

function buildChartData(
  aiScores: RyffDimensionScores | null,
  questionnaireScores: RyffDimensionScores | null
) {
  return DIMENSION_KEYS.map((key) => ({
    dimension: DIMENSION_LABELS[key],
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
  const hasAny = aiScores || questionnaireScores;
  const data = buildChartData(aiScores, questionnaireScores);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C5A059]/10">
              <Activity className="h-3.5 w-3.5 text-[#C5A059]" />
            </div>
            <h2 className="font-headline text-xl text-stone-900">Bien-être psychologique</h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">Modèle de Ryff &middot; 6 dimensions</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRequestAnalysis}
            disabled={isLoading || !canAnalyze}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:border-[#C5A059] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Analyser'}
          </button>
          <button
            type="button"
            onClick={onOpenQuestionnaire}
            className="rounded-xl border border-[#C5A059]/50 bg-[#C5A059]/10 px-3 py-1.5 text-xs text-[#7A5D24] transition-colors hover:bg-[#C5A059]/20"
          >
            Questionnaire
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!hasAny && !isLoading && (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-6 text-center">
          <Activity className="mx-auto h-8 w-8 text-stone-400" />
          <p className="mt-3 text-sm text-stone-600">
            Lance une analyse ou complète le questionnaire pour voir ton profil de bien-être.
          </p>
          {!canAnalyze && (
            <p className="mt-1 text-xs text-stone-400">
              Au moins 5 entrées non chiffrées sont nécessaires pour l&apos;analyse.
            </p>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !hasAny && (
        <div className="mt-6 flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#C5A059]" />
          <span className="ml-3 text-sm text-stone-500">Analyse en cours...</span>
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
                  name="Analyse"
                  dataKey="ai"
                  stroke="#C5A059"
                  fill="#C5A059"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              )}
              {questionnaireScores && (
                <Radar
                  name="Questionnaire"
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
          {narrative && (
            <p className="mt-2 rounded-xl bg-[#C5A059]/5 px-4 py-3 text-sm italic text-stone-600">
              {narrative}
            </p>
          )}

          {/* Micro-bars breakdown */}
          <div className="mt-4 space-y-2">
            {DIMENSION_KEYS.map((key) => {
              const score = aiScores?.[key] ?? questionnaireScores?.[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-40 truncate text-xs text-stone-600">
                    {DIMENSION_FULL_LABELS[key]}
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
              Dernière analyse :{' '}
              {computedAt.toLocaleDateString('fr-FR', {
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
