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
resolve_next_bin() {
  local candidate
  for candidate in \
    "$ROOT/node_modules/.bin/next" \
    "$ROOT/node_modules/next/dist/bin/next"; do
    if [[ -f "$candidate" ]]; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

NEXT_BIN=""
if ! NEXT_BIN="$(resolve_next_bin)"; then
  echo "Missing Next.js in node_modules under: $ROOT" >&2
  echo "systemd runs this path — not ~/CursorTest in your home directory." >&2
  echo "Fix (stop restart loop first):" >&2
  echo "  sudo systemctl stop monopoly-run" >&2
  echo "  sudo -u monopoly -H bash -c 'cd $ROOT && npm ci && npm run postinstall'" >&2
  echo "  sudo systemctl start monopoly-run" >&2
  echo "Or: sudo bash $ROOT/deploy/aws/reinstall-app-deps.sh" >&2
  exit 1
fi

exec env -u HOSTNAME HOST=0.0.0.0 node "$NEXT_BIN" start -H 0.0.0.0 -p "$PORT"
