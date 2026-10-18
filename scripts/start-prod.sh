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

PORT="${PORT:-3000}"

# Always bind all interfaces on the VM. Never use the EC2 *public* IP here — it is
# not assigned to a local network interface (EADDRNOTAVAIL). Caddy/nginx uses the
# public IP; this process only needs 0.0.0.0:3000 on the instance.
exec env -u HOSTNAME HOST=0.0.0.0 next start -H 0.0.0.0 -p "$PORT"
