import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase/admin";
import { trackServerEvent } from "@/lib/analytics/server";
import { renderOnboardingEmail } from "@/lib/onboarding/templates";
import { sendOnboardingEmail } from "@/lib/onboarding/sender";
import type { OnboardingEmailId, OnboardingState } from "@/lib/onboarding/types";

const PAID_STATUSES = new Set(["active", "trialing"]);

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

function hoursSince(dateIso?: string | null) {
  if (!dateIso) return Number.POSITIVE_INFINITY;
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

function pickNextEmail(
  state: OnboardingState,
  createdAt: Date | null,
  firstEntryAt: Date | null,
  entryCount: number,
  subscriptionStatus: string
): OnboardingEmailId | null {
  const sent = state.sent || {};
  const hoursSinceSignup = createdAt
    ? (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
    : Number.POSITIVE_INFINITY;

  // Email #1: ~15 minutes after signup
  if (!sent.email_1 && hoursSinceSignup >= 0.25) return "email_1";

  // Branche A: utilisateur n'a pas commence a ecrire
  if (entryCount === 0) {
    if (!sent.email_2 && hoursSince(sent.email_1) >= 24) return "email_2";
    if (!sent.email_3 && hoursSince(sent.email_2) >= 48 && !PAID_STATUSES.has(subscriptionStatus)) return "email_3";
    if (!sent.email_4 && hoursSince(sent.email_3) >= 96 && !PAID_STATUSES.has(subscriptionStatus)) return "email_4";
    return null;
  }

  // Branche B: utilisateur a deja commence a ecrire
  const hoursSinceFirstEntry = firstEntryAt
    ? (Date.now() - firstEntryAt.getTime()) / (1000 * 60 * 60)
    : Number.POSITIVE_INFINITY;
  if (!sent.habit_email_1 && hoursSince(sent.email_1) >= 24 && hoursSinceFirstEntry >= 24) return "habit_email_1";
  if (!sent.habit_email_2 && hoursSince(sent.habit_email_1) >= 72 && !PAID_STATUSES.has(subscriptionStatus))
    return "habit_email_2";

  return null;
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
    const firstEntryAt = asDate(data.firstEntryAt);
    const firstName = String(data.displayName || email.split("@")[0] || "toi");
    const createdAt = asDate(data.createdAt);

    const prefsRef = db.collection("users").doc(userId).collection("settings").doc("preferences");
    const stateRef = db.collection("users").doc(userId).collection("onboarding").doc("state");
    const [prefsSnap, stateSnap] = await Promise.all([prefsRef.get(), stateRef.get()]);
    const prefsData = (prefsSnap.data() || {}) as Record<string, unknown>;
    const stateData = (stateSnap.data() || {}) as OnboardingState;

    if (PAID_STATUSES.has(subscriptionStatus)) {
      await stateRef.set(
        {
          stoppedAt: new Date().toISOString(),
          stoppedReason: "subscription_started",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      skipped += 1;
      continue;
    }

    if (prefsData.marketingUnsubscribedAt || stateData.unsubscribedAt || stateData.invalidEmailAt) {
      skipped += 1;
      continue;
    }

    const nextEmail = pickNextEmail(
      stateData,
      createdAt,
      firstEntryAt,
      entryCount,
      subscriptionStatus
    );
    if (!nextEmail) {
      skipped += 1;
      continue;
    }

    const outboxRef = db
      .collection("users")
      .doc(userId)
      .collection("onboarding")
      .doc(`outbox_${nextEmail}`);

    // Verrou atomique anti-doublon: une seule creation possible par user+emailId
    try {
      await outboxRef.create({
        emailId: nextEmail,
        status: "sending",
        createdAt: Timestamp.now(),
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
          sentAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
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
        },
      });
      sentCount += 1;
    } catch (error) {
      // Ne jamais re-envoyer en boucle: on enregistre l'erreur la plus recente.
      await stateRef.set(
        {
          lastErrorAt: new Date().toISOString(),
          lastErrorMessage: error instanceof Error ? error.message : "Unknown send error",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      // En cas d'echec d'envoi, on libere le verrou pour permettre une relance ulterieure.
      await outboxRef.delete().catch(() => null);
      skipped += 1;
    }
  }

  await db.collection("onboardingJobs").add({
    createdAt: Timestamp.now(),
    scannedUsers: usersSnap.size,
    sentCount,
    skippedCount: skipped,
  });

  return {
    enabled: true,
    scanned: usersSnap.size,
    sent: sentCount,
    skipped,
  };
}
