'use client';

import { Loader2, Users } from 'lucide-react';
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
import type { PersonalityScores } from '@/lib/types';

type PersonalityRadarProps = {
  aiScores: PersonalityScores | null;
  questionnaireScores: PersonalityScores | null;
  archetype: string | null;
  narrative: string | null;
  computedAt: Date | null;
  isLoading: boolean;
  onRequestAnalysis: () => void;
  onOpenQuestionnaire: () => void;
  canAnalyze: boolean;
};

const DIMENSION_LABELS: Record<keyof PersonalityScores, string> = {
  determination: 'Détermination',
  influence: 'Influence',
  stabilite: 'Stabilité',
  rigueur: 'Rigueur',
};

const DIMENSION_KEYS = Object.keys(DIMENSION_LABELS) as (keyof PersonalityScores)[];

const DIMENSION_COLORS: Record<keyof PersonalityScores, string> = {
  determination: '#EF4444',
  influence: '#F59E0B',
  stabilite: '#22C55E',
  rigueur: '#3B82F6',
};

const DIMENSION_HINTS: Record<keyof PersonalityScores, string> = {
  determination: "Canalise ton énergie sur une priorité unique pour éviter la dispersion.",
  influence: "Exprime ton idée en une phrase claire avant de convaincre le groupe.",
  stabilite: "Protège ton rythme avec une routine courte mais régulière.",
  rigueur: "Cherche le niveau de précision utile, pas la perfection.",
};

function buildChartData(
  aiScores: PersonalityScores | null,
  questionnaireScores: PersonalityScores | null
) {
  return DIMENSION_KEYS.map((key) => ({
    dimension: DIMENSION_LABELS[key],
    ai: aiScores?.[key] ?? 0,
    questionnaire: questionnaireScores?.[key] ?? 0,
  }));
}

export function PersonalityRadar({
  aiScores,
  questionnaireScores,
  archetype,
  narrative,
  computedAt,
  isLoading,
  onRequestAnalysis,
  onOpenQuestionnaire,
  canAnalyze,
}: PersonalityRadarProps) {
  const hasAny = aiScores || questionnaireScores;
  const data = buildChartData(aiScores, questionnaireScores);
  const activeScores = aiScores ?? questionnaireScores;
  const sortedDimensions = activeScores
    ? (Object.entries(activeScores) as [keyof PersonalityScores, number][]).sort(
        (a, b) => b[1] - a[1]
      )
    : [];
  const strongestDimension = sortedDimensions[0]?.[0] ?? null;
  const growthDimension = sortedDimensions[sortedDimensions.length - 1]?.[0] ?? null;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100">
              <Users className="h-3.5 w-3.5 text-stone-600" />
            </div>
            <h2 className="font-headline text-xl text-stone-900">Profil de personnalité</h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Découvre comment tu décides, échanges et avances au quotidien.
            {archetype && (
              <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700">
                {archetype}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRequestAnalysis}
            disabled={isLoading || !canAnalyze}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:border-stone-500 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Analyser mes pages'}
          </button>
          <button
            type="button"
            onClick={onOpenQuestionnaire}
            className="rounded-xl border border-stone-400/50 bg-stone-100 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:bg-stone-200"
          >
            Commencer
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!hasAny && !isLoading && (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-6 text-center">
          <Users className="mx-auto h-8 w-8 text-stone-400" />
          <div className="mt-3 inline-flex rounded-full bg-stone-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-stone-700">
            Recommandé pour commencer
          </div>
          <p className="mt-3 text-sm text-stone-600">
            Option rapide: fais le parcours guidé pour voir ton style de fonctionnement.
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Tu repars avec des repères concrets sur ta manière d&apos;agir et de communiquer.
          </p>
          {!canAnalyze && (
            <p className="mt-1 text-xs text-stone-400">
              Pour l&apos;analyse automatique de tes pages, il faut au moins 5 entrées non chiffrées.
            </p>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && !hasAny && (
        <div className="mt-6 flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-stone-500" />
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
                tick={{ fontSize: 12, fill: '#57534E', fontWeight: 500 }}
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
                  stroke="#57534E"
                  fill="#78716C"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              )}
              {questionnaireScores && (
                <Radar
                  name="Questionnaire"
                  dataKey="questionnaire"
                  stroke="#A8A29E"
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

          {(narrative || (strongestDimension && growthDimension)) && (
            <div className="mt-2 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-600">
                Lecture Aurum
              </p>
              {narrative && (
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{narrative}</p>
              )}
              {strongestDimension && (
                <p className="mt-2 text-xs text-stone-600">
                  <span className="font-medium text-stone-700">Point fort actuel:</span>{" "}
                  {DIMENSION_LABELS[strongestDimension]}.
                </p>
              )}
              {growthDimension && (
                <p className="mt-1 text-xs text-stone-600">
                  <span className="font-medium text-stone-700">Micro-action conseillée:</span>{" "}
                  {DIMENSION_HINTS[growthDimension]}
                </p>
              )}
            </div>
          )}

          {/* Micro-bars breakdown */}
          <div className="mt-4 space-y-2">
            {DIMENSION_KEYS.map((key) => {
              const score = aiScores?.[key] ?? questionnaireScores?.[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-28 truncate text-xs text-stone-600">
                    {DIMENSION_LABELS[key]}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-stone-100">
                    <div
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${(score / 6) * 100}%`,
                        backgroundColor: DIMENSION_COLORS[key],
                      }}
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
