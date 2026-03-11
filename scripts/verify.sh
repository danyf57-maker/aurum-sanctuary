#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Environment guard"
npm run guard:env

echo "==> Client/server boundary guard"
npm run guard:client-boundaries

echo "==> ESLint"
npm run lint

echo "==> TypeScript"
npm run typecheck

echo "==> Tests"
npm run test

echo "==> Next.js build"
npm run build

echo "==> Functions build"
npm run functions:build

echo "==> Smoke"
npm run smoke

echo "Verification complete."
