# ViralObj — Guia de Setup Rápido

**viralobj.com** — Talking Object Viral Reel Generator
DB8 Intelligence · Salvador/BA

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Git
- Conta Supabase com projeto criado
- Conta Vercel (para deploy)

---

## Setup em 7 passos

### 1. Clone / Baixe os arquivos

```bash
git clone https://github.com/DB8-Intelligence/viralobj.git
cd viralobj
```

### 2. Leia a documentação

- Este arquivo (`00_README_START_HERE.md`) — visão geral
- `INDEX_MASTER.md` — mapa completo de todos os arquivos, lotes e dependências

### 3. Configure as variáveis de ambiente

```bash
cp .env.example webapp/.env.local
```

Edite `webapp/.env.local` com suas keys:

```env
# Supabase (obrigatório)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LLM — pelo menos um obrigatório
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...          # opcional fallback
GEMINI_API_KEY=AI...           # opcional fallback

# Geração de imagem/vídeo (mock funciona sem essas)
FAL_KEY=                       # Fal.ai FLUX.2 Pro
MINIMAX_API_KEY=               # MiniMax TTS
ELEVENLABS_API_KEY=            # ElevenLabs TTS

# Instagram (opcional)
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_ACCOUNT_ID=
```

### 4. Execute o setup

```bash
bash scripts/1_setup.sh
```

Isso vai:
- Instalar dependências do webapp
- Verificar que `.env.local` existe
- Rodar o build para checar erros de compilação

### 5. Aplique as migrations no Supabase

No dashboard do Supabase (SQL Editor), execute na ordem:

```
supabase/migrations/202604150001_jobs.sql
supabase/migrations/202604150002_generations_object_bibles.sql
supabase/migrations/202604150003_generations_scene_blueprints.sql
supabase/migrations/202604150004_generations_scene_image_prompts.sql
supabase/migrations/202604150005_generations_scene_images.sql
supabase/migrations/202604150006_generations_scene_audios_and_video_timeline.sql
supabase/migrations/202604150007_generations_video_output.sql
```

Ou se tiver Supabase CLI configurado:
```bash
supabase db push
```

### 6. Teste local

```bash
cd webapp && npm run dev
```

Acesse: http://localhost:3000

- `/app/generate` — criar pacote
- `/app/history` — ver gerações com preview de cenas

### 7. Deploy

```bash
bash scripts/2_deploy.sh
```

Faz deploy no Vercel com as env vars do `.env.local`.

---

## Arquitetura resumida

```
POST /api/app/generate-package
  ↓ auth + rate limit + quota
  ↓ LLM (Anthropic → OpenAI → Gemini)
  ↓ ObjectBible + SceneBlueprint + ImagePrompts + SceneTexts
  ↓ Salva em generations (sync)
  ↓ Cria Job → Orchestrator (fire-and-forget)
  ↓
  ingest → image_generation → audio_generation → timeline_build → video_render
  ↓
  generations atualizada com scene_images, scene_audios, video_timeline, video_url
```

---

## Status dos providers

| Provider | Flag | Status |
|---|---|---|
| Imagem (Fal.ai FLUX) | `FAL_INTEGRATION_READY` | Mock |
| Áudio (MiniMax TTS) | `MINIMAX_READY` | Mock |
| Áudio (ElevenLabs) | `ELEVENLABS_READY` | Mock |
| Vídeo (Remotion) | `REMOTION_READY` | Mock |
| Vídeo (Fal.ai VEED) | `FAL_VIDEO_READY` | Mock |
| Vídeo (VEED) | `VEED_READY` | Mock |

Todos geram URLs mock determinísticas. Para ativar um provider real: implementar a função stub correspondente e flipar a flag para `true`.

---

## Suporte

- Issues: https://github.com/DB8-Intelligence/viralobj/issues
- Stack: Next.js 14 + Supabase + Vercel + Tailwind
