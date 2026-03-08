import type { DocumentReference, Timestamp } from "firebase-admin/firestore";
import type { Locale } from "@/lib/locale";

export type OnboardingEmailId =
  | "email_1"
  | "email_2"
  | "email_3"
  | "email_4"
  | "habit_email_1"
  | "habit_email_2"
  | "free_limit_followup"
  | "trial_started"
  | "trial_ending_soon"
  | "subscription_active"
  | "trial_expired_no_conversion";

export type OnboardingUser = {
  id: string;
  email: string;
  firstName: string;
  locale: Locale;
  createdAt: Date | null;
  entryCount: number;
  subscriptionStatus: string;
  preferencesRef: DocumentReference;
  stateRef: DocumentReference;
  marketingUnsubscribedAt: Timestamp | null;
  invalidEmailAt: Timestamp | null;
};

export type OnboardingState = {
  sent?: Partial<Record<OnboardingEmailId, string>>;
  stoppedAt?: string | null;
  stoppedReason?: string | null;
  unsubscribedAt?: string | null;
  invalidEmailAt?: string | null;
  updatedAt?: string | null;
};

export type EmailTemplateResult = {
  subject: string;
  html: string;
  text: string;
};
