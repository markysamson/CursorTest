#!/usr/bin/env bash
# Fix: "Could not locate the bindings file" for better-sqlite3 on EC2.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/monopoly-run/CursorTest}"

echo "Installing compiler toolchain if needed…"
sudo apt-get update -qq
sudo apt-get install -y build-essential python3

echo "Rebuilding better-sqlite3 in ${APP_DIR}…"
sudo -u monopoly -H bash -c "cd '${APP_DIR}' && npm rebuild better-sqlite3"

echo "Verifying…"
sudo -u monopoly -H bash -c "cd '${APP_DIR}' && node -e \"require('better-sqlite3'); console.log('better-sqlite3 OK')\""

echo "Restarting app…"
sudo systemctl restart monopoly-run
curl -s http://127.0.0.1:3000/api/health || true
