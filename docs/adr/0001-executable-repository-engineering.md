# ADR 0001: Executable Repository Engineering

## Status

Accepted - 2026-03-11

## Context

Aurum had strong product work but weak execution contracts:

- linting existed but was not runnable reliably
- one test entrypoint pointed to a missing file
- CI and local verification were not using the same command
- sensitive domains had little local guidance for future agents or developers

That made the repo harder to operate safely and easier to regress.

## Decision

Standardize the repo around executable contracts instead of informal expectations:

- `make lint`
- `make typecheck`
- `make test`
- `make smoke`
- `make verify`

Back those contracts with runnable scripts and checks:

- environment guard
- client/server boundary guard
- EN/FR i18n parity
- unit tests
- local smoke validation against a built app

Keep sensitive context close to the code through local `AGENTS.md` files in billing, i18n, auth, functions, and CI/deploy areas.

## Consequences

Positive:

- local and CI validation now share the same entrypoint
- client/server secret leaks are easier to catch before review
- translation drift is checked automatically
- future agents can operate with less hidden context

Tradeoffs:

- `make verify` is longer because it now includes runtime smoke checks
- the repo intentionally codifies a few project-specific rules, which must be kept current

## Follow-up

- add broader unit coverage beyond Redis
- expand smoke coverage to one authenticated path once a safe fixture strategy is in place
- add orchestration only after the repo contracts stay stable
