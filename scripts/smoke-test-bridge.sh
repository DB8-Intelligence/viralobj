#!/usr/bin/env bash
# =============================================================================
# ViralObj Bridge — production smoke test
#
# Hits every public contract surface of the bridge and verifies the
# response shape. Designed to run against a deployed Cloud Run service
# (no local node required), but also fine against `node server.js` on
# localhost.
#
# Required env:
#   BASE_URL              e.g. https://viralobj-bridge-3s77drlfqa-uc.a.run.app
#   GEMINI_AGENT_TOKEN    the X-Gemini-Key value
#
# Usage:
#   export BASE_URL="https://..."
#   export GEMINI_AGENT_TOKEN="$(grep '^GEMINI_AGENT_TOKEN=' ~/.viralobj-bootstrap-secrets.txt | cut -d= -f2)"
#   bash scripts/smoke-test-bridge.sh
#
# Exit codes: 0 = all pass · 1 = first failed test
# =============================================================================

set -uo pipefail

: "${BASE_URL:?BASE_URL is required (e.g. https://viralobj-bridge-...uc.a.run.app)}"
: "${GEMINI_AGENT_TOKEN:?GEMINI_AGENT_TOKEN is required}"

# Colors stripped when not a TTY so logs stay readable in Cloud Build / CI.
if [ -t 1 ]; then
  C_OK=$'\033[1;32m'; C_FAIL=$'\033[1;31m'; C_DIM=$'\033[2m'; C_RST=$'\033[0m'
else
  C_OK=""; C_FAIL=""; C_DIM=""; C_RST=""
fi

PASSED=0
FAILED=0
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# Curl wrapper: writes body to $TMP/$1.json and returns status code on stdout.
http() {
  local label="$1" method="$2" path="$3"
  shift 3
  local out="$TMP/${label}.json"
  local code
  code=$(curl -sS -o "$out" -w "%{http_code}" -X "$method" \
      -H "X-Gemini-Key: $GEMINI_AGENT_TOKEN" \
      -H "Content-Type: application/json" \
      "$@" \
      "${BASE_URL}${path}" || echo "000")
  echo "$code"
}

# Tiny JSON path probe. Uses python so we don't need jq on Windows.
# `pass_if` runs the python expression with `j` bound to the parsed body.
pass_if() {
  local label="$1" expr="$2" body="$TMP/${label}.json"
  # Feed the file via stdin so bash resolves the path. Windows-native
  # python (the one bundled with gcloud SDK) can't open mingw-style
  # /tmp/... paths directly.
  python -c "
import json, sys
try:
    j = json.load(sys.stdin)
except Exception as e:
    print('PARSE_FAIL:' + str(e)); sys.exit(2)
sys.exit(0 if ($expr) else 1)
" < "$body"
}

run() {
  local label="$1" desc="$2" expected_code="$3" check_expr="$4" code="$5"
  if [ "$code" = "$expected_code" ] && pass_if "$label" "$check_expr"; then
    printf "%s✓%s %s — HTTP %s · %s\n" "$C_OK" "$C_RST" "$desc" "$code" "$check_expr"
    PASSED=$((PASSED + 1))
    return 0
  fi
  printf "%s✗%s %s — got HTTP %s, expected %s · check: %s\n%s%s%s\n" \
      "$C_FAIL" "$C_RST" "$desc" "$code" "$expected_code" "$check_expr" \
      "$C_DIM" "$(head -c 400 "$TMP/${label}.json" 2>/dev/null || echo '<no body>')" "$C_RST"
  FAILED=$((FAILED + 1))
  return 1
}

# Resolve python (Windows ships `python`; some systems only `python3`).
if ! command -v python >/dev/null; then
  if command -v python3 >/dev/null; then alias python=python3; else
    echo "${C_FAIL}✗ python or python3 required for JSON assertions${C_RST}"
    exit 1
  fi
fi

echo "==> ViralObj Bridge smoke test against ${BASE_URL}"
echo

# ── 1. /health (unauth, no dependencies) ────────────────────────────────────
code=$(curl -sS -o "$TMP/health.json" -w "%{http_code}" "${BASE_URL}/health")
run health "GET  /health" 200 "j.get('status')=='ok'" "$code"

# ── 2. /readyz (unauth, real db/env checks; /healthz is intercepted by GFE) ─
code=$(curl -sS -o "$TMP/readyz.json" -w "%{http_code}" "${BASE_URL}/readyz")
run readyz "GET  /readyz" 200 "j.get('ok') is True and 'database' in j.get('checks',{})" "$code"

# ── 3. /api/niches (auth required) ──────────────────────────────────────────
code=$(http niches GET "/api/niches")
run niches "GET  /api/niches (auth)" 200 "j.get('count',0)>=18 and j.get('source') in ('firestore','db','db-fallback','memory')" "$code"

# ── 4. /api/niches without auth → 401 ───────────────────────────────────────
code=$(curl -sS -o "$TMP/niches_noauth.json" -w "%{http_code}" "${BASE_URL}/api/niches")
run niches_noauth "GET  /api/niches (no auth → 401)" 401 "True" "$code"

# ── 5. /openapi.json — must document dry_run + 403 ──────────────────────────
code=$(curl -sS -o "$TMP/openapi.json" -w "%{http_code}" "${BASE_URL}/openapi.json")
run openapi "GET  /openapi.json (dry_run + 403 documented)" 200 \
  "any(p.get('name')=='dry_run' for p in j['paths']['/api/generate-reel']['post'].get('parameters',[])) and '403' in j['paths']['/api/generate-reel']['post']['responses']" \
  "$code"

# ── 6. /agent-manifest.json ─────────────────────────────────────────────────
code=$(curl -sS -o "$TMP/manifest.json" -w "%{http_code}" "${BASE_URL}/agent-manifest.json")
run manifest "GET  /agent-manifest.json" 200 \
  "j.get('name')=='ViralObj Bridge' and j['auth']['header']=='X-Gemini-Key' and j['safety']['dry_run_supported'] is True" \
  "$code"

# ── 7. POST /api/generate-reel?dry_run=true ─────────────────────────────────
PAYLOAD='{"niche":"advogado","topic":"Como explicar inventário para clientes leigos","tone":"dramatic","duration":30,"objects":["martelo de juiz","contrato","caneta","pasta de documentos"]}'
code=$(http dry_run POST "/api/generate-reel?dry_run=true" -d "$PAYLOAD")
run dry_run "POST /api/generate-reel?dry_run=true" 200 \
  "j.get('mode')=='dry_run' and j.get('cost_guard',{}).get('veo_called') is False and isinstance(j.get('package'),dict) and isinstance(j.get('package',{}).get('characters',[]),list)" \
  "$code"

# ── 8. POST /api/generate-reel WITHOUT dry_run → 403 VEO_DISABLED ───────────
code=$(http veo_blocked POST "/api/generate-reel" -d "$PAYLOAD")
run veo_blocked "POST /api/generate-reel (no dry_run → 403 VEO_DISABLED)" 403 \
  "j.get('error')=='VEO_DISABLED' and j.get('ok') is False" \
  "$code"

# ── 9. /api/reel/{fake}/status → 404 JOB_NOT_FOUND ──────────────────────────
code=$(http fake_job GET "/api/reel/this-job-does-not-exist/status")
run fake_job "GET  /api/reel/{fake}/status (404 JOB_NOT_FOUND)" 404 \
  "j.get('error')=='JOB_NOT_FOUND' and j.get('ok') is False" \
  "$code"

# ── 10. OpenAPI documents the status path + ReelJobStatus schema ───────────
code=$(curl -sS -o "$TMP/openapi_status.json" -w "%{http_code}" "${BASE_URL}/openapi.json")
run openapi_status "GET  /openapi.json (status path documented)" 200 \
  "'/api/reel/{jobId}/status' in j['paths'] and 'ReelJobStatus' in j['components']['schemas']" \
  "$code"

echo
if [ "$FAILED" -gt 0 ]; then
  printf "%s%d failed%s · %s%d passed%s\n" "$C_FAIL" "$FAILED" "$C_RST" "$C_OK" "$PASSED" "$C_RST"
  exit 1
fi
printf "%sAll %d tests passed.%s\n" "$C_OK" "$PASSED" "$C_RST"
exit 0
