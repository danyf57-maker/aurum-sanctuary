import "server-only";

import { db } from "@/lib/firebase/admin";
import { trackServerEvent } from "@/lib/analytics/server";
import { renderOnboardingEmail } from "@/lib/onboarding/templates";
import { sendOnboardingEmail } from "@/lib/onboarding/sender";
import type { OnboardingEmailId, OnboardingState } from "@/lib/onboarding/types";
import { pickNextOnboardingEmail } from "@/lib/onboarding/decision";
import { normalizeLocale, type Locale } from "@/lib/locale";
import { resolveFirstName } from "@/lib/profile/first-name";

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
  const processedEmails = new Set<string>();

  for (const userDoc of usersSnap.docs as any[]) {
    const data = userDoc.data() as Record<string, unknown>;
    const userId = userDoc.id as string;
    const email = String(data.email || "").trim().toLowerCase();
    if (!email) {
      skipped += 1;
      continue;
    }

    if (processedEmails.has(email)) {
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
    const createdAt = asDate(data.createdAt);
    const lastEntryAt = asDate(data.lastEntryAt);
    const freeLimitReachedAt = asDate(data.freeLimitReachedAt);
    const trialEndsAt = asDate(data.subscriptionTrialEndsAt) || asDate(data.subscriptionCurrentPeriodEnd);
    const subscriptionId =
      typeof data.subscriptionId === "string" && data.subscriptionId.trim()
        ? data.subscriptionId.trim()
        : null;
    const billingPhase =
      typeof data.billingPhase === "string" && data.billingPhase.trim()
        ? data.billingPhase.trim()
        : null;

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

    const nextEmail = pickNextOnboardingEmail(stateData, {
      createdAt,
      lastEntryAt,
      entryCount,
      subscriptionStatus,
      subscriptionId,
      billingPhase,
      freeLimitReachedAt,
      trialEndsAt,
    });

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
          lastSentAt: nowIso,
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
      processedEmails.add(email);
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
