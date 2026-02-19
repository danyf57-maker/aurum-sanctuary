export const TRACKED_EVENTS = [
  "cta_click",
  "quiz_complete",
  "signup",
  "login",
  "entry_created",
  "first_entry",
  "checkout_start",
  "purchase",
  "aurum_message_sent",
] as const;

export type TrackedEventName = (typeof TRACKED_EVENTS)[number];

export type TrackEventPayload = {
  name: TrackedEventName;
  params?: Record<string, string | number | boolean | null | undefined>;
  path?: string;
};

export const LEAD_SCORE_WEIGHTS: Record<TrackedEventName, number> = {
  cta_click: 5,
  quiz_complete: 20,
  signup: 15,
  login: 5,
  entry_created: 10,
  first_entry: 20,
  checkout_start: 25,
  purchase: 30,
  aurum_message_sent: 3,
};
