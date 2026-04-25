import {
  type ProductLocale,
  type ReflectionLanguage,
} from '../language-policy';

export type ReplyLanguage = ReflectionLanguage | 'same-as-user';
type PromptInstructionLanguage = ReflectionLanguage;

type SupportedLocale = ProductLocale;

const LANGUAGE_PATTERNS: Array<{ language: ReflectionLanguage; patterns: RegExp[] }> = [
  {
    language: 'fr',
    patterns: [
      /\b(je|j'ai|j ai|tu|vous|avec|pour|parce|merci|bonjour|suis|ressens|aujourd'hui|aujourdhui|rien|encore|dans|mais|que|qui|mon|ma|mes|c'est|c etait|c'était|ça|ca)\b/gi,
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
      /\b(yo|me|mi|mis|estoy|siento|sentir|cansado|agotado|porque|pero|cuando|que|qué|como|cómo|dentro|palabras|escribi|escribí|atencion|atención|sobrecargado)\b/gi,
      /[áéíóúñ¿¡]/gi,
    ],
  },
  {
    language: 'it',
    patterns: [
      /\b(io|mi|mio|sono|sento|sentire|stanco|stanca|mentalmente|perche|perché|ma|quando|che|cosa|parole|scritto|attenzione|sovraccarico|sovraccarica)\b/gi,
    ],
  },
  {
    language: 'de',
    patterns: [
      /\b(ich|mich|mir|mein|meine|bin|fühle|fuehle|müde|muede|erschöpft|erschoepft|weil|aber|wenn|was|wie|worte|geschrieben|aufmerksamkeit|überfordert|ueberfordert)\b/gi,
      /[äöüß]/gi,
    ],
  },
  {
    language: 'pt',
    patterns: [
      /\b(eu|me|meu|minha|estou|sinto|sentindo|sentir|cansado|cansaço|cansaco|sobrecarregado|sobrecarregada|porque|mas|quando|que|o que|como|dentro|palavras|escrevi|atenção|atencao|chamou|sentes|nessas|não|nao)\b/gi,
      /[ãõáàâéêíóôúç]/gi,
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

  return 'en';
}

export function resolvePromptLanguage(
  replyLanguage: ReplyLanguage,
  requestedLocale?: SupportedLocale | null
): PromptInstructionLanguage {
  if (replyLanguage !== 'same-as-user') {
    return replyLanguage as PromptInstructionLanguage;
  }

  return requestedLocale === 'fr' ? 'fr' : 'en';
}

export function buildStrictReplyLanguageInstruction(
  replyLanguage: ReplyLanguage,
  requestedLocale?: SupportedLocale | null
): string {
  const localeLabel = requestedLocale ?? 'unknown';
  const promptLanguage = resolvePromptLanguage(replyLanguage, requestedLocale);
  const targetLanguageNames: Record<PromptInstructionLanguage, Record<ReflectionLanguage, string>> = {
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

  const instructions: Record<PromptInstructionLanguage, { exact: (name: string) => string; sameAsUser: string }> = {
    en: {
      exact: (name) =>
        `Language rule (strict): Your final answer must be entirely in ${name}. The user's message language takes priority over the app locale. App locale: ${localeLabel}. Never mention the language the user wrote in. Do not open with a greeting unless the user greeted you first in the same turn. Respond directly to the meaning and emotional content. Prefer idiomatic, natural phrasing in the target language. If you are unsure, choose simpler native wording over literal translation. Before you answer, silently proofread the final text and fix any grammar or syntax slip.`,
      sameAsUser:
        `Language rule (strict): Reply in the same language as the user's message, even if the app locale is different. Supported reflection languages: English, French, Spanish, Italian, German, and Portuguese. If the language is ambiguous, fall back to the app locale. App locale: ${localeLabel}. Never mention the user's language explicitly. Do not open with a greeting unless the user greeted you first in the same turn. Prefer idiomatic, natural phrasing over literal translation. Before you answer, silently proofread the final text and fix any grammar or syntax slip.`,
    },
    fr: {
      exact: (name) =>
        `Règle de langue (stricte) : ta réponse finale doit être entièrement en ${name}. La langue du message de l'utilisateur passe avant la langue de l'application. Langue de l'application : ${localeLabel}. Ne mentionne jamais la langue utilisée. N'ouvre pas avec une salutation sauf si l'utilisateur vient lui-même de saluer dans ce même tour. Réponds directement au sens et au vécu. Utilise une formulation idiomatique et naturelle. En cas de doute, choisis un français plus simple plutôt qu'une traduction littérale. Avant d'envoyer, relis mentalement la réponse finale et corrige toute faute de grammaire ou de syntaxe.`,
      sameAsUser:
        `Règle de langue (stricte) : réponds dans la même langue que le message de l'utilisateur, même si la langue de l'application est différente. Langues de réflexion prises en charge : anglais, français, espagnol, italien, allemand et portugais. Si la langue reste ambiguë, rabats-toi sur la langue de l'application. Langue de l'application : ${localeLabel}. Ne verbalise jamais la langue détectée. N'ouvre pas avec une salutation sauf si l'utilisateur vient de saluer. Préfère une formulation idiomatique à une traduction littérale. Avant d'envoyer, relis mentalement la réponse finale et corrige toute faute de grammaire ou de syntaxe.`,
    },
    es: {
      exact: (name) =>
        `Regla de idioma (estricta): tu respuesta final debe estar enteramente en ${name}. El idioma del último mensaje del usuario tiene prioridad sobre el idioma de la aplicación. Idioma de la aplicación: ${localeLabel}. No menciones nunca el idioma usado. No empieces con un saludo salvo que el usuario haya saludado en este mismo turno. Responde directamente al sentido y a la vivencia. Usa una formulación idiomática y natural. En caso de duda, elige palabras nativas sencillas antes que una traducción literal. Antes de enviar, revisa mentalmente la respuesta final y corrige cualquier error de gramática o sintaxis.`,
      sameAsUser:
        `Regla de idioma (estricta): responde en el mismo idioma que el mensaje del usuario, aunque el idioma de la aplicación sea diferente. Idiomas de reflexión admitidos: inglés, francés, español, italiano, alemán y portugués. Si el idioma es ambiguo, usa el idioma de la aplicación. Idioma de la aplicación: ${localeLabel}. No menciones el idioma detectado. No empieces con un saludo salvo que el usuario haya saludado. Prefiere una formulación idiomática a una traducción literal. Antes de enviar, corrige cualquier error de gramática o sintaxis.`,
    },
    it: {
      exact: (name) =>
        `Regola di lingua (rigorosa): la risposta finale deve essere interamente in ${name}. La lingua dell'ultimo messaggio dell'utente ha priorità sulla lingua dell'app. Lingua dell'app: ${localeLabel}. Non nominare mai la lingua usata. Non aprire con un saluto a meno che l'utente non abbia salutato in questo stesso turno. Rispondi direttamente al senso e al vissuto. Usa una formulazione idiomatica e naturale. In caso di dubbio, scegli parole native semplici invece di una traduzione letterale. Prima di inviare, rileggi mentalmente la risposta finale e correggi ogni errore di grammatica o sintassi.`,
      sameAsUser:
        `Regola di lingua (rigorosa): rispondi nella stessa lingua del messaggio dell'utente, anche se la lingua dell'app è diversa. Lingue di riflessione supportate: inglese, francese, spagnolo, italiano, tedesco e portoghese. Se la lingua è ambigua, usa la lingua dell'app. Lingua dell'app: ${localeLabel}. Non nominare la lingua rilevata. Non aprire con un saluto a meno che l'utente non abbia salutato. Preferisci una formulazione idiomatica a una traduzione letterale. Prima di inviare, correggi ogni errore di grammatica o sintassi.`,
    },
    de: {
      exact: (name) =>
        `Strenge Sprachregel: Deine finale Antwort muss vollständig auf ${name} sein. Die Sprache der letzten Nutzernachricht hat Vorrang vor der App-Sprache. App-Sprache: ${localeLabel}. Erwähne die verwendete Sprache niemals. Beginne nicht mit einer Begrüßung, außer die Person hat in genau diesem Zug gegrüßt. Antworte direkt auf Sinn und Erleben. Formuliere idiomatisch und natürlich. Im Zweifel wähle einfache muttersprachliche Wörter statt wörtlicher Übersetzung. Lies die finale Antwort vor dem Senden still gegen und korrigiere Grammatik- oder Syntaxfehler.`,
      sameAsUser:
        `Strenge Sprachregel: Antworte in derselben Sprache wie die Nachricht der Person, auch wenn die App-Sprache anders ist. Unterstützte Reflexionssprachen: Englisch, Französisch, Spanisch, Italienisch, Deutsch und Portugiesisch. Wenn die Sprache unklar ist, verwende die App-Sprache. App-Sprache: ${localeLabel}. Benenne die erkannte Sprache nicht. Beginne nicht mit einer Begrüßung, außer die Person hat gegrüßt. Bevorzuge idiomatische Formulierungen statt wörtlicher Übersetzung. Korrigiere vor dem Senden Grammatik- oder Syntaxfehler.`,
    },
    pt: {
      exact: (name) =>
        `Regra de língua (estrita): a tua resposta final deve estar inteiramente em ${name}. A língua da última mensagem do utilizador tem prioridade sobre a língua da aplicação. Língua da aplicação: ${localeLabel}. Nunca menciones a língua usada. Não abras com uma saudação, salvo se a pessoa tiver saudado neste mesmo turno. Responde diretamente ao sentido e ao vivido. Usa uma formulação idiomática e natural. Em caso de dúvida, escolhe palavras nativas simples em vez de uma tradução literal. Antes de enviar, relê mentalmente a resposta final e corrige qualquer erro de gramática ou sintaxe.`,
      sameAsUser:
        `Regra de língua (estrita): responde na mesma língua da mensagem do utilizador, mesmo que a língua da aplicação seja diferente. Línguas de reflexão suportadas: inglês, francês, espanhol, italiano, alemão e português. Se a língua for ambígua, usa a língua da aplicação. Língua da aplicação: ${localeLabel}. Não menciones a língua detetada. Não abras com uma saudação salvo se a pessoa tiver saudado. Prefere uma formulação idiomática a uma tradução literal. Antes de enviar, corrige qualquer erro de gramática ou sintaxe.`,
    },
  };

  if (replyLanguage !== 'same-as-user') {
    const exactReplyLanguage = replyLanguage;
    return instructions[promptLanguage].exact(targetLanguageNames[promptLanguage][exactReplyLanguage]);
  }

  return instructions[promptLanguage].sameAsUser;
}
