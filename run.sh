#!/usr/bin/env bash
# Starts the Angular dev server (Ctrl+C stops it). Installs dependencies first if
# node_modules is missing.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR"

echo "==> [1/2] Checking prerequisites"
missing=()
for cmd in node npm; do
  command -v "$cmd" >/dev/null 2>&1 || missing+=("$cmd")
done
if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing required tool(s): ${missing[*]}" >&2
  echo "  - Node.js (includes npm): https://nodejs.org/" >&2
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "    node_modules not found, installing dependencies..."
  npm ci
fi

echo "==> [2/2] Starting Angular dev server (Ctrl+C stops it)..."
npm start
