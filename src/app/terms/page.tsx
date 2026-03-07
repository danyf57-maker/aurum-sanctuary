import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRequestLocale } from "@/lib/locale-server";
import type { Metadata } from "next";

const copy = {
  fr: {
    title: "Conditions d'Utilisation",
    updated: "Dernière mise à jour : 29 janvier 2026",
    back: "Retour à aurumdiary.com",
    s1t: "1. Acceptation des Conditions",
    s1b:
      "En accédant à Aurum Sanctuary, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, n'utilisez pas l'application.",
    s2t: "2. Description du Service",
    s2b:
      "Aurum Sanctuary est un service de journalisation orienté bien-être mental. Nous proposons des outils pour écrire, structurer vos réflexions et générer des reflets personnalisés.",
    s3t: "3. Confidentialité et Chiffrement",
    s3a:
      "Vos entrées sont protégées par chiffrement côté client. Nous mettons en place une architecture limitant l'accès interne aux données en clair.",
    s4t: "4. Clause de Non-Responsabilité",
    s4b:
      "Aurum n'est pas un service médical. Les contenus générés ne remplacent pas un professionnel de santé.",
    s5t: "5. Abonnements et Paiements",
    s5b:
      "Certaines fonctionnalités sont accessibles via abonnement. La facturation est gérée par Stripe selon ses conditions.",
    s6t: "6. Modifications",
    s6b:
      "Nous pouvons mettre à jour ces conditions. L'utilisation continue du service vaut acceptation de la version en vigueur.",
  },
  en: {
    title: "Terms of Use",
    updated: "Last updated: January 29, 2026",
    back: "Back to aurumdiary.com",
    s1t: "1. Acceptance of Terms",
    s1b:
      "By using Aurum Sanctuary, you agree to these Terms of Use. If you do not agree, do not use the application.",
    s2t: "2. Service Description",
    s2b:
      "Aurum Sanctuary is a journaling service focused on mental well-being. We provide tools to write, structure reflections, and generate personalized insights.",
    s3t: "3. Privacy and Encryption",
    s3a:
      "Your entries are protected with client-side encryption. We use an architecture that limits internal access to unencrypted data.",
    s4t: "4. Medical Disclaimer",
    s4b:
      "Aurum is not a medical service. Generated content does not replace professional healthcare advice.",
    s5t: "5. Subscriptions and Payments",
    s5b:
      "Some features are subscription-based. Billing is handled by Stripe under Stripe's terms.",
    s6t: "6. Changes",
    s6b:
      "We may update these terms. Continued use of the service means you accept the current version.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Conditions d'Utilisation | Aurum" : "Terms of Use | Aurum";
  const description = isFr
    ? "Conditions d'utilisation d'Aurum Sanctuary: service, confidentialité, paiements et responsabilités."
    : "Aurum Sanctuary terms of use: service scope, privacy, payments, and responsibilities.";
  const canonical = "https://aurumdiary.com/terms";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
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

export default async function TermsPage() {
  const locale = await getRequestLocale();
  const t = copy[locale];

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-serif">{t.title}</CardTitle>
          <p className="text-muted-foreground mt-2">{t.updated}</p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="https://aurumdiary.com">{t.back}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none mt-8">
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.s1t}</h2>
            <p>{t.s1b}</p>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.s2t}</h2>
            <p>{t.s2b}</p>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.s3t}</h2>
            <p>{t.s3a}</p>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.s4t}</h2>
            <p>{t.s4b}</p>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.s5t}</h2>
            <p>{t.s5b}</p>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.s6t}</h2>
            <p>{t.s6b}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
