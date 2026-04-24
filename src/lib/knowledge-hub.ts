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

function makeGrowthTopic({
  slug,
  title,
  question,
  metaTitle,
  metaDescription,
  angle,
}: {
  slug: string;
  title: LocalizedField;
  question: LocalizedField;
  metaTitle: LocalizedField;
  metaDescription: LocalizedField;
  angle: LocalizedField;
}): KnowledgeHubTopic {
  return {
    slug,
    title,
    question,
    shortAnswer: {
      fr: `${angle.fr} La méthode la plus utile est de partir d'un fait concret, de nommer l'émotion dominante, puis de finir par une petite décision écrite.`,
      en: `${angle.en} The most useful method is to start from one concrete fact, name the dominant emotion, then end with one small written decision.`,
    },
    deepDive: {
      fr: [
        `${angle.fr} Ce sujet devient important quand les pensées restent dans la tête sous forme de bruit continu. L'écriture privée transforme ce bruit en phrases séparées, donc en éléments que tu peux regarder sans tout porter en même temps.`,
        "Une bonne page ne cherche pas à tout expliquer. Elle commence par ce qui est observable: ce qui s'est passé, ce que tu as ressenti, ce qui revient, et ce qui demande une réponse réaliste. Cette simplicité évite de transformer la réflexion en rumination.",
        "La clarté vient souvent d'une séparation: les faits d'un côté, les interprétations de l'autre, puis les besoins et les actions possibles. Tant que tout reste mélangé, chaque pensée paraît urgente. Une fois écrite, elle retrouve une taille plus juste.",
        "Le format recommandé est court: cinq à dix minutes, sans recherche de style. Écris comme tu parlerais à une page qui ne te juge pas. Ce qui compte n'est pas la qualité littéraire, mais la précision émotionnelle et la continuité dans le temps.",
        "Quand tu relis plusieurs pages, les répétitions deviennent visibles. Tu peux remarquer que le même type de peur revient, que la même limite manque, ou que la même situation prend toujours trop de place. C'est là que l'écriture devient un outil de connaissance personnelle.",
      ],
      en: [
        `${angle.en} This topic matters when thoughts stay in your head as continuous noise. Private writing turns that noise into separate sentences, which means separate things you can look at without carrying all of them at once.`,
        "A useful page does not try to explain everything. It begins with what is observable: what happened, what you felt, what keeps returning, and what asks for a realistic response. That simplicity keeps reflection from turning into rumination.",
        "Clarity often comes from separation: facts on one side, interpretations on another, then needs and possible actions. While everything stays mixed together, every thought feels urgent. Once written, each thought returns to a more accurate size.",
        "The recommended format is short: five to ten minutes, with no attempt to sound polished. Write as if you were speaking to a page that does not judge you. Literary quality matters less than emotional precision and continuity over time.",
        "When you reread several pages, repetitions become visible. You may notice the same kind of fear returning, the same missing boundary, or the same situation taking too much space. That is where writing becomes a tool for self-knowledge.",
      ],
    },
    practicalSteps: {
      fr: [
        "Écris une phrase factuelle sur la situation, sans interprétation.",
        "Ajoute l'émotion principale avec un mot simple: peur, colère, honte, tristesse, fatigue, confusion.",
        "Sépare ce que tu sais de ce que tu imagines.",
        "Écris le besoin caché derrière la tension.",
        "Choisis une seule action ou une seule limite pour les prochaines 24 heures.",
      ],
      en: [
        "Write one factual sentence about the situation, without interpretation.",
        "Add the main emotion with a simple word: fear, anger, shame, sadness, fatigue, confusion.",
        "Separate what you know from what you imagine.",
        "Write the hidden need behind the tension.",
        "Choose one action or one boundary for the next 24 hours.",
      ],
    },
    example: {
      fr: [
        "Exemple de page courte: \"Le sujet me prend trop de place aujourd'hui. Le fait réel est simple, mais l'histoire que j'ajoute devient immense. Je ressens surtout de la pression. Mon besoin est de réduire le sujet à une prochaine étape claire.\"",
        "Prompt prêt à utiliser: \"Ce qui revient est... Le fait vérifiable est... L'émotion dominante est... Ce dont j'ai besoin maintenant est... Le prochain pas le plus simple est...\"",
      ],
      en: [
        "Short entry example: \"This topic is taking too much space today. The real fact is simple, but the story I add becomes huge. The main feeling is pressure. What I need is to reduce the topic to one clear next step.\"",
        "Prompt you can use: \"What keeps returning is... The verifiable fact is... The dominant emotion is... What I need now is... The simplest next step is...\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum donne un espace privé pour écrire sans performance et sans exposition sociale.",
        "Les reflets guidés aident à repérer le mouvement intérieur: déclencheur, émotion, besoin, limite ou action possible.",
        "Avec plusieurs pages, Aurum rend les motifs récurrents plus visibles afin que chaque session ne reparte pas de zéro.",
      ],
      en: [
        "Aurum gives you a private space to write without performance pressure or social exposure.",
        "Guided reflections help identify the inner movement: trigger, emotion, need, boundary, or possible action.",
        "Across several pages, Aurum makes recurring patterns easier to see so each session does not start from zero.",
      ],
    },
    metaTitle,
    metaDescription,
  };
}

const growthTopics: KnowledgeHubTopic[] = [
  makeGrowthTopic({
    slug: "private-journal-app",
    title: { fr: "Application de journal privé", en: "Private journal app" },
    question: {
      fr: "Quelle application de journal privé choisir pour écrire vraiment librement ?",
      en: "Which private journal app helps you write more freely?",
    },
    metaTitle: {
      fr: "Application de journal privé: écrire sans exposition",
      en: "Private journal app: write freely without exposure",
    },
    metaDescription: {
      fr: "Comment choisir une application de journal privé centrée sur la clarté, la confidentialité et la continuité.",
      en: "How to choose a private journal app focused on clarity, privacy, and continuity.",
    },
    angle: {
      fr: "Une application de journal privé doit protéger l'espace où tu écris avant de promettre des fonctionnalités.",
      en: "A private journal app should protect the space where you write before promising features.",
    },
  }),
  makeGrowthTopic({
    slug: "emotional-clarity-journal",
    title: { fr: "Journal de clarté émotionnelle", en: "Emotional clarity journal" },
    question: {
      fr: "Comment utiliser un journal pour mieux comprendre ce que tu ressens ?",
      en: "How can a journal help you understand what you feel?",
    },
    metaTitle: {
      fr: "Journal de clarté émotionnelle: méthode simple",
      en: "Emotional clarity journal: a simple method",
    },
    metaDescription: {
      fr: "Une méthode d'écriture privée pour nommer les émotions, repérer ce qui revient et décider plus clairement.",
      en: "A private writing method to name emotions, spot recurring patterns, and decide more clearly.",
    },
    angle: {
      fr: "La clarté émotionnelle commence quand une sensation vague devient une phrase précise.",
      en: "Emotional clarity begins when a vague sensation becomes a precise sentence.",
    },
  }),
  makeGrowthTopic({
    slug: "mental-load-journaling",
    title: { fr: "Journaling pour la charge mentale", en: "Mental load journaling" },
    question: {
      fr: "Comment le journaling peut-il alléger la charge mentale ?",
      en: "How can journaling reduce mental load?",
    },
    metaTitle: {
      fr: "Journaling et charge mentale: trier ce qui pèse",
      en: "Mental load journaling: sort what weighs on you",
    },
    metaDescription: {
      fr: "Une méthode de journaling pour sortir les tâches, attentes et émotions de la tête.",
      en: "A journaling method for moving tasks, expectations, and emotions out of your head.",
    },
    angle: {
      fr: "Le journaling aide la charge mentale parce qu'il sépare les obligations, les émotions et les prochaines actions.",
      en: "Journaling helps mental load because it separates obligations, emotions, and next actions.",
    },
  }),
  makeGrowthTopic({
    slug: "how-to-stop-rumination",
    title: { fr: "Arrêter la rumination", en: "How to stop rumination" },
    question: {
      fr: "Comment arrêter une rumination qui tourne en boucle ?",
      en: "How do you stop rumination when a thought keeps looping?",
    },
    metaTitle: {
      fr: "Comment arrêter la rumination avec l'écriture",
      en: "How to stop rumination with writing",
    },
    metaDescription: {
      fr: "Une méthode courte pour poser les faits, nommer l'émotion et sortir d'une boucle mentale.",
      en: "A short method to write the facts, name the emotion, and step out of a mental loop.",
    },
    angle: {
      fr: "La rumination se nourrit du flou; l'écriture lui donne des bords.",
      en: "Rumination feeds on vagueness; writing gives it edges.",
    },
  }),
  makeGrowthTopic({
    slug: "journaling-for-overthinking",
    title: { fr: "Journaling pour l'overthinking", en: "Journaling for overthinking" },
    question: {
      fr: "Quel journaling utiliser quand tu penses trop ?",
      en: "What kind of journaling helps when you overthink?",
    },
    metaTitle: {
      fr: "Journaling pour overthinking: sortir du bruit mental",
      en: "Journaling for overthinking: leave mental noise",
    },
    metaDescription: {
      fr: "Des prompts simples pour transformer l'overthinking en faits, émotions et prochaines actions.",
      en: "Simple prompts to turn overthinking into facts, emotions, and next actions.",
    },
    angle: {
      fr: "Quand tu penses trop, tu n'as pas besoin de plus d'idées; tu as besoin d'un cadre.",
      en: "When you overthink, you do not need more ideas; you need a frame.",
    },
  }),
  makeGrowthTopic({
    slug: "journal-prompts-for-anxiety",
    title: { fr: "Prompts de journal pour l'anxiété", en: "Journal prompts for anxiety" },
    question: {
      fr: "Quels prompts utiliser quand l'anxiété prend trop de place ?",
      en: "Which journal prompts help when anxiety takes too much space?",
    },
    metaTitle: {
      fr: "Prompts de journal pour l'anxiété et la clarté",
      en: "Journal prompts for anxiety and clarity",
    },
    metaDescription: {
      fr: "Des prompts prudents et concrets pour poser une inquiétude sur la page sans l'amplifier.",
      en: "Careful, concrete prompts for placing worry on the page without amplifying it.",
    },
    angle: {
      fr: "Un prompt utile pour l'anxiété réduit la taille du problème au lieu de l'agrandir.",
      en: "A useful anxiety prompt reduces the size of the problem instead of enlarging it.",
    },
  }),
  makeGrowthTopic({
    slug: "private-diary-vs-notes-app",
    title: { fr: "Journal privé ou application de notes", en: "Private diary vs notes app" },
    question: {
      fr: "Faut-il écrire dans un journal privé ou dans une application de notes ?",
      en: "Should you write in a private diary or a notes app?",
    },
    metaTitle: {
      fr: "Journal privé vs application de notes: que choisir ?",
      en: "Private diary vs notes app: which should you choose?",
    },
    metaDescription: {
      fr: "Comparaison entre notes rapides et journal privé pour la réflexion, la confidentialité et les motifs récurrents.",
      en: "A comparison between quick notes and a private diary for reflection, privacy, and recurring patterns.",
    },
    angle: {
      fr: "Une application de notes capture vite; un journal privé aide à comprendre ce qui revient.",
      en: "A notes app captures quickly; a private diary helps you understand what keeps returning.",
    },
  }),
  makeGrowthTopic({
    slug: "rosebud-alternative",
    title: { fr: "Alternative privée à Rosebud", en: "Private Rosebud alternative" },
    question: {
      fr: "Quelle alternative privée à Rosebud choisir pour écrire et clarifier ce qui revient ?",
      en: "Which private Rosebud alternative helps you write and clarify recurring patterns?",
    },
    metaTitle: {
      fr: "Alternative à Rosebud: journal privé Aurum",
      en: "Rosebud alternative: private journal app Aurum",
    },
    metaDescription: {
      fr: "Une comparaison calme pour choisir une alternative privée à Rosebud centrée sur l'écriture et les reflets guidés.",
      en: "A calm comparison for choosing a private Rosebud alternative focused on writing and guided reflection.",
    },
    angle: {
      fr: "Une alternative à Rosebud doit être jugée sur la confiance, la qualité de réflexion et la continuité.",
      en: "A Rosebud alternative should be judged on trust, reflection quality, and continuity.",
    },
  }),
];

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
        "La charge mentale devient particulièrement lourde quand les tâches sont invisibles pour les autres. Tu ne portes pas seulement une liste d'actions; tu portes aussi la surveillance permanente de ce qui pourrait être oublié, mal fait, trop tardif ou reproché.",
        "L'écriture aide parce qu'elle transforme une masse diffuse en éléments séparés. Une fois sur la page, le rendez-vous, le message à envoyer, la tension familiale et la fatigue ne forment plus un seul bloc. Ils deviennent des lignes distinctes, donc des décisions distinctes.",
        "La clarté commence souvent par une distinction simple: ce qui est urgent, ce qui est important, ce qui appartient à quelqu'un d'autre, et ce qui ne peut pas être résolu aujourd'hui. Sans cette distinction, tout semble avoir le même poids.",
        "Une méthode utile doit aussi tenir compte de l'émotion. La charge mentale n'est pas qu'un problème d'organisation. Elle contient souvent de la peur de décevoir, de la colère d'être seul à anticiper, ou de la culpabilité quand tu poses une limite.",
        "Le but n'est pas de devenir parfaitement productif. Le but est de retrouver un peu de pouvoir de choix. Quand tu écris ce qui pèse, tu peux décider quoi porter maintenant, quoi planifier, quoi déléguer, et quoi laisser sans te juger immédiatement.",
      ],
      en: [
        "Mental load increases when your brain keeps tasks, expectations, emotions, and decisions open at the same time. Writing thoughts down helps move them out of permanent mental storage and frees attention.",
        "The issue is not just having too much to do. It is carrying obligations, feelings, reminders, guilt, and unfinished decisions in the same mental space.",
        "A useful method does not try to solve everything at once. It first makes the load visible, then restores order in a realistic way.",
        "Mental load becomes especially heavy when the tasks are invisible to other people. You are not only carrying a list of actions; you are also carrying constant monitoring of what could be forgotten, done badly, delayed, or criticized.",
        "Writing helps because it turns a diffuse mass into separate elements. Once on the page, the appointment, the message to send, the family tension, and the fatigue no longer form one block. They become distinct lines, which means distinct decisions.",
        "Clarity often starts with a simple distinction: what is urgent, what is important, what belongs to someone else, and what cannot be solved today. Without that distinction, everything feels equally heavy.",
        "A useful method must also include emotion. Mental load is not only an organization problem. It often contains fear of disappointing people, anger about being the only one who anticipates, or guilt when you set a boundary.",
        "The goal is not perfect productivity. The goal is recovering some choice. When you write what weighs on you, you can decide what to carry now, what to schedule, what to delegate, and what to leave without judging yourself immediately.",
      ],
    },
    practicalSteps: {
      fr: [
        "Fais un brain dump de 3 minutes sans corriger ni organiser.",
        "Relis et trie en trois colonnes: urgent, important, à laisser.",
        "Choisis une seule action utile pour aujourd'hui, même petite.",
        "Ajoute une quatrième colonne si nécessaire: à demander. Beaucoup de surcharge vient de tâches qui restent en toi parce qu'aucune demande claire n'a été formulée.",
        "Entoure les tâches qui contiennent une émotion forte. Une petite action peut prendre une place énorme si elle est liée à une peur, une tension ou une conversation évitée.",
        "Pour chaque ligne, note le prochain geste visible: envoyer un message, ouvrir un document, fixer une heure, supprimer une attente, ou dire non.",
        "Limite la page à cinq actions maximum pour aujourd'hui. Le reste peut exister sans devenir une obligation immédiate.",
        "Termine par une phrase de permission: \"Je n'ai pas besoin de tout porter pour être fiable.\"",
      ],
      en: [
        "Do a 3-minute brain dump without editing or organizing.",
        "Read it back and sort it into three columns: urgent, important, let go.",
        "Choose one useful action for today, even if it is small.",
        "Add a fourth column if needed: ask for help. A lot of overload stays inside you because no clear request has been made.",
        "Circle the tasks that carry a strong emotion. A small action can take up huge space if it is tied to fear, tension, or an avoided conversation.",
        "For each line, write the next visible move: send a message, open a document, set a time, remove an expectation, or say no.",
        "Limit the page to five actions for today. The rest can exist without becoming an immediate obligation.",
        "End with a permission sentence: \"I do not need to carry everything in order to be reliable.\"",
      ],
    },
    example: {
      fr: [
        "Exemple: \"Je pense à ce mail, au rendez-vous de demain, à la lessive, à cette conversation tendue et au fait que je n'avance sur rien.\"",
        "Après tri: urgent = répondre au mail; important = préparer le rendez-vous; à laisser = ruminer la conversation ce soir.",
        "Version plus complète: \"à demander = qui peut récupérer les courses ?\"; \"émotion forte = conversation tendue\"; \"prochain geste = écrire trois points pour le rendez-vous\".",
        "Prompt prêt à utiliser: \"Tout ce que je porte en ce moment... Ce qui est vraiment urgent... Ce qui est important mais pas immédiat... Ce qui ne m'appartient pas entièrement... Ce que je peux demander...\"",
        "Exemple de sortie réaliste: au lieu de \"régler ma vie\", tu obtiens \"répondre au mail avant 11h, préparer trois points, demander de l'aide pour les courses, laisser la conversation pour demain\".",
        "La page ne supprime pas toutes les obligations. Elle change leur forme. Ce qui était un nuage devient une carte simple, et une carte est plus facile à parcourir qu'un nuage.",
      ],
      en: [
        "Example: \"I keep thinking about that email, tomorrow's meeting, the laundry, that tense conversation, and the feeling that I am behind on everything.\"",
        "After sorting: urgent = reply to the email; important = prepare the meeting; let go = replaying the conversation tonight.",
        "More complete version: \"ask for help = who can pick up groceries?\"; \"strong emotion = tense conversation\"; \"next move = write three points for the meeting\".",
        "Prompt you can use: \"Everything I am carrying right now... What is truly urgent... What is important but not immediate... What does not fully belong to me... What I can ask for...\"",
        "Realistic output: instead of \"fix my life\", you get \"reply before 11 a.m., prepare three points, ask for help with groceries, leave the conversation for tomorrow\".",
        "The page does not remove every obligation. It changes their shape. What was a cloud becomes a simple map, and a map is easier to move through than a cloud.",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum te donne un espace privé pour déposer ce qui tourne en boucle sans pression de performance.",
        "La réflexion guidée t'aide ensuite à distinguer ce qui est urgent, ce qui est émotionnel, et ce qui peut attendre.",
        "Avec le temps, tu vois mieux les motifs qui alimentent ta surcharge mentale.",
        "Aurum peut repérer quand plusieurs pages parlent du même type de surcharge: tout anticiper, ne pas demander, dire oui trop vite, ou repousser tes propres besoins.",
        "Cette continuité transforme la charge mentale en données personnelles lisibles. Tu ne vois pas seulement une journée difficile; tu vois le mécanisme qui revient.",
        "L'espace privé compte ici, parce que la charge mentale contient parfois des pensées peu avouables: ressentiment, fatigue, envie de disparaître une heure, ou colère contre des attentes injustes.",
      ],
      en: [
        "Aurum gives you a private space to unload recurring thoughts without performance pressure.",
        "Guided reflection then helps you separate urgency, emotion, and what can wait.",
        "Over time, you can spot the patterns that keep feeding your overload.",
        "Aurum can notice when several pages describe the same kind of overload: anticipating everything, not asking for help, saying yes too quickly, or postponing your own needs.",
        "That continuity turns mental load into readable personal data. You do not only see a difficult day; you see the mechanism that keeps returning.",
        "The private space matters here because mental load can include thoughts that are hard to admit: resentment, exhaustion, wanting to disappear for an hour, or anger about unfair expectations.",
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
        "La première erreur consiste à débattre avec chaque pensée comme si elle exigeait une réponse immédiate. Plus tu argumentes intérieurement, plus la boucle reçoit d'attention. Une page courte change la relation au problème: tu ne cherches pas à gagner contre la pensée, tu la poses devant toi.",
        "La deuxième erreur consiste à confondre clarté et résolution. Certaines inquiétudes ne peuvent pas être résolues à 23h42. En revanche, elles peuvent être nommées. Nommer le fait, l'émotion et le besoin réduit la charge cognitive, parce que le cerveau n'a plus à garder tout le dossier ouvert.",
        "Une bonne page du soir reste concrète. Elle évite les grandes conclusions comme \"je rate tout\" ou \"rien ne va changer\". Elle revient aux matériaux vérifiables: ce qui s'est passé, ce que tu as interprété, ce que tu ressens, ce qui pourra réellement être traité demain.",
        "Ce type d'écriture fonctionne mieux quand il devient un rituel léger. Deux minutes suffisent si le format est stable. Tu peux écrire dans le même ordre chaque soir: faits, émotion, besoin, limite pour la nuit, prochaine action. Cette répétition apprend à ton esprit qu'il existe un endroit où déposer ce qui revient.",
        "L'objectif n'est pas de devenir parfaitement calme. L'objectif est de passer de la rumination sans bord à une phrase que tu peux relire. Une pensée écrite perd une partie de son pouvoir d'invasion, parce qu'elle cesse d'être partout à la fois.",
      ],
      en: [
        "Night overthinking often happens when something is still open: a conversation, a worry, a decision, or a tension you have not yet put into words.",
        "Physical tiredness does not automatically switch off mental loops. When the day finally slows down, whatever was postponed comes back and takes over.",
        "Night journaling does not need to be long or polished. A few honest lines are often enough to turn vague mental noise into something steadier and more visible.",
        "The first mistake is debating every thought as if it needs a complete answer right now. The more you argue internally, the more attention the loop receives. A short page changes your relationship to the problem: you are not trying to defeat the thought, you are placing it in front of you.",
        "The second mistake is confusing clarity with resolution. Some worries cannot be solved at 11:42 p.m. They can still be named. Naming the fact, the feeling, and the need reduces cognitive load because your mind no longer has to keep the whole file open.",
        "A useful night entry stays concrete. It avoids global conclusions like \"I ruin everything\" or \"nothing will change\". It returns to observable material: what happened, what you interpreted, what you feel, and what can realistically be handled tomorrow.",
        "This kind of writing works best as a light ritual. Two minutes can be enough if the format is stable. You can write in the same order each night: facts, emotion, need, boundary for tonight, next action. Repetition teaches your mind that there is a place to set down what keeps returning.",
        "The goal is not perfect calm. The goal is moving from borderless rumination to a sentence you can reread. A written thought loses some of its invasive power because it stops being everywhere at once.",
      ],
    },
    practicalSteps: {
      fr: [
        "Écris en trois lignes ce qui s'est passé concrètement.",
        "Ajoute l'émotion dominante: peur, colère, tristesse, honte, confusion, frustration.",
        "Termine par une seule phrase: ce dont j'ai besoin maintenant ou ce que je traiterai demain.",
        "Sépare les faits des scénarios. Les faits tiennent souvent en une ou deux phrases; les scénarios commencent par \"et si\" ou \"ils vont penser que\".",
        "Écris une limite pour la nuit: \"je n'ai pas besoin de résoudre cela maintenant\" ou \"je reprendrai cette question demain à 10h\".",
        "Choisis un geste de clôture: fermer l'ordinateur, préparer un verre d'eau, poser le téléphone hors du lit, ou noter le prochain pas sur une liste.",
        "Si la pensée revient, ne recommence pas tout le raisonnement. Relis simplement la phrase de clôture et rappelle-toi que le sujet a déjà une place.",
        "Le lendemain, regarde si la boucle contenait une action réelle, une peur, ou seulement un besoin de récupération.",
      ],
      en: [
        "Write three lines about what happened in concrete terms.",
        "Add the dominant emotion: fear, anger, sadness, shame, confusion, frustration.",
        "End with one sentence: what I need now or what I will handle tomorrow.",
        "Separate facts from scenarios. Facts usually fit in one or two sentences; scenarios often begin with \"what if\" or \"they will think that\".",
        "Write a boundary for the night: \"I do not need to solve this now\" or \"I will return to this tomorrow at 10 a.m.\"",
        "Choose a closing action: shut the laptop, prepare water, put the phone away from the bed, or write the next step on a list.",
        "If the thought returns, do not restart the whole argument. Reread the closing sentence and remind yourself that the topic already has a place.",
        "The next day, check whether the loop contained a real action, a fear, or simply a need for recovery.",
      ],
    },
    example: {
      fr: [
        "Exemple: \"Je repense à ce que j'ai dit pendant le dîner. J'ai peur d'avoir été maladroit. Ce soir, je n'ai pas besoin de résoudre la relation, juste de dormir et d'y revenir demain avec un esprit plus calme.\"",
        "Autre exemple: \"Le mail de demain me prend toute la place. Fait: je dois répondre avant midi. Émotion: peur d'être jugé. Besoin: préparer trois points, pas imaginer toutes les réactions possibles.\"",
        "Prompt prêt à utiliser: \"La pensée qui revient est... Le fait réel est... L'histoire que mon esprit ajoute est... Ce que je peux faire demain est... Ce que je peux laisser pour cette nuit est...\"",
        "Si ton esprit repart, écris une phrase courte: \"ce sujet est noté\". Cette phrase n'est pas magique, mais elle évite de traiter chaque retour de pensée comme une nouvelle urgence.",
      ],
      en: [
        "Example: \"I keep replaying what I said at dinner. I am afraid I came across badly. Tonight I do not need to solve the relationship. I just need sleep and I can come back to it tomorrow with a calmer mind.\"",
        "Another example: \"Tomorrow's email is taking up all the space. Fact: I need to answer before noon. Emotion: fear of being judged. Need: prepare three points, not imagine every possible reaction.\"",
        "Prompt you can use: \"The thought that keeps returning is... The real fact is... The story my mind adds is... What I can do tomorrow is... What I can leave for tonight is...\"",
        "If your mind starts again, write one short sentence: \"this topic is noted\". The sentence is not magic, but it prevents every returning thought from becoming a new emergency.",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum t'aide à écrire sans filtre dans un espace privé, sans exposition ni bruit social.",
        "Les questions guidées aident à passer du chaos mental à quelque chose de plus précis: ce que tu ressens, ce qui revient, ce dont tu as besoin.",
        "Au fil des pages, les mêmes thèmes du soir deviennent plus visibles au lieu de sembler nouveaux chaque nuit.",
        "Après une page, Aurum peut te renvoyer la structure de la boucle: le déclencheur, l'interprétation, l'émotion, puis le besoin qui cherche à être entendu.",
        "Cette continuité évite de recommencer à zéro. Si les mêmes inquiétudes reviennent chaque soir, elles deviennent un motif observable, pas seulement une impression vague.",
        "Aurum n'a pas besoin que tu écrives bien. Il a besoin que tu écrives assez honnêtement pour que les tensions réelles apparaissent dans tes propres mots.",
      ],
      en: [
        "Aurum helps you write without filtering in a private space, with no exposure and no social noise.",
        "Guided prompts help you move from mental chaos to something clearer: what you feel, what keeps returning, and what you need.",
        "Across entries, recurring nighttime themes become easier to see instead of feeling new every night.",
        "After a page, Aurum can reflect the shape of the loop: the trigger, the interpretation, the emotion, and the need that is trying to be heard.",
        "That continuity keeps you from starting over. If the same worries return every night, they become an observable pattern instead of a vague impression.",
        "Aurum does not need polished writing. It needs enough honesty for the real tensions to appear in your own words.",
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
        "Un prompt efficace fait deux choses à la fois: il ouvre assez d'espace pour que tu puisses répondre librement, et il garde un cadre assez clair pour éviter de repartir dans la confusion. C'est cette tension entre liberté et structure qui rend l'écriture utile.",
        "Pour retrouver de la clarté, commence rarement par \"pourquoi\". Cette question peut devenir trop vaste et alimenter la rumination. Commence plutôt par \"qu'est-ce qui s'est passé\", \"qu'est-ce que je ressens\", \"qu'est-ce qui revient\" et \"de quoi ai-je besoin maintenant\".",
        "Les prompts orientés clarté ne cherchent pas à produire une grande révélation à chaque page. Ils cherchent à rendre visible une petite différence: une émotion mieux nommée, une attente plus précise, une limite plus nette, ou une action plus simple.",
        "Les meilleurs résultats viennent souvent d'une série courte. Répondre à trois prompts pendant cinq minutes donne plus de matière qu'une seule question très profonde à laquelle tu n'arrives pas à répondre. Le but est de créer une entrée dans le sujet, pas d'écrire un essai parfait.",
        "Tu peux aussi utiliser les mêmes prompts plusieurs jours de suite. La répétition révèle ce qui change et ce qui ne change pas. Quand la même phrase revient, ce n'est pas un échec: c'est souvent un signal que le motif mérite d'être regardé plus clairement.",
      ],
      en: [
        "Many prompts stay too abstract for moments when your mind feels overloaded. When you are overwhelmed, you need simple questions that create movement, not vague phrasing.",
        "The most useful prompts reduce mental fog by directing attention toward concrete elements: what happened, what keeps returning, what feels heavy, and what might help now.",
        "A good prompt is not just interesting. It should be specific enough to produce a useful insight within a few minutes.",
        "An effective prompt does two things at once: it gives you enough space to answer freely, and it keeps enough structure to prevent you from drifting back into confusion. That balance between freedom and form is what makes the writing useful.",
        "For mental clarity, do not always begin with \"why\". That question can become too wide and feed rumination. Begin instead with \"what happened\", \"what do I feel\", \"what keeps returning\", and \"what do I need now\".",
        "Clarity prompts are not meant to produce a major revelation on every page. They are meant to reveal a small difference: a better-named emotion, a more precise expectation, a clearer boundary, or a simpler action.",
        "The best results often come from a short sequence. Answering three prompts for five minutes usually gives more material than one very deep question you cannot enter. The aim is to create a doorway into the subject, not to write a perfect essay.",
        "You can also use the same prompts several days in a row. Repetition shows what changes and what does not. When the same sentence returns, that is not a failure; it is often a signal that the pattern deserves clearer attention.",
      ],
    },
    practicalSteps: {
      fr: [
        "Quand tu te sens submergé: \"Qu'est-ce qui occupe le plus d'espace dans ma tête en ce moment ?\"",
        "Quand une conversation tourne en boucle: \"Qu'est-ce qui m'a touché exactement, au-delà des faits ?\"",
        "Quand tu hésites sur une décision: \"Qu'est-ce qui m'aligne, et qu'est-ce qui me compromet ?\"",
        "Quand un motif revient: \"Dans quelles trois situations récentes ai-je ressenti la même tension ?\"",
        "Quand tu veux passer à l'action: \"Quel est le prochain pas le plus simple et le plus honnête ?\"",
        "Quand tu te critiques: \"Quelle phrase dure est-ce que je me répète, et quelle version plus juste puis-je écrire ?\"",
        "Quand tu ressens une pression floue: \"Quelle attente est réellement la mienne, et laquelle vient de quelqu'un d'autre ?\"",
        "Quand tu veux comprendre une émotion: \"Si cette émotion avait une demande concrète, quelle serait-elle ?\"",
        "Quand tu te sens dispersé: \"Qu'est-ce qui mérite mon attention aujourd'hui, et qu'est-ce qui peut attendre sans dommage réel ?\"",
        "Quand tu veux fermer la journée: \"Qu'est-ce que je peux déposer ici pour ne pas le porter dans mon sommeil ?\"",
      ],
      en: [
        "When you feel overwhelmed: \"What is taking up the most space in my mind right now?\"",
        "When a conversation keeps replaying: \"What touched me most here, beyond the facts?\"",
        "When you are stuck on a decision: \"What aligns me, and what compromises me?\"",
        "When a pattern keeps returning: \"In which three recent situations did I feel the same tension?\"",
        "When you want to move forward: \"What is the simplest honest next step?\"",
        "When you are criticizing yourself: \"What harsh sentence do I keep repeating, and what would be a fairer version?\"",
        "When pressure feels vague: \"Which expectation is truly mine, and which one belongs to someone else?\"",
        "When you want to understand an emotion: \"If this emotion had one concrete request, what would it be?\"",
        "When you feel scattered: \"What deserves my attention today, and what can wait without real damage?\"",
        "When you want to close the day: \"What can I place here so I do not carry it into sleep?\"",
      ],
    },
    example: {
      fr: [
        "Mini exemple: prompt = \"Qu'est-ce qui occupe le plus d'espace dans ma tête ?\" Réponse = \"Ce n'est pas le travail en général. C'est surtout cette attente de réponse et la peur d'être jugé.\"",
        "Séquence de 5 minutes: 1) ce qui occupe mon esprit, 2) l'émotion principale, 3) le besoin caché, 4) le prochain pas. Réponse possible: \"Je pense au projet, mais le besoin caché est d'avoir une validation claire avant d'avancer.\"",
        "Séquence pour une décision: \"ce que je gagne\", \"ce que je perds\", \"ce que j'évite de regarder\", \"ce que je choisirais si je n'essayais pas de plaire\". Cette structure rend la tension plus visible.",
        "Séquence pour une conversation difficile: \"les faits\", \"ce que j'ai imaginé\", \"ce que j'aurais voulu dire\", \"ce que je peux dire maintenant\". Elle distingue la scène réelle du film intérieur.",
        "Prompts à garder sous la main: \"Qu'est-ce qui revient ?\", \"Qu'est-ce que je protège ?\", \"Qu'est-ce que je n'ose pas demander ?\", \"Quelle limite rendrait la situation plus respirable ?\"",
      ],
      en: [
        "Mini example: prompt = \"What is taking up the most space in my mind?\" Answer = \"It is not work in general. It is mostly that unanswered message and the fear of being judged.\"",
        "Five-minute sequence: 1) what is occupying my mind, 2) the main emotion, 3) the hidden need, 4) the next step. Possible answer: \"I am thinking about the project, but the hidden need is clear validation before I move forward.\"",
        "Decision sequence: \"what I gain\", \"what I lose\", \"what I am avoiding\", \"what I would choose if I were not trying to please\". This structure makes the tension easier to see.",
        "Difficult conversation sequence: \"the facts\", \"what I imagined\", \"what I wish I had said\", \"what I can say now\". It separates the real scene from the inner movie.",
        "Prompts to keep close: \"What keeps returning?\", \"What am I protecting?\", \"What am I afraid to ask for?\", \"What boundary would make this situation more breathable?\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum te donne un cadre privé pour utiliser ces prompts sans te censurer.",
        "Après l'écriture, la réflexion guidée aide à repérer les thèmes récurrents et à aller au-delà d'un simple brain dump.",
        "Cela transforme une série de réponses isolées en continuité réflexive sur plusieurs jours.",
        "Aurum garde le contexte de tes pages, ce qui rend les prompts plus utiles dans le temps: une réponse d'aujourd'hui peut éclairer une tension déjà vue la semaine dernière.",
        "Tu peux commencer par une question très simple et laisser la réflexion faire apparaître ce qui se répète: une peur d'être jugé, une difficulté à poser une limite, ou une tendance à tout porter seul.",
        "L'intérêt n'est pas d'accumuler des réponses. L'intérêt est de construire une trace privée de ce qui devient plus clair, page après page.",
      ],
      en: [
        "Aurum gives you a private space to use these prompts without self-censorship.",
        "After writing, guided reflection helps surface recurring themes and goes beyond a simple brain dump.",
        "This turns isolated answers into a more continuous reflective practice across days.",
        "Aurum keeps the context of your pages, which makes prompts more useful over time: an answer today can clarify a tension already visible last week.",
        "You can begin with a very simple question and let the reflection reveal what repeats: fear of being judged, difficulty setting a boundary, or a habit of carrying everything alone.",
        "The point is not collecting answers. The point is building a private trace of what becomes clearer, page after page.",
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
  ...growthTopics,
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
