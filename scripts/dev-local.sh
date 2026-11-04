#!/usr/bin/env bash
# One-shot local setup + dev server (laptop).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example (admin password: monopoly-admin)"
fi

npm install
npm exec prisma migrate deploy
npm run db:seed

echo ""
echo "Starting dev server — open:"
echo "  Home:    http://localhost:3000"
echo "  Admin:   http://localhost:3000/admin/login  (password from .env ADMIN_PASSWORD)"
echo "  Team:    http://localhost:3000/team/login"
echo "  Config:  http://localhost:3000/admin/config"
echo ""
exec npm run dev -- --hostname 0.0.0.0
