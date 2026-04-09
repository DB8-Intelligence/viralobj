# ViralObj — Claude Code Instructions
**viralobj.com** · Talking Object Viral Reel Generator

## Project Overview
ViralObj generates viral Talking Object reels for Instagram.
Animated 3D Pixar-style objects speak in first person about everyday mistakes.
Bilingual output: PT-BR + English.

## MCP Tools Available
- `analyze_video` — analyze .mp4 files (ffmpeg + Claude Vision)
- `generate_package` — generate bilingual PT+EN production package
- `export_artifacts` — export HTML dashboard + installable SKILL.md
- `list_niches` — show all 10 niches with object libraries

## 10 Niches
casa, plantas, financeiro, culinaria, natureza, saude, pets, fitness, maternidade, saude-mental

## Quick Commands
- "List all niches" → calls `list_niches`
- "Generate reel for [niche] with [objects] about [topic]" → calls `generate_package`
- "Analyze video at [path]" → calls `analyze_video`
- "Export package" → calls `export_artifacts`

## Project Structure
```
mcp/                    MCP server + tools
  index.js              Server entry point (stdio transport)
  tools/
    analyze.js          Video analysis (ffmpeg + Claude Vision)
    generate.js         Package generation (Claude API)
    export.js           HTML dashboard + SKILL.md export
    niches.js           10 niches, 60+ objects with personalities
skills/                 Extracted skills from NexoOmnix
training-data/          Validated datasets + style guides + references
  reel-references/      Visual style guide (GUIA-DE-ESTILOS.md)
  references/           9 reference modules (01-09)
  dataset.json          Training patterns
outputs/                Generated HTML dashboards + skills
webapp/api/             TypeScript implementations (future web app)
docs/                   Architecture and session docs
```

## Relationship to NexoOmnix
ViralObj is a focused MVP extracted from NexoOmnix (github.com/DB8-Intelligence/nexoomnix).
NexoOmnix (full platform) will absorb ViralObj as a module later.
Do NOT merge these projects — keep them independent.

## Talking Object Styles (from training data)
1. **Photorealistic + Expressive Face** — real texture, embedded face
2. **Hyperrealistic Miniature** — action figure in real scene
3. **Pixar 3D Animated** — full rendered scene, Disney-quality
4. **Pixar 3D Action + Real BG** — @objetosdodia style (1.7M views)
5. **Pixar Antagonist + Real BG** — @dinheirofalante style (3M views)

## Production Stack
1. Midjourney v6 / DALL-E 3 — character image (9:16)
2. ElevenLabs — voice generation (PT-BR)
3. HeyGen / Hedra — lip sync
4. CapCut — timeline assembly + captions

## Output Directory
All generated HTML dashboards and skills go to `./outputs/`
