"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
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

export function HeroSection() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <header className="absolute top-0 left-0 right-0 z-10 p-8">
            <Logo className="h-6 w-auto" />
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
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
}
