import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodologie IA",
  description:
    "Méthodologie d'Aurum: comment les analyses IA sont produites, leurs limites et les bonnes pratiques d'interprétation.",
  alternates: {
    canonical: "https://aurumdiary.com/methodologie",
  },
};

export default function MethodologiePage() {
  return (
    <div className="bg-stone-50/50 min-h-screen">
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6">
            Méthodologie IA d&apos;Aurum
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            Cette page documente comment Aurum génère ses analyses, ce que ces
            analyses peuvent apporter, et ce qu&apos;elles ne remplacent pas.
          </p>

          <div className="space-y-8 text-foreground/90">
            <section>
              <h2 className="text-2xl font-headline mb-3">1. Entrées analysées</h2>
              <p>
                Aurum traite le texte que tu écris pour identifier des tendances
                émotionnelles, des thèmes récurrents et des pistes de réflexion.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">2. Sorties produites</h2>
              <p>
                Les sorties sont des synthèses, des suggestions d&apos;introspection
                et des observations linguistiques. Elles sont destinées à la
                clarté personnelle, pas au diagnostic.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">3. Limites connues</h2>
              <p>
                Comme tout modèle IA, Aurum peut produire des approximations.
                Les résultats doivent être interprétés comme un support de
                réflexion, et non comme un avis médical ou thérapeutique.
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">4. Confidentialité</h2>
              <p>
                La confidentialité est un principe central du produit. Pour les
                détails techniques et juridiques, consulte la politique de
                confidentialité et les conditions d&apos;utilisation.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
