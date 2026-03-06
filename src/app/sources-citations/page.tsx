import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getRequestLocale } from "@/lib/locale-server";
import { toLocalePath } from "@/i18n/routing";

const copy = {
  fr: {
    title: "Sources des citations",
    intro:
      "Cette page documente les citations d'inspiration affichées sur Aurum.",
    back: "Retour à aurumdiary.com",
    guides: "les guides Aurum",
    guidesPrefix: "Pour les contenus orientés études, consulte aussi",
    citations: [
      {
        quote: "Nous écrivons pour goûter la vie deux fois.",
        author: "Anaïs Nin",
        source: "Citation couramment attribuée à Anaïs Nin.",
      },
      {
        quote: "J'écris pour découvrir ce que je pense.",
        author: "Joan Didion",
        source: "Citation couramment attribuée à Joan Didion.",
      },
      {
        quote: "Un mot après l'autre, c'est le pouvoir.",
        author: "Margaret Atwood",
        source: "Citation couramment attribuée à Margaret Atwood.",
      },
      {
        quote: "Écrire est une forme de thérapie.",
        author: "Graham Greene",
        source: "Attribution courante, formulation pouvant varier selon les sources.",
      },
    ],
  },
  en: {
    title: "Quote Sources",
    intro: "This page documents inspiration quotes displayed in Aurum.",
    back: "Back to aurumdiary.com",
    guides: "Aurum guides",
    guidesPrefix: "For research-oriented content, see",
    citations: [
      {
        quote: "We write to taste life twice.",
        author: "Anais Nin",
        source: "Commonly attributed quote.",
      },
      {
        quote: "I write to find out what I think.",
        author: "Joan Didion",
        source: "Commonly attributed quote.",
      },
      {
        quote: "A word after a word after a word is power.",
        author: "Margaret Atwood",
        source: "Commonly attributed quote.",
      },
      {
        quote: "Writing is a form of therapy.",
        author: "Graham Greene",
        source: "Common attribution; wording may vary by source.",
      },
    ],
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Sources des citations | Aurum" : "Quote Sources | Aurum";
  const description = isFr
    ? "Sources et attributions des citations d'inspiration affichées dans Aurum."
    : "Sources and attributions for inspiration quotes displayed in Aurum.";
  const canonical = "https://aurumdiary.com/sources-citations";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      locale: isFr ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function SourcesCitationsPage() {
  const locale = await getRequestLocale();
  const t = copy[locale];
  const guidesHref = toLocalePath("/guides", locale);

  return (
    <div className="min-h-screen bg-stone-50/50">
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-headline md:text-4xl">{t.title}</h1>
          <p className="mb-8 text-stone-600">{t.intro}</p>
          <div className="mb-8">
            <Button asChild variant="outline">
              <Link href="https://aurumdiary.com">{t.back}</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {t.citations.map((item) => (
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
            {t.guidesPrefix}{" "}
            <Link href={guidesHref} className="underline underline-offset-2">
              {t.guides}
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
