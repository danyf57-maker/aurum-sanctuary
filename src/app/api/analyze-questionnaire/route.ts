import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type WellbeingScores = {
  acceptationDeSoi: number;
  developpementPersonnel: number;
  sensDeLaVie: number;
  maitriseEnvironnement: number;
  autonomie: number;
  relationsPositives: number;
};

type PersonalityScores = {
  determination: number;
  influence: number;
  stabilite: number;
  rigueur: number;
};

type Payload = {
  kind: "wellbeing" | "personality";
  scores: WellbeingScores | PersonalityScores;
  archetype?: string;
};

function clampText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text) return fallback;
  return text.slice(0, 520);
}

function fallbackNarrative(payload: Payload): string {
  if (payload.kind === "wellbeing") {
    return "Ton profil montre une base à consolider avec douceur. Garde un rythme simple: quelques lignes régulières, puis une micro-action concrète chaque jour.";
  }
  return "Ton style est clair et utile. Quand tu relies tes points forts à une action précise dans la journée, ton impact devient plus stable et plus lisible.";
}

function buildPrompt(payload: Payload): string {
  if (payload.kind === "wellbeing") {
    return `Tu es Aurum: présence calme, lucide et bienveillante.
Analyse ces scores de bien-être (1 à 6) et produis une lecture premium, humaine, concrète.
Ne jamais médicaliser, ne jamais dramatiser.
Tutoiement.

Scores:
${JSON.stringify(payload.scores)}

Retourne UNIQUEMENT un JSON strict:
{
  "narrative": "<3 à 5 phrases en français, chaleureuses et actionnables>"
}`;
  }

  return `Tu es Aurum: présence calme, lucide et bienveillante.
Analyse ce profil de personnalité (1 à 6) et cet archetype.
Donne une lecture premium, profonde, très concrète.
Ne jamais juger. Tutoiement.

Scores:
${JSON.stringify(payload.scores)}
Archetype: ${payload.archetype || "Profil personnel"}

Retourne UNIQUEMENT un JSON strict:
{
  "narrative": "<3 à 5 phrases en français, chaleureuses et actionnables>"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Payload;
    if (!payload?.kind || !payload?.scores) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ narrative: fallbackNarrative(payload), source: "fallback" });
    }

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        response_format: { type: "json_object" },
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "Tu es Aurum, une voix d'introspection premium: claire, douce, concrète, non médicale. Tu réponds UNIQUEMENT en JSON strict.",
          },
          { role: "user", content: buildPrompt(payload) },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ narrative: fallbackNarrative(payload), source: "fallback" });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ narrative: fallbackNarrative(payload), source: "fallback" });
    }

    const parsed = JSON.parse(content) as { narrative?: unknown };
    return NextResponse.json({
      narrative: clampText(parsed?.narrative, fallbackNarrative(payload)),
      source: "deepseek",
    });
  } catch {
    return NextResponse.json(
      { narrative: "Ton profil est prêt. Avance pas à pas: une intention claire, une action simple, puis observe ce qui change." },
      { status: 200 }
    );
  }
}

