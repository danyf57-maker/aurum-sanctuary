export type WritingReminderTone = 'gentle' | 'clarity' | 'pressure_release' | 'routine';
export type ReminderLocale = 'fr' | 'en';

const REMINDER_LIBRARY: Record<ReminderLocale, Record<WritingReminderTone, string[]>> = {
  fr: {
    gentle: [
      '{firstName}, tu veux prendre trois minutes pour revenir à toi ?',
      '{firstName}, comment ça se passe en toi aujourd\'hui ?',
      '{firstName}, quelques lignes peuvent suffire pour te retrouver.',
    ],
    clarity: [
      '{firstName}, tu veux y voir un peu plus clair aujourd\'hui ?',
      '{firstName}, qu\'est-ce qui prend le plus de place en toi en ce moment ?',
      '{firstName}, pose ce qui revient le plus en ce moment.',
    ],
    pressure_release: [
      '{firstName}, tu veux desserrer un peu ce qui te pèse ?',
      '{firstName}, quelques lignes peuvent déjà redonner de l\'air.',
      '{firstName}, un moment pour déposer ce qui te serre ?',
    ],
    routine: [
      '{firstName}, tu reprends ton fil aujourd\'hui ?',
      '{firstName}, quelques lignes pour garder ton rythme intérieur ?',
      '{firstName}, tu reviens à ton espace de réflexion privé ?',
    ],
  },
  en: {
    gentle: [
      '{firstName}, want to take three quiet minutes to come back to yourself?',
      '{firstName}, what feels most alive in you today?',
      '{firstName}, a few lines can be enough to reconnect with yourself.',
    ],
    clarity: [
      '{firstName}, want a little more clarity today?',
      '{firstName}, what is taking the most space inside you right now?',
      '{firstName}, want to put down what keeps returning?',
    ],
    pressure_release: [
      '{firstName}, want to soften some of the pressure you are carrying?',
      '{firstName}, a few lines can already make more room inside.',
      '{firstName}, want a moment to set down what feels heavy?',
    ],
    routine: [
      '{firstName}, ready to pick up your thread today?',
      '{firstName}, a few lines to keep your inner rhythm going?',
      '{firstName}, want to come back to your private reflection space?',
    ],
  },
};

const BODY_COPY: Record<ReminderLocale, string> = {
  fr: 'Ouvre Aurum et écris quelques lignes privées. Aurum t\'aidera à voir ce qui ressort et ce qui revient.',
  en: 'Open Aurum and write a few private lines. Aurum will help you notice what stands out and what keeps returning.',
};

function sanitizeName(firstName?: string | null) {
  const candidate = firstName?.trim();
  if (!candidate) {
    return null;
  }

  return candidate.slice(0, 1).toUpperCase() + candidate.slice(1);
}

export function buildWritingReminderCopy(params: {
  locale: ReminderLocale;
  tone: WritingReminderTone;
  firstName?: string | null;
  seed?: number;
}) {
  const { locale, tone, seed = 0 } = params;
  const library = REMINDER_LIBRARY[locale][tone];
  const template = library[Math.abs(seed) % library.length] || library[0];
  const firstName = sanitizeName(params.firstName) || (locale === 'fr' ? 'toi' : 'you');
  const title = template.replace('{firstName}', firstName);

  return {
    title,
    body: BODY_COPY[locale],
  };
}
