import { FREE_ENTRY_LIMIT, STRIPE_TRIAL_REMINDER_DAYS } from "../billing/config";
import type { OnboardingEmailId, OnboardingState } from "./types";

export type OnboardingSignals = {
  createdAt: Date | null;
  lastEntryAt: Date | null;
  entryCount: number;
  subscriptionStatus: string;
  subscriptionId: string | null;
  billingPhase: string | null;
  freeLimitReachedAt: Date | null;
  trialEndsAt: Date | null;
};

const DRIP_EMAIL_IDS: OnboardingEmailId[] = [
  "email_1",
  "email_2",
  "email_3",
  "email_4",
  "habit_email_1",
  "habit_email_2",
];

const DRIP_MIN_GAP_HOURS = 20;
const GLOBAL_MIN_GAP_HOURS = 20;

function hoursSince(value: Date | null, now: Date) {
  if (!value) return Number.POSITIVE_INFINITY;
  return (now.getTime() - value.getTime()) / (1000 * 60 * 60);
}

function hoursUntil(value: Date | null, now: Date) {
  if (!value) return Number.NEGATIVE_INFINITY;
  return (value.getTime() - now.getTime()) / (1000 * 60 * 60);
}

function sentAt(state: OnboardingState, emailId: OnboardingEmailId) {
  const raw = state.sent?.[emailId];
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function latestSentAt(state: OnboardingState, emailIds: OnboardingEmailId[]) {
  let latest: Date | null = null;
  for (const emailId of emailIds) {
    const value = sentAt(state, emailId);
    if (!value) continue;
    if (!latest || value.getTime() > latest.getTime()) {
      latest = value;
    }
  }
  return latest;
}

function latestAnySentAt(state: OnboardingState) {
  const explicit = state.lastSentAt ? new Date(state.lastSentAt) : null;
  if (explicit && !Number.isNaN(explicit.getTime())) {
    return explicit;
  }

  return latestSentAt(state, [
    "email_1",
    "email_2",
    "email_3",
    "email_4",
    "habit_email_1",
    "habit_email_2",
    "free_limit_followup",
    "trial_started",
    "trial_ending_soon",
    "subscription_active",
    "trial_expired_no_conversion",
  ]);
}

function hasStripeManagedTrial(signals: OnboardingSignals) {
  return signals.subscriptionStatus === "trialing" && !!signals.subscriptionId;
}

function hasPaidSubscription(signals: OnboardingSignals) {
  return signals.subscriptionStatus === "active";
}

function pickLifecycleEmail(
  state: OnboardingState,
  signals: OnboardingSignals,
  now: Date
): OnboardingEmailId | null {
  if (hasPaidSubscription(signals) && !state.sent?.subscription_active) {
    return "subscription_active";
  }

  if (hasStripeManagedTrial(signals)) {
    if (!state.sent?.trial_started) {
      return "trial_started";
    }

    const remainingHours = hoursUntil(signals.trialEndsAt, now);
    if (
      !state.sent?.trial_ending_soon &&
      remainingHours > 0 &&
      remainingHours <= STRIPE_TRIAL_REMINDER_DAYS * 24
    ) {
      return "trial_ending_soon";
    }

    return null;
  }

  if (signals.billingPhase === "trial_expired" && !state.sent?.trial_expired_no_conversion) {
    return "trial_expired_no_conversion";
  }

  if (
    signals.entryCount >= FREE_ENTRY_LIMIT &&
    !state.sent?.free_limit_followup &&
    hoursSince(signals.freeLimitReachedAt, now) >= 12
  ) {
    return "free_limit_followup";
  }

  return null;
}

function pickDripEmail(
  state: OnboardingState,
  signals: OnboardingSignals,
  now: Date
): OnboardingEmailId | null {
  if (hasPaidSubscription(signals) || hasStripeManagedTrial(signals) || signals.billingPhase === "trial_expired") {
    return null;
  }

  const lastDripSentAt = latestSentAt(state, DRIP_EMAIL_IDS);
  if (hoursSince(lastDripSentAt, now) < DRIP_MIN_GAP_HOURS) {
    return null;
  }

  const signupHours = hoursSince(signals.createdAt, now);
  const hoursSinceLastEntry = hoursSince(signals.lastEntryAt, now);

  if (signals.entryCount <= 0) {
    if (!state.sent?.email_1 && signupHours >= 1) {
      return "email_1";
    }

    if (state.sent?.email_1 && !state.sent?.email_2 && signupHours >= 24) {
      return "email_2";
    }

    if (state.sent?.email_2 && !state.sent?.email_3 && signupHours >= 72) {
      return "email_3";
    }

    if (!state.sent?.email_4 && signupHours >= 24 * 7) {
      return "email_4";
    }

    return null;
  }

  if (!state.sent?.habit_email_1 && hoursSinceLastEntry >= 24) {
    return "habit_email_1";
  }

  if (state.sent?.habit_email_1 && !state.sent?.habit_email_2 && hoursSinceLastEntry >= 72) {
    return "habit_email_2";
  }

  return null;
}

export function pickNextOnboardingEmail(
  state: OnboardingState,
  signals: OnboardingSignals,
  now = new Date()
): OnboardingEmailId | null {
  const lastAnySentAt = latestAnySentAt(state);
  if (hoursSince(lastAnySentAt, now) < GLOBAL_MIN_GAP_HOURS) {
    return null;
  }

  return pickLifecycleEmail(state, signals, now) || pickDripEmail(state, signals, now);
}
