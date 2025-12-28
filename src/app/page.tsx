
import Link from 'next/link';
import { Feather, BrainCircuit, Archive } from 'lucide-react';
import { HeroSection } from '@/components/landing/hero-section';
import { InspirationSection } from '@/components/landing/inspiration-section';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.41,8.37a2.4,2.4,0,0,0-3.32,2.83,2.4,2.4,0,0,0,3.32-2.83m-1.2,3.32A1.2,1.2,0,1,1,12,10.5,1.2,1.2,0,0,1,11.21,11.69" />
        <path d="M19.5,12a7.5,7.5,0,1,0-9,7.21,1,1,0,0,0,1.41-1.41A5.5,5.5,0,1,1,17,12a1,1,0,0,0,0-2,7.42,7.42,0,0,0-1.55.2V7.5a1,1,0,0,0-2,0v1.1a7.5,7.5,0,0,0-7.42,6.4,1,1,0,0,0,1,1.1H8.5a1,1,0,0,0,1-1,5.5,5.5,0,0,1,10,0,1,1,0,0,0,1,1h.33A1,1,0,0,0,22,15a7.5,7.5,0,0,0-2.5-5.54" />
    </svg>
)

const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-amber-50 text-amber-600">
            <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-headline text-stone-700 mb-3">{title}</h3>
        <p className="text-stone-600 max-w-xs">{children}</p>
    </div>
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

      <footer className="py-16">
          <div className="container mx-auto flex flex-col items-center gap-4">
              <Logo className="h-8 w-8 text-stone-400" />
              <p className="text-sm text-stone-400 font-body">© 2025 Aurum. Un espace pour vous.</p>
          </div>
      </footer>
    </>
  );
}
