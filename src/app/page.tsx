
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown, Feather, BrainCircuit, Archive } from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';

const fadeIn = (delay = 0, duration = 0.8) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration,
      ease: 'easeOut',
    },
  },
});

const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-amber-50 text-amber-600">
            <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-headline text-stone-700 mb-3">{title}</h3>
        <p className="text-stone-600 max-w-xs">{children}</p>
    </div>
);


export default function LandingPage() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="absolute top-0 left-0 right-0 z-10 p-8">
            <Logo className="h-6 w-auto text-stone-700" />
        </header>
        <section className="relative flex flex-col items-center justify-center flex-grow text-center px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <motion.div
              variants={fadeIn(0)}
              className="w-16 h-0.5 bg-amber-600 mx-auto mb-6"
            />
            <motion.h1
              variants={fadeIn(0.2)}
              className="text-5xl md:text-6xl font-headline italic text-stone-700 leading-tight"
            >
              Le silence qui vous écoute.
            </motion.h1>
            <motion.p
              variants={fadeIn(0.4)}
              className="mt-6 text-lg text-stone-500 max-w-2xl mx-auto"
            >
              Un espace intime pour déposer ce qui vous traverse.
              <br />
              Sans jugement. Sans bruit. Sans objectif de performance.
            </motion.p>
            <motion.div
              variants={fadeIn(0.6)}
              className="mt-10 flex flex-col sm:flex-row items-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => setIsAuthDialogOpen(true)}
                className="bg-stone-600 text-white px-8 py-3 rounded-full uppercase text-sm tracking-wide hover:bg-stone-700"
              >
                Ouvrir mon sanctuaire
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-stone-400 text-stone-700 px-8 py-3 rounded-full uppercase text-sm tracking-wide bg-transparent hover:bg-stone-100 hover:text-stone-800"
              >
                <Link href="/sanctuary/write">Essayer sans compte</Link>
              </Button>
            </motion.div>
            <motion.div variants={fadeIn(0.8)} className="absolute bottom-10">
              <a href="#manifesto" aria-label="Scroll down">
                <ChevronDown className="h-6 w-6 text-stone-400" />
              </a>
            </motion.div>
          </motion.div>
        </section>
      </div>

      <section id="manifesto" className="py-32 bg-stone-50">
          <div className="container max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-headline text-stone-800 mb-12">Un manifeste du silence</h2>
              <div className="space-y-8 text-lg text-stone-600 font-body leading-relaxed">
                  <p>
                      Dans un monde qui exige constamment notre attention, le silence est un luxe. Aurum est né de ce besoin : créer une pause, un lieu où le bruit extérieur s'estompe pour laisser place à votre voix intérieure.
                  </p>
                  <p>
                      Votre journal n'est pas un outil de productivité. Il ne vous demandera pas d'être plus efficace, plus organisé, ou d'atteindre des objectifs. Il vous demande simplement d'être. Ici, la seule mesure est la sincérité de l'instant.
                  </p>
                  <p>
                      Ici, pas de badges, de séries à maintenir, ou de compétition. Juste vous, vos pensées, et un espace qui les accueille avec une bienveillance inconditionnelle. C'est le sanctuaire que vous méritez.
                  </p>
              </div>
          </div>
      </section>

      <section className="py-32">
          <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                  <FeatureCard icon={Feather} title="Écrivez librement">
                      Une interface épurée qui s'efface pour laisser place à vos mots. Pas de distractions, juste une page blanche qui attend.
                  </FeatureCard>
                  <FeatureCard icon={BrainCircuit} title="Comprenez-vous">
                      Grâce à une IA discrète, Aurum vous aide à voir les tendances émotionnelles qui se dessinent dans vos écrits, sans jamais vous juger.
                  </FeatureCard>
                  <FeatureCard icon={Archive} title="Gardez vos traces">
                      Toutes vos entrées sont chiffrées et stockées en toute sécurité. Votre sanctuaire est privé, et le restera pour toujours.
                  </FeatureCard>
              </div>
          </div>
      </section>

      <footer className="py-16">
          <div className="container mx-auto flex flex-col items-center gap-4">
              <Logo className="h-8 w-8 text-stone-300" />
              <p className="text-sm text-stone-400 font-body">© 2025 Aurum. Un espace pour vous.</p>
          </div>
      </footer>

      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}
