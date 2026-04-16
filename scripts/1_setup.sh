#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
WEBAPP_DIR="$ROOT_DIR/webapp"

echo "═══════════════════════════════════════════════"
echo "  ViralObj — Setup"
echo "═══════════════════════════════════════════════"

# 1. Check Node version
echo ""
echo "→ Verificando Node.js..."
NODE_VERSION=$(node -v 2>/dev/null || echo "not found")
echo "  Node: $NODE_VERSION"
if [[ "$NODE_VERSION" == "not found" ]]; then
  echo "  ERRO: Node.js não encontrado. Instale Node 20+."
  exit 1
fi

# 2. Check .env.local
echo ""
echo "→ Verificando .env.local..."
if [[ ! -f "$WEBAPP_DIR/.env.local" ]]; then
  echo "  .env.local não encontrado."
  if [[ -f "$WEBAPP_DIR/.env.local.example" ]]; then
    echo "  Copiando .env.local.example → .env.local"
    cp "$WEBAPP_DIR/.env.local.example" "$WEBAPP_DIR/.env.local"
    echo "  ATENÇÃO: edite webapp/.env.local com suas API keys antes de rodar."
  else
    echo "  ERRO: nem .env.local nem .env.local.example encontrados."
    exit 1
  fi
else
  echo "  .env.local encontrado."
fi

# 3. Install dependencies
echo ""
echo "→ Instalando dependências (webapp)..."
cd "$WEBAPP_DIR"
npm install

# 4. Check zod dependency (needed by generate-job route)
if ! npm ls zod >/dev/null 2>&1; then
  echo ""
  echo "→ Instalando zod (validação de input)..."
  npm install zod
fi

# 5. Build check
echo ""
echo "→ Verificando build..."
npm run build

echo ""
echo "═══════════════════════════════════════════════"
echo "  Setup concluído!"
echo ""
echo "  Próximos passos:"
echo "    1. Edite webapp/.env.local com suas keys"
echo "    2. Aplique as migrations no Supabase"
echo "    3. Execute: cd webapp && npm run dev"
echo "═══════════════════════════════════════════════"
