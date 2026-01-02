
import Link from 'next/link';
import { Feather, BrainCircuit, Archive } from 'lucide-react';
import { HeroSection } from '@/components/landing/hero-section';
import { InspirationSection } from '@/components/landing/inspiration-section';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-amber-50 text-amber-600">
            <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-headline text-stone-700 mb-3">{title}</h3>
        <p className="text-stone-600 max-w-xs">{children}</p>
    </div>
);

const FaqSection = () => (
    <section className="py-32 bg-stone-50">
        <div className="container max-w-3xl mx-auto">
            <h2 className="text-4xl font-headline text-stone-800 mb-12 text-center">Questions Fréquentes</h2>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-headline">Est-ce que mes données sont lues par l'IA ?</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-base text-stone-600 leading-relaxed">
                            Votre vie privée est notre priorité absolue. Les entrées sont chiffrées et stockées de manière sécurisée. L'IA analyse le texte de manière anonymisée pour extraire le sentiment, mais elle n'a aucune mémoire à long terme de vos écrits. Personne, pas même notre équipe, ne peut lire vos entrées.
                        </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-headline">Comment Aurum aide à la santé mentale ?</AccordionTrigger>
                    <AccordionContent>
                       <p className="text-base text-stone-600 leading-relaxed">
                         Aurum est conçu pour alléger votre charge mentale. En vous offrant un espace pour l'introspection et le "shadow work" (travail sur soi), vous pouvez identifier des schémas de pensée. L'analyse de sentiment vous aide à prendre conscience de votre paysage émotionnel. Beaucoup l'utilisent comme un journal de gratitude pour cultiver une perspective positive.
                       </p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-headline">Est-ce gratuit ?</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-base text-stone-600 leading-relaxed">
                            Oui, la fonctionnalité principale d'écriture est entièrement gratuite et illimitée, même sans compte. Un compte gratuit vous permet de sauvegarder vos entrées et de suivre vos progrès. Nous prévoyons des fonctionnalités premium optionnelles à l'avenir, mais le cœur de l'expérience restera accessible à tous.
                        </p>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    </section>
);


export default function LandingPage() {
  return (
    <>
      <HeroSection />

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
      
      <InspirationSection />

      <FaqSection />
    </>
  );
}
