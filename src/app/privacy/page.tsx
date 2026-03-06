import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRequestLocale } from "@/lib/locale-server";
import type { Metadata } from "next";

const copy = {
  fr: {
    title: "Politique de Confidentialité",
    updated: "Dernière mise à jour : 29 janvier 2026",
    back: "Retour à aurumdiary.com",
    i1t: "1. Introduction",
    i1b:
      "Cette politique décrit comment Aurum collecte, utilise et protège vos données dans une logique privacy-by-design.",
    i2t: "2. Données collectées",
    i2a: "Données de compte: email et informations de profil.",
    i2b: "Entrées de journal: stockées de façon sécurisée.",
    i2c: "Métadonnées d'usage: fréquence, durée, navigation produit.",
    i3t: "3. Utilisation des données",
    i3b:
      "Les données servent à fournir le service, sécuriser votre compte, et améliorer la qualité des fonctionnalités.",
    i4t: "4. Sécurité",
    i4b:
      "Nous appliquons chiffrement en transit, contrôles d'accès stricts et journalisation de sécurité.",
    i5t: "5. Vos droits",
    i5b:
      "Vous pouvez accéder, corriger, exporter et supprimer vos données conformément au RGPD.",
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: January 29, 2026",
    back: "Back to aurumdiary.com",
    i1t: "1. Introduction",
    i1b:
      "This policy explains how Aurum collects, uses, and protects your data under a privacy-by-design model.",
    i2t: "2. Data We Collect",
    i2a: "Account data: email and profile information.",
    i2b: "Journal entries: stored securely.",
    i2c: "Usage metadata: frequency, session duration, product navigation.",
    i3t: "3. How We Use Data",
    i3b:
      "Data is used to provide the service, secure your account, and improve feature quality.",
    i4t: "4. Security",
    i4b:
      "We apply encryption in transit, strict access controls, and security logging.",
    i5t: "5. Your Rights",
    i5b:
      "You can access, correct, export, and delete your data in line with GDPR requirements.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Politique de Confidentialité | Aurum" : "Privacy Policy | Aurum";
  const description = isFr
    ? "Comment Aurum collecte, protège et traite vos données selon une approche privacy-by-design."
    : "How Aurum collects, protects, and processes your data with a privacy-by-design approach.";
  const canonical = "https://aurumdiary.com/privacy";

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

export default async function PrivacyPage() {
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
            <h2 className="text-2xl font-serif mt-6">{t.i1t}</h2>
            <p>{t.i1b}</p>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.i2t}</h2>
            <ul>
              <li>{t.i2a}</li>
              <li>{t.i2b}</li>
              <li>{t.i2c}</li>
            </ul>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.i3t}</h2>
            <p>{t.i3b}</p>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.i4t}</h2>
            <p>{t.i4b}</p>
          </section>
          <section>
            <h2 className="text-2xl font-serif mt-6">{t.i5t}</h2>
            <p>{t.i5b}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
