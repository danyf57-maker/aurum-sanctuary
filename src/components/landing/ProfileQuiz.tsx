"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";

interface QuizData {
  answers: string[];
  completedAt: string;
  profile: string | null;
}

interface ProfileResult {
  id: string;
  name: string;
  description: string;
  tagline: string;
  color: string;
}

const QUESTIONS = [
  {
    id: 1,
    text: "Quand tu penses à ta journée, qu'est-ce qui ressort le plus ?",
    options: [
      {
        id: "A",
        text: "J'ai beaucoup de choses à faire et je veux avancer vite",
        emoji: "⚡",
      },
      {
        id: "B",
        text: "J'ai besoin de connecter avec les autres et partager",
        emoji: "💫",
      },
      {
        id: "C",
        text: "Je cherche la tranquillité et l'harmonie",
        emoji: "🌿",
      },
      { id: "D", text: "J'analyse les situations avant d'agir", emoji: "🔍" },
    ],
  },
  {
    id: 2,
    text: "Face à une situation difficile, ta première réaction est de :",
    options: [
      {
        id: "A",
        text: "Prendre le problème en main et trouver une solution",
        emoji: "🎯",
      },
      {
        id: "B",
        text: "En parler pour voir différentes perspectives",
        emoji: "💬",
      },
      { id: "C", text: "Retrouver mon calme avant de réagir", emoji: "🧘" },
      {
        id: "D",
        text: "Comprendre tous les détails avant de décider",
        emoji: "📋",
      },
    ],
  },
  {
    id: 3,
    text: "Si tu ouvrais ton journal maintenant, tu écrirais sur :",
    options: [
      {
        id: "A",
        text: "Tes objectifs et ce que tu veux accomplir",
        emoji: "🚀",
      },
      {
        id: "B",
        text: "Tes interactions et ce qui t'a touché",
        emoji: "❤️",
      },
      { id: "C", text: "Ton besoin de paix et de stabilité", emoji: "🏠" },
      { id: "D", text: "Tes réflexions profondes et analyses", emoji: "💭" },
    ],
  },
  {
    id: 4,
    text: "Ce que tu cherches avant tout en ce moment :",
    options: [
      { id: "A", text: "Du momentum et de l'action", emoji: "🔥" },
      { id: "B", text: "De la connexion et de l'inspiration", emoji: "✨" },
      { id: "C", text: "De la sécurité et du réconfort", emoji: "🛡️" },
      { id: "D", text: "De la clarté et de la structure", emoji: "📐" },
    ],
  },
];

const PROFILES: Record<string, ProfileResult> = {
  PIONEER: {
    id: "PIONEER",
    name: "Le Pionnier",
    tagline: "L'action est ton moteur",
    description:
      "Tu avances vite et aimes voir des résultats concrets. Ton journal t'aidera à canaliser cette énergie et transformer l'action en clarté.",
    color: "from-amber-500/20 to-orange-500/20",
  },
  CONNECTOR: {
    id: "CONNECTOR",
    name: "Le Connecteur",
    tagline: "Les émotions sont ton guide",
    description:
      "Tu es guidé par les relations et les émotions. Ton journal sera ton espace d'expression authentique, loin des regards.",
    color: "from-rose-500/20 to-pink-500/20",
  },
  ANCHOR: {
    id: "ANCHOR",
    name: "L'Ancre",
    tagline: "La paix est ton essence",
    description:
      "Tu cherches la paix et la constance. Ton journal t'offrira un refuge stable pour te retrouver, quoi qu'il arrive.",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  ARCHITECT: {
    id: "ARCHITECT",
    name: "L'Architecte",
    tagline: "La compréhension est ta clé",
    description:
      "Tu aimes comprendre avant d'agir. Ton journal deviendra ton laboratoire d'idées où tout prend sens.",
    color: "from-blue-500/20 to-indigo-500/20",
  },
  BALANCED: {
    id: "BALANCED",
    name: "L'Équilibriste",
    tagline: "Ta force est dans la diversité",
    description:
      "Tu combines plusieurs forces. Ton journal s'adaptera à ta complexité et évoluera avec toi.",
    color: "from-violet-500/20 to-purple-500/20",
  },
};

const QUIZ_STORAGE_KEY = "aurum-quiz-data";
const QUIZ_EXPIRY_HOURS = 24;

export default function ProfileQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [profile, setProfile] = useState<ProfileResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing quiz data on mount
  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
    if (saved) {
      try {
        const data: QuizData = JSON.parse(saved);
        const expiryTime =
          new Date(data.completedAt).getTime() +
          QUIZ_EXPIRY_HOURS * 60 * 60 * 1000;

        if (Date.now() < expiryTime && data.answers.length === 4) {
          setAnswers(data.answers);
          setStep(4);
          setIsCompleted(true);
          if (data.profile) {
            setProfile(PROFILES[data.profile] || null);
          }
        } else {
          localStorage.removeItem(QUIZ_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(QUIZ_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const calculateProfile = (answers: string[]): ProfileResult => {
    const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach((answer) => {
      counts[answer] = (counts[answer] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(counts));
    const topAnswers = Object.entries(counts)
      .filter(([, count]) => count === maxCount)
      .map(([letter]) => letter);

    if (topAnswers.length > 1) {
      return PROFILES.BALANCED;
    }

    const mapping: Record<string, string> = {
      A: "PIONEER",
      B: "CONNECTOR",
      C: "ANCHOR",
      D: "ARCHITECT",
    };

    return PROFILES[mapping[topAnswers[0]]] || PROFILES.BALANCED;
  };

  const handleAnswer = (optionId: string) => {
    const newAnswers = [...answers, optionId];
    setAnswers(newAnswers);

    if (newAnswers.length < 4) {
      setStep(step + 1);
    } else {
      const calculatedProfile = calculateProfile(newAnswers);
      setProfile(calculatedProfile);
      setIsCompleted(true);
      setStep(4);

      const quizData: QuizData = {
        answers: newAnswers,
        completedAt: new Date().toISOString(),
        profile: calculatedProfile.id,
      };
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizData));
      void trackEvent({
        name: "quiz_complete",
        params: { profile: calculatedProfile.id },
      });
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers([]);
    setIsCompleted(false);
    setProfile(null);
    localStorage.removeItem(QUIZ_STORAGE_KEY);
  };

  if (isLoading) {
    return (
      <section className="py-24 md:py-32 bg-stone-50/50">
        <div className="container max-w-4xl">
          <div className="h-96 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-stone-50/50" id="decouvrir">
      <div className="container max-w-4xl">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-sm"
            >
              {/* Progress */}
              <div className="flex justify-center gap-2 mb-12">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i <= step ? "w-8 bg-primary" : "w-4 bg-stone-200"
                    }`}
                  />
                ))}
              </div>

              {/* Question */}
              <div className="text-center mb-12">
                <span className="text-primary/60 text-[10px] uppercase tracking-widest mb-4 block font-bold">
                  Question {step + 1}/4
                </span>
                <h3 className="text-2xl md:text-4xl font-headline text-stone-900 leading-tight">
                  {QUESTIONS[step].text}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {QUESTIONS[step].options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(option.id)}
                    className="p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:border-primary/40 hover:bg-primary/5 transition-all text-left group shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <span className="text-2xl mb-3 block">{option.emoji}</span>
                    <span className="text-stone-700 font-light leading-relaxed">
                      {option.text}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-sm"
            >
              <div className="text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                  <Sparkles className="w-10 h-10" />
                </div>

                {/* Title */}
                <span className="text-primary/60 text-[10px] uppercase tracking-widest mb-4 block font-bold">
                  Ton profil est prêt
                </span>

                {profile && (
                  <>
                    <h3 className="text-4xl md:text-5xl font-headline mb-4 text-stone-900">
                      {profile.name}
                    </h3>
                    <p className="text-primary text-lg font-medium mb-6">
                      {profile.tagline}
                    </p>
                    <p className="text-stone-500 text-lg mb-12 max-w-xl mx-auto leading-relaxed font-light">
                      {profile.description}
                    </p>
                  </>
                )}

                {/* CTA */}
                <div className="flex flex-col gap-4 items-center">
                  <Button
                    asChild
                    size="lg"
                    className="h-16 px-12 text-lg rounded-2xl w-full sm:w-auto shadow-xl hover:shadow-2xl transition-all"
                  >
                    <Link
                      href="/signup?quiz=complete"
                      onClick={() =>
                        void trackEvent({
                          name: "cta_click",
                          params: { location: "quiz_result_primary", target: "/signup?quiz=complete" },
                        })
                      }
                    >
                      Créer mon compte
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <p className="text-stone-400 text-sm font-light">
                    Déjà un compte ?{" "}
                    <Link
                      href="/login?quiz=complete"
                      className="text-primary hover:underline"
                      onClick={() =>
                        void trackEvent({
                          name: "cta_click",
                          params: { location: "quiz_result_secondary", target: "/login?quiz=complete" },
                        })
                      }
                    >
                      Se connecter
                    </Link>
                  </p>
                  <button
                    onClick={handleRestart}
                    className="text-stone-400 text-xs hover:text-stone-600 transition-colors mt-4"
                  >
                    Refaire le test
                  </button>
                </div>
              </div>

              {/* Decorative gradient based on profile */}
              {profile && (
                <div
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br ${profile.color} blur-[120px] rounded-full opacity-50 pointer-events-none`}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust badge */}
        <div className="mt-8 text-center">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400 font-medium">
            <Compass className="w-3 h-3" />4 questions • 30 secondes • Clarté
            rapide et privée
          </span>
        </div>
      </div>
    </section>
  );
}
