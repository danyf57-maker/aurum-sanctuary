import "server-only";

import { db } from "@/lib/firebase/admin";
import { trackServerEvent } from "@/lib/analytics/server";
import { renderOnboardingEmail } from "@/lib/onboarding/templates";
import { sendOnboardingEmail } from "@/lib/onboarding/sender";
import type { OnboardingEmailId, OnboardingState } from "@/lib/onboarding/types";
import { FREE_ENTRY_LIMIT, STRIPE_TRIAL_REMINDER_DAYS } from "@/lib/billing/config";
import { normalizeLocale, type Locale } from "@/lib/locale";
import { resolveFirstName } from "@/lib/profile/first-name";

const PAID_STATUSES = new Set(["active", "trialing"]);

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "object" && value && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

function hoursSince(value?: unknown) {
  const date = asDate(value ?? null);
  if (!date) return Number.POSITIVE_INFINITY;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

function hoursUntil(value?: unknown) {
  const date = asDate(value ?? null);
  if (!date) return Number.NEGATIVE_INFINITY;
  return (date.getTime() - Date.now()) / (1000 * 60 * 60);
}

type LifecycleSignals = {
  entryCount: number;
  subscriptionStatus: string;
  freeLimitReachedAt: Date | null;
  trialConsumedAt: Date | null;
  trialEndsAt: Date | null;
};

function pickLifecycleEmail(
  state: OnboardingState,
  signals: LifecycleSignals
): OnboardingEmailId | null {
  const sent = state.sent || {};

  if (
    signals.subscriptionStatus === "active" &&
    !sent.subscription_active
  ) {
    return "subscription_active";
  }

  if (signals.subscriptionStatus === "trialing") {
    if (!sent.trial_started) {
      return "trial_started";
    }

    const remainingHours = hoursUntil(signals.trialEndsAt);
    if (
      !sent.trial_ending_soon &&
      remainingHours > 0 &&
      remainingHours <= STRIPE_TRIAL_REMINDER_DAYS * 24
    ) {
      return "trial_ending_soon";
    }

    return null;
  }

  if (
    signals.entryCount >= FREE_ENTRY_LIMIT &&
    !sent.free_limit_followup &&
    hoursSince(signals.freeLimitReachedAt) >= 12
  ) {
    return "free_limit_followup";
  }

  return null;
}

function resolveUserLocale(
  userData: Record<string, unknown>,
  prefsData: Record<string, unknown>
): Locale {
  const fromPrefs = normalizeLocale(String(prefsData.language || prefsData.locale || ""));
  if (fromPrefs) return fromPrefs;

  const fromUser = normalizeLocale(String(userData.language || userData.locale || ""));
  if (fromUser) return fromUser;

  return "en";
}

export async function runOnboardingSequence() {
  const enabled = (process.env.ONBOARDING_EMAILS_ENABLED || "false").toLowerCase() === "true";
  if (!enabled) {
    return { enabled: false, scanned: 0, sent: 0, skipped: 0 };
  }

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aurumdiary.com";
  const from = process.env.ONBOARDING_FROM_EMAIL || "Daniel d'Aurum Diary <hello@aurumdiary.com>";
  const replyTo = process.env.ONBOARDING_REPLY_TO || "hello@aurumdiary.com";

  const usersSnap = await db.collection("users").limit(1000).get();
  let sentCount = 0;
  let skipped = 0;

  for (const userDoc of usersSnap.docs as any[]) {
    const data = userDoc.data() as Record<string, unknown>;
    const userId = userDoc.id as string;
    const email = String(data.email || "").trim().toLowerCase();
    if (!email) {
      skipped += 1;
      continue;
    }

    const subscriptionStatus = String(data.subscriptionStatus || "free");
    const entryCount = Number(data.entryCount || 0);
    const firstName = resolveFirstName({
      firstName: typeof data.firstName === 'string' ? data.firstName : null,
      displayName: typeof data.displayName === 'string' ? data.displayName : null,
      email,
    });
    const freeLimitReachedAt = asDate(data.freeLimitReachedAt);
    const trialConsumedAt = asDate(data.trialConsumedAt);
    const trialEndsAt = asDate(data.subscriptionTrialEndsAt) || asDate(data.subscriptionCurrentPeriodEnd);

    const prefsRef = db.collection("users").doc(userId).collection("settings").doc("preferences");
    const stateRef = db.collection("users").doc(userId).collection("onboarding").doc("state");
    const [prefsSnap, stateSnap] = await Promise.all([prefsRef.get(), stateRef.get()]);
    const prefsData = (prefsSnap.data() || {}) as Record<string, unknown>;
    const stateData = (stateSnap.data() || {}) as OnboardingState;
    const locale = resolveUserLocale(data, prefsData);

    if (prefsData.marketingUnsubscribedAt || stateData.unsubscribedAt || stateData.invalidEmailAt) {
      skipped += 1;
      continue;
    }

    const nextLifecycleEmail = pickLifecycleEmail(stateData, {
      entryCount,
      subscriptionStatus,
      freeLimitReachedAt,
      trialConsumedAt,
      trialEndsAt,
    });

    const nextEmail = nextLifecycleEmail;

    if (!nextEmail) {
      skipped += 1;
      continue;
    }

    const outboxRef = db
      .collection("users")
      .doc(userId)
      .collection("onboarding")
      .doc(`outbox_${nextEmail}`);

    try {
      await outboxRef.create({
        emailId: nextEmail,
        status: "sending",
        createdAt: new Date(),
      });
    } catch (lockError: any) {
      const code = String(lockError?.code || "");
      if (code === "6" || code === "already-exists" || code === "ALREADY_EXISTS") {
        skipped += 1;
        continue;
      }
      throw lockError;
    }

    const content = renderOnboardingEmail({
      emailId: nextEmail,
      firstName,
      userId,
      appBaseUrl,
      locale,
    });

    try {
      const providerMessageId = await sendOnboardingEmail({
        to: email,
        from,
        replyTo,
        content,
      });

      const nowIso = new Date().toISOString();
      await stateRef.set(
        {
          sent: {
            ...(stateData.sent || {}),
            [nextEmail]: nowIso,
          },
          lastSentEmailId: nextEmail,
          updatedAt: nowIso,
          providerMessageId: providerMessageId || null,
        },
        { merge: true }
      );
      await outboxRef.set(
        {
          status: "sent",
          sentAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      await trackServerEvent("onboarding_email_sent", {
        userId,
        userEmail: email,
        path: "/api/onboarding/run",
        params: {
          email_id: nextEmail,
          subject: content.subject,
          locale,
        },
      });

      sentCount += 1;
    } catch (error) {
      await stateRef.set(
        {
          lastErrorAt: new Date().toISOString(),
          lastErrorMessage: error instanceof Error ? error.message : "Unknown send error",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      await outboxRef.delete().catch(() => null);
      skipped += 1;
    }
  }

  return { enabled: true, scanned: usersSnap.size, sent: sentCount, skipped };
}
