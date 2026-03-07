import type { DocumentReference, Timestamp } from "firebase-admin/firestore";

export type OnboardingEmailId =
  | "email_1"
  | "email_2"
  | "email_3"
  | "email_4"
  | "habit_email_1"
  | "habit_email_2";

export type OnboardingUser = {
  id: string;
  email: string;
  firstName: string;
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
