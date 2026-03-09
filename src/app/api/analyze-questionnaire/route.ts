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

type Locale = "en" | "fr" | "es";

type Payload = {
  kind: "wellbeing" | "personality" | "landing";
  scores?: WellbeingScores | PersonalityScores;
  archetype?: string;
  profile?: string;
  profileTitle?: string;
  answers?: string[];
  locale?: Locale;
};

function normalizeLocale(value: unknown): Locale {
  if (value === "fr" || value === "es" || value === "en") return value;
  return "en";
}

function clampText(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text) return fallback;
  return text.slice(0, 520);
}

function fallbackNarrative(payload: Payload, locale: Locale): string {
  if (locale === "fr") {
    if (payload.kind === "wellbeing") {
      return "Ton profil montre une base solide, avec un axe prioritaire à renforcer. Ecrire quelques lignes par jour t'aide a transformer le flou en actions simples, donc a retrouver plus vite calme et clarte. Dans Aurum, ce suivi regulier te permet aussi de voir ton evolution reelle au fil des jours.";
    }
    if (payload.kind === "landing") {
      return "Ton profil d'entree confirme un vrai besoin de clarte. Tu n'as pas besoin d'en faire beaucoup: quelques lignes regulieres suffisent pour reprendre la main sur ton rythme interieur. Le benefice concret d'Aurum: tes mots restent organises, prives, et tu peux relire ce qui t'aide vraiment.";
    }
    return "Ton style est clair et utile. Quand tu ecris ton intention du jour, tu relies tes points forts a une action precise, donc ton impact devient plus stable et lisible. Avec Aurum, ce fil d'ecriture t'evite de repartir a zero chaque semaine.";
  }

  if (locale === "es") {
    if (payload.kind === "wellbeing") {
      return "Tu perfil muestra una base solida, con un eje prioritario por reforzar. Escribir unas lineas al dia te ayuda a transformar la confusion en acciones simples y recuperar calma y claridad. En Aurum, este seguimiento regular tambien te permite ver tu progreso real con el tiempo.";
    }
    if (payload.kind === "landing") {
      return "Tu perfil inicial confirma una necesidad real de claridad. No necesitas hacer mucho: unas lineas constantes bastan para recuperar tu ritmo interior. El beneficio concreto de Aurum: tus palabras quedan organizadas y privadas, y puedes revisar lo que realmente te ayuda.";
    }
    return "Tu estilo es claro y util. Cuando escribes tu intencion del dia, conectas tus fortalezas con una accion concreta, por lo que tu impacto se vuelve mas estable y visible. Con Aurum, este hilo de escritura evita empezar de cero cada semana.";
  }

  if (payload.kind === "wellbeing") {
    return "Your profile shows a solid base with one priority area to strengthen. Writing a few lines each day helps turn blur into simple actions, so you recover calm and clarity faster. In Aurum, this regular rhythm also lets you see your real progress over time.";
  }
  if (payload.kind === "landing") {
    return "Your entry profile confirms a real need for clarity. You do not need to do a lot: a few consistent lines are enough to regain control of your inner rhythm. Aurum's practical benefit is simple: your words stay organized and private, and you can revisit what actually helps.";
  }
  return "Your style is clear and useful. When you write your daily intention, you connect your strengths to one concrete action, making your impact steadier and more visible. With Aurum, that writing thread keeps you from restarting from zero every week.";
}

function fallbackActionPlan(payload: Payload, locale: Locale): string[] {
  if (payload.kind !== "landing") return [];

  if (locale === "fr") {
    return [
      "Jour 1: ecris 3 lignes sur ce qui te prend le plus d'energie aujourd'hui.",
      "Jour 2: note 1 situation qui t'a apaise(e), meme brievement.",
      "Jour 3: ecris ce que tu veux proteger cette semaine.",
      "Jour 4: clarifie une priorite unique pour demain.",
      "Jour 5: decris un frein recurrent et une petite reponse concrete.",
      "Jour 6: fais le bilan de 2 progres, meme discrets.",
      "Jour 7: ecris une intention simple pour la semaine suivante.",
    ];
  }

  if (locale === "es") {
    return [
      "Dia 1: escribe 3 lineas sobre lo que mas te consume energia hoy.",
      "Dia 2: anota 1 situacion que te calmo, aunque fuera breve.",
      "Dia 3: escribe lo que quieres proteger esta semana.",
      "Dia 4: aclara una unica prioridad para manana.",
      "Dia 5: describe un freno recurrente y una pequena respuesta concreta.",
      "Dia 6: haz balance de 2 avances, incluso discretos.",
      "Dia 7: escribe una intencion simple para la semana siguiente.",
    ];
  }

  return [
    "Day 1: write 3 lines about what drains most of your energy today.",
    "Day 2: note 1 situation that helped you feel calmer, even briefly.",
    "Day 3: write what you want to protect this week.",
    "Day 4: clarify one single priority for tomorrow.",
    "Day 5: describe one recurring blocker and one small concrete response.",
    "Day 6: review 2 signs of progress, even subtle ones.",
    "Day 7: write one simple intention for next week.",
  ];
}

function userPromptLanguageLine(locale: Locale): string {
  if (locale === "fr") return "Language rule: write all text in French.";
  if (locale === "es") return "Language rule: write all text in Spanish.";
  return "Language rule: write all text in English.";
}

function systemPrompt(locale: Locale): string {
  if (locale === "fr") {
    return "Tu es Aurum, une voix d'introspection premium: claire, douce, concrete, non medicale. En francais, tu gardes une proximite sans familiarite: si une formule d'ouverture est necessaire, tu utilises Bonjour, jamais Salut, sauf si la personne a d'abord employe ce registre. Tu reponds UNIQUEMENT en JSON strict et en francais.";
  }
  if (locale === "es") {
    return "Eres Aurum, una voz de introspeccion premium: clara, suave, concreta y no medica. Respondes SOLO en JSON estricto y en espanol.";
  }
  return "You are Aurum, a premium introspection voice: clear, calm, concrete, and non-medical. Reply ONLY in strict JSON and in English.";
}

function buildPrompt(payload: Payload, locale: Locale): string {
  const languageLine = userPromptLanguageLine(locale);

  if (payload.kind === "landing") {
    return `You are Aurum: calm, lucid, premium, deeply human.
You analyze a user's entry profile and answers, then provide an interpretation and a 7-day plan.
Rules:
- second-person voice
- concrete, non-medical, non-alarming
- warm premium tone
- no jargon
- ${languageLine}

Profile:
${payload.profileTitle || payload.profile || "Personal profile"}
Answers:
${JSON.stringify(payload.answers || [])}

Return ONLY strict JSON:
{
  "narrative": "<4 to 6 sentences, deep and clear interpretation>",
  "actionPlan": [
    "Day 1: ...",
    "Day 2: ...",
    "Day 3: ...",
    "Day 4: ...",
    "Day 5: ...",
    "Day 6: ...",
    "Day 7: ..."
  ]
}`;
  }

  if (payload.kind === "wellbeing") {
    return `You are Aurum: calm, lucid, and kind.
Analyze these wellbeing scores (1 to 6) and produce a premium, human, concrete reading.
Never medicalize. Never dramatize.
Goal: motivate writing now by explaining the direct journaling benefit inside Aurum.
${languageLine}

Scores:
${JSON.stringify(payload.scores)}

Return ONLY strict JSON:
{
  "narrative": "<4 to 6 warm, actionable sentences including: what this profile suggests + why writing helps + one concrete first step>"
}`;
  }

  return `You are Aurum: calm, lucid, and kind.
Analyze this personality profile (1 to 6) and archetype.
Provide a premium, deep, concrete reading.
Never judge.
Goal: connect this profile to a practical journaling advantage in Aurum and prompt writing.
${languageLine}

Scores:
${JSON.stringify(payload.scores)}
Archetype: ${payload.archetype || "Personal profile"}

Return ONLY strict JSON:
{
  "narrative": "<4 to 6 warm, actionable sentences including: current strength + growth angle + why writing helps + one concrete first step>"
}`;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Payload;
    const locale = normalizeLocale(payload?.locale);
    const needsScores = payload?.kind === "wellbeing" || payload?.kind === "personality";

    if (!payload?.kind || (needsScores && !payload?.scores)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        narrative: fallbackNarrative(payload, locale),
        actionPlan: fallbackActionPlan(payload, locale),
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
            content: systemPrompt(locale),
          },
          { role: "user", content: buildPrompt(payload, locale) },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        narrative: fallbackNarrative(payload, locale),
        actionPlan: fallbackActionPlan(payload, locale),
        source: "fallback",
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        narrative: fallbackNarrative(payload, locale),
        actionPlan: fallbackActionPlan(payload, locale),
        source: "fallback",
      });
    }

    const parsed = JSON.parse(content) as { narrative?: unknown; actionPlan?: unknown };
    const safePlan = Array.isArray(parsed?.actionPlan)
      ? parsed.actionPlan
          .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
          .filter((entry) => entry.length > 0)
          .slice(0, 7)
      : fallbackActionPlan(payload, locale);

    return NextResponse.json({
      narrative: clampText(parsed?.narrative, fallbackNarrative(payload, locale)),
      actionPlan: safePlan,
      source: "deepseek",
    });
  } catch {
    return NextResponse.json(
      {
        narrative:
          "Your profile is ready. Move step by step: set one clear intention, take one simple action, then observe what changes.",
        actionPlan: [],
      },
      { status: 200 }
    );
  }
}
