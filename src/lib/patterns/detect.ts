/**
 * Pattern Detection Logic
 *
 * Pure functions to detect patterns from journal content using DeepSeek.
 * Does not touch database - just transforms text → pattern signals.
 */

import { ThemeId, EmotionalTone, PatternDetectionResult } from './types';
import { logger } from '@/lib/logger/safe';

/**
 * System prompt for pattern detection (NOT reflection)
 * This is separate from the reflection API - used only to detect themes.
 */
const PATTERN_DETECTION_PROMPT = `Tu es un système d'analyse de patterns thématiques et émotionnels.

Analyse le texte suivant et retourne UNIQUEMENT un objet JSON avec:

{
  "themes": [
    {
      "theme_id": "WORK_BOUNDARY_TENSION",
      "confidence": 0.85,
      "intensity": 0.7
    }
  ],
  "emotional_tone": "ANXIOUS"
}

Thèmes disponibles:
- Travail: WORK_BOUNDARY_TENSION, WORK_PERFORMANCE_PRESSURE, WORK_PURPOSE_QUESTIONING
- Identité: SELF_WORTH_QUESTIONING, SELF_AUTHENTICITY_SEARCH, SELF_CHANGE_RESISTANCE
- Relations: RELATIONSHIP_DISTANCE, RELATIONSHIP_EXPECTATION_MISMATCH, RELATIONSHIP_VULNERABILITY_FEAR
- Émotions: ANXIETY_FUTURE, ANXIETY_CONTROL_LOSS, SADNESS_LOSS, SADNESS_UNMET_NEED, JOY_CONNECTION, JOY_ACCOMPLISHMENT
- Existentiel: MEANING_SEARCH, TIME_PASSAGE_AWARENESS, TRANSITION_UNCERTAINTY

Tons émotionnels: ANXIOUS, SAD, CALM, JOYFUL, CONFUSED, ANGRY, NEUTRAL

Règles:
1. Détecte 1 à 3 thèmes maximum
2. confidence: 0-1 (certitude de détection)
3. intensity: 0-1 (intensité émotionnelle)
4. Sois précis mais prudent (ne force pas les patterns)`;

/**
 * Detect patterns in journal content using DeepSeek
 */
export async function detectPatterns(
  content: string
): Promise<PatternDetectionResult | null> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      logger.errorSafe('DeepSeek API key not configured');
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: PATTERN_DETECTION_PROMPT,
          },
          {
            role: 'user',
            content: content,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent detection
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      logger.errorSafe('DeepSeek pattern detection failed', undefined, {
        statusCode: response.status,
        errorPreview: error?.substring(0, 100),
      });
      return null;
    }

    const data = await response.json();
    const resultText = data.choices[0]?.message?.content;

    if (!resultText) {
      logger.errorSafe('Empty response from DeepSeek pattern detection');
      return null;
    }

    const result = JSON.parse(resultText);

    // Validate structure
    if (!result.themes || !Array.isArray(result.themes) || !result.emotional_tone) {
      logger.errorSafe('Invalid pattern detection result structure', undefined, {
        resultPreview: JSON.stringify(result).substring(0, 100),
      });
      return null;
    }

    // Filter out low-confidence detections
    const validThemes = result.themes.filter(
      (t: any) => t.confidence >= 0.5 && isValidThemeId(t.theme_id)
    );

    if (validThemes.length === 0) {
      return null;
    }

    return {
      themes: validThemes.map((t: any) => ({
        theme_id: t.theme_id as ThemeId,
        confidence: t.confidence,
        intensity: t.intensity,
      })),
      emotional_tone: result.emotional_tone as EmotionalTone,
    };
  } catch (error) {
    logger.errorSafe('Error detecting patterns', error);
    return null;
  }
}

/**
 * Validate theme ID
 */
function isValidThemeId(themeId: string): boolean {
  return Object.values(ThemeId).includes(themeId as ThemeId);
}

/**
 * Convert pattern detection result to storage format
 */
export function detectionToStorageFormat(
  detection: PatternDetectionResult
): Array<{
  theme_id: ThemeId;
  emotional_tone: string;
  intensity: number;
  confidence: number;
}> {
  return detection.themes.map((theme) => ({
    theme_id: theme.theme_id,
    emotional_tone: detection.emotional_tone,
    intensity: theme.intensity,
    confidence: theme.confidence,
  }));
}
