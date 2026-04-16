#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WEBAPP_DIR="$ROOT_DIR/webapp"

echo "═══════════════════════════════════════════════"
echo "  ViralObj — Deploy to Vercel"
echo "═══════════════════════════════════════════════"

# 1. Check Vercel CLI
echo ""
echo "→ Verificando Vercel CLI..."
if ! command -v vercel &>/dev/null; then
  echo "  Vercel CLI não encontrado. Instalando..."
  npm install -g vercel
fi
echo "  Vercel CLI: $(vercel --version)"

# 2. Pre-deploy build check
echo ""
echo "→ Build de verificação..."
cd "$WEBAPP_DIR"
npm run build

# 3. Deploy
echo ""
echo "→ Fazendo deploy..."
cd "$WEBAPP_DIR"
vercel --prod --yes

echo ""
echo "═══════════════════════════════════════════════"
echo "  Deploy concluído!"
echo ""
echo "  Verifique:"
echo "    - viralobj.vercel.app"
echo "    - Env vars no dashboard do Vercel"
echo "    - Migrations aplicadas no Supabase"
echo "═══════════════════════════════════════════════"
