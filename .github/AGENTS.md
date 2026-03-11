# Infra Guardrails

This directory controls CI, preview deploys, and production-adjacent automation.

## Rules

- Prefer the same commands locally and in CI. If CI adds a new check, expose it through `make` or `npm run` first.
- Preview and deploy workflows must use non-production placeholders for validation jobs and real secrets only for deploy jobs.
- Do not add workflow-only logic that bypasses local verification; that creates drift and weakens the harness.
- Keep Firebase preview, App Hosting, Firestore, and Functions workflows explicit and small. Hidden indirection makes failures harder to debug.
- When a workflow consumes secrets, update the corresponding docs in `docs/ci-cd-setup.md` or `docs/environment-secrets-checklist.md` in the same change.

## Completion Check

- `make verify` passes locally.
- Relevant workflow YAML passes `git diff --check`.
- If preview or deploy logic changed, inspect the next GitHub Actions run before considering the task done.
