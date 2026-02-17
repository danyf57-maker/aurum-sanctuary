'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { PersonalityScores } from '@/lib/types';

type PersonalityQuestionnaireProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (scores: PersonalityScores, archetype: string) => Promise<void>;
  isSubmitting: boolean;
};

type Question = {
  id: string;
  dimension: keyof PersonalityScores;
  text: string;
  reversed: boolean;
};

const QUESTIONS: Question[] = [
  // Détermination
  {
    id: 'DET1',
    dimension: 'determination',
    text: "Quand je commence un projet, je fonce et j'ajuste en cours de route.",
    reversed: false,
  },
  {
    id: 'DET2',
    dimension: 'determination',
    text: "En groupe, j'ai tendance à prendre les commandes et à orienter les décisions.",
    reversed: false,
  },
  {
    id: 'DET3',
    dimension: 'determination',
    text: "J'hésite longtemps avant de prendre une décision importante.",
    reversed: true,
  },

  // Influence
  {
    id: 'INF1',
    dimension: 'influence',
    text: "J'adore échanger des idées et motiver les gens autour de moi.",
    reversed: false,
  },
  {
    id: 'INF2',
    dimension: 'influence',
    text: 'Je suis souvent la personne qui ramène de l\'énergie dans un groupe.',
    reversed: false,
  },
  {
    id: 'INF3',
    dimension: 'influence',
    text: "Je préfère travailler seul(e) plutôt qu'interagir avec beaucoup de personnes.",
    reversed: true,
  },

  // Stabilité
  {
    id: 'STA1',
    dimension: 'stabilite',
    text: "Je privilégie l'harmonie et je cherche à ce que tout le monde se sente bien.",
    reversed: false,
  },
  {
    id: 'STA2',
    dimension: 'stabilite',
    text: 'On me décrit comme quelqu\'un de patient et de fiable.',
    reversed: false,
  },
  {
    id: 'STA3',
    dimension: 'stabilite',
    text: "Les changements soudains me stressent et me déstabilisent.",
    reversed: true,
  },

  // Rigueur
  {
    id: 'RIG1',
    dimension: 'rigueur',
    text: "Je prépare toujours les choses en détail avant de me lancer.",
    reversed: false,
  },
  {
    id: 'RIG2',
    dimension: 'rigueur',
    text: 'La qualité et la précision comptent plus pour moi que la vitesse.',
    reversed: false,
  },
  {
    id: 'RIG3',
    dimension: 'rigueur',
    text: "Je me contente souvent d'une approche approximative si ça fonctionne.",
    reversed: true,
  },
];

const DIMENSION_NAMES: Record<keyof PersonalityScores, string> = {
  determination: 'Détermination',
  influence: 'Influence',
  stabilite: 'Stabilité',
  rigueur: 'Rigueur',
};

const ARCHETYPES: Record<string, string> = {
  determination: 'Le Décideur',
  influence: 'Le Communicant',
  stabilite: 'Le Pilier',
  rigueur: "L'Architecte",
};

const SCALE_LABELS = [
  'Pas du tout d\'accord',
  'En désaccord',
  'Plutôt en désaccord',
  'Plutôt d\'accord',
  'D\'accord',
  'Tout à fait d\'accord',
];

function computeScores(answers: Record<string, number>): {
  scores: PersonalityScores;
  archetype: string;
} {
  const dimensionSums: Record<keyof PersonalityScores, number[]> = {
    determination: [],
    influence: [],
    stabilite: [],
    rigueur: [],
  };

  for (const q of QUESTIONS) {
    const raw = answers[q.id];
    if (raw == null) continue;
    const score = q.reversed ? 7 - raw : raw;
    dimensionSums[q.dimension].push(score);
  }

  const scores: PersonalityScores = {
    determination: 3,
    influence: 3,
    stabilite: 3,
    rigueur: 3,
  };

  let maxKey: keyof PersonalityScores = 'determination';
  let maxVal = 0;

  for (const key of Object.keys(dimensionSums) as (keyof PersonalityScores)[]) {
    const vals = dimensionSums[key];
    if (vals.length > 0) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      scores[key] = Math.round(avg * 10) / 10;
      if (scores[key] > maxVal) {
        maxVal = scores[key];
        maxKey = key;
      }
    }
  }

  return { scores, archetype: ARCHETYPES[maxKey] || 'Le Décideur' };
}

export function PersonalityQuestionnaire({
  open,
  onOpenChange,
  onComplete,
  isSubmitting,
}: PersonalityQuestionnaireProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = QUESTIONS.every((q) => answers[q.id] != null);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    const { scores, archetype } = computeScores(answers);
    await onComplete(scores, archetype);
    setAnswers({});
  };

  const dimensions = Object.keys(DIMENSION_NAMES) as (keyof PersonalityScores)[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl text-stone-900">
            Profil de personnalité
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            12 questions pour découvrir ton style. Réponds spontanément, il n&apos;y a pas de bonne
            ou mauvaise réponse.
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-stone-100">
            <div
              className="h-1.5 rounded-full bg-stone-600 transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / 12) * 100}%` }}
            />
          </div>
          <span className="text-xs text-stone-500">
            {Object.keys(answers).length} / 12
          </span>
        </div>

        {/* Questions grouped by dimension */}
        <div className="space-y-6">
          {dimensions.map((dimKey) => {
            const dimQuestions = QUESTIONS.filter((q) => q.dimension === dimKey);
            return (
              <div key={dimKey}>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-stone-500">
                  {DIMENSION_NAMES[dimKey]}
                </h3>
                <div className="space-y-4">
                  {dimQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="rounded-xl border border-stone-200 bg-stone-50/50 p-4"
                    >
                      <p className="text-sm text-stone-700 leading-relaxed">{q.text}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: value }))
                            }
                            className={`flex h-9 min-w-[36px] items-center justify-center rounded-lg border text-sm font-medium transition-all ${
                              answers[q.id] === value
                                ? 'border-stone-600 bg-stone-600 text-white'
                                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                            }`}
                            title={SCALE_LABELS[value - 1]}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      <div className="mt-1.5 flex justify-between text-[10px] text-stone-400">
                        <span>Pas du tout d&apos;accord</span>
                        <span>Tout à fait d&apos;accord</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!allAnswered || isSubmitting}
            className="rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Enregistrement...
              </span>
            ) : (
              'Découvrir mon profil'
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
