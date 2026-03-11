export type ReplyLanguage = 'fr' | 'en' | 'es' | 'it' | 'de' | 'same-as-user';

type SupportedLocale = 'fr' | 'en';

const LANGUAGE_PATTERNS: Array<{ language: Exclude<ReplyLanguage, 'same-as-user'>; patterns: RegExp[] }> = [
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

export function buildStrictReplyLanguageInstruction(
  replyLanguage: ReplyLanguage,
  requestedLocale?: SupportedLocale | null
): string {
  const sharedRules = 'Never mention the language the user wrote in. Do not open with a greeting unless the user greeted you first in the same turn. Respond directly to the meaning and emotional content.';

  if (replyLanguage === 'en') {
    return `Language rule (strict): Your final answer must be entirely in English. User message language takes priority over app locale. App locale: ${requestedLocale ?? 'unknown'}. ${sharedRules}`;
  }

  if (replyLanguage === 'fr') {
    return `Language rule (strict): Your final answer must be entirely in French. User message language takes priority over app locale. App locale: ${requestedLocale ?? 'unknown'}. ${sharedRules}`;
  }

  if (replyLanguage === 'es') {
    return `Language rule (strict): Your final answer must be entirely in Spanish. User message language takes priority over app locale. App locale: ${requestedLocale ?? 'unknown'}. ${sharedRules}`;
  }

  if (replyLanguage === 'it') {
    return `Language rule (strict): Your final answer must be entirely in Italian. User message language takes priority over app locale. App locale: ${requestedLocale ?? 'unknown'}. ${sharedRules}`;
  }

  if (replyLanguage === 'de') {
    return `Language rule (strict): Your final answer must be entirely in German. User message language takes priority over app locale. App locale: ${requestedLocale ?? 'unknown'}. ${sharedRules}`;
  }

  return `Language rule (strict): Reply in the same language as the user's message, even if the app locale is different. If the user writes in French, answer in French. If the user writes in Spanish, answer in Spanish. If the user writes in Italian, answer in Italian. If the user writes in German, answer in German. App locale: ${requestedLocale ?? 'unknown'}. ${sharedRules}`;
}
