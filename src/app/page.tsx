
import React from 'react';
import ScrollSequence from '@/components/landing/ScrollSequence';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { BrainCircuit, Lock, PenSquare, MessageCircle } from 'lucide-react';
import Link from 'next/link';


export default function Home() {
  const almaJournalEntries = [
    {
      title: "SYNDROME DE L'IMPOSTEUR",
      timestamp: "Mardi, 14h02",
      entry: "Ils ont applaudi ma présentation. Pourquoi j'ai l'impression d'avoir volé leur admiration ? J'attends qu'ils découvrent que je n'ai aucune idée de ce que je fais.",
      iaResponse: "Le succès ne chasse pas la peur, il la met en lumière. Ce vertige est la preuve de ta compétence, pas de ton imposture."
    },
    {
      title: "ANXIÉTÉ INSOMNIE",
      timestamp: "Dimanche, 03h15",
      entry: "La liste des tâches tourne en boucle. Si je dors maintenant, j'ai peur d'oublier l'essentiel pour demain. Mon cerveau refuse le bouton off.",
      iaResponse: "Ta mémoire est faillible, ce Sanctuaire ne l'est pas. Dépose tout ici. Ton esprit a la permission de s'éteindre."
    },
    {
      title: "FATIGUE ÉMOTIONNELLE",
      timestamp: "Lundi, 19h30",
      entry: "J'ai dit 'ça va super' douze fois aujourd'hui. Je crois que je ne sais même plus ce que je ressens vraiment sous le masque.",
      iaResponse: "La dissonance émotionnelle est épuisante. Ici, tu n'as pas de public. Dis-nous la vérité."
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

  return (
    <main>
      <ScrollSequence />
      
      <div id="sanctuary-content" className="bg-background text-foreground">
        {/* SECTION 1: Le Sanctuaire */}
        <section className="container mx-auto py-24 md:py-32 text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary">Le Sanctuaire</h1>
            <p className="mt-4 text-2xl md:text-3xl font-headline">Le silence qui vous écoute.</p>
            <p className="mt-6 text-lg max-w-2xl mx-auto text-muted-foreground">
                Un espace intime pour déposer ce qui vous traverse. Sans jugement. Sans bruit. Sans objectif de performance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                    <Link href="/sanctuary/write">Ouvrir mon sanctuaire</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="/sanctuary/write">Essayer sans compte</Link>
                </Button>
            </div>
        </section>

        {/* SECTION 2: Un manifeste du silence */}
        <section className="container mx-auto py-24 md:py-32">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-center mb-12">
                    Un manifeste du silence
                </h2>
                <div className="prose prose-lg lg:prose-xl mx-auto text-foreground/90">
                    <p>Dans un monde qui exige constamment notre attention, le silence est un luxe. Aurum est né de ce besoin : créer une pause, un lieu où le bruit extérieur s'estompe pour laisser place à votre voix intérieure.</p>
                    <p>Votre journal n'est pas un outil de productivité. Il ne vous demandera pas d'être plus efficace, plus organisé, ou d'atteindre des objectifs. Il vous demande simplement d'être.</p>
                    <p>Ici, la seule mesure est la sincérité de l'instant. Ici, pas de badges, de séries à maintenir, ou de compétition. Juste vous, vos pensées, et un espace qui les accueille avec une bienveillance inconditionnelle.</p>
                    <p>C'est le sanctuaire que vous méritez.</p>
                </div>
            </div>
        </section>

        {/* SECTION 3: Features */}
        <section className="container mx-auto py-24 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                {features.map((feature) => (
                    <div key={feature.title} className="flex flex-col items-center">
                        <div className="text-primary w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 mb-6">
                            {React.cloneElement(feature.icon, { className: "w-8 h-8" })}
                        </div>
                        <h3 className="text-2xl font-headline font-bold">{feature.title}</h3>
                        <p className="mt-4 text-muted-foreground">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* SECTION 4: Le Journal d'Alma */}
        <section className="bg-secondary/50 py-24 md:py-32">
            <div className="container mx-auto">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-headline font-bold">Le Journal d'Alma</h2>
                    <p className="mt-6 text-lg text-muted-foreground">
                        Le Journal d'Alma est une fenêtre sur l'introspection. Découvrez comment de simples pensées peuvent se transformer en révélations, et laissez-vous inspirer pour commencer votre propre voyage.
                    </p>
                </div>
                
                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {almaJournalEntries.map((item, index) => (
                        <Card key={index} className="shadow-lg flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-sm font-code uppercase tracking-widest text-primary">{item.title}</CardTitle>
                                <CardDescription className="font-code text-xs">{item.timestamp}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <p className="italic">“{item.entry}”</p>
                                <div className="flex items-start gap-3 pt-4 border-t border-dashed">
                                    <MessageCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                    <p className="text-sm text-foreground/80">{item.iaResponse}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <Carousel opts={{ loop: true }}>
                        <CarouselContent>
                            {almaJournalEntries.map((item, index) => (
                                <CarouselItem key={index} className="basis-11/12">
                                     <Card className="shadow-lg flex flex-col h-full">
                                        <CardHeader>
                                            <CardTitle className="text-sm font-code uppercase tracking-widest text-primary">{item.title}</CardTitle>
                                            <CardDescription className="font-code text-xs">{item.timestamp}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-4">
                                            <p className="italic">“{item.entry}”</p>
                                            <div className="flex items-start gap-3 pt-4 border-t border-dashed">
                                                <MessageCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                                <p className="text-sm text-foreground/80">{item.iaResponse}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
            </div>
        </section>
        
        {/* SECTION 5: CTA Final */}
        <section className="container mx-auto py-24 md:py-32 text-center">
            <Button asChild size="lg" className="text-lg h-14 px-12">
                <Link href="/sanctuary/write">OUVRIR VOTRE PROPRE JOURNAL</Link>
            </Button>
        </section>

        {/* SECTION 6: FAQ */}
        <section className="container mx-auto max-w-3xl pb-24 md:pb-32">
             <h2 className="text-4xl font-headline font-bold text-center mb-12">
                Questions Fréquentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xl">Qui peut lire mes données ?</AccordionTrigger>
                    <AccordionContent className="prose prose-lg">
                        Personne d'autre que vous. Vos données sont privées et chiffrées. Même l'analyse par IA se fait de manière automatisée, sans intervention humaine. Nous n'avons pas accès à vos écrits.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xl">Comment Aurum aide à la santé mentale ?</AccordionTrigger>
                    <AccordionContent className="prose prose-lg">
                        Aurum est un outil d'introspection, pas un substitut à une thérapie. Il vous offre un espace sécurisé pour extérioriser vos pensées et vous aide à identifier des schémas émotionnels. Cet acte d'écriture et de réflexion peut être une composante bénéfique d'une bonne hygiène mentale.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-xl">Est-ce gratuit ?</AccordionTrigger>
                    <AccordionContent className="prose prose-lg">
                        Oui, Aurum propose une offre gratuite généreuse pour vous permettre de commencer votre voyage. Des plans payants sont disponibles pour ceux qui souhaitent un usage plus intensif et des fonctionnalités avancées, ce qui nous permet de maintenir et d'améliorer le service en toute indépendance.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </section>

      </div>
    </main>
  );
}
