import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sources des citations | Aurum",
  description:
    "Sources utilisées pour les citations d'inspiration affichées sur Aurum.",
  alternates: {
    canonical: "https://aurumdiary.com/sources-citations",
  },
};

const citations = [
  {
    quote: "Écrire, c'est te donner de l'air.",
    author: "Aurum",
    source: "Formule éditoriale Aurum, inspirée des pratiques d'écriture expressive.",
  },
  {
    quote: "Un paragraphe suffit pour commencer.",
    author: "Aurum",
    source: "Formule éditoriale Aurum pour encourager une routine d'écriture courte.",
  },
  {
    quote: "Quand tu écris, tes idées se rangent.",
    author: "Aurum",
    source: "Formule éditoriale Aurum, inspirée des bénéfices observés de l'écriture régulière.",
  },
];

export default function SourcesCitationsPage() {
  return (
    <div className="min-h-screen bg-stone-50/50">
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-headline md:text-4xl">Sources des citations</h1>
          <p className="mb-8 text-stone-600">
            Nous séparons l&apos;inspiration (citations courtes) et les preuves (études).
          </p>

          <div className="space-y-4">
            {citations.map((item) => (
              <article
                key={`${item.quote}-${item.author}`}
                className="rounded-2xl border border-stone-200 bg-white p-5"
              >
                <p className="italic text-stone-800">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-1 text-sm text-stone-500">- {item.author}</p>
                <p className="mt-3 text-xs text-stone-500">{item.source}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-xs text-stone-500">
            Pour les études scientifiques, consulte aussi{" "}
            <Link href="/guides" className="underline underline-offset-2">
              les guides Aurum
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
