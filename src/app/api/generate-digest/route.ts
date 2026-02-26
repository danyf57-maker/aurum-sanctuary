import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { logger } from '@/lib/logger/safe';
import { requireUserIdFromRequest, UserGuardError } from '@/lib/api/require-user-id';

type InputEntry = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  mood?: string | null;
  createdAt?: string | null;
};

function fallbackDigest(entries: InputEntry[]): string {
  const total = entries.length;
  const tags = new Map<string, number>();
  const moods = new Map<string, number>();

  for (const entry of entries) {
    for (const tag of entry.tags || []) tags.set(tag, (tags.get(tag) || 0) + 1);
    const mood = (entry.mood || 'neutre').toLowerCase();
    moods.set(mood, (moods.get(mood) || 0) + 1);
  }

  const topTags = Array.from(tags.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `- ${name} (${count})`)
    .join('\n');

  const topMood = Array.from(moods.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutre';

  return `# Ta semaine avec Aurum\n\n## Activite decriture\n- ${total} entree(s) cette semaine\n\n## Themes principaux\n${topTags || '- Aucun tag dominant'}\n\n## Ambiance generale\n- Humeur dominante: ${topMood}\n\n## Suggestion\n- Choisis une entree de la semaine et ajoute une phrase de recul: "Quai-je appris de ce moment ?"`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { entries?: InputEntry[]; userId?: string; idToken?: string };
    const userId = await requireUserIdFromRequest(request, body);
    const { entries } = body;

    const rate = await rateLimit(RateLimitPresets.generateDigest(userId));
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Digest deja genere recemment. Reessaie plus tard.', reset: rate.reset },
        { status: 429 },
      );
    }

    const safeEntries = (entries || []).slice(0, 30);
    if (safeEntries.length === 0) {
      return NextResponse.json({ error: 'Aucune entree a analyser.' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ digest: fallbackDigest(safeEntries) });
    }

    const prompt = `Genere un digest hebdomadaire en FRANCAIS en markdown simple (pas de HTML), ton empathique et concret.\nStructure: titre, activite ecriture, themes, evolution emotionnelle, suggestion.\n\nEntries: ${JSON.stringify(safeEntries)}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 1.5,
        messages: [
          {
            role: 'system',
            content: 'Tu ecris des digests hebdomadaires de journaling. Reponds uniquement avec du markdown.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      logger.errorSafe('generate-digest upstream error', undefined, { statusCode: response.status });
      return NextResponse.json({ digest: fallbackDigest(safeEntries) });
    }

    const data = await response.json();
    const digest = data?.choices?.[0]?.message?.content;
    return NextResponse.json({ digest: digest || fallbackDigest(safeEntries) });
  } catch (error) {
    if (error instanceof UserGuardError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.errorSafe('generate-digest failed', error);
    return NextResponse.json({ error: 'Erreur interne digest' }, { status: 500 });
  }
}
