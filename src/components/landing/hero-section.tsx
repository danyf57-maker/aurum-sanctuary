'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform } from 'framer-motion';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M16.9 8.28c-.46-1.2-1.52-2.04-2.8-2.28-1.57-.29-3.13.41-4.11 1.6-1.12 1.36-1.39 3.2-.68 4.8.52 1.18 1.44 2.1 2.65 2.62 1.5.64 3.16.48 4.49-.49.98-.72 1.63-1.88 1.76-3.14.15-1.49-.49-2.99-1.59-3.95-.27-.24-.55-.45-.82-.66zM12.01 16.01c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5c1.28 0 2.4.68 3.05 1.71-.31.25-.6.54-.86.86-1.1 1.1-1.74 2.6-1.59 4.21.1 1.05.58 2.02 1.33 2.72-.88.65-1.98 1.01-3.11 1.01-1.02 0-1.99-.36-2.78-1z"/>
    </svg>
)

export function HeroSection() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <>
      <div ref={targetRef} className="relative h-[200vh] bg-stone-900">
        <section className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
            <motion.div
              className="absolute inset-0 z-0"
              style={{
                y: backgroundY,
                scale: backgroundScale,
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1593671954252-2a65d56285a4?q=80&w=2070&auto=format&fit=crop"
                alt="Paysage brumeux et apaisant"
                fill
                priority
                className="object-cover"
                data-ai-hint="misty landscape"
              />
              <div className="absolute inset-0 bg-black/50" />
            </motion.div>
            
            <header className="absolute top-0 left-0 right-0 z-20 p-8">
                <Link href="/" aria-label="Accueil d'Aurum">
                    <Logo className="h-6 w-6 text-amber-500" />
                </Link>
            </header>

            <motion.div
              className="relative z-10 px-4 text-center text-white"
              style={{ opacity: textOpacity }}
            >
                <div className="w-16 h-0.5 bg-primary mx-auto mb-6" />
                <h1 className="text-5xl md:text-6xl font-headline italic leading-tight text-white">
                Le Sanctuaire
                </h1>
                <h2 className="text-4xl md:text-5xl font-headline text-white/80 leading-tight mt-2">
                Le silence qui vous écoute.
                </h2>

                <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
                Un espace intime pour déposer ce qui vous traverse.
                <br />
                Sans jugement. Sans bruit. Sans objectif de performance.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
                <Button
                    size="lg"
                    onClick={() => setIsAuthDialogOpen(true)}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
                >
                    Ouvrir mon sanctuaire
                </Button>
                <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white"
                >
                    <Link href="/sanctuary/write">Essayer sans compte</Link>
                </Button>
                </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-10 z-10"
              style={{ opacity: textOpacity }}
            >
              <a href="#manifesto" aria-label="Scroll down">
                  <ChevronDown className="h-6 w-6 text-white/70" />
              </a>
            </motion.div>
        </section>
      </div>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      
      {/* This section is needed to give context to the scroll down button and the next section */}
      <section id="manifesto" className="py-32 bg-stone-50/70">
        <div className="container max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-headline text-stone-800 tracking-tight mb-8">Notre Manifeste</h2>
            <div className="space-y-8 text-lg text-stone-600 font-body leading-relaxed">
              <p>
                Dans un monde qui exige de nous une performance constante, où chaque pensée doit être optimisée, où chaque émotion doit être canalisée vers un but, Aurum est une terre de jachère.
              </p>
              <p>
                Ce n'est pas un outil pour devenir plus productif. Ce n'est pas une application pour "hacker" votre bien-être. C'est un sanctuaire. Un espace pour le désordre, pour la nuance, pour le murmure intérieur que le bruit du quotidien cherche à étouffer.
              </p>
              <p>
                Nous croyons au pouvoir du dépôt. L'acte de simplement poser des mots, sans chercher à les sculpter, à les polir, est en soi une libération.
              </p>
            </div>
        </div>
      </section>
    </>
  );
}
