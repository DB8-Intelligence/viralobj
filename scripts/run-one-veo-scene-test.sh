#!/usr/bin/env bash
# =============================================================================
# ViralObj — single-scene Veo render test (paid · ~$4 max)
#
# Flips Cloud Run env to ENABLE_VEO_GENERATION=true + MAX_SCENES_PER_REEL=1,
# submits a single-object full render, captures the job_id, and ALWAYS
# rolls Veo back to disabled on exit (success, error, ctrl-C). The render
# itself continues asynchronously in Vertex AI even after rollback —
# polling /api/reel/{jobId}/status keeps working because that endpoint
# does not gate on ENABLE_VEO_GENERATION.
#
# Cost cap: 1 scene × 8s × $0.50 = $4. Plus one Gemini package call
# (~$0.05). The trap is set BEFORE the env flip so an aborted gcloud
# update still triggers the off-state attempt.
#
# Required env:
#   BASE_URL              https://viralobj-bridge-3s77drlfqa-uc.a.run.app
#   GEMINI_AGENT_TOKEN    matches the secret on Cloud Run
# =============================================================================

set -euo pipefail

: "${BASE_URL:?BASE_URL required}"
: "${GEMINI_AGENT_TOKEN:?GEMINI_AGENT_TOKEN required}"

REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-viralobj-bridge}"
PROJECT="${PROJECT:-viralreel-ai-493701}"
JOB_ID_FILE="${JOB_ID_FILE:-$HOME/.viralobj-last-job-id.txt}"

rollback() {
  local rc=$?
  echo
  echo "▸ Rollback (exit=$rc) — flipping ENABLE_VEO_GENERATION=false, MAX_SCENES_PER_REEL=2…"
  if gcloud run services update "$SERVICE" \
      --region="$REGION" --project="$PROJECT" \
      --update-env-vars="ENABLE_VEO_GENERATION=false,MAX_SCENES_PER_REEL=2" \
      --quiet >/dev/null 2>&1; then
    echo "    ✓ Veo back to disabled."
  else
    echo "    ✗ Rollback failed — RUN MANUALLY:"
    echo "      gcloud run services update $SERVICE --region=$REGION --project=$PROJECT \\"
    echo "        --update-env-vars=ENABLE_VEO_GENERATION=false,MAX_SCENES_PER_REEL=2 --quiet"
  fi
  exit $rc
}
# Set trap BEFORE the first state-changing operation so a failure during
# the env flip still attempts to undo whatever partial state is in place.
trap rollback EXIT

echo "▸ Step 1/3 — flipping Cloud Run env (Veo ON, max 1 scene)…"
gcloud run services update "$SERVICE" \
  --region="$REGION" --project="$PROJECT" \
  --update-env-vars="ENABLE_VEO_GENERATION=true,MAX_SCENES_PER_REEL=1" \
  --quiet >/dev/null
echo "    ✓ Veo ON, MAX_SCENES_PER_REEL=1"

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

JOB_ID=$(printf '%s' "$RESP" | python -c 'import json,sys; print(json.load(sys.stdin).get("job_id",""))' 2>/dev/null || true)
SCENE_COUNT=$(printf '%s' "$RESP" | python -c 'import json,sys; print(json.load(sys.stdin).get("scene_count",""))' 2>/dev/null || true)
EST_COST=$(printf '%s' "$RESP" | python -c 'import json,sys; print(json.load(sys.stdin).get("estimated_veo_cost",""))' 2>/dev/null || true)

if [ -n "$JOB_ID" ]; then
  printf '%s\n' "$JOB_ID" > "$JOB_ID_FILE"
  echo
  echo "▸ Step 3/3 — saved job_id to $JOB_ID_FILE"
  echo "    job_id:                $JOB_ID"
  echo "    scene_count:           $SCENE_COUNT"
  echo "    estimated_veo_cost:    \$${EST_COST}"
  echo
  echo "    Poll status from another shell:"
  echo "      curl -s -H \"X-Gemini-Key: \$GEMINI_AGENT_TOKEN\" \\"
  echo "        \"$BASE_URL/api/reel/$JOB_ID/status\" | python -m json.tool"
else
  echo
  echo "    ⚠ No job_id parsed — inspect the response above. Trap will still rollback."
fi

# Normal exit — trap will run rollback now.
