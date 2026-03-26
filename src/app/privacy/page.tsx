import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequestLocale } from "@/lib/locale-server";

type Locale = "fr" | "en";

type PrivacySection = {
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
    sections: PrivacySection[];
  }
> = {
  fr: {
    title: "Politique de Confidentialité",
    updated: "Dernière mise à jour : 19 mars 2026",
    back: "Retour à Aurum Diary",
    intro:
      "Cette politique décrit comment Aurum Diary collecte, utilise, protège et partage les données nécessaires au fonctionnement du service. Elle couvre aussi les fonctionnalités assistées par IA, les prestataires techniques, les analytics et vos droits.",
    sections: [
      {
        title: "1. Qui traite vos données",
        paragraphs: [
          "Aurum Diary traite vos données personnelles pour fournir le service disponible sur aurumdiary.com. Pour toute question relative à la confidentialité ou pour exercer vos droits, vous pouvez nous écrire à contact@aurumdiary.com.",
          "Lorsque vous écrivez dans Aurum Diary, votre contenu peut inclure des informations sensibles selon ce que vous choisissez de raconter, y compris des éléments liés à vos émotions, vos relations, votre stress ou votre santé.",
        ],
      },
      {
        title: "2. Données que nous collectons",
        paragraphs: [
          "Nous collectons uniquement les catégories de données nécessaires pour faire fonctionner Aurum Diary, sécuriser le compte, gérer les paiements et améliorer l'expérience.",
        ],
        bullets: [
          "Données de compte: email, prénom, fournisseur de connexion, identifiants techniques liés au compte.",
          "Données de journal et de réflexion: pages, titres, tags, demandes, reflets générés, signaux de motifs et métadonnées associées.",
          "Données d'abonnement et de paiement: statut d'abonnement, identifiants Stripe, historique de checkout et de facturation. Nous ne stockons pas les numéros complets de carte bancaire.",
          "Données d'usage et de sécurité: journaux techniques, appareil, navigateur, sessions, adresse IP approximative, événements produits, anti-abus et diagnostic.",
          "Données de communication: préférences email, envois, ouvertures, clics, désinscription, réponses support.",
        ],
      },
      {
        title: "3. Comment nous utilisons les données",
        paragraphs: [
          "Nous utilisons les données pour exécuter le service que vous demandez, sécuriser votre compte, générer les fonctionnalités de réflexion, gérer les abonnements, répondre à vos demandes, envoyer des communications utiles liées au service, produire des analytics internes et respecter nos obligations légales.",
          "Nous n'utilisons pas vos écrits pour les publier ni pour les vendre. Nous utilisons votre contenu pour fournir les fonctionnalités que vous activez dans le produit.",
        ],
      },
      {
        title: "4. Fonctionnalités IA",
        paragraphs: [
          "Quand vous demandez un reflet, une analyse, un digest ou une autre fonctionnalité assistée par IA, le texte que vous choisissez de soumettre ainsi que certains éléments de contexte nécessaires au fonctionnement de la fonctionnalité peuvent être traités afin de générer la réponse demandée.",
          "Ce traitement peut impliquer des prestataires techniques d'IA agissant pour fournir la fonctionnalité. Nous utilisons cette transmission pour exécuter votre demande, pas pour vendre vos pages de journal.",
        ],
      },
      {
        title: "5. Prestataires et catégories de destinataires",
        paragraphs: [
          "Nous faisons appel à des sous-traitants et prestataires techniques pour opérer Aurum Diary.",
        ],
        bullets: [
          "Google / Firebase / Google Cloud pour l'hébergement, l'authentification, la base de données, le stockage et certains analytics techniques.",
          "Stripe pour le paiement, le portail de facturation et les webhooks liés à l'abonnement.",
          "Resend pour les emails transactionnels et certains emails d'onboarding.",
          "Des fournisseurs d'IA, dont DeepSeek, pour générer les fonctionnalités de réflexion ou d'analyse que vous demandez explicitement.",
        ],
      },
      {
        title: "6. Cookies, stockage local et analytics",
        paragraphs: [
          "Aurum Diary utilise des cookies et des mécanismes de stockage local pour faire fonctionner la session, mémoriser certaines préférences et mesurer l'usage du produit.",
          "Nous utilisons également des outils d'analytics, dont Google Analytics et Google Tag Manager, ainsi que des événements produits internes. Ces outils nous aident à comprendre le trafic, les conversions et l'utilisation des fonctionnalités.",
          "Vous pouvez configurer votre navigateur pour limiter certains cookies, mais cela peut dégrader certaines fonctions du service.",
        ],
      },
      {
        title: "7. Bases légales (GDPR)",
        paragraphs: [
          "Lorsque le GDPR s'applique, nous traitons vos données sur une ou plusieurs des bases suivantes : exécution du contrat pour fournir Aurum Diary, respect d'obligations légales, intérêt légitime pour sécuriser et améliorer le service, et consentement lorsqu'il est requis.",
          "Lorsque vous utilisez les fonctionnalités assistées par IA, le traitement correspondant repose principalement sur l'exécution du service que vous demandez.",
        ],
      },
      {
        title: "8. Sécurité",
        paragraphs: [
          "Nous mettons en place des mesures de sécurité raisonnables, y compris le chiffrement en transit, des contrôles d'accès, de la journalisation de sécurité et, pour certains flux de stockage du journal, un chiffrement côté client.",
          "À ce jour, ce chiffrement côté client ne doit pas être compris comme un chiffrement de bout en bout, ni comme une architecture zero-knowledge ou admin-blind garantie.",
          "Certaines fonctionnalités, notamment les fonctionnalités assistées par IA, impliquent toutefois un traitement opérationnel du texte que vous soumettez afin de produire le service demandé. Aucune méthode de transmission ou de stockage n'est parfaitement sûre.",
        ],
      },
      {
        title: "9. Conservation des données",
        paragraphs: [
          "Nous conservons les données aussi longtemps que nécessaire pour fournir Aurum Diary, maintenir votre compte actif, exécuter vos abonnements, prévenir la fraude, résoudre les litiges, respecter la loi et terminer les cycles de sauvegarde raisonnables.",
          "Si vous supprimez votre compte, nous supprimons ou anonymisons vos données selon notre flux de suppression, sous réserve des obligations légales, des logs de sécurité, des archives temporaires et des besoins de facturation ou de défense des droits.",
        ],
      },
      {
        title: "10. Transferts internationaux",
        paragraphs: [
          "Selon votre localisation et les prestataires concernés, vos données peuvent être traitées dans l'Union européenne, aux États-Unis ou dans d'autres pays où nos prestataires opèrent.",
          "Lorsque cela est requis, nous mettons en place des mécanismes de transfert appropriés, tels que des engagements contractuels ou des garanties reconnues par le droit applicable.",
        ],
      },
      {
        title: "11. Vos droits",
        paragraphs: [
          "Selon votre juridiction, vous pouvez disposer de droits d'accès, de rectification, d'effacement, de limitation, d'opposition, d'export/portabilité, ainsi que du droit de retirer votre consentement lorsque le traitement repose sur celui-ci.",
          "Les résidents de Californie peuvent également demander des informations sur les catégories de données collectées, demander l'accès, la correction ou la suppression de leurs données personnelles, et exercer les droits prévus par le CCPA/CPRA.",
        ],
        bullets: [
          "Nous ne vendons pas vos données personnelles.",
          "Nous n'utilisons pas vos données personnelles pour de la publicité comportementale inter-contextes.",
          "Pour exercer vos droits, contactez-nous à contact@aurumdiary.com.",
        ],
      },
      {
        title: "12. Enfants",
        paragraphs: [
          "Aurum Diary n'est pas destiné aux enfants de moins de 16 ans. Si vous pensez qu'un mineur nous a fourni des données en violation de cette règle, contactez-nous afin que nous puissions examiner et supprimer les données concernées si nécessaire.",
        ],
      },
      {
        title: "13. Modifications et contact",
        paragraphs: [
          "Nous pouvons mettre à jour cette politique pour refléter les évolutions du produit, de la loi ou de nos prestataires. La version la plus récente sera publiée sur cette page avec une date de mise à jour.",
          "Pour toute question relative à la confidentialité, aux droits ou à cette politique, contactez-nous à contact@aurumdiary.com.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: March 19, 2026",
    back: "Back to Aurum Diary",
    intro:
      "This policy explains how Aurum Diary collects, uses, protects, and discloses the data required to operate the service. It also covers AI-powered features, technical service providers, analytics, and your privacy rights.",
    sections: [
      {
        title: "1. Who handles your data",
        paragraphs: [
          "Aurum Diary processes personal data to provide the service available at aurumdiary.com. For privacy questions or to exercise your rights, contact us at contact@aurumdiary.com.",
          "Because users may write about emotions, relationships, stress, or health-related topics, some content submitted to Aurum Diary may be sensitive depending on what you choose to share.",
        ],
      },
      {
        title: "2. Data we collect",
        paragraphs: [
          "We collect only the categories of data needed to operate Aurum Diary, secure accounts, manage payments, and improve the experience.",
        ],
        bullets: [
          "Account data: email address, first name, sign-in provider, and technical account identifiers.",
          "Journal and reflection data: entries, titles, tags, prompts, generated reflections, pattern signals, and related metadata.",
          "Subscription and payment data: subscription status, Stripe identifiers, checkout and billing history. We do not store full payment card numbers.",
          "Usage and security data: technical logs, device and browser information, session data, approximate IP-related data, product events, anti-abuse signals, and diagnostics.",
          "Communication data: email preferences, transactional and onboarding email events, unsubscribe status, and support interactions.",
        ],
      },
      {
        title: "3. How we use data",
        paragraphs: [
          "We use data to provide the service you request, secure accounts, deliver AI-assisted reflection features, manage subscriptions, respond to support requests, send service-related communications, produce internal product analytics, and comply with legal obligations.",
          "We do not publish or sell your journal content. We use your content to deliver the features you activate inside the product.",
        ],
      },
      {
        title: "4. AI-powered features",
        paragraphs: [
          "When you request a reflection, analysis, digest, or other AI-powered feature, the text you choose to submit, together with relevant context required to deliver that feature, may be processed to generate the requested output.",
          "This processing may involve AI service providers acting on our behalf to return the feature you requested. We use that transmission to deliver the service, not to sell your journal entries.",
        ],
      },
      {
        title: "5. Service providers and categories of recipients",
        paragraphs: [
          "We use technical service providers and processors to operate Aurum Diary.",
        ],
        bullets: [
          "Google / Firebase / Google Cloud for hosting, authentication, database, storage, and certain analytics functions.",
          "Stripe for payments, billing portal services, and subscription-related webhooks.",
          "Resend for transactional and certain onboarding emails.",
          "AI providers, including DeepSeek, for reflections and analyses you explicitly request.",
        ],
      },
      {
        title: "6. Cookies, local storage, and analytics",
        paragraphs: [
          "Aurum Diary uses cookies and local storage to maintain sessions, remember certain preferences, and measure how the product is used.",
          "We also use analytics technologies, including Google Analytics and Google Tag Manager, as well as internal product-event tracking. These tools help us understand traffic, conversions, and feature usage.",
          "You can configure your browser to limit some cookies, but doing so may reduce or break parts of the service.",
        ],
      },
      {
        title: "7. Legal bases (GDPR)",
        paragraphs: [
          "Where the GDPR applies, we process personal data on one or more of the following legal bases: performance of a contract to provide Aurum Diary, compliance with legal obligations, legitimate interests in securing and improving the service, and consent where required.",
          "When you use AI-assisted features, the related processing is primarily carried out to provide the service you requested.",
        ],
      },
      {
        title: "8. Security",
        paragraphs: [
          "We use reasonable security measures, including encryption in transit, access controls, security logging, and client-side encryption for supported journal-storage flows.",
          "At this time, that client-side protection should not be understood as end-to-end encryption, zero-knowledge storage, or a guaranteed admin-blind architecture.",
          "Some features, including AI-powered features, require operational processing of the text you submit in order to return the requested output. No transmission or storage method is perfectly secure.",
        ],
      },
      {
        title: "9. Data retention",
        paragraphs: [
          "We keep personal data for as long as needed to provide Aurum Diary, keep your account active, administer subscriptions, prevent fraud, resolve disputes, comply with the law, and complete reasonable backup cycles.",
          "If you delete your account, we delete or anonymize data according to our deletion workflow, subject to legal obligations, security logs, temporary archives, and billing or claims-defense needs.",
        ],
      },
      {
        title: "10. International transfers",
        paragraphs: [
          "Depending on where you are located and which service providers are involved, your data may be processed in the European Union, the United States, or other countries where our providers operate.",
          "Where required, we use appropriate transfer mechanisms, such as contractual safeguards or other legal protections recognized under applicable law.",
        ],
      },
      {
        title: "11. Your rights",
        paragraphs: [
          "Depending on your jurisdiction, you may have rights to access, correct, delete, restrict, object, export, or port your data, and to withdraw consent where processing depends on consent.",
          "California residents may also request information about the categories of personal information collected, and may request access, correction, or deletion under the CCPA/CPRA.",
        ],
        bullets: [
          "We do not sell personal information.",
          "We do not use personal information for cross-context behavioral advertising.",
          "To exercise your rights, contact us at contact@aurumdiary.com.",
        ],
      },
      {
        title: "12. Children",
        paragraphs: [
          "Aurum Diary is not intended for children under 16. If you believe a child provided personal data to us in violation of this rule, contact us so we can review and delete the relevant data where appropriate.",
        ],
      },
      {
        title: "13. Changes and contact",
        paragraphs: [
          "We may update this policy to reflect product, legal, or vendor changes. The latest version will be posted on this page with an updated date.",
          "For privacy questions, rights requests, or concerns about this policy, contact us at contact@aurumdiary.com.",
        ],
      },
    ],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isFr = locale === "fr";
  const title = isFr ? "Politique de Confidentialité | Aurum Diary" : "Privacy Policy | Aurum Diary";
  const description = isFr
    ? "Comment Aurum Diary collecte, protège et traite vos données: service, IA, analytics, sous-traitants, droits GDPR et CCPA."
    : "How Aurum Diary collects, protects, and processes data: service delivery, AI features, analytics, service providers, GDPR and CCPA rights.";
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
