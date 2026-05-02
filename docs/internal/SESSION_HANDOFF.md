# ViralObj — Session Handoff (2026-04-21)

## O Que É o ViralObj
SaaS que gera reels virais com "Talking Objects" (objetos 3D estilo Pixar que falam em primeira pessoa). Pipeline completo: tema → imagens → scripts → áudio → vídeo com voz/lip-sync → música.

## Estado Atual do Projeto

### Branch: `main` (muitas mudanças NÃO commitadas)
- ~50 arquivos modificados/novos sem commit
- Último commit: `624aa4e` — fix status spinner

### O Que Já Foi Implementado (mas NÃO commitado)

1. **Landing Page v2** — novo design com Hero, Pricing, FAQ, etc. Componentes em `webapp/components/landing/`
2. **Wizard Multi-Step** (`webapp/app/app/generate/page.tsx`) — 6 etapas:
   - Step 1: Input (tema/nicho/objetos)
   - Step 2: Aprovação de imagens geradas
   - Step 3: Edição de scripts por personagem
   - Step 4: Aprovação de áudios
   - Step 5: Vídeos gerados (Veo 3)
   - Step 6: Música de fundo (não implementado)
3. **API routes separadas:**
   - `webapp/app/api/app/generate-audio/route.ts` — TTS via ElevenLabs
   - `webapp/app/api/app/generate-video/route.ts` — Veo 3 Fast via Fal.ai
4. **Video Render Service** (`webapp/lib/viral-objects/video-render.service.ts`) — usa `fal-ai/veo3/fast/image-to-video` com `generate_audio: true` (gera vídeo + voz + efeitos em uma chamada)
5. **JobOrchestrator** (`webapp/lib/jobs/orchestrator.ts`) — adicionado `runUntilStep()` para wizard parcial
6. **GenerationDetail.tsx** — visualização de histórico com vídeos
7. **Supabase migration** — colunas: `pipeline_step`, `free_input`, `approved_images`, `edited_scripts`, `music_config`, `scene_videos`

### Pricing Discutido (NÃO implementado no código ainda)
- Low-ticket packs: 3 vídeos R$147, 5 vídeos R$239, 10 vídeos R$497
- Código atual tem: Starter R$97 (5 gen), Pro R$197 (15 gen), Pro+ R$497 (40 gen)

---

## BUG CRÍTICO ATUAL → GenerationDetail.tsx

**Problema:** Erro de runtime ao visualizar vídeos no histórico. Null safety issues.

**O que já foi corrigido:**
```typescript
// Linha ~662 — audio.objectId era undefined
// Antes: audio.objectId?.includes(c.id ?? "") || audio.sceneId.includes(c.id ?? "")
// Depois: null checks com guard clauses
```

**O que AINDA precisa corrigir:**
- Linha ~563: `img.sceneId.includes(c.id ?? "")` — mesmo padrão, pode crashar se `c.id` undefined
- Seção de `sceneVideos` — campos podem ser undefined
- **Padrão geral:** QUALQUER `.includes()` no arquivo que recebe `c.id`, `audio.objectId`, `img.sceneId` etc. precisa de null guard

**Como resolver:** Ler o arquivo inteiro, buscar TODOS os `.includes(` e adicionar null checks.

---

## Pipeline de Vídeo (Arquitetura)

```
Wizard Step 1 → /api/app/generate-package (wizardMode: true)
  → Gera imagens via FLUX Pro (Fal.ai)
  → Para em "images_review"

Wizard Step 3→4 → /api/app/generate-audio
  → ElevenLabs TTS (Starter plan, 67K credits)
  → Para em "audio_review"

Wizard Step 4→5 → /api/app/generate-video
  → Veo 3 Fast via Fal.ai (fal-ai/veo3/fast/image-to-video)
  → Imagem + prompt com fala → vídeo completo com voz
  → generate_audio: true, aspect_ratio: "9:16", duration: "8s"
  → Custo: $0.15/segundo → ~$4.80 por 4 cenas
  → Para em "video_review"
```

**IMPORTANTE:** O Veo 3 é acessado via Fal.ai (NÃO direto pela API do Gemini). O `FAL_KEY` está configurado no `.env.local`.

---

## Pendências por Prioridade

### P0 — Bloqueadores
1. **FIX GenerationDetail.tsx** — null safety em TODOS os `.includes()` 
2. **Testar pipeline end-to-end** — wizard completo até vídeo gerado
3. **Commit + deploy** — ~50 arquivos sem commit, nada no Vercel

### P1 — Funcionalidade Core
4. **Assembly de vídeo final** — concatenar scene clips em 1 MP4 (não implementado)
5. **Step 6 do wizard** — seleção de música de fundo (não implementado)
6. **URLs temporárias do Fal.ai** — vídeos gerados têm CDN URLs que expiram, precisa upload para Supabase Storage

### P2 — Produto
7. **Pricing low-ticket** — atualizar para modelo 3/5/10 vídeos
8. **Deploy Vercel** — `vercel --prod --yes` no webapp/

### P3 — Integrações
9. **Instagram tokens expirados** — precisa regenerar no Meta Business Suite
10. **Instagram posting** — adiado, foco no pipeline de conteúdo

---

## Env Vars Necessárias (.env.local)

```
FAL_KEY=...              # Fal.ai (imagens + vídeo Veo 3)
ELEVENLABS_API_KEY=...   # TTS
FAL_VIDEO_READY=true
TTS_PROVIDER=elevenlabs
ELEVENLABS_READY=true
LOG_COSTS=true
```

## Feedback do Usuário (IMPORTANTE — respeitar)

1. **NÃO entregar partes separadas** — o produto DEVE entregar vídeo completo com voz, lip sync, efeitos sonoros e música
2. **Multi-step com aprovação humana** — cada etapa precisa de gate de aprovação antes de avançar
3. **Respostas curtas** — sem resumos longos no final de cada resposta
4. **Qualidade primeiro** — "Precisamos que funcione com perfeição e aumentamos os valores dos planos se for o caso"
5. **Foco no produto** — produto pronto ANTES de marketing/pricing

---

## Estrutura de Pastas Relevante

```
webapp/
  app/
    app/generate/page.tsx     ← Wizard (6 steps)
    app/history/page.tsx      ← Lista + detalhe
    api/app/
      generate-package/       ← Step 1→2 (imagens)
      generate-audio/         ← Step 3→4 (TTS)
      generate-video/         ← Step 4→5 (Veo 3)
  components/
    app/GenerationDetail.tsx  ← BUG AQUI
    landing/                  ← Landing page v2
    SiteShell.tsx             ← Header/footer
  lib/
    viral-objects/
      video-render.service.ts ← Veo 3 Fast integration
      audio-generation.service.ts
      image-generation.service.ts
    jobs/
      orchestrator.ts         ← Pipeline runner
      job.service.ts          ← Supabase CRUD
```
