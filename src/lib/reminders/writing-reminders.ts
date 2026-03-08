export type WritingReminderTone = 'gentle' | 'clarity' | 'pressure_release' | 'routine';
export type ReminderLocale = 'fr' | 'en';

const REMINDER_LIBRARY: Record<ReminderLocale, Record<WritingReminderTone, string[]>> = {
  fr: {
    gentle: [
      '{firstName}, tu veux prendre trois minutes pour toi ?',
      '{firstName}, comment ca va vraiment aujourd\'hui ?',
      '{firstName}, quelques lignes suffisent pour te retrouver.',
    ],
    clarity: [
      '{firstName}, tu veux y voir un peu plus clair ?',
      '{firstName}, qu\'est-ce qui prend le plus de place dans ta tete ?',
      '{firstName}, pose ce qui tourne en boucle.',
    ],
    pressure_release: [
      '{firstName}, tu veux relacher un peu la pression ?',
      '{firstName}, quelques lignes peuvent deja alleger la charge.',
      '{firstName}, un moment pour deposer ce qui pese ?',
    ],
    routine: [
      '{firstName}, tu reprends ton fil aujourd\'hui ?',
      '{firstName}, quelques lignes pour garder ton rythme ?',
      '{firstName}, tu veux continuer ton espace d\'ecriture ?',
    ],
  },
  en: {
    gentle: [
      '{firstName}, want to take three quiet minutes for yourself?',
      '{firstName}, how are you really doing today?',
      '{firstName}, a few lines can be enough to come back to yourself.',
    ],
    clarity: [
      '{firstName}, want a little more clarity today?',
      '{firstName}, what is taking the most space in your mind right now?',
      '{firstName}, want to put down what keeps looping?',
    ],
    pressure_release: [
      '{firstName}, want to let some pressure out?',
      '{firstName}, a few lines can already lighten the load.',
      '{firstName}, want a moment to put down what feels heavy?',
    ],
    routine: [
      '{firstName}, ready to pick up your thread today?',
      '{firstName}, a few lines to keep your rhythm going?',
      '{firstName}, want to come back to your writing space?',
    ],
  },
};

const BODY_COPY: Record<ReminderLocale, string> = {
  fr: 'Ouvre Aurum et ecris quelques lignes, sans pression.',
  en: 'Open Aurum and write a few lines, without pressure.',
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
