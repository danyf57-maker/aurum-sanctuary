import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getKnowledgeHubTopic,
  getKnowledgeHubTopicBase,
  knowledgeHubTopics,
} from "@/lib/knowledge-hub";
import { getRequestLocale } from "@/lib/locale-server";

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

  const canonical = `https://aurumdiary.com/guides/${topic.slug}`;

  return {
    title: topic.metaTitle,
    description: topic.metaDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: topic.metaTitle,
      description: topic.metaDescription,
      url: canonical,
      siteName: "Aurum",
      type: "article",
      locale: isFr ? "fr_FR" : "en_US",
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

  return (
    <div className="bg-stone-50/50 min-h-screen">
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
