# ViralObj — INDEX MASTER

Mapa completo do projeto: todos os arquivos, lotes de desenvolvimento, dependências e estado atual.

---

## Estrutura de diretórios

```
viralobj/
├── webapp/                          # Next.js 14 App (frontend + API)
│   ├── app/
│   │   ├── app/
│   │   │   ├── generate/page.tsx    # Form de geração (TONE_OPTIONS → ObjectTone)
│   │   │   ├── history/page.tsx     # Histórico + ScenePromptPreview
│   │   │   ├── billing/             # Billing pages
│   │   │   ├── layout.tsx           # App layout (auth guard)
│   │   │   └── page.tsx             # Dashboard home
│   │   ├── api/app/
│   │   │   ├── generate-package/route.ts  # Rota principal de geração
│   │   │   └── generate-job/route.ts      # Rota de job (não usada em prod)
│   │   ├── auth/callback/route.ts   # Google OAuth callback
│   │   └── ...
│   ├── components/
│   │   ├── app/
│   │   │   └── ScenePromptPreview.tsx  # Preview completo (bibles+scenes+images+audio+timeline+video)
│   │   ├── landing/                 # Landing page components
│   │   └── ...
│   ├── lib/
│   │   ├── viral-objects/           # NÚCLEO DO DOMÍNIO
│   │   │   ├── object-bible.ts              # Tipos ObjectBible + ObjectTone
│   │   │   ├── object-bible.generator.ts    # Gerador determinístico + lookup 15 objetos
│   │   │   ├── normalize-tone.ts            # Helper central de normalização de tom
│   │   │   ├── scene-blueprint.ts           # 4 tipos de cena + buildSceneBlueprint
│   │   │   ├── prompt-builder.ts            # buildVisualPrompt (string | SceneBlueprint)
│   │   │   ├── image-prompt-pack.ts         # buildSceneImagePromptPack
│   │   │   ├── image-generation.service.ts  # generateSceneImage(s) + mock
│   │   │   ├── audio-generation.service.ts  # generateSceneAudio(s) + mock
│   │   │   ├── video-timeline.ts            # buildVideoTimeline (durações cumulativas)
│   │   │   ├── video-assembly.ts            # buildVideoAssembly (contrato render)
│   │   │   └── video-render.service.ts      # renderVideo + mock
│   │   ├── jobs/                    # PIPELINE ASSÍNCRONO
│   │   │   ├── types.ts                     # JobStatus, JobStepType, interfaces
│   │   │   ├── job.service.ts               # CRUD + updates de generations
│   │   │   └── orchestrator.ts              # 5 steps: ingest→image→audio→timeline→render
│   │   ├── supabase/
│   │   │   ├── server.ts                    # createClient + createServiceClient
│   │   │   ├── browser.ts                   # Client-side Supabase
│   │   │   ├── middleware.ts                # Auth middleware
│   │   │   └── types.ts                     # Generation, PlanLimits, etc.
│   │   ├── generator.ts             # LLM router multi-provider + pipeline de artefatos
│   │   ├── niches-data.ts           # 10 nichos com labels
│   │   ├── auth-helpers.ts          # Session + profile helpers
│   │   └── ip-rate-limit.ts         # Rate limiting por IP
│   └── package.json
├── supabase/
│   └── migrations/                  # 7 migrations aditivas
│       ├── 202604150001_jobs.sql
│       ├── 202604150002_generations_object_bibles.sql
│       ├── 202604150003_generations_scene_blueprints.sql
│       ├── 202604150004_generations_scene_image_prompts.sql
│       ├── 202604150005_generations_scene_images.sql
│       ├── 202604150006_generations_scene_audios_and_video_timeline.sql
│       └── 202604150007_generations_video_output.sql
├── mcp/                             # MCP server standalone (6 tools)
├── skills/                          # Skills reel-downloader + reverse-engineer
├── training-data/                   # Dataset + references
├── outputs/                         # HTML dashboards, packages, videos
├── scripts/
│   ├── 1_setup.sh                   # Setup automático
│   └── 2_deploy.sh                  # Deploy Vercel
├── docs/
│   ├── 00_README_START_HERE.md      # Este guia
│   └── INDEX_MASTER.md              # Este índice
├── .env.example                     # Template de env vars
└── CLAUDE.md                        # Instruções para Claude Code
```

---

## Lotes de desenvolvimento

### Lote 1 — Base de Jobs (DEV 1-5)
| DEV | Arquivo | Status |
|---|---|---|
| 1 | `webapp/lib/jobs/types.ts` | ✅ |
| 2 | `supabase/migrations/202604150001_jobs.sql` | ✅ |
| 3 | `webapp/lib/jobs/job.service.ts` | ✅ |
| 4 | `webapp/app/api/app/generate-job/route.ts` | ✅ |
| 5 | `webapp/lib/jobs/orchestrator.ts` | ✅ |

### Lote 2 — Object Bible + Consistência Visual (DEV 6-10)
| DEV | Arquivo | Status |
|---|---|---|
| 6 | `webapp/lib/viral-objects/object-bible.generator.ts` (lookup) | ✅ |
| 7 | `webapp/lib/viral-objects/scene-blueprint.ts` | ✅ |
| 8 | `webapp/lib/viral-objects/prompt-builder.ts` (SceneBlueprint overload) | ✅ |
| 9 | `webapp/lib/generator.ts` (scene_blueprints) | ✅ |
| 10 | `supabase/migrations/202604150003_*.sql` + persistência | ✅ |

### Lote 3 — Tone + Prompt Pack + Preview (DEV 11-15)
| DEV | Arquivo | Status |
|---|---|---|
| 11 | `webapp/lib/viral-objects/normalize-tone.ts` | ✅ |
| 12 | `webapp/lib/viral-objects/image-prompt-pack.ts` | ✅ |
| 13 | `webapp/lib/generator.ts` (scene_image_prompts) | ✅ |
| 14 | `supabase/migrations/202604150004_*.sql` | ✅ |
| 15 | `webapp/components/app/ScenePromptPreview.tsx` | ✅ |

### Lote 4 — Geração de Imagem (DEV 16-20)
| DEV | Arquivo | Status |
|---|---|---|
| 16 | `webapp/lib/viral-objects/image-generation.service.ts` | ✅ |
| 17 | `generateSceneImages` (lote) | ✅ |
| 18 | `supabase/migrations/202604150005_*.sql` | ✅ |
| 19 | Integração pipeline | ✅ → movido para async em 4.5 |
| 20 | UI preview de imagens | ✅ |

### Lote 4.5 — Correção Arquitetural (DEV 21-25)
| DEV | Arquivo | Status |
|---|---|---|
| 21 | Remover imagem do request sync | ✅ |
| 22 | Step `image_generation` no orchestrator | ✅ |
| 23 | Disparar job após generate-package | ✅ |
| 24 | UI estado assíncrono | ✅ |
| 25 | Flag `FAL_INTEGRATION_READY` | ✅ |

### Lote 5 — Áudio + Timeline (DEV 26-30.5)
| DEV | Arquivo | Status |
|---|---|---|
| 26 | `webapp/lib/viral-objects/audio-generation.service.ts` | ✅ |
| 27 | `generateSceneAudios` (lote) | ✅ |
| 28 | `webapp/lib/viral-objects/video-timeline.ts` | ✅ |
| 29 | `supabase/migrations/202604150006_*.sql` | ✅ |
| 30 | Orchestrator steps audio + timeline + UI | ✅ |
| 30.5 | `scene_texts` do roteiro real do LLM | ✅ |

### Lote 6 — Renderização + Export (DEV 31-35)
| DEV | Arquivo | Status |
|---|---|---|
| 31 | `webapp/lib/viral-objects/video-render.service.ts` | ✅ |
| 32 | `webapp/lib/viral-objects/video-assembly.ts` | ✅ |
| 33 | Step `video_render` no orchestrator | ✅ |
| 34 | `supabase/migrations/202604150007_*.sql` + tipos | ✅ |
| 35 | UI preview vídeo final | ✅ |

### Hotfixes aplicados
| HF | O que corrigiu |
|---|---|
| HF-1 | prompt-builder: mustKeep + baseColor + shape + expressionBase |
| HF-2 | Remover `as any`, validar tone |
| HF-3 | Semântica `object_bibles` (plural) |
| HF-4 | UI TONE_OPTIONS mapeando labels → ObjectTone |
| HF-5 | Rota persiste tone normalizado |

---

## Schema SQL — Tabela `generations`

```
id uuid pk
tenant_id uuid fk → tenants
profile_id uuid fk → auth.users
niche text
objects text[]
topic text
tone text (normalizado: ObjectTone)
duration int
lang text
provider_used text
package jsonb
object_bibles jsonb
scene_blueprints jsonb
scene_image_prompts jsonb
scene_images jsonb
scene_audios jsonb
video_timeline jsonb
video_url text
video_assembly jsonb
created_at timestamptz
```

## Schema SQL — Tabelas de Job

```
generation_jobs       (id, tenant_id, user_id, status, progress, input jsonb, created_at, updated_at)
generation_job_steps  (id, job_id, step, status, started_at, completed_at, error)
generation_artifacts  (id, job_id, type, url, metadata jsonb, created_at)
```

---

## Pipeline de execução (5 steps)

```
1. ingest            → progress 10%   — placeholder/validação
2. image_generation  → progress 50%   — 4 imagens por objeto (mock/Fal.ai)
3. audio_generation  → progress 80%   — 4 áudios por objeto (mock/MiniMax/ElevenLabs)
4. timeline_build    → progress 90%   — durações cumulativas, match por sceneId
5. video_render      → progress 100%  — assembly + render (mock/Remotion/Fal/VEED)
```

---

## Flags de integração

Todas em `false` até implementação real:

| Arquivo | Flag | Provider |
|---|---|---|
| `image-generation.service.ts` | `FAL_INTEGRATION_READY` | Fal.ai FLUX.2 Pro |
| `audio-generation.service.ts` | `MINIMAX_READY` | MiniMax TTS |
| `audio-generation.service.ts` | `ELEVENLABS_READY` | ElevenLabs |
| `video-render.service.ts` | `REMOTION_READY` | Remotion SSR |
| `video-render.service.ts` | `FAL_VIDEO_READY` | Fal.ai VEED Fabric |
| `video-render.service.ts` | `VEED_READY` | VEED API |

---

## Objetos com lookup visual (15)

banana, tomate, abacate, prato, panela, vaso, xicara, geladeira, sofa, travesseiro, celular, notebook, garrafa, colher, cenoura

Objetos não mapeados usam fallback genérico.

---

## Env vars necessárias

| Variável | Obrigatória | Onde |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Supabase (JobService) |
| `ANTHROPIC_API_KEY` | Sim* | LLM (pelo menos 1) |
| `OPENAI_API_KEY` | Não | LLM fallback |
| `GEMINI_API_KEY` | Não | LLM fallback |
| `FAL_KEY` | Não | Imagem/vídeo real |
| `MINIMAX_API_KEY` | Não | Áudio real |
| `ELEVENLABS_API_KEY` | Não | Áudio real |
| `INSTAGRAM_ACCESS_TOKEN` | Não | Instagram posting |
| `INSTAGRAM_ACCOUNT_ID` | Não | Instagram posting |
