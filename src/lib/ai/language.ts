import {
  type ProductLocale,
  type ReflectionLanguage,
} from '../language-policy';

export type ReplyLanguage = ReflectionLanguage | 'same-as-user';
type PromptInstructionLanguage = 'en' | 'fr';

type SupportedLocale = ProductLocale;

const LANGUAGE_PATTERNS: Array<{ language: 'fr' | 'en'; patterns: RegExp[] }> = [
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
  const targetLanguageNames: Record<PromptInstructionLanguage, Record<PromptInstructionLanguage, string>> = {
    en: {
      en: 'English',
      fr: 'French',
    },
    fr: {
      en: 'anglais',
      fr: 'français',
    },
  };

  const instructions: Record<PromptInstructionLanguage, { exact: (name: string) => string; sameAsUser: string }> = {
    en: {
      exact: (name) =>
        `Language rule (strict): Your final answer must be entirely in ${name}. The user's message language takes priority over the app locale. App locale: ${localeLabel}. Never mention the language the user wrote in. Do not open with a greeting unless the user greeted you first in the same turn. Respond directly to the meaning and emotional content. Prefer idiomatic, natural phrasing in the target language. If you are unsure, choose simpler native wording over literal translation. Before you answer, silently proofread the final text and fix any grammar or syntax slip.`,
      sameAsUser:
        `Language rule (strict): Reply in the same language as the user's message, even if the app locale is different. Supported reflection languages: English and French. If the language is ambiguous, fall back to the app locale. App locale: ${localeLabel}. Never mention the user's language explicitly. Do not open with a greeting unless the user greeted you first in the same turn. Prefer idiomatic, natural phrasing over literal translation. Before you answer, silently proofread the final text and fix any grammar or syntax slip.`,
    },
    fr: {
      exact: (name) =>
        `Règle de langue (stricte) : ta réponse finale doit être entièrement en ${name}. La langue du message de l'utilisateur passe avant la langue de l'application. Langue de l'application : ${localeLabel}. Ne mentionne jamais la langue utilisée. N'ouvre pas avec une salutation sauf si l'utilisateur vient lui-même de saluer dans ce même tour. Réponds directement au sens et au vécu. Utilise une formulation idiomatique et naturelle. En cas de doute, choisis un français plus simple plutôt qu'une traduction littérale. Avant d'envoyer, relis mentalement la réponse finale et corrige toute faute de grammaire ou de syntaxe.`,
      sameAsUser:
        `Règle de langue (stricte) : réponds dans la même langue que le message de l'utilisateur, même si la langue de l'application est différente. Langues de réflexion prises en charge : anglais et français. Si la langue reste ambiguë, rabats-toi sur la langue de l'application. Langue de l'application : ${localeLabel}. Ne verbalise jamais la langue détectée. N'ouvre pas avec une salutation sauf si l'utilisateur vient de saluer. Préfère une formulation idiomatique à une traduction littérale. Avant d'envoyer, relis mentalement la réponse finale et corrige toute faute de grammaire ou de syntaxe.`,
    },
  };

  if (replyLanguage !== 'same-as-user') {
    const exactReplyLanguage = replyLanguage as PromptInstructionLanguage;
    return instructions[promptLanguage].exact(targetLanguageNames[promptLanguage][exactReplyLanguage]);
  }

  return instructions[promptLanguage].sameAsUser;
}
