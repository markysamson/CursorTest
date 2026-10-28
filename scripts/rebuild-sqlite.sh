#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "Rebuilding better-sqlite3 (root + nested copies)…"
npm rebuild better-sqlite3

NESTED="${ROOT}/node_modules/@prisma/adapter-better-sqlite3/node_modules/better-sqlite3"
if [[ -d "$NESTED" ]]; then
  echo "Rebuilding nested better-sqlite3 under @prisma/adapter-better-sqlite3…"
  npm rebuild better-sqlite3 --prefix "$(dirname "$NESTED")" 2>/dev/null || (
    cd "$NESTED" && npm run build-release
  )
fi

node -e "require('better-sqlite3'); console.log('better-sqlite3: OK')"
