#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_REF="main"

usage() {
  echo "Usage: $0 [--base <ref>]"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      [[ $# -ge 2 ]] || usage
      BASE_REF="$2"
      shift 2
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
BRANCH_SAFE="${BRANCH//\//-}"
OUT_DIR="$(git rev-parse --git-path codex/preflight)"
OUT_FILE="$OUT_DIR/${BRANCH_SAFE}.md"
mkdir -p "$OUT_DIR"

if [[ -n "$(git status --short)" ]]; then
  echo "Warning: working tree is dirty. Preflight report will only summarize committed diff vs $BASE_REF."
fi

make verify
git diff --check

{
  echo "# Preflight Report"
  echo
  echo "- Branch: \`$BRANCH\`"
  echo "- Base ref: \`$BASE_REF\`"
  echo "- Generated: $(date -u +"%Y-%m-%d %H:%M:%SZ")"
  echo
  echo "## Validation"
  echo
  echo "- [x] \`make verify\`"
  echo "- [x] \`git diff --check\`"
  echo
  echo "## Changed Files"
  echo
  git diff --name-only "$BASE_REF"...HEAD | sed 's/^/- `/; s/$/`/'
  echo
  echo "## Diff Stat"
  echo
  echo '```'
  git diff --stat "$BASE_REF"...HEAD
  echo '```'
} > "$OUT_FILE"

echo "Preflight report written to $OUT_FILE"
