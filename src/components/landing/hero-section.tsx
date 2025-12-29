
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Button } from '@/components/ui/button';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M16.9 8.28c-.46-1.2-1.52-2.04-2.8-2.28-1.57-.29-3.13.41-4.11 1.6-1.12 1.36-1.39 3.2-.68 4.8.52 1.18 1.44 2.1 2.65 2.62 1.5.64 3.16.48 4.49-.49.98-.72 1.63-1.88 1.76-3.14.15-1.49-.49-2.99-1.59-3.95-.27-.24-.55-.45-.82-.66zM12.01 16.01c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c1.28 0 2.4.68 3.05 1.71-.31.25-.6.54-.86.86-1.1 1.1-1.74 2.6-1.59 4.21.1 1.05.58 2.02 1.33 2.72-.88.65-1.98 1.01-3.11 1.01-1.02 0-1.99-.36-2.78-1z"/>
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
      ease: "easeOut",
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
