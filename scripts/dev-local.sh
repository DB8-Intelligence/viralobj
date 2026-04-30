#!/usr/bin/env bash
# ViralObj — local development bootstrap (Sprint 25.1 ZERO-CLOUD MODE)
# Usage:  bash scripts/dev-local.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

cyan()   { printf "\033[1;36m%s\033[0m\n" "$*"; }
green()  { printf "\033[1;32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[1;33m%s\033[0m\n" "$*"; }
red()    { printf "\033[1;31m%s\033[0m\n" "$*"; }

cyan "🚀 ViralObj — ZERO-CLOUD MODE"
echo
green "💰 Expected cost: \$0"
green "🌐 No internet, gcloud, or API keys required"
echo
echo "Bridge:  http://localhost:3001"
echo "Webapp:  http://localhost:3000"
echo

# ── Pre-flight ────────────────────────────────────────────────────────────────

if [ ! -f ".env.local" ]; then
  red "Missing .env.local at repo root. See docs/LOCAL_DEV_AND_DEPLOY_CHECKLIST.md"
  exit 1
fi

# Verify the zero-cloud flags are present.
required_mocks=(LOCAL_DEV_MODE MOCK_VERTEX MOCK_FIRESTORE MOCK_STORAGE MOCK_BILLING MOCK_AUTH)
missing=()
for k in "${required_mocks[@]}"; do
  if ! grep -qE "^${k}=true" .env.local; then
    missing+=("$k")
  fi
done
if [ ${#missing[@]} -gt 0 ]; then
  yellow "WARNING: .env.local missing zero-cloud flags: ${missing[*]}"
  yellow "Real GCP calls may happen. Add the missing flags or run npm run dev:full instead."
else
  green "✅ Zero-cloud flags all set in .env.local."
fi

if [ ! -f "webapp/.env.local" ]; then
  red "Missing webapp/.env.local. See docs/LOCAL_DEV_AND_DEPLOY_CHECKLIST.md"
  exit 1
fi

echo
green "Open two terminals:"
echo
echo "  Terminal 1 — bridge (port 3001):"
echo "    PORT=3001 node server.js"
echo
echo "  Terminal 2 — webapp (port 3000):"
echo "    cd webapp && npm run dev"
echo
green "Smoke test (run after both terminals are up):"
echo "    bash scripts/smoke-local.sh"
echo
yellow "Reminder: do NOT deploy on every change. See docs/LOCAL_DEV_AND_DEPLOY_CHECKLIST.md"
