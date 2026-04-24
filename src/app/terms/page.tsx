import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequestLocale } from "@/lib/locale-server";
import { buildAlternates } from "@/lib/seo";

type Locale = "fr" | "en";

type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const copy: Record<
  Locale,
  {
    title: string;
    updated: string;
    back: string;
    intro: string;
    sections: LegalSection[];
  }
> = {
  fr: {
    title: "Conditions d'Utilisation",
    updated: "Dernière mise à jour : 19 mars 2026",
    back: "Retour à Aurum Diary",
    intro:
      "Les présentes Conditions d'Utilisation régissent l'accès à Aurum Diary, disponible sur aurumdiary.com. Elles encadrent l'utilisation du service, les reflets guidés, les abonnements et les responsabilités de chaque partie.",
    sections: [
      {
        title: "1. Acceptation",
        paragraphs: [
          "En utilisant Aurum Diary, vous acceptez les présentes Conditions d'Utilisation ainsi que la Politique de Confidentialité d'Aurum. Si vous n'acceptez pas ces documents, n'utilisez pas le service.",
          "Ces conditions s'appliquent à votre utilisation du site, de l'application web, des parcours d'inscription, des fonctionnalités d'analyse et des services liés à votre compte.",
        ],
      },
      {
        title: "2. Description du service",
        paragraphs: [
          "Aurum Diary est un service de réflexion privée guidée. Il aide les utilisateurs à écrire, relire leurs pages, recevoir des reflets guidés, et faire émerger des thèmes ou motifs récurrents dans le temps.",
          "Aurum Diary n'est pas un service médical, psychologique, psychiatrique, d'urgence ou de thérapie. Le service ne remplace pas un professionnel de santé, un diagnostic, ni une prise en charge clinique.",
        ],
        bullets: [
          "N'utilisez pas Aurum comme unique base pour une décision médicale, juridique ou financière.",
          "En cas d'urgence, de danger immédiat ou de crise, contactez les services d'urgence locaux ou un professionnel qualifié.",
        ],
      },
      {
        title: "3. Éligibilité et sécurité du compte",
        paragraphs: [
          "Vous ne pouvez utiliser Aurum Diary que si vous êtes légalement en mesure de conclure un accord contraignant dans votre juridiction. Le service n'est pas destiné aux enfants de moins de 16 ans.",
          "Vous êtes responsable de l'exactitude des informations de compte que vous fournissez, de la confidentialité de vos identifiants, et de toute activité réalisée depuis votre compte.",
        ],
      },
      {
        title: "4. Vos écrits, votre propriété",
        paragraphs: [
          "Vous conservez la propriété de vos contenus: pages, textes, notes, titres, tags, demandes et autres éléments que vous saisissez dans Aurum Diary.",
          "Afin d'exploiter le service, vous accordez à Aurum une licence limitée, non exclusive, révocable dans la mesure permise par la loi, pour héberger, stocker, chiffrer, transmettre et traiter ce contenu uniquement aux fins de fournir, sécuriser, maintenir et dépanner le service conformément à notre Politique de Confidentialité.",
          "Nous ne revendiquons pas la propriété de vos écrits et nous ne vendons pas votre contenu de journal à des tiers.",
        ],
      },
      {
        title: "5. Reflets guidés et contenus générés",
        paragraphs: [
          "Lorsque vous demandez un reflet, une lecture, un digest ou une autre fonctionnalité de réflexion, le texte que vous choisissez de soumettre peut être traité par Aurum et ses prestataires techniques pour produire la sortie demandée.",
          "Les contenus générés peuvent être incomplets, inexacts, maladroits ou inadaptés à votre situation. Ils sont fournis à titre informationnel et réflexif uniquement.",
        ],
        bullets: [
          "Vous restez responsable de la manière dont vous interprétez et utilisez les contenus générés.",
          "Aurum peut modifier, suspendre ou supprimer des fonctionnalités de réflexion à tout moment.",
        ],
      },
      {
        title: "6. Confidentialité et sécurité",
        paragraphs: [
          "La manière dont nous collectons, utilisons et protégeons vos données est décrite dans notre Politique de Confidentialité.",
          "Nous mettons en place des mesures de sécurité raisonnables et adaptées, notamment le chiffrement en transit, des contrôles d'accès et, pour certains flux de stockage du journal, un chiffrement côté client. Aucune mesure de sécurité n'est parfaite ni garantie à 100 %.",
        ],
      },
      {
        title: "7. Abonnements, essais gratuits et paiements",
        paragraphs: [
          "Certaines fonctionnalités d'Aurum Diary sont proposées via un abonnement payant. Les paiements et le portail de facturation sont gérés par Stripe.",
          "Sauf indication contraire au moment du paiement, les abonnements se renouvellent automatiquement jusqu'à annulation. Les essais gratuits, lorsqu'ils sont proposés, se convertissent en abonnement payant si vous n'annulez pas avant la fin de la période d'essai.",
        ],
        bullets: [
          "Les prix, devises, taxes applicables et conditions de facturation sont présentés au moment du checkout.",
          "Vous pouvez gérer ou annuler votre abonnement via Stripe ou depuis les paramètres du compte lorsqu'ils sont disponibles.",
        ],
      },
      {
        title: "8. Utilisations interdites",
        paragraphs: [
          "Vous vous engagez à ne pas utiliser Aurum Diary pour enfreindre la loi, porter atteinte à des tiers, compromettre la sécurité du service, contourner les limitations d'usage, ni tester le système d'une manière abusive ou non autorisée.",
        ],
        bullets: [
          "Pas d'accès non autorisé, d'automatisation abusive ou de reverse engineering illicite.",
          "Pas d'envoi de contenu illégal, frauduleux, harcelant ou destiné à nuire.",
        ],
      },
      {
        title: "9. Suspension et résiliation",
        paragraphs: [
          "Nous pouvons suspendre ou résilier un compte si cela est nécessaire pour protéger le service, faire respecter ces conditions, répondre à une obligation légale ou traiter un usage abusif.",
          "Vous pouvez arrêter d'utiliser Aurum Diary à tout moment. Selon les cas, certaines données peuvent être conservées pendant une durée limitée pour des raisons légales, de sécurité, de facturation, de sauvegarde ou de prévention de la fraude, comme décrit dans la Politique de Confidentialité.",
        ],
      },
      {
        title: "10. Exclusion de garanties et limitation de responsabilité",
        paragraphs: [
          "Dans la mesure permise par la loi, Aurum Diary est fourni « en l'état » et « selon disponibilité », sans garantie expresse ou implicite, y compris sur la disponibilité continue du service, l'absence d'erreurs, la qualité marchande, l'adéquation à un besoin particulier ou la conformité des contenus générés à vos attentes.",
          "Dans la mesure permise par la loi, Aurum ne saurait être responsable des dommages indirects, spéciaux, accessoires, punitifs ou consécutifs, ni d'une perte de données, d'un manque à gagner, d'une interruption d'activité, d'une détresse émotionnelle, ou de décisions prises sur la base de reflets ou lectures générés.",
          "Rien dans ces conditions n'exclut une responsabilité qui ne peut pas être exclue en vertu du droit applicable.",
        ],
      },
      {
        title: "11. Droit applicable et litiges",
        paragraphs: [
          "Sauf disposition impérative contraire du droit de la consommation, les présentes conditions sont régies par le droit français, à l'exclusion des règles de conflit de lois.",
          "Avant toute réclamation formelle, nous vous invitons à nous contacter à contact@aurumdiary.com pour tenter une résolution amiable. Sous réserve des droits impératifs du consommateur, les tribunaux de Paris sont compétents pour connaître des litiges liés au service.",
        ],
      },
      {
        title: "12. Modifications et contact",
        paragraphs: [
          "Nous pouvons mettre à jour ces conditions pour refléter l'évolution du produit, de la loi ou de nos prestataires. La version la plus récente sera publiée sur cette page avec une date de mise à jour.",
          "Pour toute question relative à ces conditions, écrivez-nous à contact@aurumdiary.com.",
        ],
      },
    ],
  },
  en: {
    title: "Terms of Use",
    updated: "Last updated: March 19, 2026",
    back: "Back to Aurum Diary",
    intro:
      "These Terms of Use govern access to Aurum Diary, available at aurumdiary.com. They describe how the service may be used, how guided reflections are delivered, how subscriptions work, and the responsibilities of each party.",
    sections: [
      {
        title: "1. Acceptance",
        paragraphs: [
          "By using Aurum Diary, you agree to these Terms of Use and to the Aurum Privacy Policy. If you do not agree, do not use the service.",
          "These terms apply to your use of the website, web app, sign-up flows, guided reflection features, and services connected to your account.",
        ],
      },
      {
        title: "2. Service description",
        paragraphs: [
          "Aurum Diary is a private guided reflection service. It helps users write, revisit pages, receive guided reflections, and surface recurring themes or patterns over time.",
          "Aurum Diary is not a medical, mental health treatment, therapy, psychiatry, crisis, or emergency service. It does not replace a licensed professional, diagnosis, or clinical care.",
        ],
        bullets: [
          "Do not rely on Aurum as the sole basis for medical, legal, or financial decisions.",
          "If you are in immediate danger or crisis, contact local emergency services or a qualified human professional.",
        ],
      },
      {
        title: "3. Eligibility and account security",
        paragraphs: [
          "You may use Aurum Diary only if you are legally capable of entering into a binding agreement in your jurisdiction. The service is not intended for children under 16.",
          "You are responsible for providing accurate account information, keeping your credentials confidential, and all activity occurring under your account.",
        ],
      },
      {
        title: "4. Your content and ownership",
        paragraphs: [
          "You retain ownership of the content you create or submit in Aurum Diary, including entries, notes, prompts, titles, tags, and related materials.",
          "To operate the service, you grant Aurum a limited, non-exclusive license to host, store, encrypt, transmit, and process that content only to provide, secure, maintain, and troubleshoot the service in line with our Privacy Policy.",
          "We do not claim ownership over your journal content and we do not sell your journal content to third parties.",
        ],
      },
      {
        title: "5. Guided features and generated output",
        paragraphs: [
          "When you request reflections, readings, digests, or other reflection features, the text you choose to submit may be processed by Aurum and its technical service providers to generate the requested output.",
          "Generated output may be incomplete, inaccurate, awkward, or unsuitable for your situation. It is provided for informational and reflective purposes only.",
        ],
        bullets: [
          "You remain responsible for how you interpret and use generated output.",
          "Aurum may change, suspend, or remove reflection features at any time.",
        ],
      },
      {
        title: "6. Privacy and security",
        paragraphs: [
          "How we collect, use, and protect data is described in our Privacy Policy.",
          "We use reasonable security measures, including encryption in transit, access controls, and client-side encryption for supported journal-storage flows. No security measure is perfect or guaranteed.",
        ],
      },
      {
        title: "7. Subscriptions, trials, and billing",
        paragraphs: [
          "Some Aurum Diary features require a paid subscription. Payments and billing portal services are handled by Stripe.",
          "Unless stated otherwise at checkout, subscriptions renew automatically until canceled. Free trials, when offered, convert into paid subscriptions unless canceled before the trial ends.",
        ],
        bullets: [
          "Pricing, currency, applicable taxes, and billing terms are shown at checkout.",
          "You can manage or cancel your subscription through Stripe or from account settings where available.",
        ],
      },
      {
        title: "8. Prohibited use",
        paragraphs: [
          "You agree not to use Aurum Diary to violate the law, harm others, compromise service security, bypass usage limits, or test the system in an abusive or unauthorized manner.",
        ],
        bullets: [
          "No unauthorized access, abusive automation, or unlawful reverse engineering.",
          "No illegal, fraudulent, harassing, or harmful content or conduct.",
        ],
      },
      {
        title: "9. Suspension and termination",
        paragraphs: [
          "We may suspend or terminate access when necessary to protect the service, enforce these terms, respond to legal obligations, or address abusive use.",
          "You may stop using Aurum Diary at any time. In some cases, data may be retained for limited periods for legal, security, billing, backup, or fraud-prevention reasons, as described in the Privacy Policy.",
        ],
      },
      {
        title: "10. Disclaimer of warranties and limitation of liability",
        paragraphs: [
          "To the extent permitted by law, Aurum Diary is provided \"as is\" and \"as available\" without warranties of any kind, express or implied, including availability, uninterrupted service, merchantability, fitness for a particular purpose, or the accuracy of generated output.",
          "To the extent permitted by law, Aurum is not liable for indirect, incidental, special, punitive, or consequential damages, including loss of data, lost profits, business interruption, emotional distress, or decisions made based on generated reflections or readings.",
          "Nothing in these terms excludes liability that cannot be excluded under applicable law.",
        ],
      },
      {
        title: "11. Governing law and disputes",
        paragraphs: [
          "Unless mandatory consumer law requires otherwise, these terms are governed by French law, excluding conflict-of-law rules.",
          "Before bringing a formal claim, please contact us at contact@aurumdiary.com so we can attempt to resolve the issue informally. Subject to non-waivable consumer rights, the courts of Paris, France have jurisdiction over disputes relating to the service.",
        ],
      },
      {
        title: "12. Changes and contact",
        paragraphs: [
          "We may update these terms to reflect product, legal, or vendor changes. The latest version will be posted on this page with an updated date.",
          "For questions about these terms, contact us at contact@aurumdiary.com.",
        ],
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Conditions d'Utilisation | Aurum Diary" : "Terms of Use | Aurum Diary";
  const description = isFr
    ? "Conditions d'utilisation d'Aurum Diary: service de réflexion privée guidée, abonnements, sécurité, contenu et responsabilités."
    : "Aurum Diary terms of use: guided private reflection, subscriptions, security, content ownership, and responsibilities.";
  const alternates = buildAlternates("/terms", locale);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
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
  const locale = (await getRequestLocale()) === "fr" ? "fr" : "en";
  const t = copy[locale];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-serif">{t.title}</CardTitle>
          <p className="mt-2 text-muted-foreground">{t.updated}</p>
          <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-muted-foreground">{t.intro}</p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="https://aurumdiary.com">{t.back}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="prose prose-slate mt-8 max-w-none dark:prose-invert">
          {t.sections.map((section) => (
            <section key={section.title}>
              <h2 className="mt-8 text-2xl font-serif">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
