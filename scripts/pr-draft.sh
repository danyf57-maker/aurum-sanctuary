#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_REF="main"
PUBLISH=0

usage() {
  echo "Usage: $0 [--base <ref>] [--publish]"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      [[ $# -ge 2 ]] || usage
      BASE_REF="$2"
      shift 2
      ;;
    --publish)
      PUBLISH=1
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      usage
      ;;
  esac
done

cd "$ROOT_DIR"

BRANCH="$(git branch --show-current)"
if [[ -z "$BRANCH" ]]; then
  echo "Detached HEAD is not supported for PR draft generation."
  exit 1
fi

if [[ "$BRANCH" == "$BASE_REF" ]]; then
  echo "Current branch matches the base ref '$BASE_REF'. Switch to a task branch before generating a PR draft."
  exit 1
fi

if [[ -n "$(git status --short)" ]]; then
  echo "Warning: working tree is dirty. The PR draft uses committed diff vs $BASE_REF."
fi

BRANCH_SAFE="${BRANCH//\//-}"
OUT_DIR="$(git rev-parse --git-path codex/pr-drafts)"
OUT_FILE="$OUT_DIR/${BRANCH_SAFE}.md"
TITLE="$(git log -1 --pretty=%s)"
mkdir -p "$OUT_DIR"

{
  echo "## Summary"
  echo
  echo "- "
  echo "- "
  echo
  echo "## Validation"
  echo
  echo "- [ ] make verify"
  echo "- [ ] smoke critical flows if behavior changed"
  echo
  echo "## Risks"
  echo
  echo "- "
  echo
  echo "## Changed Files"
  echo
  git diff --name-only "$BASE_REF"...HEAD | sed 's/^/- `/; s/$/`/'
  echo
  echo "## Commit Range"
  echo
  echo '```'
  git log --oneline "$BASE_REF"..HEAD
  echo '```'
  echo
  echo "## Diff Stat"
  echo
  echo '```'
  git diff --stat "$BASE_REF"...HEAD
  echo '```'
} > "$OUT_FILE"

echo "PR draft written to $OUT_FILE"

if [[ "$PUBLISH" -eq 1 ]]; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "gh is required for --publish"
    exit 1
  fi
  gh pr create --base "$BASE_REF" --head "$BRANCH" --title "$TITLE" --body-file "$OUT_FILE"
fi
