import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildAnalyticsReportPack, ANALYTICS_REPORT_WINDOW_DAYS } from "@/lib/analytics/report-pack";
import { requireAnalyticsExportAccess } from "@/lib/analytics/export-auth";

export const dynamic = "force-dynamic";

const REPORT_STATE_DOC = "ops/biweeklyAnalyticsReportEmail";
const REPORT_INTERVAL_MS = 15 * 24 * 60 * 60 * 1000;
const LOCK_TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_RECIPIENT = "contact@aurumdiary.com";

type ReportLockResult =
  | { shouldSend: false; reason: "cooldown" | "locked"; nextEligibleAt?: string | null }
  | { shouldSend: true; runId: string };

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
  return null;
}

function parseBoolean(value: string | null) {
  return value === "1" || value === "true" || value === "yes";
}

async function claimReportLock(
  db: FirebaseFirestore.Firestore,
  force: boolean
): Promise<ReportLockResult> {
  const now = new Date();
  const runId = randomUUID();
  const reportRef = db.doc(REPORT_STATE_DOC);

  return db.runTransaction(async (tx) => {
    const snapshot = await tx.get(reportRef);
    const data = snapshot.data() || {};
    const lastSentAt = toDate(data.lastSentAt);
    const lockStartedAt = toDate(data.lockStartedAt);
    const nextEligibleAt =
      lastSentAt ? new Date(lastSentAt.getTime() + REPORT_INTERVAL_MS) : null;

    if (!force && lastSentAt && now.getTime() - lastSentAt.getTime() < REPORT_INTERVAL_MS) {
      return {
        shouldSend: false,
        reason: "cooldown" as const,
        nextEligibleAt: nextEligibleAt?.toISOString() || null,
      };
    }

    if (
      !force &&
      data.status === "sending" &&
      lockStartedAt &&
      now.getTime() - lockStartedAt.getTime() < LOCK_TTL_MS
    ) {
      return {
        shouldSend: false,
        reason: "locked" as const,
        nextEligibleAt: nextEligibleAt?.toISOString() || null,
      };
    }

    tx.set(
      reportRef,
      {
        status: "sending",
        currentRunId: runId,
        lockStartedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    return { shouldSend: true, runId };
  });
}

async function sendReportEmail(params: {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  attachments: Array<{ filename: string; content: string }>;
  idempotencyKey: string;
}) {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey,
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      reply_to: params.replyTo,
      subject: params.subject,
      html: params.html,
      text: params.text,
      tags: [{ name: "flow", value: "analytics-report" }],
      attachments: params.attachments.map((attachment) => ({
        filename: attachment.filename,
        content: Buffer.from(attachment.content, "utf8").toString("base64"),
        content_type: "text/csv",
      })),
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Resend analytics report failed (${response.status}): ${message}`);
  }

  const body = (await response.json()) as { id?: string };
  return body.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const unauthorized = await requireAnalyticsExportAccess(request);
    if (unauthorized) return unauthorized;

    const { db } = await import("@/lib/firebase/admin");
    const force = parseBoolean(request.nextUrl.searchParams.get("force"));
    const lock = await claimReportLock(db, force);

    if (!lock.shouldSend) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: lock.reason,
        nextEligibleAt: lock.nextEligibleAt || null,
      });
    }

    const reportRef = db.doc(REPORT_STATE_DOC);

    try {
      const pack = await buildAnalyticsReportPack(db, {
        days: ANALYTICS_REPORT_WINDOW_DAYS,
      });

      const recipient = process.env.ANALYTICS_REPORT_TO_EMAIL?.trim() || DEFAULT_RECIPIENT;
      const from = process.env.ONBOARDING_FROM_EMAIL?.trim() || `Aurum <${DEFAULT_RECIPIENT}>`;
      const replyTo = process.env.ONBOARDING_REPLY_TO?.trim() || undefined;
      const periodStart = pack.summary.periodStart.slice(0, 10);
      const periodEnd = pack.summary.periodEnd.slice(0, 10);
      const subject = `Aurum analytics export · ${periodStart} to ${periodEnd}`;
      const summaryLines = [
        `Signups: ${pack.summary.signups}`,
        `Entries created: ${pack.summary.entriesCreated}`,
        `Aurum follow-ups: ${pack.summary.aurumMessagesSent}`,
        `Free limit reached: ${pack.summary.freeLimitReached}`,
        `Checkout starts: ${pack.summary.checkoutStarts}`,
        `Trials started: ${pack.summary.trialsStarted}`,
        `Subscriptions started: ${pack.summary.subscriptionsStarted}`,
        `Purchases: ${pack.summary.purchases}`,
        `Revenue: ${pack.summary.revenueAmount.toFixed(2)} ${pack.summary.revenueCurrencies || ""}`.trim(),
      ];

      const html = `
        <p>Voici le pack analytics Aurum des ${ANALYTICS_REPORT_WINDOW_DAYS} derniers jours.</p>
        <p><strong>Periode:</strong> ${periodStart} -> ${periodEnd}</p>
        <ul>${summaryLines.map((line) => `<li>${line}</li>`).join("")}</ul>
        <p>Les CSV joints ne contiennent pas le contenu des journaux. Ils couvrent uniquement les donnees produit et commerciales.</p>
      `;
      const text = [
        `Aurum analytics export (${periodStart} -> ${periodEnd})`,
        "",
        ...summaryLines,
        "",
        "The attached CSV files contain product and commercial analytics only. No journal content is included.",
      ].join("\n");

      const resendId = await sendReportEmail({
        to: recipient,
        from,
        replyTo,
        subject,
        html,
        text,
        attachments: pack.attachments.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
        })),
        idempotencyKey: `analytics-report-${periodStart}-${periodEnd}`,
      });

      const now = new Date();
      await reportRef.set(
        {
          status: "idle",
          currentRunId: lock.runId,
          lastSentAt: now,
          lastPeriodStart: pack.summary.periodStart,
          lastPeriodEnd: pack.summary.periodEnd,
          lastRecipient: recipient,
          lastProviderId: resendId,
          lastAttachmentCount: pack.attachments.length,
          nextEligibleAt: new Date(now.getTime() + REPORT_INTERVAL_MS),
          lockStartedAt: null,
          lastError: null,
          updatedAt: now,
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        sent: true,
        providerId: resendId,
        summary: pack.summary,
        attachments: pack.attachments.map((attachment) => ({
          filename: attachment.filename,
          rowCount: attachment.rowCount,
        })),
      });
    } catch (error) {
      await reportRef.set(
        {
          status: "idle",
          lockStartedAt: null,
          lastError:
            error instanceof Error ? error.message.slice(0, 500) : "Unknown analytics report error",
          lastErrorAt: new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
      throw error;
    }
  } catch (error) {
    console.error("analytics report email error", error);
    return NextResponse.json(
      {
        message: "Failed to send analytics report email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
