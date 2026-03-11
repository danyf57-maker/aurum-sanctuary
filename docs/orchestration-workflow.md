# Lightweight Orchestration Workflow

This repo now supports a small orchestration layer on top of the executable harness.

The goal is simple:

- isolate tasks in their own worktrees
- run the same local preflight before every PR
- generate a consistent PR draft instead of improvising review context

It is intentionally local-first. Nothing pushes, opens, or deploys unless you ask it to.

## 1. Create a Task Worktree

```bash
make worktree branch=chore/example-task
```

Optional bootstrap:

```bash
make worktree branch=chore/example-task bootstrap=1
```

By default worktrees are created in a sibling directory:

```text
../aurum-sanctuary-worktrees/<branch>
```

Override the location with `AURUM_WORKTREE_HOME` if needed.

## 2. Work Inside the Task Worktree

```bash
cd ../aurum-sanctuary-worktrees/chore/example-task
make test
make smoke
```

Use the narrowest checks that match the change while iterating. Before review, always run the full preflight.

## 3. Run Preflight

```bash
make preflight
```

This runs:

- `make verify`
- `git diff --check`

It also writes a local report under:

```text
.git/codex/preflight/<branch>.md
```

## 4. Generate a PR Draft

```bash
make pr-draft
```

This writes a draft body under:

```text
.git/codex/pr-drafts/<branch>.md
```

If you explicitly want to publish through GitHub CLI:

```bash
./scripts/pr-draft.sh --publish
```

Do not use `--publish` by default in automation. Keep external actions explicit.

## 5. Clean Up

```bash
make worktree-remove branch=chore/example-task

# Remove the local branch too
make worktree-remove branch=chore/example-task delete_branch=1
```

## What This Does Not Do

- no automatic push
- no automatic deploy
- no hidden branch mutation
- no CI-only validation path

That is deliberate. The repo should stay predictable before it becomes more autonomous.
