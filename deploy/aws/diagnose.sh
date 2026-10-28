#!/usr/bin/env bash
# Run on the EC2 instance: bash /opt/monopoly-run/CursorTest/deploy/aws/diagnose.sh
APP_DIR="${APP_DIR:-/opt/monopoly-run/CursorTest}"

set -euo pipefail

echo "=== Listening ports (80 / 443 / 3000) ==="
sudo ss -tlnp | grep -E ':80 |:443 |:3000 ' || echo "(none matched — nothing listening on these ports)"

echo ""
echo "=== systemd ==="
systemctl is-active monopoly-run 2>/dev/null && systemctl --no-pager status monopoly-run || echo "monopoly-run not active"
echo "---"
systemctl is-active caddy 2>/dev/null && systemctl --no-pager status caddy || echo "caddy not active"

echo ""
echo "=== Production build ==="
BUILD_ID="${APP_DIR}/.next/BUILD_ID"
if [[ -f "$BUILD_ID" ]]; then
  echo "OK: $BUILD_ID ($(cat "$BUILD_ID"))"
else
  echo "MISSING: $BUILD_ID — run: sudo -u monopoly bash -c 'cd ${APP_DIR} && npm run build:prod'"
fi

echo ""
echo "=== App health (localhost:3000) ==="
curl -sS -m 3 http://127.0.0.1:3000/api/health || echo "FAILED — start/fix monopoly-run first"

echo ""
echo "=== Caddy via localhost:80 ==="
curl -sS -m 3 -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1/ || echo "FAILED — Caddy not serving on :80"

echo ""
echo "=== Caddy config ==="
if [[ -f /etc/caddy/Caddyfile ]]; then
  sudo caddy validate --config /etc/caddy/Caddyfile 2>&1 || true
  echo "--- first lines of /etc/caddy/Caddyfile ---"
  head -20 /etc/caddy/Caddyfile
else
  echo "Missing /etc/caddy/Caddyfile"
fi

echo ""
echo "=== Recent Caddy logs ==="
sudo journalctl -u caddy -n 25 --no-pager 2>/dev/null || true

echo ""
echo "=== Recent app logs ==="
sudo journalctl -u monopoly-run -n 15 --no-pager 2>/dev/null || true

echo ""
echo "=== Public IP (compare to DNS A record and browser URL) ==="
curl -sS -m 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "(metadata unavailable)"

echo ""
echo "If 3000 works but 80/443 do not: fix Caddyfile and run: sudo systemctl restart caddy"
echo "If nothing off-instance works: AWS EC2 Security Group must allow inbound TCP 80 and 443."
