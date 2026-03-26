import { describe, expect, it } from "vitest";
import { pickNextOnboardingEmail, type OnboardingSignals } from "../decision";
import type { OnboardingState } from "../types";

function buildSignals(overrides: Partial<OnboardingSignals> = {}): OnboardingSignals {
  return {
    createdAt: new Date("2026-03-01T10:00:00.000Z"),
    lastEntryAt: null,
    entryCount: 0,
    subscriptionStatus: "free",
    subscriptionId: null,
    billingPhase: null,
    freeLimitReachedAt: null,
    trialEndsAt: null,
    ...overrides,
  };
}

function buildState(overrides: Partial<OnboardingState> = {}): OnboardingState {
  return {
    sent: {},
    ...overrides,
  };
}

describe("pickNextOnboardingEmail", () => {
  it("sends the first onboarding email to a new free user", () => {
    const now = new Date("2026-03-01T12:00:00.000Z");
    const emailId = pickNextOnboardingEmail(buildState(), buildSignals(), now);
    expect(emailId).toBe("email_1");
  });

  it("enforces a minimum gap between drip emails", () => {
    const now = new Date("2026-03-02T04:00:00.000Z");
    const emailId = pickNextOnboardingEmail(
      buildState({
        sent: {
          email_1: "2026-03-01T10:00:00.000Z",
        },
      }),
      buildSignals(),
      now
    );
    expect(emailId).toBeNull();
  });

  it("enforces a global cooldown between any onboarding emails", () => {
    const now = new Date("2026-03-05T04:00:00.000Z");
    const emailId = pickNextOnboardingEmail(
      buildState({
        lastSentAt: "2026-03-04T12:30:00.000Z",
        sent: {
          trial_started: "2026-03-04T12:30:00.000Z",
        },
      }),
      buildSignals({
        entryCount: 1,
        lastEntryAt: new Date("2026-03-01T10:00:00.000Z"),
      }),
      now
    );
    expect(emailId).toBeNull();
  });

  it("switches to the habit sequence after the first entry", () => {
    const now = new Date("2026-03-04T12:00:00.000Z");
    const emailId = pickNextOnboardingEmail(
      buildState(),
      buildSignals({
        entryCount: 1,
        lastEntryAt: new Date("2026-03-03T10:00:00.000Z"),
      }),
      now
    );
    expect(emailId).toBe("habit_email_1");
  });

  it("sends trial_started only for a Stripe-managed trial", () => {
    const now = new Date("2026-03-03T12:00:00.000Z");
    const emailId = pickNextOnboardingEmail(
      buildState(),
      buildSignals({
        subscriptionStatus: "trialing",
        subscriptionId: "sub_123",
        trialEndsAt: new Date("2026-03-10T12:00:00.000Z"),
      }),
      now
    );
    expect(emailId).toBe("trial_started");
  });

  it("does not confuse the legacy no-card trial with the Stripe trial", () => {
    const now = new Date("2026-03-01T12:00:00.000Z");
    const emailId = pickNextOnboardingEmail(
      buildState(),
      buildSignals({
        subscriptionStatus: "trialing",
        subscriptionId: null,
      }),
      now
    );
    expect(emailId).toBe("email_1");
  });

  it("sends the trial expired follow-up after reconciliation", () => {
    const now = new Date("2026-03-11T12:00:00.000Z");
    const emailId = pickNextOnboardingEmail(
      buildState(),
      buildSignals({
        subscriptionStatus: "free",
        billingPhase: "trial_expired",
      }),
      now
    );
    expect(emailId).toBe("trial_expired_no_conversion");
  });

  it("sends the free limit follow-up after the cooldown", () => {
    const now = new Date("2026-03-11T12:00:00.000Z");
    const emailId = pickNextOnboardingEmail(
      buildState(),
      buildSignals({
        entryCount: 5,
        freeLimitReachedAt: new Date("2026-03-10T23:00:00.000Z"),
      }),
      now
    );
    expect(emailId).toBe("free_limit_followup");
  });
});
