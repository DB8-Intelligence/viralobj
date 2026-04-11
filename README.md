# 🎭 ViralObj
**Talking Object Viral Reel Generator**  
viralobj.com · Bilingual PT-BR + EN · Claude Code MCP

---

## What is ViralObj?

ViralObj generates complete production packages for **Talking Object reels** — animated 3D objects (Pixar/Disney style) that speak in first person about everyday mistakes. The format that's viral right now on Instagram.

**From one command you get:**
- 🎬 Scene script with AI prompts (Midjourney / DALL-E)
- 🎙️ Voice scripts with timing markers (PT-BR + EN)
- 📝 Full caption timeline
- 📱 Post copy + hashtags (PT-BR + EN)
- 🔁 3 content variations
- 📄 Exportable HTML dashboard
- 🧠 Installable skill for Claude Code

---

## Install

```bash
bash bootstrap.sh
```

Requires: Node.js 18+, Claude Code, ffmpeg (optional, for video analysis)

---

## Usage in Claude Code

```
# List available niches
"Show me all niches in ViralObj"

# Generate a package
"Generate a talking object reel for [niche] with [objects] about [topic]"

# Generate with specific provider
"Generate a talking object reel for [niche] with [objects] about [topic] using provider openai"

# Analyze an existing video
"Analyze this video: /path/to/reel.mp4"

# Export HTML + skill
"Export the package to outputs/"
```

---

## 10 Niches

| Niche | Objects |
|-------|---------|
| 🏠 Casa | Água sanitária, celular, lixeira, esponja... |
| 🌿 Plantas | Adenium, jibóia, rosa, cacto... |
| 💰 Financeiro | Nota R$50, cartão, boleto, PIX... |
| 🍳 Culinária | Tomate chef, frigideira, azeite... |
| 🌱 Natureza | Plantas venenosas, cogumelos... |
| 💊 Saúde | Copo d'água, protetor solar, vitamina... |
| 🐾 Pets | Ração, vacina, antipulgas... |
| 🏋️ Fitness | Halter, whey, tênis, esteira... |
| 🍼 Maternidade | Fralda, mamadeira, berço... |
| 🧘 Saúde Mental | Celular (dependência), alarme, café... |

---

## MCP Tools

| Tool | Description |
|------|-------------|
| `analyze_video` | Extract frames + detect Talking Objects |
| `generate_package` | Full bilingual production package |
| `export_artifacts` | HTML dashboard + SKILL.md |
| `list_niches` | Available niches + object libraries |

Provider routing for `generate_package`:
- `provider=auto` (default): follows `VIRALOBJ_PROVIDER_ORDER` fallback
- `provider=anthropic|openai|gemini`: forces a single provider

---

## Project Structure

```
viralobj/
├── CLAUDE.md             ← Claude Code instructions
├── bootstrap.sh          ← one-command install
├── package.json
├── README.md
├── mcp/
│   ├── index.js          ← MCP server (stdio)
│   └── tools/
│       ├── analyze.js    ← video analysis (ffmpeg + Claude Vision)
│       ├── generate.js   ← package generation (Claude API)
│       ├── export.js     ← HTML dashboard + SKILL.md export
│       └── niches.js     ← 10-niche library (60+ objects)
├── skills/               ← extracted skills from NexoOmnix
├── training-data/
│   ├── dataset.json      ← validated patterns
│   ├── reel-references/  ← visual style guide
│   └── references/       ← 9 reference modules
├── webapp/api/           ← TypeScript implementations (future)
├── docs/                 ← architecture docs
└── outputs/              ← generated HTML + skills
```

---

## NexoOmnix

ViralObj is a focused MVP extracted from [NexoOmnix](https://github.com/DB8-Intelligence/nexoomnix).
The full platform will absorb ViralObj as a module later — keep them independent.

**Extracted from NexoOmnix:**
- 9 reference modules (profile analysis, engagement, viral strategy, scripts, talking objects, calendar)
- Visual style guide with viral metrics from @objetosdodia (1.7M views) and @dinheirofalante (3M views)
- Instagram viral engine + reel content generator skills
- Training dataset with validated patterns

---

*viralobj.com — Talking Objects that go viral 🎭*
