#!/usr/bin/env bash
# ViralObj — local zero-cloud smoke test (Sprint 25.1)
# Hits localhost:3001 endpoints to confirm mocks work end-to-end.

set -euo pipefail

BRIDGE="${BRIDGE:-http://localhost:3001}"
TOKEN="${GEMINI_AGENT_TOKEN:-local-dev-token}"

red()    { printf "\033[1;31m%s\033[0m\n" "$*"; }
green()  { printf "\033[1;32m%s\033[0m\n" "$*"; }
cyan()   { printf "\033[1;36m%s\033[0m\n" "$*"; }

probe() {
  local label="$1" expect="$2"
  shift 2
  local code
  code=$(curl -s -o /tmp/viralobj-smoke.body -w "%{http_code}" --max-time 15 "$@" || echo "000")
  if [ "$code" = "$expect" ]; then
    green "✅ $label  → HTTP $code"
  else
    red "❌ $label  → HTTP $code (expected $expect)"
    red "   body: $(head -c 200 /tmp/viralobj-smoke.body)"
    return 1
  fi
}

cyan "Smoke local — $BRIDGE"
echo

probe "GET /readyz" 200 "$BRIDGE/readyz"
probe "GET /api/niches" 200 -H "X-Gemini-Key: $TOKEN" "$BRIDGE/api/niches"

cyan "→ /api/niches body sample:"
curl -s --max-time 10 -H "X-Gemini-Key: $TOKEN" "$BRIDGE/api/niches" | head -c 300
echo
echo

probe "POST /api/generate-reel?dry_run=true" 200 \
  -X POST -H "Content-Type: application/json" -H "X-Gemini-Key: $TOKEN" \
  -d '{"niche":"casa","objects":["esponja"],"topic":"vinagre","tone":"dramatic","duration":15}' \
  "$BRIDGE/api/generate-reel?dry_run=true"

cyan "→ dry_run response:"
curl -s -X POST --max-time 10 -H "Content-Type: application/json" -H "X-Gemini-Key: $TOKEN" \
  -d '{"niche":"casa","objects":["esponja"],"topic":"vinagre","tone":"dramatic","duration":15}' \
  "$BRIDGE/api/generate-reel?dry_run=true" | head -c 400
echo
echo

probe "POST /api/generate-reel (full mock)" 202 \
  -X POST -H "Content-Type: application/json" -H "X-Gemini-Key: $TOKEN" \
  -d '{"niche":"casa","objects":["esponja"],"topic":"x","tone":"dramatic","duration":15}' \
  "$BRIDGE/api/generate-reel"

probe "GET /api/reel/mock-job-001/status" 200 -H "X-Gemini-Key: $TOKEN" \
  "$BRIDGE/api/reel/mock-job-001/status"

probe "GET /api/billing/credits" 200 -H "X-Gemini-Key: $TOKEN" "$BRIDGE/api/billing/credits"

cyan "→ /api/billing/credits body:"
curl -s --max-time 10 -H "X-Gemini-Key: $TOKEN" "$BRIDGE/api/billing/credits"
echo

green "✅ All zero-cloud probes passed. No GCP calls were made."
