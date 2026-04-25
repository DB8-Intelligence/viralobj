#!/usr/bin/env bash
# =============================================================================
# ViralObj Bridge — GCP one-shot bootstrap
#
# Provisions everything the Bridge needs to run on Google Cloud:
#   1. Enable required APIs
#   2. Cloud SQL instance (Postgres 15) + database + app user
#   3. Cloud Storage bucket (viralobj-assets) with public object-read
#   4. Service Account (viralobj-sa) with the minimal IAM needed
#   5. Secret Manager entries (API keys + DB password)
#   6. Cloud Run deploy wired to SQL + Secrets + env
#   7. Prints the manual one-liner to apply database/init.sql
#
# Idempotent: every step checks existence first. Safe to re-run after
# tweaking env vars — it'll rotate secrets, add IAM bindings, redeploy.
#
# Usage (set PROJECT_ID + the agent token; AI services use ADC, no API keys):
#   export PROJECT_ID=my-gcp-project
#   export GEMINI_AGENT_TOKEN=$(openssl rand -hex 32)
#   bash scripts/gcp-bootstrap.sh
#
# Optional overrides (all have defaults):
#   REGION=us-central1  SERVICE_NAME=viralobj-bridge
#   SQL_INSTANCE=viralobj-db  SQL_DB_NAME=viralobj  SQL_DB_USER=viralobj_app
#   SQL_TIER=db-f1-micro  BUCKET_NAME=viralobj-assets  SA_NAME=viralobj-sa
# =============================================================================

set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────

: "${PROJECT_ID:?Set PROJECT_ID (your GCP project id) before running this script.}"

REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-viralobj-bridge}"

SQL_INSTANCE="${SQL_INSTANCE:-viralobj-db}"
SQL_DB_NAME="${SQL_DB_NAME:-viralobj}"
SQL_DB_USER="${SQL_DB_USER:-viralobj_app}"
SQL_TIER="${SQL_TIER:-db-f1-micro}"

BUCKET_NAME="${BUCKET_NAME:-viralobj-assets}"
SA_NAME="${SA_NAME:-viralobj-sa}"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
SQL_CONN="${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"

# ─── Helpers ─────────────────────────────────────────────────────────────────

log()  { printf "\n\033[1;34m▶ %s\033[0m\n" "$*"; }
ok()   { printf "  \033[1;32m✓\033[0m %s\n" "$*"; }
warn() { printf "  \033[1;33m⚠\033[0m %s\n" "$*"; }
die()  { printf "\n\033[1;31m✗ %s\033[0m\n" "$*" >&2; exit 1; }

prompt_secret() {
  # prompt_secret VAR_NAME "Human label"
  local var="$1" label="$2" tmp
  if [ -z "${!var:-}" ]; then
    printf "%s: " "$label"
    read -rs tmp
    echo
    [ -n "$tmp" ] || die "$var is required"
    eval "$var=\$tmp"
  fi
}

ensure_secret() {
  # ensure_secret SECRET_NAME SECRET_VALUE
  local name="$1" value="$2"
  if gcloud secrets describe "$name" --project="$PROJECT_ID" >/dev/null 2>&1; then
    printf '%s' "$value" | gcloud secrets versions add "$name" \
      --project="$PROJECT_ID" --data-file=- >/dev/null
    ok "secret $name — new version added"
  else
    printf '%s' "$value" | gcloud secrets create "$name" \
      --project="$PROJECT_ID" --replication-policy=automatic --data-file=- >/dev/null
    ok "secret $name — created"
  fi
}

# ─── 0. Preflight ────────────────────────────────────────────────────────────

log "Step 0: preflight"
command -v gcloud >/dev/null || die "gcloud CLI not found. Install: https://cloud.google.com/sdk/docs/install"
gcloud config set project "$PROJECT_ID" >/dev/null
ok "project: $PROJECT_ID"
ok "region:  $REGION"
ok "sa:      $SA_EMAIL"
ok "sql:     $SQL_CONN"
ok "bucket:  gs://$BUCKET_NAME"

# ─── 1. Enable APIs ──────────────────────────────────────────────────────────

log "Step 1: enabling required APIs (may take ~1 min)"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  aiplatform.googleapis.com \
  --project="$PROJECT_ID"
ok "APIs enabled (Cloud Run, Cloud Build, AR, SQL, Storage, Secret Manager, IAM, Vertex AI)"

# ─── 2. Cloud SQL ────────────────────────────────────────────────────────────

log "Step 2: Cloud SQL Postgres 15"

if gcloud sql instances describe "$SQL_INSTANCE" --project="$PROJECT_ID" >/dev/null 2>&1; then
  warn "instance $SQL_INSTANCE already exists"
else
  gcloud sql instances create "$SQL_INSTANCE" \
    --project="$PROJECT_ID" \
    --database-version=POSTGRES_15 \
    --region="$REGION" \
    --tier="$SQL_TIER" \
    --storage-size=10GB \
    --storage-type=SSD \
    --storage-auto-increase \
    --backup-start-time=03:00
  ok "instance $SQL_INSTANCE created"
fi

if gcloud sql databases describe "$SQL_DB_NAME" --instance="$SQL_INSTANCE" \
     --project="$PROJECT_ID" >/dev/null 2>&1; then
  warn "database $SQL_DB_NAME already exists"
else
  gcloud sql databases create "$SQL_DB_NAME" --instance="$SQL_INSTANCE" --project="$PROJECT_ID"
  ok "database $SQL_DB_NAME created"
fi

# Generate strong DB_PASS if not supplied. Always print so the caller can save it.
if [ -z "${DB_PASS:-}" ]; then
  DB_PASS=$(openssl rand -base64 30 | tr -d '/=+\n' | head -c 32)
  warn "DB_PASS was not set — generated: $DB_PASS  (SAVE THIS — you'll need it to run psql manually)"
fi

if gcloud sql users list --instance="$SQL_INSTANCE" --project="$PROJECT_ID" \
     --format='value(name)' | grep -qx "$SQL_DB_USER"; then
  gcloud sql users set-password "$SQL_DB_USER" --instance="$SQL_INSTANCE" \
    --project="$PROJECT_ID" --password="$DB_PASS"
  warn "user $SQL_DB_USER existed — password rotated"
else
  gcloud sql users create "$SQL_DB_USER" --instance="$SQL_INSTANCE" \
    --project="$PROJECT_ID" --password="$DB_PASS"
  ok "user $SQL_DB_USER created"
fi

# ─── 3. Cloud Storage ────────────────────────────────────────────────────────

log "Step 3: Cloud Storage bucket gs://$BUCKET_NAME"

if gcloud storage buckets describe "gs://$BUCKET_NAME" --project="$PROJECT_ID" \
     >/dev/null 2>&1; then
  warn "bucket gs://$BUCKET_NAME already exists"
else
  gcloud storage buckets create "gs://$BUCKET_NAME" \
    --project="$PROJECT_ID" \
    --location="$REGION" \
    --uniform-bucket-level-access \
    --default-storage-class=STANDARD
  ok "bucket gs://$BUCKET_NAME created"
fi

# Grant public read so `getPublicUrl()` URLs just work.
# (If you want private + Signed URLs only, remove this binding and the code
# keeps working — storage.js has getSignedUrl() ready.)
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" \
  --member='allUsers' \
  --role='roles/storage.objectViewer' \
  >/dev/null
ok "bucket: public objectViewer granted (remove this binding if you prefer signed URLs)"

# ─── 4. Service Account + IAM ────────────────────────────────────────────────

log "Step 4: Service Account $SA_EMAIL"

if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" \
     >/dev/null 2>&1; then
  warn "service account already exists"
else
  gcloud iam service-accounts create "$SA_NAME" \
    --project="$PROJECT_ID" \
    --display-name="ViralObj Bridge runtime"
  ok "service account created"
fi

log "Step 4b: granting IAM roles"

# Project-wide roles:
#   roles/cloudsql.client            — Cloud SQL Auth Proxy in Cloud Run
#   roles/secretmanager.secretAccessor — read GEMINI_AGENT_TOKEN + DB_PASS
#   roles/aiplatform.user            — Vertex AI Gemini + Veo (predict + LRO)
for role in roles/cloudsql.client roles/secretmanager.secretAccessor roles/aiplatform.user; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="$role" \
    --condition=None \
    >/dev/null
  ok "$role"
done

# Bucket-scoped role: Veo writes MP4s here via storageUri, and the bridge
# also reads/writes audio + image artifacts.
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role='roles/storage.objectAdmin' \
  >/dev/null
ok "roles/storage.objectAdmin on gs://$BUCKET_NAME"

# ─── 5. Secret Manager ───────────────────────────────────────────────────────

log "Step 5: Secret Manager"
# Only TWO secrets are stored: GEMINI_AGENT_TOKEN (HMAC for X-Gemini-Key)
# and DB_PASS (Postgres password). All AI services authenticate via ADC
# using the runtime service account roles granted above.

prompt_secret GEMINI_AGENT_TOKEN "GEMINI_AGENT_TOKEN (shared HMAC token for the Gemini Agent)"

ensure_secret GEMINI_AGENT_TOKEN "$GEMINI_AGENT_TOKEN"
ensure_secret DB_PASS            "$DB_PASS"

# ─── 6. Cloud Run deploy ─────────────────────────────────────────────────────

log "Step 6: Cloud Run deploy (from source — Cloud Build will pack the Dockerfile)"

gcloud run deploy "$SERVICE_NAME" \
  --project="$PROJECT_ID" \
  --source=. \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA_EMAIL" \
  --add-cloudsql-instances="$SQL_CONN" \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=20 \
  --min-instances=0 \
  --max-instances=5 \
  --timeout=300 \
  --set-env-vars="NODE_ENV=production,DB_HOST=/cloudsql/${SQL_CONN},DB_USER=${SQL_DB_USER},DB_NAME=${SQL_DB_NAME},DB_PORT=5432,DB_SSL=disable,GCS_BUCKET_NAME=${BUCKET_NAME},GCP_PROJECT_ID=${PROJECT_ID},VERTEX_LOCATION=${REGION},VERTEX_MODEL=gemini-1.5-pro,VEO_MODEL=veo-2.0-generate-001" \
  --set-secrets="GEMINI_AGENT_TOKEN=GEMINI_AGENT_TOKEN:latest,DB_PASS=DB_PASS:latest"

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --project="$PROJECT_ID" --region="$REGION" \
  --format='value(status.url)')
ok "service deployed: $SERVICE_URL"

# ─── 7. Manual step: apply schema ────────────────────────────────────────────

log "Step 7: apply database schema (MANUAL — one-time)"
cat <<EOF

The bridge is deployed, but the Postgres tables don't exist yet. Apply
database/init.sql using ONE of the options below:

  Option A — gcloud sql connect (easiest; Linux/Mac; macOS may need psql):
    gcloud sql connect $SQL_INSTANCE \\
      --project=$PROJECT_ID \\
      --user=$SQL_DB_USER \\
      --database=$SQL_DB_NAME \\
      < database/init.sql
    (When prompted for password, paste: $DB_PASS)

  Option B — Cloud SQL Auth Proxy + psql (works from any OS incl. Windows):
    # In a separate terminal:
    cloud-sql-proxy $SQL_CONN --port=5433 &
    # Then:
    PGPASSWORD='$DB_PASS' psql -h 127.0.0.1 -p 5433 \\
      -U $SQL_DB_USER -d $SQL_DB_NAME \\
      -f database/init.sql

  Option C — Import from GCS (no local psql needed):
    gsutil cp database/init.sql gs://$BUCKET_NAME/bootstrap/init.sql
    # Grant the Cloud SQL service account read access on the bucket, then:
    gcloud sql import sql $SQL_INSTANCE \\
      gs://$BUCKET_NAME/bootstrap/init.sql \\
      --project=$PROJECT_ID \\
      --database=$SQL_DB_NAME \\
      --user=$SQL_DB_USER

After the schema is in place, verify with:
  curl -H "X-Gemini-Key: \$GEMINI_AGENT_TOKEN" $SERVICE_URL/api/niches | head -c 200

EOF

# ─── 8. Next steps ───────────────────────────────────────────────────────────

log "All done."
cat <<EOF

Next:
  1. Apply database/init.sql  (Step 7 above)
  2. Smoke test (should return 18+ niches):
     curl -H "X-Gemini-Key: \$GEMINI_AGENT_TOKEN" $SERVICE_URL/api/niches

  3. Import into Gemini Agent Builder:
     - OpenAPI spec:  $SERVICE_URL/openapi.json  (or gcp-agent-manifest.json)
     - Grounding:     GEMINI_KNOWLEDGE.md
     - Auth header:   X-Gemini-Key  =  <your GEMINI_AGENT_TOKEN>

  4. To rotate the agent token later:
     openssl rand -hex 32 | gcloud secrets versions add GEMINI_AGENT_TOKEN --data-file=-
     gcloud run services update $SERVICE_NAME --region=$REGION
     # Then update the same value in the Gemini Agent Builder connector.

  5. AI services need NO API keys — Vertex AI Gemini and Veo authenticate
     via the runtime service account (roles/aiplatform.user).

EOF
