# DIAGNOSTICO COMPLETO — ViralObj SaaS
## Relatorio para Analise do Especialista ChatGPT

**Projeto:** ViralObj (viralobj.com)
**Autor:** Douglas Bonanzza / DB8 Intelligence (Salvador/BA)
**Data:** 2026-04-16 (snapshot — produção migrou para Google Cloud em Sprint 22)
**Repo:** <https://github.com/DB8-Intelligence/viralobj>

---

## Produção oficial (atual)

- Landing: <https://viralobj.com>
- Dashboard: <https://www.viralobj.app>
- API: <https://api.viralobj.app>
- DNS: Google Cloud DNS
- Hosting: Google Cloud Run
- Vercel: não utilizado

> Diagnóstico abaixo é um snapshot Vercel/Supabase/AI-externa pré-migração.
> Para o estado atual da infra, ver `docs/LOCAL_DEV_AND_DEPLOY_CHECKLIST.md`.

---

# PARTE 1 — FILOSOFIA DO PROJETO

## 1.1 O Que E o ViralObj

ViralObj e um SaaS que gera **Reels virais de Objetos Falantes** para Instagram.
Objetos 3D no estilo Pixar/Disney falam em primeira pessoa sobre erros do cotidiano.

**Exemplo:** Uma banana dramatica reclamando que a colocaram na geladeira ("Eu sou uma BANANA! Meu lugar e na fruteira, nao nesse frio!").

**Idiomas:** PT-BR + Ingles (bilingual output).

## 1.2 Pipeline de Geracao (Fluxo Completo)

```
Usuario preenche form (nicho, objetos, topico, tom)
        |
        v
[1] LLM gera pacote (Anthropic/OpenAI/Gemini) .......... REAL
    - Roteiro, falas, prompts visuais, captions
        |
        v
[2] ObjectBible (identidade visual deterministico) ...... REAL
    - Cor, formato, olhos, boca, estilo Pixar, tom de voz
        |
        v
[3] SceneBlueprint (4 cenas por objeto) ................ REAL
    - intro / dialogue / reaction / cta
        |
        v
[4] ImagePromptPack (prompts FLUX por cena) ............ REAL
    - Prompts visuais com KEEP CONSISTENT / AVOID
        |
        v
[5] Job Orchestrator (5 steps async) ................... REAL
    |
    +-- Step 1: ingest (10%) ........................... REAL
    +-- Step 2: image_generation (50%) ................. REAL (Fal.ai FLUX Pro v1.1)
    +-- Step 3: audio_generation (80%) ................. MOCK (stub TTS)
    +-- Step 4: timeline_build (90%) ................... REAL (cumulative timing)
    +-- Step 5: video_render (100%) .................... MOCK (stub render)
        |
        v
[6] Instagram Graph API v21.0 .......................... REAL (tokens expirados)
```

## 1.3 Filosofia Tecnica

| Principio | Implementacao |
|-----------|---------------|
| **Specification-first** | MASTER.md + skills geram codigo, nao o contrario |
| **Deterministic identity** | ObjectBible e funcao pura: mesma entrada = mesma banana sempre |
| **Provider-agnostic** | Feature flags controlam mock vs real — troca sem mudar codigo |
| **Fire-and-forget** | API retorna imediatamente, job roda em background |
| **Dual persistence** | `generations` (dado canonico) + `generation_jobs` (auditoria) |
| **Config-driven** | 15 feature flags via env vars, sem hardcode |
| **Multi-tenant** | RLS Supabase, quota atomica, isolamento por tenant_id |
| **Fallback chain** | LLM: Anthropic -> OpenAI -> Gemini com timeout |

## 1.4 Modelo de Negocios

**10 nichos, 72 objetos, 23 formatos de corpo (A-W)**

| Nicho | Objetos |
|-------|---------|
| casa | agua sanitaria, lixeira, prato, panela, vaso, esponja |
| plantas | rosa, girassol, cacto, samambaia, alecrim, adenium |
| financeiro | carteira, cofrinho, cartao, moeda, calculadora, nota |
| culinaria | tomate, cenoura, abacate, banana, colher, garrafa |
| natureza | garrafa-pet, sacolinha, canudo, mapa, bussola |
| saude | termometro, pilula, estetoscopio, balanca, seringa |
| pets | racao, coleira, brinquedo, cama-pet, comedouro |
| fitness | haltere, esteira, garrafa-agua, tenis, corda |
| maternidade | mamadeira, chupeta, fralda, berco, termometro-bebe |
| saude-mental | travesseiro, xicara, vela, diario, planta-jade |

**Planos:**
```
trial:       R$  0/mes   5 pacotes, 0 videos, 0 posts
starter:     R$ 49/mes  30 pacotes, 10 videos, 10 posts
pro:        R$149/mes  100 pacotes, 50 videos, 50 posts
pro_plus:   R$399/mes  300 pacotes, 150 videos, 150 posts
enterprise: custom     ilimitado
```

**Custo por video (com providers reais):**
```
LLM (roteiro):           $0.02
FLUX Pro (4 imagens):    $0.20
TTS (4 narracoes):       $0.05-0.09
LivePortrait (lip-sync): $0.16
Infra:                   $0.03
TOTAL:                   $0.46-0.50 (~R$2.50)
```

---

# PARTE 2 — ARVORE DO PROJETO

```
viralobj/
|
|-- CLAUDE.md                              # Instrucoes para Claude Code
|-- README.md                              # Readme do projeto
|-- package.json                           # MCP server deps (@fal-ai, @anthropic-ai, @mcp/sdk)
|-- dataset.json                           # Patterns validados (5 videos analisados)
|
|-- mcp/                                   # === MCP SERVER (Claude Code integration) ===
|   |-- index.js                           #   Servidor MCP stdio (7 tools registrados)
|   |-- paths.js                           #   Resolucao de caminhos
|   +-- tools/
|       |-- analyze.js                     #   ffmpeg + Claude Vision (analise de video)
|       |-- generate.js                    #   LLM multi-provider (roteiro + prompts)
|       |-- generate_video.js              #   Pipeline FLUX + TTS + LipSync + FFmpeg
|       |-- download_reel.js               #   SnapInsta/SSSTik/yt-dlp (download reels)
|       |-- export.js                      #   HTML dashboard + SKILL.md exportavel
|       |-- post_instagram.js              #   Graph API v21.0 (publicacao + stories)
|       +-- niches.js                      #   10 nichos, 72 objetos, 23 formatos
|
|-- webapp/                                # === NEXT.JS 14 SaaS APP ===
|   |-- package.json                       #   Next.js + Supabase + Fal.ai + Sentry + Jest
|   |-- jest.config.js                     #   Config Jest (next/jest + jsdom)
|   |-- jest.setup.js                      #   Setup testes (@testing-library/jest-dom)
|   |
|   |-- lib/                              # === CORE BUSINESS LOGIC (2,718 linhas) ===
|   |   |-- generator.ts                  #   [369 ln] Multi-provider LLM router
|   |   |-- auth-helpers.ts               #   [111 ln] Session context + tenant/plan
|   |   |-- ip-rate-limit.ts              #   [ 45 ln] Rate limiting por IP
|   |   |-- landing-data.ts               #   [254 ln] Dados da landing page
|   |   |-- niches-data.ts               #   [ 77 ln] Catalogo de nichos
|   |   |-- legal-data.ts                #   [ 33 ln] Dados legais
|   |   |
|   |   |-- config/
|   |   |   +-- features.ts               #   [ 91 ln] 15 feature flags centralizadas
|   |   |
|   |   |-- supabase/
|   |   |   |-- server.ts                 #   [ 52 ln] Client server-side (anon + service)
|   |   |   |-- browser.ts               #   [ 14 ln] Client browser-side
|   |   |   |-- middleware.ts             #   [ 56 ln] Auth middleware (protege /app/*)
|   |   |   +-- types.ts                 #   [ 94 ln] Tipos: Tenant, Profile, Generation
|   |   |
|   |   |-- jobs/
|   |   |   |-- orchestrator.ts           #   [275 ln] Pipeline 5-step async
|   |   |   |-- job.service.ts            #   [162 ln] CRUD Supabase (jobs/steps/artifacts)
|   |   |   +-- types.ts                 #   [ 52 ln] JobStatus, StepType enums
|   |   |
|   |   |-- viral-objects/                # === CONTENT GENERATION PIPELINE ===
|   |   |   |-- object-bible.ts           #   [ 49 ln] Tipos ObjectBible, ObjectTone
|   |   |   |-- object-bible.generator.ts #   [156 ln] Gerador deterministico (15 objetos)
|   |   |   |-- normalize-tone.ts        #   [ 17 ln] Validacao de tom
|   |   |   |-- scene-blueprint.ts        #   [ 53 ln] 4 tipos de cena por objeto
|   |   |   |-- prompt-builder.ts         #   [ 70 ln] Prompts visuais FLUX/Midjourney
|   |   |   |-- image-prompt-pack.ts      #   [ 41 ln] Pack de prompts por cena
|   |   |   |-- image-generation.service  #   [163 ln] FLUX Pro v1.1 (REAL) + mock fallback
|   |   |   |-- audio-generation.service  #   [123 ln] TTS (MOCK — ElevenLabs/MiniMax stub)
|   |   |   |-- video-timeline.ts         #   [ 88 ln] Timeline cumulativo (startMs/endMs)
|   |   |   |-- video-assembly.ts         #   [ 42 ln] Contrato de render
|   |   |   +-- video-render.service      #   [124 ln] Render (MOCK — Remotion/VEED stub)
|   |   |
|   |   +-- sentry/
|   |       +-- client.ts                 #   [107 ln] Error tracking (sem DSN por ora)
|   |
|   |-- app/                              # === NEXT.JS APP ROUTER ===
|   |   |-- layout.tsx                    #   Root layout (html + body + globals.css)
|   |   |-- globals.css                   #   Tailwind base/components/utilities
|   |   |-- page.tsx                      #   Landing page (/) — 9 secoes
|   |   |
|   |   |-- login/
|   |   |   |-- page.tsx                  #   Form email + Google OAuth
|   |   |   +-- actions.ts               #   Server Actions (login/signup/logout)
|   |   |-- signup/
|   |   |   +-- page.tsx                  #   Form nome + email + senha + Google
|   |   |-- auth/callback/
|   |   |   +-- route.ts                 #   OAuth callback handler
|   |   |
|   |   |-- app/                          # === AREA PROTEGIDA (requer auth) ===
|   |   |   |-- layout.tsx               #   Shell (sidebar + header + plan badge)
|   |   |   |-- page.tsx                 #   Dashboard home (stats + recent)
|   |   |   |-- generate/page.tsx        #   Form de geracao (nicho/objetos/topico/tom)
|   |   |   |-- history/page.tsx         #   Historico com preview de cenas
|   |   |   +-- billing/page.tsx         #   Plano, uso, limites, upgrade CTA
|   |   |
|   |   |-- dashboard/
|   |   |   +-- page.tsx                  #   Dashboard monitoring (stats/queue/cost)
|   |   |
|   |   |-- pricing/page.tsx              #   Pagina de precos standalone
|   |   |-- niches/page.tsx               #   Catalogo dos 10 nichos
|   |   |
|   |   |-- legal/
|   |   |   |-- termos/page.tsx
|   |   |   |-- privacidade/page.tsx
|   |   |   |-- reembolso/page.tsx
|   |   |   +-- cookies/page.tsx
|   |   |
|   |   +-- api/                          # === API ROUTES ===
|   |       |-- niches/route.ts           #   GET /api/niches (edge runtime)
|   |       +-- app/
|   |           |-- generate-package/
|   |           |   +-- route.ts          #   POST — endpoint principal (230 ln)
|   |           +-- generate-job/
|   |               +-- route.ts          #   POST — criacao manual de job
|   |
|   |-- components/                       # === COMPONENTES UI ===
|   |   |-- CookieConsent.tsx
|   |   |-- Footer.tsx
|   |   |-- GoogleAuthButton.tsx
|   |   |
|   |   |-- landing/                      #   9 secoes da landing page
|   |   |   |-- Hero.tsx
|   |   |   |-- ProblemSolution.tsx
|   |   |   |-- HowItWorks.tsx
|   |   |   |-- FeaturesGrid.tsx
|   |   |   |-- Stats.tsx
|   |   |   |-- NichesShowcase.tsx
|   |   |   |-- Pricing.tsx
|   |   |   |-- FAQ.tsx
|   |   |   |-- FinalCTA.tsx
|   |   |   +-- SectionHeader.tsx
|   |   |
|   |   |-- app/
|   |   |   +-- ScenePromptPreview.tsx    #   Preview completo de cenas geradas
|   |   |
|   |   |-- dashboard/
|   |   |   |-- Header.tsx
|   |   |   |-- StatsCards.tsx
|   |   |   |-- GenerationQueue.tsx
|   |   |   |-- CostBreakdown.tsx
|   |   |   |-- ErrorLogs.tsx
|   |   |   +-- PerformanceMetrics.tsx
|   |   |
|   |   +-- legal/
|   |       +-- LegalLayout.tsx
|   |
|   +-- __tests__/
|       +-- services/
|           |-- feature-flags.test.ts     #   32 testes (CRF, TTS, IP-Adapter, costs)
|           +-- mock-providers.test.ts    #   29 testes (image, audio, FFmpeg)
|
|-- supabase/                             # === DATABASE SCHEMA ===
|   +-- migrations/
|       |-- 202604140001_base_schema.sql  #   tenants, profiles, generations, usage_monthly
|       |-- 202604150001_jobs.sql         #   generation_jobs, steps, artifacts + RLS
|       |-- 202604150002_*.sql            #   +object_bibles (jsonb + GIN)
|       |-- 202604150003_*.sql            #   +scene_blueprints
|       |-- 202604150004_*.sql            #   +scene_image_prompts
|       |-- 202604150005_*.sql            #   +scene_images
|       |-- 202604150006_*.sql            #   +scene_audios, video_timeline
|       +-- 202604150007_*.sql            #   +video_url, video_assembly
|
|-- skills/                               # === SKILLS INSTALATIVAS (Claude Code) ===
|   |-- reel-downloader.md                #   v2.0 pipeline orchestrator
|   |-- instagram-viral-engine.md         #   Estrategias de conteudo viral
|   |-- viralobj-reverse-engineer/        #   5 modulos de engenharia reversa
|   +-- [10 pastas de nichos]             #   casa, plantas, financeiro, etc.
|
|-- training-data/                        # === DADOS DE TREINAMENTO ===
|   |-- dataset.json                      #   Patterns validados (5 videos reais)
|   |-- reel-references/GUIA-DE-ESTILOS  #   Guia visual de referencia
|   +-- references/01-09                  #   9 modulos de analise (NexoOmnix)
|
|-- scripts/
|   |-- 1_setup.sh                        #   Setup: Node + deps + env + build
|   +-- 2_deploy.sh                       #   Deploy: Vercel CLI + build + prod
|
+-- docs/                                 # === DOCUMENTACAO ===
    |-- 00_README_START_HERE.md           #   Guia de inicio rapido
    |-- INDEX_MASTER.md                   #   Indice completo do projeto
    |-- PROJECT_REPORT.md                 #   Relatorio geral
    |-- ROADMAP_POS_GEMINI.md             #   Roadmap pos-auditoria
    |-- MASTER_SUPERVISION_PROMPT.md      #   Prompt de supervisao
    |-- DIAGNOSTICO_COMPLETO_CHATGPT.md   #   Este documento
    |-- ecosistema-arquitetura.md         #   Arquitetura do ecossistema
    +-- SESSION_HANDOFF_CHATGPT.md        #   Handoff para ChatGPT
```

---

# PARTE 3 — ARQUITETURA DE TELAS

## 3.1 Landing Page Mae (/) — 9 Secoes

```
viralobj.vercel.app/
|
+-- [1] Hero.tsx
|   |   Titulo: "Gere Reels Virais com Objetos Falantes"
|   |   Subtitulo + CTA "Comece Gratis" + "Ver Precos"
|   +   Background gradient slate-900 → blue-900
|
+-- [2] ProblemSolution.tsx
|   |   Coluna esquerda: "O Problema" (criar conteudo e caro/lento)
|   +   Coluna direita: "A Solucao ViralObj" (IA gera em 60s)
|
+-- [3] HowItWorks.tsx
|   |   5 passos visuais com icones:
|   |   1. Escolha o nicho → 2. Selecione objetos → 3. Defina topico
|   +   4. IA gera tudo → 5. Publique no Instagram
|
+-- [4] FeaturesGrid.tsx
|   |   6 cards em grid 3x2:
|   |   - Bilingual (PT+EN)    - Batch generation
|   |   - 10 nichos prontos    - Character consistency
|   +   - Instagram ready      - Template library
|
+-- [5] Stats.tsx
|   |   3 contadores animados:
|   +   "72 objetos" | "10 nichos" | "23 formatos"
|
+-- [6] NichesShowcase.tsx
|   |   10 cards de nicho com emoji + nome + qtd objetos
|   +   Clicavel → /niches para detalhes
|
+-- [7] Pricing.tsx
|   |   5 tiers lado a lado:
|   |   Trial(gratis) | Starter(R$49) | Pro(R$149) | Pro+(R$399) | Enterprise
|   +   Comparativo de features + CTA por plano
|
+-- [8] FAQ.tsx
|   |   Accordion com 6-8 perguntas frequentes
|   +   "Como funciona?", "Quanto custa?", etc.
|
+-- [9] FinalCTA.tsx
|       CTA final: "Comece a gerar seus reels agora"
|       Botao → /signup
|
+-- Footer.tsx
    Links: Termos | Privacidade | Cookies | Reembolso
    "DB8 Intelligence" + ano
```

## 3.2 Subpages Publicas

```
/pricing ................. Pagina de precos standalone (mesmos 5 tiers)
                           Parametro ?plan=starter pre-seleciona plano no signup
/niches .................. Catalogo completo dos 10 nichos
                           Lista objetos por nicho com formato recomendado
/login ................... Email + senha | Google OAuth | Link "Criar conta"
/signup .................. Nome + email + senha | Google OAuth
                           Aceita ?plan= para pre-fill de plano escolhido
/auth/callback ........... Callback OAuth (redireciona para /app)
/legal/termos ............ Termos de Servico
/legal/privacidade ....... Politica de Privacidade
/legal/reembolso ......... Politica de Reembolso
/legal/cookies ........... Politica de Cookies
```

## 3.3 Area Protegida (/app/*) — Requer Autenticacao

```
/app/ ..................... Dashboard Home
|                           - Saudacao "Ola, [nome]"
|                           - Plano atual + badge
|                           - Contadores: pacotes/videos/posts usados
|                           - Lista de geracoes recentes (ultimas 5)
|                           - CTA "Gerar novo reel"
|
/app/generate ............. Formulario de Geracao
|                           - Select: Nicho (10 opcoes)
|                           - Input: Objetos (texto livre, virgula)
|                           - Input: Topico (texto livre)
|                           - Select: Tom (dramatic/funny/emotional/sarcastic/motivational)
|                           - Select: Duracao (15s/30s/45s/60s)
|                           - Select: Idioma (pt/en/both)
|                           - Botao "Gerar Pacote" → POST /api/app/generate-package
|                           - Loading state com spinner
|                           - Redirect para /app/history apos sucesso
|
/app/history .............. Historico de Geracoes
|                           - Lista todas as geracoes do usuario
|                           - Por geracao: nicho, objetos, topico, tom, data
|                           - Expandir: ScenePromptPreview completo
|                             - Object Bibles (nome, cor, formato, tom)
|                             - Por cena: imagem, audio, ambiente, camera, prompt
|                             - Timeline summary (duracao total, start→end)
|                             - Video final (player ou "em renderizacao")
|
/app/billing .............. Billing & Plano
                            - Plano atual com badge colorido
                            - Barras de progresso: pacotes/videos/posts
                            - Contagem de trial restante (se trial)
                            - Cards comparativos dos planos
                            - CTA "Fazer upgrade" → /pricing?plan=X
```

## 3.4 Dashboard de Monitoring (/dashboard)

```
/dashboard ................ Real-time Pipeline Monitoring
|
+-- Header.tsx
|   "ViralObj Dashboard" + badge "Production"
|
+-- Alert (Beta Mode)
|   Banner azul: "Usando mock providers. Lote 7: FLUX real."
|
+-- StatsCards.tsx (6 cards em grid)
|   | Total Jobs | Successful | Failed | Success Rate | Cost | Avg Duration |
|   (atualmente com dados mock = 0, sera conectado ao Supabase)
|
+-- Grid 3 colunas
    |
    +-- Coluna esquerda (2/3):
    |   |-- GenerationQueue.tsx
    |   |   Fila de jobs em tempo real
    |   |   (placeholder: "Nenhum job na fila")
    |   |
    |   +-- PerformanceMetrics.tsx
    |       Metricas de performance
    |       (placeholder: "Dados disponiveis apos primeiros jobs")
    |
    +-- Coluna direita (1/3):
        |-- CostBreakdown.tsx
        |   Custo por provider (imagem/audio/video)
        |   (placeholder: "Dados de custo apos jobs reais")
        |
        +-- ErrorLogs.tsx
            Erros recentes por step
            (placeholder: "Nenhum erro recente")
```

---

# PARTE 4 — STACK TECNICA

```
Frontend:     Next.js 14 (App Router) + TypeScript strict + Tailwind CSS
Backend:      Next.js API Routes (serverless Vercel)
Database:     Supabase (PostgreSQL + RLS + Auth + Realtime)
Auth:         Supabase Auth (email/senha + Google OAuth)
Deploy FE:    Vercel (team DB8-Intelligence)
LLM:          Anthropic Claude → OpenAI GPT-4.1 → Gemini 2.5 (fallback)
Imagem:       Fal.ai FLUX Pro v1.1 (real, $0.05/imagem)
Audio TTS:    ElevenLabs / MiniMax (MOCK — stubs prontos)
Video:        Remotion / VEED Fabric / Fal video (MOCK — stubs prontos)
Posting:      Instagram Graph API v21.0 (real, tokens expirados)
MCP:          @modelcontextprotocol/sdk (7 tools para Claude Code)
Testes:       Jest + @testing-library (61 testes)
Monitoring:   Sentry (estrutura pronta, sem DSN)
```

---

# PARTE 5 — SCHEMA DO BANCO DE DADOS

```sql
-- 8 TABELAS (Supabase PostgreSQL)

tenants (multi-tenant)
  id uuid PK, name, slug UNIQUE, plan (enum 5), plan_expires_at,
  addon_talking_objects bool, is_active, trial_ends_at, created_at

profiles (linked to auth.users)
  id uuid PK (FK auth.users), tenant_id FK, full_name, email, phone,
  avatar_url, role, is_active, last_seen_at, created_at

generations (conteudo gerado)
  id uuid PK, tenant_id FK, profile_id FK, niche, objects[], topic, tone,
  duration, lang, provider_used, package jsonb, created_at
  -- Colunas adicionais (migrations 002-007):
  object_bibles jsonb, scene_blueprints jsonb, scene_image_prompts jsonb,
  scene_images jsonb, scene_audios jsonb, video_timeline jsonb,
  video_url text, video_assembly jsonb

usage_monthly (quota por plano)
  tenant_id FK + month date = PK composta
  packages_count, videos_count, posts_count, updated_at

generation_jobs (auditoria de execucao)
  id uuid PK, tenant_id, user_id, status (queued/running/completed/failed),
  progress 0-100, input jsonb, error text, created_at, updated_at (trigger)

generation_job_steps (cada passo do pipeline)
  id uuid PK, job_id FK, step (enum 12 valores), status (enum 4),
  started_at, completed_at, error text, created_at

generation_artifacts (artefatos intermediarios)
  id uuid PK, job_id FK, type text, url text, metadata jsonb, created_at

-- RLS: usuarios veem apenas dados do proprio tenant
-- Indexes: GIN em todos os JSONB, B-tree em tenant_id/user_id/status
-- Trigger: auto-update updated_at em generation_jobs
-- Funcoes: reserve_quota() (atomica), bootstrap_tenant_viralobj()
```

---

# PARTE 6 — FEATURE FLAGS (15 flags)

```
PROVIDER FLAGS (controle mock vs real):
  FAL_INTEGRATION_READY=false    Imagem FLUX Pro via Fal.ai
  FEATURE_IP_ADAPTER=false       Character chaining (IP-Adapter)
  IP_ADAPTER_STRENGTH=0.75       Forca do IP-Adapter (0-1)
  IP_ADAPTER_SEED=true           Seed deterministico por cena
  TTS_PROVIDER=elevenlabs        Preferencia: 'elevenlabs' | 'minimax'
  MINIMAX_READY=false            MiniMax TTS backend
  ELEVENLABS_READY=false         ElevenLabs TTS backend
  REMOTION_READY=false           Remotion SSR render
  FAL_VIDEO_READY=false          Fal.ai video render
  VEED_READY=false               VEED API

ENCODING FLAGS:
  FFMPEG_CRF=23                  Qualidade (18=max, 28=min, 21=recomendado)
  FFMPEG_BITRATE=1500k           Bitrate (2000k para qualidade premium)
  FFMPEG_PRESET=fast             Velocidade encoding

OPERATION MODES:
  FEATURE_PREVIEW_MODE=false     Pula lip-sync (mais rapido/barato)
  LOG_COSTS=true                 Log de custo por provider
  LOG_DURATIONS=true             Log de duracao por step
```

---

# PARTE 7 — O QUE JA ESTA PRONTO

## 7.1 Sprints Concluidos

| Sprint | Escopo | Status |
|--------|--------|--------|
| **S1: Fundacao** | Auth, tenants, profiles, RLS, middleware, rate limit | DONE |
| **S2: LLM Generation** | Multi-provider router, ObjectBible, SceneBlueprint, prompts | DONE |
| **S3: Pipeline Async** | JobOrchestrator 5 steps, JobService CRUD, dual persistence | DONE |
| **S4: UI Completa** | Landing 9 secoes, form geracao, historico, billing, legal | DONE |
| **S5: Infraestrutura** | Supabase isolado, Vercel deploy, feature flags, Jest 61 testes | DONE |
| **S6: FLUX Pro** | Fal.ai FLUX Pro v1.1 real, IP-Adapter, seed deterministico | DONE |

## 7.2 Commits Recentes

```
74d45b6  feat(sprint-6): integrate Fal.ai FLUX Pro v1.1 for real image generation
02d750f  feat: add jest tests, sentry structure, dashboard
48c80ea  feat: feature flags + isolated Supabase + base schema migration
41c69a1  feat(pipeline): Lotes 1-6 — job-based async pipeline
d4553e7  feat(webapp): Google OAuth + loosen IP rate limits
955fa16  fix(webapp): QA hardening — P0/P1 fixes from 3-agent audit
786a856  feat(webapp): Phase 2 — legal pages + billing + pricing
f875058  feat(webapp): full sales landing page (9 sections)
```

## 7.3 Metricas do Codigo

| Metrica | Valor |
|---------|-------|
| Linhas TypeScript (webapp/lib) | 2,718 |
| Linhas MCP tools | 3,948 |
| Paginas Next.js | 20 rotas |
| Componentes React | 22 |
| Migrations SQL | 8 arquivos |
| MCP Tools | 7 |
| Testes unitarios | 61 (todos passando) |
| Feature flags | 15 |
| Nichos | 10 |
| Objetos | 72 |
| Formatos corporais | 23 (A-W) |

---

# PARTE 8 — O QUE FALTA IMPLEMENTAR

## 8.1 Sprints Pendentes (para pipeline E2E real)

### Sprint 7 — TTS Real (audio)
**Prioridade: CRITICA | Esforco: ~6h**

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Implementar generateWithElevenLabs() | audio-generation.service.ts:55 | STUB |
| Implementar generateWithMinimax() | audio-generation.service.ts:49 | STUB |
| Medir duracao real do audio (nao estimativa) | Mesmo arquivo | TODO |
| Upload audio para Supabase Storage | Novo codigo | TODO |
| Testar com TTS_PROVIDER=elevenlabs | .env.local | TODO |

**Depende de:** ELEVENLABS_API_KEY ou MINIMAX_API_KEY

### Sprint 8 — Video Render Real
**Prioridade: CRITICA | Esforco: ~11h**

| Tarefa | Arquivo | Status |
|--------|---------|--------|
| Escolher provider (Remotion vs Fal vs VEED) | Decisao | TODO |
| Implementar render real | video-render.service.ts:58-73 | STUB |
| Lip-sync (LivePortrait via Fal.ai) | Novo servico | TODO |
| FFmpeg encoding (usar ffmpegConfig) | Novo codigo | TODO |
| Upload video final para Storage | Novo codigo | TODO |

**Depende de:** Escolha de provider + API keys

### Sprint 9 — Storage & URLs Reais
**Prioridade: ALTA | Esforco: ~4h**

| Tarefa | Status |
|--------|--------|
| Configurar Supabase Storage (bucket 'generations') | TODO |
| Helper uploadToStorage(file, path) | TODO |
| Atualizar image-gen para upload apos gerar | TODO |
| Atualizar audio-gen para upload apos gerar | TODO |
| Atualizar video-render para upload apos gerar | TODO |
| URLs publicas com signed URLs ou CDN | TODO |

### Sprint 10 — QA E2E + Dashboard Real
**Prioridade: ALTA | Esforco: ~9h**

| Tarefa | Status |
|--------|--------|
| Teste E2E: gerar reel "banana dramatica" completo | TODO |
| Dashboard conectado a dados reais (Supabase queries) | TODO |
| Teste de fallback: provider falha → mock graceful | TODO |
| Validar custo real vs estimado | TODO |
| Polling de status de job no UI (ou Realtime) | TODO |

### Sprint 11 — Instagram & Publicacao
**Prioridade: MEDIA | Esforco: ~3h**

| Tarefa | Status |
|--------|--------|
| Regenerar tokens Meta (expirados ha 60 dias) | TODO |
| Botao "Publicar no Instagram" na UI | TODO |
| Agendamento de publicacao | TODO |

### Sprint 12 — Pagamento & Billing
**Prioridade: MEDIA | Esforco: ~8h**

| Tarefa | Status |
|--------|--------|
| Integrar Hotmart (BR) ou Stripe (EN) | TODO |
| Webhook de pagamento → ativar plano | TODO |
| Checkout na pagina de pricing | TODO |
| Gestao de assinatura (upgrade/downgrade) | TODO |

## 8.2 Resumo de Esforco

```
Sprint 7  (TTS real):            ~6h   ← CRITICO
Sprint 8  (Video render real):  ~11h   ← CRITICO
Sprint 9  (Storage URLs):        ~4h   ← ALTA
Sprint 10 (QA E2E + Dashboard):  ~9h   ← ALTA
Sprint 11 (Instagram):           ~3h   ← MEDIA
Sprint 12 (Pagamento):           ~8h   ← MEDIA
                                -----
TOTAL para MVP completo:        ~41h
TOTAL para testar E2E:          ~21h (Sprints 7+8+9)
```

---

# PARTE 9 — DECISOES ARQUITETURAIS IMPORTANTES

## 9.1 Por Que Fire-and-Forget (e suas limitacoes)

A API `/generate-package` retorna imediatamente apos o LLM gerar o pacote.
O job orchestrator roda em background (`new JobOrchestrator().run(jobId).catch(...)`).

**Problema:** Em Vercel Serverless, a funcao pode ser encerrada antes do job completar.
**Solucao futura:** Mover orchestrator para um worker externo (Railway, AWS Lambda, ou Supabase Edge Function com Deno).

## 9.2 Por Que Supabase Isolado

O ViralObj inicialmente compartilhava o Supabase do NexoOmnix (projeto pai).
Migramos para um Supabase proprio (`dnqqxnwiwaqxtruvizgz`) porque:
- ViralObj e SaaS independente
- Tera seus proprios usuarios
- Spike de uso nao deve derrubar NexoOmnix
- Custo minimo (R$25-100/mes)

## 9.3 Por Que Feature Flags (nao branches)

Cada provider (FLUX, TTS, Video) e controlado por flag em vez de branch de codigo.
Isso permite:
- Ativar/desativar sem deploy
- A/B testing (CRF 21 vs 23, ElevenLabs vs MiniMax)
- Rollback instantaneo
- Dev local com mock, prod com real

## 9.4 Por Que ObjectBible Deterministico

`generateObjectBible(input)` e funcao pura — mesma entrada gera mesma saida.
Isso garante que a "banana dramatica" sempre tenha a mesma cor amarela, olhos zangados,
boca aberta, bracos stub. Validado com teste "banana dramatica x 3" (byte-identical).

---

# PARTE 10 — COMO TESTAR (Quick Start)

```bash
# 1. Clonar e instalar
git clone https://github.com/DB8-Intelligence/viralobj
cd viralobj/webapp
npm install

# 2. Configurar .env.local (copiar de .env.local.example)
cp .env.local.example .env.local
# Preencher: SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, ANTHROPIC_API_KEY

# 3. Rodar testes
npm test                    # 61/61 passam

# 4. Dev server
npm run dev                 # http://localhost:3000

# 5. Build producao
npm run build               # 0 erros, 20 rotas

# 6. Deploy
vercel --prod --yes         # viralobj.vercel.app
```

---

# PARTE 11 — URLS DE PRODUCAO

| Recurso | URL |
|---------|-----|
| **Webapp** | https://viralobj.vercel.app |
| **Supabase** | https://dnqqxnwiwaqxtruvizgz.supabase.co |
| **GitHub** | https://github.com/DB8-Intelligence/viralobj |
| **Vercel Team** | team_T2S42j3Uj2hWvjnw6b1OVrKK |
| **Railway (secrets)** | db8-agent service (central vault) |

---

**Fim do Diagnostico**

*Gerado por Claude Opus 4.6 em 2026-04-16*
*Projeto: ViralObj v1.0 — DB8 Intelligence*
