import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notre Manifeste",
  description:
    "Le manifeste d'Aurum: un espace privé, sans publicité, centré sur la clarté mentale et la confidentialité.",
  alternates: {
    canonical: "https://aurumdiary.com/manifeste",
  },
};

export default function ManifestePage() {
  return (
    <div className="bg-stone-50/50 min-h-screen">
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6">
            Notre Manifeste de Confiance
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            Nous ne vendons pas de publicité. Nous ne vendons pas tes données.
            Nous construisons un espace privé pour écrire, comprendre ce que tu
            ressens et retrouver de la clarté mentale.
          </p>

          <div className="space-y-8 text-foreground/90">
            <section>
              <h2 className="text-2xl font-headline mb-3">1. Ton intimité t'appartient</h2>
              <p>
                Ton journal n'est pas un produit. Tes écrits ne sont pas conçus
                pour l'exposition publique ni pour la performance sociale.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">2. La clarté avant le bruit</h2>
              <p>
                Nous cherchons la simplicité utile: t'aider à passer de la
                confusion à une prise de conscience actionnable, rapidement.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">3. Une IA au service de ta réflexion</h2>
              <p>
                L'IA d'Aurum accompagne ton introspection. Elle ne remplace pas
                un avis médical ni un suivi thérapeutique.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">4. Contrôle et transparence</h2>
              <p>
                Tu gardes la main sur tes données, ton compte et tes contenus.
                Nous documentons notre méthodologie et nos limites.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
