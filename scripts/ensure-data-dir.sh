#!/usr/bin/env bash
# Creates MONOPOLY_DATA_DIR, upload folder, and SQLite parent dir (no Node/tsx required).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

ENV_FILE="${MONOPOLY_ENV_FILE:-}"
if [[ -z "$ENV_FILE" && -f /var/lib/monopoly-run/.env ]]; then
  ENV_FILE=/var/lib/monopoly-run/.env
fi
if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi
if [[ -n "$ENV_FILE" && -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ENV_FILE"
  set +a
fi

strip_quotes() {
  local v="$1"
  v="${v#\"}"
  v="${v%\"}"
  v="${v#\'}"
  v="${v%\'}"
  printf '%s' "$v"
}

mkdir_p750() {
  mkdir -p "$1"
  chmod 750 "$1" 2>/dev/null || true
}

DATA_DIR_RAW="$(strip_quotes "${MONOPOLY_DATA_DIR:-}")"
DATA_DIR=""
if [[ -n "$DATA_DIR_RAW" ]]; then
  if [[ "$DATA_DIR_RAW" == /* ]]; then
    DATA_DIR="$DATA_DIR_RAW"
  else
    DATA_DIR="$ROOT/$DATA_DIR_RAW"
  fi
  mkdir_p750 "$DATA_DIR"
  UPLOAD_ROOT="$DATA_DIR/uploads"
else
  UPLOAD_ROOT="$ROOT/public/uploads"
fi
mkdir_p750 "$UPLOAD_ROOT"

DB_URL_RAW="$(strip_quotes "${DATABASE_URL:-}")"
if [[ -n "$DB_URL_RAW" && "$DB_URL_RAW" == file:* ]]; then
  DB_RAW="${DB_URL_RAW#file:}"
elif [[ -n "$DATA_DIR" ]]; then
  DB_RAW="$DATA_DIR/data.db"
else
  DB_RAW="./dev.db"
fi

if [[ "$DB_RAW" == /* ]]; then
  DB_PATH="$DB_RAW"
else
  DB_PATH="$ROOT/$DB_RAW"
fi
mkdir_p750 "$(dirname "$DB_PATH")"
