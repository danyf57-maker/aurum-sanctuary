import { NextRequest, NextResponse } from "next/server";
import type { TrackedEventName } from "@/lib/analytics/types";
import { toCsv } from "@/lib/analytics/export-csv";
import { requireAnalyticsExportAccess } from "@/lib/analytics/export-auth";

const WINDOW_DAYS = 30;

type AnalyticsEventDoc = {
  name: TrackedEventName;
  occurredAt: Date;
  params: Record<string, unknown>;
};

function toDate(value: unknown): Date {
  if (!value) return new Date(0);
  if (value instanceof Date) return value;
  if (typeof value === "object" && value && "toDate" in value) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return new Date(0);
    }
  }
  return new Date(0);
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAnalyticsExportAccess(request);
    if (unauthorized) {
      return unauthorized;
    }

    const { db } = await import("@/lib/firebase/admin");

    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const snapshot = await db.collection("analyticsEvents").where("occurredAt", ">=", since).get();

    const events = snapshot.docs.map((doc: any): AnalyticsEventDoc => {
      const data = doc.data();
      return {
        name: data.name as TrackedEventName,
        occurredAt: toDate(data.occurredAt),
        params: (data.params as Record<string, unknown>) || {},
      };
    });

    const rows = new Map<string, {
      email_id: string;
      sent: number;
      opened: number;
      clicked: number;
      returned: number;
      wrote: number;
      trial_started: number;
      subscribed: number;
      purchases: number;
    }>();

    const ensure = (emailId: string) => {
      if (!rows.has(emailId)) {
        rows.set(emailId, {
          email_id: emailId,
          sent: 0,
          opened: 0,
          clicked: 0,
          returned: 0,
          wrote: 0,
          trial_started: 0,
          subscribed: 0,
          purchases: 0,
        });
      }
      return rows.get(emailId)!;
    };

    for (const event of events) {
      const emailId =
        typeof event.params.email_id === "string"
          ? event.params.email_id
          : typeof event.params.attributed_email_id === "string"
            ? event.params.attributed_email_id
            : null;
      if (!emailId) continue;

      const row = ensure(emailId);
      switch (event.name) {
        case "onboarding_email_sent":
          row.sent += 1;
          break;
        case "onboarding_email_opened":
          row.opened += 1;
          break;
        case "onboarding_email_link_clicked":
          row.clicked += 1;
          break;
        case "email_returned_to_aurum":
          row.returned += 1;
          break;
        case "entry_created":
          if (typeof event.params.attributed_email_id === "string") row.wrote += 1;
          break;
        case "trial_activated":
          if (typeof event.params.attributed_email_id === "string") row.trial_started += 1;
          break;
        case "subscription_started":
          if (typeof event.params.attributed_email_id === "string") row.subscribed += 1;
          break;
        case "purchase":
          if (typeof event.params.attributed_email_id === "string") row.purchases += 1;
          break;
      }
    }

    const formatted = Array.from(rows.values())
      .sort((a, b) => a.email_id.localeCompare(b.email_id))
      .map((row) => ({
        ...row,
        open_rate: row.sent ? Number((row.opened / row.sent).toFixed(4)) : 0,
        click_rate: row.sent ? Number((row.clicked / row.sent).toFixed(4)) : 0,
        return_rate: row.clicked ? Number((row.returned / row.clicked).toFixed(4)) : 0,
        write_rate: row.clicked ? Number((row.wrote / row.clicked).toFixed(4)) : 0,
        trial_rate: row.clicked ? Number((row.trial_started / row.clicked).toFixed(4)) : 0,
        subscribe_rate: row.clicked ? Number((row.subscribed / row.clicked).toFixed(4)) : 0,
        subscribe_after_write_rate: row.wrote ? Number((row.subscribed / row.wrote).toFixed(4)) : 0,
      }));

    if (request.nextUrl.searchParams.get("format") === "csv") {
      return new NextResponse(toCsv(formatted), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=email-funnel-${WINDOW_DAYS}d.csv`,
        },
      });
    }

    return NextResponse.json({
      windowDays: WINDOW_DAYS,
      rows: formatted,
    });
  } catch (error) {
    console.error("email funnel analytics error", error);
    return NextResponse.json({ message: "Failed to load email funnel analytics" }, { status: 500 });
  }
}
