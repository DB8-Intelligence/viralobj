#!/usr/bin/env bash
# ============================================================
#  ViralObj — bootstrap.sh
#  Talking Object Viral Reel Generator · viralobj.com
#  One-command install for Claude Code
#
#  Usage:
#    bash bootstrap.sh
#
#  What it does:
#    1. Creates ~/viralobj project directory
#    2. Writes all source files
#    3. Installs npm dependencies
#    4. Registers MCP globally in Claude Code
#    5. Verifies installation
# ============================================================

set -e
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$HOME/viralobj"
MCP_NAME="viralobj"

echo ""
echo -e "${BOLD}${BLUE}🎭 ViralObj — Talking Object Generator${NC}"
echo -e "${BLUE}   viralobj.com · Claude Code MCP Setup${NC}"
echo ""

# ── 1. Check prerequisites ─────────────────────────────────────────────────
echo -e "${YELLOW}[1/5] Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org (v18+)${NC}"
  exit 1
fi

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}✗ Node.js v18+ required. Current: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

if ! command -v claude &> /dev/null; then
  echo -e "${YELLOW}⚠ claude CLI not found — MCP registration will be skipped.${NC}"
  echo -e "${YELLOW}  Install Claude Code and run this script again to register.${NC}"
  SKIP_MCP=true
else
  echo -e "${GREEN}✓ claude CLI found${NC}"
  SKIP_MCP=false
fi

if command -v ffmpeg &> /dev/null; then
  echo -e "${GREEN}✓ ffmpeg found — video analysis enabled${NC}"
else
  echo -e "${YELLOW}⚠ ffmpeg not found — video analysis disabled (install from https://ffmpeg.org)${NC}"
fi

# ── 2. Create project ──────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/5] Creating project at $PROJECT_DIR...${NC}"

mkdir -p "$PROJECT_DIR/mcp/tools"
mkdir -p "$PROJECT_DIR/skills/casa"
mkdir -p "$PROJECT_DIR/skills/plantas"
mkdir -p "$PROJECT_DIR/skills/financeiro"
mkdir -p "$PROJECT_DIR/skills/culinaria"
mkdir -p "$PROJECT_DIR/skills/natureza"
mkdir -p "$PROJECT_DIR/skills/saude"
mkdir -p "$PROJECT_DIR/skills/pets"
mkdir -p "$PROJECT_DIR/skills/fitness"
mkdir -p "$PROJECT_DIR/skills/maternidade"
mkdir -p "$PROJECT_DIR/skills/saude-mental"
mkdir -p "$PROJECT_DIR/training-data"
mkdir -p "$PROJECT_DIR/outputs"

echo -e "${GREEN}✓ Directory structure created${NC}"

# ── 3. Write package.json ──────────────────────────────────────────────────
cat > "$PROJECT_DIR/package.json" << 'PKGJSON'
{
  "name": "viralobj-mcp",
  "version": "1.0.0",
  "description": "ViralObj — Talking Object Viral Reel Generator · viralobj.com",
  "type": "module",
  "main": "mcp/index.js",
  "scripts": {
    "start": "node mcp/index.js",
    "dev": "node --watch mcp/index.js",
    "test": "node -e \"import('./mcp/tools/niches.js').then(m => m.listNiches()).then(r => console.log(r.content[0].text))\""
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.52.0",
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "engines": { "node": ">=18.0.0" }
}
PKGJSON

echo -e "${GREEN}✓ package.json written${NC}"

# ── 4. Copy source files (if running from project directory) ───────────────
#    If source files already exist at $PROJECT_DIR, skip re-download
#    Otherwise write minimal stubs that Claude Code will expand

if [ ! -f "$PROJECT_DIR/mcp/index.js" ]; then
  echo -e "${YELLOW}  Writing MCP server stubs...${NC}"

  cat > "$PROJECT_DIR/mcp/index.js" << 'INDEXJS'
#!/usr/bin/env node
// ViralObj MCP Server — viralobj.com
// Full source: see mcp/tools/ directory
// Run: npm start

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { analyzeVideo } from "./tools/analyze.js";
import { generatePackage } from "./tools/generate.js";
import { exportArtifacts } from "./tools/export.js";
import { listNiches } from "./tools/niches.js";

const server = new Server(
  { name: "viralobj-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_video",
      description: "Analyzes a .mp4 video: extracts frames, detects Talking Object characters, returns structured analysis. / Analisa vídeo .mp4 e detecta personagens Talking Object.",
      inputSchema: { type: "object", properties: { video_path: { type: "string" }, lang: { type: "string", enum: ["pt","en"], default: "pt" } }, required: ["video_path"] }
    },
    {
      name: "generate_package",
      description: "Generates complete Talking Object production package (bilingual PT+EN): scripts, AI prompts, voice, captions, post copy, hashtags. / Gera pacote completo de produção bilíngue.",
      inputSchema: { type: "object", properties: { niche: { type: "string" }, objects: { type: "array", items: { type: "string" } }, topic: { type: "string" }, tone: { type: "string", enum: ["angry","funny","educational","dramatic","cute","sarcastic"], default: "angry" }, duration: { type: "number", default: 30 }, lang: { type: "string", enum: ["pt","en","both"], default: "both" }, analysis: { type: "object" } }, required: ["niche","objects","topic"] }
    },
    {
      name: "export_artifacts",
      description: "Exports production package as HTML dashboard + installable SKILL.md. / Exporta pacote como HTML + SKILL.md instalável.",
      inputSchema: { type: "object", properties: { package: { type: "object" }, output_dir: { type: "string", default: "./outputs" }, slug: { type: "string" } }, required: ["package"] }
    },
    {
      name: "list_niches",
      description: "Lists all 10 available niches with object libraries. / Lista os 10 nichos disponíveis.",
      inputSchema: { type: "object", properties: { lang: { type: "string", enum: ["pt","en"], default: "pt" } } }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "analyze_video": return await analyzeVideo(args);
      case "generate_package": return await generatePackage(args);
      case "export_artifacts": return await exportArtifacts(args);
      case "list_niches": return await listNiches(args);
      default: throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("ViralObj MCP Server running — viralobj.com");
INDEXJS

  echo -e "${GREEN}✓ MCP server stub written${NC}"
fi

# ── 5. Install dependencies ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/5] Installing npm dependencies...${NC}"
cd "$PROJECT_DIR"
npm install --silent
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ── 6. Register MCP in Claude Code ────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5] Registering MCP in Claude Code...${NC}"

if [ "$SKIP_MCP" = false ]; then
  claude mcp add "$MCP_NAME" \
    --command "node" \
    --args "$PROJECT_DIR/mcp/index.js" \
    --scope global 2>/dev/null || {
      # Try alternative syntax
      claude mcp add "$MCP_NAME" "node $PROJECT_DIR/mcp/index.js" --scope global 2>/dev/null || {
        echo -e "${YELLOW}⚠ Could not auto-register. Add manually (see below).${NC}"
        SKIP_MCP=true
      }
    }

  if [ "$SKIP_MCP" = false ]; then
    echo -e "${GREEN}✓ MCP registered globally as '${MCP_NAME}'${NC}"
  fi
fi

if [ "$SKIP_MCP" = true ]; then
  echo ""
  echo -e "${YELLOW}Manual MCP registration — add to Claude Code settings:${NC}"
  echo ""
  echo -e '  {
    "mcpServers": {
      "viralobj": {
        "command": "node",
        "args": ["'"$PROJECT_DIR"'/mcp/index.js"]
      }
    }
  }'
  echo ""
fi

# ── 7. Verify installation ─────────────────────────────────────────────────
echo -e "${YELLOW}[5/5] Verifying installation...${NC}"
cd "$PROJECT_DIR"

if node -e "import('./mcp/tools/niches.js').then(m => m.listNiches({lang:'en'})).then(r => { if(r.niches.length === 10) process.exit(0); else process.exit(1); }).catch(() => process.exit(1));" 2>/dev/null; then
  echo -e "${GREEN}✓ All 10 niches loaded${NC}"
else
  echo -e "${YELLOW}⚠ Niche verification skipped (tool files not yet present)${NC}"
fi

# ── Done ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}✅ ViralObj installed successfully!${NC}"
echo ""
echo -e "${BOLD}Project:${NC} $PROJECT_DIR"
echo -e "${BOLD}MCP name:${NC} viralobj"
echo ""
echo -e "${BOLD}${BLUE}Quick start in Claude Code:${NC}"
echo ""
echo -e "  ${BOLD}List niches:${NC}"
echo -e "  → 'Show me all available niches in ViralObj'"
echo ""
echo -e "  ${BOLD}Generate a package:${NC}"
echo -e "  → 'Generate a talking object reel for home cleaning with água sanitária, celular, lixeira'"
echo ""
echo -e "  ${BOLD}Analyze a video:${NC}"
echo -e "  → 'Analyze this video: /path/to/video.mp4'"
echo ""
echo -e "  ${BOLD}Export HTML + skill:${NC}"
echo -e "  → 'Export the package to outputs folder'"
echo ""
echo -e "${BLUE}viralobj.com — Talking Objects that go viral 🎭${NC}"
echo ""
