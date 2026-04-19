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
  practicalSteps?: LocalizedFieldList;
  example?: LocalizedFieldList;
  howAurumHelps?: LocalizedFieldList;
  metaTitle: LocalizedField;
  metaDescription: LocalizedField;
};

export type LocalizedKnowledgeHubTopic = {
  slug: string;
  title: string;
  question: string;
  shortAnswer: string;
  deepDive: string[];
  practicalSteps?: string[];
  example?: string[];
  howAurumHelps?: string[];
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
        "La charge mentale augmente quand ton cerveau garde des tâches ouvertes, des attentes floues et des micro-décisions en même temps. Mettre les pensées à l'écrit aide à sortir du stockage permanent et à libérer de l'espace attentionnel.",
        "Le problème n'est pas seulement d'avoir beaucoup à faire. Le problème est de tout garder dans la même zone mentale: obligations, émotions, rappels, décisions, culpabilité et fatigue.",
        "Une bonne méthode ne cherche pas à tout résoudre d'un coup. Elle cherche d'abord à rendre visible ce qui pèse, puis à remettre de l'ordre de manière réaliste.",
      ],
      en: [
        "Mental load increases when your brain keeps tasks, expectations, emotions, and decisions open at the same time. Writing thoughts down helps move them out of permanent mental storage and frees attention.",
        "The issue is not just having too much to do. It is carrying obligations, feelings, reminders, guilt, and unfinished decisions in the same mental space.",
        "A useful method does not try to solve everything at once. It first makes the load visible, then restores order in a realistic way.",
      ],
    },
    practicalSteps: {
      fr: [
        "Fais un brain dump de 3 minutes sans corriger ni organiser.",
        "Relis et trie en trois colonnes: urgent, important, à laisser.",
        "Choisis une seule action utile pour aujourd'hui, même petite.",
      ],
      en: [
        "Do a 3-minute brain dump without editing or organizing.",
        "Read it back and sort it into three columns: urgent, important, let go.",
        "Choose one useful action for today, even if it is small.",
      ],
    },
    example: {
      fr: [
        "Exemple: \"Je pense à ce mail, au rendez-vous de demain, à la lessive, à cette conversation tendue et au fait que je n'avance sur rien.\"",
        "Après tri: urgent = répondre au mail; important = préparer le rendez-vous; à laisser = ruminer la conversation ce soir.",
      ],
      en: [
        "Example: \"I keep thinking about that email, tomorrow's meeting, the laundry, that tense conversation, and the feeling that I am behind on everything.\"",
        "After sorting: urgent = reply to the email; important = prepare the meeting; let go = replaying the conversation tonight.",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum te donne un espace privé pour déposer ce qui tourne en boucle sans pression de performance.",
        "La réflexion guidée t'aide ensuite à distinguer ce qui est urgent, ce qui est émotionnel, et ce qui peut attendre.",
        "Avec le temps, tu vois mieux les motifs qui alimentent ta surcharge mentale.",
      ],
      en: [
        "Aurum gives you a private space to unload recurring thoughts without performance pressure.",
        "Guided reflection then helps you separate urgency, emotion, and what can wait.",
        "Over time, you can spot the patterns that keep feeding your overload.",
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
    slug: "overthinking-at-night",
    title: { fr: "Surpenser la nuit", en: "Overthinking at night" },
    question: {
      fr: "Comment arrêter de trop penser la nuit quand ton corps est épuisé mais que ton esprit continue ?",
      en: "How do you stop overthinking at night when your body is tired but your mind keeps running?",
    },
    shortAnswer: {
      fr: "Pose les faits, nomme l'émotion dominante, puis écris le prochain besoin ou la prochaine action. Le but n'est pas de tout régler avant de dormir, mais de sortir la boucle de ta tête.",
      en: "Write down the facts, name the dominant emotion, then note the next need or next action. The goal is not to solve everything before sleep, but to get the loop out of your head.",
    },
    deepDive: {
      fr: [
        "La suractivité mentale du soir arrive souvent quand quelque chose reste ouvert: une conversation, une inquiétude, une décision, une tension que tu n'as pas encore mise en mots.",
        "La fatigue physique n'éteint pas automatiquement les boucles mentales. Quand la journée ralentit enfin, ce qui a été repoussé revient prendre toute la place.",
        "Écrire le soir n'a pas besoin d'être long ni parfait. Quelques lignes honnêtes suffisent souvent à transformer un flux flou en quelque chose de plus stable et plus visible.",
      ],
      en: [
        "Night overthinking often happens when something is still open: a conversation, a worry, a decision, or a tension you have not yet put into words.",
        "Physical tiredness does not automatically switch off mental loops. When the day finally slows down, whatever was postponed comes back and takes over.",
        "Night journaling does not need to be long or polished. A few honest lines are often enough to turn vague mental noise into something steadier and more visible.",
      ],
    },
    practicalSteps: {
      fr: [
        "Écris en trois lignes ce qui s'est passé concrètement.",
        "Ajoute l'émotion dominante: peur, colère, tristesse, honte, confusion, frustration.",
        "Termine par une seule phrase: ce dont j'ai besoin maintenant ou ce que je traiterai demain.",
      ],
      en: [
        "Write three lines about what happened in concrete terms.",
        "Add the dominant emotion: fear, anger, sadness, shame, confusion, frustration.",
        "End with one sentence: what I need now or what I will handle tomorrow.",
      ],
    },
    example: {
      fr: [
        "Exemple: \"Je repense à ce que j'ai dit pendant le dîner. J'ai peur d'avoir été maladroit. Ce soir, je n'ai pas besoin de résoudre la relation, juste de dormir et d'y revenir demain avec un esprit plus calme.\"",
      ],
      en: [
        "Example: \"I keep replaying what I said at dinner. I am afraid I came across badly. Tonight I do not need to solve the relationship. I just need sleep and I can come back to it tomorrow with a calmer mind.\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum t'aide à écrire sans filtre dans un espace privé, sans exposition ni bruit social.",
        "Les questions guidées aident à passer du chaos mental à quelque chose de plus précis: ce que tu ressens, ce qui revient, ce dont tu as besoin.",
        "Au fil des pages, les mêmes thèmes du soir deviennent plus visibles au lieu de sembler nouveaux chaque nuit.",
      ],
      en: [
        "Aurum helps you write without filtering in a private space, with no exposure and no social noise.",
        "Guided prompts help you move from mental chaos to something clearer: what you feel, what keeps returning, and what you need.",
        "Across entries, recurring nighttime themes become easier to see instead of feeling new every night.",
      ],
    },
    metaTitle: {
      fr: "Surpenser la nuit: comment calmer un esprit qui ne s'arrête pas",
      en: "How to stop overthinking at night and calm a racing mind",
    },
    metaDescription: {
      fr: "Une méthode simple pour sortir d'une boucle mentale le soir, retrouver de la clarté et préparer un meilleur endormissement.",
      en: "A simple method to get out of a nighttime thought loop, regain clarity, and settle your mind before sleep.",
    },
  },
  {
    slug: "journaling-prompts-for-clarity",
    title: { fr: "Prompts d'écriture pour la clarté", en: "Journaling prompts for clarity" },
    question: {
      fr: "Quels prompts d'écriture t'aident vraiment à retrouver de la clarté mentale ?",
      en: "Which journaling prompts actually help you regain mental clarity?",
    },
    shortAnswer: {
      fr: "Les meilleurs prompts ne demandent pas seulement ce que tu ressens. Ils t'aident à relier un fait, une émotion, un besoin et un prochain pas.",
      en: "The best prompts do more than ask how you feel. They help connect a fact, an emotion, a need, and a next step.",
    },
    deepDive: {
      fr: [
        "Beaucoup de prompts restent trop abstraits pour les moments où ton esprit est encombré. Quand tu te sens submergé, tu as besoin de questions simples qui créent du mouvement, pas de formulations vagues.",
        "Les prompts les plus utiles réduisent le brouillard mental en orientant ton attention vers des éléments concrets: ce qui s'est passé, ce qui revient, ce qui pèse, et ce qui pourrait t'aider maintenant.",
        "Le bon prompt n'est pas seulement intéressant. Il doit être assez précis pour faire émerger une prise de conscience exploitable en quelques minutes.",
      ],
      en: [
        "Many prompts stay too abstract for moments when your mind feels overloaded. When you are overwhelmed, you need simple questions that create movement, not vague phrasing.",
        "The most useful prompts reduce mental fog by directing attention toward concrete elements: what happened, what keeps returning, what feels heavy, and what might help now.",
        "A good prompt is not just interesting. It should be specific enough to produce a useful insight within a few minutes.",
      ],
    },
    practicalSteps: {
      fr: [
        "Quand tu te sens submergé: \"Qu'est-ce qui occupe le plus d'espace dans ma tête en ce moment ?\"",
        "Quand une conversation tourne en boucle: \"Qu'est-ce qui m'a touché exactement, au-delà des faits ?\"",
        "Quand tu hésites sur une décision: \"Qu'est-ce qui m'aligne, et qu'est-ce qui me compromet ?\"",
        "Quand un motif revient: \"Dans quelles trois situations récentes ai-je ressenti la même tension ?\"",
        "Quand tu veux passer à l'action: \"Quel est le prochain pas le plus simple et le plus honnête ?\"",
      ],
      en: [
        "When you feel overwhelmed: \"What is taking up the most space in my mind right now?\"",
        "When a conversation keeps replaying: \"What touched me most here, beyond the facts?\"",
        "When you are stuck on a decision: \"What aligns me, and what compromises me?\"",
        "When a pattern keeps returning: \"In which three recent situations did I feel the same tension?\"",
        "When you want to move forward: \"What is the simplest honest next step?\"",
      ],
    },
    example: {
      fr: [
        "Mini exemple: prompt = \"Qu'est-ce qui occupe le plus d'espace dans ma tête ?\" Réponse = \"Ce n'est pas le travail en général. C'est surtout cette attente de réponse et la peur d'être jugé.\"",
      ],
      en: [
        "Mini example: prompt = \"What is taking up the most space in my mind?\" Answer = \"It is not work in general. It is mostly that unanswered message and the fear of being judged.\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum te donne un cadre privé pour utiliser ces prompts sans te censurer.",
        "Après l'écriture, la réflexion guidée aide à repérer les thèmes récurrents et à aller au-delà d'un simple brain dump.",
        "Cela transforme une série de réponses isolées en continuité réflexive sur plusieurs jours.",
      ],
      en: [
        "Aurum gives you a private space to use these prompts without self-censorship.",
        "After writing, guided reflection helps surface recurring themes and goes beyond a simple brain dump.",
        "This turns isolated answers into a more continuous reflective practice across days.",
      ],
    },
    metaTitle: {
      fr: "15 prompts d'écriture pour retrouver de la clarté mentale",
      en: "15 journaling prompts for mental clarity",
    },
    metaDescription: {
      fr: "Des prompts simples et concrets pour clarifier tes pensées, sortir d'une boucle mentale et mieux comprendre ce que tu ressens.",
      en: "Simple, practical journaling prompts to clear your mind, exit thought loops, and understand what you feel more clearly.",
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
    practicalSteps: topic.practicalSteps?.[locale],
    example: topic.example?.[locale],
    howAurumHelps: topic.howAurumHelps?.[locale],
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
