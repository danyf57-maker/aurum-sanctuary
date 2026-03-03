import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Quote Sources | Aurum",
  description: "Sources for inspirational quotes displayed in Aurum.",
  alternates: {
    canonical: "https://aurumdiary.com/sources-citations",
  },
};

const citations = [
  {
    quote: "We write to taste life twice.",
    author: "Anais Nin",
    source: "Commonly attributed quote in English anthologies and quote collections.",
  },
  {
    quote: "I write entirely to find out what I'm thinking.",
    author: "Joan Didion",
    source: "Commonly attributed statement from Joan Didion interviews and essays.",
  },
  {
    quote: "A word after a word after a word is power.",
    author: "Margaret Atwood",
    source: "Widely cited quote from Margaret Atwood's writing and speeches.",
  },
  {
    quote: "Writing is a form of therapy.",
    author: "Graham Greene",
    source: "Common attribution; exact wording can vary by source.",
  },
  {
    quote: "Writing is a way of talking without being interrupted.",
    author: "Jules Renard",
    source: "Frequently attributed in literary quote collections.",
  },
  {
    quote: "There is no greater agony than bearing an untold story inside you.",
    author: "Maya Angelou",
    source: "Maya Angelou, commonly cited from interviews and speeches.",
  },
];

export default function SourcesCitationsPage() {
  return (
    <div className="min-h-screen bg-stone-50/50">
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-headline md:text-4xl">Quote sources</h1>
          <p className="mb-8 text-stone-600">
            This page documents inspirational quotes displayed in Aurum and their common attributions.
          </p>
          <div className="mb-8">
            <Button asChild variant="outline">
              <Link href="https://aurumdiary.com">Back to aurumdiary.com</Link>
            </Button>
          </div>

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
            For educational mental wellness content, also see{" "}
            <Link href="/guides" className="underline underline-offset-2">
              Aurum guides
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
