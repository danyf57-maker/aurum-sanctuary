import type { Metadata } from "next";
import Link from "next/link";
import { getRequestLocale } from "@/lib/locale-server";
import { toLocalePath } from "@/i18n/routing";
import { absoluteUrl, buildAlternates, openGraphLocale, schemaLanguage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr
    ? "Auteur Aurum | Alma, voix éditoriale"
    : "About Aurum | Alma, editorial voice";
  const description = isFr
    ? "Profil éditorial d'Alma, voix d'Aurum, et principes de publication autour de la réflexion, de la clarté émotionnelle et de la prudence d'interprétation."
    : "Editorial profile of Alma, Aurum's narrative voice, and the publishing principles behind reflection, emotional clarity, and careful interpretation.";
  const alternates = buildAlternates("/auteur", locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "Aurum Diary",
      type: "profile",
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

export default async function AuteurPage() {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const methodologyHref = toLocalePath("/methodologie", locale);
  const pageUrl = absoluteUrl("/auteur", locale);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: isFr ? "Alma, voix éditoriale d'Aurum" : "Alma, Aurum's editorial voice",
      description: isFr
        ? "Profil éditorial d'Alma et principes de publication autour de la réflexion privée."
        : "Editorial profile of Alma and the publishing principles behind Aurum's private reflection content.",
      url: pageUrl,
      inLanguage: schemaLanguage(locale),
      mainEntity: {
        "@type": "Person",
        name: "Alma",
        description: isFr
          ? "Voix éditoriale d'Aurum"
          : "Editorial voice of Aurum",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isFr ? "Auteur" : "About Alma",
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
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6">
            {isFr ? "Alma, voix éditoriale d'Aurum" : "Alma, Aurum's editorial voice"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {isFr
              ? "Alma est la voix narrative d'Aurum. Ses textes sont édités pour favoriser l'introspection, la clarté émotionnelle et la prudence dans l'interprétation."
              : "Alma is Aurum's narrative voice. Her texts are edited to support introspection, emotional clarity, and careful interpretation."}
          </p>
          <div className="space-y-6 text-foreground/90">
            <p>
              {isFr
                ? "Les contenus publiés suivent une ligne éditoriale centrée sur la vie intérieure du quotidien: émotions, rumination, fatigue, motifs relationnels et besoin de clarté."
                : "Published pieces follow an editorial line centered on everyday inner life: emotions, rumination, fatigue, relationship patterns, and the need for clarity."}
            </p>
            <p>
              {isFr
                ? "Les articles ne constituent pas un avis médical et ne remplacent pas un accompagnement professionnel."
                : "These articles are not medical advice and do not replace professional support."}
            </p>
            <p>
              {isFr ? "Pour la méthodologie IA utilisée dans Aurum, consulte la page dédiée: " : "For the AI methodology used inside Aurum, see the dedicated page: "}
              <Link className="underline" href={methodologyHref}>
                /methodologie
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
