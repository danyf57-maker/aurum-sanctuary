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
import { logger } from '@/lib/logger/safe';
import { getUserPatterns, batchUpdatePatterns, cleanupStalePatterns } from '@/lib/patterns/storage';
import { detectPatterns, detectionToStorageFormat } from '@/lib/patterns/detect';
import { selectPatternsForInjection, formatPatternsForContext } from '@/lib/patterns/inject';
import {
  PSYCHOLOGIST_ANALYST_SKILL_ID,
  PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT,
} from '@/lib/skills/psychologist-analyst';
import {
  PHILOSOPHY_SKILL_ID,
  PHILOSOPHY_SYSTEM_PROMPT,
} from '@/lib/skills/philosophy';
import {
  validateResponse,
} from '@/lib/patterns/anti-meta';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { buildEvidencePrompt } from '@/lib/ai/evidence/prompt-policy';
import {
  buildStrictReplyLanguageInstruction,
  resolveReplyLanguage,
} from '@/lib/ai/language';
import { buildAurumResponseContract } from '@/lib/ai/aurum-response-contract';
import { getFreeEntryState, resolveAurumAccessState } from '@/lib/billing/aurum-access';

type AurumIntent = 'reflection' | 'conversation' | 'analysis' | 'action' | 'philosophy';
type SupportedLocale = 'fr' | 'en';

/**
 * System prompt for reflection (with implicit pattern awareness)
 */
const REFLECTION_SYSTEM_PROMPT = `You are Aurum in reflection mode.

Your role is to help the user see more clearly what is already present in their writing.

Focus:
- Notice one central tension, contrast, or emotional movement.
- Stay grounded in the exact wording and images from the text.
- If you go deeper, do it carefully and tentatively.
- Keep the reply warm, direct, and alive.

If there is immediate risk:
- stay calm and supportive
- encourage the user to contact local emergency help or a trusted person right now
- do not minimize and do not dramatize`;

const CONVERSATION_SYSTEM_PROMPT = `You are Aurum in conversation mode.

Keep the same warmth and depth as the first reflection, but answer the user's latest message first.

Focus:
- pick one thread and move it forward
- stay concrete
- prefer one sharp observation or one good question over a broad interpretation
- keep the exchange human, calm, and precise`;

const ANALYSIS_SYSTEM_PROMPT = PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT;
const PHILOSOPHY_MODE_SYSTEM_PROMPT = PHILOSOPHY_SYSTEM_PROMPT;

const ACTION_SYSTEM_PROMPT = `You are Aurum in action mode.

The user asked for a next step. Stay reflective before being practical.

Focus:
- begin with one short mirrored observation grounded in the text
- offer one or two gentle invitations maximum
- keep every next step small, optional, and emotionally coherent
- never sound directive, clinical, or productivity-driven`;

function detectAurumIntent(content: string): AurumIntent {
  const text = content.toLowerCase();
  if (/(que faire|que puis-je faire|plan|prochaine etape|prochaine étape|action|aide moi a agir|aide-moi a agir)/.test(text)) {
    return 'action';
  }
  if (/(philosophie|philosophique|epistemologie|épistémologie|metaphysique|métaphysique|ethique|éthique|platon|aristote|kant|nietzsche|stoicisme|stoïcisme|existentialisme)/.test(text)) {
    return 'philosophy';
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
  if (intent === 'philosophy') return PHILOSOPHY_MODE_SYSTEM_PROMPT;
  return REFLECTION_SYSTEM_PROMPT;
}

function getSkillIdForIntent(intent: AurumIntent): string | null {
  if (intent === 'analysis') return PSYCHOLOGIST_ANALYST_SKILL_ID;
  if (intent === 'philosophy') return PHILOSOPHY_SKILL_ID;
  return null;
}

function getEvidencePromptModeForIntent(intent: AurumIntent): 'reflect' | 'mirror' {
  if (intent === 'conversation') return 'mirror';
  return 'reflect';
}

function getResponseContractModeForIntent(intent: AurumIntent): Parameters<typeof buildAurumResponseContract>[0] {
  if (intent === 'conversation') return 'conversation';
  if (intent === 'analysis') return 'analysis';
  if (intent === 'action') return 'action';
  if (intent === 'philosophy') return 'reflection';
  return 'reflection';
}

function normalizeRequestedLocale(value: unknown): SupportedLocale | null {
  if (value === 'fr' || value === 'en') return value;
  return null;
}

/**
 * POST /api/reflect
 * Body: { content: string, idToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { content, idToken, entryId, userMessage, locale } = await request.json();
    const requestedLocale = normalizeRequestedLocale(locale);

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

    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    const { hasSubscription: hasPremiumAccess } = resolveAurumAccessState(userData);
    const { entriesUsed, entriesLimit, hasReachedLimit } = getFreeEntryState(userData);
    const isConversationFollowUp = typeof userMessage === 'string' && userMessage.trim().length > 0;

    if (isConversationFollowUp && !hasPremiumAccess && hasReachedLimit) {
      const errorMessage = requestedLocale === 'fr'
        ? `Tu as utilisé tes ${entriesLimit} pages gratuites. Passe au premium pour continuer l'échange avec Aurum.`
        : `You have used your ${entriesLimit} free pages. Start your trial to keep the conversation with Aurum going.`;

      return NextResponse.json(
        {
          error: errorMessage,
          freeLimitReached: true,
          entriesUsed,
          entriesLimit,
        },
        { status: 402 },
      );
    }

    // 1. Detect intent (instant, no API call)
    const intent = detectAurumIntent(content);
    const skillId = getSkillIdForIntent(intent);
    const userLanguage = resolveReplyLanguage(userMessage || content, requestedLocale, content);

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
        content: buildStrictReplyLanguageInstruction(userLanguage, requestedLocale),
      },
      {
        role: 'system',
        content: buildEvidencePrompt(getEvidencePromptModeForIntent(intent)),
      },
      {
        role: 'system',
        content: buildAurumResponseContract(getResponseContractModeForIntent(intent)),
      },
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
        temperature: 1.5,
        max_tokens: 500,
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
              createdAt: new Date(),
              intent,
              skillId,
            }).catch(() => {});
          }

          conversationRef.add({
            role: 'aurum',
            text: fullText,
            createdAt: new Date(),
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
