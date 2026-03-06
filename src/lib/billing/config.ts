// Toggle global pour ouvrir Aurum pendant la phase test.
// Remettre a false pour reactiver la monetisation.
export const PAYMENTS_PAUSED = false;

function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

// Duree d'essai par defaut avant la premiere facturation.
// Surcharge possible via STRIPE_TRIAL_DAYS.
export const STRIPE_TRIAL_DAYS = readIntEnv('STRIPE_TRIAL_DAYS', 7);

// Stripe envoie trial_will_end environ 3 jours avant la fin.
export const STRIPE_TRIAL_REMINDER_DAYS = 3;
