import {
  type ProductLocale,
  type ReflectionLanguage,
} from '../language-policy';

export type ReplyLanguage = ReflectionLanguage | 'same-as-user';

type SupportedLocale = ProductLocale;

const LANGUAGE_PATTERNS: Array<{ language: ReflectionLanguage; patterns: RegExp[] }> = [
  {
    language: 'fr',
    patterns: [
      /\b(je|j'ai|j ai|tu|vous|avec|pour|parce|merci|bonjour|suis|ressens|aujourd'hui|aujourdhui|rien|encore|dans|mais)\b/gi,
      /[àâçéèêëîïôùûüÿœ]/gi,
    ],
  },
  {
    language: 'en',
    patterns: [
      /\b(the|and|with|feel|because|about|today|this|that|i am|i'm|i feel|my|have|want|think|just)\b/gi,
    ],
  },
  {
    language: 'es',
    patterns: [
      /\b(que|para|porque|estoy|tengo|siento|quiero|puedo|gracias|hola|pero|muy|tambien|también|como|cuando|mi|mis)\b/gi,
      /[¿¡ñáéíóúü]/gi,
    ],
  },
  {
    language: 'it',
    patterns: [
      /\b(che|perche|perché|sono|ho|sento|voglio|posso|grazie|ciao|pero|però|molto|anche|come|quando|mio|mia|sto)\b/gi,
      /[àèéìíîòóù]/gi,
    ],
  },
  {
    language: 'de',
    patterns: [
      /\b(und|ich|fühle|fuehle|weil|heute|danke|hallo|aber|nicht|meine|mein|mit|für|fuer|kann|möchte|moechte|bin)\b/gi,
      /[äöüß]/gi,
    ],
  },
  {
    language: 'pt',
    patterns: [
      /\b(não|nao|estou|tenho|sinto|quero|preciso|obrigado|obrigada|olá|ola|porque|mas|também|tambem|como|quando|meu|minha|meus|minhas|você|voce|alguém|alguem|quase|ainda|só|so|penso|consigo|fico)\b/gi,
      /[ãõáàâêôç]/gi,
    ],
  },
];

function countPatternMatches(input: string, pattern: RegExp): number {
  const matches = input.match(pattern);
  return matches ? matches.length : 0;
}

export function detectUserLanguage(content: string): ReplyLanguage {
  const text = (content || '').trim().toLowerCase();
  if (!text) return 'same-as-user';

  const scores = LANGUAGE_PATTERNS.map(({ language, patterns }) => ({
    language,
    score: patterns.reduce((total, pattern) => total + countPatternMatches(text, pattern), 0),
  }));

  scores.sort((a, b) => b.score - a.score);

  const [top, second] = scores;
  if (!top || top.score === 0) {
    return 'same-as-user';
  }

  if (top.score >= 2 || top.score > (second?.score ?? 0)) {
    return top.language;
  }

  return 'same-as-user';
}

export function resolveReplyLanguage(
  primaryContent: string,
  requestedLocale?: SupportedLocale | null,
  fallbackContent?: string
): ReplyLanguage {
  const detected = detectUserLanguage(primaryContent);
  if (detected !== 'same-as-user') {
    return detected;
  }

  const fallbackDetected = detectUserLanguage(fallbackContent || '');
  if (fallbackDetected !== 'same-as-user') {
    return fallbackDetected;
  }

  if (requestedLocale === 'fr' || requestedLocale === 'en') {
    return requestedLocale;
  }

  return 'same-as-user';
}

export function resolvePromptLanguage(
  replyLanguage: ReplyLanguage,
  requestedLocale?: SupportedLocale | null
): ReflectionLanguage {
  if (replyLanguage !== 'same-as-user') {
    return replyLanguage;
  }

  return requestedLocale === 'fr' ? 'fr' : 'en';
}

export function buildStrictReplyLanguageInstruction(
  replyLanguage: ReplyLanguage,
  requestedLocale?: SupportedLocale | null
): string {
  const promptLanguage = resolvePromptLanguage(replyLanguage, requestedLocale);

  const localeLabel = requestedLocale ?? 'unknown';
  const targetLanguageNames: Record<ReflectionLanguage, Record<ReflectionLanguage, string>> = {
    en: {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      it: 'Italian',
      de: 'German',
      pt: 'Portuguese',
    },
    fr: {
      en: 'anglais',
      fr: 'français',
      es: 'espagnol',
      it: 'italien',
      de: 'allemand',
      pt: 'portugais',
    },
    es: {
      en: 'inglés',
      fr: 'francés',
      es: 'español',
      it: 'italiano',
      de: 'alemán',
      pt: 'portugués',
    },
    it: {
      en: 'inglese',
      fr: 'francese',
      es: 'spagnolo',
      it: 'italiano',
      de: 'tedesco',
      pt: 'portoghese',
    },
    de: {
      en: 'Englisch',
      fr: 'Französisch',
      es: 'Spanisch',
      it: 'Italienisch',
      de: 'Deutsch',
      pt: 'Portugiesisch',
    },
    pt: {
      en: 'inglês',
      fr: 'francês',
      es: 'espanhol',
      it: 'italiano',
      de: 'alemão',
      pt: 'português',
    },
  };

  const instructions: Record<ReflectionLanguage, { exact: (name: string) => string; sameAsUser: string }> = {
    en: {
      exact: (name) =>
        `Language rule (strict): Your final answer must be entirely in ${name}. The user's message language takes priority over the app locale. App locale: ${localeLabel}. Never mention the language the user wrote in. Do not open with a greeting unless the user greeted you first in the same turn. Respond directly to the meaning and emotional content. Prefer idiomatic, natural phrasing in the target language. If you are unsure, choose simpler native wording over literal translation. Before you answer, silently proofread the final text and fix any grammar or syntax slip.`,
      sameAsUser:
        `Language rule (strict): Reply in the same language as the user's message, even if the app locale is different. Supported reflection languages: English, French, Spanish, Italian, German, Portuguese. If the language is ambiguous, fall back to the app locale. App locale: ${localeLabel}. Never mention the user's language explicitly. Do not open with a greeting unless the user greeted you first in the same turn. Prefer idiomatic, natural phrasing over literal translation. Before you answer, silently proofread the final text and fix any grammar or syntax slip.`,
    },
    fr: {
      exact: (name) =>
        `Règle de langue (stricte) : ta réponse finale doit être entièrement en ${name}. La langue du message de l'utilisateur passe avant la langue de l'application. Langue de l'application : ${localeLabel}. Ne mentionne jamais la langue utilisée. N'ouvre pas avec une salutation sauf si l'utilisateur vient lui-même de saluer dans ce même tour. Réponds directement au sens et au vécu. Utilise une formulation idiomatique et naturelle. En cas de doute, choisis un français plus simple plutôt qu'une traduction littérale. Avant d'envoyer, relis mentalement la réponse finale et corrige toute faute de grammaire ou de syntaxe.`,
      sameAsUser:
        `Règle de langue (stricte) : réponds dans la même langue que le message de l'utilisateur, même si la langue de l'application est différente. Langues de réflexion prises en charge : anglais, français, espagnol, italien, allemand, portugais. Si la langue reste ambiguë, rabats-toi sur la langue de l'application. Langue de l'application : ${localeLabel}. Ne verbalise jamais la langue détectée. N'ouvre pas avec une salutation sauf si l'utilisateur vient de saluer. Préfère une formulation idiomatique à une traduction littérale. Avant d'envoyer, relis mentalement la réponse finale et corrige toute faute de grammaire ou de syntaxe.`,
    },
    es: {
      exact: (name) =>
        `Regla de idioma (estricta): tu respuesta final debe estar completamente en ${name}. El idioma del mensaje del usuario tiene prioridad sobre el idioma de la aplicación. Idioma de la aplicación: ${localeLabel}. Nunca menciones el idioma usado por la persona. No abras con un saludo salvo que la persona haya saludado en este mismo turno. Responde directamente al significado y a la experiencia emocional. Prefiere una formulación idiomática y natural. Si dudas, elige una redacción nativa más simple antes que una traducción literal. Antes de responder, relee mentalmente el texto final y corrige cualquier error de gramática o sintaxis.`,
      sameAsUser:
        `Regla de idioma (estricta): responde en el mismo idioma que el mensaje del usuario, aunque la aplicación esté en otro idioma. Idiomas de reflexión admitidos: inglés, francés, español, italiano, alemán y portugués. Si el idioma es ambiguo, vuelve al idioma de la aplicación. Idioma de la aplicación: ${localeLabel}. Nunca verbalices el idioma detectado. No abras con un saludo salvo que la persona haya saludado primero. Prefiere una formulación idiomática a una traducción literal. Antes de responder, relee mentalmente el texto final y corrige cualquier error de gramática o sintaxis.`,
    },
    it: {
      exact: (name) =>
        `Regola di lingua (rigorosa): la tua risposta finale deve essere interamente in ${name}. La lingua dell'ultimo messaggio dell'utente ha priorità sulla lingua dell'app. Lingua dell'app: ${localeLabel}. Non nominare mai la lingua usata dalla persona. Non aprire con un saluto, a meno che la persona abbia salutato in questo stesso turno. Rispondi direttamente al significato e al vissuto emotivo. Preferisci una formulazione idiomatica e naturale. Se hai un dubbio, scegli un italiano più semplice invece di una traduzione letterale. Prima di inviare, rileggi mentalmente il testo finale e correggi ogni errore di grammatica o sintassi.`,
      sameAsUser:
        `Regola di lingua (rigorosa): rispondi nella stessa lingua del messaggio dell'utente, anche se la lingua dell'app è diversa. Lingue di riflessione supportate: inglese, francese, spagnolo, italiano, tedesco e portoghese. Se la lingua resta ambigua, torna alla lingua dell'app. Lingua dell'app: ${localeLabel}. Non verbalizzare mai la lingua rilevata. Non aprire con un saluto, a meno che la persona abbia appena salutato. Preferisci una formulazione idiomatica a una traduzione letterale. Prima di inviare, rileggi mentalmente il testo finale e correggi ogni errore di grammatica o sintassi.`,
    },
    de: {
      exact: (name) =>
        `Sprachregel (streng): Deine endgültige Antwort muss vollständig auf ${name} sein. Die Sprache der letzten Nutzernachricht hat Vorrang vor der App-Sprache. App-Sprache: ${localeLabel}. Erwähne die verwendete Sprache niemals. Beginne nicht mit einer Begrüßung, es sei denn, die Person hat in genau diesem Zug zuerst gegrüßt. Antworte direkt auf Bedeutung und Erleben. Verwende idiomatische, natürliche Formulierungen. Wenn du unsicher bist, wähle einfacheres natürliches Deutsch statt einer wörtlichen Übersetzung. Lies den endgültigen Text vor dem Senden innerlich noch einmal und korrigiere jeden Grammatik- oder Syntaxfehler.`,
      sameAsUser:
        `Sprachregel (streng): Antworte in derselben Sprache wie die Nachricht der Person, auch wenn die App in einer anderen Sprache ist. Unterstützte Reflexionssprachen: Englisch, Französisch, Spanisch, Italienisch, Deutsch und Portugiesisch. Wenn die Sprache unklar bleibt, nimm die App-Sprache als Rückfall. App-Sprache: ${localeLabel}. Sprich die erkannte Sprache niemals an. Beginne nicht mit einer Begrüßung, es sei denn, die Person hat gerade zuerst gegrüßt. Bevorzuge idiomatische Formulierungen statt wörtlicher Übersetzung. Lies den endgültigen Text vor dem Senden innerlich noch einmal und korrigiere jeden Grammatik- oder Syntaxfehler.`,
    },
    pt: {
      exact: (name) =>
        `Regra de língua (estrita): a tua resposta final deve estar inteiramente em ${name}. A língua da última mensagem da pessoa tem prioridade sobre a língua da aplicação. Língua da aplicação: ${localeLabel}. Nunca menciones a língua usada pela pessoa. Não abras com uma saudação, a menos que a pessoa tenha saudado neste mesmo turno. Responde diretamente ao sentido e ao vivido emocional. Prefere formulações idiomáticas e naturais. Se houver dúvida, escolhe um português mais simples em vez de uma tradução literal. Antes de enviar, relê mentalmente o texto final e corrige qualquer erro de gramática ou sintaxe.`,
      sameAsUser:
        `Regra de língua (estrita): responde na mesma língua da mensagem da pessoa, mesmo que a aplicação esteja noutra língua. Línguas de reflexão suportadas: inglês, francês, espanhol, italiano, alemão e português. Se a língua continuar ambígua, usa a língua da aplicação como fallback. Língua da aplicação: ${localeLabel}. Nunca verbalizes a língua detectada. Não abras com uma saudação, a menos que a pessoa tenha acabado de saudar. Prefere formulações idiomáticas a traduções literais. Antes de enviar, relê mentalmente o texto final e corrige qualquer erro de gramática ou sintaxe.`,
    },
  };

  if (replyLanguage !== 'same-as-user') {
    return instructions[promptLanguage].exact(targetLanguageNames[promptLanguage][replyLanguage]);
  }

  return instructions[promptLanguage].sameAsUser;
}
