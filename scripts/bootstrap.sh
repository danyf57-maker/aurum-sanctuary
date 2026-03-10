#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

required_major=20
node_major="$(node -p "process.versions.node.split('.')[0]")"

if [[ "$node_major" -lt "$required_major" ]]; then
  echo "Node.js $required_major+ is required. Found $(node -v)." >&2
  exit 1
fi

echo "Installing root dependencies..."
npm ci

echo "Installing Cloud Functions dependencies..."
npm --prefix functions ci

if [[ ! -f ".env.local" && -f ".env.example" ]]; then
  cp .env.example .env.local
  echo "Created .env.local from .env.example. Fill in real values before running build/deploy."
fi

if ! command -v firebase >/dev/null 2>&1; then
  echo "Firebase CLI is not installed. Install it with: npm install -g firebase-tools"
else
  echo "Firebase CLI detected: $(firebase --version)"
fi

echo "Bootstrap complete."
echo "Next steps:"
echo "  1. Review .env.local"
echo "  2. Run 'make guard-env'"
echo "  3. Run 'make verify'"
