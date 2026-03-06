import type { Metadata } from "next";
import Link from "next/link";
import { getKnowledgeHubTopics } from "@/lib/knowledge-hub";
import { getRequestLocale } from "@/lib/locale-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr
    ? "Guides Aurum | Clarté mentale, introspection et journal guidé"
    : "Aurum Guides | Mental clarity, introspection, and guided journaling";
  const description = isFr
    ? "Ressources Aurum en format question-réponse: charge mentale, introspection, confidentialité mentale et routine de 5 minutes."
    : "Aurum resources in clear Q&A format: mental load, introspection, mental privacy, and a 5-minute routine.";
  const canonical = "https://aurumdiary.com/guides";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Aurum",
      type: "website",
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

export default async function GuidesPage() {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const topics = getKnowledgeHubTopics(locale);

  return (
    <div className="bg-stone-50/50 min-h-screen">
      <section className="py-24 md:py-32">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6">
            {isFr ? "Guides Aurum" : "Aurum Guides"}
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            {isFr
              ? "Réponses claires et concrètes pour mieux comprendre ce que tu ressens."
              : "Clear and practical answers to better understand what you feel."}
          </p>

          <div className="grid gap-4">
            {topics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/guides/${topic.slug}`}
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
