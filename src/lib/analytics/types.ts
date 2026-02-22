export const TRACKED_EVENTS = [
  "page_view",
  "ui_click",
  "cta_click",
  "quiz_started",
  "quiz_step_completed",
  "quiz_complete",
  "quiz_result_viewed",
  "quiz_cta_clicked",
  "signup_with_quiz",
  "signup",
  "login",
  "entry_created",
  "first_entry",
  "checkout_start",
  "purchase",
  "aurum_message_sent",
  "onboarding_email_sent",
  "onboarding_email_opened",
  "onboarding_email_link_clicked",
  "onboarding_email_unsubscribed",
] as const;

export type TrackedEventName = (typeof TRACKED_EVENTS)[number];

export type TrackEventPayload = {
  name: TrackedEventName;
  params?: Record<string, string | number | boolean | null | undefined>;
  path?: string;
};

export const LEAD_SCORE_WEIGHTS: Record<TrackedEventName, number> = {
  page_view: 1,
  ui_click: 1,
  cta_click: 5,
  quiz_started: 5,
  quiz_step_completed: 3,
  quiz_complete: 20,
  quiz_result_viewed: 8,
  quiz_cta_clicked: 12,
  signup_with_quiz: 20,
  signup: 15,
  login: 5,
  entry_created: 10,
  first_entry: 20,
  checkout_start: 25,
  purchase: 30,
  aurum_message_sent: 3,
  onboarding_email_sent: 0,
  onboarding_email_opened: 0,
  onboarding_email_link_clicked: 1,
  onboarding_email_unsubscribed: -5,
};
