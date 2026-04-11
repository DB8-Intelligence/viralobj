# ViralObj — Claude Code Instructions
**viralobj.com** · Talking Object Viral Reel Generator

## Project Overview
ViralObj generates viral Talking Object reels for Instagram.
Animated 3D Pixar-style objects speak in first person about everyday mistakes.
Bilingual output: PT-BR + English.
Full pipeline: download → analyze → reverse-engineer → generate → video → post.

## Architecture

```
reel-downloader v2.0 (entry point)
  ↓
  ├── viralobj-reverse-engineer   (análise + blueprint)
  │     ├── 01-frame-analysis
  │     ├── 02-character-blueprint
  │     ├── 03-production-blueprint
  │     ├── 04-full-prompt-output
  │     └── 05-instagram-post
  │
  ├── MCP viralobj (6 tools)
  │     ├── analyze_video         (ffmpeg + Claude Vision)
  │     ├── generate_package      (Claude API → bilingual PT+EN)
  │     ├── generate_video        (Fal.ai: FLUX.2 Pro → MiniMax TTS → VEED Fabric)
  │     ├── export_artifacts      (HTML dashboard + SKILL.md)
  │     ├── post_to_instagram     (Graph API v21.0)
  │     └── list_niches           (10 niches, 72 objects)
  │
  └── dataset.json               (validated patterns + training)
```

## MCP Tools (6 total)
- `analyze_video` — analyze .mp4 files (ffmpeg + Claude Vision)
- `generate_package` — generate bilingual PT+EN production package
- `generate_video` — full video pipeline via Fal.ai (~$2-4/reel)
- `export_artifacts` — export HTML dashboard + installable SKILL.md
- `post_to_instagram` — publish via Graph API (immediate or scheduled)
- `list_niches` — show all 10 niches with 72 object libraries

## Skills
- `reel-downloader` v2.0 — pipeline orchestrator (download → post)
- `viralobj-reverse-engineer` — 5 modules for frame-by-frame reverse engineering

## 10 Niches (72 objects)
casa, plantas, financeiro, culinaria, natureza, saude, pets, fitness, maternidade, saude-mental

## 5 Body Types
- MULTI-STUB — stub arms, no legs (casa, plantas)
- SINGLE-FULL — full body with legs (cravo, mapa)
- DRESSED-CHAR — human body, object head (financeiro)
- MAP-DOC — document with legs (orlando)
- RECIPE-MAGIC — tutorial + particles (culinaria)

## Quick Commands
- "List all niches" → `list_niches`
- "Generate reel for [niche] with [objects] about [topic]" → `generate_package`
- "Generate video from package" → `generate_video`
- "Analyze video at [path]" → `analyze_video`
- "Export package" → `export_artifacts`
- "Post to Instagram" → `post_to_instagram`
- "Download and analyze [URL]" → reel-downloader pipeline
- "Reverse-engineer this video" → viralobj-reverse-engineer

## Project Structure
```
mcp/
  index.js                MCP server (stdio, 6 tools)
  tools/
    analyze.js            Video analysis (ffmpeg + Claude Vision)
    generate.js           Package generation (Claude API)
    generate_video.js     Video pipeline (Fal.ai)
    export.js             HTML dashboard + SKILL.md
    post_instagram.js     Instagram Graph API posting
    niches.js             10 niches, 72 objects
skills/
  reel-downloader.md      v2.0 pipeline orchestrator
  viralobj-reverse-engineer/
    SKILL.md              Reverse engineer skill
    references/01-05      5 analysis modules
  instagram-viral-engine.md
training-data/
  dataset.json            v2.0 validated patterns + pipeline config
  reel-references/        Visual style guide (GUIA-DE-ESTILOS.md)
  references/01-09        9 reference modules from NexoOmnix
outputs/                  Generated HTML, skills, videos, packages
```

## Env Vars (.env)
- `ANTHROPIC_API_KEY` — for generate_package (from Railway db8-agent)
- `OPENAI_API_KEY` — optional fallback/primary for generate_package
- `GEMINI_API_KEY` — optional fallback/primary for generate_package
- `VIRALOBJ_PROVIDER_ORDER` — optional provider order, e.g. `anthropic,openai,gemini`
- `OPENAI_MODEL` — optional override (default: `gpt-4.1-mini`)
- `GEMINI_MODEL` — optional override (default: `gemini-2.5-flash`)
- `FAL_KEY` — for generate_video (from Railway db8-agent)
- `INSTAGRAM_ACCESS_TOKEN` — for post_to_instagram (TODO: add to Railway)
- `INSTAGRAM_ACCOUNT_ID` — for post_to_instagram (TODO: add to Railway)

### Provider Routing (`generate_package`)
- Default behavior: `provider=auto` (tries providers in `VIRALOBJ_PROVIDER_ORDER`)
- Force one provider per call: `provider=anthropic|openai|gemini`
- Example: `generate_package` with `provider: "openai"` to reduce cost on drafts

## Production Stack (automated)
1. FLUX.2 Pro (via Fal.ai) — character image 9:16
2. MiniMax TTS (via Fal.ai) — voice with emotion per character
3. VEED Fabric (via Fal.ai) — lip sync image + audio → video
4. CapCut (manual) — timeline assembly + captions + music
5. Instagram Graph API — auto-post + schedule + Stories

## Relationship to NexoOmnix
ViralObj is a focused MVP extracted from NexoOmnix (github.com/DB8-Intelligence/nexoomnix).
NexoOmnix (full platform) will absorb ViralObj as a module later.
Do NOT merge these projects — keep them independent.

## Output Directory
All generated HTML dashboards, skills, videos go to `./outputs/`
