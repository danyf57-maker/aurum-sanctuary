# Environment Secrets Checklist

This checklist prevents cross-environment leakage between `dev`, `staging`, and `prod`.

## Required in `aurum-dev-a4c84`

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `STRIPE_SECRET_KEY` (must be `sk_test_...`)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` (test price)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` (test price)
- `DEEPSEEK_API_KEY`
- `RESEND_API_KEY`
- `ONBOARDING_EMAILS_ENABLED`
- `ONBOARDING_FROM_EMAIL`
- `ONBOARDING_REPLY_TO`
- `ONBOARDING_EMAIL_SECRET`
- `ONBOARDING_RUN_SECRET`
- `ONBOARDING_BOUNCE_SECRET`

## Required in `aurum-staging-ae856`

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `STRIPE_SECRET_KEY` (must be `sk_test_...`)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` (test price)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` (test price)
- `DEEPSEEK_API_KEY`
- `RESEND_API_KEY`
- `ONBOARDING_EMAILS_ENABLED`
- `ONBOARDING_FROM_EMAIL`
- `ONBOARDING_REPLY_TO`
- `ONBOARDING_EMAIL_SECRET`
- `ONBOARDING_RUN_SECRET`
- `ONBOARDING_BOUNCE_SECRET`

## Required in `aurum-diary-prod`

- `STRIPE_SECRET_KEY` (must be `sk_live_...`)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` (live price)
- `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` (live price)
- other production secrets already used by App Hosting

## Guardrails

- Never reuse `sk_live_...` outside prod.
- Never point `NEXT_PUBLIC_FIREBASE_PROJECT_ID` from `develop`/`staging` to prod.
- Keep OAuth client IDs domain-scoped per environment.
