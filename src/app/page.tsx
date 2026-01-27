
'use client';

import React from 'react';
import ScrollSequence from '@/components/landing/ScrollSequence';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { BrainCircuit, Lock, PenSquare } from 'lucide-react';
import Link from 'next/link';

const AlmaCard = ({ title, time, entry, response }: { title: string, time: string, entry: string, response: string }) => (
    <div className="flex-1 bg-white p-10 rounded-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-in-out hover:-translate-y-1 min-w-[300px] group">
        <div className="flex justify-between text-xs uppercase tracking-wider text-gray-500 mb-5">
            <span>{title}</span>
            <span>{time}</span>
        </div>
        <p className="font-handwriting text-2xl text-gray-700 mb-7 leading-snug">
            "{entry}"
        </p>
        <div className="w-10 h-px bg-primary mb-5 transition-all duration-500 ease-in-out group-hover:w-full"></div>
        <p className="text-sm italic text-foreground">
            {response}
        </p>
    </div>
);

export default function Home() {
  const almaJournalEntries = [
    {
      title: "SYNDROME DE L'IMPOSTEUR",
      time: "Mardi, 14h02",
      entry: "Ils ont applaudi ma présentation. Pourquoi j'ai l'impression d'avoir volé leur admiration ? J'attends qu'ils découvrent que je n'ai aucune idée de ce que je fais.",
      response: "Le succès ne chasse pas la peur, il la met en lumière. Ce vertige est la preuve de ta compétence, pas de ton imposture."
    },
    {
      title: "ANXIÉTÉ INSOMNIE",
      time: "Dimanche, 03h15",
      entry: "La liste des tâches tourne en boucle. Si je dors maintenant, j'ai peur d'oublier l'essentiel pour demain. Mon cerveau refuse le bouton off.",
      response: "Ta mémoire est faillible, ce Sanctuaire ne l'est pas. Dépose tout ici. Ton esprit a la permission de s'éteindre."
    },
    {
      title: "FATIGUE ÉMOTIONNELLE",
      time: "Lundi, 19h30",
      entry: "J'ai dit 'ça va super' douze fois aujourd'hui. Je crois que je ne sais même plus ce que je ressens vraiment sous le masque.",
      response: "La dissonance émotionnelle est épuisante. Ici, tu n'as pas de public. Dis-nous la vérité."
    }
  ];
  
  const features = [
    {
      icon: <PenSquare />,
      title: "Écrivez librement",
      description: "Une interface pure qui s'efface pour laisser place à vos mots. Pas de distractions, juste une page blanche qui attend.",
    },
    {
      icon: <BrainCircuit />,
      title: "Comprenez-vous",
      description: "Grâce à une technologie d'analyse discrète, Aurum vous aide à voir les tendances émotionnelles qui se dessinent dans vos écrits, sans jamais vous juger.",
    },
    {
      icon: <Lock />,
      title: "Gardez vos traces",
      description: "Toutes vos entrées sont chiffrées et stockées en toute sécurité. Votre sanctuaire est privé, et le restera pour toujours.",
    }
  ];
  
  const faqs = [
    {
      question: "Qui peut lire mes données ?",
      answer: "Personne d'autre que vous. Vos données sont privées et chiffrées. Même l'analyse par IA se fait de manière automatisée, sans intervention humaine. Nous n'avons pas accès à vos écrits."
    },
    {
      question: "Comment Aurum aide à la santé mentale ?",
      answer: "Aurum est un outil d'introspection, pas un substitut à une thérapie. Il vous offre un espace sécurisé pour extérioriser vos pensées et vous aide à identifier des schémas émotionnels. Cet acte d'écriture et de réflexion peut être une composante bénéfique d'une bonne hygiène mentale."
    },
    {
      question: "Est-ce gratuit ?",
      answer: "Oui, Aurum propose une offre gratuite généreuse pour vous permettre de commencer votre voyage. Des plans payants sont disponibles pour ceux qui souhaitent un usage plus intensif et des fonctionnalités avancées, ce qui nous permet de maintenir et d'améliorer le service en toute indépendance."
    }
  ];

  return (
    <main>
      <ScrollSequence />
      
      <div id="sanctuary-content" className="bg-background text-foreground">
        
        {/* SECTION 1: Le Sanctuaire */}
        <section className="h-[90vh] flex flex-col justify-center items-center text-center animate-fade-in container">
            <h1 className="text-6xl lg:text-7xl font-headline tracking-tighter">Le Sanctuaire</h1>
            <p className="text-2xl lg:text-3xl font-headline italic text-primary my-6">Le silence qui vous écoute.</p>
            <p className="max-w-md text-muted-foreground mb-12">
                Un espace intime pour déposer ce qui vous traverse. Sans jugement. Sans bruit. Sans objectif de performance.
            </p>
            <div className="flex gap-5 items-center">
                <Button asChild size="lg">
                    <Link href="/sanctuary/write">Ouvrir mon sanctuaire</Link>
                </Button>
                <Link href="/sanctuary/write" className="text-sm underline underline-offset-4">Essayer sans compte</Link>
            </div>
        </section>

        {/* SECTION 2: Un manifeste du silence */}
        <section className="py-24 md:py-32">
          <div className="container max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-headline text-center mb-12">
                  Un manifeste du silence
              </h2>
              <div className="prose prose-lg lg:prose-xl mx-auto text-foreground/80 font-light space-y-6">
                  <p>Dans un monde qui exige constamment notre attention, le silence est un luxe. Aurum est né de ce besoin : créer une pause, un lieu où le bruit extérieur s'estompe pour laisser place à votre voix intérieure.</p>
                  <p>Votre journal n'est pas un outil de productivité. Il ne vous demandera pas d'être plus efficace, plus organisé, ou d'atteindre des objectifs. <span className="text-primary italic">Il vous demande simplement d'être.</span></p>
                  <p>Ici, la seule mesure est la sincérité de l'instant. Ici, pas de badges, de séries à maintenir, ou de compétition. Juste vous, vos pensées, et un espace qui les accueille avec une bienveillance inconditionnelle.</p>
                   <p>C'est le sanctuaire que vous méritez.</p>
              </div>
          </div>
        </section>

        {/* SECTION 3: Features */}
        <section className="py-24 md:py-32 container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
                {features.map((feature) => (
                    <div key={feature.title} className="flex flex-col items-center">
                        <div className="text-primary w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 mb-6">
                            {React.cloneElement(feature.icon, { className: "w-8 h-8" })}
                        </div>
                        <h3 className="text-3xl font-headline text-primary mb-4">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* SECTION 4: Le Journal d'Alma */}
        <section className="py-24 md:py-32 bg-gradient-to-b from-background to-stone-200/30">
            <div className="container">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-5xl font-headline mb-4">Le Journal d'Alma</h2>
                    <p className="text-muted-foreground">
                        Découvrez comment de simples pensées peuvent se transformer en révélations, et laissez-vous inspirer pour commencer votre propre voyage.
                    </p>
                </div>
                
                {/* Desktop Grid */}
                <div className="hidden md:flex gap-8">
                    {almaJournalEntries.map((item, index) => (
                        <AlmaCard key={index} {...item} />
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <Carousel opts={{ loop: true }}>
                        <CarouselContent className="-ml-4">
                            {almaJournalEntries.map((item, index) => (
                                <CarouselItem key={index} className="pl-4 basis-11/12">
                                     <div className="p-1 h-full">
                                         <AlmaCard {...item} />
                                     </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
            </div>
        </section>
        
        {/* SECTION 5: CTA Final */}
        <section className="container py-24 md:py-32 text-center border-t border-black/5">
            <Button asChild size="lg" className="h-14 px-12 text-base">
                <Link href="/sanctuary/write">OUVRIR VOTRE PROPRE JOURNAL</Link>
            </Button>
        </section>

        {/* SECTION 6: FAQ */}
        <section className="container max-w-3xl pb-24 md:pb-32">
             <h2 className="text-4xl font-headline text-center mb-12">
                Questions Fréquentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index + 1}`} key={index}>
                        <AccordionTrigger className="text-xl text-left font-headline font-normal">{faq.question}</AccordionTrigger>
                        <AccordionContent className="prose prose-lg font-light text-foreground/80">
                           {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>

      </div>
    </main>
  );
}
