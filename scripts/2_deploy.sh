#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WEBAPP_DIR="$ROOT_DIR/webapp"

PROJECT="viralreel-ai-493701"
REGION="us-central1"
BRIDGE_SVC="viralobj-bridge"
DASHBOARD_SVC="viralobj-dashboard"

echo "═══════════════════════════════════════════════"
echo "  ViralObj — Deploy to Google Cloud Run"
echo "  Project: $PROJECT  Region: $REGION"
echo "═══════════════════════════════════════════════"

# Deploy só com aprovação humana explícita (Sprint 26 gate).
if [ "${APROVO_DEPLOY:-}" != "true" ]; then
  echo ""
  echo "  Deploy bloqueado: defina APROVO_DEPLOY=true para autorizar."
  echo "  Veja docs/LOCAL_DEV_AND_DEPLOY_CHECKLIST.md (seção 1.1)."
  exit 1
fi

# 1. Check gcloud CLI
echo ""
echo "→ Verificando gcloud CLI..."
if ! command -v gcloud &>/dev/null; then
  echo "  gcloud CLI não encontrado. Instale via https://cloud.google.com/sdk/docs/install"
  exit 1
fi
echo "  gcloud: $(gcloud --version | head -1)"

# 2. Pre-deploy build check (webapp)
echo ""
echo "→ Build de verificação (webapp)..."
cd "$WEBAPP_DIR"
npm run build
cd "$ROOT_DIR"

# 3. Deploy bridge (Express API → api.viralobj.app)
echo ""
echo "→ Deploy bridge → Cloud Run ($BRIDGE_SVC)..."
gcloud run deploy "$BRIDGE_SVC" \
  --project="$PROJECT" \
  --source="$ROOT_DIR" \
  --region="$REGION" \
  --allow-unauthenticated \
  --quiet

# 4. Deploy dashboard (Next.js → www.viralobj.app)
echo ""
echo "→ Deploy dashboard → Cloud Run ($DASHBOARD_SVC)..."
gcloud run deploy "$DASHBOARD_SVC" \
  --project="$PROJECT" \
  --source="$WEBAPP_DIR" \
  --region="$REGION" \
  --allow-unauthenticated \
  --quiet

echo ""
echo "═══════════════════════════════════════════════"
echo "  Deploy concluído!"
echo ""
echo "  URLs oficiais:"
echo "    - Landing:    https://viralobj.com"
echo "    - Dashboard:  https://www.viralobj.app"
echo "    - API/Bridge: https://api.viralobj.app"
echo ""
echo "  Sanity:"
echo "    curl -I https://viralobj.com"
echo "    curl -I https://www.viralobj.app/login"
echo "    curl    https://api.viralobj.app/health"
echo "═══════════════════════════════════════════════"
