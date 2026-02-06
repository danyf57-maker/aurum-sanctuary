/**
 * Anti-Meta Safeguards
 *
 * Prevents AI from breaking presence by mentioning recognition explicitly.
 * Hard constraints via lexical filtering and post-checks.
 */

import { logger } from '@/lib/logger/safe';

/**
 * Forbidden words/phrases that break implicit presence
 */
const FORBIDDEN_PHRASES = [
  'je reconnais',
  'je me souviens',
  'déjà',
  'avant',
  'souvent',
  "d'habitude",
  'encore',
  'la semaine dernière',
  'la dernière fois',
  'comme les autres fois',
  'récurrent',
  'récurrente',
  'comme avant',
  'tu as déjà',
  'tu avais',
  'précédemment',
  'antérieurement',
];

/**
 * Check if response contains forbidden meta-references
 */
export function containsMetaReference(text: string): boolean {
  const lowerText = text.toLowerCase();

  for (const phrase of FORBIDDEN_PHRASES) {
    if (lowerText.includes(phrase)) {
      logger.warnSafe('Detected meta-reference in AI response', {
        forbiddenPhrase: phrase,
        textPreview: text.substring(0, 100),
      });
      return true;
    }
  }

  return false;
}

/**
 * Generate correction prompt when meta-reference detected
 */
export function getCorrectionPrompt(originalResponse: string): string {
  return `Ta réponse précédente contenait une référence méta qui brise la présence :

"${originalResponse}"

Réécris cette réponse en respectant ces règles STRICTES :
1. Ne JAMAIS mentionner : "je reconnais", "déjà", "avant", "souvent", "encore", "comme les autres fois"
2. Parle uniquement du PRÉSENT (ce qui est écrit aujourd'hui)
3. Utilise le conditionnel pour les nuances : "il y a peut-être...", "on dirait que..."
4. La reconnaissance doit être IMPLICITE, tissée dans la profondeur du reflet

Exemple de transformation :
❌ "Je reconnais cette tension professionnelle dont tu as déjà parlé"
✅ "Cette frontière entre ton espace et ce qu'on attend de toi... elle revient, différemment peut-être, mais elle est là"

Réécris maintenant en respectant ces contraintes.`;
}

/**
 * Extract clean response (remove meta-references if possible)
 * Simple word replacement as fallback before regeneration
 */
export function sanitizeMetaReferences(text: string): string {
  let sanitized = text;

  // Replace forbidden phrases with neutral alternatives
  const replacements: Record<string, string> = {
    'je reconnais': 'je sens',
    'je me souviens': 'je perçois',
    déjà: '',
    avant: '',
    souvent: 'parfois',
    "d'habitude": '',
    encore: '',
    'la semaine dernière': 'récemment',
    'la dernière fois': '',
    'comme les autres fois': '',
    récurrent: '',
    récurrente: '',
    'comme avant': '',
    'tu as déjà': 'tu',
    'tu avais': 'tu as',
    précédemment: '',
    antérieurement: '',
  };

  for (const [forbidden, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(forbidden, 'gi');
    sanitized = sanitized.replace(regex, replacement);
  }

  // Clean up double spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Validate and potentially correct AI response
 * Returns: { valid: boolean, correctedText?: string, needsRegeneration: boolean }
 */
export function validateResponse(text: string): {
  valid: boolean;
  correctedText?: string;
  needsRegeneration: boolean;
} {
  if (!containsMetaReference(text)) {
    return { valid: true, needsRegeneration: false };
  }

  // Try sanitization first
  const sanitized = sanitizeMetaReferences(text);

  // If sanitization worked (no more meta-references), use it
  if (!containsMetaReference(sanitized)) {
    logger.infoSafe('Successfully sanitized meta-references', {
      originalPreview: text.substring(0, 50),
      sanitizedPreview: sanitized.substring(0, 50),
    });
    return {
      valid: false,
      correctedText: sanitized,
      needsRegeneration: false,
    };
  }

  // Sanitization failed → needs full regeneration
  logger.warnSafe('Meta-references persist after sanitization, needs regeneration');
  return {
    valid: false,
    needsRegeneration: true,
  };
}
