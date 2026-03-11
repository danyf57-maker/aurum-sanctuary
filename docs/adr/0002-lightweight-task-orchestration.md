# ADR 0002: Lightweight Task Orchestration

## Status

Accepted - 2026-03-11

## Context

The repository now has executable validation contracts, but multi-task work still depended on ad hoc branch handling and improvised PR context.

That creates avoidable problems:

- context bleed between tasks
- inconsistent review quality
- extra friction before opening a PR

## Decision

Add a lightweight local orchestration layer:

- `make worktree` to isolate task branches
- `make preflight` to run the same local release gate before review
- `make pr-draft` to generate a repeatable PR body

Keep orchestration local-first and explicit:

- no automatic push
- no automatic deploy
- optional PR publishing only when explicitly requested

## Consequences

Positive:

- tasks are easier to isolate and review
- local and CI expectations stay aligned
- future automation can build on stable scripts instead of hidden manual steps

Tradeoffs:

- there are more repo scripts to maintain
- worktree-based flows require a little Git familiarity

## Follow-up

- add authenticated smoke coverage once safe fixtures exist
- add optional review-lens helpers for billing, auth, copy, and infra changes
- only consider deeper orchestration after this local workflow proves stable
