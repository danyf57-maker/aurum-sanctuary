#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREE_HOME="${AURUM_WORKTREE_HOME:-$(cd "$ROOT_DIR/.." && pwd)/aurum-sanctuary-worktrees}"
BASE_REF="main"
BOOTSTRAP=0
BRANCH=""

usage() {
  echo "Usage: $0 [--base <ref>] [--bootstrap] <branch>"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      [[ $# -ge 2 ]] || usage
      BASE_REF="$2"
      shift 2
      ;;
    --bootstrap)
      BOOTSTRAP=1
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      [[ -z "$BRANCH" ]] || usage
      BRANCH="$1"
      shift
      ;;
  esac
done

[[ -n "$BRANCH" ]] || usage

if ! git -C "$ROOT_DIR" rev-parse --verify "${BASE_REF}^{commit}" >/dev/null 2>&1; then
  echo "Base ref '$BASE_REF' does not exist locally."
  echo "Fetch it first or pass another local ref."
  exit 1
fi

TARGET_PATH="$WORKTREE_HOME/$BRANCH"
mkdir -p "$(dirname "$TARGET_PATH")"

if [[ -e "$TARGET_PATH" ]]; then
  echo "Target path already exists: $TARGET_PATH"
  exit 1
fi

if git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git -C "$ROOT_DIR" worktree add "$TARGET_PATH" "$BRANCH"
else
  git -C "$ROOT_DIR" worktree add -b "$BRANCH" "$TARGET_PATH" "$BASE_REF"
fi

if [[ "$BOOTSTRAP" -eq 1 ]]; then
  make -C "$TARGET_PATH" bootstrap
fi

echo "Created worktree:"
echo "  Branch: $BRANCH"
echo "  Path:   $TARGET_PATH"
