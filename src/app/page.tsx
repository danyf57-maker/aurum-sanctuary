import Link from 'next/link';
import Image from 'next/image';
import { Feather, BrainCircuit, Archive, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/landing/hero-section';
import { getPublicPosts } from '@/lib/firebase/firestore';
import { BlogCard } from '@/components/blog/blog-card';

const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center h-16 w-16 mb-6 rounded-full bg-amber-50 text-amber-600">
            <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-headline text-stone-700 mb-3">{title}</h3>
        <p className="text-stone-600 max-w-xs">{children}</p>
    </div>
);


export default async function LandingPage() {
  const latestPosts = await getPublicPosts(3);

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
      
      {latestPosts.length > 0 && (
        <section className="py-32 bg-stone-50">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-headline text-stone-800">Le Journal d'Alma</h2>
              <p className="mt-4 text-lg text-stone-600">
                Une invitation au voyage intérieur. Laissez-vous inspirer par les réflexions d'Alma et découvrez la puissance de l'écriture.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
             <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/blog">
                  Explorer le blog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}


      <footer className="py-16">
          <div className="container mx-auto flex flex-col items-center gap-4">
              <Image src="/logoAurum.png" alt="Aurum Logo" width={96} height={28} className="h-8 w-auto" />
              <p className="text-sm text-stone-400 font-body">© 2025 Aurum. Un espace pour vous.</p>
          </div>
      </footer>
    </>
  );
}
