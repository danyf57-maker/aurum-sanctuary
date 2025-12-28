"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mockData = [
  {
    date: "Mardi, 23h42",
    userText: "Ils ont applaudi ma présentation. Pourquoi j'ai l'impression d'avoir volé leur admiration ? J'attends qu'ils découvrent que je n'ai aucune idée de ce que je fais.",
    aiInsight: "Le succès ne chasse pas la peur, il la met en lumière. Ce vertige est la preuve de ta compétence, pas de ton imposture."
  },
  {
    date: "Dimanche, 3h04",
    userText: "3h du matin. La liste des tâches tourne en boucle. Si je dors maintenant, j'ai peur d'oublier l'essentiel pour demain.",
    aiInsight: "Ta mémoire est faillible, ce Sanctuaire ne l'est pas. Dépose tout ici. Ton esprit a la permission de s'éteindre."
  },
  {
    date: "Vendredi, 18h51",
    userText: "J'ai dit 'ça va super' à tout le monde aujourd'hui. Je crois que je ne sais même plus ce que je ressens vraiment sous le masque.",
    aiInsight: "La dissonance émotionnelle est épuisante. Ici, tu n'as pas de public. Dis-nous la vérité."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, 0.05, -0.01, 0.9],
    },
  },
};

export function InspirationSection() {
  return (
    <section className="py-32 bg-stone-50/70">
      <div className="container mx-auto">
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-headline text-stone-800 tracking-tight">Pages volées au quotidien.</h2>
          <p className="mt-6 text-lg text-stone-600">
            Le Journal d'Alma est une fenêtre sur l'introspection. Découvrez comment de simples pensées peuvent se transformer en révélations, et laissez-vous inspirer pour commencer votre propre voyage.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {mockData.map((item, index) => (
            <motion.div key={index} variants={itemVariants} className="group relative">
              <div className="h-full bg-white/60 p-8 rounded-lg shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 transition-shadow duration-500 hover:-translate-y-2 transform">
                <p className="text-sm text-stone-400 mb-4">{item.date}</p>
                <p className="font-headline italic text-stone-700 text-lg leading-relaxed mb-6">
                  "{item.userText}"
                </p>
                <div className="h-px w-1/4 bg-amber-400 mb-6"></div>
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="font-body text-amber-800/90 text-sm">{item.aiInsight}</p>
                </div>
                 <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <Button variant="ghost" size="sm" asChild>
                       <Link href="/blog">
                           Lire <ArrowRight className="ml-2 h-4 w-4" />
                       </Link>
                   </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-stone-800 hover:bg-stone-900 text-white">
                <Link href="/sanctuary/write">
                    Ouvrir votre propre journal
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
