'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { RyffDimensionScores } from '@/lib/types';
import { useLocale } from '@/hooks/use-locale';

type RyffQuestionnaireProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (scores: RyffDimensionScores) => Promise<void>;
  isSubmitting: boolean;
};

type Question = {
  id: string;
  dimension: keyof RyffDimensionScores;
  text: string;
  reversed: boolean;
};

const QUESTIONS_FR: Question[] = [
  // Acceptation de soi
  {
    id: 'AS1',
    dimension: 'acceptationDeSoi',
    text: "Dans l'ensemble, je me sens confiant(e) et positif(ve) envers moi-même.",
    reversed: false,
  },
  {
    id: 'AS2',
    dimension: 'acceptationDeSoi',
    text: "Je peux admettre mes défauts sans m'en sentir accablé(e).",
    reversed: false,
  },
  {
    id: 'AS3',
    dimension: 'acceptationDeSoi',
    text: 'Je regarde souvent en arrière avec honte et culpabilité.',
    reversed: true,
  },

  // Développement personnel
  {
    id: 'DP1',
    dimension: 'developpementPersonnel',
    text: "Je me sens comme si j'évoluais et grandissais en tant que personne.",
    reversed: false,
  },
  {
    id: 'DP2',
    dimension: 'developpementPersonnel',
    text: 'Je suis ouvert(e) aux nouvelles expériences qui challengent ma vision du monde.',
    reversed: false,
  },
  {
    id: 'DP3',
    dimension: 'developpementPersonnel',
    text: "Je n'ai pas le sentiment de progresser dans ma vie.",
    reversed: true,
  },

  // Sens de la vie
  {
    id: 'SV1',
    dimension: 'sensDeLaVie',
    text: "Certaines personnes errent dans la vie sans but — ce n'est pas mon cas.",
    reversed: false,
  },
  {
    id: 'SV2',
    dimension: 'sensDeLaVie',
    text: "J'ai le sentiment que ma vie a un sens et une direction.",
    reversed: false,
  },
  {
    id: 'SV3',
    dimension: 'sensDeLaVie',
    text: "Je ne vois pas très bien ce que j'essaie d'accomplir dans la vie.",
    reversed: true,
  },

  // Maîtrise de l'environnement
  {
    id: 'ME1',
    dimension: 'maitriseEnvironnement',
    text: 'Je gère bien les responsabilités de ma vie quotidienne.',
    reversed: false,
  },
  {
    id: 'ME2',
    dimension: 'maitriseEnvironnement',
    text: 'Je suis habile à organiser mon temps pour accomplir mes projets.',
    reversed: false,
  },
  {
    id: 'ME3',
    dimension: 'maitriseEnvironnement',
    text: "J'ai souvent le sentiment d'être débordé(e) par mes responsabilités.",
    reversed: true,
  },

  // Autonomie
  {
    id: 'AU1',
    dimension: 'autonomie',
    text: "Je prends mes décisions selon mes propres convictions, pas selon ce qu'on attend de moi.",
    reversed: false,
  },
  {
    id: 'AU2',
    dimension: 'autonomie',
    text: "Je me laisse rarement influencer par les opinions de mon entourage.",
    reversed: false,
  },
  {
    id: 'AU3',
    dimension: 'autonomie',
    text: "Ce que les autres pensent de moi a beaucoup d'influence sur mes décisions.",
    reversed: true,
  },

  // Relations positives
  {
    id: 'RP1',
    dimension: 'relationsPositives',
    text: 'Je sais que je peux compter sur mes amis, et eux peuvent compter sur moi.',
    reversed: false,
  },
  {
    id: 'RP2',
    dimension: 'relationsPositives',
    text: "J'ai des relations chaleureuses et satisfaisantes avec les autres.",
    reversed: false,
  },
  {
    id: 'RP3',
    dimension: 'relationsPositives',
    text: "J'ai peu de relations profondes et de confiance.",
    reversed: true,
  },
];
const QUESTIONS_EN: Question[] = [
  {
    id: 'AS1',
    dimension: 'acceptationDeSoi',
    text: 'Overall, I feel confident and positive about myself.',
    reversed: false,
  },
  {
    id: 'AS2',
    dimension: 'acceptationDeSoi',
    text: 'I can acknowledge my flaws without feeling crushed by them.',
    reversed: false,
  },
  {
    id: 'AS3',
    dimension: 'acceptationDeSoi',
    text: 'I often look back with shame and guilt.',
    reversed: true,
  },
  {
    id: 'DP1',
    dimension: 'developpementPersonnel',
    text: 'I feel I am evolving and growing as a person.',
    reversed: false,
  },
  {
    id: 'DP2',
    dimension: 'developpementPersonnel',
    text: 'I am open to new experiences that challenge my view of the world.',
    reversed: false,
  },
  {
    id: 'DP3',
    dimension: 'developpementPersonnel',
    text: 'I do not feel like I am progressing in life.',
    reversed: true,
  },
  {
    id: 'SV1',
    dimension: 'sensDeLaVie',
    text: "Some people wander through life without a purpose - that's not me.",
    reversed: false,
  },
  {
    id: 'SV2',
    dimension: 'sensDeLaVie',
    text: 'I feel my life has meaning and direction.',
    reversed: false,
  },
  {
    id: 'SV3',
    dimension: 'sensDeLaVie',
    text: "I don't really see what I am trying to accomplish in life.",
    reversed: true,
  },
  {
    id: 'ME1',
    dimension: 'maitriseEnvironnement',
    text: 'I handle the responsibilities of daily life well.',
    reversed: false,
  },
  {
    id: 'ME2',
    dimension: 'maitriseEnvironnement',
    text: 'I am skilled at organizing my time to achieve my goals.',
    reversed: false,
  },
  {
    id: 'ME3',
    dimension: 'maitriseEnvironnement',
    text: 'I often feel overwhelmed by my responsibilities.',
    reversed: true,
  },
  {
    id: 'AU1',
    dimension: 'autonomie',
    text: "I make decisions based on my own convictions, not others' expectations.",
    reversed: false,
  },
  {
    id: 'AU2',
    dimension: 'autonomie',
    text: 'I am rarely influenced by people around me.',
    reversed: false,
  },
  {
    id: 'AU3',
    dimension: 'autonomie',
    text: "What others think of me strongly influences my decisions.",
    reversed: true,
  },
  {
    id: 'RP1',
    dimension: 'relationsPositives',
    text: 'I know I can count on my friends, and they can count on me.',
    reversed: false,
  },
  {
    id: 'RP2',
    dimension: 'relationsPositives',
    text: 'I have warm and satisfying relationships with others.',
    reversed: false,
  },
  {
    id: 'RP3',
    dimension: 'relationsPositives',
    text: 'I have few deep and trusting relationships.',
    reversed: true,
  },
];

const DIMENSION_NAMES_FR: Record<keyof RyffDimensionScores, string> = {
  acceptationDeSoi: 'Acceptation de soi',
  developpementPersonnel: 'Développement personnel',
  sensDeLaVie: 'Sens de la vie',
  maitriseEnvironnement: "Maîtrise de l'environnement",
  autonomie: 'Autonomie',
  relationsPositives: 'Relations positives',
};
const DIMENSION_NAMES_EN: Record<keyof RyffDimensionScores, string> = {
  acceptationDeSoi: 'Self-acceptance',
  developpementPersonnel: 'Personal growth',
  sensDeLaVie: 'Purpose in life',
  maitriseEnvironnement: 'Environmental mastery',
  autonomie: 'Autonomy',
  relationsPositives: 'Positive relationships',
};

const SCALE_LABELS_FR = [
  'Pas du tout d\'accord',
  'En désaccord',
  'Plutôt en désaccord',
  'Plutôt d\'accord',
  'D\'accord',
  'Tout à fait d\'accord',
];
const SCALE_LABELS_EN = [
  'Strongly disagree',
  'Disagree',
  'Somewhat disagree',
  'Somewhat agree',
  'Agree',
  'Strongly agree',
];

function computeScores(answers: Record<string, number>, questions: Question[]): RyffDimensionScores {
  const dimensionSums: Record<keyof RyffDimensionScores, number[]> = {
    acceptationDeSoi: [],
    developpementPersonnel: [],
    sensDeLaVie: [],
    maitriseEnvironnement: [],
    autonomie: [],
    relationsPositives: [],
  };

  for (const q of questions) {
    const raw = answers[q.id];
    if (raw == null) continue;
    const score = q.reversed ? 7 - raw : raw;
    dimensionSums[q.dimension].push(score);
  }

  const result: RyffDimensionScores = {
    acceptationDeSoi: 3,
    developpementPersonnel: 3,
    sensDeLaVie: 3,
    maitriseEnvironnement: 3,
    autonomie: 3,
    relationsPositives: 3,
  };

  for (const key of Object.keys(dimensionSums) as (keyof RyffDimensionScores)[]) {
    const scores = dimensionSums[key];
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      result[key] = Math.round(avg * 10) / 10;
    }
  }

  return result;
}

export function RyffQuestionnaire({
  open,
  onOpenChange,
  onComplete,
  isSubmitting,
}: RyffQuestionnaireProps) {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const t = useTranslations('sanctuary.ryffQuestionnaire');
  const questions = isFr ? QUESTIONS_FR : QUESTIONS_EN;
  const dimensionNames = isFr ? DIMENSION_NAMES_FR : DIMENSION_NAMES_EN;
  const scaleLabels = isFr ? SCALE_LABELS_FR : SCALE_LABELS_EN;

  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = questions.every((q) => answers[q.id] != null);

  const handleSubmit = async () => {
    if (!allAnswered) return;
    const scores = computeScores(answers, questions);
    await onComplete(scores);
    setAnswers({});
  };

  // Group questions by dimension
  const dimensions = Object.keys(dimensionNames) as (keyof RyffDimensionScores)[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl text-stone-900">
            {t('title')}
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-stone-100">
            <div
              className="h-1.5 rounded-full bg-[#C5A059] transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-stone-500">
            {Object.keys(answers).length} / {questions.length}
          </span>
        </div>

        {/* Questions grouped by dimension */}
        <div className="space-y-6">
          {dimensions.map((dimKey) => {
            return (
              <div key={dimKey}>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-[#7A5D24]">
                  {dimensionNames[dimKey]}
                </h3>
                <div className="space-y-4">
                  {questions.filter((q) => q.dimension === dimKey).map((q) => (
                    <div key={q.id} className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
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
                                ? 'border-[#C5A059] bg-[#C5A059]/15 text-[#7A5D24]'
                                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                            }`}
                            title={scaleLabels[value - 1]}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                      <div className="mt-1.5 flex justify-between text-[10px] text-stone-400">
                        <span>{t('scaleMin')}</span>
                        <span>{t('scaleMax')}</span>
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
                {t('saving')}
              </span>
            ) : (
              t('submit')
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
