// Using a client component for the animations with framer-motion
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BrainCircuit, Book, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
    },
  },
};

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: 'easeOut',
    },
  }),
};

export default function LandingPage() {
  const features = [
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: 'Clarifiez votre esprit',
      description: "Notre IA analyse vos entrées pour révéler des schémas et vous aider à comprendre votre charge mentale.",
    },
    {
      icon: <Book className="h-8 w-8 text-primary" />,
      title: "Vainquez la page blanche",
      description: "Ne vous demandez plus jamais quoi écrire. L'IA peut vous guider avec des invites personnalisées.",
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: 'Ne perdez plus aucune idée',
      description: 'Le Sanctuaire capture et organise vos pensées, même les plus fugaces, pour que vous puissiez y revenir plus tard.',
    },
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-grow text-center px-4 py-20 md:py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight tracking-tighter text-stone-800">
            Transformez le bruit de vos pensées en or.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Le premier journal intime qui vous écoute vraiment. Assisté par IA, sécurisé par nature.
          </p>
          <Button asChild size="lg" className="mt-10" variant="outline">
            <Link href="/sanctuary/write">Entrer dans le Sanctuaire</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-card">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={featureVariants}
                className="flex flex-col items-center"
              >
                {feature.icon}
                <h3 className="mt-5 text-xl font-semibold font-headline text-stone-800">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card">
        <div className="container mx-auto flex justify-center items-center text-muted-foreground">
          <Logo className="h-5 w-5 mr-2 text-primary" />
          <span>Fait avec émotion à Paris.</span>
        </div>
      </footer>
    </div>
  );
}
