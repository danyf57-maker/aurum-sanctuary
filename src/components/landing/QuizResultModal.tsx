"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";

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
  icon: string;
}

const PROFILES: Record<string, ProfileResult> = {
  PIONEER: {
    id: "PIONEER",
    name: "Le Pionnier",
    tagline: "L'action est votre moteur",
    description:
      "Vous avancez vite et aimez voir des résultats concrets. Votre journal vous aidera à canaliser cette énergie et transformer l'action en clarté.",
    color: "from-amber-500/20 to-orange-500/20",
    icon: "⚡",
  },
  CONNECTOR: {
    id: "CONNECTOR",
    name: "Le Connecteur",
    tagline: "Les émotions sont votre guide",
    description:
      "Vous êtes guidé par les relations et les émotions. Votre journal sera votre espace d'expression authentique, loin des regards.",
    color: "from-rose-500/20 to-pink-500/20",
    icon: "💫",
  },
  ANCHOR: {
    id: "ANCHOR",
    name: "L'Ancre",
    tagline: "La paix est votre essence",
    description:
      "Vous cherchez la paix et la constance. Votre journal vous offrira un refuge stable pour vous retrouver, quoi qu'il arrive.",
    color: "from-emerald-500/20 to-teal-500/20",
    icon: "🌿",
  },
  ARCHITECT: {
    id: "ARCHITECT",
    name: "L'Architecte",
    tagline: "La compréhension est votre clé",
    description:
      "Vous aimez comprendre avant d'agir. Votre journal deviendra votre laboratoire d'idées où tout prend sens.",
    color: "from-blue-500/20 to-indigo-500/20",
    icon: "🔍",
  },
  BALANCED: {
    id: "BALANCED",
    name: "L'Équilibriste",
    tagline: "Votre force est dans la diversité",
    description:
      "Vous combinez plusieurs forces. Votre journal s'adaptera à votre complexité et évoluera avec vous.",
    color: "from-violet-500/20 to-purple-500/20",
    icon: "⚖️",
  },
};

const QUIZ_STORAGE_KEY = "aurum-quiz-data";
const QUIZ_SHOWN_KEY = "aurum-quiz-shown";

export default function QuizResultModal() {
  const locale = useLocale();
  const isFr = locale === "fr";
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkQuizData = () => {
      const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
      const alreadyShown = localStorage.getItem(QUIZ_SHOWN_KEY);

      if (saved && !alreadyShown) {
        try {
          const data: QuizData = JSON.parse(saved);
          if (data.profile && PROFILES[data.profile]) {
            setProfile(PROFILES[data.profile]);
            setIsOpen(true);
            localStorage.setItem(QUIZ_SHOWN_KEY, "true");
          }
        } catch {
          localStorage.removeItem(QUIZ_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };

    const timer = setTimeout(checkQuizData, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem(QUIZ_SHOWN_KEY, "true");
  };

  if (isLoading || !profile) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-2xl md:p-12"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDismiss}
              className="absolute right-6 top-6 z-10 p-2 text-stone-400 transition-colors hover:text-stone-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              >
                <span className="text-4xl">{profile.icon}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {isFr ? "Votre profil de réflexion" : "Your reflection profile"}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-3 font-headline text-4xl text-stone-900 md:text-5xl"
              >
                {profile.name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 text-lg font-medium text-primary"
              >
                {profile.tagline}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-10 text-lg font-light leading-relaxed text-stone-600"
              >
                {profile.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-2xl px-8 text-lg shadow-lg transition-all hover:shadow-xl"
                >
                  <Link href="/sanctuary/write">
                    {isFr ? "Commencer mon premier journal" : "Start my first journal"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <button
                  onClick={handleDismiss}
                  className="text-sm text-stone-400 transition-colors hover:text-stone-600"
                >
                  {isFr ? "Plus tard" : "Maybe later"}
                </button>
              </motion.div>
            </div>

            <div
              className={`pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${profile.color} opacity-40 blur-[100px]`}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
