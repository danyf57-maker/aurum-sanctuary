import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

type ExportType = "users_enriched" | "users" | "events";

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

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const header = headers.map(csvEscape).join(",");
  const body = rows.map((row) => headers.map((h) => csvEscape(row[h])).join(","));
  return [header, ...body].join("\n");
}

function formatDate(value: Date | null) {
  return value ? value.toISOString() : "";
}

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = (await cookies()).get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { auth, db, isAdminEmail } = await import("@/lib/firebase/admin");
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    if (!isAdminEmail(decoded.email)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const typeParam = request.nextUrl.searchParams.get("type") || "users_enriched";
    const type = typeParam as ExportType;
    if (!["users_enriched", "users", "events"].includes(type)) {
      return NextResponse.json({ message: "Invalid export type" }, { status: 400 });
    }

    if (type === "events") {
      const eventsSnap = await db
        .collection("analyticsEvents")
        .orderBy("occurredAt", "desc")
        .limit(50000)
        .get();

      const rows = eventsSnap.docs.map((doc: any) => {
        const d = doc.data() as Record<string, unknown>;
        return {
          event_id: doc.id,
          user_id: String(d.userId || ""),
          event_name: String(d.name || ""),
          timestamp: formatDate(toDate(d.occurredAt)),
          path: String(d.path || ""),
        };
      });

      const csv = toCsv(rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="events.csv"`,
        },
      });
    }

    const usersSnap = await db.collection("users").get();
    const users = usersSnap.docs.map((doc: any) => {
      const d = doc.data() as Record<string, unknown>;
      const status = String(d.subscriptionStatus || "free");
      const planType =
        status === "active" || status === "trialing"
          ? "monthly"
          : status === "canceled"
            ? "free"
            : "free";

      return {
        user_id: doc.id,
        created_at: formatDate(toDate(d.createdAt)),
        plan_type: planType,
        subscription_start_date: formatDate(toDate(d.subscriptionCurrentPeriodEnd)),
        total_journal_entries: Number(d.entryCount || 0),
      };
    });

    if (type === "users") {
      const rows = users.map((u) => ({
        user_id: u.user_id,
        created_at: u.created_at,
        plan_type: u.plan_type,
        subscription_start_date: u.subscription_start_date,
      }));
      const csv = toCsv(rows);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="users.csv"`,
        },
      });
    }

    const entriesSnap = await db.collectionGroup("entries").select("createdAt").get();
    const entriesByUser = new Map<string, Date[]>();

    for (const doc of entriesSnap.docs as any[]) {
      const uid = doc.ref?.parent?.parent?.id as string | undefined;
      if (!uid) continue;
      const createdAt = toDate(doc.data()?.createdAt);
      if (!createdAt) continue;
      const current = entriesByUser.get(uid) || [];
      current.push(createdAt);
      entriesByUser.set(uid, current);
    }

    const rows = users.map((user) => {
      const dates = entriesByUser.get(user.user_id) || [];
      dates.sort((a, b) => a.getTime() - b.getTime());
      return {
        user_id: user.user_id,
        created_at: user.created_at,
        total_journal_entries: user.total_journal_entries,
        date_of_first_entry: formatDate(dates[0] || null),
        date_of_last_entry: formatDate(dates[dates.length - 1] || null),
        plan_type: user.plan_type,
      };
    });

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users_enriched.csv"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message: "Export failed", error: message }, { status: 500 });
  }
}

