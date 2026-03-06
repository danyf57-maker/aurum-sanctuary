import type { Locale } from "@/lib/locale";

type LocalizedField = {
  fr: string;
  en: string;
};

type LocalizedFieldList = {
  fr: string[];
  en: string[];
};

export type KnowledgeHubTopic = {
  slug: string;
  title: LocalizedField;
  question: LocalizedField;
  shortAnswer: LocalizedField;
  deepDive: LocalizedFieldList;
  metaTitle: LocalizedField;
  metaDescription: LocalizedField;
};

export type LocalizedKnowledgeHubTopic = {
  slug: string;
  title: string;
  question: string;
  shortAnswer: string;
  deepDive: string[];
  metaTitle: string;
  metaDescription: string;
};

export const knowledgeHubTopics: KnowledgeHubTopic[] = [
  {
    slug: "charge-mentale",
    title: { fr: "Charge mentale", en: "Mental load" },
    question: {
      fr: "Comment alléger ta charge mentale quand tout s'accumule ?",
      en: "How can you reduce mental load when everything piles up?",
    },
    shortAnswer: {
      fr: "Écris ce qui tourne en boucle, trie ce qui dépend de toi, puis choisis une seule action utile pour aujourd'hui.",
      en: "Write down recurring thoughts, separate what you control, then pick one useful action for today.",
    },
    deepDive: {
      fr: [
        "La charge mentale augmente quand ton cerveau garde des tâches ouvertes en permanence. Mettre les pensées à l'écrit réduit la rumination et libère de l'espace attentionnel.",
        "Dans Aurum, commence par une note brute de 3 minutes: sans corriger, sans filtrer. Ensuite, sépare en trois colonnes: urgent, important, à laisser. Ce tri diminue la sensation de débordement.",
        "L'objectif n'est pas de tout résoudre immédiatement. L'objectif est de retrouver une direction claire et praticable.",
      ],
      en: [
        "Mental load increases when your brain keeps too many open loops. Writing thoughts down reduces rumination and frees attention.",
        "In Aurum, start with a raw 3-minute note: no editing, no filtering. Then sort into three columns: urgent, important, let go. This lowers overwhelm quickly.",
        "The goal is not to solve everything now. The goal is to regain clear direction and the next doable step.",
      ],
    },
    metaTitle: {
      fr: "Charge mentale: méthode simple pour retrouver de la clarté",
      en: "Mental load: a simple method to regain clarity",
    },
    metaDescription: {
      fr: "Découvre une méthode concrète pour alléger ta charge mentale en quelques minutes grâce à l'écriture guidée.",
      en: "Discover a practical method to reduce mental load in minutes with guided journaling.",
    },
  },
  {
    slug: "journal-guide",
    title: { fr: "Journal guidé", en: "Guided journaling" },
    question: {
      fr: "Le journal guidé peut-il vraiment t'aider à voir plus clair ?",
      en: "Can guided journaling really help you think more clearly?",
    },
    shortAnswer: {
      fr: "Oui, parce qu'un cadre simple t'aide à transformer un flot émotionnel flou en compréhension exploitable.",
      en: "Yes. A simple structure turns vague emotional noise into actionable understanding.",
    },
    deepDive: {
      fr: [
        "Un journal libre soulage, mais un journal guidé structure. Avec les bonnes questions, tu passes plus vite de \"je me sens mal\" à \"je comprends ce qui m'active\".",
        "Exemple de séquence efficace: 1) ce que je ressens, 2) ce qui a déclenché, 3) ce dont j'ai besoin, 4) la prochaine micro-action.",
        "Cette méthode soutient une clarté mentale rapide sans exposer ton intimité publiquement.",
      ],
      en: [
        "Free writing can relieve pressure, but guided journaling adds structure. Good prompts help you move from \"I feel bad\" to \"I understand what triggers me.\"",
        "A useful flow is: 1) what I feel, 2) what triggered it, 3) what I need, 4) next micro-action.",
        "This process supports fast mental clarity without exposing your private life.",
      ],
    },
    metaTitle: {
      fr: "Journal guidé: clarifier ses émotions pas à pas",
      en: "Guided journaling: clarify emotions step by step",
    },
    metaDescription: {
      fr: "Le journal guidé t'aide à comprendre tes émotions et à avancer avec des actions simples et concrètes.",
      en: "Guided journaling helps you understand emotions and move forward with simple actions.",
    },
  },
  {
    slug: "introspection",
    title: { fr: "Introspection", en: "Introspection" },
    question: {
      fr: "Comment pratiquer l'introspection sans te perdre dans tes pensées ?",
      en: "How do you practice introspection without getting stuck in overthinking?",
    },
    shortAnswer: {
      fr: "Utilise une introspection orientée décision: observe, nomme, puis conclus par une action courte.",
      en: "Use decision-oriented introspection: observe, name, then end with one short action.",
    },
    deepDive: {
      fr: [
        "L'introspection devient contre-productive quand elle reste abstraite. Pour éviter cela, termine chaque réflexion par un engagement précis: \"ce soir, je...\".",
        "Aurum est conçu pour ce passage de la compréhension à l'action. Tu écris, tu identifies un motif, puis tu choisis un prochain pas réaliste.",
        "Le bon signal d'une introspection utile: moins de confusion, plus de calme, et une décision faisable dans les 24 heures.",
      ],
      en: [
        "Introspection becomes counterproductive when it stays abstract. To avoid that, end each reflection with a clear commitment: \"Tonight I will...\"",
        "Aurum is built for this shift from understanding to action. You write, identify a pattern, then choose a realistic next step.",
        "A good signal of useful introspection is less confusion, more calm, and one decision you can execute in 24 hours.",
      ],
    },
    metaTitle: {
      fr: "Introspection efficace: comprendre et agir rapidement",
      en: "Effective introspection: understand and act faster",
    },
    metaDescription: {
      fr: "Apprends une introspection simple et utile pour transformer tes pensées en décisions concrètes.",
      en: "Learn a practical introspection method to turn thoughts into concrete decisions.",
    },
  },
  {
    slug: "confidentialite-mentale",
    title: { fr: "Confidentialité mentale", en: "Mental privacy" },
    question: {
      fr: "Pourquoi la confidentialité mentale change la qualité de ton écriture ?",
      en: "Why does mental privacy improve journaling quality?",
    },
    shortAnswer: {
      fr: "Quand tu sais que ton espace est privé, tu écris plus vrai, donc tu comprends mieux ce que tu ressens.",
      en: "When your space feels private, you write more honestly and understand your emotions better.",
    },
    deepDive: {
      fr: [
        "L'auto-censure réduit la qualité de l'introspection. La confidentialité crée un cadre psychologique sûr où les pensées complexes peuvent émerger.",
        "Dans Aurum, la promesse est claire: un espace personnel pour déposer ton vécu sans performance sociale ni regard public.",
        "Plus ton écriture est authentique, plus l'analyse qui en découle peut t'aider à faire des choix alignés.",
      ],
      en: [
        "Self-censorship weakens introspection. Privacy creates psychological safety, so deeper thoughts can surface.",
        "In Aurum, the promise is simple: a personal space to process your experience without social performance or public exposure.",
        "The more authentic your writing is, the more useful your insights become for real-life choices.",
      ],
    },
    metaTitle: {
      fr: "Confidentialité mentale: écrire vrai pour comprendre",
      en: "Mental privacy: write honestly, understand deeply",
    },
    metaDescription: {
      fr: "Un espace d'écriture privé améliore la clarté émotionnelle et la qualité de tes prises de conscience.",
      en: "A private writing space improves emotional clarity and insight quality.",
    },
  },
  {
    slug: "routine-5-minutes",
    title: { fr: "Routine 5 minutes", en: "5-minute routine" },
    question: {
      fr: "Quelle routine de 5 minutes pour retrouver du calme mental ?",
      en: "What 5-minute routine helps restore mental calm?",
    },
    shortAnswer: {
      fr: "Respire 30 secondes, écris 3 minutes, puis termine par 90 secondes de plan d'action minimal.",
      en: "Breathe for 30 seconds, write for 3 minutes, then end with a 90-second minimal action plan.",
    },
    deepDive: {
      fr: [
        "Une routine courte fonctionne mieux qu'un grand rituel rarement tenu. La régularité crée plus d'impact que l'intensité.",
        "Format recommandé: 1) état émotionnel actuel, 2) pensée dominante, 3) priorité unique du jour, 4) phrase d'ancrage.",
        "En répétant cette routine, tu stabilises ton attention et tu réduis la dispersion mentale.",
      ],
      en: [
        "A short routine beats a perfect ritual you rarely do. Consistency creates more impact than intensity.",
        "Suggested format: 1) current emotional state, 2) dominant thought, 3) one priority today, 4) one grounding sentence.",
        "Repeated daily, this routine stabilizes attention and reduces mental noise.",
      ],
    },
    metaTitle: {
      fr: "Routine 5 minutes: clarté mentale quotidienne",
      en: "5-minute routine: daily mental clarity",
    },
    metaDescription: {
      fr: "Adopte une routine de 5 minutes pour écrire, clarifier ton esprit et passer à l'action sans pression.",
      en: "Adopt a 5-minute routine to write, clear your mind, and move to action without pressure.",
    },
  },
];

export function getKnowledgeHubTopicBase(slug: string) {
  return knowledgeHubTopics.find((topic) => topic.slug === slug);
}

export function localizeKnowledgeHubTopic(
  topic: KnowledgeHubTopic,
  locale: Locale
): LocalizedKnowledgeHubTopic {
  return {
    slug: topic.slug,
    title: topic.title[locale],
    question: topic.question[locale],
    shortAnswer: topic.shortAnswer[locale],
    deepDive: topic.deepDive[locale],
    metaTitle: topic.metaTitle[locale],
    metaDescription: topic.metaDescription[locale],
  };
}

export function getKnowledgeHubTopic(slug: string, locale: Locale) {
  const topic = getKnowledgeHubTopicBase(slug);
  if (!topic) return undefined;
  return localizeKnowledgeHubTopic(topic, locale);
}

export function getKnowledgeHubTopics(locale: Locale): LocalizedKnowledgeHubTopic[] {
  return knowledgeHubTopics.map((topic) => localizeKnowledgeHubTopic(topic, locale));
}
