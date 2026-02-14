/**
 * Reflection API Route
 *
 * Premium feature: guided reflection with pattern-informed depth.
 * - Detects patterns in content
 * - Injects max 2 patterns into context
 * - Generates reflection with anti-meta safeguards
 * - Updates pattern storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';
import { logger } from '@/lib/logger/safe';
import { getUserPatterns, batchUpdatePatterns, cleanupStalePatterns } from '@/lib/patterns/storage';
import { detectPatterns, detectionToStorageFormat } from '@/lib/patterns/detect';
import { selectPatternsForInjection, formatPatternsForContext } from '@/lib/patterns/inject';
import {
  PSYCHOLOGIST_ANALYST_SKILL_ID,
  PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT,
} from '@/lib/skills/psychologist-analyst';
import {
  validateResponse,
} from '@/lib/patterns/anti-meta';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

type AurumIntent = 'reflection' | 'conversation' | 'analysis' | 'action';

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
- Tutoiement naturel (toujours "tu", jamais "vous")
- Jamais directif ("Comment peux-tu...", "As-tu pensé à...")
- Jamais performatif (metrics, objectifs, plans d'action)
- Toujours présent, doux, ouvert
- Précis et incarné (pas de généralités)

Exemples de ce que tu DOIS faire :
✅ "Si cette tension avait une couleur, peut-être serait-elle..."
✅ "Il y a quelque chose dans cet espace entre ce que tu portes et ce que tu nommes..."
✅ "Cette frontière que tu traces... elle protège quoi, exactement ?"

Exemples de ce que tu NE DOIS JAMAIS faire :
❌ "Je reconnais ce pattern qui revient souvent"
❌ "Comment peux-tu améliorer cette situation ?"
❌ "As-tu pensé à essayer..."
❌ "C'est normal de se sentir ainsi."
❌ "Vous n'êtes pas seul."
❌ Utiliser "vous" au lieu de "tu"
❌ Tronquer ta réponse en plein milieu

Interdictions lexicales STRICTES (tu seras corrigé si tu les utilises) :
"je reconnais", "déjà", "avant", "souvent", "d'habitude", "encore", "la semaine dernière", "comme les autres fois", "récurrent", "c'est normal", "tu n'es pas seul", "vous n'êtes pas seul", "vous"

Interdictions formelles :
- Ne JAMAIS utiliser de # pour structurer ta réponse
- Ne JAMAIS tronquer (finir en plein milieu d'une phrase)

Règle d'or : parle du PRÉSENT. Utilise le conditionnel pour les nuances ("il y a peut-être...").

Structure attendue (obligatoire) :
1) Une phrase qui nomme la matière exacte du texte (une image, un contraste, un geste).
2) Une phrase qui ouvre un angle neuf, sans diriger.
3) Termine par une question de relance douce si approprié (max 1), ou une ouverture.

Ta réponse doit faire entre 3 et 5 phrases courtes. Pas de paragraphes longs.

Si risque immédiat pour la sécurité de la personne :
- Rester calme et profondément soutenant
- Inviter avec douceur à appeler SOS Amitié (09 72 39 40 50, 24h/24) ou à contacter un proche
- Ne jamais minimiser ni dramatiser`;

const CONVERSATION_SYSTEM_PROMPT = `Tu es Aurum en mode dialogue.

Objectif:
- Continuer l'échange de façon naturelle et chaleureuse.
- Répondre à la dernière intention de l'utilisateur, sans jugement.

Style:
- Tutoiement naturel (toujours "tu", jamais "vous")
- 2 à 5 phrases courtes.
- Concret, empathique, sans jargon.
- Ne JAMAIS tronquer ta réponse
- Ne JAMAIS utiliser de # pour structurer
- Termine par une question ouverte pour relancer le dialogue si approprié (max 1).`;

const ANALYSIS_SYSTEM_PROMPT = PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT;

const ACTION_SYSTEM_PROMPT = `Tu es Aurum en mode passage à l'action douce.

Objectif:
- Proposer un pas concret, réaliste, faisable aujourd'hui.

Contraintes:
- Tutoiement naturel (toujours "tu", jamais "vous")
- Maximum 3 propositions.
- Ton doux, non injonctif.
- Chaque proposition en une ligne, très simple.
- Ne JAMAIS utiliser de # pour structurer
- Ne JAMAIS tronquer ta réponse`;

function detectAurumIntent(content: string): AurumIntent {
  const text = content.toLowerCase();
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
  if (intent === 'conversation') return CONVERSATION_SYSTEM_PROMPT;
  if (intent === 'analysis') return ANALYSIS_SYSTEM_PROMPT;
  if (intent === 'action') return ACTION_SYSTEM_PROMPT;
  return REFLECTION_SYSTEM_PROMPT;
}

function getSkillIdForIntent(intent: AurumIntent): string | null {
  if (intent === 'analysis') return PSYCHOLOGIST_ANALYST_SKILL_ID;
  return null;
}

/**
 * POST /api/reflect
 * Body: { content: string, idToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { content, idToken, entryId, userMessage } = await request.json();

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

    // Rate limiting check
    const rateLimitResult = await rateLimit(RateLimitPresets.reflect(userId));
    if (!rateLimitResult.success) {
      const minutesUntilReset = Math.ceil((rateLimitResult.reset - Date.now()) / 60000);

      return NextResponse.json(
        {
          error: `Trop de demandes de reflets. Réessaye dans ${minutesUntilReset} minute${minutesUntilReset > 1 ? 's' : ''}.`,
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
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

    // 1. Detect intent (instant, no API call)
    const intent = detectAurumIntent(content);
    const skillId = getSkillIdForIntent(intent);

    // 2. Detect patterns + get existing patterns IN PARALLEL
    logger.infoSafe('Detecting patterns (parallel)', { userId });
    const [detectionResult, existingPatterns] = await Promise.all([
      detectPatterns(content),
      getUserPatterns(userId),
    ]);

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

    if (patternContext) {
      messages.push({
        role: 'system',
        content: patternContext,
      });
    }

    messages.push({
      role: 'user',
      content: content,
    });

    // 6. Call DeepSeek with STREAMING
    logger.infoSafe('Generating reflection (streaming)', { userId, hasPatterns: !!patternContext, intent, skillId });

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
        stream: true,
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

    if (!response.body) {
      return NextResponse.json(
        { error: 'Réponse vide du service Aurum' },
        { status: 500 }
      );
    }

    // 7. Stream response to client via SSE
    // Background tasks (pattern update, conversation persist) run after stream ends
    const deepSeekBody = response.body;
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullText = '';

    const stream = new ReadableStream({
      async start(ctrl) {
        const reader = deepSeekBody.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) {
                  fullText += token;
                  // SSE format: data: <json>\n\n
                  ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                }
              } catch {
                // Skip malformed JSON chunks
              }
            }
          }

          // Send anti-meta sanitized text if needed
          const validation = validateResponse(fullText);
          if (!validation.valid && validation.correctedText) {
            fullText = validation.correctedText;
            // Send a replacement event so client uses sanitized version
            ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ replace: fullText })}\n\n`));
          }

          // Send final metadata
          ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({
            done: true,
            intent,
            skill_used: skillId,
            patterns_detected: detectionResult ? detectionResult.themes.length : 0,
            patterns_used: injectedPatterns ? injectedPatterns.patterns.length : 0,
          })}\n\n`));

          ctrl.close();
        } catch (err) {
          ctrl.error(err);
        }

        // 8. Background: update patterns (non-blocking, after stream)
        if (detectionResult) {
          const storageFormat = detectionToStorageFormat(detectionResult);
          batchUpdatePatterns(userId, storageFormat).catch((error) => {
            logger.errorSafe('Failed to update patterns (non-blocking)', error, { userId });
          });
          cleanupStalePatterns(userId).catch(() => {});
        }

        // Persist conversation turns
        if (entryId && typeof entryId === 'string') {
          const conversationRef = db
            .collection('users')
            .doc(userId)
            .collection('entries')
            .doc(entryId)
            .collection('aurumConversation');

          if (userMessage && typeof userMessage === 'string') {
            conversationRef.add({
              role: 'user',
              text: userMessage.trim(),
              createdAt: Timestamp.now(),
              intent,
              skillId,
            }).catch(() => {});
          }

          conversationRef.add({
            role: 'aurum',
            text: fullText,
            createdAt: Timestamp.now(),
            intent,
            skillId,
          }).catch(() => {});
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    logger.errorSafe('Error generating reflection', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la génération du reflet' },
      { status: 500 }
    );
  }
}
