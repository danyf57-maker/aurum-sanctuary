'use client';

import Link from 'next/link';
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

const DIMENSION_HINTS: Record<keyof RyffDimensionScores, string> = {
  acceptationDeSoi: "Parle-toi comme à un ami proche: juste, pas dur.",
  developpementPersonnel: "Choisis un mini-apprentissage concret pour cette semaine.",
  sensDeLaVie: "Note une action qui te rapproche de ce qui compte pour toi.",
  maitriseEnvironnement: "Découpe ta journée en un seul objectif prioritaire.",
  autonomie: "Prends une décision simple qui te ressemble vraiment.",
  relationsPositives: "Envoie un message sincère à une personne ressource.",
};

const DIMENSION_3DAY_PLANS: Record<keyof RyffDimensionScores, string[]> = {
  acceptationDeSoi: [
    "Jour 1: note une qualité réelle que tu as utilisée aujourd'hui.",
    "Jour 2: transforme une autocritique en phrase plus juste.",
    "Jour 3: écris une preuve concrète de progression récente.",
  ],
  developpementPersonnel: [
    "Jour 1: choisis un mini-apprentissage de 10 minutes.",
    "Jour 2: applique-le dans une situation réelle.",
    "Jour 3: note ce que cela change dans ta semaine.",
  ],
  sensDeLaVie: [
    "Jour 1: écris ce qui compte le plus pour toi en ce moment.",
    "Jour 2: choisis une action alignée avec cette priorité.",
    "Jour 3: fais le bilan de ce que tu as ressenti.",
  ],
  maitriseEnvironnement: [
    "Jour 1: définis une priorité unique pour demain.",
    "Jour 2: protège un créneau sans distractions.",
    "Jour 3: supprime une friction qui te freine chaque jour.",
  ],
  autonomie: [
    "Jour 1: prends une décision courte selon ton propre critère.",
    "Jour 2: refuse une demande non prioritaire avec clarté.",
    "Jour 3: note ce que ce choix t'a apporté.",
  ],
  relationsPositives: [
    "Jour 1: envoie un message de gratitude à une personne clé.",
    "Jour 2: pose une question sincère à quelqu'un de proche.",
    "Jour 3: écris ce que cette relation t'apporte vraiment.",
  ],
};
const ACTIVE_PLAN_STORAGE_KEY = "aurum-active-plan";

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
          `Plan express 3 jours\n${DIMENSION_3DAY_PLANS[growthDimension][0]}\n\nCe que je ressens maintenant:`
        )}`
      : '/sanctuary/write';

  const handleApplyPlan = () => {
    if (typeof window === "undefined" || !growthDimension) return;
    const steps = DIMENSION_3DAY_PLANS[growthDimension];
    localStorage.setItem(
      ACTIVE_PLAN_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        source: "wellbeing",
        title: "Plan express 3 jours",
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
            <h2 className="font-headline text-xl text-stone-900">Bien-être psychologique</h2>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Comprends vite ce qui te fatigue, ce qui te porte et où retrouver de l&apos;élan.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onRequestAnalysis}
            disabled={isLoading || !canAnalyze}
            className="rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:border-[#C5A059] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Analyser mes pages'}
          </button>
          <button
            type="button"
            onClick={onOpenQuestionnaire}
            className="rounded-xl border border-[#C5A059]/50 bg-[#C5A059]/10 px-3 py-1.5 text-xs text-[#7A5D24] transition-colors hover:bg-[#C5A059]/20"
          >
            Commencer
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!hasAny && !isLoading && (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-6 text-center">
          <Activity className="mx-auto h-8 w-8 text-stone-400" />
          <div className="mt-3 inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Recommandé pour commencer
          </div>
          <p className="mt-3 text-sm text-stone-600">
            Option rapide: réponds au parcours guidé en 2 minutes.
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Tu obtiens une lecture claire de ton niveau d&apos;énergie, de calme et d&apos;équilibre.
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
          {(narrative || (strongestDimension && growthDimension)) && (
            <div className="mt-2 rounded-2xl border border-[#C5A059]/20 bg-[#C5A059]/5 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A5D24]">
                Lecture Aurum premium
              </p>
              {narrative && (
                <p className="mt-2 text-sm leading-relaxed text-stone-700">{narrative}</p>
              )}
              {strongestDimension && (
                <p className="mt-2 text-xs text-stone-600">
                  <span className="font-medium text-stone-700">Point fort actuel:</span>{" "}
                  {DIMENSION_FULL_LABELS[strongestDimension]}.
                </p>
              )}
              {growthDimension && (
                <p className="mt-1 text-xs text-stone-600">
                  <span className="font-medium text-stone-700">Micro-action conseillée:</span>{" "}
                  {DIMENSION_HINTS[growthDimension]}
                </p>
              )}
              {growthDimension && (
                <div className="mt-3 rounded-xl border border-[#C5A059]/20 bg-white/70 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7A5D24]/90">
                    Plan express 3 jours
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-stone-700">
                    {DIMENSION_3DAY_PLANS[growthDimension].map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                  <Link
                    href={journalHref}
                    onClick={handleApplyPlan}
                    className="mt-3 inline-flex rounded-lg bg-[#C5A059] px-3 py-1.5 text-xs font-medium text-stone-900 transition-colors hover:bg-[#b8924e]"
                  >
                    Appliquer ce plan dans mon journal
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
