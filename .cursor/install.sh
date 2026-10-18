#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

command -v git >/dev/null
command -v node >/dev/null

npm ci

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo 'AUTH_SECRET="local-dev-secret"' >> .env
fi

npx prisma migrate deploy
npm run db:seed
