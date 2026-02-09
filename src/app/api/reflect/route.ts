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
import { auth } from '@/lib/firebase/admin';
import { logger } from '@/lib/logger/safe';
import { getUserPatterns, batchUpdatePatterns, cleanupStalePatterns } from '@/lib/patterns/storage';
import { detectPatterns, detectionToStorageFormat } from '@/lib/patterns/detect';
import { selectPatternsForInjection, formatPatternsForContext } from '@/lib/patterns/inject';
import {
  PSYCHOLOGIST_ANALYST_SKILL_ID,
  PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT,
} from '@/lib/skills/psychologist-analyst';
import {
  UX_PSYCHOLOGY_SKILL_ID,
  UX_PSYCHOLOGY_SYSTEM_PROMPT,
} from '@/lib/skills/ux-psychology';
import {
  containsMetaReference,
  validateResponse,
  getCorrectionPrompt,
} from '@/lib/patterns/anti-meta';

type AurumIntent = 'reflection' | 'conversation' | 'analysis' | 'action' | 'ux_psychology';

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

const CONVERSATION_SYSTEM_PROMPT = `Tu es Aurum en mode dialogue.

Objectif:
- Continuer l'échange de façon naturelle et chaleureuse.
- Répondre à la dernière intention de l'utilisateur, sans jugement.

Style:
- 2 à 5 phrases courtes.
- Concret, empathique, sans jargon.
- Tu peux poser au plus UNE question ouverte pour relancer le dialogue.`;

const ANALYSIS_SYSTEM_PROMPT = PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT;

const ACTION_SYSTEM_PROMPT = `Tu es Aurum en mode passage à l'action douce.

Objectif:
- Proposer un pas concret, réaliste, faisable aujourd'hui.

Contraintes:
- Maximum 3 propositions.
- Ton doux, non injonctif.
- Chaque proposition en une ligne, très simple.`;

function detectAurumIntent(content: string): AurumIntent {
  const text = content.toLowerCase();
  if (/(ux|ui|landing|onboarding|pricing|cta|conversion|funnel|hero section|social proof|hick|cognitive load|goal gradient|dark pattern)/.test(text)) {
    return 'ux_psychology';
  }
  if (/(que faire|que puis-je faire|plan|prochaine etape|prochaine étape|action|aide moi a agir|aide-moi a agir)/.test(text)) {
    return 'action';
  }
  if (/(analyse|analyse-moi|explique|clarifie|clarifier|comprendre|pourquoi)/.test(text)) {
    return 'analysis';
  }
  if (/(conversation en cours|utilisateur:|aurum:|reponds|réponds|continuer l'echange|continuer l'échange)/.test(text)) {
    return 'conversation';
  }
  return 'reflection';
}

function getSystemPromptForIntent(intent: AurumIntent): string {
  if (intent === 'ux_psychology') return UX_PSYCHOLOGY_SYSTEM_PROMPT;
  if (intent === 'conversation') return CONVERSATION_SYSTEM_PROMPT;
  if (intent === 'analysis') return ANALYSIS_SYSTEM_PROMPT;
  if (intent === 'action') return ACTION_SYSTEM_PROMPT;
  return REFLECTION_SYSTEM_PROMPT;
}

function getSkillIdForIntent(intent: AurumIntent): string | null {
  if (intent === 'ux_psychology') return UX_PSYCHOLOGY_SKILL_ID;
  if (intent === 'analysis') return PSYCHOLOGIST_ANALYST_SKILL_ID;
  return null;
}

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
      return NextResponse.json(
        { error: 'Votre session a expiré. Merci de vous reconnecter pour recevoir un reflet.' },
        { status: 401 }
      );
    }

    // Verify user
    let userId: string;
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (error) {
      logger.errorSafe('Invalid ID token', error);
      return NextResponse.json(
        { error: 'Votre session n\'est plus valide. Reconnectez-vous puis réessayez.' },
        { status: 401 }
      );
    }

    // Check DeepSeek API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey.includes('mock')) {
      logger.errorSafe('DeepSeek API key not configured');
      return NextResponse.json(
        { error: 'La clé DeepSeek n\'est pas configurée en environnement local. Ajoutez DEEPSEEK_API_KEY.' },
        { status: 500 }
      );
    }

    // 1. Detect patterns in current content
    logger.infoSafe('Detecting patterns', { userId });
    const detectionResult = await detectPatterns(content);
    const intent = detectAurumIntent(content);
    const skillId = getSkillIdForIntent(intent);

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
        content: getSystemPromptForIntent(intent),
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
    logger.infoSafe('Generating reflection', { userId, hasPatterns: !!patternContext, intent, skillId });

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
      intent,
      skill_used: skillId,
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
