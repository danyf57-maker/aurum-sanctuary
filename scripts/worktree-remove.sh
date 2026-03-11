#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKTREE_HOME="${AURUM_WORKTREE_HOME:-$(cd "$ROOT_DIR/.." && pwd)/aurum-sanctuary-worktrees}"
TARGET=""
DELETE_BRANCH=0

usage() {
  echo "Usage: $0 [--delete-branch] <branch-or-path>"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --delete-branch)
      DELETE_BRANCH=1
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      [[ -z "${TARGET:-}" ]] || usage
      TARGET="$1"
      shift
      ;;
  esac
done

[[ -n "$TARGET" ]] || usage

if [[ -d "$TARGET" ]]; then
  TARGET_PATH="$TARGET"
else
  TARGET_PATH="$WORKTREE_HOME/$TARGET"
fi

if [[ ! -d "$TARGET_PATH" ]]; then
  echo "Worktree not found: $TARGET_PATH"
  exit 1
fi

git -C "$ROOT_DIR" worktree remove "$TARGET_PATH"
git -C "$ROOT_DIR" worktree prune

if [[ "$DELETE_BRANCH" -eq 1 && ! -d "$TARGET" ]]; then
  if git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/$TARGET"; then
    git -C "$ROOT_DIR" branch -D "$TARGET"
  fi
fi

echo "Removed worktree: $TARGET_PATH"
