# Stripe API Guardrails

Billing logic is a trust boundary. Treat it that way.

## Rules

- Never trust client-provided price IDs, trial flags, or subscription state.
- Derive checkout behavior server-side from the authenticated user and server env vars.
- Reject unauthenticated requests early and avoid leaking billing internals in error messages.
- Never log bearer tokens, Stripe customer payloads, or checkout session URLs with user identifiers.
- Preserve trial continuity and existing server-side free-entry enforcement when changing checkout flows.

## Completion Check

- Run `npm run build`.
- Run `npm run functions:build` if the change touches matching webhook or functions code.
- Re-check `docs/environment-secrets-checklist.md` if new env vars or plan IDs are introduced.
