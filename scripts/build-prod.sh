#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export PATH="$ROOT/node_modules/.bin:$PATH"

bash scripts/rebuild-sqlite.sh

echo "Running migrations and seed…"
tsx scripts/ensure-data-dir.ts
npx prisma migrate deploy
tsx prisma/seed.ts

echo "Building Next.js production bundle (webpack — fits t3.micro better than Turbopack)…"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=768}"
set +e
next build --webpack
BUILD_EXIT=$?
set -e

CSS_COUNT=$(find "$ROOT/.next/static/css" -name '*.css' 2>/dev/null | wc -l)
if [[ "${CSS_COUNT:-0}" -lt 1 ]]; then
  echo "Build failed: no CSS in .next/static/css (Tailwind did not compile). Check postcss.config.mjs" >&2
  exit 1
fi

if [[ ! -f "$ROOT/.next/BUILD_ID" ]]; then
  echo "Build failed (exit $BUILD_EXIT): .next/BUILD_ID missing" >&2
  if [[ "$BUILD_EXIT" -eq 137 ]] || [[ "$BUILD_EXIT" -eq 143 ]]; then
    echo "Likely out of memory on a micro instance. On the server run once:" >&2
    echo "  sudo bash /opt/monopoly-run/CursorTest/deploy/aws/setup-swap.sh" >&2
    echo "Then retry: npm run build:prod" >&2
  fi
  exit 1
fi
echo "OK — build id: $(cat "$ROOT/.next/BUILD_ID")"
