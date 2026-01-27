import ScrollSequence from '@/components/landing/ScrollSequence';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Lock, PenSquare, Sparkles } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <PenSquare />,
    title: "Écriture Libre & Sécurisée",
    description: "Un espace d'écriture minimaliste et sans distraction pour que vos pensées puissent s'écouler librement. Chaque entrée est la vôtre, et uniquement la vôtre.",
  },
  {
    icon: <Sparkles />,
    title: "Dialogue Introspectif",
    description: "Conversez avec Aurum, une IA conçue pour l'écoute active. Posez des questions, explorez vos sentiments et recevez des réflexions bienveillantes.",
  },
  {
    icon: <BrainCircuit />,
    title: "Révélez vos Schémas",
    description: "L'IA analyse vos écrits pour vous aider à identifier des thèmes récurrents, des changements d'humeur et des schémas de pensée, vous offrant une nouvelle perspective.",
  },
  {
    icon: <Lock />,
    title: "Votre Jardin Secret",
    description: "Vos données vous appartiennent. Exportez-les ou supprimez-les à tout moment. La confidentialité n'est pas une option, c'est le fondement d'Aurum.",
  }
];

export default function Home() {
  return (
    <main>
      <ScrollSequence />
      
      <div id="manifesto" className="bg-background">
        <section className="container mx-auto py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Plus qu'un journal. Un miroir.
                </h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Aurum a été conçu pour être un sanctuaire. Dans le bruit du quotidien, il offre un silence où vos pensées peuvent non seulement se poser, mais aussi prendre forme. En utilisant une intelligence artificielle bienveillante, nous ne cherchons pas à vous donner des réponses, mais à vous aider à trouver les vôtres.
                </p>
            </div>
        </section>

        <section className="container mx-auto pb-20 md:pb-32">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                    <Card key={feature.title} className="bg-card/50 border-border/50">
                        <CardHeader>
                             <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 w-12 h-12 rounded-lg flex items-center justify-center">
                                {feature.icon}
                            </div>
                            <CardTitle className="pt-4 font-headline text-2xl">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        <section className="pb-20 md:pb-32">
             <div className="container mx-auto text-center">
                 <h2 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl">
                    Le voyage commence par un seul mot.
                </h2>
                 <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                    Aucune inscription requise pour commencer. Laissez une trace, une pensée, une émotion.
                </p>
                <div className="mt-8">
                    <Button asChild size="lg">
                        <Link href="/sanctuary/write">Commencer à écrire</Link>
                    </Button>
                </div>
             </div>
        </section>
      </div>
    </main>
  );
}
