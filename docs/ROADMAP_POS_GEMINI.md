# ViralObj — Roadmap Estrategico Pos-Auditoria Gemini

**Data:** 2026-04-17
**Status:** Production Live (dnqqxnwiwaqxtruvizgz)
**Abordagem:** Evoluir incrementalmente, sem quebrar codigo existente

---

## O Que NAO Fazer

**NAO aplicar os 3 arquivos da Gemini diretamente:**
- `orchestrator.ts` (Deno Edge Functions != Node.js)
- `video-assembly.ts` (FFmpeg shell / Deno server)
- `job.service.ts` (constructor pattern != singleton)

**NAO assumir tabelas erradas:**
- Gemini propos: `job_steps`, `job_artifacts`
- Realidade: `generation_job_steps`, `generation_artifacts`

**NAO trocar runtime:**
- Gemini imaginou: Deno + `serve()` + `esm.sh`
- Realidade: Node.js + Next.js App Router + npm packages

---

## O Que FOI Implementado (Opcao B)

### Feature Flags Centralizadas

Arquivo: `webapp/lib/config/features.ts`

| Flag | Default | Descricao |
|------|---------|-----------|
| `FAL_INTEGRATION_READY` | false | FLUX.2 Pro via Fal.ai |
| `FEATURE_IP_ADAPTER` | false | Character chaining entre cenas |
| `IP_ADAPTER_STRENGTH` | 0.75 | Forca do IP-Adapter |
| `TTS_PROVIDER` | elevenlabs | elevenlabs ou minimax |
| `MINIMAX_READY` | false | MiniMax TTS ativo |
| `ELEVENLABS_READY` | false | ElevenLabs TTS ativo |
| `REMOTION_READY` | false | Remotion SSR render |
| `FAL_VIDEO_READY` | false | Fal.ai LivePortrait |
| `VEED_READY` | false | VEED API |
| `FFMPEG_CRF` | 23 | Qualidade encoding (21=melhor) |
| `FFMPEG_BITRATE` | 1500k | Bitrate video (2000k=melhor) |
| `FFMPEG_PRESET` | fast | Velocidade FFmpeg |
| `FEATURE_PREVIEW_MODE` | false | Pula lip-sync (mais barato) |
| `LOG_COSTS` | false | Logging de custo por provider |
| `LOG_DURATIONS` | true | Logging de duracao por step |

### Servicos Atualizados

- `image-generation.service.ts` — IP-Adapter ready, referenceImageUrl entre cenas
- `audio-generation.service.ts` — TTS_PROVIDER flag, cost logging
- `video-render.service.ts` — Preview mode, FFmpeg config exportada, cost logging

---

## Roadmap por Semana

### Semana 1 (Atual) — Estabilizacao
- [x] Deploy em Supabase isolado
- [x] Feature flags centralizadas
- [ ] Testar 10 reels com mock providers
- [ ] Medir tempo real da pipeline

### Semana 2 — Observabilidade
- [ ] Sentry no Next.js App Router
- [ ] Error tracking estruturado
- [ ] Dashboard Sentry
- [ ] Alertas performance

### Semana 3 — A/B Testing
- [ ] Testar CRF 21 vs 23 (FFMPEG_CRF=21)
- [ ] Testar MiniMax vs ElevenLabs (TTS_PROVIDER=minimax)
- [ ] Cost tracking no database

### Semana 4 (Lote 7) — Integracao Real
- [ ] FLUX.2 Pro real (FAL_INTEGRATION_READY=true)
- [ ] IP-Adapter ativado (FEATURE_IP_ADAPTER=true)
- [ ] MiniMax TTS piloto (MINIMAX_READY=true)

### Semana 5 — Preview Mode
- [ ] Preview Mode no UI (FEATURE_PREVIEW_MODE)
- [ ] Pricing dinamico (preview vs final)
- [ ] Fal.ai LivePortrait integrado

---

## Tabela de Custo (Gemini)

### Mock (Atual)
```
Anthropic LLM:      $0.02
FLUX (mock):        $0.00
TTS (mock):         $0.00
LivePortrait (mock): $0.00
Infra:              $0.03
TOTAL MOCK:         $0.05/video
```

### Com Providers Reais (Lote 7)
```
Anthropic LLM:      $0.02
FLUX.2 Pro:         $0.20 (4 imagens)
ElevenLabs TTS:     $0.09
LivePortrait:       $0.16
Infra:              $0.03
TOTAL REAL:         $0.50/video (R$ 2,50)
```

### Otimizado (Mes 2)
```
FLUX.2 Pro + Schnell: $0.19 (-$0.01)
MiniMax TTS:          $0.05 (-$0.04)
TOTAL OTIMIZADO:      $0.45/video (R$ 2,25) = -10%
COM Preview Mode:     $0.29/video (R$ 1,45) = -42%
```

---

## Checklist de Qualidade

### Character Consistency
- [ ] IP-Adapter quando FLUX real
- [ ] Consistency score >85%
- [ ] Fallback se IP falhar

### Lip-Sync Quality
- [ ] Fal.ai LivePortrait integrado
- [ ] Audio/video sync <50ms
- [ ] Fallback para imagem estatica

### FFmpeg Pipeline
- [ ] CRF 21 testado em beta
- [ ] 9:16 aspect ratio validado
- [ ] Audio mixing 100% voice + 15% music

### Cost Tracking
- [ ] Cost por provider no database
- [ ] Dashboard de custo/margem
- [ ] Alertas de custo anomalo
