#!/usr/bin/env bash
# Installs dependencies, checks formatting and linting, builds the Angular app and
# runs its unit tests.
# Pass --skip-tests to skip the test step for a faster sanity build.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SKIP_TESTS=0
for arg in "$@"; do
  case "$arg" in
    --skip-tests) SKIP_TESTS=1 ;;
    *)
      echo "Unknown option: $arg" >&2
      echo "Usage: $0 [--skip-tests]" >&2
      exit 1
      ;;
  esac
done

cd "$ROOT_DIR"

echo "==> [1/4] Checking prerequisites"
missing=()
for cmd in node npm; do
  command -v "$cmd" >/dev/null 2>&1 || missing+=("$cmd")
done
if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing required tool(s): ${missing[*]}" >&2
  echo "  - Node.js (includes npm): https://nodejs.org/" >&2
  exit 1
fi

echo "==> [2/4] Installing dependencies"
npm ci

echo "==> [3/4] Checking formatting, linting and building Angular app"
npm run format:check
npm run lint
npm run build

echo "==> [4/4] Running Angular tests"
if [[ "$SKIP_TESTS" -eq 1 ]]; then
  echo "    Skipped (--skip-tests)"
else
  npm test -- --watch=false
fi

echo "==> Build complete."
