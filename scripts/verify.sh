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

echo "==> i18n parity"
npm run test:e2e:i18n

echo "==> Next.js build"
npm run build

echo "==> Functions build"
npm run functions:build

echo "Verification complete."
