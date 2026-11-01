#!/usr/bin/env bash
# Reinstall dependencies and rebuild if needed (run on EC2 as root).
set -euo pipefail
APP_DIR="/opt/monopoly-run/CursorTest"

if [[ ! -d "$APP_DIR" ]]; then
  echo "App not found at $APP_DIR" >&2
  exit 1
fi

echo "Stopping service to avoid restart loop…"
systemctl stop monopoly-run || true

sudo -u monopoly -H bash -c "
  set -euo pipefail
  cd '$APP_DIR'
  echo \"Working in: \$(pwd)\"
  if [[ ! -f package.json ]]; then
    echo 'No package.json here — wrong directory?' >&2
    exit 1
  fi
  npm ci
  if [[ ! -f .next/BUILD_ID ]]; then
    echo 'No production build — running build:prod (needs swap on t3.micro)…'
    npm run build:prod
  else
    echo 'Production build present — skipping build:prod'
    npm run postinstall
  fi
"

systemctl start monopoly-run
sleep 2
systemctl status monopoly-run --no-pager || true
