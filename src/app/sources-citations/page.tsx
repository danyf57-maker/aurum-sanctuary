import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sources des citations | Aurum",
  description:
    "Sources des citations affichées sur Aurum, avec mention des traductions en français.",
  alternates: {
    canonical: "https://aurumdiary.com/sources-citations",
  },
};

const citations = [
  {
    quote: "Nous écrivons pour goûter la vie deux fois.",
    author: "Anaïs Nin",
    source:
      "Citation couramment attribuée à Anaïs Nin (traduction française de l'anglais).",
  },
  {
    quote: "J'écris pour découvrir ce que je pense.",
    author: "Joan Didion",
    source:
      "Citation couramment attribuée à Joan Didion (traduction française de l'anglais).",
  },
  {
    quote: "Un mot après l'autre, c'est le pouvoir.",
    author: "Margaret Atwood",
    source:
      "Citation couramment attribuée à Margaret Atwood (traduction française de l'anglais).",
  },
  {
    quote: "Écrire est une forme de thérapie.",
    author: "Graham Greene",
    source: "Attribution courante, formulation pouvant varier selon les sources.",
  },
  {
    quote: "Écrire, c'est une façon de parler sans être interrompu.",
    author: "Jules Renard",
    source: "Formulation attribuée à Jules Renard, présente dans des recueils de citations.",
  },
  {
    quote:
      "Il n'y a pas de plus grande agonie que de porter une histoire non racontée en soi.",
    author: "Maya Angelou",
    source:
      "Maya Angelou, citation de référence (traduction française de l'anglais).",
  },
];

export default function SourcesCitationsPage() {
  return (
    <div className="min-h-screen bg-stone-50/50">
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-headline md:text-4xl">
            Sources des citations
          </h1>
          <p className="mb-8 text-stone-600">
            Cette page documente les citations d&apos;inspiration affichées sur Aurum. Les
            citations issues de l&apos;anglais sont affichées en traduction française.
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
            Pour les contenus orientés études, consulte aussi{" "}
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
