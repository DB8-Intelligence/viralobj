#!/usr/bin/env bash
# =============================================================================
# Sprint 11 — fixture creator for VEO_MOCK resilience tests
#
# Writes two reel_jobs docs (each with a scenes/ subcollection) into
# Firestore via the REST API. They drive the bridge through paths that
# would otherwise require real Veo billing:
#
#   reel_jobs/test-partial     — 2 scenes; one mock:completed, one mock:failed
#                                Expected status after 1 poll: "partial".
#   reel_jobs/test-timeout     — 2 scenes; mock:processing, but created_at
#                                set to 2 hours ago. With VEO_TIMEOUT_SECONDS
#                                ≤ 7200, the timeout guard marks both failed.
#
# Both fixtures use deterministic doc ids so re-running the script just
# overwrites — no accumulation across iterations.
#
# Required env:
#   PROJECT       defaults to viralreel-ai-493701
#   gcloud auth print-access-token must work (your local user creds, ADC, etc.)
# =============================================================================

set -euo pipefail

PROJECT="${PROJECT:-viralreel-ai-493701}"
TOKEN=$(gcloud auth print-access-token)
BASE="https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents"
NOW_ISO=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
TWO_HOURS_AGO_ISO=$(date -u -d "2 hours ago" +"%Y-%m-%dT%H:%M:%S.000Z")

call() {
  curl -sS -X "$1" \
    -H "Authorization: Bearer $TOKEN" \
    -H "x-goog-user-project: $PROJECT" \
    -H "Content-Type: application/json" \
    "$2" \
    -d "$3" | head -c 600
  echo
}

job_doc_body() {
  local created_at="$1" niche="$2" topic="$3"
  cat <<JSON
{
  "fields": {
    "user_id":               { "stringValue": "system:gemini-agent" },
    "auth_provider":         { "stringValue": "gemini-key" },
    "niche":                 { "stringValue": "$niche" },
    "topic":                 { "stringValue": "$topic" },
    "tone":                  { "stringValue": "profissional" },
    "duration":              { "integerValue": "10" },
    "mode":                  { "stringValue": "full" },
    "status":                { "stringValue": "processing" },
    "scene_count":           { "integerValue": "2" },
    "completed_scenes":      { "integerValue": "0" },
    "failed_scenes":         { "integerValue": "0" },
    "estimated_veo_cost":    { "doubleValue": 8 },
    "limited_by_max_scenes": { "booleanValue": false },
    "requested_scenes":      { "integerValue": "2" },
    "provider_used":         { "stringValue": "mock" },
    "created_at":            { "timestampValue": "$created_at" },
    "updated_at":            { "timestampValue": "$created_at" },
    "error":                 { "nullValue": null }
  }
}
JSON
}

scene_doc_body() {
  local index="$1" status="$2" operation="$3"
  cat <<JSON
{
  "fields": {
    "index":         { "integerValue": "$index" },
    "scene_type":    { "stringValue": "intro" },
    "object":        { "stringValue": "martelo de juiz" },
    "prompt":        { "stringValue": "MOCK fixture scene $index" },
    "script":        { "stringValue": "MOCK script $index" },
    "status":        { "stringValue": "$status" },
    "veo_operation": { "stringValue": "$operation" },
    "gcs_uri":       { "nullValue": null },
    "public_url":    { "nullValue": null },
    "output_folder": { "stringValue": "gs://viralobj-assets/mock/$index/" },
    "error":         { "nullValue": null },
    "created_at":    { "timestampValue": "$NOW_ISO" },
    "updated_at":    { "timestampValue": "$NOW_ISO" }
  }
}
JSON
}

write_fixture() {
  local job_id="$1" job_created_at="$2" niche="$3" topic="$4"
  local scene0_op="$5" scene1_op="$6" scene_status="$7"

  echo "▸ Writing reel_jobs/$job_id (created_at=$job_created_at)…"
  call PATCH \
    "$BASE/reel_jobs/$job_id?currentDocument.exists=false&updateMask.fieldPaths=user_id&updateMask.fieldPaths=auth_provider&updateMask.fieldPaths=niche&updateMask.fieldPaths=topic&updateMask.fieldPaths=tone&updateMask.fieldPaths=duration&updateMask.fieldPaths=mode&updateMask.fieldPaths=status&updateMask.fieldPaths=scene_count&updateMask.fieldPaths=completed_scenes&updateMask.fieldPaths=failed_scenes&updateMask.fieldPaths=estimated_veo_cost&updateMask.fieldPaths=limited_by_max_scenes&updateMask.fieldPaths=requested_scenes&updateMask.fieldPaths=provider_used&updateMask.fieldPaths=created_at&updateMask.fieldPaths=updated_at&updateMask.fieldPaths=error" \
    "$(job_doc_body "$job_created_at" "$niche" "$topic")" \
    || true
  # If the parent already exists from a previous run, PATCH without
  # currentDocument.exists=false:
  call PATCH \
    "$BASE/reel_jobs/$job_id" \
    "$(job_doc_body "$job_created_at" "$niche" "$topic")"

  for idx in 0 1; do
    local op
    [ "$idx" = "0" ] && op="$scene0_op" || op="$scene1_op"
    echo "▸ Writing reel_jobs/$job_id/scenes/$idx (op=$op status=$scene_status)…"
    call PATCH \
      "$BASE/reel_jobs/$job_id/scenes/$idx" \
      "$(scene_doc_body "$idx" "$scene_status" "$op")"
  done
}

write_fixture \
  "test-partial" \
  "$NOW_ISO" \
  "advogado" \
  "Sprint 11 partial-failure fixture" \
  "mock://test-partial-0:completed" \
  "mock://test-partial-1:failed" \
  "submitted"

write_fixture \
  "test-timeout" \
  "$TWO_HOURS_AGO_ISO" \
  "contador" \
  "Sprint 11 timeout fixture" \
  "mock://test-timeout-0:processing" \
  "mock://test-timeout-1:processing" \
  "submitted"

echo
echo "▸ Fixtures written."
echo "    GET .../api/reel/test-partial/status   → expect status=partial"
echo "    GET .../api/reel/test-timeout/status   → expect status=failed (TIMEOUT)"
