import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Handshake, Mail, ShieldCheck } from "lucide-react";
import { getRequestLocale } from "@/lib/locale-server";
import { absoluteUrl, buildAlternates, openGraphLocale, schemaLanguage } from "@/lib/seo";
import { toLocalePath } from "@/i18n/routing";

const contactEmail = "contact@aurumdiary.com";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Contact Aurum Diary" : "Contact Aurum Diary";
  const description = isFr
    ? "Contacter Aurum Diary pour une question utilisateur, une demande de partenariat, une ressource éditoriale ou un sujet de confidentialité."
    : "Contact Aurum Diary for user questions, partnerships, editorial resources, or privacy topics.";
  const alternates = buildAlternates("/contact", locale);

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

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const pageUrl = absoluteUrl("/contact", locale);
  const privacyHref = toLocalePath("/privacy", locale);
  const guidesHref = toLocalePath("/guides", locale);
  const mailHref = `mailto:${contactEmail}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: isFr ? "Contact Aurum Diary" : "Contact Aurum Diary",
      description: isFr
        ? "Page de contact officielle d'Aurum Diary."
        : "Official contact page for Aurum Diary.",
      url: pageUrl,
      inLanguage: schemaLanguage(locale),
      mainEntity: {
        "@type": "Organization",
        name: "Aurum Diary",
        url: absoluteUrl("/", locale),
        email: contactEmail,
        contactPoint: [
          {
            "@type": "ContactPoint",
            email: contactEmail,
            contactType: "customer support",
            availableLanguage: ["French", "English"],
          },
          {
            "@type": "ContactPoint",
            email: contactEmail,
            contactType: "partnerships",
            availableLanguage: ["French", "English"],
          },
        ],
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isFr ? "Contact" : "Contact",
          item: pageUrl,
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-stone-50/60">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.24em] text-amber-700">
              {isFr ? "Contact" : "Contact"}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-stone-950 md:text-5xl">
              {isFr ? "Parler avec Aurum Diary" : "Talk to Aurum Diary"}
            </h1>
            <p className="mt-6 text-lg leading-8 text-stone-700">
              {isFr
                ? "Pour une question, une demande de partenariat ou une ressource editoriale, vous pouvez nous ecrire directement."
                : "For a question, partnership request, or editorial resource, you can write to us directly."}
            </p>
            <a
              href={mailHref}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {contactEmail}
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white px-6 py-14">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <Mail className="h-6 w-6 text-amber-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-stone-950">
              {isFr ? "Support utilisateur" : "User support"}
            </h2>
            <p className="text-sm leading-6 text-stone-700">
              {isFr
                ? "Pour une question sur votre compte, l'ecriture dans Aurum, l'abonnement ou vos donnees."
                : "For questions about your account, writing in Aurum, subscriptions, or your data."}
            </p>
          </div>
          <div className="space-y-4">
            <Handshake className="h-6 w-6 text-amber-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-stone-950">
              {isFr ? "Partenariats et presse" : "Partnerships and press"}
            </h2>
            <p className="text-sm leading-6 text-stone-700">
              {isFr
                ? "Pour proposer une collaboration, citer une ressource Aurum ou parler d'ecriture personnelle."
                : "For collaborations, editorial citations, or conversations about personal writing."}
            </p>
          </div>
          <div className="space-y-4">
            <ShieldCheck className="h-6 w-6 text-amber-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-stone-950">
              {isFr ? "Confidentialite" : "Privacy"}
            </h2>
            <p className="text-sm leading-6 text-stone-700">
              {isFr
                ? "Pour exercer un droit, poser une question sur la confidentialite ou signaler un probleme."
                : "For privacy rights, privacy questions, or issue reports."}
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-stone-950">
              {isFr ? "Avant d'ecrire" : "Before you write"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-700">
              {isFr
                ? "Ajoutez le sujet dans l'objet du message. Cela aide a repondre plus vite: support, partenariat, presse, confidentialite ou ressource editoriale."
                : "Add the topic to the subject line. It helps us answer faster: support, partnership, press, privacy, or editorial resource."}
            </p>
          </div>
          <div className="space-y-4">
            <Link
              href={guidesHref}
              className="flex items-center justify-between border-b border-stone-200 py-4 text-sm font-medium text-stone-900 hover:text-amber-800"
            >
              {isFr ? "Voir les guides Aurum" : "See Aurum guides"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href={privacyHref}
              className="flex items-center justify-between border-b border-stone-200 py-4 text-sm font-medium text-stone-900 hover:text-amber-800"
            >
              {isFr ? "Lire la politique de confidentialite" : "Read the privacy policy"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
