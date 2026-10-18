#!/usr/bin/env bash
# Production start (systemd). Do not use HOSTNAME — Linux sets it to the machine name.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d "$ROOT/.next" ]]; then
  echo "Missing .next build. Run as monopoly: cd /opt/monopoly-run/CursorTest && npm run build" >&2
  exit 1
fi

export PATH="$ROOT/node_modules/.bin:$PATH"

tsx scripts/ensure-data-dir.ts

BIND="${MONOPOLY_BIND_HOST:-0.0.0.0}"
PORT="${PORT:-3000}"

exec next start -H "$BIND" -p "$PORT"
