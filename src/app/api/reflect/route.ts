/**
 * Reflection API Route
 *
 * Premium feature: AI reflection with pattern-informed depth.
 * - Detects patterns in content
 * - Injects max 2 patterns into context
 * - Generates reflection with anti-meta safeguards
 * - Updates pattern storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from 'firebase-admin';
import { logger } from '@/lib/logger/safe';
import { getUserPatterns, batchUpdatePatterns, cleanupStalePatterns } from '@/lib/patterns/storage';
import { detectPatterns, detectionToStorageFormat } from '@/lib/patterns/detect';
import { selectPatternsForInjection, formatPatternsForContext } from '@/lib/patterns/inject';
import {
  containsMetaReference,
  validateResponse,
  getCorrectionPrompt,
} from '@/lib/patterns/anti-meta';

/**
 * System prompt for reflection (with implicit pattern awareness)
 */
const REFLECTION_SYSTEM_PROMPT = `Tu es Aurum, une présence émotionnelle qui accompagne l'introspection.

Tu n'es PAS :
- Un thérapeute qui analyse
- Un coach qui dirige
- Un outil qui optimise

Tu ES :
- Une présence qui accueille
- Un miroir qui reflète
- Une compagnie dans la complexité

Ton rôle : refléter ce qui est écrit AUJOURD'HUI, avec profondeur et douceur.

Ton ton :
- Jamais directif ("Comment peux-tu...", "As-tu pensé à...")
- Jamais performatif (metrics, objectifs, plans d'action)
- Toujours présent, doux, ouvert

Exemples de ce que tu DOIS faire :
✅ "Si cette tension avait une couleur, peut-être serait-elle..."
✅ "Il y a quelque chose dans cet espace entre ce que tu portes et ce que tu nommes..."
✅ "Cette frontière que tu traces... elle protège quoi, exactement ?"

Exemples de ce que tu NE DOIS JAMAIS faire :
❌ "Je reconnais ce pattern qui revient souvent"
❌ "Comment peux-tu améliorer cette situation ?"
❌ "As-tu pensé à essayer..."

Interdictions lexicales STRICTES (tu seras corrigé si tu les utilises) :
"je reconnais", "déjà", "avant", "souvent", "d'habitude", "encore", "la semaine dernière", "comme les autres fois", "récurrent"

Règle d'or : parle du PRÉSENT. Utilise le conditionnel pour les nuances ("il y a peut-être...").

Ta réponse doit faire entre 2 et 4 phrases courtes. Pas de paragraphes longs.`;

/**
 * POST /api/reflect
 * Body: { content: string, idToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { content, idToken } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Le contenu est requis' }, { status: 400 });
    }

    if (!idToken) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    // Verify user
    let userId: string;
    try {
      const decodedToken = await adminAuth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (error) {
      logger.errorSafe('Invalid ID token', error);
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Check DeepSeek API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      logger.errorSafe('DeepSeek API key not configured');
      return NextResponse.json({ error: 'Service temporairement indisponible' }, { status: 500 });
    }

    // 1. Detect patterns in current content
    logger.infoSafe('Detecting patterns', { userId });
    const detectionResult = await detectPatterns(content);

    // 2. Get existing user patterns
    const existingPatterns = await getUserPatterns(userId);

    // 3. Select patterns for injection (max 2)
    const injectedPatterns = selectPatternsForInjection(
      existingPatterns,
      detectionResult?.emotional_tone
    );

    // 4. Format pattern context
    const patternContext = injectedPatterns
      ? formatPatternsForContext(injectedPatterns)
      : '';

    // 5. Build messages for DeepSeek
    const messages: any[] = [
      {
        role: 'system',
        content: REFLECTION_SYSTEM_PROMPT,
      },
    ];

    // Add pattern context as system message (if patterns exist)
    if (patternContext) {
      messages.push({
        role: 'system',
        content: patternContext,
      });
    }

    // Add user content
    messages.push({
      role: 'user',
      content: content,
    });

    // 6. Call DeepSeek for reflection
    logger.infoSafe('Generating reflection', { userId, hasPatterns: !!patternContext });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: 0.8,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      logger.errorSafe('DeepSeek reflection failed', undefined, {
        statusCode: response.status,
        errorPreview: error?.substring(0, 100),
      });
      return NextResponse.json(
        { error: 'Erreur lors de la génération du reflet' },
        { status: response.status }
      );
    }

    const data = await response.json();
    let reflectionText = data.choices[0]?.message?.content;

    if (!reflectionText) {
      logger.errorSafe('Empty reflection from DeepSeek');
      return NextResponse.json(
        { error: 'Réponse vide du service d\'IA' },
        { status: 500 }
      );
    }

    // 7. Validate response (anti-meta check)
    const validation = validateResponse(reflectionText);

    if (!validation.valid) {
      if (validation.correctedText) {
        // Use sanitized version
        logger.infoSafe('Using sanitized reflection', { userId });
        reflectionText = validation.correctedText;
      } else if (validation.needsRegeneration) {
        // Regenerate with correction prompt
        logger.warnSafe('Regenerating reflection due to meta-references', { userId });

        const correctionMessages = [
          ...messages,
          {
            role: 'assistant',
            content: reflectionText,
          },
          {
            role: 'user',
            content: getCorrectionPrompt(reflectionText),
          },
        ];

        const correctionResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: correctionMessages,
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (correctionResponse.ok) {
          const correctionData = await correctionResponse.json();
          const correctedText = correctionData.choices[0]?.message?.content;

          if (correctedText && !containsMetaReference(correctedText)) {
            reflectionText = correctedText;
            logger.infoSafe('Successfully regenerated reflection', { userId });
          } else {
            logger.warnSafe('Regeneration still contains meta-references', { userId });
            // Use original but sanitized as fallback
            reflectionText = validation.correctedText || reflectionText;
          }
        }
      }
    }

    // 8. Update patterns in background (non-blocking)
    if (detectionResult) {
      const storageFormat = detectionToStorageFormat(detectionResult);
      batchUpdatePatterns(userId, storageFormat).catch((error) => {
        logger.errorSafe('Failed to update patterns (non-blocking)', error, { userId });
      });

      // Cleanup stale patterns (fire and forget)
      cleanupStalePatterns(userId).catch(() => {
        // Silent fail, non-critical
      });
    }

    // 9. Return reflection
    return NextResponse.json({
      reflection: reflectionText,
      patterns_detected: detectionResult ? detectionResult.themes.length : 0,
      patterns_used: injectedPatterns ? injectedPatterns.patterns.length : 0,
    });
  } catch (error) {
    logger.errorSafe('Error generating reflection', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la génération du reflet' },
      { status: 500 }
    );
  }
}
