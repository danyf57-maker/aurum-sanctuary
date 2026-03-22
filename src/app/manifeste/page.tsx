import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/locale-server";
import { absoluteUrl, buildAlternates, openGraphLocale, schemaLanguage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr
    ? "Manifeste Aurum | Confidentialité, lecture psychologique et clarté émotionnelle"
    : "Aurum Manifesto | Privacy, psychological reflection, and emotional clarity";
  const description = isFr
    ? "Le manifeste d'Aurum: un espace privé, sans publicité, centré sur la lecture psychologique, la clarté émotionnelle et la confidentialité."
    : "The Aurum manifesto: a private, ad-free reflection space built around psychological reflection, emotional clarity, and trust.";
  const alternates = buildAlternates("/manifeste", locale);

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

export default async function ManifestePage() {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const pageUrl = absoluteUrl("/manifeste", locale);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: isFr ? "Notre Manifeste de Confiance" : "Our Trust Manifesto",
      description: isFr
        ? "Le manifeste d'Aurum autour de la confidentialité, de la lecture psychologique et de la clarté émotionnelle."
        : "Aurum's manifesto around privacy, psychological reflection, and emotional clarity.",
      url: pageUrl,
      inLanguage: schemaLanguage(locale),
      isPartOf: "https://aurumdiary.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isFr ? "Notre Manifeste de Confiance" : "Our Trust Manifesto",
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
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6">
            {isFr ? "Notre Manifeste de Confiance" : "Our Trust Manifesto"}
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            {isFr
              ? "Nous ne vendons pas de publicité. Nous ne vendons pas tes données. Nous construisons un espace privé pour écrire, comprendre ce que tu ressens et faire émerger plus de clarté."
              : "We do not sell advertising. We do not sell your data. We are building a private space to write, understand what you feel, and uncover more clarity over time."}
          </p>

          <div className="space-y-8 text-foreground/90">
            <section>
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "1. Ton intimité t'appartient" : "1. Your inner life belongs to you"}
              </h2>
              <p>
                {isFr
                  ? "Ton journal n'est pas un produit. Tes écrits et tes reflets ne sont pas conçus pour l'exposition publique ni pour la performance sociale."
                  : "Your journal is not a product. Your writing and reflections are not designed for public exposure or social performance."}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "2. La clarté avant le bruit" : "2. Clarity before noise"}
              </h2>
              <p>
                {isFr
                  ? "Nous cherchons une précision calme: t'aider à passer de la confusion à une compréhension plus nette, sans brusquer ton rythme."
                  : "We aim for calm precision: helping you move from confusion to clearer understanding without forcing your pace."}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "3. Une IA au service de ta réflexion" : "3. AI in service of reflection"}
              </h2>
              <p>
                {isFr
                  ? "L'IA d'Aurum guide la réflexion, reformule avec douceur, et aide à faire émerger des motifs récurrents. Elle ne remplace pas un avis médical ni un suivi thérapeutique."
                  : "Aurum's AI guides reflection, rephrases gently, and helps recurring patterns become easier to see. It does not replace medical advice or therapeutic care."}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "4. Contrôle et transparence" : "4. Control and transparency"}
              </h2>
              <p>
                {isFr
                  ? "Tu gardes la main sur tes données, ton compte et tes contenus. Nous documentons notre méthodologie et nos limites."
                  : "You stay in control of your data, your account, and your content. We document our methodology and our limits."}
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
