import type { Metadata } from "next";
import Link from "next/link";
import { toLocalePath } from "@/i18n/routing";
import { getRequestLocale } from "@/lib/locale-server";
import { absoluteUrl, buildAlternates, openGraphLocale, schemaLanguage } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const alternates = buildAlternates("/etudes-scientifiques", locale);
  const title = isFr
    ? "Études scientifiques | Aurum"
    : "Scientific References | Aurum";
  const description = isFr
    ? "Références scientifiques citées par Aurum sur l'écriture expressive, la réflexion privée et la prudence d'interprétation."
    : "Scientific references cited by Aurum about expressive writing, private reflection, and careful interpretation.";

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

const studies = [
  {
    id: "etude-1",
    index: "1",
    title:
      "Confronting a traumatic event: Toward an understanding of inhibition and disease",
    authors: "Pennebaker, J. W., & Beall, S. K.",
    year: "1986",
    journal: "Journal of Abnormal Psychology, 95, 274-281",
    doi: "10.1037/0021-843X.95.3.274",
    href: "https://doi.org/10.1037/0021-843X.95.3.274",
    noteFr:
      "Étude fondatrice sur l'écriture expressive. Elle explore comment écrire sur une expérience difficile peut aider certaines personnes à mettre en mots ce qui était gardé à l'intérieur.",
    noteEn:
      "Foundational study on expressive writing. It explores how writing about a difficult experience may help some people put into words what had been kept inside.",
    limitFr:
      "À lire avec prudence : cette étude ne prouve pas qu'un journal soigne, traite ou remplace un professionnel de santé.",
    limitEn:
      "Read with caution: this study does not prove that a journal heals, treats, or replaces professional care.",
  },
  {
    id: "etude-2",
    index: "2",
    title: "Expressive writing and coping with job loss",
    authors: "Spera, S. P., Buhrfeind, E. D., & Pennebaker, J. W.",
    year: "1994",
    journal: "Academy of Management Journal, 37, 722-733",
    doi: "10.2307/256708",
    href: "https://doi.org/10.2307/256708",
    noteFr:
      "Étude sur l'écriture expressive dans un contexte de perte d'emploi. Elle suggère que formuler une expérience chargée peut soutenir la manière dont certaines personnes la traversent.",
    noteEn:
      "Study on expressive writing in the context of job loss. It suggests that putting a charged experience into words may support how some people move through it.",
    limitFr:
      "Aurum ne promet pas de résultat professionnel, médical ou émotionnel à partir de cette référence.",
    limitEn:
      "Aurum does not promise professional, medical, or emotional outcomes from this reference.",
  },
  {
    id: "etude-3",
    index: "3",
    title:
      "Efficacy of journaling in the management of mental illness: a systematic review and meta-analysis",
    authors: "Sohal, M., Singh, P., Dhillon, B. S., & Gill, H. S.",
    year: "2022",
    journal: "Family Medicine and Community Health",
    doi: "10.1136/fmch-2021-001154",
    href: "https://doi.org/10.1136/fmch-2021-001154",
    noteFr:
      "Revue systématique et méta-analyse sur plusieurs formes de journaling. Les résultats sont intéressants, mais les effets restent variables selon les études et les contextes.",
    noteEn:
      "Systematic review and meta-analysis across several journaling formats. The findings are interesting, but effects vary by study and context.",
    limitFr:
      "Cette référence ne transforme pas Aurum en outil clinique, thérapeutique ou diagnostique.",
    limitEn:
      "This reference does not make Aurum a clinical, therapeutic, or diagnostic tool.",
  },
  {
    id: "etude-4",
    index: "4",
    title:
      "Positive self talk journaling intervention to improve psychological well-being among child and adolescents in juvenile",
    authors: "Yosep, I., et al.",
    year: "2025",
    journal: "Child and Adolescent Psychiatry and Mental Health",
    doi: "10.1186/s13034-025-00998-y",
    href: "https://doi.org/10.1186/s13034-025-00998-y",
    noteFr:
      "Étude récente sur une intervention structurée de journaling et de self-talk positif auprès d'un public spécifique.",
    noteEn:
      "Recent study on a structured journaling and positive self-talk intervention with a specific population.",
    limitFr:
      "Ses conclusions ne doivent pas être généralisées à tous les utilisateurs ni présentées comme une promesse Aurum.",
    limitEn:
      "Its findings should not be generalized to all users or presented as an Aurum promise.",
  },
];

export default async function EtudesScientifiquesPage() {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const pageUrl = absoluteUrl("/etudes-scientifiques", locale);
  const writeHref = toLocalePath("/sanctuary/write", locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isFr ? "Études scientifiques citées par Aurum" : "Scientific references cited by Aurum",
    description: isFr
      ? "Références de contexte sur l'écriture expressive et la réflexion privée."
      : "Contextual references on expressive writing and private reflection.",
    url: pageUrl,
    inLanguage: schemaLanguage(locale),
  };

  return (
    <div className="min-h-screen bg-stone-50/50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-headline md:text-4xl text-stone-950">
            {isFr ? "Études scientifiques" : "Scientific references"}
          </h1>
          <p className="mb-6 text-stone-600">
            {isFr
              ? "Cette page regroupe les références citées par Aurum autour de l'écriture expressive, de la réflexion privée et de la clarté personnelle."
              : "This page gathers the references cited by Aurum around expressive writing, private reflection, and personal clarity."}
          </p>
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-stone-700">
            <p className="font-semibold text-stone-900">
              {isFr ? "À lire avant les études" : "Before reading the studies"}
            </p>
            <p className="mt-2">
              {isFr
                ? "Ces références donnent un contexte scientifique général. Elles ne sont pas des promesses de résultat. Aurum n'est pas un service médical, un outil de diagnostic, une thérapie, ni un remplacement d'un professionnel de santé."
                : "These references provide general scientific context. They are not outcome promises. Aurum is not a medical service, a diagnostic tool, therapy, or a replacement for professional care."}
            </p>
          </div>
          <div className="mb-10 rounded-2xl border border-[#D4AF37]/30 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#806116]">
              {isFr ? "Passer de la recherche à l'écriture" : "From research to writing"}
            </p>
            <h2 className="mt-3 text-2xl font-headline text-stone-950">
              {isFr
                ? "Écris ce qui revient, sans en faire une conclusion médicale."
                : "Write what keeps returning, without turning it into a medical conclusion."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-stone-600">
              {isFr
                ? "Aurum t'aide à poser une pensée dans une page privée et à recevoir un reflet guidé, prudent, centré sur tes mots."
                : "Aurum helps you place a thought on a private page and receive a careful guided reflection centered on your own words."}
            </p>
            <Link
              href={writeHref}
              className="mt-5 inline-flex rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-[#D4AF37]/90"
            >
              {isFr ? "Ouvrir une page privée" : "Open a private page"}
            </Link>
          </div>

          <div className="space-y-4">
            {studies.map((study) => (
              <article
                key={study.id}
                id={study.id}
                className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-stone-500 font-semibold mb-2">
                  {isFr ? "Étude" : "Study"} {study.index}
                </p>
                <h2 className="text-xl font-headline text-stone-900 mb-2">
                  {study.title}
                </h2>
                <p className="text-sm text-stone-700 mb-1">
                  {study.authors} ({study.year})
                </p>
                <p className="text-sm text-stone-500 mb-3">{study.journal}</p>
                <p className="text-sm text-stone-700">
                  {isFr ? study.noteFr : study.noteEn}
                </p>
                <p className="mt-3 text-sm text-stone-600">
                  {isFr ? study.limitFr : study.limitEn}
                </p>
                <a
                  href={study.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-semibold text-[#806116] underline-offset-4 hover:underline"
                >
                  DOI: {study.doi}
                </a>
              </article>
            ))}
          </div>
          <div className="mt-10 rounded-2xl bg-stone-900 p-6 text-white">
            <h2 className="text-2xl font-headline">
              {isFr
                ? "La recherche donne un cadre. Ta page commence avec tes mots."
                : "Research gives context. Your page starts with your words."}
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-stone-300">
              {isFr
                ? "Commence par une phrase simple : le message que tu relis, la scène que tu rejoues, ou ce qui reste là."
                : "Start with one simple sentence: the message you reread, the scene you replay, or what is still there."}
            </p>
            <Link
              href={writeHref}
              className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-stone-100"
            >
              {isFr ? "Commencer à écrire" : "Start writing"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
