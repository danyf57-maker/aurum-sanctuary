import type { Metadata } from "next";
import Link from "next/link";
import { getKnowledgeHubTopics } from "@/lib/knowledge-hub";
import { getRequestLocale } from "@/lib/locale-server";
import { buildAlternates, openGraphLocale, schemaLanguage, SITE_URL } from "@/lib/seo";
import { toLocalePath } from "@/i18n/routing";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr
    ? "Guides Aurum | Clarté émotionnelle, lecture psychologique et motifs récurrents"
    : "Aurum Guides | Emotional clarity, psychological reflection, and recurring patterns";
  const description = isFr
    ? "Ressources Aurum en format question-réponse: clarté émotionnelle, lecture psychologique, écriture privée et motifs qui reviennent dans le temps."
    : "Aurum resources in clear Q&A format: emotional clarity, psychological reflection, private writing, and recurring patterns over time.";
  const alternates = buildAlternates("/guides", locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "Aurum Diary",
      type: "website",
      locale: openGraphLocale(locale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function GuidesPage() {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const topics = getKnowledgeHubTopics(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isFr ? "Guides Aurum" : "Aurum Guides",
    description: isFr
      ? "Des réponses concrètes pour mieux comprendre ce que tu ressens et ce qui revient."
      : "Practical answers to understand emotions, patterns, and psychological reflection more clearly.",
    url: buildAlternates("/guides", locale).canonical,
    inLanguage: schemaLanguage(locale),
    isPartOf: SITE_URL,
  };

  return (
    <div className="bg-stone-50/50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6">
            {isFr ? "Guides Aurum" : "Aurum Guides"}
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            {isFr
              ? "Réponses claires et concrètes pour mieux comprendre ce que tu ressens et ce qui revient."
              : "Clear and practical answers to better understand what you feel and what keeps repeating."}
          </p>

          <div className="grid gap-4">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={toLocalePath(`/guides/${topic.slug}`, locale)}
                className="rounded-2xl border border-stone-200 bg-white p-6 transition-colors hover:bg-stone-100"
              >
                <h2 className="text-xl font-headline mb-2">{topic.title}</h2>
                <p className="text-muted-foreground">{topic.question}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
