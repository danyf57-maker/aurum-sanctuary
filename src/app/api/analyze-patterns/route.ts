import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, RateLimitPresets } from '@/lib/rate-limit';
import { logger } from '@/lib/logger/safe';

type InputEntry = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  mood?: string | null;
  createdAt?: string | null;
};

type WritingPatterns = {
  themes: Array<{
    name: string;
    frequency: number;
    trend: 'up' | 'down' | 'stable';
    entries: string[];
  }>;
  writingTimes: {
    mostActive: 'morning' | 'afternoon' | 'evening' | 'night';
    weekdayVsWeekend: { weekday: number; weekend: number };
  };
  sentimentTrend: {
    current: number;
    change: number;
    trajectory: 'improving' | 'declining' | 'stable';
  };
  suggestions: string[];
};

function timeBucketFromHour(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function normalizeMoodScore(mood: string | null | undefined): number {
  if (!mood) return 50;
  const v = mood.toLowerCase();
  if (v.includes('joy') || v.includes('calm') || v.includes('ener')) return 75;
  if (v.includes('anx') || v.includes('trist')) return 35;
  return 55;
}

function fallbackAnalysis(entries: InputEntry[]): WritingPatterns {
  const tagFreq = new Map<string, { count: number; entries: string[] }>();
  for (const entry of entries) {
    for (const tag of entry.tags || []) {
      const key = tag.toLowerCase();
      const prev = tagFreq.get(key) || { count: 0, entries: [] };
      tagFreq.set(key, { count: prev.count + 1, entries: [...prev.entries, entry.id] });
    }
  }

  const themes = Array.from(tagFreq.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, info]) => ({
      name,
      frequency: info.count,
      trend: 'stable' as const,
      entries: info.entries.slice(0, 5),
    }));

  const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  let weekday = 0;
  let weekend = 0;

  for (const entry of entries) {
    const date = entry.createdAt ? new Date(entry.createdAt) : null;
    if (!date || Number.isNaN(date.getTime())) continue;
    buckets[timeBucketFromHour(date.getHours())] += 1;
    const day = date.getDay();
    if (day === 0 || day === 6) weekend += 1;
    else weekday += 1;
  }

  const mostActive = (Object.entries(buckets).sort((a, b) => b[1] - a[1])[0]?.[0] || 'evening') as
    | 'morning'
    | 'afternoon'
    | 'evening'
    | 'night';

  const sortedByDate = [...entries].sort((a, b) => {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return at - bt;
  });

  const midpoint = Math.max(1, Math.floor(sortedByDate.length / 2));
  const older = sortedByDate.slice(0, midpoint);
  const newer = sortedByDate.slice(midpoint);
  const olderAvg = older.length > 0 ? older.reduce((sum, e) => sum + normalizeMoodScore(e.mood), 0) / older.length : 50;
  const newerAvg = newer.length > 0 ? newer.reduce((sum, e) => sum + normalizeMoodScore(e.mood), 0) / newer.length : olderAvg;
  const change = Math.round(newerAvg - olderAvg);

  return {
    themes,
    writingTimes: {
      mostActive,
      weekdayVsWeekend: { weekday, weekend },
    },
    sentimentTrend: {
      current: Math.round(newerAvg),
      change,
      trajectory: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
    },
    suggestions: [
      'Garde un rythme regulier decriture avec un petit check-in quotidien.',
      'Relis une entree recente et note ce qui a evolue depuis.',
      'Transforme un theme recurrent en question dexploration pour la prochaine entree.',
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const { entries, userId } = (await request.json()) as { entries?: InputEntry[]; userId?: string };

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const rate = await rateLimit(RateLimitPresets.analyzePatterns(userId));
    if (!rate.success) {
      return NextResponse.json(
        {
          error: 'Limite atteinte. Reessaie plus tard.',
          reset: rate.reset,
        },
        { status: 429 },
      );
    }

    const safeEntries = (entries || []).slice(0, 30);
    if (safeEntries.length < 3) {
      return NextResponse.json({ error: 'Au moins 3 entrees sont necessaires.' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(fallbackAnalysis(safeEntries));
    }

    const prompt = `Analyse ces entrees de journal (metadata) et retourne uniquement un JSON valide:
{
  "themes": [{"name":"", "frequency":0, "trend":"up|down|stable", "entries":["id"]}],
  "writingTimes": {"mostActive":"morning|afternoon|evening|night", "weekdayVsWeekend":{"weekday":0,"weekend":0}},
  "sentimentTrend": {"current":0, "change":0, "trajectory":"improving|declining|stable"},
  "suggestions": ["", "", ""]
}

Entries:
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
              'Tu es un assistant danalyse de journaling. Reponds uniquement avec du JSON strict, sans texte autour.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      logger.errorSafe('analyze-patterns upstream error', undefined, { statusCode: response.status });
      return NextResponse.json(fallbackAnalysis(safeEntries));
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return NextResponse.json(fallbackAnalysis(safeEntries));

    const parsed = JSON.parse(content) as WritingPatterns;
    return NextResponse.json(parsed);
  } catch (error) {
    logger.errorSafe('analyze-patterns failed', error);
    return NextResponse.json({ error: 'Erreur interne analyse patterns' }, { status: 500 });
  }
}
