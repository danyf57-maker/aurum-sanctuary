
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Button } from '@/components/ui/button';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z"/>
        <path d="M12 7.1c-2.81 0-5.09 2.28-5.09 5.09s2.28 5.09 5.09 5.09a4.84 4.84 0 0 0 3.8-1.82 1 1 0 0 0-1.41-1.41 2.86 2.86 0 0 1-2.39 1.13c-1.59 0-2.89-1.3-2.89-2.89s1.3-2.89 2.89-2.89a2.86 2.86 0 0 1 2.39 1.13 1 1 0 0 0 1.41-1.41A4.84 4.84 0 0 0 12 7.1Z" />
    </svg>
)

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
            <Link href="/" aria-label="Accueil d'Aurum">
                <Logo className="h-6 w-6 text-foreground" />
            </Link>
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
              Le Sanctuaire
            </motion.h1>
             <motion.h2
              variants={fadeIn(0.3)}
              className="text-4xl md:text-5xl font-headline text-stone-600 leading-tight mt-2"
            >
              Le silence qui vous écoute.
            </motion.h2>

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
