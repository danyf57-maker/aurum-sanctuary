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
} from '@/lib/skills/psychologist-analyst';
import {
  PHILOSOPHY_SKILL_ID,
  PHILOSOPHY_SYSTEM_PROMPT,
} from '@/lib/skills/philosophy';
import {
  validateResponse,
} from '@/lib/patterns/anti-meta';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import {
  buildStrictReplyLanguageInstruction,
  resolvePromptLanguage,
  resolveReplyLanguage,
} from '@/lib/ai/language';
import { buildAurumSystemPrompt } from '@/lib/ai/aurum-system-prompts';
import {
  getFreeAurumConversationState,
  getFreeEntryState,
  resolveAurumAccessState,
} from '@/lib/billing/aurum-access';
import { resolveOptionalFirstName } from '@/lib/profile/first-name';
import type { Locale } from '@/lib/locale';

type AurumIntent = 'reflection' | 'conversation' | 'analysis' | 'clarify' | 'action' | 'philosophy';
type SupportedLocale = Locale;

const PHILOSOPHY_MODE_SYSTEM_PROMPT = PHILOSOPHY_SYSTEM_PROMPT;
const CLARIFY_SYSTEM_PROMPT = `You are Aurum when the text carries a real tension, but not yet enough material for a solid analysis.

Do not fill the gap with fake depth. Help the person make the pain point clearer.

Style:
- Match the user's register naturally.
- 3 to 4 sentences maximum.
- Start by naming what is already visible without pretending to know too much.
- Then say what is still unclear if we want to understand properly: fear, fatigue, shame, conflict, overload, or another center if the text supports it.
- Use one focused Socratic question tied to a moment, a thought, or a turning point.
- End with one concrete, targeted question that helps the person reveal what hurts most.
- Never use vague questions like "Can you tell me more?"
- No jargon, no theory lecture, no advice.

Examples of the right tone:
- "Something is clearly tight here, but it is not yet clear whether the heaviest part is fear, exhaustion, or the fact that you have to keep holding. What weighs the most, concretely?"
- "There is a real tension, but its center is still blurry: is it mostly anger held in, guilt, or overload? Which part feels the heaviest right now?"
- "Let's stay with the moment it shifts. Just before you pull back, what do you tell yourself?"`;

const ACTION_INTENT_REGEX = /(que faire|que puis-je faire|plan|prochaine etape|prochaine étape|action|aide moi a agir|aide-moi a agir|what should i do|what can i do|next step|what now|que hago|qué hago|que puedo hacer|qué puedo hacer|que devo fazer|o que faço|o que faco|o que posso fazer|cosa posso fare|cosa dovrei fare|che faccio|was soll ich tun|was kann ich tun|nächster schritt|naechster schritt)/;
const PHILOSOPHY_INTENT_REGEX = /(philosophie|philosophique|epistemologie|épistémologie|metaphysique|métaphysique|ethique|éthique|philosophy|philosophical|epistemology|metaphysics|ethics|filosofia|filosófico|filosofico|epistemologia|metafisica|etica|filosofia|filosofica|epistemologia|metafisica|ética|filosofia|filosófica|epistemología|metafísica|ethik|philosophisch|epistemologie|metaphysik|platon|aristote|kant|nietzsche|stoicisme|stoïcisme|stoicism|estoicismo|stoizismus|existentialisme|existentialism|existencialismo|existenzialismus)/;
const ANALYSIS_INTENT_REGEX = /(analyse|analyse-moi|explique|clarifie|clarifier|comprendre|pourquoi|analyze|analyse this|explain|clarify|understand|why|analiza|analise|explica|aclara|comprender|por que|por qué|analizza|spiega|chiarisci|capire|perché|porque|analysiere|erkläre|erklaere|kläre|klaere|verstehen|warum)/;
const CONVERSATION_INTENT_REGEX = /(conversation en cours|utilisateur:|aurum:|reponds|réponds|continuer l'echange|continuer l'échange|reply|respond|keep going|continue the conversation|responde|segue|continua|antworten|weiter)/;
const LIGHT_ACKNOWLEDGEMENT_REGEX = /^(ok|okay|ok merci|merci|merci beaucoup|d'accord|dac|ça va|ca va|oui|non|peut-etre|peut-être|je ne sais pas|jsp|maybe|yes|no|thanks|thank you|i don't know|idk|vale|gracias|si|sí|no se|no sé|obrigado|obrigada|talvez|nao sei|não sei|grazie|forse|ich weiss nicht|ich weiß nicht|danke)$/;
const STRONG_PSYCH_STRUCTURE_REGEX = /(mais|puis|ensuite|dès que|des que|quand|chaque fois|toujours|jamais|souvent|parfois|alors|sauf que|en même temps|en meme temps|pendant que|tout en|yet|but|then|when|whenever|every time|always|never|often|sometimes|while|at the same time|as soon as|pero|entonces|cuando|cada vez|siempre|mai|poi|quando|sempre|aber|dann|wenn|jedes mal|immer|mas|depois|quando|sempre)/i;
const CORE_PAIN_REGEX = /(peur|honte|colère|colere|fatigue|épuis|epuis|culpabil|triste|tristesse|angoiss|stress|pression|bloqu|vide|solitude|aband|rejet|envahi|fear|ashamed|shame|guilt|guilty|afraid|pain|hurt|empty|alone|stuck|numb|tired|pressure|panic|anxiety|miedo|vergüenza|verguenza|culpa|vacío|vacio|rabia|fatica|vergogna|colpa|vuoto|paura|scham|schuld|leer|angst|medo|culpa|vazio|cansaço|cansaco|vergonha)/i;

function detectAurumIntent(content: string, userMessage?: string): AurumIntent {
  const latestText = (userMessage || content).toLowerCase();
  const fullText = content.toLowerCase();
  const isConversationFollowUp = typeof userMessage === 'string' && userMessage.trim().length > 0;

  if (isConversationFollowUp) {
    if (PHILOSOPHY_INTENT_REGEX.test(latestText)) {
      return 'philosophy';
    }
    if (ACTION_INTENT_REGEX.test(latestText)) {
      return 'action';
    }
    if (LIGHT_ACKNOWLEDGEMENT_REGEX.test(latestText) || CONVERSATION_INTENT_REGEX.test(latestText)) {
      return 'conversation';
    }
    if (ANALYSIS_INTENT_REGEX.test(latestText)) {
      return 'analysis';
    }
    if (shouldAskForClarification(userMessage || '', content, true)) {
      return 'clarify';
    }
    return 'analysis';
  }

  const text = fullText;
  if (ACTION_INTENT_REGEX.test(text)) {
    return 'action';
  }
  if (PHILOSOPHY_INTENT_REGEX.test(text)) {
    return 'philosophy';
  }
  if (ANALYSIS_INTENT_REGEX.test(text)) {
    return 'analysis';
  }
  if (CONVERSATION_INTENT_REGEX.test(text)) {
    return 'conversation';
  }
  if (shouldAskForClarification(content, content, false)) {
    return 'clarify';
  }
  return 'reflection';
}

function getSystemPromptForIntent(intent: AurumIntent, language: ReturnType<typeof resolvePromptLanguage>): string {
  if (intent === 'conversation') return buildAurumSystemPrompt('conversation', language);
  if (intent === 'analysis') return buildAurumSystemPrompt('analysis', language);
  if (intent === 'clarify') return CLARIFY_SYSTEM_PROMPT;
  if (intent === 'action') return buildAurumSystemPrompt('action', language);
  if (intent === 'philosophy') return PHILOSOPHY_MODE_SYSTEM_PROMPT;
  return buildAurumSystemPrompt('reflection', language);
}

function getSkillIdForIntent(intent: AurumIntent): string | null {
  if (intent === 'analysis') return PSYCHOLOGIST_ANALYST_SKILL_ID;
  if (intent === 'philosophy') return PHILOSOPHY_SKILL_ID;
  return null;
}

function normalizeRequestedLocale(value: unknown): SupportedLocale | null {
  if (value === 'fr' || value === 'en') return value;
  return null;
}

function countWords(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function shouldAskForClarification(primaryText: string, fullContext: string, isConversationFollowUp: boolean): boolean {
  const text = primaryText.trim();
  if (!text) return false;
  if (LIGHT_ACKNOWLEDGEMENT_REGEX.test(text)) return false;
  if (ANALYSIS_INTENT_REGEX.test(text) || ACTION_INTENT_REGEX.test(text) || PHILOSOPHY_INTENT_REGEX.test(text)) return false;

  const wordCount = countWords(text);
  const hasStrongStructure = STRONG_PSYCH_STRUCTURE_REGEX.test(text);
  const hasNamedPain = CORE_PAIN_REGEX.test(text);
  const hasQuestion = /\?/.test(text);
  const hasLongContext = countWords(fullContext) >= 60;

  if (hasStrongStructure && wordCount >= 18) return false;
  if (wordCount >= 35) return false;
  if (wordCount <= 5) return false;

  if (isConversationFollowUp) {
    return hasNamedPain && !hasStrongStructure;
  }

  return !hasLongContext && hasNamedPain && !hasStrongStructure && !hasQuestion;
}

function isVeryShortFollowUp(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return trimmed.length <= 24 || countWords(trimmed) <= 4;
}

function buildShortFollowUpInstruction(language: ReturnType<typeof resolvePromptLanguage>): string {
  switch (language) {
    case 'fr':
      return "La dernière relance de l'utilisateur est très courte. Ne la gonfle pas artificiellement. Reste au plus près de ce qui est dit, mais si ce bref message montre clairement une hésitation, un retrait ou un blocage, tu peux le nommer en une ligne. Réponds en 1 à 3 phrases courtes maximum.";
    case 'es':
      return 'El ultimo mensaje del usuario es muy corto. No lo infles artificialmente. Mantente cerca de lo dicho, pero si ese mensaje breve muestra con claridad una vacilacion, una retirada o un bloqueo, puedes nombrarlo en una linea. Responde en 1 a 3 frases breves como maximo.';
    case 'it':
      return "L'ultimo messaggio dell'utente e molto breve. Non gonfiarlo artificialmente. Resta vicino a cio che viene detto, ma se quel messaggio breve mostra chiaramente un'esitazione, un ritiro o un blocco, puoi nominarlo in una riga. Rispondi in 1 a 3 frasi brevi al massimo.";
    case 'de':
      return 'Die letzte Nachricht des Nutzers ist sehr kurz. Blaese sie nicht kuenstlich auf. Bleib nah am Gesagten, aber wenn diese kurze Nachricht klar Zoegern, Rueckzug oder Blockade zeigt, kannst du das in einer Zeile benennen. Antworte in hoechstens 1 bis 3 kurzen Saetzen.';
    case 'pt':
      return 'A ultima mensagem do utilizador e muito curta. Nao a infles artificialmente. Fica perto do que foi dito, mas se esta mensagem curta mostrar claramente hesitacao, retraimento ou bloqueio, podes nomea-lo numa linha. Responde em no maximo 1 a 3 frases curtas.';
    case 'en':
    default:
      return 'The latest user follow-up is very short. Do not inflate it artificially. Stay close to what was said, but if that brief reply clearly shows hesitation, retreat, or blockage, you may name that in one line. Reply in 1 to 3 short sentences at most.';
  }
}

function buildConversationPriorityInstruction(
  language: ReturnType<typeof resolvePromptLanguage>,
  latestUserMessage: string,
): string {
  const quotedMessage = latestUserMessage.replace(/\s+/g, ' ').trim();

  switch (language) {
    case 'fr':
      return `Dernier message de la personne, à traiter en premier : "${quotedMessage}". Réponds d'abord à cela. Le reste de la conversation n'est qu'un arrière-plan. Si ce dernier message déplace, ferme ou contredit quelque chose, pars de là.`;
    case 'es':
      return `Ultimo mensaje de la persona, que debes tratar primero: "${quotedMessage}". Responde primero a eso. El resto de la conversacion es solo contexto de fondo. Si este ultimo mensaje desplaza, cierra o contradice algo, parte de ahi.`;
    case 'it':
      return `Ultimo messaggio della persona, da trattare per primo: "${quotedMessage}". Rispondi prima a questo. Il resto della conversazione e solo sfondo. Se quest'ultimo messaggio sposta, chiude o contraddice qualcosa, parti da li.`;
    case 'de':
      return `Letzte Nachricht der Person, die du zuerst behandeln sollst: "${quotedMessage}". Antworte zuerst darauf. Der Rest des Gespraechs ist nur Hintergrund. Wenn diese letzte Nachricht etwas verschiebt, schliesst oder widerspricht, setze dort an.`;
    case 'pt':
      return `Ultima mensagem da pessoa, a tratar primeiro: "${quotedMessage}". Responde primeiro a isso. O resto da conversa e apenas contexto de fundo. Se esta ultima mensagem desloca, fecha ou contradiz algo, parte dai.`;
    case 'en':
    default:
      return `Latest user message, to be handled first: "${quotedMessage}". Respond to that first. The rest of the conversation is background only. If this latest message shifts, closes down, or contradicts something, start there.`;
  }
}

/**
 * POST /api/reflect
 * Body: { content: string, idToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { content, idToken, entryId, userMessage, locale } = await request.json();
    const normalizedUserMessage = typeof userMessage === 'string' ? userMessage.trim() : '';
    const requestedLocale = normalizeRequestedLocale(locale);
    const normalizedEntryId = typeof entryId === 'string' && entryId.trim().length > 0
      ? entryId.trim()
      : null;

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
    const firstName = resolveOptionalFirstName({
      firstName: userData.firstName,
      displayName: userData.displayName,
      email: userData.email,
    });
    const { hasSubscription: hasPremiumAccess } = resolveAurumAccessState(userData);
    const { entriesUsed, entriesLimit, hasReachedLimit } = getFreeEntryState(userData);
    const isConversationFollowUp = normalizedUserMessage.length > 0;
    const entryRef = normalizedEntryId
      ? db.collection('users').doc(userId).collection('entries').doc(normalizedEntryId)
      : null;

    if (isConversationFollowUp && !normalizedEntryId) {
      return NextResponse.json(
        {
          error: requestedLocale === 'fr'
            ? 'Impossible de poursuivre cet échange sans sujet associé.'
            : 'Unable to continue this exchange without a linked topic.',
        },
        { status: 400 },
      );
    }

    let conversationState: ReturnType<typeof getFreeAurumConversationState> | null = null;
    if (entryRef && !hasPremiumAccess) {
      const entrySnap = await entryRef.get();
      if (!entrySnap.exists) {
        return NextResponse.json(
          {
            error: requestedLocale === 'fr'
              ? 'Ce sujet est introuvable. Recharge la page puis réessaie.'
              : 'This topic could not be found. Reload the page and try again.',
          },
          { status: 404 },
        );
      }

      conversationState = getFreeAurumConversationState(entrySnap.data() || {});
      if (conversationState.hasReachedLimit) {
        const errorMessage = requestedLocale === 'fr'
          ? `Tu as déjà utilisé les ${conversationState.repliesLimit} réponses gratuites d'Aurum sur ce sujet. Lance ton essai pour continuer ici.`
          : `You have already used the ${conversationState.repliesLimit} free Aurum replies on this topic. Start your trial to keep going here.`;

        return NextResponse.json(
          {
            error: errorMessage,
            conversationLimitReached: true,
            repliesUsed: conversationState.repliesUsed,
            repliesLimit: conversationState.repliesLimit,
            entriesUsed,
            entriesLimit,
            freeLimitReached: hasReachedLimit,
          },
          { status: 402 },
        );
      }
    }

    // 1. Detect intent (instant, no API call)
    const intent = detectAurumIntent(content, normalizedUserMessage || undefined);
    const skillId = getSkillIdForIntent(intent);
    const userLanguage = resolveReplyLanguage(normalizedUserMessage || content, requestedLocale, content);
    const promptLanguage = resolvePromptLanguage(userLanguage, requestedLocale);
    const shortFollowUp = isConversationFollowUp && isVeryShortFollowUp(normalizedUserMessage);

    // 2. Detect patterns + get existing patterns IN PARALLEL
    logger.infoSafe('Detecting patterns (parallel)', { userId });
    const [detectionResult, existingPatterns] = await Promise.all([
      shortFollowUp ? Promise.resolve(null) : detectPatterns(content),
      shortFollowUp ? Promise.resolve([]) : getUserPatterns(userId),
    ]);

    // 3. Select patterns for injection (max 2)
    const injectedPatterns = selectPatternsForInjection(
      existingPatterns,
      detectionResult?.emotional_tone
    );

    // 4. Format pattern context
    const patternContext = !shortFollowUp && injectedPatterns
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
        content: getSystemPromptForIntent(intent, promptLanguage),
      },
    ];

    if (isConversationFollowUp && normalizedUserMessage) {
      messages.push({
        role: 'system',
        content: buildConversationPriorityInstruction(promptLanguage, normalizedUserMessage),
      });
    }

    if (firstName) {
      messages.push({
        role: 'system',
        content: `User first name: ${firstName}. Use it only if it feels natural in this specific reply. At most once. Never force it. Never begin the reply with the first name automatically. Skip it entirely if it sounds intrusive, theatrical, or less natural than replying without it.`,
      });
    }

    if (shortFollowUp) {
      messages.push({
        role: 'system',
        content: buildShortFollowUpInstruction(promptLanguage),
      });
    }

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
        temperature: shortFollowUp ? 1.0 : 1.05,
        max_tokens: shortFollowUp ? 220 : 850,
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
            conversationRepliesUsed: conversationState ? conversationState.repliesUsed + 1 : null,
            conversationRepliesLimit: conversationState?.repliesLimit ?? null,
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
        if (entryRef) {
          const conversationRef = entryRef.collection('aurumConversation');

          if (normalizedUserMessage) {
            conversationRef.add({
              role: 'user',
              text: normalizedUserMessage,
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

          db.runTransaction(async (transaction) => {
            const currentEntrySnap = await transaction.get(entryRef);
            const currentData = currentEntrySnap.data() || {};
            const currentReplyCount = typeof currentData.aurumReplyCount === 'number'
              ? currentData.aurumReplyCount
              : 0;

            transaction.set(entryRef, {
              aurumReplyCount: currentReplyCount + 1,
              aurumReplyLimit: conversationState?.repliesLimit ?? null,
              lastAurumReplyAt: new Date(),
              updatedAt: new Date(),
            }, { merge: true });
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
