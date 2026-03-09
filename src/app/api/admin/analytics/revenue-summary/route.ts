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

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function amountToMajor(value: unknown) {
  return typeof value === "number" ? value / 100 : 0;
}

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAnalyticsExportAccess(request);
    if (unauthorized) return unauthorized;

    const { db } = await import("@/lib/firebase/admin");
    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const [eventsSnapshot, usersSnapshot] = await Promise.all([
      db.collection("analyticsEvents").where("occurredAt", ">=", since).get(),
      db.collection("users").where("subscriptionStatus", "==", "active").get(),
    ]);

    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "";
    const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || "";

    const rows = new Map<string, {
      date: string;
      checkout_starts: number;
      trials_started: number;
      subscriptions_started: number;
      purchases: number;
      revenue_eur: number;
    }>();

    const ensure = (date: string) => {
      if (!rows.has(date)) {
        rows.set(date, {
          date,
          checkout_starts: 0,
          trials_started: 0,
          subscriptions_started: 0,
          purchases: 0,
          revenue_eur: 0,
        });
      }
      return rows.get(date)!;
    };

    for (const doc of eventsSnapshot.docs) {
      const data = doc.data() as { name?: TrackedEventName; occurredAt?: unknown; params?: Record<string, unknown> };
      const name = data.name as TrackedEventName;
      const occurredAt = toDate(data.occurredAt);
      const params = data.params || {};
      const row = ensure(toDayKey(occurredAt));
      switch (name) {
        case "checkout_start":
          row.checkout_starts += 1;
          break;
        case "trial_activated":
          row.trials_started += 1;
          break;
        case "subscription_started":
          row.subscriptions_started += 1;
          break;
        case "purchase":
          row.purchases += 1;
          row.revenue_eur += amountToMajor(params.amount);
          break;
      }
    }

    const activeMonthly = usersSnapshot.docs.filter((doc) => (doc.data().subscriptionPriceId || "") === monthlyPriceId).length;
    const activeYearly = usersSnapshot.docs.filter((doc) => (doc.data().subscriptionPriceId || "") === yearlyPriceId).length;
    const formatted = Array.from(rows.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((row) => ({
        ...row,
        revenue_eur: Number(row.revenue_eur.toFixed(2)),
        trial_to_paid_rate: row.trials_started ? Number((row.subscriptions_started / row.trials_started).toFixed(4)) : 0,
        checkout_to_paid_rate: row.checkout_starts ? Number((row.subscriptions_started / row.checkout_starts).toFixed(4)) : 0,
      }));

    const payload = {
      windowDays: WINDOW_DAYS,
      activeMonthly,
      activeYearly,
      rows: formatted,
    };

    if (request.nextUrl.searchParams.get("format") === "csv") {
      const csvRows = formatted.map((row) => ({
        ...row,
        active_monthly_snapshot: activeMonthly,
        active_yearly_snapshot: activeYearly,
      }));
      return new NextResponse(toCsv(csvRows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=revenue-summary-${WINDOW_DAYS}d.csv`,
        },
      });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("revenue summary analytics error", error);
    return NextResponse.json({ message: "Failed to load revenue summary analytics" }, { status: 500 });
  }
}
