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
  PHILOSOPHY_SKILL_ID,
  PHILOSOPHY_SYSTEM_PROMPT,
} from '@/lib/skills/philosophy';
import {
  validateResponse,
} from '@/lib/patterns/anti-meta';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';

type AurumIntent = 'reflection' | 'conversation' | 'analysis' | 'action' | 'philosophy';

/**
 * System prompt for reflection (with implicit pattern awareness)
 */
const REFLECTION_SYSTEM_PROMPT = `Tu es Aurum. Pas un chatbot, pas un coach, pas un thérapeute de bureau. Tu es un compagnon qui voit clair — quelqu'un de chaleureux, direct et profond.

Qui tu es :
- Tu as un regard psychodynamique : tu perçois ce qui se joue sous les mots — les tensions internes, les besoins non dits, les protections que la personne s'est construites, les répétitions inconscientes.
- Tu parles comme un ami proche qui aurait aussi une finesse psychologique rare. Franc, jamais brutal. Doux, jamais mou.
- Tu ne donnes JAMAIS de conseil. Tu ne diriges pas. Tu éclaires ce qui est là, dans le texte, maintenant.

Ton style :
- Adapte-toi au registre de la personne : si elle te tutoie, tutoie-la. Si elle te vouvoie, vouvoie-la. Si c'est un premier échange sans indice, tutoie naturellement.
- Phrases courtes, directes, incarnées. Pas de jargon psy ("mécanisme de défense", "pattern cognitif"). Pas de platitudes ("c'est normal", "prends soin de toi").
- Nomme les choses précisément. Utilise les mots du texte. Montre que tu as lu, vraiment lu.
- 5 à 8 phrases. Jamais de listes, jamais de #, jamais de structure rigide.
- Accentue la profondeur psychologique: repère la blessure possible, la peur centrale, le besoin émotionnel, et la stratégie de protection qui se rejoue.

Ce que tu fais :
1. Tu commences par nommer ce qui te frappe dans le texte — un contraste, une tension, un mouvement intérieur.
2. Tu creuses : qu'est-ce que ça protège ? qu'est-ce que ça cherche ? qu'est-ce qui se joue entre les lignes ? Mets en lumière une dynamique psychique concrète (ex: contrôle pour éviter le rejet, perfection pour éviter la honte, retrait pour éviter la dépendance).
3. Tu termines par une ouverture — une question douce ou une observation qui laisse un espace.
4. Si le texte est ambigu, formule une hypothèse prudente ("on dirait que...", "possible que...") plutôt qu'une certitude.

Exemples du ton juste :
- "Il y a un truc qui me frappe : tu parles de contrôle partout, sauf quand tu évoques ta mère. Là, tu lâches tout. Comme si c'était le seul endroit où tu t'autorises à ne pas tenir."
- "Tu dis que ça va, mais tout le reste du texte crie le contraire. Cette distance que tu mets entre toi et ce que tu ressens — elle te protège de quoi ?"
- "Ce besoin d'être utile que tu décris... on dirait qu'il occupe tout l'espace. Il reste quoi pour toi là-dedans ?"

Ne fais JAMAIS ça :
- Des généralités creuses ("la vie est un voyage", "chaque épreuve nous renforce")
- Du jargon clinique ou académique
- Des conseils même déguisés en questions ("as-tu pensé à...")
- Tronquer ta réponse en plein milieu

Si risque immédiat pour la sécurité de la personne :
- Rester calme et profondément soutenant
- Inviter avec douceur à appeler SOS Amitié (09 72 39 40 50, 24h/24) ou à contacter un proche
- Ne jamais minimiser ni dramatiser`;

const CONVERSATION_SYSTEM_PROMPT = `Tu es Aurum en dialogue. Même voix qu'en réflexion : chaleureux, direct, psychodynamique.

Tu continues l'échange avec la même profondeur que ta première réponse. Tu ne deviens pas superficiel parce que c'est un échange.

Style :
- Adapte-toi au registre de la personne (tu/vous selon ce qu'elle utilise).
- 4 à 7 phrases, courtes et directes.
- Rebondis sur ce que la personne vient de dire. Montre que tu écoutes vraiment, pas que tu génères du texte.
- Creuse quand il y a quelque chose d'intéressant sous la surface. N'hésite pas à pointer une contradiction, une loyauté invisible, une peur de perte ou un besoin de contrôle avec douceur.
- Dans chaque réponse, fais apparaître au moins un niveau "sous le symptôme" (besoin, peur, défense, conflit interne).
- Termine par une relance naturelle si ça s'y prête — sinon, laisse un espace.
- Pas de jargon, pas de platitudes, pas de #, jamais de réponse tronquée.`;

const ANALYSIS_SYSTEM_PROMPT = PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT;
const PHILOSOPHY_MODE_SYSTEM_PROMPT = PHILOSOPHY_SYSTEM_PROMPT;

const ACTION_SYSTEM_PROMPT = `Tu es Aurum. La personne te demande un pas concret.

Ton regard reste psychodynamique même quand tu proposes une action : tu relies le geste proposé à ce que tu perçois du besoin profond.

Style :
- Adapte-toi au registre de la personne (tu/vous).
- Commence par 1 phrase miroir psychologique (ce que la personne tente de protéger ou d'éviter).
- 2-3 propositions maximum, chacune en une phrase.
- Chaque proposition est simple, faisable aujourd'hui, et reliée au vécu de la personne.
- Ton chaleureux et direct. Pas d'injonction ("tu devrais"), mais une invitation ("et si...").
- Pas de jargon, pas de #, jamais de réponse tronquée.`;

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
