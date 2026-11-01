#!/usr/bin/env bash
# Production start (systemd). Do not use HOSTNAME — Linux sets it to the machine name.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.next/BUILD_ID" ]]; then
  echo "Missing production build (.next/BUILD_ID)." >&2
  echo "Run as monopoly: cd /opt/monopoly-run/CursorTest && npm run build:prod" >&2
  exit 1
fi

export PATH="$ROOT/node_modules/.bin:$PATH"

bash scripts/ensure-data-dir.sh

PORT="${PORT:-3000}"

# Always bind all interfaces on the VM. Never use the EC2 *public* IP here — it is
# not assigned to a local network interface (EADDRNOTAVAIL). Caddy/nginx uses the
# public IP; this process only needs 0.0.0.0:3000 on the instance.
NEXT_BIN="$ROOT/node_modules/.bin/next"
if [[ ! -x "$NEXT_BIN" ]]; then
  echo "Missing Next.js binary. Run: cd $ROOT && npm ci && npm run build:prod" >&2
  exit 1
fi
exec env -u HOSTNAME HOST=0.0.0.0 "$NEXT_BIN" start -H 0.0.0.0 -p "$PORT"
