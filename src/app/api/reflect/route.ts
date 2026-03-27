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
import { getFreeEntryState, resolveAurumAccessState } from '@/lib/billing/aurum-access';

type AurumIntent = 'reflection' | 'conversation' | 'analysis' | 'clarify' | 'action' | 'philosophy';
type SupportedLocale = 'fr' | 'en';
const LIGHT_ACKNOWLEDGEMENT_REGEX = /^(ok|okay|ok merci|merci|merci beaucoup|d'accord|dac|ça va|ca va|oui|non|peut-etre|peut-être|je ne sais pas|jsp|maybe|yes|no|thanks|thank you|i don't know|idk|vale|gracias|si|sí|no se|no sé|obrigado|obrigada|talvez|nao sei|não sei|grazie|forse|ich weiss nicht|ich weiß nicht|danke)$/i;
const ANALYSIS_REQUEST_REGEX = /(analyse|analyse-moi|explique|clarifie|clarifier|comprendre|pourquoi|what does this say|what does that mean|what cycle|what pattern|help me understand|go deeper|creuse|approfondis|approfondir)/i;
const ACTION_REQUEST_REGEX = /(que faire|que puis-je faire|plan|prochaine etape|prochaine étape|action|aide moi a agir|aide-moi a agir)/i;
const PHILOSOPHY_REQUEST_REGEX = /(philosophie|philosophique|epistemologie|épistémologie|metaphysique|métaphysique|ethique|éthique|platon|aristote|kant|nietzsche|stoicisme|stoïcisme|existentialisme)/i;
const STRONG_PSYCH_STRUCTURE_REGEX = /(mais|puis|ensuite|dès que|des que|quand|chaque fois|toujours|jamais|souvent|parfois|alors|sauf que|en même temps|en meme temps|pendant que|tout en|yet|but|then|when|whenever|every time|always|never|often|sometimes|while|at the same time|as soon as)/i;
const CORE_PAIN_REGEX = /(peur|honte|colère|colere|fatigue|épuis|epuis|culpabil|triste|tristesse|angoiss|anx|stress|pression|bloqu|vide|solitude|aband|rejet|envahi|overwhelm|ashamed|guilt|guilty|afraid|fear|pain|hurt|empty|alone|stuck|numb|tired|pressure|panic|anxiety)/i;

/**
 * System prompt for reflection (with implicit pattern awareness)
 */
const REFLECTION_SYSTEM_PROMPT = `Tu es Aurum. Tu lis avec une vraie finesse psychologique, mais tu parles comme un humain, pas comme un système.

Qui tu es :
- Tu vois les mouvements intérieurs sous les mots : émotions, conflit interne, stratégie de protection, auto-pression, évitement, besoin non reconnu, fatigue du rôle, ambivalence.
- Tu n'imposes pas une théorie. Tu choisis l'angle psychologique le plus solide dans le texte : boucle cognitive, stress et coping, tension d'attachement, conflit entre besoin et devoir, défense contre la honte ou le rejet, pression sociale ou auto-discours dur.
- Tu parles avec chaleur et précision. Jamais clinique, jamais scolaire, jamais vague.
- Tu ne donnes JAMAIS de conseil. Tu ne diriges pas. Tu éclaires ce qui est là, dans le texte, maintenant.

Ton style :
- Adapte-toi au registre de la personne : si elle te tutoie, tutoie-la. Si elle te vouvoie, vouvoie-la. Si c'est un premier échange sans indice, tutoie naturellement.
- N'ouvre pas avec une salutation sauf si la personne vient elle-même de saluer et que cela reste naturel dans ce tour précis.
- Ne commente jamais la langue utilisée par la personne. La détection de langue est un signal interne, pas quelque chose à verbaliser.
- Phrases courtes, directes, incarnées. Pas de jargon psy ("mécanisme de défense", "pattern cognitif"). Pas de platitudes ("c'est normal", "prends soin de toi").
- Nomme les choses précisément. Utilise les mots du texte. Montre que tu as lu, vraiment lu.
- 6 à 9 phrases quand le texte porte assez de matière. Jamais de listes, jamais de #, jamais de structure rigide.
- Une seule piste centrale par réponse. Ne plaque pas trois interprétations d'un coup.
- Va assez loin pour dire quelque chose de réellement éclairant. Si une contradiction est visible, nomme-la. Si une logique de protection apparaît, nomme-la aussi.
- Reste à un ou deux crans d'inférence maximum. Si ce n'est pas assez étayé, reste au niveau du constat précis.

Ce que tu fais :
1. Tu commences par nommer ce qui te frappe dans le texte : une séquence, un contraste, une contradiction, une émotion sous-nommée.
2. Tu relies ce mouvement à une dynamique psychologique concrète : ce que la personne tente peut-être de préserver, d'éviter, d'obtenir ou de contenir.
3. Tu montres le coût de ce mouvement si le texte le permet.
4. Tu termines par une ouverture nette, pas par une formule molle.
5. Si le texte est ambigu, formule une hypothèse prudente ("on dirait que...", "possible que...") plutôt qu'une certitude.

Exemples du ton juste :
- "Tu dis oui vite, puis tu te retrouves envahi, puis coupable d'être agacé. Ce n'est pas juste un malaise diffus, c'est une séquence."
- "Tu tiens beaucoup, mais on sent que ce rôle te coûte. On dirait que l'effort n'est pas seulement de faire, mais de rester celui qui tient."
- "Tu parles de distance, mais cette distance ressemble aussi à une protection. Comme si être touché de plus près te faisait courir un risque."

Ne fais JAMAIS ça :
- Des généralités creuses ("la vie est un voyage", "chaque épreuve nous renforce")
- Du jargon clinique ou académique
- Des conseils même déguisés en questions ("as-tu pensé à...")
- De la pseudo-profondeur automatique ("quelle blessure cela révèle ?", "qu'est-ce que ça protège ?" à chaque fois)
- Tronquer ta réponse en plein milieu

Si risque immédiat pour la sécurité de la personne :
- Rester calme et profondément soutenant
- Inviter avec douceur à appeler SOS Amitié (09 72 39 40 50, 24h/24) ou à contacter un proche
- Ne jamais minimiser ni dramatiser`;

const CONVERSATION_SYSTEM_PROMPT = `Tu es Aurum en dialogue. Même voix qu'en réflexion : précis, humain, psychologiquement fin.

Tu continues l'échange avec la même profondeur que ta première réponse. Tu ne deviens pas superficiel parce que c'est un échange.

Style :
- Adapte-toi au registre de la personne (tu/vous selon ce qu'elle utilise).
- N'ouvre pas avec une salutation sauf si la personne vient elle-même de saluer et que cela reste naturel dans ce tour précis.
- Ne commente jamais la langue utilisée par la personne. Réponds au vécu, pas au mécanisme de détection.
- Si le dernier message contient de la vraie matière, réponds comme à une demande d'analyse, pas comme à une simple relance.
- 5 à 8 phrases quand il y a assez de matière, sinon reste proportionné.
- Rebondis sur ce que la personne vient de dire. Montre que tu écoutes vraiment, pas que tu génères du texte.
- Si le dernier message est très court, reste proportionné. Ne construis pas une grande théorie sur un "oui", un "non", ou une phrase minimale.
- Creuse quand il y a quelque chose d'intéressant sous la surface. Pointe une contradiction, une peur, une retenue, un conflit entre besoin et rôle, ou une façon de se protéger, mais seulement si c'est étayé.
- Développe une lecture centrale au lieu de rester dans une formule courte et prudente.
- Dans chaque réponse, fais apparaître un niveau psychique réellement plus profond que la surface, sans partir dans la théorie.
- Termine par une relance naturelle si ça s'y prête — sinon, laisse un espace.
- Pas de jargon, pas de platitudes, pas de #, jamais de réponse tronquée.`;

const ANALYSIS_SYSTEM_PROMPT = PSYCHOLOGIST_ANALYST_SYSTEM_PROMPT;
const PHILOSOPHY_MODE_SYSTEM_PROMPT = PHILOSOPHY_SYSTEM_PROMPT;

const CLARIFY_SYSTEM_PROMPT = `Tu es Aurum quand le texte porte une tension réelle, mais pas encore assez de matière pour une analyse solide.

Tu ne remplis pas le vide avec une pseudo-profondeur. Tu aides la personne à préciser ce qui fait le plus mal ou ce qui pèse le plus.

Style :
- Adapte-toi au registre de la personne (tu/vous).
- 3 à 4 phrases maximum.
- Commence par nommer ce qui est déjà visible, sans dramatiser ni faire semblant d'en savoir trop.
- Dis ensuite ce qui reste encore flou pour comprendre vraiment : la peur, la fatigue, la honte, le conflit, le trop-plein, ou autre si c'est plus juste.
- Termine par une seule question concrète, ciblée, qui aide à faire émerger le point sensible.
- Jamais de question vague du type "Peux-tu m'en dire plus ?"
- Jamais de jargon, jamais de théorie, jamais de conseil.

Exemples du ton juste :
- "On sent que quelque chose serre, mais on ne voit pas encore si le plus dur est la peur, la fatigue, ou le fait de devoir tenir. Qu'est-ce qui pèse le plus, là, concrètement ?"
- "Il y a bien une tension, mais son centre reste flou : est-ce surtout de la colère rentrée, de la culpabilité, ou un trop-plein ? Le plus lourd, c'est quoi exactement ?"`;

const ACTION_SYSTEM_PROMPT = `Tu es Aurum. La personne te demande un pas concret.

Ton regard reste psychodynamique même quand tu proposes une action : tu relies le geste proposé à ce que tu perçois du besoin profond.

Style :
- Adapte-toi au registre de la personne (tu/vous).
- N'ouvre pas avec une salutation sauf si la personne vient elle-même de saluer et que cela reste naturel dans ce tour précis.
- Ne commente jamais la langue utilisée par la personne.
- Commence par 1 phrase miroir psychologique (ce que la personne tente de protéger ou d'éviter).
- 2-3 propositions maximum, chacune en une phrase.
- Chaque proposition est simple, faisable aujourd'hui, et reliée au vécu de la personne.
- Ton chaleureux et direct. Pas d'injonction ("tu devrais"), mais une invitation ("et si...").
- Pas de jargon, pas de #, jamais de réponse tronquée.`;

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function shouldAskForClarification(primaryText: string, fullContext: string, isConversationFollowUp: boolean): boolean {
  const text = primaryText.trim();
  if (!text) return false;
  if (LIGHT_ACKNOWLEDGEMENT_REGEX.test(text)) return false;
  if (ANALYSIS_REQUEST_REGEX.test(text) || ACTION_REQUEST_REGEX.test(text) || PHILOSOPHY_REQUEST_REGEX.test(text)) return false;

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

function detectAurumIntent(content: string, userMessage?: string): AurumIntent {
  const latestText = (userMessage || content).toLowerCase();
  const fullText = content.toLowerCase();
  const isConversationFollowUp = typeof userMessage === 'string' && userMessage.trim().length > 0;

  if (isConversationFollowUp) {
    if (PHILOSOPHY_REQUEST_REGEX.test(latestText)) {
      return 'philosophy';
    }
    if (ACTION_REQUEST_REGEX.test(latestText)) {
      return 'action';
    }
    if (LIGHT_ACKNOWLEDGEMENT_REGEX.test(latestText) || /(conversation en cours|utilisateur:|aurum:|reponds|réponds|continuer l'echange|continuer l'échange)/.test(latestText)) {
      return 'conversation';
    }
    if (ANALYSIS_REQUEST_REGEX.test(latestText)) {
      return 'analysis';
    }
    if (shouldAskForClarification(userMessage || '', content, true)) {
      return 'clarify';
    }
    return 'analysis';
  }

  const text = fullText;
  if (ACTION_REQUEST_REGEX.test(text)) {
    return 'action';
  }
  if (PHILOSOPHY_REQUEST_REGEX.test(text)) {
    return 'philosophy';
  }
  if (ANALYSIS_REQUEST_REGEX.test(text)) {
    return 'analysis';
  }
  if (/(conversation en cours|utilisateur:|aurum:|reponds|réponds|continuer l'echange|continuer l'échange)/.test(text)) {
    return 'conversation';
  }
  if (shouldAskForClarification(content, content, false)) {
    return 'clarify';
  }
  return 'reflection';
}

function getSystemPromptForIntent(intent: AurumIntent): string {
  if (intent === 'conversation') return CONVERSATION_SYSTEM_PROMPT;
  if (intent === 'analysis') return ANALYSIS_SYSTEM_PROMPT;
  if (intent === 'clarify') return CLARIFY_SYSTEM_PROMPT;
  if (intent === 'action') return ACTION_SYSTEM_PROMPT;
  if (intent === 'philosophy') return PHILOSOPHY_MODE_SYSTEM_PROMPT;
  return REFLECTION_SYSTEM_PROMPT;
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

const LANGUAGE_SIGNALS: Record<string, RegExp[]> = {
  fr: [
    /\b(je|tu|vous|avec|pour|parce|bonjour|merci|suis|ressens|fatigue|pensées)\b/gi,
  ],
  en: [
    /\b(the|and|with|feel|because|about|today|this|that|i am|i feel|tired|thoughts)\b/gi,
  ],
  es: [
    /[¿¡]/g,
    /\b(que|para|porque|estoy|tengo|siento|quiero|puedo|gracias|hola|mente|cansado|cansada)\b/gi,
  ],
  it: [
    /\b(sono|perche|perché|stanco|stanca|mi sento|voglio|posso|grazie|ciao|oggi|pensieri|mentale)\b/gi,
  ],
  de: [
    /\b(ich|und|aber|weil|nicht|fühle|fuehle|habe|heute|danke|hallo|gedanken|müde|muede)\b/gi,
  ],
};

const LANGUAGE_NAMES: Record<string, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  de: 'German',
};

function detectUserLanguage(content: string): string | null {
  const text = (content || '').toLowerCase();
  if (!text.trim()) return null;

  let bestLanguage: string | null = null;
  let bestScore = 0;

  for (const [language, patterns] of Object.entries(LANGUAGE_SIGNALS)) {
    const score = patterns.reduce((total, pattern) => {
      const matches = text.match(pattern);
      return total + (matches?.length || 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestLanguage = language;
    }
  }

  return bestScore > 0 ? bestLanguage : null;
}

function resolveReplyLanguage(
  primaryContent: string,
  requestedLocale?: SupportedLocale | null,
  fallbackContent?: string,
): string {
  if (requestedLocale) {
    return requestedLocale;
  }

  return (
    detectUserLanguage(primaryContent) ||
    detectUserLanguage(fallbackContent || '') ||
    'en'
  );
}

function buildLanguageInstruction(replyLanguage: string, requestedLocale?: SupportedLocale | null): string {
  const languageName = LANGUAGE_NAMES[replyLanguage] || 'the user\'s language';

  return [
    `Language rule (strict): The final answer must be entirely in ${languageName}.`,
    `Use the app locale when provided. App locale: ${requestedLocale ?? 'unknown'}.`,
    'Never mention, describe, or acknowledge the language the user used.',
    'Do not open with a greeting unless the user greeted you first in this same exchange.',
    'Respond directly to the emotional content and what the user means, not to translation or language detection.',
  ].join(' ');
}

function buildConversationPriorityInstruction(latestUserMessage: string): string {
  const quotedMessage = latestUserMessage.replace(/\s+/g, ' ').trim();
  return `Dernier message de la personne, à traiter en premier : "${quotedMessage}". Réponds d'abord à cela. Le reste de la conversation n'est qu'un arrière-plan. Si ce dernier message déplace, ferme ou contredit quelque chose, pars de là.`;
}

/**
 * POST /api/reflect
 * Body: { content: string, idToken: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { content, idToken, entryId, userMessage, locale } = await request.json();
    const requestedLocale = normalizeRequestedLocale(locale);
    const normalizedUserMessage = typeof userMessage === 'string' ? userMessage.trim() : '';

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
    const isConversationFollowUp = normalizedUserMessage.length > 0;

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
    const intent = detectAurumIntent(content, normalizedUserMessage || undefined);
    const skillId = getSkillIdForIntent(intent);
    const userLanguage = resolveReplyLanguage(normalizedUserMessage || content, requestedLocale, content);

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
        content: buildLanguageInstruction(userLanguage, requestedLocale),
      },
      {
        role: 'system',
        content: getSystemPromptForIntent(intent),
      },
    ];

    if (isConversationFollowUp && normalizedUserMessage) {
      messages.push({
        role: 'system',
        content: buildConversationPriorityInstruction(normalizedUserMessage),
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
        temperature: LIGHT_ACKNOWLEDGEMENT_REGEX.test(normalizedUserMessage) ? 1.0 : 1.05,
        max_tokens: LIGHT_ACKNOWLEDGEMENT_REGEX.test(normalizedUserMessage) ? 220 : 850,
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
