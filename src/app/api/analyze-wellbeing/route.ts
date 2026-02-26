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

type RyffScores = {
  acceptationDeSoi: number;
  developpementPersonnel: number;
  sensDeLaVie: number;
  maitriseEnvironnement: number;
  autonomie: number;
  relationsPositives: number;
  confidence: number;
  narrative: string;
};

const DIMENSION_KEYS = [
  'acceptationDeSoi',
  'developpementPersonnel',
  'sensDeLaVie',
  'maitriseEnvironnement',
  'autonomie',
  'relationsPositives',
] as const;

function clampScore(value: unknown): number {
  const num = Number(value);
  if (Number.isNaN(num)) return 3;
  return Math.round(Math.min(6, Math.max(1, num)) * 10) / 10;
}

function fallbackAnalysis(entries: InputEntry[]): RyffScores {
  const moodScores: Record<string, number> = {
    joyeux: 5,
    calme: 4.5,
    energique: 4.5,
    neutre: 3.5,
    anxieux: 2.5,
    triste: 2,
  };

  const moods = entries
    .map((e) => e.mood?.toLowerCase())
    .filter((m): m is string => !!m && m in moodScores);

  const avgMood =
    moods.length > 0
      ? moods.reduce((sum, m) => sum + (moodScores[m] || 3.5), 0) / moods.length
      : 3.5;

  const tagSet = new Set(entries.flatMap((e) => e.tags.map((t) => t.toLowerCase())));

  const hasGrowthTags = ['apprentissage', 'objectif', 'projet', 'evolution', 'progres'].some((t) =>
    tagSet.has(t)
  );
  const hasRelationTags = ['famille', 'amis', 'couple', 'relation', 'amour'].some((t) =>
    tagSet.has(t)
  );
  const hasPurposeTags = ['sens', 'mission', 'valeurs', 'spiritualite', 'but'].some((t) =>
    tagSet.has(t)
  );

  return {
    acceptationDeSoi: clampScore(avgMood * 0.85 + 0.5),
    developpementPersonnel: clampScore(hasGrowthTags ? avgMood + 0.5 : avgMood * 0.9),
    sensDeLaVie: clampScore(hasPurposeTags ? avgMood + 0.3 : avgMood * 0.85),
    maitriseEnvironnement: clampScore(avgMood * 0.9),
    autonomie: clampScore(3.5),
    relationsPositives: clampScore(hasRelationTags ? avgMood + 0.4 : avgMood * 0.8),
    confidence: 0.3,
    narrative:
      'Analyse basée sur les humeurs et les tags de tes entrées. Lance une analyse complète pour un résultat plus précis.',
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

    const rate = await rateLimit(RateLimitPresets.analyzeWellbeing(userId));
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

    const prompt = `Analyse ces entrées de journal et évalue les 6 dimensions du bien-être psychologique de Carol Ryff sur une échelle de 1 à 6 (1 = très faible, 6 = très élevé).

Définitions des dimensions :
- acceptationDeSoi (1-6): regard positif/négatif envers soi-même, acceptation de ses qualités ET défauts
- developpementPersonnel (1-6): sentiment de grandir, d'évoluer, ouverture aux nouvelles expériences
- sensDeLaVie (1-6): buts, sens de la direction, sentiment que la vie a une signification
- maitriseEnvironnement (1-6): capacité à gérer son environnement quotidien, saisir les opportunités
- autonomie (1-6): autodétermination, résistance aux pressions sociales, régulation interne
- relationsPositives (1-6): qualité des relations, empathie, capacité d'amour/amitié profonde

Retourne exactement ce JSON :
{
  "acceptationDeSoi": <1-6>,
  "developpementPersonnel": <1-6>,
  "sensDeLaVie": <1-6>,
  "maitriseEnvironnement": <1-6>,
  "autonomie": <1-6>,
  "relationsPositives": <1-6>,
  "confidence": <0.0-1.0>,
  "narrative": "<1-2 phrases en français résumant l'état de bien-être global>"
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
              'Tu es un psychologue expert en bien-être psychologique (modèle de Ryff). Tu analyses des extraits de journaling et évalues les 6 dimensions du bien-être de Ryff. Tu réponds UNIQUEMENT avec du JSON strict.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      logger.errorSafe('analyze-wellbeing upstream error', undefined, {
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

    const parsed = JSON.parse(content) as RyffScores;

    // Clamp all dimension scores
    const clamped: RyffScores = {
      ...parsed,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
      narrative: typeof parsed.narrative === 'string' ? parsed.narrative : '',
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
    logger.errorSafe('analyze-wellbeing failed', error);
    return NextResponse.json({ error: 'Erreur interne analyse bien-être' }, { status: 500 });
  }
}

async function writeScore(userId: string, scores: RyffScores, entryCount: number) {
  try {
    const [{ db }, { FieldValue }] = await Promise.all([
      import('@/lib/firebase/admin-db'),
      import('firebase-admin/firestore'),
    ]);

    await db
      .collection('users')
      .doc(userId)
      .collection('wellbeingScores')
      .add({
        source: 'ai',
        computedAt: FieldValue.serverTimestamp(),
        entryCount,
        acceptationDeSoi: scores.acceptationDeSoi,
        developpementPersonnel: scores.developpementPersonnel,
        sensDeLaVie: scores.sensDeLaVie,
        maitriseEnvironnement: scores.maitriseEnvironnement,
        autonomie: scores.autonomie,
        relationsPositives: scores.relationsPositives,
        aiConfidence: scores.confidence,
        narrative: scores.narrative,
      });
  } catch (err) {
    logger.errorSafe('writeScore failed', err);
  }
}

function formatResponse(scores: RyffScores, entryCount: number) {
  return {
    source: 'ai' as const,
    computedAt: new Date().toISOString(),
    entryCount,
    scores: {
      acceptationDeSoi: scores.acceptationDeSoi,
      developpementPersonnel: scores.developpementPersonnel,
      sensDeLaVie: scores.sensDeLaVie,
      maitriseEnvironnement: scores.maitriseEnvironnement,
      autonomie: scores.autonomie,
      relationsPositives: scores.relationsPositives,
    },
    aiConfidence: scores.confidence,
    narrative: scores.narrative,
  };
}
