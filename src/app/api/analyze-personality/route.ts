import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { logger } from '@/lib/logger/safe';
import { requireUserIdFromRequest, UserGuardError } from '@/lib/api/require-user-id';

export const runtime = 'nodejs';

type InputEntry = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  mood?: string | null;
  createdAt?: string | null;
};

type PersonalityApiScores = {
  determination: number;
  influence: number;
  stabilite: number;
  rigueur: number;
  archetype: string;
  confidence: number;
  narrative: string;
};

const DIMENSION_KEYS = ['determination', 'influence', 'stabilite', 'rigueur'] as const;

const ARCHETYPES: Record<string, string> = {
  determination: 'Le Décideur',
  influence: 'Le Communicant',
  stabilite: 'Le Pilier',
  rigueur: "L'Architecte",
};

function clampScore(value: unknown): number {
  const num = Number(value);
  if (Number.isNaN(num)) return 3;
  return Math.round(Math.min(6, Math.max(1, num)) * 10) / 10;
}

function deriveArchetype(scores: Record<string, unknown>): string {
  let maxKey = 'determination';
  let maxVal = 0;
  for (const key of DIMENSION_KEYS) {
    const val = Number(scores[key]) || 0;
    if (val > maxVal) {
      maxVal = val;
      maxKey = key;
    }
  }
  return ARCHETYPES[maxKey] || 'Le Décideur';
}

function fallbackAnalysis(entries: InputEntry[]): PersonalityApiScores {
  const moodMap: Record<string, Partial<Record<(typeof DIMENSION_KEYS)[number], number>>> = {
    joyeux: { influence: 1.2, determination: 0.8 },
    calme: { stabilite: 1.2, rigueur: 0.8 },
    energique: { determination: 1.2, influence: 1.0 },
    anxieux: { rigueur: 1.0, stabilite: 0.6 },
    triste: { stabilite: 0.8 },
    neutre: {},
  };

  const totals = { determination: 0, influence: 0, stabilite: 0, rigueur: 0 };
  let count = 0;

  for (const entry of entries) {
    const mood = entry.mood?.toLowerCase() || 'neutre';
    const weights = moodMap[mood] || {};
    for (const key of DIMENSION_KEYS) {
      totals[key] += weights[key] || 0.7;
    }
    count += 1;
  }

  const scores: Record<string, number> = {};
  for (const key of DIMENSION_KEYS) {
    scores[key] = clampScore(count > 0 ? (totals[key] / count) * 4 + 1 : 3);
  }

  return {
    determination: scores.determination,
    influence: scores.influence,
    stabilite: scores.stabilite,
    rigueur: scores.rigueur,
    archetype: deriveArchetype(scores),
    confidence: 0.3,
    narrative:
      'Analyse basée sur les humeurs de tes entrées. Lance une analyse complète pour un résultat plus précis.',
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      entries?: InputEntry[];
      userId?: string;
      idToken?: string;
    };
    const userId = await requireUserIdFromRequest(request, body);
    const { entries } = body;

    const rate = await rateLimit(RateLimitPresets.analyzePersonality(userId));
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Limite atteinte. Réessaie demain.', reset: rate.reset },
        { status: 429 }
      );
    }

    const safeEntries = (entries || [])
      .filter((e) => !e.excerpt?.includes('Contenu chiffré'))
      .slice(0, 30);

    if (safeEntries.length < 5) {
      return NextResponse.json(
        { error: 'Au moins 5 entrées non chiffrées sont nécessaires.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      const fallback = fallbackAnalysis(safeEntries);
      await writeScore(userId, fallback, safeEntries.length);
      return NextResponse.json(formatResponse(fallback, safeEntries.length));
    }

    const prompt = `Analyse ces entrées de journal et évalue le profil de personnalité de l'auteur selon 4 dimensions sur une échelle de 1 à 6.

Dimensions :
- determination (1-6): assertivité, prise de décision rapide, orientation résultats, leadership naturel
- influence (1-6): enthousiasme, expressivité, capacité à inspirer, orientation relationnelle
- stabilite (1-6): patience, fiabilité, esprit d'équipe, recherche d'harmonie
- rigueur (1-6): précision, analyse, souci du détail, méthodologie

Retourne exactement ce JSON :
{
  "determination": <1-6>,
  "influence": <1-6>,
  "stabilite": <1-6>,
  "rigueur": <1-6>,
  "archetype": "<Le Décideur | Le Communicant | Le Pilier | L'Architecte>",
  "confidence": <0.0-1.0>,
  "narrative": "<1-2 phrases en français décrivant le style de personnalité>"
}

Entrées (${safeEntries.length} au total) :
${JSON.stringify(safeEntries)}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' },
        temperature: 1.5,
        messages: [
          {
            role: 'system',
            content:
              'Tu es un psychologue expert en profils de personnalité. Tu analyses des extraits de journaling et évalues 4 dimensions de personnalité. Tu réponds UNIQUEMENT avec du JSON strict.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      logger.errorSafe('analyze-personality upstream error', undefined, {
        statusCode: response.status,
      });
      const fallback = fallbackAnalysis(safeEntries);
      await writeScore(userId, fallback, safeEntries.length);
      return NextResponse.json(formatResponse(fallback, safeEntries.length));
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      const fallback = fallbackAnalysis(safeEntries);
      await writeScore(userId, fallback, safeEntries.length);
      return NextResponse.json(formatResponse(fallback, safeEntries.length));
    }

    const parsed = JSON.parse(content) as PersonalityApiScores;

    const clamped: PersonalityApiScores = {
      ...parsed,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
      narrative: typeof parsed.narrative === 'string' ? parsed.narrative : '',
      archetype: typeof parsed.archetype === 'string' ? parsed.archetype : deriveArchetype(parsed),
    };
    for (const key of DIMENSION_KEYS) {
      clamped[key] = clampScore(parsed[key]);
    }

    await writeScore(userId, clamped, safeEntries.length);
    return NextResponse.json(formatResponse(clamped, safeEntries.length));
  } catch (error) {
    if (error instanceof UserGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.errorSafe('analyze-personality failed', error);
    return NextResponse.json({ error: 'Erreur interne analyse personnalité' }, { status: 500 });
  }
}

async function writeScore(userId: string, scores: PersonalityApiScores, entryCount: number) {
  try {
    const [{ db }, { FieldValue }] = await Promise.all([
      import('@/lib/firebase/admin-db'),
      import('firebase-admin/firestore'),
    ]);

    await db
      .collection('users')
      .doc(userId)
      .collection('personalityScores')
      .add({
        source: 'ai',
        computedAt: FieldValue.serverTimestamp(),
        entryCount,
        determination: scores.determination,
        influence: scores.influence,
        stabilite: scores.stabilite,
        rigueur: scores.rigueur,
        archetype: scores.archetype,
        aiConfidence: scores.confidence,
        narrative: scores.narrative,
      });
  } catch (err) {
    logger.errorSafe('writePersonalityScore failed', err);
  }
}

function formatResponse(scores: PersonalityApiScores, entryCount: number) {
  return {
    source: 'ai' as const,
    computedAt: new Date().toISOString(),
    entryCount,
    scores: {
      determination: scores.determination,
      influence: scores.influence,
      stabilite: scores.stabilite,
      rigueur: scores.rigueur,
    },
    archetype: scores.archetype,
    aiConfidence: scores.confidence,
    narrative: scores.narrative,
  };
}
