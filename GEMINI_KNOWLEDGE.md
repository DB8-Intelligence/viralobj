# ViralObj — Grounding Document for Gemini Enterprise

> This file is the authoritative brief uploaded to Gemini Agent's **Grounding** so the LLM understands how ViralObj works before invoking the bridge API. Keep it concise: Gemini's context window is shared with user conversation.

---

## Product in one line

ViralObj generates **Talking Object** viral reels — animated 3D objects (Pixar/Disney style) that speak in first person about everyday mistakes. Output: complete production package (script, AI prompts, voice, captions, hashtags, variations) bilingual PT-BR + EN.

---

## What the agent can do via the Bridge API

Base URL: configured in Gemini Agent via OpenAPI spec at `GET /openapi.json`.
Auth: every request must carry header `X-Gemini-Key: <GEMINI_AGENT_TOKEN>`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/niches` | List the 18 supported niches with sample objects. **Use this first** whenever the user hasn't specified a niche, or to validate a niche before generating. |
| `POST` | `/api/generate-reel` | Generate a full production package. 5–20s latency depending on LLM provider. |

Both routes return `{ success: boolean, ... }`. On failure, `success: false` + `error: string`.

---

## How to pick niche, objects, tone

### 1. Niche (`niche` field)
18 niches available. Fetch live list via `GET /api/niches`. Examples:
`casa`, `plantas`, `financeiro`, `culinaria`, `natureza`, `saude`, `pets`, `fitness`, `maternidade`, `saude-mental`, `skincare-natural`, `espiritualidade-rituais`, `saude-feminina`, `imoveis`, `viagem`, `chas-funcionais`, `saude-receitas`, `gastronomia`.

### 2. Objects (`objects` field — array)
Pick 2–5 objects that **belong to the niche**. The niche response includes `sample_objects` — prefer those. If the user names a custom object, include it but keep it thematically coherent.

**Do NOT** mix objects across niches. A reel is about one niche at a time.

### 3. Tone (`tone` field)
Each niche has a `tone_default`. Use it unless the user asks for something else. Valid values:
- `angry` — frustrated/indignant (works best for `casa`, `plantas`, `financeiro`)
- `dramatic` — serious, emotionally charged
- `funny` — light humor (works for `culinaria`, `pets`)
- `educational` — calm instructor (works for `saude`, `natureza`, `skincare-natural`)
- `sarcastic` — dry wit
- `motivational` — uplifting call-to-action

---

## Visual / production patterns (validated from 47 real viral reels)

These come from `training-data/dataset.json`. Gemini doesn't need to apply them — the `/api/generate-reel` endpoint bakes them into the LLM prompt. Listed here so the agent can explain the output to the user.

- **Format A (MULTI-STUB)**: Multiple objects with stub arms, no legs, human doing the mistake in the background. Used by `@coisadecasa.ia`. Best for casa/plantas/financeiro.
- **Format B (SINGLE-FULL)**: One character with full body (torso + legs), walks and demonstrates. Best for tutorials, anatomy (saude), ingredient reels (culinaria).
- **Format C (DRESSED-CHAR)**: Object as head on a dressed human body (chef, doctor, professional). Includes animal-chef variants.
- **Expression arc "FUR-3"** (most common — 75% frequency): angry → furious → resigned. Drives retention.
- **Caption style "alpha"**: hard-cut bold yellow text, single line, centered bottom.
- **Duration sweet-spot**: 25–35 seconds (most viral references).

---

## Output schema (what `/api/generate-reel` returns in `package`)

```json
{
  "meta": { "niche", "topic_pt", "topic_en", "tone", "duration", "format" },
  "characters": [
    {
      "id", "emoji", "name_pt", "name_en", "personality",
      "expression_arc": ["angry", "furious", "resigned"],
      "voice_script_pt", "voice_script_en",
      "ai_prompt_midjourney",
      "timestamp_start", "timestamp_end"
    }
  ],
  "captions": [ { "time", "text", "character", "style" } ],
  "post_copy": {
    "caption_pt", "caption_en",
    "hashtags_pt": ["...", "..."],
    "hashtags_en": ["...", "..."]
  },
  "variations": [
    { "title_pt", "hook_pt", "objects": [...], "description_pt", "tone" }
  ]
}
```

The agent should **quote `voice_script_pt` / `hashtags_pt`** verbatim to the user, not paraphrase.

---

## Error handling guidance

- **`401 Unauthorized`** → bridge misconfigured; inform user the operator should check `GEMINI_AGENT_TOKEN`.
- **`400`** → invalid input. Common causes: empty `objects` array, missing `topic`, niche key not in the list from `/api/niches`.
- **`500`** with message `"All LLM providers failed"` → rare; suggest retry in 30s. Bridge tries Anthropic → OpenAI → Gemini in that order by default.

---

## Good user flow (example)

1. User: *"Quero um reel sobre culinária brasileira."*
2. Agent calls `GET /api/niches?lang=pt` → sees `culinaria` exists with sample objects `["Feijão", "Arroz", "Cebola"]` and `tone_default: "funny"`.
3. Agent asks user: *"Quais objetos/ingredientes você quer como personagens? (sugestões: feijão, arroz, cebola)"*
4. User: *"feijão, arroz e panela, falando sobre os erros ao cozinhar feijão."*
5. Agent calls `POST /api/generate-reel` with:
   ```json
   {
     "niche": "culinaria",
     "objects": ["Feijão", "Arroz", "Panela"],
     "topic": "Erros comuns ao cozinhar feijão",
     "tone": "funny",
     "duration": 30,
     "lang": "both"
   }
   ```
6. Agent presents the `package.characters[].voice_script_pt` and `package.post_copy.caption_pt` to the user.

---

## Out of scope for the bridge (don't attempt)

The bridge only does `listNiches` and `generatePackage`. These tools exist in `mcp/tools/` but are **not exposed** via REST (yet): `analyzeVideo`, `generateVideo` (Fal.ai render), `exportArtifacts`, `postToInstagram`, `downloadReel`. Do not invent endpoints for them.

---

## Technical contact

Repo: `https://github.com/DB8-Intelligence/viralobj`
Bridge deploy: Railway (env `GEMINI_AGENT_TOKEN` required)
Main web app: `viralobj.com`
