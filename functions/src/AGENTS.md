# Functions Guardrails

This directory contains production-side effects. Favor safety over cleverness.

## Rules

- Never log raw journal content, tokens, secrets, or full third-party payloads.
- Background triggers must be idempotent. Retries happen.
- Validate external inputs before writing to Firestore or calling Stripe/Resend/LLM providers.
- Keep `functions/src` buildable with `npm --prefix functions run build` before considering work complete.
- When changing onboarding, billing, or reminder flows, verify the matching runtime env vars in `docs/environment-secrets-checklist.md`.

## Change Discipline

- Prefer small, explicit helpers over implicit shared state.
- If a function writes user-facing copy, keep EN/FR parity in the app messages or dedicated templates.
- If you add a new secret or runtime dependency, update `apphosting.yaml` or deployment docs in the same change.
