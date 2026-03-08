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

export async function GET(request: NextRequest) {
  try {
    const unauthorized = await requireAnalyticsExportAccess(request);
    if (unauthorized) return unauthorized;

    const { db } = await import("@/lib/firebase/admin");
    const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const [eventsSnapshot, devicesSnapshot] = await Promise.all([
      db.collection("analyticsEvents").where("occurredAt", ">=", since).get(),
      db.collectionGroup("devices").where("pushEnabled", "==", true).get(),
    ]);

    const events = eventsSnapshot.docs.map((doc: any): AnalyticsEventDoc => {
      const data = doc.data();
      return {
        name: data.name as TrackedEventName,
        occurredAt: toDate(data.occurredAt),
        params: (data.params as Record<string, unknown>) || {},
      };
    });

    const rows = new Map<string, {
      date: string;
      notifications_sent: number;
      test_notifications_sent: number;
      device_registrations: number;
      device_unregistrations: number;
      gentle_sent: number;
      clarity_sent: number;
      pressure_release_sent: number;
      routine_sent: number;
    }>();

    const ensure = (date: string) => {
      if (!rows.has(date)) {
        rows.set(date, {
          date,
          notifications_sent: 0,
          test_notifications_sent: 0,
          device_registrations: 0,
          device_unregistrations: 0,
          gentle_sent: 0,
          clarity_sent: 0,
          pressure_release_sent: 0,
          routine_sent: 0,
        });
      }
      return rows.get(date)!;
    };

    for (const event of events) {
      const row = ensure(toDayKey(event.occurredAt));
      switch (event.name) {
        case "writing_reminder_sent": {
          row.notifications_sent += 1;
          const tone = String(event.params.tone || "");
          if (tone === "gentle") row.gentle_sent += 1;
          if (tone === "clarity") row.clarity_sent += 1;
          if (tone === "pressure_release") row.pressure_release_sent += 1;
          if (tone === "routine") row.routine_sent += 1;
          break;
        }
        case "writing_reminder_test_sent":
          row.test_notifications_sent += 1;
          break;
        case "writing_reminder_device_registered":
          row.device_registrations += 1;
          break;
        case "writing_reminder_device_unregistered":
          row.device_unregistrations += 1;
          break;
      }
    }

    const formatted = Array.from(rows.values()).sort((a, b) => a.date.localeCompare(b.date));
    const payload = {
      windowDays: WINDOW_DAYS,
      activeDevices: devicesSnapshot.size,
      rows: formatted,
    };

    if (request.nextUrl.searchParams.get("format") === "csv") {
      const csvRows = formatted.map((row) => ({ ...row, active_devices_snapshot: devicesSnapshot.size }));
      return new NextResponse(toCsv(csvRows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename=reminder-funnel-${WINDOW_DAYS}d.csv`,
        },
      });
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("reminder funnel analytics error", error);
    return NextResponse.json({ message: "Failed to load reminder funnel analytics" }, { status: 500 });
  }
}
