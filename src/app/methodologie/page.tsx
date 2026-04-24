import type { Metadata } from "next";
import { getRequestLocale } from "@/lib/locale-server";
import { absoluteUrl, buildAlternates, openGraphLocale, schemaLanguage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr
    ? "Méthodologie Aurum | Limites, lectures et confidentialité"
    : "Aurum Methodology | Limits, readings, and privacy";
  const description = isFr
    ? "Méthodologie d'Aurum: comment les lectures guidées sont produites, leurs limites et les bonnes pratiques d'interprétation."
    : "Aurum's methodology: how guided readings are produced, where their limits are, and how to interpret them responsibly.";
  const alternates = buildAlternates("/methodologie", locale);

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

export default async function MethodologiePage() {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const pageUrl = absoluteUrl("/methodologie", locale);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: isFr ? "Méthodologie d'Aurum" : "Aurum Methodology",
      description: isFr
        ? "Comment Aurum produit ses analyses, ce qu'elles peuvent apporter, et ce qu'elles ne remplacent pas."
        : "How Aurum produces its analyses, what they can support, and what they do not replace.",
      url: pageUrl,
      inLanguage: schemaLanguage(locale),
      author: {
        "@type": "Organization",
        name: "Aurum Diary",
      },
      publisher: {
        "@type": "Organization",
        name: "Aurum Diary",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isFr ? "Méthodologie" : "Methodology",
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
            {isFr ? "Méthodologie d'Aurum" : "Aurum's methodology"}
          </h1>
          <p className="text-lg text-muted-foreground mb-10">
            {isFr
                  ? "Cette page documente comment Aurum génère ses analyses, ce que ces analyses peuvent apporter, et ce qu'elles ne remplacent pas."
                  : "This page explains how Aurum generates its readings, what they can support, and what they do not replace."}
          </p>

          <div className="space-y-8 text-foreground/90">
            <section>
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "1. Entrées analysées" : "1. Inputs analyzed"}
              </h2>
              <p>
                {isFr
                  ? "Aurum traite le texte que tu écris pour identifier des tendances émotionnelles, des thèmes récurrents et des pistes de réflexion."
                  : "Aurum processes the text you write to identify emotional tendencies, recurring themes, and reflection prompts."}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "2. Sorties produites" : "2. Outputs produced"}
              </h2>
              <p>
                {isFr
                  ? "Les sorties sont des synthèses, des suggestions d'introspection et des observations linguistiques. Elles sont destinées à la clarté personnelle, pas au diagnostic."
                  : "Outputs include summaries, reflection suggestions, and language-based observations. They are designed for personal clarity, not diagnosis."}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "3. Limites connues" : "3. Known limits"}
              </h2>
              <p>
                {isFr
                  ? "Toute lecture automatique peut produire des approximations. Les résultats doivent être interprétés comme un support de réflexion, et non comme un avis médical ou thérapeutique."
                  : "Any automated reading can produce approximations. Results should be interpreted as reflection support, not as medical or therapeutic advice."}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-headline mb-3">
                {isFr ? "4. Confidentialité" : "4. Privacy"}
              </h2>
              <p>
                {isFr
                  ? "La confidentialité est un principe central du produit. Pour les détails techniques et juridiques, consulte la politique de confidentialité et les conditions d'utilisation."
                  : "Privacy is a core principle of the product. For technical and legal details, see the privacy policy and terms of use."}
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
