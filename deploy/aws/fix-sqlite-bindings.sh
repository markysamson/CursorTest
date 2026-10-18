#!/usr/bin/env bash
# Fix: "Could not locate the bindings file" for better-sqlite3 on EC2.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/monopoly-run/CursorTest}"

echo "Installing compiler toolchain if needed…"
sudo apt-get update -qq
sudo apt-get install -y build-essential python3

echo "Reinstalling deps (single better-sqlite3 via overrides) and rebuilding natives…"
sudo -u monopoly -H bash -c "cd '${APP_DIR}' && git pull && npm ci && npm run rebuild:sqlite"

echo "Verifying Prisma + SQLite…"
sudo -u monopoly -H bash -c "cd '${APP_DIR}' && npm run verify:db"

echo "Rebuilding Next.js (serverExternalPackages for native modules)…"
sudo -u monopoly -H bash -c "cd '${APP_DIR}' && npm run build:prod"

echo "Restarting app…"
sudo systemctl restart monopoly-run
curl -s http://127.0.0.1:3000/api/health || true
