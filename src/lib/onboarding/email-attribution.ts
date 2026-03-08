import "server-only";

import { db } from "@/lib/firebase/admin";

export const EMAIL_ATTRIBUTION_WINDOW_HOURS = 24 * 7;

export type EmailAttributionState = {
  emailId: string;
  clickedAt: Date;
  targetUrl?: string | null;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export async function recordEmailClickAttribution(params: {
  userId: string;
  emailId: string;
  targetUrl?: string | null;
}) {
  const now = new Date();
  await db.doc(`users/${params.userId}/marketing/emailAttribution`).set(
    {
      lastEmailClickId: params.emailId,
      lastEmailClickAt: now,
      lastEmailTargetUrl: params.targetUrl ?? null,
      updatedAt: now,
    },
    { merge: true }
  );
}

export async function getActiveEmailAttribution(
  userId: string
): Promise<EmailAttributionState | null> {
  const snap = await db.doc(`users/${userId}/marketing/emailAttribution`).get();
  const data = snap.data() as Record<string, unknown> | undefined;
  if (!data) return null;

  const emailId = typeof data.lastEmailClickId === "string" ? data.lastEmailClickId : null;
  const clickedAt = toDate(data.lastEmailClickAt);
  if (!emailId || !clickedAt) return null;

  const ageHours = (Date.now() - clickedAt.getTime()) / (1000 * 60 * 60);
  if (ageHours > EMAIL_ATTRIBUTION_WINDOW_HOURS) return null;

  return {
    emailId,
    clickedAt,
    targetUrl: typeof data.lastEmailTargetUrl === "string" ? data.lastEmailTargetUrl : null,
  };
}
