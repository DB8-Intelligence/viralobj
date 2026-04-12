# ViralObj — Relatório Completo do Projeto

**Data:** 2026-04-12
**Versão:** Fase 1 (Auth + Dashboard) em produção
**Produção:** https://viralobj.vercel.app
**Repositório:** https://github.com/DB8-Intelligence/viralobj
**Owner:** DB8 Intelligence

---

## 1. Sumário Executivo

ViralObj é um gerador de reels virais com objetos 3D animados estilo Pixar/Disney que falam em primeira pessoa. O projeto combina:

- **Dataset proprietário** — 47 vídeos virais reais analisados frame-a-frame, extraindo 23 formatos visuais repetíveis e 17 nichos validados.
- **Pipeline AI completo** — análise → geração de pacote bilíngue → vídeo MP4 → publicação Instagram.
- **Multi-provider LLM** — Anthropic Claude 4.6, OpenAI GPT-4.1, Google Gemini 2.5 com fallback automático.
- **Dois pipelines de vídeo** — FLUX Pro + MiniMax TTS + VEED Fabric (estilo Pixar) ou Google Veo 2 (movimento orgânico).
- **SaaS multi-tenant** — reusa infra existente do NexoOmnix (tenants, billing, auth, Kiwify).

**Status macro:**
- ✅ **Núcleo técnico** (MCP + dataset + pipelines) — **100% pronto**
- ✅ **Frontend + Auth + Rate Limit** (Fase 1) — **100% pronto, deployed**
- ⬜ **Monetização** (sales page + pagamento + legal) — **0%, bloqueado em decisões**
- ⬜ **Video generation via web** (worker async) — **0%, precisa arquitetura**
- ⬜ **Instagram auto-posting** — **Código pronto, bloqueado por tokens expirados**

---

## 2. Arquitetura Atual

```
┌──────────────────────────────────────────────────────────────┐
│                     ViralObj                                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  CLI/MCP Server (Node)           Web App (Next.js 14)        │
│  ─────────────────────           ─────────────────────       │
│  mcp/index.js                    webapp/                      │
│  ├── 7 tools registradas         ├── app/ (App Router)       │
│  │   ├── analyze_video           │   ├── / (landing)         │
│  │   ├── download_reel           │   ├── /niches (público)   │
│  │   ├── generate_package        │   ├── /login /signup      │
│  │   ├── generate_video          │   └── /app/* (protegido)  │
│  │   ├── export_artifacts        │       ├── dashboard       │
│  │   ├── post_to_instagram       │       ├── generate        │
│  │   └── list_niches             │       └── history         │
│  └── tools/*.js                  ├── api/                    │
│                                  │   ├── niches (public)     │
│  Data                            │   └── app/generate-package│
│  ────                            │       (auth + rate limit) │
│  training-data/dataset.json      ├── lib/                    │
│  (47 vídeos, 23 formatos,        │   ├── generator.ts        │
│   17 nichos, patterns)           │   ├── niches-data.ts      │
│                                  │   ├── auth-helpers.ts     │
│  Skills                          │   └── supabase/           │
│  ──────                          │       {server,browser,    │
│  skills/                         │        middleware,types}  │
│  ├── reel-downloader             └── middleware.ts           │
│  └── viralobj-reverse-engineer       (protege /app/*)        │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Infraestrutura (externo)                                    │
│  ────────────────────────                                    │
│  Vercel (db8-intelligence/viralobj)   → webapp produção      │
│  Supabase (pclqjwegljrglaslppag)      → schema viralobj      │
│    ├── public.tenants/profiles        (reusado do NexoOmnix)  │
│    └── viralobj.{generations,         (novo)                  │
│                  usage_monthly,                               │
│                  series}                                      │
│  Fal.ai                               → FLUX Pro, MiniMax,   │
│                                         VEED Fabric, Veo 2    │
│  Railway db8-agent (api.db8...)       → secrets vault         │
│  Anthropic / OpenAI / Gemini          → LLM providers         │
│  Kiwify / ASAAS                       → pagamento (não       │
│                                         integrado ainda)     │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Features Detalhadas

### 3.1 Dataset & Conhecimento

| Recurso | Descrição | Status |
|---------|-----------|--------|
| **47 vídeos analisados** | Frame-a-frame, de 6 contas referência: @coisadecasa.ia, @objetosfalantes, @casasincerona, @ajuda.ai.hacks, @oficinassuculentas, @dinheirofalante | ✅ |
| **23 formatos (A-W)** | Cada formato com body, camera, pipeline, tone, flux_template, best_for, caption_style documentados | ✅ |
| **17 nichos** | casa, plantas, financeiro, culinaria, natureza, saude, pets, fitness, maternidade, saude-mental, saude-receitas, gastronomia, skincare-natural, espiritualidade, saude-feminino, imoveis, viagem | ✅ |
| **100+ objetos** | Bibliotecas por nicho com personalidade, voz, prompt AI, cenário brasileiro | ✅ |
| **10 caption styles** | alpha, beta, gamma, gamma-B, gamma-B-rodape, alpha-karaoke, beta-word-karaoke, gamma-emoji-pill, highlight-keyword-color, headline-topo-bold | ✅ |
| **5 body types** | MULTI-STUB, SINGLE-FULL, DRESSED-CHAR, MAP-DOC, RECIPE-MAGIC + variações | ✅ |
| **Expression system** | FUR-3, FUR-4, SAD-2, HPY-1, ALA-2, MIX-1 mapeadas a personality → voice_profile | ✅ |
| **Golden rules** | 50+ regras validadas por formato (TYPE-A-RULE, TYPE-B-RULE, ... TYPE-W-RULE) | ✅ |
| **Series planejadas** | 10 séries com episódios catalogados e prontos para produzir | ✅ |

### 3.2 Pipeline de Geração (MCP Tools)

| Tool | Função | Status |
|------|--------|--------|
| `list_niches` | Lista 17 nichos com bibliotecas de objetos | ✅ |
| `download_reel` | Baixa vídeo do Instagram/TikTok/YouTube (4 estratégias fallback: SnapInsta → SSSTik → yt-dlp → Cobalt) | ✅ |
| `analyze_video` | Extrai frames via ffmpeg + Claude Vision (opus-4-6) → detecta personagens, formato, nicho, expressões | ✅ |
| `generate_package` | Gera pacote bilíngue PT+EN com roteiro, prompts AI, voz, legendas, hashtags, 3 variações. Multi-provider (anthropic/openai/gemini) com fallback | ✅ |
| `generate_video` | Pipeline completo FLUX Pro → MiniMax TTS → VEED Fabric. Suporta pipeline alternativo Google Veo 2. ffmpeg concat para multi-personagem | ✅ |
| `export_artifacts` | Exporta HTML dashboard interativo + SKILL.md instalável no Claude Code | ✅ |
| `post_to_instagram` | Publica via Graph API v21.0. Imediato ou agendado (10min-75d). Suporta Stories | ✅ código / ⚠️ tokens expirados |

### 3.3 Multi-Provider LLM

| Provider | Modelo default | Status | Testado |
|----------|---------------|--------|---------|
| Anthropic | `claude-sonnet-4-6` | ✅ | ✅ end-to-end |
| OpenAI | `gpt-4.1-mini` | ✅ | ✅ end-to-end |
| Gemini | `gemini-2.5-flash` | ✅ | ✅ end-to-end |
| **Fallback chain** | `anthropic,openai,gemini` (configurável via `VIRALOBJ_PROVIDER_ORDER`) | ✅ | ✅ |
| **Provider tracking** | Campo `provider_used` retornado ao caller | ✅ | ✅ |

### 3.4 Pipelines de Vídeo

| Pipeline | Uso ideal | Custo estimado | Status |
|----------|-----------|----------------|--------|
| **FLUX (padrão)** | Estilo Pixar/Disney clássico, objetos domésticos | ~$2-3/reel com 3 personagens | ✅ |
| **Veo 2 (alternativo)** | Movimento orgânico (plantas, líquidos, humanoides), formatos Q/R/S/O | ~$1.50/reel | ✅ |
| **Auto-fallback** | Veo falhou → cai pro FLUX automaticamente | — | ✅ |
| **ffmpeg concat** | Multi-personagem → reel único MP4 | local, grátis | ✅ |
| **AV merge** | Veo video + TTS audio → clip sincronizado | local, grátis | ✅ |

### 3.5 Frontend (Webapp Next.js)

| Área | Páginas | Status |
|------|---------|--------|
| **Público** | `/` (landing), `/niches` (catálogo), `/login`, `/signup` | ✅ |
| **Protegido (/app/*)** | `/app` (dashboard), `/app/generate` (form), `/app/history` (lista) | ✅ |
| **API routes** | `GET /api/niches` (edge), `POST /api/app/generate-package` (nodejs, auth + rate limit) | ✅ |
| **Auth** | Email/senha via Supabase, middleware protegendo `/app/*`, auto-bootstrap tenant+profile no signup, trial de 14 dias | ✅ |
| **Tema** | Dark neon (accent rosa + ciano), glassmorphism cards, Tailwind 3.4 | ✅ |
| **Responsive** | Grid md:/lg: em todas as páginas | ✅ |

### 3.6 Banco de Dados (Supabase — schema `viralobj`)

| Tabela | Colunas principais | Status |
|--------|-------------------|--------|
| `generations` | id, tenant_id, profile_id, niche, objects, topic, tone, duration, provider_used, package (jsonb), created_at | ✅ RLS |
| `usage_monthly` | (tenant_id, month) PK, packages_count, videos_count, posts_count | ✅ RLS |
| `series` | id, tenant_id, name, niche, format, episodes (jsonb), status (draft/active/paused/completed) | ✅ RLS |
| **RPC `increment_usage(tenant_id, counter)`** | Atômico, SECURITY DEFINER, usado pelo API route | ✅ |
| **RPC `get_plan_limit(plan, counter)`** | Retorna limite numérico para cada plano | ✅ |
| **Reusado do NexoOmnix** | `public.tenants` (Stripe/Kiwify integration + addon_talking_objects), `public.profiles` (FK auth.users) | ✅ |

### 3.7 Planos & Rate Limiting

| Plano | Pacotes/mês | Vídeos/mês | Posts/mês | Preço sugerido (a decidir) |
|-------|-------------|------------|-----------|-----|
| **Trial** (14 dias) | 5 | 0 | 0 | Grátis |
| **Starter** | 30 | 10 | 10 | R$ 47/mês |
| **Pro** | 100 | 50 | 50 | R$ 147/mês |
| **Pro+** | 300 | 150 | 150 | R$ 297/mês |
| **Enterprise** | ilimitado | ilimitado | ilimitado | R$ 497+/mês |

Rate limit enforcement:
- ✅ Check no API route antes de gerar
- ✅ Verificação de trial expirado
- ✅ Verificação de `addon_talking_objects` ativo
- ✅ HTTP 402 `LIMIT_REACHED` quando estourar
- ✅ Barras de uso visuais no dashboard (amarelo 70%, vermelho 90%)

### 3.8 Infraestrutura & DevOps

| Componente | Serviço | Status |
|------------|---------|--------|
| **Deploy frontend** | Vercel (`db8-intelligence/viralobj`) | ✅ |
| **Domínio** | `viralobj.vercel.app` | ✅ |
| **Domínio próprio** | `viralobj.com` | ⬜ não configurado |
| **Banco** | Supabase (`pclqjwegljrglaslppag` / nexoominx) | ✅ |
| **Secrets vault** | Railway db8-agent (`api.db8intelligence.com.br`) | ✅ parcial |
| **LLM providers** | Anthropic, OpenAI, Gemini (env vars configuradas em prod) | ✅ |
| **Fal.ai** | FLUX Pro, MiniMax TTS, VEED Fabric, Veo 2 | ✅ (key no MCP, não no webapp) |
| **Git** | Branch main, 9 commits de implementação nesta sessão | ✅ |

---

## 4. O que foi executado (histórico técnico)

### 4.1 Dataset & MCP (sessões anteriores + esta)

Estado inicial: v1.5 (10 vídeos, 9 formatos A-I). Estado final: **v2.0 (47 vídeos, 23 formatos A-W)**.

Commits relevantes desta sessão:

| Commit | O quê |
|--------|-------|
| `7fd8648` | `post_to_instagram` registrado no MCP + `.env.example` + pending docs |
| `f7ce823` | Formatos A-I adicionados ao `FORMATS` object + videos 1-47 no dataset + 6 source accounts |
| `0d14be8` | Veo pipeline + ffmpeg concat + 13 caption styles em `generate_video.js` |
| `0268d6b` | `analyze.js` → opus-4-6 + download timeout 15s→30s |
| `01d0948` | `provider_used` exposto + fallback chain ativada (3 providers testados) |
| `4658f3c` | docs: Instagram tokens Railway expirados |
| `0f98c34` | Next.js 14 frontend inicial deployed to Vercel |
| `9da4750` | Phase 1 — Supabase auth + tenants + rate limiting + dashboard |

### 4.2 Verificações end-to-end completadas

- ✅ MCP server v1.3.0 inicia com 7 tools registradas
- ✅ 23 formatos no FORMATS object + FORMAT_REGISTRY
- ✅ 47 vídeos no dataset (ids 1-47 consecutivos)
- ✅ 17 nichos em NICHES object
- ✅ 6 source_accounts em SOURCE_ACCOUNTS
- ✅ 10 caption_styles em CAPTION_STYLES
- ✅ 3 LLM providers testados live com package válido retornado
- ✅ Webapp build passa limpo (11 rotas)
- ✅ Deploy Vercel: https://viralobj.vercel.app respondendo
- ✅ Middleware protegendo `/app/*` (redirect 307 → `/login?next=/app`)
- ✅ API `/api/niches` retorna 17 nichos + 23 formatos em produção
- ✅ Supabase migration aplicada (schema viralobj + RLS + RPCs)
- ✅ Provider routing: anthropic, openai, gemini todos retornaram `provider_used` correto

### 4.3 Descobertas importantes durante a sessão

- **Instagram tokens no Railway estão expirados** (60 dias). Nem o token, nem o app credential pair funcionam. Código do `post_instagram.js` é válido, só precisa refresh manual.
- **nexoominx já tinha infra pronta** — `tenants.addon_talking_objects boolean` + integração Kiwify/Stripe. Economizou dias de trabalho de auth/billing.
- **MCP Supabase disponível** — permite aplicar migrations direto sem precisar CLI Supabase.

---

## 5. O que ainda falta (roadmap por fase)

### Fase 2 — Monetização (crítico para vender)

| # | Item | Dependências | Executável por mim |
|---|------|--------------|-------------------|
| 1 | **Sales page** (landing virar pricing-first) | — | ✅ |
| 2 | **Pricing components** (4 cards com feature comparison) | Preços finais | ✅ após decisão |
| 3 | **Kiwify webhook handler** (`/api/webhooks/kiwify`) | Kiwify account + produtos criados | ✅ |
| 4 | **Stripe webhook handler** (alternativa international) | Stripe account | ✅ |
| 5 | **Checkout flow** (redirecionar para Kiwify product URL) | Produtos Kiwify criados | ✅ |
| 6 | **Post-payment bootstrap** (criar user + tenant + upgrade plan) | Webhook funcionando | ✅ |
| 7 | **Billing page** (`/app/billing`) — vê plano atual, upgrade, cancelar | — | ✅ |
| 8 | **Termos de uso** (ToS) | CNPJ + endereço | ✅ template, você valida |
| 9 | **Política de privacidade** (LGPD) | CNPJ + endereço + DPO email | ✅ template |
| 10 | **Política de reembolso** | — | ✅ template |
| 11 | **Cookie consent banner** | — | ✅ |
| 12 | **Domínio viralobj.com** | Registro + DNS | ⬜ você precisa ter o domínio |

### Fase 3 — Produto real (crítico para retenção)

| # | Item | Dependências | Executável por mim |
|---|------|--------------|-------------------|
| 1 | **Video generation via web** (job queue async) | Decisão: Inngest / Railway / Modal | ✅ após decisão |
| 2 | **Storage de vídeos** (Supabase Storage) | — | ✅ |
| 3 | **Status polling UI** (ver progresso de geração) | Job queue | ✅ |
| 4 | **Webhook de notificação** quando vídeo pronto | Job queue | ✅ |
| 5 | **Instagram OAuth por usuário** | App Meta novo/consertado | ✅ após app Meta |
| 6 | **Token refresh automático** (cron 50 dias) | OAuth funcionando | ✅ |
| 7 | **Calendário de posts** (drag-drop visual) | — | ✅ |
| 8 | **Auto-posting scheduler** (Inngest/QStash cron) | Instagram OAuth | ✅ |
| 9 | **Séries gerenciadas** (reutiliza `viralobj.series`) | — | ✅ |
| 10 | **Analytics de performance** (likes, views, saves por reel) | Instagram Insights API | ✅ |

### Fase 4 — Crescimento

| # | Item | Dependências | Executável por mim |
|---|------|--------------|-------------------|
| 1 | **Onboarding interativo** no primeiro login | — | ✅ |
| 2 | **Email marketing** drip sequence (Resend/N8N) | Resend key | ✅ |
| 3 | **Analytics site** (Plausible / PostHog) | Account no serviço | ✅ após conta |
| 4 | **SEO + OG images** dinâmicas | — | ✅ |
| 5 | **Blog /docs** para captura orgânica | — | ✅ |
| 6 | **Referral program** | — | ✅ |
| 7 | **Afiliados via Kiwify** | Kiwify setup | ✅ |
| 8 | **WhatsApp support** (Z-API + N8N) | Z-API configurado | ✅ |
| 9 | **Mobile-first polish** + PWA | — | ✅ |

### Fase 5 — Escala (pós first paying customer)

| # | Item | Notas |
|---|------|-------|
| 1 | **Error monitoring** (Sentry) | Sentry account |
| 2 | **Logs centralizados** (BetterStack / Axiom) | — |
| 3 | **Rate limiting por IP** além de por tenant | Upstash Redis |
| 4 | **Moderação de conteúdo AI** | OpenAI moderation endpoint |
| 5 | **Team/workspace features** (múltiplos users por tenant) | `profiles.role` já existe — só UI |
| 6 | **API pública** (Enterprise plan) | Rate limiting + auth keys |
| 7 | **White-label** (custom domain + branding) | Next.js middleware custom |
| 8 | **Mobile app** (React Native / Expo) | — |

---

## 6. Pendências específicas que estão bloqueando

### 6.1 Decisões que dependem só de você

| Decisão | Impacto se não tomada | Recomendação |
|---------|----------------------|--------------|
| **Preços finais dos planos** | Bloqueia sales page + pagamento | Usar os valores sugeridos acima (R$47/147/297/497) e testar |
| **Domínio `viralobj.com`** | DNS + emails + credibilidade | Verificar se está registrado; se não, comprar |
| **Payment provider** (Kiwify vs Stripe) | Bloqueia webhook + checkout | Kiwify (BR-only, mais rápido de integrar, já está no stack) |
| **CNPJ + razão social** | Bloqueia ToS + Privacy + Kiwify producer | Obrigatório para vender legalmente |
| **App Meta / Instagram** | Bloqueia auto-posting | Criar novo no developers.facebook.com |
| **Tokens Instagram** | Bloqueia post_to_instagram | Regenerar no Meta Business Suite |

### 6.2 Bloqueios técnicos conhecidos

| Bloqueio | Descrição | Solução |
|----------|-----------|---------|
| **Instagram tokens expirados** | 3 tokens + app credentials no Railway retornam `Cannot parse access token` | Refresh manual no Meta Business |
| **Video gen timeout Vercel** | Pipeline leva 5-10min, Vercel limita 60s (hobby) / 300s (pro) | Mover para worker async (Inngest recomendado) |
| **ffmpeg em Vercel serverless** | Não disponível no Edge, disponível no Node runtime com layer. Concat funciona local, não em prod | Usar worker externo para vídeo |
| **Sync niches.js ↔ niches-data.ts** | Dois arquivos precisam sync manual quando adicionar formatos/nichos | Criar script `npm run sync:niches` |

---

## 7. Custos operacionais estimados (mensal)

### Atualmente rodando (mínimo)

| Serviço | Custo | Notas |
|---------|-------|-------|
| Vercel Hobby | $0 | Suficiente para MVP, upgrade $20/mo quando passar de 100GB bandwidth |
| Supabase (shared no nexoominx) | $0 adicional | Reusa projeto existente |
| Anthropic (variável) | ~$0.01/package | Paga-por-uso, sem assinatura |
| OpenAI (variável) | ~$0.005/package | Paga-por-uso |
| Gemini (variável) | ~$0.002/package | Paga-por-uso |
| **TOTAL fixo** | **$0** | **Paga só quando gera conteúdo** |

### Após Fase 3 (com video generation)

| Serviço | Custo | Notas |
|---------|-------|-------|
| Fal.ai (variável) | ~$2-4/reel | FLUX + TTS + Fabric |
| Veo 2 (via Fal.ai) | ~$1.50/reel | Alternativa organic motion |
| Inngest Free tier | $0 | Até 50k steps/mês |
| Vercel Pro | $20 | Timeouts maiores, bandwidth |
| **TOTAL fixo** | **$20/mês** | + custos variáveis por geração |

### Unit economics (preços sugeridos)

| Plano | Receita | Custo (média 50% de uso) | Margem |
|-------|---------|-------------------------|--------|
| Starter R$47 | R$47 | R$30 (15 pacotes + 5 vídeos) | **R$17 / 36%** |
| Pro R$147 | R$147 | R$80 (50 pacotes + 25 vídeos) | **R$67 / 46%** |
| Pro+ R$297 | R$297 | R$190 (150 pacotes + 75 vídeos) | **R$107 / 36%** |

_Assumindo 1 USD = R$5. Valores aproximados — a conta real depende do mix de geração._

---

## 8. Métricas de sucesso sugeridas

### KPIs produto
- **Ativação:** % de signups que geram ≥1 pacote no trial
- **Conversão trial → pago:** % que upgradam após 14 dias
- **Churn mensal:** % de cancelamentos
- **LTV / CAC:** Lifetime value vs Custo de aquisição
- **Reels publicados por usuário/mês**
- **Viral rate:** % de reels gerados que atingem 10k+ views

### KPIs técnicos
- **p95 latência /api/app/generate-package**
- **Error rate LLM providers** (cada um)
- **Custo médio real por pacote gerado**
- **Uptime do webapp**

---

## 9. Caminho crítico até primeira venda

**Assumindo 1 sprint = 1 sessão comigo:**

```
Sprint 1 ── ✅ (já feito)
└── Fase 1 completa: auth + dashboard + rate limit

Sprint 2 ── Sales page + Kiwify webhook
├── Pricing page com 4 tiers
├── /api/webhooks/kiwify handler
├── /app/billing page
└── Upgrade flow end-to-end

Sprint 3 ── Legal + Domain
├── ToS, Privacy, Refund templates
├── Cookie consent
├── Configurar viralobj.com no Vercel
├── Email transacional (Resend)
└── Deploy final

                 ┌─────────────────┐
                 │ PRIMEIRA VENDA  │  ← Depois do Sprint 3
                 └─────────────────┘

Sprint 4 ── Video generation production (retenção)
├── Inngest setup
├── Worker job de geração
├── Status polling UI
└── Storage + signed URLs

Sprint 5 ── Instagram auto-post (killer feature)
├── Refresh tokens Meta
├── OAuth per-user
├── Calendário posts
└── Scheduler cron
```

**Gap realista entre hoje e primeira venda:** ~2-3 sprints de trabalho meu + suas decisões sobre pricing/legal/domínio.

---

## 10. Decisões que eu preciso de você para destravar

### Prioridade máxima (bloqueia Sprint 2)

1. ✅ **Preços finais** — confirma os valores sugeridos ou me dá os seus
2. ✅ **Payment provider** — Kiwify ou Stripe?
3. ✅ **Domínio** — você é dono de viralobj.com? Se sim, libera acesso DNS (Vercel); se não, compra

### Prioridade alta (bloqueia Sprint 3)

4. ✅ **Dados legais** — CNPJ, razão social, endereço, email DPO
5. ✅ **Marca visual** — OK manter o tema atual (dark neon) ou quer personalizar?

### Prioridade média (bloqueia Sprint 5)

6. ✅ **App Meta Instagram** — criar novo ou consertar o existente?
7. ✅ **Worker architecture** — Inngest (recomendado) ou outro?

### Nice-to-have

8. Analytics provider (Plausible / PostHog / GA)
9. Email provider (Resend já está no Railway — só confirmar)
10. Error monitoring (Sentry?)

---

## 11. Arquivos-chave do projeto

### Core MCP
- `mcp/index.js` — server registrando 7 tools
- `mcp/tools/niches.js` — 1500+ linhas, fonte da verdade do dataset
- `mcp/tools/generate.js` — multi-provider LLM router
- `mcp/tools/generate_video.js` — FLUX + Veo pipelines + ffmpeg
- `mcp/tools/analyze.js` — Claude Vision frame analysis
- `training-data/dataset.json` — 47 vídeos, 23 formatos, 17 nichos

### Web App
- `webapp/app/page.tsx` — landing
- `webapp/app/app/` — dashboard protegido
- `webapp/app/login/` + `/signup/` — auth
- `webapp/app/api/app/generate-package/route.ts` — API com rate limit
- `webapp/lib/generator.ts` — generator standalone
- `webapp/lib/supabase/` — clients SSR/browser/middleware
- `webapp/lib/auth-helpers.ts` — getSessionContext()
- `webapp/middleware.ts` — protege /app/*

### Infra & Config
- `CLAUDE.md` — project instructions + known pending
- `webapp/.env.example` — template de env vars
- `docs/ecosistema-arquitetura.md` — arquitetura DB8 Intelligence

### Memória persistente (Claude Code)
- `~/.claude/projects/c--Users-Douglas-viralobj/memory/`
  - `MEMORY.md` — índice
  - `project_instagram_deferred.md` — tokens expirados
  - `reference_railway_db8agent.md` — como buscar secrets
  - `reference_vercel_deployment.md` — como fazer deploy

---

## 12. Resumo Executivo (para stakeholder não-técnico)

**O que é:** Um SaaS que gera reels virais do Instagram automaticamente, usando objetos 3D animados que falam em primeira pessoa, estilo Pixar. O usuário escolhe nicho e tópico; a IA cria roteiro, visual, voz e legendas.

**Onde está:** MVP técnico completo. Dataset com 47 vídeos virais reais analisados. Frontend com login, dashboard, sistema de planos, histórico. Rodando em https://viralobj.vercel.app.

**O que funciona hoje:**
- Criar conta gratuitamente (trial 14 dias)
- Gerar pacote completo de reel (roteiro + prompts visuais + hashtags bilíngue)
- Rate limiting por plano
- Histórico pessoal
- 17 nichos + 23 formatos catalogados

**O que falta para vender:**
- Página de vendas com pricing
- Integração de pagamento (Kiwify/Stripe)
- Termos legais
- Domínio próprio
- (opcional) Geração de vídeo MP4 real via web
- (opcional) Publicação automática no Instagram

**Diferencial competitivo:**
- Dataset proprietário de 47 vídeos virais já analisados
- 23 formatos visuais específicos validados
- Multi-provider LLM com fallback (nunca fica offline)
- Dois pipelines de vídeo (FLUX estilo Pixar + Veo para movimento orgânico)
- Reusa infra de SaaS existente (NexoOmnix) — time-to-market acelerado

**Gap até primeira venda:** 2-3 sessões de desenvolvimento + decisões de pricing, legal e pagamento.

**Custos operacionais:** ~$0/mês em idle, ~$20/mês após ativar video generation, ~R$2-10 por pacote gerado dependendo do plano.

---

_Relatório gerado automaticamente em 2026-04-12 por Claude Code._
_Fonte da verdade: commits `9da4750` (Phase 1) + `0f98c34` (Initial webapp) + dataset v2.0._
