import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getKnowledgeHubTopic,
  getKnowledgeHubTopicBase,
  knowledgeHubTopics,
} from "@/lib/knowledge-hub";
import { getRequestLocale } from "@/lib/locale-server";
import { absoluteUrl, buildAlternates, openGraphLocale, schemaLanguage } from "@/lib/seo";

type GuidePageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return knowledgeHubTopics.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const topic = getKnowledgeHubTopic(params.slug, locale);

  if (!topic) {
    return {
      title: isFr ? "Guide" : "Guide",
      description: isFr
        ? "Ressource de clarté mentale."
        : "Mental clarity resource.",
    };
  }

  const alternates = buildAlternates(`/guides/${topic.slug}`, locale);

  return {
    title: topic.metaTitle,
    description: topic.metaDescription,
    alternates,
    openGraph: {
      title: topic.metaTitle,
      description: topic.metaDescription,
      url: alternates.canonical,
      siteName: "Aurum Diary",
      type: "article",
      locale: openGraphLocale(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: topic.metaTitle,
      description: topic.metaDescription,
      images: ["/og-image.png"],
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const topic = getKnowledgeHubTopic(params.slug, locale);
  const topicBase = getKnowledgeHubTopicBase(params.slug);

  if (!topic || !topicBase) {
    notFound();
  }

  const pageUrl = absoluteUrl(`/guides/${topic.slug}`, locale);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: topic.title,
      description: topic.metaDescription,
      url: pageUrl,
      inLanguage: schemaLanguage(locale),
      mainEntityOfPage: pageUrl,
      author: {
        "@type": "Organization",
        name: "Aurum Diary",
      },
      publisher: {
        "@type": "Organization",
        name: "Aurum Diary",
        logo: {
          "@type": "ImageObject",
          url: "https://aurumdiary.com/og-image.png",
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isFr ? "Guides Aurum" : "Aurum Guides",
          item: absoluteUrl("/guides", locale),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: topic.title,
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <div className="bg-stone-50/50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700/70 mb-4">
            {isFr ? "Guides Aurum" : "Aurum Guides"}
          </p>
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-8">
            {topic.title}
          </h1>

          <div className="space-y-8">
            <section className="rounded-2xl border border-stone-200 bg-white p-8">
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "Question" : "Question"}
              </h2>
              <p className="text-lg text-foreground/90">{topic.question}</p>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-8">
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "Réponse courte" : "Short answer"}
              </h2>
              <p className="text-lg text-foreground/90">{topic.shortAnswer}</p>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-8">
              <h2 className="text-2xl font-headline mb-4">
                {isFr ? "Approfondissement" : "Deep dive"}
              </h2>
              <div className="space-y-4 text-foreground/90">
                {topic.deepDive.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
