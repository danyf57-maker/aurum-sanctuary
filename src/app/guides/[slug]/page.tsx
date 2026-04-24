import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getKnowledgeHubTopic,
  getKnowledgeHubTopicBase,
  knowledgeHubTopics,
} from "@/lib/knowledge-hub";
import { Button } from "@/components/ui/button";
import { toLocalePath } from "@/i18n/routing";
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
  const signupHref = toLocalePath("/signup", locale);
  const pricingHref = toLocalePath("/pricing", locale);
  const guidesHref = toLocalePath("/guides", locale);
  const manifestoHref = toLocalePath("/manifeste", locale);

  if (!topic || !topicBase) {
    notFound();
  }

  const pageUrl = absoluteUrl(`/guides/${topic.slug}`, locale);
  const faqItems = [
    {
      question: topic.question,
      answer: topic.shortAnswer,
    },
    {
      question: isFr
        ? "Comment appliquer cette méthode aujourd'hui ?"
        : "How can you apply this method today?",
      answer: topic.practicalSteps?.join(" ") || topic.deepDive[0],
    },
    {
      question: isFr
        ? "Pourquoi utiliser Aurum pour cette réflexion ?"
        : "Why use Aurum for this reflection?",
      answer:
        topic.howAurumHelps?.join(" ") ||
        (isFr
          ? "Aurum donne un espace privé pour écrire et repérer ce qui revient."
          : "Aurum gives you a private space to write and notice what keeps returning."),
    },
  ];
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
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    ...(topic.practicalSteps?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: topic.metaTitle,
            description: topic.metaDescription,
            inLanguage: schemaLanguage(locale),
            step: topic.practicalSteps.map((step, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              text: step,
            })),
          },
        ]
      : []),
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

            {topic.practicalSteps?.length ? (
              <section className="rounded-2xl border border-stone-200 bg-white p-8">
                <h2 className="text-2xl font-headline mb-4">
                  {isFr ? "Méthode simple" : "Simple method"}
                </h2>
                <ul className="space-y-3 text-foreground/90 list-disc pl-6">
                  {topic.practicalSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {topic.example?.length ? (
              <section className="rounded-2xl border border-stone-200 bg-white p-8">
                <h2 className="text-2xl font-headline mb-4">
                  {isFr ? "Exemple concret" : "Concrete example"}
                </h2>
                <div className="space-y-4 text-foreground/90">
                  {topic.example.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            {topic.howAurumHelps?.length ? (
              <section className="rounded-2xl border border-stone-200 bg-white p-8">
                <h2 className="text-2xl font-headline mb-4">
                  {isFr ? "Comment Aurum aide" : "How Aurum helps"}
                </h2>
                <div className="space-y-4 text-foreground/90">
                  {topic.howAurumHelps.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-2xl border border-stone-200 bg-white p-8">
              <h2 className="text-2xl font-headline mb-4">
                {isFr ? "Questions fréquentes" : "Frequently asked questions"}
              </h2>
              <div className="space-y-5 text-foreground/90">
                {faqItems.map((item) => (
                  <div key={item.question}>
                    <h3 className="font-semibold text-stone-900">{item.question}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-700">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
              <h2 className="text-2xl font-headline mb-3">
                {isFr
                  ? "Commencer dans un espace privé"
                  : "Start in a private space"}
              </h2>
              <p className="text-foreground/90 mb-6">
                {isFr
                  ? "Si tu veux aller plus loin que la lecture, Aurum te permet d'écrire sans filtre, de clarifier ce qui revient, et de commencer gratuitement."
                  : "If you want to go beyond reading, Aurum gives you a private place to write freely, clarify what keeps returning, and begin for free."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link href={signupHref}>
                    {isFr ? "Commencer avec 5 entrées gratuites" : "Start with 5 free entries"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={pricingHref}>
                    {isFr ? "Voir les formules" : "See pricing"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href={guidesHref}>
                    {isFr ? "Tous les guides" : "All guides"}
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href={manifestoHref}>
                    {isFr ? "Lire le manifeste" : "Read the manifesto"}
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
