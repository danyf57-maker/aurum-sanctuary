import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Etudes Scientifiques | Aurum",
  description:
    "Etudes scientifiques citees par Aurum sur l'ecriture expressive, le bien-etre psychologique et la clarte mentale.",
  alternates: {
    canonical: "https://aurumdiary.com/etudes-scientifiques",
  },
};

const studies = [
  {
    id: "etude-1",
    index: "1",
    title:
      "Confronting a traumatic event: Toward an understanding of inhibition and disease",
    authors: "Pennebaker, J. W., & Beall, S. K.",
    year: "1986",
    journal: "Journal of Abnormal Psychology, 95, 274-281",
    note:
      "Etude fondatrice sur l'ecriture expressive et ses effets sur certains indicateurs de sante.",
  },
  {
    id: "etude-2",
    index: "2",
    title: "Expressive writing and coping with job loss",
    authors: "Spera, S. P., Buhrfeind, E. D., & Pennebaker, J. W.",
    year: "1994",
    journal: "Academy of Management Journal, 37, 722-733",
    note:
      "Etude sur l'ecriture emotionnelle en contexte de perte d'emploi et capacite de rebond.",
  },
  {
    id: "etude-3",
    index: "3",
    title:
      "Efficacy of journaling in the management of mental illness: a systematic review and meta-analysis",
    authors: "Sohal, M., Singh, P., Dhillon, B. S., & Gill, H. S.",
    year: "2022",
    journal: "Family Medicine and Community Health",
    note:
      "Revue systematique et meta-analyse sur l'impact du journaling sur la sante mentale.",
  },
  {
    id: "etude-4",
    index: "4",
    title:
      "Positive self talk journaling intervention to improve psychological well-being among child and adolescents in juvenile",
    authors: "Yosep, I., et al.",
    year: "2025",
    journal: "Child and Adolescent Psychiatry and Mental Health",
    note:
      "Intervention de journaling orientee self-talk positif et bien-etre psychologique.",
  },
];

export default function EtudesScientifiquesPage() {
  return (
    <div className="min-h-screen bg-stone-50/50">
      <section className="py-20 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-headline md:text-4xl">
            Etudes scientifiques
          </h1>
          <p className="mb-8 text-stone-600">
            Cette page regroupe les etudes citees sur Aurum au sujet de
            l'ecriture expressive, de la clarte mentale et du bien-etre
            psychologique.
          </p>

          <div className="space-y-4">
            {studies.map((study) => (
              <article
                key={study.id}
                id={study.id}
                className="rounded-2xl border border-stone-200 bg-white p-6"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-stone-500 font-semibold mb-2">
                  Etude {study.index}
                </p>
                <h2 className="text-xl font-headline text-stone-900 mb-2">
                  {study.title}
                </h2>
                <p className="text-sm text-stone-700 mb-1">
                  {study.authors} ({study.year})
                </p>
                <p className="text-sm text-stone-500 mb-3">{study.journal}</p>
                <p className="text-sm text-stone-600 font-light">{study.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
