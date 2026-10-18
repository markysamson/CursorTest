#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="$ROOT/node_modules/.bin:$PATH"

echo "Running migrations and seed…"
tsx scripts/ensure-data-dir.ts
npx prisma migrate deploy
tsx prisma/seed.ts

echo "Building Next.js production bundle…"
next build

if [[ ! -f "$ROOT/.next/BUILD_ID" ]]; then
  echo "Build failed: .next/BUILD_ID missing" >&2
  exit 1
fi
echo "OK — build id: $(cat "$ROOT/.next/BUILD_ID")"
