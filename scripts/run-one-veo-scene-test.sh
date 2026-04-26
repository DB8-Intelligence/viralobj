#!/usr/bin/env bash
# =============================================================================
# ViralObj — single-scene Veo render test
#
# Executes the SMALLEST possible paid Veo render to confirm the
# Firestore-native pipeline end-to-end. Cost: 1 scene × 8s × $0.50 = $4.
#
# Steps:
#   1. Flip Cloud Run env: ENABLE_VEO_GENERATION=true, MAX_SCENES_PER_REEL=1.
#   2. Submit a single-object full render and capture the job_id.
#   3. Print the polling URL and the rollback command.
#
# Required env:
#   BASE_URL              https://viralobj-bridge-3s77drlfqa-uc.a.run.app
#   GEMINI_AGENT_TOKEN    matches the secret on Cloud Run
#
# IMPORTANT: this script DOES NOT roll Veo back to disabled afterwards —
# the rollback step is intentionally manual so the operator can poll
# /api/reel/{job_id}/status and inspect the rendered MP4 before turning
# the kill switch back on. Run the printed gcloud command when done.
#
# Usage:
#   export BASE_URL="https://viralobj-bridge-3s77drlfqa-uc.a.run.app"
#   export GEMINI_AGENT_TOKEN="$(grep '^GEMINI_AGENT_TOKEN=' ~/.viralobj-bootstrap-secrets.txt | cut -d= -f2)"
#   bash scripts/run-one-veo-scene-test.sh
# =============================================================================

set -euo pipefail

: "${BASE_URL:?BASE_URL required}"
: "${GEMINI_AGENT_TOKEN:?GEMINI_AGENT_TOKEN required}"

REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-viralobj-bridge}"
PROJECT="${PROJECT:-viralreel-ai-493701}"

echo "▸ Step 1/3 — flipping Cloud Run env (Veo ON, max 1 scene)…"
gcloud run services update "$SERVICE" \
  --region="$REGION" \
  --project="$PROJECT" \
  --update-env-vars="ENABLE_VEO_GENERATION=true,MAX_SCENES_PER_REEL=1" \
  --quiet

echo
echo "▸ Step 2/3 — POST /api/generate-reel (1 scene, 8s, ~\$4)…"
RESP=$(curl -sS -X POST "$BASE_URL/api/generate-reel" \
  -H "Content-Type: application/json" \
  -H "X-Gemini-Key: $GEMINI_AGENT_TOKEN" \
  -d '{
    "niche": "advogado",
    "topic": "Como explicar inventário para clientes leigos",
    "tone": "profissional",
    "duration": 8,
    "objects": ["martelo de juiz"]
  }')
echo "$RESP"

JOB_ID=$(echo "$RESP" | python -c 'import json,sys; print(json.load(sys.stdin).get("job_id",""))' 2>/dev/null || true)

echo
echo "▸ Step 3/3 — next steps:"
if [ -n "$JOB_ID" ]; then
  echo "    Poll status:"
  echo "      curl -s -H \"X-Gemini-Key: \$GEMINI_AGENT_TOKEN\" \\"
  echo "        \"$BASE_URL/api/reel/$JOB_ID/status\" | python -m json.tool"
else
  echo "    (no job_id parsed — inspect the response above)"
fi
echo
echo "    When the scene is completed and you've inspected the MP4, roll back:"
echo "      gcloud run services update $SERVICE --region=$REGION --project=$PROJECT \\"
echo "        --update-env-vars=ENABLE_VEO_GENERATION=false,MAX_SCENES_PER_REEL=2 --quiet"
