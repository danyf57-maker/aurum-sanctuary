# Auth API Guardrails

Authentication changes affect trust, redirects, and session continuity.

## Rules

- Preserve the current email verification flow: signup sends verification, auth action validates the code, then login resumes.
- Keep session-cookie behavior aligned with `src/app/api/auth/session/route.ts` and `src/providers/auth-provider.tsx`.
- Do not relax origin checks, cookie flags, or redirect validation to "fix" auth friction.
- Treat `NEXT_PUBLIC_APP_URL` as a deployment input that can be wrong locally; keep safe fallbacks for localhost and preview URLs.
- Never log raw ID tokens, session cookies, password reset codes, or full auth provider payloads.

## Completion Check

- Run `make verify`.
- Smoke the public auth pages with `make smoke`.
- If redirect or cookie logic changes, test `/login`, `/signup`, `/auth/action`, and `/api/auth/session` together.
