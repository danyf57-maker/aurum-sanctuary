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
  kind: "wellbeing" | "personality" | "landing";
  scores?: WellbeingScores | PersonalityScores;
  archetype?: string;
  profile?: string;
  profileTitle?: string;
  answers?: string[];
};

function clampText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text) return fallback;
  return text.slice(0, 520);
}

function fallbackNarrative(payload: Payload): string {
  if (payload.kind === "wellbeing") {
    return "Ton profil montre une base solide, avec un axe prioritaire à renforcer. Écrire quelques lignes par jour t'aide à transformer le flou en actions simples, donc à retrouver plus vite calme et clarté. Dans Aurum, ce suivi régulier te permet aussi de voir ton évolution réelle au fil des jours.";
  }
  if (payload.kind === "landing") {
    return "Ton profil d'entrée confirme un vrai besoin de clarté. Tu n'as pas besoin d'en faire beaucoup: quelques lignes régulières suffisent pour reprendre la main sur ton rythme intérieur. Le bénéfice concret d'Aurum: tes mots restent organisés, privés, et tu peux relire ce qui t'aide vraiment.";
  }
  return "Ton style est clair et utile. Quand tu écris ton intention du jour, tu relies tes points forts à une action précise, donc ton impact devient plus stable et lisible. Avec Aurum, ce fil d'écriture t'évite de repartir à zéro chaque semaine.";
}

function fallbackActionPlan(payload: Payload): string[] {
  if (payload.kind !== "landing") return [];
  return [
    "Jour 1: écris 3 lignes sur ce qui te prend le plus d'énergie aujourd'hui.",
    "Jour 2: note 1 situation qui t'a apaisé(e), même brièvement.",
    "Jour 3: écris ce que tu veux protéger cette semaine.",
    "Jour 4: clarifie une priorité unique pour demain.",
    "Jour 5: décris un frein récurrent et une petite réponse concrète.",
    "Jour 6: fais le bilan de 2 progrès, même discrets.",
    "Jour 7: écris une intention simple pour la semaine suivante.",
  ];
}

function buildPrompt(payload: Payload): string {
  if (payload.kind === "landing") {
    return `Tu es Aurum: présence calme, lucide, premium, profondément humaine.
Tu analyses un profil d'entrée et ses réponses, puis tu proposes une interprétation et un plan 7 jours.
Règles:
- tutoiement
- concret, non médical, non anxiogène
- ton chaleureux et premium
- pas de jargon

Profil:
${payload.profileTitle || payload.profile || "Profil personnel"}
Réponses:
${JSON.stringify(payload.answers || [])}

Retourne UNIQUEMENT un JSON strict:
{
  "narrative": "<4 à 6 phrases, interprétation profonde et claire>",
  "actionPlan": [
    "Jour 1: ...",
    "Jour 2: ...",
    "Jour 3: ...",
    "Jour 4: ...",
    "Jour 5: ...",
    "Jour 6: ...",
    "Jour 7: ..."
  ]
}`;
  }

  if (payload.kind === "wellbeing") {
    return `Tu es Aurum: présence calme, lucide et bienveillante.
Analyse ces scores de bien-être (1 à 6) et produis une lecture premium, humaine, concrète.
Ne jamais médicaliser, ne jamais dramatiser.
Tutoiement.
Objectif: donner envie d'écrire maintenant en expliquant le bénéfice direct du journaling dans Aurum.

Scores:
${JSON.stringify(payload.scores)}

Retourne UNIQUEMENT un JSON strict:
{
  "narrative": "<4 à 6 phrases en français, chaleureuses, actionnables, incluant: ce que le profil dit + pourquoi écrire aide + premier pas concret>"
}`;
  }

  return `Tu es Aurum: présence calme, lucide et bienveillante.
Analyse ce profil de personnalité (1 à 6) et cet archetype.
Donne une lecture premium, profonde, très concrète.
Ne jamais juger. Tutoiement.
Objectif: relier le profil à un avantage concret du journaling dans Aurum et inciter à écrire.

Scores:
${JSON.stringify(payload.scores)}
Archetype: ${payload.archetype || "Profil personnel"}

Retourne UNIQUEMENT un JSON strict:
{
  "narrative": "<4 à 6 phrases en français, chaleureuses, actionnables, incluant: force du profil + angle de progression + pourquoi écrire aide + premier pas concret>"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Payload;
    const needsScores = payload?.kind === "wellbeing" || payload?.kind === "personality";
    if (!payload?.kind || (needsScores && !payload?.scores)) {
      return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        narrative: fallbackNarrative(payload),
        actionPlan: fallbackActionPlan(payload),
        source: "fallback",
      });
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
      return NextResponse.json({
        narrative: fallbackNarrative(payload),
        actionPlan: fallbackActionPlan(payload),
        source: "fallback",
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        narrative: fallbackNarrative(payload),
        actionPlan: fallbackActionPlan(payload),
        source: "fallback",
      });
    }

    const parsed = JSON.parse(content) as { narrative?: unknown; actionPlan?: unknown };
    const safePlan = Array.isArray(parsed?.actionPlan)
      ? parsed.actionPlan
          .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
          .filter((entry) => entry.length > 0)
          .slice(0, 7)
      : fallbackActionPlan(payload);
    return NextResponse.json({
      narrative: clampText(parsed?.narrative, fallbackNarrative(payload)),
      actionPlan: safePlan,
      source: "deepseek",
    });
  } catch {
    return NextResponse.json(
      {
        narrative:
          "Ton profil est prêt. Avance pas à pas: une intention claire, une action simple, puis observe ce qui change.",
        actionPlan: [],
      },
      { status: 200 }
    );
  }
}
