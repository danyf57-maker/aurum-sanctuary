import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  LEAD_SCORE_WEIGHTS,
  TRACKED_EVENTS,
  type TrackedEventName,
} from "@/lib/analytics/types";

type AnalyticsEventDoc = {
  id: string;
  name: TrackedEventName;
  occurredAt: Date;
  userId: string | null;
  userEmail: string | null;
  clientId: string | null;
  path: string | null;
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

function uniqueIdentities(events: AnalyticsEventDoc[]) {
  return new Set(
    events.map((event) => event.userId || event.clientId).filter(Boolean)
  ).size;
}

function leadSegment(score: number) {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export async function GET() {
  try {
    const { auth, db, isAdminEmail } = await import("@/lib/firebase/admin");
    const sessionCookie = (await cookies()).get("__session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    if (!isAdminEmail(decoded.email)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [usersSnapshot, eventsSnapshot, recentEventsSnapshot] = await Promise.all([
      db.collection("users").get(),
      db
        .collection("analyticsEvents")
        .where("occurredAt", ">=", monthAgo)
        .get(),
      db
        .collection("analyticsEvents")
        .orderBy("occurredAt", "desc")
        .limit(20)
        .get(),
    ]);

    const events = eventsSnapshot.docs
      .map((doc: any): AnalyticsEventDoc | null => {
        const data = doc.data();
        const rawName = String(data.name || "");
        if (!TRACKED_EVENTS.includes(rawName as TrackedEventName)) return null;
        return {
          id: doc.id,
          name: rawName as TrackedEventName,
          occurredAt: toDate(data.occurredAt),
          userId: (data.userId as string) || null,
          userEmail: (data.userEmail as string) || null,
          clientId: (data.clientId as string) || null,
          path: (data.path as string) || null,
          params: (data.params as Record<string, unknown>) || {},
        };
      })
      .filter(Boolean) as AnalyticsEventDoc[];

    const eventsLast24h = events.filter((event) => event.occurredAt >= dayAgo);
    const eventsLast7d = events.filter((event) => event.occurredAt >= weekAgo);

    const signupsLast7d = eventsLast7d.filter((event) => event.name === "signup").length;
    const entriesLast24h = eventsLast24h.filter(
      (event) => event.name === "entry_created"
    ).length;
    const aurumMessagesLast24h = eventsLast24h.filter(
      (event) => event.name === "aurum_message_sent"
    ).length;

    const visitorsLast30d = uniqueIdentities(events);
    const dau = uniqueIdentities(eventsLast24h);
    const wau = uniqueIdentities(eventsLast7d);

    const signupsMonthly = events.filter((event) => event.name === "signup").length;
    const quizStartedMonthly = events.filter(
      (event) => event.name === "quiz_started"
    ).length;
    const quizCompletedMonthly = events.filter(
      (event) => event.name === "quiz_complete"
    ).length;
    const quizResultViewedMonthly = events.filter(
      (event) => event.name === "quiz_result_viewed"
    ).length;
    const quizCtaClickedMonthly = events.filter(
      (event) => event.name === "quiz_cta_clicked"
    ).length;
    const signupWithQuizMonthly = events.filter(
      (event) => event.name === "signup_with_quiz"
    ).length;
    const firstEntriesMonthly = events.filter((event) => event.name === "first_entry").length;
    const checkoutStartsMonthly = events.filter(
      (event) => event.name === "checkout_start"
    ).length;
    const purchasesMonthly = events.filter((event) => event.name === "purchase").length;

    const chartSeed = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = toDayKey(date);
      return { date: key, users: 0 };
    });
    const chartByDate = new Map(chartSeed.map((item) => [item.date, item]));
    for (const event of eventsLast7d) {
      if (event.name !== "signup") continue;
      const key = toDayKey(event.occurredAt);
      const row = chartByDate.get(key);
      if (row) row.users += 1;
    }

    const eventCountMap = new Map<string, number>();
    const pathCountMap = new Map<string, number>();
    for (const event of events) {
      eventCountMap.set(event.name, (eventCountMap.get(event.name) || 0) + 1);
      const path = event.path || "(inconnu)";
      pathCountMap.set(path, (pathCountMap.get(path) || 0) + 1);
    }

    const topEvents = Array.from(eventCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));

    const topPaths = Array.from(pathCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([path, count]) => ({ path, count }));

    const leadScores = new Map<
      string,
      {
        leadId: string;
        userEmail: string | null;
        score: number;
        lastActivityAt: Date;
      }
    >();

    for (const event of events) {
      const leadId = event.userId || event.clientId;
      if (!leadId) continue;
      const delta = LEAD_SCORE_WEIGHTS[event.name] ?? 0;
      const current = leadScores.get(leadId);
      if (!current) {
        leadScores.set(leadId, {
          leadId,
          userEmail: event.userEmail,
          score: delta,
          lastActivityAt: event.occurredAt,
        });
      } else {
        current.score += delta;
        if (event.occurredAt > current.lastActivityAt) {
          current.lastActivityAt = event.occurredAt;
        }
        if (!current.userEmail && event.userEmail) {
          current.userEmail = event.userEmail;
        }
      }
    }

    const topLeads = Array.from(leadScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((lead) => ({
        ...lead,
        segment: leadSegment(lead.score),
      }));

    const recentEvents = recentEventsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      const eventName = String(data.name || "unknown");
      return {
        id: doc.id,
        name: eventName,
        user: (data.userEmail as string) || (data.userId as string) || (data.clientId as string) || "anonyme",
        date: toDate(data.occurredAt).toISOString(),
        details: JSON.stringify((data.params as Record<string, unknown>) || {}),
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers: usersSnapshot.size,
        newSignups: signupsLast7d,
        entriesCreated: entriesLast24h,
        dau,
        wau,
        visitorsLast30d,
        aurumMessagesLast24h,
      },
      funnel: {
        visitors: visitorsLast30d,
        signups: signupsMonthly,
        firstEntries: firstEntriesMonthly,
        checkoutStarts: checkoutStartsMonthly,
        purchases: purchasesMonthly,
      },
      quizFunnel: {
        started: quizStartedMonthly,
        completed: quizCompletedMonthly,
        resultViewed: quizResultViewedMonthly,
        ctaClicked: quizCtaClickedMonthly,
        signupWithQuiz: signupWithQuizMonthly,
      },
      chart: Array.from(chartByDate.values()),
      topEvents,
      topPaths,
      recentEvents,
      topLeads,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Failed to load admin analytics", error: message },
      { status: 500 }
    );
  }
}
