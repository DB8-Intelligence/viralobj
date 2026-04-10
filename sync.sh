#!/bin/bash
# ViralObj — sync.sh
# Aplica arquivos da pasta downloads/ para os destinos corretos no projeto.
# Uso: bash sync.sh
# Ou com mensagem de commit custom: bash sync.sh "feat: minha mensagem"

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
DOWNLOADS="$REPO_ROOT/downloads"

echo ""
echo "🔄 ViralObj Sync — downloads/ → projeto"
echo "   Root: $REPO_ROOT"
echo "   Downloads: $DOWNLOADS"
echo ""

# —— Mapa: arquivo em downloads/ → destino no projeto ————————————————————————

declare -A MAP=(
  # MCP core
  ["paths.js"]="mcp/paths.js"
  ["index.js"]="mcp/index.js"

  # MCP tools
  ["analyze.js"]="mcp/tools/analyze.js"
  ["download_reel.js"]="mcp/tools/download_reel.js"
  ["export.js"]="mcp/tools/export.js"
  ["generate.js"]="mcp/tools/generate.js"
  ["generate_video.js"]="mcp/tools/generate_video.js"
  ["niches.js"]="mcp/tools/niches.js"

  # Training data
  ["dataset.json"]="training-data/dataset.json"

  # Skills
  ["viralobj-studio-SKILL.md"]="skills/viralobj-studio/SKILL.md"
  ["reel-downloader-v2-SKILL.md"]="skills/reel-downloader/SKILL.md"
)

# —— Copiar arquivos encontrados ——————————————————————————————————————————————

COPIED=0
SKIPPED=0

for FILE in "${!MAP[@]}"; do
  SRC="$DOWNLOADS/$FILE"
  DEST="$REPO_ROOT/${MAP[$FILE]}"

  if [ -f "$SRC" ]; then
    mkdir -p "$(dirname "$DEST")"
    cp "$SRC" "$DEST"
    echo "  ✅ $FILE → ${MAP[$FILE]}"
    COPIED=$((COPIED + 1))
  else
    echo "  ⏭  $FILE (não encontrado, pulando)"
    SKIPPED=$((SKIPPED + 1))
  fi
done

echo ""
echo "  Copiados: $COPIED | Pulados: $SKIPPED"
echo ""

# —— Git commit ———————————————————————————————————————————————————————————————

if [ $COPIED -eq 0 ]; then
  echo "⚠️  Nenhum arquivo copiado. Coloque os arquivos em $DOWNLOADS/ e rode novamente."
  exit 0
fi

cd "$REPO_ROOT"

# Verificar se há mudanças
if git diff --quiet && git diff --staged --quiet; then
  echo "ℹ️  Sem mudanças para commitar."
  exit 0
fi

# Mensagem de commit
COMMIT_MSG="${1:-"sync: apply updates from downloads/

Arquivos aplicados: $COPIED
Gerado por: Claude.ai ViralObj Studio
Data: $(date '+%Y-%m-%d %H:%M')"}"

git add .
git status --short
echo ""
git commit -m "$COMMIT_MSG"
git push

echo ""
echo "🚀 Sync completo! $COPIED arquivo(s) aplicado(s) e publicado(s)."
echo ""
