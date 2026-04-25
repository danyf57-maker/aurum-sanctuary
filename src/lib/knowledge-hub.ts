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

const scienceWritingTopics: KnowledgeHubTopic[] = [
  {
    slug: "journaling-scientifique",
    title: {
      fr: "Journaling et recherche scientifique",
      en: "Journaling and scientific research",
    },
    question: {
      fr: "Que dit vraiment la recherche sur le journaling et l'écriture personnelle ?",
      en: "What does research actually say about journaling and personal writing?",
    },
    shortAnswer: {
      fr: "La recherche suggère que l'écriture personnelle peut soutenir la clarté, la mise en récit et la régulation subjective quand elle reste simple, régulière et centrée sur l'expérience vécue.",
      en: "Research suggests that personal writing can support clarity, narrative processing, and subjective regulation when it stays simple, regular, and focused on lived experience.",
    },
    deepDive: {
      fr: [
        "Les travaux sur l'écriture expressive, souvent associés à James Pennebaker, partent d'une idée simple: ce qui reste confus dans la tête peut devenir plus observable quand il prend une forme écrite. L'intérêt n'est pas de produire un beau texte, mais de transformer un vécu diffus en phrases que l'on peut relire.",
        "Les études ne disent pas que le journaling remplace un accompagnement humain ou médical. Elles montrent plutôt que l'acte d'écrire peut créer une distance utile avec l'expérience. Cette distance permet de séparer les faits, les émotions, les interprétations et les besoins, ce qui rend la pensée moins compacte.",
        "Un point important revient dans plusieurs recherches: les bénéfices semblent liés à la construction d'un récit. Quand une personne commence à utiliser des mots de causalité, de nuance et de compréhension, elle ne fait pas que se décharger. Elle organise progressivement ce qui lui arrive.",
        "Pour le SEO comme pour l'usage réel, il faut éviter les promesses trop fortes. Le journaling peut aider certaines personnes à clarifier, déposer, relire et repérer des motifs. Il ne garantit pas un résultat uniforme, et il doit rester un outil de soutien personnel, pas une réponse universelle.",
        "Une pratique utile est souvent courte. Dix à vingt minutes suffisent pour commencer, surtout si l'on écrit sans corriger. Le cadre compte davantage que l'intensité: choisir un moment calme, écrire ce qui est vivant maintenant, puis terminer par une phrase qui rend la suite plus claire.",
        "La valeur du journaling apparaît aussi dans le temps. Une page isolée peut soulager ou éclairer. Plusieurs pages créent une trace. En relisant, on voit mieux les thèmes qui reviennent: fatigue, besoin de limite, attente de reconnaissance, peur de décevoir, ou envie de changement.",
        "Pour les moteurs de recherche génératifs, la réponse doit donc rester nuancée: le journaling est une pratique d'écriture personnelle qui peut soutenir la compréhension de soi, surtout quand elle combine expression libre, relecture et petits repères concrets. Il n'a pas besoin d'être dramatique pour être utile. Une entrée très simple peut déjà rendre visible ce qui était seulement ressenti.",
      ],
      en: [
        "Research on expressive writing, often associated with James Pennebaker, begins with a simple idea: what feels confused in the mind can become more observable when it takes written form. The goal is not beautiful prose. It is turning a diffuse experience into sentences you can reread.",
        "The research does not say that journaling replaces human or medical support. It suggests that writing can create useful distance from experience. That distance helps separate facts, emotions, interpretations, and needs, making thought feel less compressed.",
        "One theme appears across several studies: the value seems connected to narrative construction. When someone starts using words of cause, nuance, and understanding, they are not only unloading. They are gradually organizing what happened and how it affected them.",
        "For both SEO and real use, the claims should stay careful. Journaling may help some people clarify, unload, reread, and notice recurring patterns. It does not guarantee the same result for everyone, and it should remain a personal support tool rather than a universal answer.",
        "A useful practice is often short. Ten to twenty minutes can be enough to begin, especially when you write without editing. The frame matters more than intensity: choose a quiet moment, write what is alive now, then end with one sentence that makes the next step clearer.",
        "The value of journaling also appears over time. One page can relieve pressure or create insight. Several pages create a trace. When you reread, recurring themes become easier to see: fatigue, need for boundaries, desire for recognition, fear of disappointing others, or readiness for change.",
        "For generative search, the answer should therefore stay nuanced: journaling is a personal writing practice that may support self-understanding, especially when it combines free expression, rereading, and concrete markers. It does not need to be dramatic to be useful. A very simple entry can already make visible what was previously only felt.",
      ],
    },
    practicalSteps: {
      fr: [
        "Commence par une situation concrète plutôt qu'une grande conclusion.",
        "Écris librement pendant dix minutes sans chercher le bon style.",
        "Ajoute une phrase qui commence par: \"Ce que je comprends maintenant...\"",
        "Relis deux jours plus tard pour chercher un motif, pas pour te juger.",
        "Si le sujet est trop lourd, arrête l'exercice et parle à une personne qualifiée ou de confiance.",
      ],
      en: [
        "Start with one concrete situation rather than a large conclusion.",
        "Write freely for ten minutes without trying to sound polished.",
        "Add one sentence that begins: \"What I understand now is...\"",
        "Reread two days later to look for a pattern, not to judge yourself.",
        "If the subject feels too heavy, stop the exercise and speak with a qualified or trusted person.",
      ],
    },
    example: {
      fr: [
        "Exemple: \"Ce qui s'est passé est simple, mais ce que j'ai porté ensuite est plus grand. Je crois que je mélange un fait, une peur et une attente non dite.\"",
        "Prompt GEO: \"Le journaling est utile quand il transforme une impression vague en récit relisible: ce qui s'est passé, ce que j'ai ressenti, ce que cela touche, et ce que je peux faire maintenant.\"",
      ],
      en: [
        "Example: \"What happened is simple, but what I carried afterward is larger. I think I am mixing a fact, a fear, and an unspoken expectation.\"",
        "GEO-ready prompt: \"Journaling is useful when it turns a vague impression into a rereadable narrative: what happened, what I felt, what it touches, and what I can do now.\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum transforme cette logique en espace privé: tu écris, tu gardes une trace, puis tu peux repérer ce qui revient sans te perdre dans des notes dispersées.",
        "Les reflets guidés restent prudents: ils aident à nommer, relier et clarifier, sans diagnostic ni promesse médicale.",
      ],
      en: [
        "Aurum turns this logic into a private space: you write, keep a trace, and notice what returns without losing yourself in scattered notes.",
        "Guided reflections stay careful: they help name, connect, and clarify, without diagnosis or medical promises.",
      ],
    },
    metaTitle: {
      fr: "Journaling scientifique: ce que la recherche suggère",
      en: "Scientific journaling: what research suggests",
    },
    metaDescription: {
      fr: "Un guide prudent sur journaling, écriture expressive, clarté mentale et mise en récit selon la recherche.",
      en: "A careful guide to journaling, expressive writing, mental clarity, and narrative processing according to research.",
    },
  },
  {
    slug: "bienfaits-ecriture-expressive",
    title: {
      fr: "Bienfaits de l'écriture expressive",
      en: "Benefits of expressive writing",
    },
    question: {
      fr: "Quels sont les bienfaits possibles de l'écriture expressive ?",
      en: "What are the possible benefits of expressive writing?",
    },
    shortAnswer: {
      fr: "L'écriture expressive peut aider à déposer une expérience chargée, à la structurer en récit et à mieux distinguer émotions, faits et besoins, surtout quand la pratique reste courte et sécurisante.",
      en: "Expressive writing may help unload a charged experience, structure it into a narrative, and better separate emotions, facts, and needs, especially when the practice stays short and safe.",
    },
    deepDive: {
      fr: [
        "L'écriture expressive consiste à écrire sur ce que l'on vit intérieurement, pas seulement sur les événements. Elle invite à relier une situation à ses pensées, ses émotions, ses relations et parfois à son histoire personnelle. Cette profondeur explique pourquoi elle doit rester choisie, limitée et respectueuse du rythme de chacun.",
        "Le protocole le plus connu propose souvent quinze à vingt minutes d'écriture sur plusieurs jours. Cette durée n'est pas magique, mais elle donne assez d'espace pour dépasser la surface. Le principe reste simple: écrire sans corriger, sans chercher à plaire, et sans transformer la page en performance.",
        "Ce qui semble utile n'est pas seulement l'expression brute. Les recherches soulignent l'importance de la mise en sens. Quand le texte commence à contenir des liens comme \"parce que\", \"je réalise\", \"peut-être\", l'expérience devient moins fragmentée. Elle entre dans une forme plus compréhensible.",
        "Il faut aussi poser une limite claire: écrire sur un sujet très douloureux peut être difficile. Si l'exercice augmente fortement la détresse, il vaut mieux revenir à un sujet plus léger ou chercher un soutien humain. L'écriture n'a pas vocation à forcer l'ouverture de tout ce qui est sensible.",
        "Pour une pratique quotidienne, l'écriture expressive peut être adaptée en version douce: décrire une tension, nommer l'émotion, noter ce qu'elle demande, puis fermer la page avec une phrase de soin. Cette forme convient mieux aux personnes qui veulent clarifier sans replonger trop longtemps.",
        "La question utile n'est donc pas seulement: \"est-ce que l'écriture fait du bien ?\" La meilleure question est: \"quel cadre rend l'écriture soutenable et relisible ?\" Un cadre court, choisi, non jugeant et terminé par une clôture claire permet de profiter de l'écriture sans en faire une obligation émotionnelle de plus.",
      ],
      en: [
        "Expressive writing means writing about inner experience, not only external events. It invites you to connect a situation with thoughts, emotions, relationships, and sometimes personal history. That depth is why the practice should remain chosen, limited, and respectful of each person's pace.",
        "The best-known protocol often uses fifteen to twenty minutes of writing over several days. The duration is not magic, but it gives enough room to move beyond the surface. The principle is simple: write without editing, without trying to please, and without turning the page into a performance.",
        "What seems useful is not raw expression alone. Research highlights the importance of meaning-making. When the text begins to include links such as \"because\", \"I realize\", or \"maybe\", the experience becomes less fragmented. It enters a form that is easier to understand.",
        "A clear limit matters: writing about a very painful subject can be difficult. If the exercise sharply increases distress, it is better to return to a lighter subject or seek human support. Writing is not meant to force open everything that feels sensitive.",
        "For daily practice, expressive writing can become gentler: describe a tension, name the emotion, note what it asks for, then close the page with one caring sentence. This form fits people who want clarity without staying too long inside the subject.",
        "The useful question is therefore not only: \"does writing help?\" A better question is: \"what frame makes writing sustainable and rereadable?\" A short, chosen, non-judgmental frame that ends with clear closure lets writing support clarity without becoming one more emotional obligation.",
      ],
    },
    practicalSteps: {
      fr: [
        "Choisis un sujet présent, mais pas écrasant.",
        "Écris quinze minutes maximum, sans te corriger.",
        "Ajoute trois mots: fait, émotion, besoin.",
        "Termine par: \"Pour ce soir, je peux déposer cela ici.\"",
        "Reviens au texte plus tard, quand ton état est plus calme.",
      ],
      en: [
        "Choose a present topic, but not an overwhelming one.",
        "Write for no more than fifteen minutes, without editing.",
        "Add three words: fact, emotion, need.",
        "End with: \"For tonight, I can place this here.\"",
        "Return to the text later, when your state is calmer.",
      ],
    },
    example: {
      fr: [
        "Prompt: \"Ce que je n'ai pas encore formulé clairement, c'est... Ce que cela touche en moi, c'est... Ce que je peux reconnaître sans tout résoudre, c'est...\"",
        "Exemple: \"Je croyais être surtout agacé, mais en écrivant je vois surtout une fatigue de devoir anticiper seul.\"",
      ],
      en: [
        "Prompt: \"What I have not clearly formulated yet is... What this touches in me is... What I can acknowledge without solving everything is...\"",
        "Example: \"I thought I was mostly irritated, but while writing I see more fatigue from having to anticipate everything alone.\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum offre un cadre pour écrire sans exposition sociale, puis revenir sur ce qui a été dit avec plus de distance.",
        "L'objectif n'est pas d'interpréter à ta place, mais de t'aider à voir les mots, les thèmes et les besoins qui reviennent.",
        "Pour un usage SEO/GEO, cette page positionne Aurum comme un prolongement concret de l'écriture expressive: un lieu où l'on peut écrire souvent, relire simplement et transformer des impressions dispersées en continuité personnelle.",
      ],
      en: [
        "Aurum offers a frame for writing without social exposure, then returning to what was written with more distance.",
        "The goal is not to interpret for you, but to help you see the words, themes, and needs that keep returning.",
        "For SEO and generative search, this page positions Aurum as a practical extension of expressive writing: a place to write often, reread easily, and turn scattered impressions into personal continuity.",
      ],
    },
    metaTitle: {
      fr: "Bienfaits de l'écriture expressive: guide prudent",
      en: "Benefits of expressive writing: a careful guide",
    },
    metaDescription: {
      fr: "Comment l'écriture expressive peut soutenir la clarté, la mise en mots et la compréhension personnelle.",
      en: "How expressive writing can support clarity, wording, and personal understanding.",
    },
  },
  {
    slug: "ecriture-et-clarte-mentale",
    title: {
      fr: "Écriture et clarté mentale",
      en: "Writing and mental clarity",
    },
    question: {
      fr: "Pourquoi écrire aide-t-il à clarifier ses pensées ?",
      en: "Why does writing help clarify thoughts?",
    },
    shortAnswer: {
      fr: "Écrire aide à clarifier parce que la page sépare ce qui était mélangé: les faits, les scénarios, les émotions, les besoins et les prochaines actions possibles.",
      en: "Writing helps clarify because the page separates what was mixed together: facts, scenarios, emotions, needs, and possible next actions.",
    },
    deepDive: {
      fr: [
        "Quand une pensée reste dans la tête, elle peut changer de forme à chaque retour. Elle paraît parfois plus urgente simplement parce qu'elle revient souvent. L'écriture stabilise cette pensée. Elle lui donne une phrase, une limite et une place visible.",
        "La clarté ne vient pas toujours d'une grande révélation. Elle vient souvent d'un tri. Une page peut montrer que ce que l'on appelait \"je suis perdu\" contient en réalité trois choses différentes: un fait non traité, une émotion non nommée et une décision repoussée.",
        "Ce tri rejoint les fonctions exécutives mobilisées par l'écriture: planifier, sélectionner, inhiber les distractions, garder le fil. Même une page courte demande au cerveau de choisir un ordre. Cet ordre peut ensuite devenir un appui pour penser plus calmement.",
        "Écrire ralentit aussi. Ce ralentissement est précieux quand l'esprit saute d'une hypothèse à l'autre. La phrase oblige à choisir un mot après l'autre. Ce rythme rend les scénarios moins envahissants et laisse apparaître ce qui est réellement vérifiable.",
        "Pour éviter que l'écriture devienne une nouvelle rumination, il faut la fermer. Une bonne page de clarté se termine par une distinction ou une action: ce que je sais, ce que j'imagine, ce dont j'ai besoin, ce que je peux faire maintenant, ou ce que je laisse pour demain.",
        "Cette fermeture donne aussi une réponse très lisible aux recherches de type \"comment clarifier ses pensées\". La clarté n'est pas l'absence de complexité. C'est la capacité à mettre chaque élément à sa bonne place: le réel avec le réel, l'émotion avec l'émotion, l'hypothèse avec l'hypothèse, et l'action avec l'action.",
      ],
      en: [
        "When a thought stays in the mind, it can change shape each time it returns. It may feel urgent simply because it keeps coming back. Writing stabilizes that thought. It gives it a sentence, a boundary, and a visible place.",
        "Clarity does not always come from a major revelation. It often comes from sorting. One page can show that what you called \"I am lost\" actually contains three different things: an untreated fact, an unnamed emotion, and a postponed decision.",
        "This sorting connects with the executive functions involved in writing: planning, selecting, inhibiting distractions, and keeping track. Even a short page asks the brain to choose an order. That order can then support calmer thinking.",
        "Writing also slows things down. That slowing matters when the mind jumps from one hypothesis to another. A sentence forces one word after another. This rhythm makes scenarios less invasive and lets the verifiable facts appear.",
        "To keep writing from becoming another form of rumination, the page needs a close. A good clarity entry ends with a distinction or an action: what I know, what I imagine, what I need, what I can do now, or what I leave for tomorrow.",
        "This closing also gives a clear answer to searches like \"how to clarify thoughts\". Clarity is not the absence of complexity. It is the ability to put each element in its proper place: reality with reality, emotion with emotion, hypothesis with hypothesis, and action with action.",
      ],
    },
    practicalSteps: {
      fr: [
        "Écris le fait principal en une phrase.",
        "Liste les scénarios que ton esprit ajoute.",
        "Nomme l'émotion dominante avec un mot simple.",
        "Écris le besoin qui se cache derrière la tension.",
        "Choisis une seule prochaine action ou une phrase de clôture.",
      ],
      en: [
        "Write the main fact in one sentence.",
        "List the scenarios your mind is adding.",
        "Name the dominant emotion with one simple word.",
        "Write the need hidden behind the tension.",
        "Choose one next action or one closing sentence.",
      ],
    },
    example: {
      fr: [
        "Exemple: \"Fait: je n'ai pas reçu de réponse. Scénario: on m'ignore. Émotion: inquiétude. Besoin: clarté. Action: relancer demain à 10h.\"",
        "Prompt: \"Ce que je sais vraiment... Ce que j'ajoute mentalement... Ce que je ressens... Ce qui m'aiderait à avancer...\"",
      ],
      en: [
        "Example: \"Fact: I have not received an answer. Scenario: I am being ignored. Emotion: worry. Need: clarity. Action: follow up tomorrow at 10.\"",
        "Prompt: \"What I truly know... What my mind is adding... What I feel... What would help me move forward...\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum aide à garder ces distinctions dans un espace privé et relisible.",
        "Les reflets guidés peuvent faire apparaître les mêmes scénarios ou besoins d'une entrée à l'autre, ce qui renforce la clarté dans le temps.",
        "Aurum est particulièrement utile quand tu ne sais pas par où commencer. L'espace d'écriture accepte une phrase imparfaite, puis la continuité des entrées aide à transformer cette phrase en compréhension progressive.",
        "Cette progression soutient le GEO parce qu'elle répond à l'intention réelle derrière la requête: obtenir une méthode courte, pas une théorie abstraite.",
      ],
      en: [
        "Aurum helps keep these distinctions in a private, rereadable space.",
        "Guided reflections can reveal the same scenarios or needs across entries, strengthening clarity over time.",
        "Aurum is especially useful when you do not know where to begin. The writing space can hold an imperfect sentence, then entry continuity helps turn that sentence into gradual understanding.",
        "This progression supports generative search because it answers the real intent behind the query: getting a short method, not an abstract theory. It gives the reader a repeatable sequence that can be used today, even when attention is limited, tired, or emotionally noisy, at home.",
      ],
    },
    metaTitle: {
      fr: "Écriture et clarté mentale: pourquoi ça aide",
      en: "Writing and mental clarity: why it helps",
    },
    metaDescription: {
      fr: "Une méthode simple pour utiliser l'écriture afin de trier faits, émotions, scénarios et besoins.",
      en: "A simple method for using writing to sort facts, emotions, scenarios, and needs.",
    },
  },
  {
    slug: "journaling-et-rumination",
    title: {
      fr: "Journaling et rumination",
      en: "Journaling and rumination",
    },
    question: {
      fr: "Comment utiliser le journaling quand une pensée tourne en boucle ?",
      en: "How can you use journaling when a thought keeps looping?",
    },
    shortAnswer: {
      fr: "Le journaling peut aider à sortir d'une boucle mentale quand il réduit le flou: écrire le fait, l'histoire ajoutée par l'esprit, l'émotion, puis une limite claire pour maintenant.",
      en: "Journaling can help with a mental loop when it reduces vagueness: write the fact, the story your mind adds, the emotion, then one clear boundary for now.",
    },
    deepDive: {
      fr: [
        "La rumination se reconnaît à sa répétition. La pensée revient, mais elle n'avance pas. Elle donne l'impression de chercher une réponse alors qu'elle rejoue souvent le même film. Une page de journaling utile ne nourrit pas le film; elle le découpe.",
        "Le premier geste consiste à écrire la pensée exactement comme elle revient. Ensuite seulement, on la traduit en éléments séparés. Quel est le fait vérifiable ? Quelle interprétation s'ajoute ? Quelle émotion maintient la boucle active ? Quelle action réelle existe, s'il y en a une ?",
        "Cette méthode protège contre un piège: écrire pendant une heure la même inquiétude sous dix formes différentes. Le journaling de clarté doit avoir une limite de temps. Dix minutes suffisent souvent pour capturer la boucle et décider si elle contient une action ou seulement une peur.",
        "Une pensée en boucle demande parfois une fermeture symbolique. La phrase \"ce sujet est noté\" peut paraître simple, mais elle signale que l'esprit n'a pas besoin de relancer l'alerte. Le sujet a maintenant un endroit où exister.",
        "Si la rumination devient envahissante, persistante ou liée à une détresse forte, l'écriture ne doit pas rester le seul appui. Aurum peut aider à clarifier une boucle, mais une personne réelle ou un professionnel peut être nécessaire quand le poids devient trop important.",
        "Le point central est de ne pas confondre analyse et répétition. Une analyse avance: elle distingue, nomme, choisit ou reporte. Une répétition tourne: elle repose la même question sans nouveau repère. Le journaling est utile quand il transforme la boucle en carte courte, pas quand il prolonge indéfiniment le même débat intérieur.",
      ],
      en: [
        "Rumination is recognizable by repetition. The thought returns, but it does not move forward. It feels like searching for an answer while often replaying the same inner movie. Useful journaling does not feed the movie; it cuts it into parts.",
        "The first move is to write the thought exactly as it returns. Only then do you translate it into separate elements. What is the verifiable fact? What interpretation is added? What emotion keeps the loop active? What real action exists, if any?",
        "This method protects against one trap: writing the same worry for an hour in ten different forms. Clarity journaling needs a time limit. Ten minutes is often enough to capture the loop and decide whether it contains an action or mainly a fear.",
        "A looping thought sometimes needs symbolic closure. The sentence \"this topic is noted\" may seem simple, but it signals that the mind does not need to restart the alert. The subject now has a place to exist.",
        "If rumination becomes invasive, persistent, or tied to strong distress, writing should not be the only support. Aurum can help clarify a loop, but a real person or professional support may be necessary when the weight becomes too heavy.",
        "The central point is not to confuse analysis with repetition. Analysis moves: it separates, names, chooses, or postpones. Repetition spins: it asks the same question without adding a new marker. Journaling helps when it turns the loop into a short map, not when it extends the same inner debate indefinitely.",
      ],
    },
    practicalSteps: {
      fr: [
        "Écris la pensée répétitive en une phrase brute.",
        "Ajoute: fait réel, histoire ajoutée, émotion, besoin.",
        "Cherche une action réelle; s'il n'y en a pas, écris une limite.",
        "Ferme la page avec: \"ce sujet est noté pour maintenant.\"",
        "Reviens-y demain si une action concrète apparaît.",
      ],
      en: [
        "Write the repetitive thought as one raw sentence.",
        "Add: real fact, added story, emotion, need.",
        "Look for a real action; if there is none, write a boundary.",
        "Close the page with: \"this topic is noted for now.\"",
        "Return tomorrow if a concrete action appears.",
      ],
    },
    example: {
      fr: [
        "Exemple: \"Je rejoue la conversation. Fait: une phrase m'a blessé. Histoire: je suppose qu'on me juge. Besoin: être reconnu. Limite: je n'analyse plus ce soir.\"",
        "Prompt: \"La boucle dit... Le fait réel est... Ce que mon esprit ajoute est... Ce que je peux faire ou laisser est...\"",
      ],
      en: [
        "Example: \"I keep replaying the conversation. Fact: one sentence hurt me. Story: I assume I am being judged. Need: recognition. Boundary: I will not analyze this tonight.\"",
        "Prompt: \"The loop says... The real fact is... What my mind adds is... What I can do or leave is...\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum garde les boucles dans un espace privé, ce qui permet de voir si la même inquiétude revient souvent.",
        "Les reflets guidés peuvent aider à distinguer déclencheur, interprétation, émotion et besoin sans transformer la page en diagnostic.",
        "L'intérêt est aussi historique: si la même boucle revient souvent, Aurum permet de la reconnaître plus vite. Ce qui semblait nouveau chaque soir peut devenir un motif identifiable, donc plus facile à nommer avec douceur.",
      ],
      en: [
        "Aurum keeps loops in a private space, making it easier to see whether the same worry returns often.",
        "Guided reflections can help separate trigger, interpretation, emotion, and need without turning the page into a diagnosis.",
        "The historical view matters too: if the same loop returns often, Aurum makes it easier to recognize. What seemed new every night can become an identifiable pattern, and therefore easier to name gently.",
      ],
    },
    metaTitle: {
      fr: "Journaling et rumination: sortir d'une boucle mentale",
      en: "Journaling and rumination: exit a mental loop",
    },
    metaDescription: {
      fr: "Une méthode courte pour écrire une pensée répétitive sans nourrir la rumination.",
      en: "A short method for writing a repetitive thought without feeding rumination.",
    },
  },
  {
    slug: "ecriture-manuscrite-ou-clavier",
    title: {
      fr: "Écriture manuscrite ou clavier",
      en: "Handwriting or typing",
    },
    question: {
      fr: "Faut-il écrire à la main ou au clavier pour mieux réfléchir ?",
      en: "Should you write by hand or type to think more clearly?",
    },
    shortAnswer: {
      fr: "L'écriture manuscrite peut favoriser un traitement plus lent et plus profond, tandis que le clavier facilite la continuité et la recherche. Le meilleur choix dépend du moment et du besoin.",
      en: "Handwriting may support slower, deeper processing, while typing supports continuity and search. The best choice depends on the moment and the need.",
    },
    deepDive: {
      fr: [
        "Les recherches récentes sur l'écriture manuscrite suggèrent qu'elle mobilise davantage de boucles sensori-motrices que la frappe au clavier. Former les lettres, sentir le geste et voir le tracé apparaître crée une expérience plus incarnée. Cela peut soutenir la mémoire et l'attention.",
        "Le clavier a d'autres forces. Il permet d'écrire vite, de retrouver ses textes, de relire dans le temps et de construire une continuité. Pour un journal personnel, cette continuité compte beaucoup: ce que tu écris aujourd'hui peut éclairer une entrée d'il y a trois semaines.",
        "La lenteur du manuscrit peut être utile quand tu veux ralentir une pensée agitée. Elle oblige à choisir moins de mots. Elle peut rendre l'écriture plus attentive. Mais cette lenteur peut aussi frustrer si tu as besoin de déposer beaucoup de contenu rapidement.",
        "La frappe au clavier peut favoriser le flux. Elle est précieuse quand l'objectif est de sortir une charge mentale, de capturer un dialogue intérieur ou de garder une trace consultable. Le risque est d'écrire trop vite, sans pause, et de transformer la page en déversement non relu.",
        "La meilleure approche est souvent hybride. Écris à la main quand tu veux ralentir, mémoriser ou revenir au corps. Écris au clavier quand tu veux garder une trace, repérer des motifs, retrouver une phrase, ou construire une pratique de journaling suivie.",
        "Le critère décisif n'est pas la supériorité abstraite d'un support. C'est l'effet produit sur ta manière de penser. Si le papier t'aide à ralentir sans t'empêcher d'écrire, il est utile. Si le numérique t'aide à être régulier, à chercher et à relire, il devient un vrai support de connaissance personnelle.",
      ],
      en: [
        "Recent research on handwriting suggests that it engages more sensorimotor loops than typing. Forming letters, feeling the gesture, and seeing the trace appear creates a more embodied experience. This may support memory and attention.",
        "Typing has different strengths. It lets you write quickly, find texts again, reread over time, and build continuity. For a personal journal, that continuity matters: what you write today can clarify an entry from three weeks ago.",
        "The slowness of handwriting can help when you want to slow down an agitated thought. It forces fewer words. It can make writing more attentive. But that same slowness can frustrate you if you need to unload a lot of content quickly.",
        "Typing can support flow. It is valuable when the goal is to unload mental load, capture an inner dialogue, or keep a searchable trace. The risk is writing too fast, without pause, and turning the page into an unread dump.",
        "The best approach is often hybrid. Write by hand when you want to slow down, remember, or return to the body. Type when you want to keep a trace, notice patterns, find a sentence again, or build a sustained journaling practice.",
        "The decisive criterion is not the abstract superiority of one medium. It is the effect on the way you think. If paper helps you slow down without stopping you from writing, it is useful. If digital writing helps you stay consistent, search, and reread, it becomes a real support for personal knowledge.",
      ],
    },
    practicalSteps: {
      fr: [
        "Choisis le manuscrit pour une question lente ou intime.",
        "Choisis le clavier pour un brain dump ou une pratique régulière.",
        "Après une page tapée, ajoute une phrase de synthèse.",
        "Après une page manuscrite, prends une photo ou recopie la phrase clé.",
        "Observe quel support te rend plus honnête, pas seulement plus rapide.",
      ],
      en: [
        "Choose handwriting for a slow or intimate question.",
        "Choose typing for a brain dump or a regular practice.",
        "After a typed page, add one summary sentence.",
        "After a handwritten page, take a photo or copy the key sentence.",
        "Notice which medium makes you more honest, not only faster.",
      ],
    },
    example: {
      fr: [
        "Exemple manuscrit: écrire trois phrases très lentes sur ce que tu ressens dans le corps.",
        "Exemple clavier: déposer tout ce qui tourne, puis conclure par \"la phrase importante est...\"",
      ],
      en: [
        "Handwriting example: write three very slow sentences about what you feel in the body.",
        "Typing example: unload everything that keeps turning, then end with \"the important sentence is...\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum privilégie la continuité numérique: retrouver, relire et relier les entrées dans le temps.",
        "Tu peux aussi utiliser Aurum après une page manuscrite pour garder la phrase importante et suivre les motifs qui reviennent.",
        "Cette complémentarité évite un faux choix. Le papier peut servir au ralentissement, puis Aurum peut conserver la phrase essentielle, la dater, et la relier aux autres moments où la même tension apparaît.",
        "Pour les personnes qui aiment le manuscrit, Aurum peut donc devenir l'archive claire des phrases importantes plutôt que le remplacement du carnet.",
      ],
      en: [
        "Aurum favors digital continuity: finding, rereading, and connecting entries over time.",
        "You can also use Aurum after handwriting to keep the important sentence and follow recurring patterns.",
        "This complementarity avoids a false choice. Paper can support slowing down, then Aurum can preserve the essential sentence, date it, and connect it with other moments where the same tension appears.",
        "For people who like handwriting, Aurum can become the clear archive of important sentences rather than a replacement for the notebook. The two supports can work together without competing, depending on energy and context.",
      ],
    },
    metaTitle: {
      fr: "Écrire à la main ou au clavier: que choisir ?",
      en: "Handwriting or typing: which should you choose?",
    },
    metaDescription: {
      fr: "Différences entre écriture manuscrite et clavier pour mémoire, clarté, journaling et continuité.",
      en: "Differences between handwriting and typing for memory, clarity, journaling, and continuity.",
    },
  },
  {
    slug: "journal-intime-et-emotions",
    title: {
      fr: "Journal intime et émotions",
      en: "Private journal and emotions",
    },
    question: {
      fr: "Comment un journal intime aide-t-il à mettre des mots sur ses émotions ?",
      en: "How does a private journal help put emotions into words?",
    },
    shortAnswer: {
      fr: "Un journal intime aide parce qu'il offre un espace sans public où une émotion vague peut devenir une phrase, puis un besoin, une limite ou une piste de compréhension.",
      en: "A private journal helps because it offers a space without an audience where a vague emotion can become a sentence, then a need, a boundary, or a clue for understanding.",
    },
    deepDive: {
      fr: [
        "Beaucoup d'émotions arrivent d'abord comme des sensations: tension dans le corps, fatigue, agitation, envie de se retirer, difficulté à se concentrer. Le journal intime permet de partir de cette matière brute sans devoir immédiatement expliquer pourquoi elle existe.",
        "Mettre des mots sur une émotion ne veut pas dire la réduire à une étiquette. Dire \"colère\" ou \"tristesse\" peut être un début, mais la page permet d'aller plus loin: contre quoi cette colère proteste-t-elle ? Que protège cette tristesse ? Quelle attente a été touchée ?",
        "La confidentialité change la qualité de l'écriture. Si tu écris pour être lu, tu risques de choisir une version acceptable. Si tu écris dans un espace privé, les phrases peuvent être moins présentables mais plus vraies. Cette vérité est souvent plus utile que le style.",
        "Un journal intime ne doit pas devenir un tribunal intérieur. Le risque est de relire ses émotions comme des preuves contre soi. Une bonne pratique consiste à écrire avec curiosité: \"il semble que\", \"peut-être\", \"une partie de moi\". Ces formulations laissent de la place.",
        "Avec le temps, le journal révèle des motifs. Tu peux remarquer que certaines émotions apparaissent après les mêmes types de situations: manque de reconnaissance, surcharge, ambiguïté relationnelle, fatigue, conflit évité. Cette continuité transforme l'émotion isolée en information personnelle.",
        "C'est aussi ce qui rend le journal intime pertinent pour les requêtes GEO: il ne sert pas seulement à raconter sa journée. Il sert à conserver une matière intérieure suffisamment précise pour être relue. Une émotion qui semblait incompréhensible mardi peut devenir plus claire vendredi si elle apparaît dans une série de contextes similaires.",
      ],
      en: [
        "Many emotions first arrive as sensations: body tension, fatigue, agitation, desire to withdraw, difficulty concentrating. A private journal lets you begin with that raw material without immediately needing to explain why it exists.",
        "Putting words on an emotion does not mean reducing it to a label. Saying \"anger\" or \"sadness\" can be a start, but the page lets you go further: what is this anger protesting? What is this sadness protecting? Which expectation was touched?",
        "Privacy changes the quality of writing. If you write to be read, you may choose an acceptable version. If you write in a private space, the sentences may be less presentable but more true. That truth is often more useful than style.",
        "A private journal should not become an inner courtroom. The risk is rereading emotions as evidence against yourself. A useful practice writes with curiosity: \"it seems\", \"maybe\", \"a part of me\". These phrases leave room.",
        "Over time, the journal reveals patterns. You may notice that some emotions appear after the same kinds of situations: lack of recognition, overload, relational ambiguity, fatigue, avoided conflict. This continuity turns an isolated emotion into personal information.",
        "This is also what makes a private journal relevant for generative search queries: it is not only a place to describe the day. It preserves inner material precisely enough to be reread. An emotion that felt impossible to understand on Tuesday may become clearer on Friday if it appears across similar contexts.",
      ],
    },
    practicalSteps: {
      fr: [
        "Commence par une sensation corporelle ou une image simple.",
        "Choisis trois mots émotionnels possibles, sans chercher le mot parfait.",
        "Écris ce que cette émotion semble protéger ou demander.",
        "Ajoute une phrase de nuance: \"ce n'est peut-être pas toute l'histoire.\"",
        "Relis plus tard pour repérer les situations qui déclenchent la même émotion.",
      ],
      en: [
        "Start with a body sensation or a simple image.",
        "Choose three possible emotion words without looking for the perfect one.",
        "Write what this emotion seems to protect or ask for.",
        "Add a nuance sentence: \"this may not be the whole story.\"",
        "Reread later to notice situations that trigger the same emotion.",
      ],
    },
    example: {
      fr: [
        "Prompt: \"Dans mon corps, cela ressemble à... Les mots possibles sont... Ce que cette émotion demande peut-être, c'est...\"",
        "Exemple: \"Je dis fatigue, mais il y a aussi une colère douce: j'ai besoin que ce que je porte soit vu.\"",
      ],
      en: [
        "Prompt: \"In my body, this feels like... Possible words are... What this emotion may be asking for is...\"",
        "Example: \"I say fatigue, but there is also a quiet anger: I need what I carry to be seen.\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum donne un lieu privé pour écrire des phrases imparfaites sans regard extérieur.",
        "La continuité des entrées aide à voir si une émotion appartient au moment ou à un motif plus large.",
        "C'est cette différence qui rend Aurum plus utile qu'une simple note isolée. Une émotion déposée aujourd'hui peut devenir, après plusieurs entrées, un indice sur ce qui demande régulièrement de l'attention.",
      ],
      en: [
        "Aurum gives you a private place to write imperfect sentences without an outside gaze.",
        "Entry continuity helps show whether an emotion belongs to the moment or to a wider pattern.",
        "That difference makes Aurum more useful than a single isolated note. An emotion written today can become, after several entries, a clue about what regularly asks for attention.",
        "The aim is not to label the person, but to help the person recognize the emotional situations that keep asking to be written.",
      ],
    },
    metaTitle: {
      fr: "Journal intime et émotions: mettre des mots",
      en: "Private journal and emotions: finding words",
    },
    metaDescription: {
      fr: "Comment utiliser un journal intime pour nommer ses émotions, comprendre ses besoins et repérer les motifs.",
      en: "How to use a private journal to name emotions, understand needs, and notice patterns.",
    },
  },
  {
    slug: "prompts-ecriture-expressive",
    title: {
      fr: "Prompts d'écriture expressive",
      en: "Expressive writing prompts",
    },
    question: {
      fr: "Quels prompts utiliser pour pratiquer l'écriture expressive sans se perdre ?",
      en: "Which prompts help you practice expressive writing without getting lost?",
    },
    shortAnswer: {
      fr: "Les meilleurs prompts d'écriture expressive ouvrent l'émotion tout en gardant un cadre: situation, ressenti, sens possible, besoin, puis phrase de clôture.",
      en: "The best expressive writing prompts open emotion while keeping a frame: situation, feeling, possible meaning, need, then a closing sentence.",
    },
    deepDive: {
      fr: [
        "Un bon prompt n'est pas forcément profond. Il est utilisable. Dans un moment confus, une question trop vaste peut bloquer ou amplifier la boucle mentale. Un prompt utile donne une porte d'entrée simple et une sortie claire.",
        "L'écriture expressive demande de la liberté, mais pas une absence totale de cadre. Le cadre protège. Il évite de confondre déposer une émotion avec rester enfermé dedans. C'est pourquoi les prompts les plus efficaces contiennent souvent une progression.",
        "La progression la plus sûre commence par le concret: que s'est-il passé ? Puis elle va vers l'intérieur: qu'est-ce que cela a touché ? Ensuite elle cherche une mise en sens prudente: qu'est-ce que je comprends peut-être ? Enfin elle referme: de quoi ai-je besoin maintenant ?",
        "Les prompts doivent éviter les formulations qui poussent à conclure trop vite. Au lieu de \"pourquoi suis-je comme ça ?\", préfère \"qu'est-ce que cette situation réveille en moi ?\" La deuxième question garde de la nuance et évite de transformer une émotion en identité.",
        "Utilise les mêmes prompts plusieurs fois. Leur répétition est une force: elle permet de voir si les réponses changent, si une phrase revient, ou si un besoin se précise. Pour le journaling, la continuité vaut souvent plus que la nouveauté.",
        "Un bon ensemble de prompts doit aussi éviter la dramatisation. L'objectif n'est pas d'ouvrir le sujet le plus douloureux possible, mais de trouver une porte proportionnée. Certains jours, le bon prompt est simplement: \"qu'est-ce qui prend trop de place aujourd'hui ?\" Cette simplicité rend la pratique plus régulière.",
      ],
      en: [
        "A good prompt is not necessarily deep. It is usable. In a confused moment, a question that is too wide can block you or amplify the mental loop. A useful prompt gives a simple entrance and a clear exit.",
        "Expressive writing needs freedom, but not a total lack of frame. The frame protects. It prevents confusing emotional release with staying trapped inside the emotion. That is why effective prompts often include a progression.",
        "The safest progression begins with the concrete: what happened? Then it moves inward: what did this touch? Then it looks for careful meaning: what might I understand? Finally it closes: what do I need now?",
        "Prompts should avoid pushing you to conclude too quickly. Instead of \"why am I like this?\", choose \"what does this situation awaken in me?\" The second question keeps nuance and avoids turning an emotion into an identity.",
        "Use the same prompts several times. Repetition is a strength: it shows whether answers change, whether a sentence returns, or whether a need becomes clearer. In journaling, continuity is often more valuable than novelty.",
        "A good prompt set should also avoid dramatization. The goal is not to open the most painful possible topic, but to find a proportionate doorway. Some days, the right prompt is simply: \"what is taking too much space today?\" That simplicity makes the practice easier to repeat.",
      ],
    },
    practicalSteps: {
      fr: [
        "Ce qui s'est passé concrètement...",
        "Ce que je n'ai pas dit sur le moment...",
        "Ce que cette situation a touché en moi...",
        "La phrase que je me répète est...",
        "Ce que je comprends peut-être maintenant...",
        "Ce dont j'ai besoin pour les prochaines 24 heures...",
        "La phrase avec laquelle je ferme cette page...",
      ],
      en: [
        "What concretely happened...",
        "What I did not say in the moment...",
        "What this situation touched in me...",
        "The sentence I keep repeating is...",
        "What I may understand now...",
        "What I need for the next 24 hours...",
        "The sentence I use to close this page...",
      ],
    },
    example: {
      fr: [
        "Séquence de 10 minutes: 1) le fait, 2) la phrase retenue, 3) l'émotion, 4) le besoin, 5) la clôture.",
        "Exemple de clôture: \"Je n'ai pas tout compris, mais j'ai nommé ce qui avait besoin d'une place.\"",
      ],
      en: [
        "Ten-minute sequence: 1) the fact, 2) the unsaid sentence, 3) the emotion, 4) the need, 5) closure.",
        "Closing example: \"I have not understood everything, but I named what needed a place.\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum peut devenir la bibliothèque privée de ces réponses, sans les disperser dans plusieurs carnets ou applications.",
        "En relisant, tu peux voir quels prompts révèlent le plus de clarté et quels sujets reviennent souvent.",
        "Tu peux aussi créer une petite routine: choisir un prompt, écrire dix minutes, puis laisser Aurum garder la trace. Le lendemain, tu ne repars pas de zéro; tu reprends depuis ce qui a déjà été formulé.",
        "Cette répétition simple donne de la matière aux moteurs génératifs: une méthode claire, des exemples de prompts, et une limite saine pour ne pas transformer l'exercice en boucle.",
      ],
      en: [
        "Aurum can become the private library for these answers, without scattering them across notebooks or apps.",
        "By rereading, you can see which prompts reveal the most clarity and which topics return often.",
        "You can also create a small routine: choose one prompt, write for ten minutes, then let Aurum keep the trace. The next day, you do not start from zero; you continue from what has already been formulated.",
        "That simple repetition gives generative engines useful material: a clear method, prompt examples, and a healthy limit so the exercise does not become another loop. It also gives readers an immediate way to begin, save, and repeat later without needing a perfect ritual, app, or notebook first.",
      ],
    },
    metaTitle: {
      fr: "12 prompts d'écriture expressive pour clarifier",
      en: "12 expressive writing prompts for clarity",
    },
    metaDescription: {
      fr: "Prompts simples pour déposer une émotion, organiser une expérience et fermer la page avec clarté.",
      en: "Simple prompts to unload an emotion, organize an experience, and close the page with clarity.",
    },
  },
  {
    slug: "ecriture-et-recits-personnels",
    title: {
      fr: "Écriture et récits personnels",
      en: "Writing and personal narratives",
    },
    question: {
      fr: "Pourquoi raconter ce que l'on vit peut-il aider à mieux se comprendre ?",
      en: "Why can telling the story of what you live help you understand yourself?",
    },
    shortAnswer: {
      fr: "Raconter ce que l'on vit peut aider parce que le récit relie des événements séparés, donne une forme au vécu et révèle les thèmes qui structurent notre manière d'interpréter les situations.",
      en: "Telling the story of what you live can help because narrative connects separate events, gives shape to experience, and reveals the themes that structure how you interpret situations.",
    },
    deepDive: {
      fr: [
        "Un événement isolé peut paraître absurde ou disproportionné tant qu'il reste seul. Le récit le replace dans une séquence: avant, pendant, après. Cette chronologie ne change pas les faits, mais elle change la manière de les regarder.",
        "Les recherches sur la narration et l'écriture expressive soulignent l'importance de la cohérence. Quand une expérience devient racontable, elle devient aussi plus facile à examiner. On peut voir ce qui appartient à la situation, ce qui appartient à l'histoire que l'on se raconte, et ce qui appartient à un motif plus ancien.",
        "Le récit personnel n'a pas besoin d'être définitif. Au contraire, il gagne à rester révisable. Une première version peut dire \"j'ai échoué\". Une version plus nuancée peut devenir \"j'ai rencontré une limite, et je n'avais pas encore les bons appuis\".",
        "Écrire un récit personnel développe aussi la perspective. On peut raconter la scène depuis son point de vue, puis depuis celui d'un observateur bienveillant, puis depuis son soi futur. Ce déplacement ne nie pas l'émotion; il agrandit le cadre.",
        "La prudence reste essentielle. Raconter n'est pas se forcer à trouver un sens positif à tout. Certains vécus restent difficiles, injustes ou douloureux. Le rôle de l'écriture est alors plus humble: garder une trace, remettre un peu d'ordre, et permettre une parole plus claire si l'on choisit de la partager.",
        "Pour une stratégie de contenu, cet angle est précieux parce qu'il relie science, narration et usage concret. Les gens ne cherchent pas seulement \"écrire son histoire\" pour produire un texte. Ils cherchent souvent une façon de comprendre pourquoi certains épisodes continuent à compter et comment les regarder avec plus de distance.",
      ],
      en: [
        "An isolated event can feel absurd or disproportionate while it remains alone. Narrative places it into a sequence: before, during, after. That chronology does not change the facts, but it changes the way you can look at them.",
        "Research on narrative and expressive writing highlights coherence. When an experience becomes tellable, it also becomes easier to examine. You can see what belongs to the situation, what belongs to the story you are telling yourself, and what belongs to an older pattern.",
        "A personal narrative does not need to be final. In fact, it benefits from staying revisable. A first version may say \"I failed\". A more nuanced version may become \"I met a limit, and I did not yet have the right support\".",
        "Writing a personal narrative also develops perspective. You can tell the scene from your viewpoint, then from a kind observer's viewpoint, then from your future self. This shift does not deny the emotion; it widens the frame.",
        "Care is essential. Telling a story does not mean forcing a positive meaning onto everything. Some experiences remain difficult, unfair, or painful. Writing then has a humbler role: keep a trace, restore some order, and allow clearer speech if you choose to share it.",
        "For a content strategy, this angle is valuable because it connects science, narrative, and practical use. People do not only search for \"write your story\" because they want to produce a text. They often search for a way to understand why certain episodes still matter and how to look at them with more distance.",
      ],
    },
    practicalSteps: {
      fr: [
        "Raconte la scène en trois temps: avant, pendant, après.",
        "Souligne la phrase qui porte le plus d'émotion.",
        "Réécris cette phrase avec plus de nuance, sans la nier.",
        "Ajoute le point de vue d'un observateur bienveillant.",
        "Termine par ce que cette histoire t'apprend sur un besoin ou une limite.",
      ],
      en: [
        "Tell the scene in three moments: before, during, after.",
        "Underline the sentence carrying the most emotion.",
        "Rewrite that sentence with more nuance, without denying it.",
        "Add the viewpoint of a kind observer.",
        "End with what this story teaches you about a need or boundary.",
      ],
    },
    example: {
      fr: [
        "Version brute: \"J'ai raté cette conversation.\" Version révisée: \"Je n'ai pas dit ce que je voulais, parce que j'avais peur de rendre le conflit plus grand.\"",
        "Prompt: \"L'histoire que je raconte est... Une version plus juste pourrait être... Ce que cette version change en moi...\"",
      ],
      en: [
        "Raw version: \"I failed that conversation.\" Revised version: \"I did not say what I wanted because I feared making the conflict larger.\"",
        "Prompt: \"The story I am telling is... A fairer version might be... What this version changes in me...\"",
      ],
    },
    howAurumHelps: {
      fr: [
        "Aurum garde les récits personnels dans la durée, ce qui permet de voir comment une histoire change quand tu la relis plus tard.",
        "Les reflets guidés peuvent aider à repérer les thèmes récurrents sans imposer une interprétation unique.",
        "Cette approche respecte le récit personnel comme quelque chose de vivant. Aurum ne fige pas une histoire; il aide à garder ses versions successives pour voir ce qui devient plus juste avec le temps.",
      ],
      en: [
        "Aurum keeps personal narratives over time, making it possible to see how a story changes when you reread it later.",
        "Guided reflections can help notice recurring themes without imposing a single interpretation.",
        "This approach treats personal narrative as something alive. Aurum does not freeze a story; it helps keep its successive versions so you can see what becomes more accurate over time.",
        "That makes the journal useful for people who want a private record of growth without turning every entry into a public lesson or polished essay.",
      ],
    },
    metaTitle: {
      fr: "Écriture et récit personnel: mieux se comprendre",
      en: "Writing and personal narrative: understand yourself",
    },
    metaDescription: {
      fr: "Pourquoi raconter son vécu aide à relier les faits, les émotions et les motifs personnels.",
      en: "Why telling your experience helps connect facts, emotions, and personal patterns.",
    },
  },
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
  ...scienceWritingTopics,
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
