"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
            // Mark as shown so it doesn't appear again
            localStorage.setItem(QUIZ_SHOWN_KEY, "true");
          }
        } catch {
          // Invalid data, clean up
          localStorage.removeItem(QUIZ_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };

    // Small delay to ensure smooth page load first
    const timer = setTimeout(checkQuizData, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    // Keep the data but don't show again
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full relative shadow-2xl border border-stone-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="text-center relative z-10">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <span className="text-4xl">{profile.icon}</span>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Votre profil de réflexion
                </span>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl md:text-5xl font-headline mb-3 text-stone-900"
              >
                {profile.name}
              </motion.h2>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-primary text-lg font-medium mb-6"
              >
                {profile.tagline}
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-stone-600 text-lg mb-10 leading-relaxed font-light"
              >
                {profile.description}
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col gap-4"
              >
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Link href="/sanctuary/write">
                    Commencer mon premier journal
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <button
                  onClick={handleDismiss}
                  className="text-stone-400 text-sm hover:text-stone-600 transition-colors"
                >
                  Plus tard
                </button>
              </motion.div>
            </div>

            {/* Background gradient */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br ${profile.color} blur-[100px] rounded-full opacity-40 pointer-events-none`}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
