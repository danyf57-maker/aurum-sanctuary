export type KnowledgeHubTopic = {
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
    title: "Charge mentale",
    question: "Comment alléger ta charge mentale quand tout s'accumule ?",
    shortAnswer:
      "Écris ce qui tourne en boucle, trie ce qui dépend de toi, puis choisis une seule action utile pour aujourd'hui.",
    deepDive: [
      "La charge mentale augmente quand ton cerveau garde des tâches ouvertes en permanence. Mettre les pensées à l'écrit réduit la rumination et libère de l'espace attentionnel.",
      "Dans Aurum, commence par une note brute de 3 minutes: sans corriger, sans filtrer. Ensuite, sépare en trois colonnes: urgent, important, à laisser. Ce tri diminue la sensation de débordement.",
      "L'objectif n'est pas de tout résoudre immédiatement. L'objectif est de retrouver une direction claire et praticable.",
    ],
    metaTitle: "Charge mentale: méthode simple pour retrouver de la clarté",
    metaDescription:
      "Découvre une méthode concrète pour alléger ta charge mentale en quelques minutes grâce à l'écriture guidée.",
  },
  {
    slug: "journal-guide",
    title: "Journal guidé",
    question: "Le journal guidé peut-il vraiment t'aider à voir plus clair ?",
    shortAnswer:
      "Oui, parce qu'un cadre simple t'aide à transformer un flot émotionnel flou en compréhension exploitable.",
    deepDive: [
      "Un journal libre soulage, mais un journal guidé structure. Avec les bonnes questions, tu passes plus vite de \"je me sens mal\" à \"je comprends ce qui m'active\".",
      "Exemple de séquence efficace: 1) ce que je ressens, 2) ce qui a déclenché, 3) ce dont j'ai besoin, 4) la prochaine micro-action.",
      "Cette méthode soutient une clarté mentale rapide sans exposer ton intimité publiquement.",
    ],
    metaTitle: "Journal guidé: clarifier ses émotions pas à pas",
    metaDescription:
      "Le journal guidé t'aide à comprendre tes émotions et à avancer avec des actions simples et concrètes.",
  },
  {
    slug: "introspection",
    title: "Introspection",
    question: "Comment pratiquer l'introspection sans te perdre dans tes pensées ?",
    shortAnswer:
      "Utilise une introspection orientée décision: observe, nomme, puis conclus par une action courte.",
    deepDive: [
      "L'introspection devient contre-productive quand elle reste abstraite. Pour éviter cela, termine chaque réflexion par un engagement précis: \"ce soir, je...\".",
      "Aurum est conçu pour ce passage de la compréhension à l'action. Tu écris, tu identifies un motif, puis tu choisis un prochain pas réaliste.",
      "Le bon signal d'une introspection utile: moins de confusion, plus de calme, et une décision faisable dans les 24 heures.",
    ],
    metaTitle: "Introspection efficace: comprendre et agir rapidement",
    metaDescription:
      "Apprends une introspection simple et utile pour transformer tes pensées en décisions concrètes.",
  },
  {
    slug: "confidentialite-mentale",
    title: "Confidentialité mentale",
    question: "Pourquoi la confidentialité mentale change la qualité de ton écriture ?",
    shortAnswer:
      "Quand tu sais que ton espace est privé, tu écris plus vrai, donc tu comprends mieux ce que tu ressens.",
    deepDive: [
      "L'auto-censure réduit la qualité de l'introspection. La confidentialité crée un cadre psychologique sûr où les pensées complexes peuvent émerger.",
      "Dans Aurum, la promesse est claire: un espace personnel pour déposer ton vécu sans performance sociale ni regard public.",
      "Plus ton écriture est authentique, plus l'analyse qui en découle peut t'aider à faire des choix alignés.",
    ],
    metaTitle: "Confidentialité mentale: écrire vrai pour comprendre",
    metaDescription:
      "Un espace d'écriture privé améliore la clarté émotionnelle et la qualité de tes prises de conscience.",
  },
  {
    slug: "routine-5-minutes",
    title: "Routine 5 minutes",
    question: "Quelle routine de 5 minutes pour retrouver du calme mental ?",
    shortAnswer:
      "Respire 30 secondes, écris 3 minutes, puis termine par 90 secondes de plan d'action minimal.",
    deepDive: [
      "Une routine courte fonctionne mieux qu'un grand rituel rarement tenu. La régularité crée plus d'impact que l'intensité.",
      "Format recommandé: 1) état émotionnel actuel, 2) pensée dominante, 3) priorité unique du jour, 4) phrase d'ancrage.",
      "En répétant cette routine, tu stabilises ton attention et tu réduis la dispersion mentale.",
    ],
    metaTitle: "Routine 5 minutes: clarté mentale quotidienne",
    metaDescription:
      "Adopte une routine de 5 minutes pour écrire, clarifier ton esprit et passer à l'action sans pression.",
  },
];

export function getKnowledgeHubTopic(slug: string) {
  return knowledgeHubTopics.find((topic) => topic.slug === slug);
}
