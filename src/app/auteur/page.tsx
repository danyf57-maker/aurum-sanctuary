import type { Metadata } from "next";
import Link from "next/link";
import { getRequestLocale } from "@/lib/locale-server";
import { toLocalePath } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Auteur: Alma",
  description:
    "Profil éditorial d'Alma, voix du Journal d'Aurum, et principes de publication des contenus.",
  alternates: {
    canonical: "https://aurumdiary.com/auteur",
  },
};

export default async function AuteurPage() {
  const locale = await getRequestLocale();
  const methodologyHref = toLocalePath("/methodologie", locale);
  return (
    <div className="bg-stone-50/50 min-h-screen">
      <section className="py-24 md:py-32">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6">
            Alma, voix éditoriale d&apos;Aurum
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Alma est la voix narrative du Journal d&apos;Aurum. Ses textes sont
            édités pour favoriser l&apos;introspection, la clarté émotionnelle et la
            prudence dans l&apos;interprétation.
          </p>
          <div className="space-y-6 text-foreground/90">
            <p>
              Les contenus publiés suivent une ligne éditoriale centrée sur la
              santé mentale du quotidien: charge mentale, émotions, rumination,
              fatigue et régulation.
            </p>
            <p>
              Les articles ne constituent pas un avis médical et ne remplacent
              pas un accompagnement professionnel.
            </p>
            <p>
              Pour la méthodologie IA utilisée dans Aurum, consulte la page
              dédiée: <Link className="underline" href={methodologyHref}>/methodologie</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
