# Studies Knowledge Base

This folder is the intake and normalization layer for scientific material that
will constrain Aurum's reflection engine.

## Goal

The objective is not to dump PDFs into a model prompt. The objective is to:

- keep source provenance,
- extract usable evidence,
- separate real evidence from editorial noise,
- convert studies into structured cards,
- feed only normalized, bounded guidance into runtime prompts.

## Folder Layout

- `inbox/`
  Raw files dropped by hand: PDFs, notes, screenshots, exported links.
- `intake/`
  Human-reviewed intake notes for each dropped file.
- `cards/`
  Structured evidence cards that Aurum can reliably use.
- `runtime/`
  Compact runtime artifacts built from validated cards only.

## Rules

- Do not feed raw PDFs directly to DeepSeek.
- Do not treat quotes, blog posts, Goodreads pages, or inspiration pages as
  scientific evidence.
- Prefer primary papers, systematic reviews, meta-analyses, and reputable
  clinical reviews.
- Secondary pages may help editorial understanding, but they should not become
  runtime evidence without a stronger primary source behind them.
- Every runtime claim should be traceable back to a reviewed evidence card.

## Workflow

1. Drop raw material into `inbox/`.
2. Extract links and create an intake note in `intake/`.
3. Triage each source:
   - `runtime_candidate`
   - `context_only`
   - `exclude`
4. Create structured cards in `cards/` for the runtime candidates.
5. Build compact runtime artifacts from the approved cards only.
