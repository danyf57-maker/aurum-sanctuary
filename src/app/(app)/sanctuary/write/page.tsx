"use client";

/**
 * Write Page - Aurum Sanctuary
 *
 * A complete redesign of the writing experience with:
 * - Immersive, distraction-free interface
 * - Elegant typography and spacing
 * - Smooth animations and transitions
 * - Better visual hierarchy
 * - Consistent with Aurum's brand identity
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { WelcomePresence } from "@/components/sanctuary/welcome-presence";
import { PremiumJournalForm } from "@/components/sanctuary/premium-journal-form";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, Sparkles, Shield, Lock, ChevronRight } from "lucide-react";

export default function WritePage() {
  const { user, loading } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const writingQuotes = [
    { text: "Écrire, c'est te donner de l'air.", author: "Aurum" },
    { text: "Un paragraphe suffit pour commencer.", author: "Aurum" },
    {
      text: "Quand tu écris, tes idées se rangent.",
      author: "Aurum",
    },
  ];
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const rotation = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % writingQuotes.length);
    }, 7000);
    return () => clearInterval(rotation);
  }, [writingQuotes.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 via-[#F9F7F2] to-stone-100">
        <div className="space-y-6 w-full max-w-2xl px-6">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-64 w-full rounded-3xl" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Anonymous User View - Elegant Landing
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-[#F9F7F2] to-stone-100">
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="min-h-screen flex flex-col"
            >
              {/* Hero Section */}
              <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
                <div className="w-full max-w-3xl mx-auto">
                  {/* Main Content Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                  >
                    {/* Decorative Elements */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#C5A059]/5 rounded-full blur-3xl" />

                    {/* Card */}
                    <div className="relative bg-white/80 backdrop-blur-xl rounded-[40px] border border-[#D4AF37]/10 shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-10 md:p-16 text-center overflow-hidden">
                      {/* Subtle gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/3 via-transparent to-[#C5A059]/3 pointer-events-none" />

                      {/* Content */}
                      <div className="relative space-y-8">
                        {/* Icon */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                          className="mx-auto"
                        >
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C5A059] shadow-lg shadow-[#D4AF37]/20">
                            <Feather
                              className="h-9 w-9 text-white"
                              strokeWidth={1.5}
                            />
                          </div>
                        </motion.div>

                        {/* Label */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.5 }}
                        >
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#B8941F] text-xs font-medium tracking-[0.15em] uppercase">
                            <Lock className="h-3 w-3" />
                            Espace Privé
                          </span>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                          className="space-y-4"
                        >
                          <h1 className="font-headline text-4xl md:text-6xl text-stone-900 tracking-tight leading-[1.1]">
                            Ton sanctuaire
                            <br />
                            <span className="text-[#C5A059]">t'attend</span>
                          </h1>
                        </motion.div>

                        {/* Description */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.7 }}
                          className="max-w-md mx-auto space-y-6"
                        >
                          <p className="text-stone-600 text-lg md:text-xl font-light leading-relaxed">
                            Un espace chiffré où tes pensées trouvent leur
                            place, sans jugement ni interruption.
                          </p>

                          {/* Features */}
                          <div className="flex flex-wrap justify-center gap-4 text-sm text-stone-500">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100/80">
                              <Shield className="h-3.5 w-3.5 text-[#C5A059]" />
                              <span>100% Privé</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100/80">
                              <Lock className="h-3.5 w-3.5 text-[#C5A059]" />
                              <span>Chiffré</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100/80">
                              <Sparkles className="h-3.5 w-3.5 text-[#C5A059]" />
                              <span>IA Bienveillante</span>
                            </div>
                          </div>
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                          className="pt-4"
                        >
                          <Button
                            onClick={() => setIsAuthDialogOpen(true)}
                            size="lg"
                            className="group h-14 px-10 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-900 hover:from-[#C5A059] hover:to-[#D4AF37] rounded-2xl shadow-[0_12px_28px_rgba(212,175,55,0.3)] text-lg font-semibold transition-all duration-300 hover:shadow-[0_16px_36px_rgba(212,175,55,0.4)] hover:scale-[1.02]"
                          >
                            Entrer dans le Sanctuaire
                            <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </Button>
                          <p className="mt-4 text-stone-400 text-sm">
                            Connexion sécurisée via Google ou Email
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Footer Note */}
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="py-8 text-center"
              >
                <p className="text-stone-400 text-sm">
                  &ldquo;Écris ce qui demande à être posé. Le reste
                  viendra.&rdquo;
                </p>
              </motion.footer>
            </motion.div>
          )}
        </AnimatePresence>

        <AuthDialog
          open={isAuthDialogOpen}
          onOpenChange={setIsAuthDialogOpen}
        />
      </div>
    );
  }

  // Authenticated User View - Writing Interface
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-[#F9F7F2] to-stone-100">
      <WelcomePresence userName={user?.displayName || undefined} />

      <AnimatePresence>
        {isVisible && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="container max-w-4xl mx-auto px-4 py-8 md:py-16"
          >
            {/* Header */}
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-10 md:mb-14 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#C5A059]/20 mb-4">
                <Feather className="h-5 w-5 text-[#C5A059]" />
              </div>
              <h1 className="font-headline text-3xl md:text-4xl text-stone-900 tracking-tight mb-2">
                Ton espace d'écriture
              </h1>
              <p className="text-stone-500 text-lg">
                Pose ici ce qui traverse ton esprit.
              </p>
            </motion.header>

            {/* Writing Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="mb-6 rounded-2xl border border-stone-200 bg-white/60 px-5 py-4 text-center">
                <p className="text-sm italic text-stone-600">
                  &ldquo;{writingQuotes[quoteIndex]?.text}&rdquo;
                  <span className="ml-1 not-italic text-stone-500">
                    - {writingQuotes[quoteIndex]?.author}
                  </span>
                </p>
              </div>
              <PremiumJournalForm />
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
