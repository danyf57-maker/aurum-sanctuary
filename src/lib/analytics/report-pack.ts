import "server-only";

import type { Firestore } from "firebase-admin/firestore";
import { toCsv } from "@/lib/analytics/export-csv";
import { TRACKED_EVENTS, type TrackedEventName } from "@/lib/analytics/types";

export const ANALYTICS_REPORT_WINDOW_DAYS = 15;

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

type CsvAttachment = {
  filename: string;
  content: string;
  rowCount: number;
};

type ReportSummary = {
  periodStart: string;
  periodEnd: string;
  totalUsersSnapshot: number;
  activePaidSnapshot: number;
  activeTrialingSnapshot: number;
  activeDevicesSnapshot: number;
  uniqueIdentities: number;
  signups: number;
  logins: number;
  entriesCreated: number;
  firstEntries: number;
  aurumMessagesSent: number;
  freeLimitReached: number;
  checkoutStarts: number;
  trialsStarted: number;
  subscriptionsStarted: number;
  purchases: number;
  revenueAmount: number;
  revenueCurrencies: string;
};

type ReportPack = {
  summary: ReportSummary;
  attachments: CsvAttachment[];
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

function uniqueCount(values: Array<string | null | undefined>) {
  return new Set(values.filter(Boolean)).size;
}

function amountToMajor(value: unknown) {
  return typeof value === "number" ? value / 100 : 0;
}

function ensureRow<T>(map: Map<string, T>, key: string, create: () => T) {
  if (!map.has(key)) {
    map.set(key, create());
  }
  return map.get(key)!;
}

function formatCurrencyMap(currencyTotals: Map<string, number>) {
  if (currencyTotals.size === 0) return "";
  return Array.from(currencyTotals.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([currency, amount]) => `${currency}:${amount.toFixed(2)}`)
    .join(" | ");
}

function toAnalyticsEvent(doc: FirebaseFirestore.QueryDocumentSnapshot): AnalyticsEventDoc | null {
  const data = doc.data();
  const rawName = String(data.name || "");
  if (!TRACKED_EVENTS.includes(rawName as TrackedEventName)) {
    return null;
  }

  return {
    id: doc.id,
    name: rawName as TrackedEventName,
    occurredAt: toDate(data.occurredAt),
    userId: typeof data.userId === "string" ? data.userId : null,
    userEmail: typeof data.userEmail === "string" ? data.userEmail : null,
    clientId: typeof data.clientId === "string" ? data.clientId : null,
    path: typeof data.path === "string" ? data.path : null,
    params: (data.params as Record<string, unknown>) || {},
  };
}

export async function buildAnalyticsReportPack(
  db: Firestore,
  options: { days?: number } = {}
): Promise<ReportPack> {
  const days = options.days ?? ANALYTICS_REPORT_WINDOW_DAYS;
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000);

  const [eventsSnapshot, usersSnapshot, devicesSnapshot] = await Promise.all([
    db.collection("analyticsEvents").where("occurredAt", ">=", periodStart).get(),
    db.collection("users").get(),
    db.collectionGroup("devices").where("pushEnabled", "==", true).get(),
  ]);

  const events = eventsSnapshot.docs
    .map(toAnalyticsEvent)
    .filter(Boolean) as AnalyticsEventDoc[];

  const users = usersSnapshot.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      userId: doc.id,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      subscriptionStatus: String(data.subscriptionStatus || "free"),
      billingPhase: String(data.billingPhase || ""),
      subscriptionPriceId: String(data.subscriptionPriceId || ""),
      entryCount: Number(data.entryCount || 0),
    };
  });

  const uniqueIdentities = uniqueCount(
    events.map((event) => event.userId || event.clientId)
  );
  const uniqueKnownUsers = uniqueCount(events.map((event) => event.userId));

  const countEvent = (name: TrackedEventName) =>
    events.filter((event) => event.name === name).length;

  const currencyTotals = new Map<string, number>();
  for (const event of events) {
    if (event.name !== "purchase") continue;
    const currency = String(event.params.currency || "unknown").toUpperCase();
    currencyTotals.set(
      currency,
      (currencyTotals.get(currency) || 0) + amountToMajor(event.params.amount)
    );
  }

  const overviewRows = [
    {
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      total_users_snapshot: users.length,
      active_paid_snapshot: users.filter((user) => user.subscriptionStatus === "active").length,
      active_trialing_snapshot: users.filter((user) => user.subscriptionStatus === "trialing").length,
      active_devices_snapshot: devicesSnapshot.size,
      unique_identities_window: uniqueIdentities,
      unique_known_users_window: uniqueKnownUsers,
      signups: countEvent("signup"),
      logins: countEvent("login"),
      entries_created: countEvent("entry_created"),
      first_entries: countEvent("first_entry"),
      aurum_messages_sent: countEvent("aurum_message_sent"),
      free_limit_reached: countEvent("free_limit_reached"),
      checkout_starts: countEvent("checkout_start"),
      trials_started: countEvent("trial_activated"),
      subscriptions_started: countEvent("subscription_started"),
      purchases: countEvent("purchase"),
      revenue_total_major: Number(
        Array.from(currencyTotals.values())
          .reduce((sum, amount) => sum + amount, 0)
          .toFixed(2)
      ),
      revenue_currencies: formatCurrencyMap(currencyTotals),
    },
  ];

  const dailyRows = new Map<
    string,
    {
      date: string;
      unique_identities: Set<string>;
      page_view: number;
      signup: number;
      login: number;
      entry_created: number;
      first_entry: number;
      aurum_message_sent: number;
      free_limit_reached: number;
      checkout_start: number;
      trial_activated: number;
      subscription_started: number;
      purchase: number;
    }
  >();

  for (const event of events) {
    const date = toDayKey(event.occurredAt);
    const row = ensureRow(dailyRows, date, () => ({
      date,
      unique_identities: new Set<string>(),
      page_view: 0,
      signup: 0,
      login: 0,
      entry_created: 0,
      first_entry: 0,
      aurum_message_sent: 0,
      free_limit_reached: 0,
      checkout_start: 0,
      trial_activated: 0,
      subscription_started: 0,
      purchase: 0,
    }));

    const identity = event.userId || event.clientId;
    if (identity) row.unique_identities.add(identity);

    if (event.name in row && typeof row[event.name as keyof typeof row] === "number") {
      const key = event.name as Exclude<TrackedEventName, "ui_click" | "cta_click" | "quiz_started" | "quiz_step_completed" | "quiz_complete" | "quiz_result_viewed" | "quiz_cta_clicked" | "signup_with_quiz" | "trial_reminder_sent" | "trial_expired_no_conversion" | "onboarding_email_sent" | "onboarding_email_opened" | "onboarding_email_link_clicked" | "email_returned_to_aurum" | "onboarding_email_unsubscribed" | "writing_reminder_sent" | "writing_reminder_test_sent" | "writing_reminder_device_registered" | "writing_reminder_device_unregistered">;
      row[key] += 1;
    }
  }

  const eventsByDayRows = Array.from(dailyRows.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      date: row.date,
      unique_identities: row.unique_identities.size,
      page_view: row.page_view,
      signup: row.signup,
      login: row.login,
      entry_created: row.entry_created,
      first_entry: row.first_entry,
      aurum_message_sent: row.aurum_message_sent,
      free_limit_reached: row.free_limit_reached,
      checkout_start: row.checkout_start,
      trial_activated: row.trial_activated,
      subscription_started: row.subscription_started,
      purchase: row.purchase,
    }));

  const emailFunnelRows = new Map<
    string,
    {
      email_id: string;
      sent: number;
      opened: number;
      clicked: number;
      returned: number;
      wrote: number;
      trial_started: number;
      subscribed: number;
      purchases: number;
    }
  >();

  for (const event of events) {
    const emailId =
      typeof event.params.email_id === "string"
        ? event.params.email_id
        : typeof event.params.attributed_email_id === "string"
          ? event.params.attributed_email_id
          : null;
    if (!emailId) continue;

    const row = ensureRow(emailFunnelRows, emailId, () => ({
      email_id: emailId,
      sent: 0,
      opened: 0,
      clicked: 0,
      returned: 0,
      wrote: 0,
      trial_started: 0,
      subscribed: 0,
      purchases: 0,
    }));

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

  const emailFunnelCsvRows = Array.from(emailFunnelRows.values())
    .sort((a, b) => a.email_id.localeCompare(b.email_id))
    .map((row) => ({
      ...row,
      open_rate: row.sent ? Number((row.opened / row.sent).toFixed(4)) : 0,
      click_rate: row.sent ? Number((row.clicked / row.sent).toFixed(4)) : 0,
      return_rate: row.clicked ? Number((row.returned / row.clicked).toFixed(4)) : 0,
      write_rate: row.clicked ? Number((row.wrote / row.clicked).toFixed(4)) : 0,
      trial_rate: row.clicked ? Number((row.trial_started / row.clicked).toFixed(4)) : 0,
      subscribe_rate: row.clicked ? Number((row.subscribed / row.clicked).toFixed(4)) : 0,
      subscribe_after_write_rate: row.wrote
        ? Number((row.subscribed / row.wrote).toFixed(4))
        : 0,
    }));

  const reminderRows = new Map<
    string,
    {
      date: string;
      notifications_sent: number;
      test_notifications_sent: number;
      device_registrations: number;
      device_unregistrations: number;
      gentle_sent: number;
      clarity_sent: number;
      pressure_release_sent: number;
      routine_sent: number;
    }
  >();

  for (const event of events) {
    const date = toDayKey(event.occurredAt);
    const row = ensureRow(reminderRows, date, () => ({
      date,
      notifications_sent: 0,
      test_notifications_sent: 0,
      device_registrations: 0,
      device_unregistrations: 0,
      gentle_sent: 0,
      clarity_sent: 0,
      pressure_release_sent: 0,
      routine_sent: 0,
    }));

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

  const reminderCsvRows = Array.from(reminderRows.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((row) => ({
      ...row,
      active_devices_snapshot: devicesSnapshot.size,
    }));

  const revenueRows = new Map<
    string,
    {
      date: string;
      currency: string;
      checkout_starts: number;
      trials_started: number;
      subscriptions_started: number;
      purchases: number;
      revenue_amount: number;
    }
  >();

  const activePaidSnapshot = users.filter((user) => user.subscriptionStatus === "active").length;
  const activeTrialingSnapshot = users.filter((user) => user.subscriptionStatus === "trialing").length;

  const ensureRevenueRow = (date: string, currency: string) =>
    ensureRow(revenueRows, `${date}:${currency}`, () => ({
      date,
      currency,
      checkout_starts: 0,
      trials_started: 0,
      subscriptions_started: 0,
      purchases: 0,
      revenue_amount: 0,
    }));

  for (const event of events) {
    const date = toDayKey(event.occurredAt);
    const currency = String(event.params.currency || "USD").toUpperCase();
    const row = ensureRevenueRow(date, currency);

    switch (event.name) {
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
        row.revenue_amount += amountToMajor(event.params.amount);
        break;
    }
  }

  const revenueCsvRows = Array.from(revenueRows.values())
    .sort((a, b) => (a.date === b.date ? a.currency.localeCompare(b.currency) : a.date.localeCompare(b.date)))
    .map((row) => ({
      ...row,
      revenue_amount: Number(row.revenue_amount.toFixed(2)),
      trial_to_paid_rate: row.trials_started
        ? Number((row.subscriptions_started / row.trials_started).toFixed(4))
        : 0,
      checkout_to_paid_rate: row.checkout_starts
        ? Number((row.subscriptions_started / row.checkout_starts).toFixed(4))
        : 0,
      active_paid_snapshot: activePaidSnapshot,
      active_trialing_snapshot: activeTrialingSnapshot,
    }));

  const lastEventByUser = new Map<string, Date>();
  for (const event of events) {
    if (!event.userId) continue;
    const current = lastEventByUser.get(event.userId);
    if (!current || event.occurredAt > current) {
      lastEventByUser.set(event.userId, event.occurredAt);
    }
  }

  const usersSnapshotRows = users
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((user) => ({
      user_id: user.userId,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.getTime() ? user.updatedAt.toISOString() : "",
      subscription_status: user.subscriptionStatus,
      billing_phase: user.billingPhase,
      subscription_price_id: user.subscriptionPriceId,
      entry_count: user.entryCount,
      last_event_at: lastEventByUser.get(user.userId)?.toISOString() || "",
    }));

  const periodLabel = `${toDayKey(periodStart)}_to_${toDayKey(periodEnd)}`;
  const attachments: CsvAttachment[] = [
    {
      filename: `analytics-overview-${periodLabel}.csv`,
      content: toCsv(overviewRows),
      rowCount: overviewRows.length,
    },
    {
      filename: `analytics-events-by-day-${periodLabel}.csv`,
      content: toCsv(eventsByDayRows),
      rowCount: eventsByDayRows.length,
    },
    {
      filename: `analytics-email-funnel-${periodLabel}.csv`,
      content: toCsv(emailFunnelCsvRows),
      rowCount: emailFunnelCsvRows.length,
    },
    {
      filename: `analytics-reminder-funnel-${periodLabel}.csv`,
      content: toCsv(reminderCsvRows),
      rowCount: reminderCsvRows.length,
    },
    {
      filename: `analytics-revenue-summary-${periodLabel}.csv`,
      content: toCsv(revenueCsvRows),
      rowCount: revenueCsvRows.length,
    },
    {
      filename: `analytics-users-snapshot-${toDayKey(periodEnd)}.csv`,
      content: toCsv(usersSnapshotRows),
      rowCount: usersSnapshotRows.length,
    },
  ];

  return {
    summary: {
      periodStart: overviewRows[0].period_start,
      periodEnd: overviewRows[0].period_end,
      totalUsersSnapshot: overviewRows[0].total_users_snapshot,
      activePaidSnapshot: overviewRows[0].active_paid_snapshot,
      activeTrialingSnapshot: overviewRows[0].active_trialing_snapshot,
      activeDevicesSnapshot: overviewRows[0].active_devices_snapshot,
      uniqueIdentities: overviewRows[0].unique_identities_window,
      signups: overviewRows[0].signups,
      logins: overviewRows[0].logins,
      entriesCreated: overviewRows[0].entries_created,
      firstEntries: overviewRows[0].first_entries,
      aurumMessagesSent: overviewRows[0].aurum_messages_sent,
      freeLimitReached: overviewRows[0].free_limit_reached,
      checkoutStarts: overviewRows[0].checkout_starts,
      trialsStarted: overviewRows[0].trials_started,
      subscriptionsStarted: overviewRows[0].subscriptions_started,
      purchases: overviewRows[0].purchases,
      revenueAmount: overviewRows[0].revenue_total_major,
      revenueCurrencies: overviewRows[0].revenue_currencies,
    },
    attachments,
  };
}
