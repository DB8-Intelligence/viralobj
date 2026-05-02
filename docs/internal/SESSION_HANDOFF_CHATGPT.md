# ViralObj — Session Handoff para ChatGPT
**Data:** 2026-04-15 (snapshot — produção migrou para Google Cloud em Sprint 22)
**Autor:** Douglas Bonânzza (DB8 Intelligence)
**Produto:** viralobj.com — SaaS de geração de reels virais com objetos 3D falantes (Talking Objects)
**Repo:** <https://github.com/DB8-Intelligence/viralobj> (branch `main`, commit atual `d4553e7`)

---

## Produção oficial (atual)

- Landing: <https://viralobj.com>
- Dashboard: <https://www.viralobj.app>
- API: <https://api.viralobj.app>
- DNS: Google Cloud DNS
- Hosting: Google Cloud Run
- Vercel: não utilizado

> Comandos `vercel --prod` e a URL `viralobj.vercel.app` abaixo são registro
> histórico — não usar.

---

## 1. Contexto do produto

ViralObj é um SaaS que gera pacotes completos de reels para Instagram com personagens 3D estilo Pixar/Disney que falam em primeira pessoa sobre erros cotidianos. Output bilíngue PT+EN. Pipeline: download → análise → reverse-engineer → geração → vídeo → post automático.

**Stack:**
- Frontend: Next.js 14.2.35 App Router + TypeScript + Tailwind + shadcn-like UI
- Backend: Next.js API routes (nodejs runtime) + MCP server local (mcp/)
- DB/Auth: Supabase (projeto `nexoominx`, ID `pclqjwegljrglaslppag`, us-west-2, compartilhado com outro produto)
- LLM: Multi-provider com fallback (Anthropic Claude Sonnet 4.6 → OpenAI GPT-4.1 mini → Gemini 2.5 Flash)
- Vídeo: Fal.ai (FLUX.2 Pro → MiniMax TTS → VEED Fabric) — **ainda não integrado ao webapp**, só no MCP local
- Deploy: Vercel (team DB8-Intelligence)
- Pagamentos: Kiwify (roadmap, adiado até testes internos terminarem)

**Schemas Supabase:**
- `public.tenants`, `public.profiles` — multi-tenant reusado do NexoOmnix
- `viralobj.generations`, `viralobj.usage_monthly`, `viralobj.series`, `viralobj.ip_rate_limits`
- Todas com RLS ativa (exceto `ip_rate_limits` cujo acesso é SECURITY DEFINER)

**10 nichos validados:** casa, plantas, financeiro, culinaria, natureza, saude, pets, fitness, maternidade, saude-mental (72 objetos no total)

---

## 2. Estado atual do projeto (pós-QA completa)

### ✅ Funcionando em produção
- Landing page completa (9 seções), legal (termos/privacidade/reembolso/cookies), pricing standalone
- Signup/login (email-senha) + **Google OAuth** recém-adicionado (requer config no Supabase dashboard)
- Dashboard multi-tenant protegido (`/app/*`) com sidebar + usage bars + trial countdown
- API `/api/app/generate-package` com auth + rate limit atômico + persist + fallback LLM
- Security headers completos (CSP, HSTS, X-Frame-Options, Permissions-Policy)
- Rate limiting por IP (signup 10/h, login 15/15min, generate 20/min) + quota por tenant (plano)
- Bootstrap transacional de tenant+profile via RPC + trigger em `auth.users`
- Lazy bootstrap fallback em `getSessionContext()` — elimina loop órfão

### ⏳ Pendente / Em progresso
1. **Smoke test manual E2E (USUÁRIO):** signup real → dashboard → gerar pacote → conferir contador. Usuário ia fazer mas atingiu IP rate limit (falso positivo, já limpo). Aguardando teste.
2. **Sprint 4 — Video worker:** portar pipeline Fal.ai do MCP pro webapp. Hoje usuário só recebe JSON do pacote, não vídeo final. É o "uau" do produto.
3. **Sprint 3 — Kiwify checkout:** adiado intencionalmente até testes internos terminarem. Trial/plano hoje é só visual (sem webhook, sem upgrade real).
4. **Editar preços e features:** usuário quer revisar textos/valores. Planilha `docs/viralobj-pricing.xlsx` gerada para ele preencher e devolver.

### 🚫 Explicitamente deferido
- Instagram Graph API auto-post (tokens expirados, funcionalidade em `/mcp/tools/post_instagram.js` mas desconectada do webapp)
- Fluxo de pagamento real (Kiwify)
- Webhooks de assinatura / mudança de plano

---

## 3. Auditoria QA realizada nesta sessão

Rodou sequência **qa-supervisor → qa-autotest → qa-pipeline** sobre 6 módulos core. Identificou 3 P0, 5 P1, 8 P2. Plano de correção em 3 sprints (A/B/C), **todos executados e deployados**.

### Sprint A — P0s críticos (concluído)
1. **Race condition no rate limit** — `webapp/app/api/app/generate-package/route.ts` era check-then-act com 5-30s de LLM call entre o check e o increment. Corrigido com RPC atômica `viralobj.reserve_quota(tenant_id, counter, limit)` que usa INSERT ON CONFLICT + UPDATE condicional. Se LLM ou insert falhar → `release_quota`.
2. **Bootstrap tenant não-transacional** — `signupAction` criava tenant, depois profile, sem transação. Se o segundo falhasse, órfão. Corrigido com PL/pgSQL `public.bootstrap_tenant_viralobj(user_id, email, full_name)`. Bônus: trigger `on_auth_user_confirmed_viralobj` em `auth.users` que dispara em INSERT ou UPDATE de `email_confirmed_at`. Resolve o caso "email confirmation ON" também.
3. **Sem IP rate limit** — risco de bot farm drenar trial ($500+ em LLM costs). Corrigido com tabela `viralobj.ip_rate_limits` + RPC `check_ip_rate_limit(ip, bucket, limit, window_seconds)`. Helper em `webapp/lib/ip-rate-limit.ts` com fail-closed em produção para buckets críticos (signup/login/generate_package).
4. **Security headers ausentes** — adicionados em `webapp/next.config.mjs`: CSP completo, HSTS 2 anos, X-Frame-Options:DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
5. **Loop órfão signup** — se user chegasse com auth mas sem profile, middleware.ts redirecionava /app ↔ layout.tsx redirect /login infinitamente. Corrigido com lazy bootstrap em `auth-helpers.ts:38` que detecta PGRST116 e chama bootstrap + retry.

### Sprint B — LLM hardening (concluído)
1. **Sem timeout** — cada provider agora envolto em `withTimeout(fn, 20000, label)` com AbortController. Fallback chain finalmente funciona (antes um provider lento consumia todo `maxDuration=60`).
2. **parseJson regex frágil** — `/\{[\s\S]*\}/` greedy quebrava com prose ou objetos aninhados. Substituído por parser com depth tracking que respeita strings e escapes.
3. **Anthropic prefill `{`** — força JSON-only, elimina prose leading.
4. **ProviderChainError** — classe tipada exportada. Route retorna 503 `ALL_PROVIDERS_FAILED` com mensagem genérica em vez de vazar `provider: model: status: body`.
5. **Error sanitization** — route gera `reqId` (crypto.randomUUID 8-char), loga erros server-side com requestId, retorna mensagens genéricas pro cliente. `maxDuration` aumentado de 60 → 90s para suportar 3× timeout de 20s.
6. **try/catch em req.json()** — body malformado agora retorna 400 correto.

### Sprint C — Polish (concluído)
1. **User enumeration em login** — erro de `signInWithPassword` vazava "Email not confirmed" vs "Invalid credentials". Normalizado para "Credenciais inválidas."
2. **Signup validation server-side** — nome ≥2 chars, email regex, senha ≥6, email normalizado (trim+lowercase).
3. **`formatLimit()` + `formatUsagePct()`** helpers centralizados em `webapp/lib/supabase/types.ts`. Plano enterprise (999999) agora mostra "∞" consistentemente em layout, billing, dashboard.

### Commits
- `955fa16` — fix(webapp): QA hardening — P0/P1 fixes from 3-agent audit
- `d4553e7` — feat(webapp): Google OAuth + loosen IP rate limits

Ambos pushados pra `origin/main`. Deploys Vercel ao vivo.

---

## 4. Google OAuth — status

**Implementado:**
- `webapp/components/GoogleAuthButton.tsx` — client component usando `createBrowserClient` do `@supabase/ssr`, chama `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback' }})`
- `webapp/app/auth/callback/route.ts` — rota server que faz `exchangeCodeForSession(code)` e chama `bootstrap_tenant_viralobj` como safety-net (o trigger deveria ter rodado, mas defensivo)
- Botão "Entrar com Google" / "Criar conta com Google" em `/login` e `/signup` com separador "ou com email"

**Pendente (USUÁRIO precisa fazer):**
1. Ir em https://supabase.com/dashboard/project/pclqjwegljrglaslppag/auth/providers
2. Habilitar Google provider
3. Colar Client ID + Client Secret vindos do Google Cloud Console
4. No Google Cloud: criar OAuth 2.0 Client ID (Web application) com authorized redirect URI = `https://pclqjwegljrglaslppag.supabase.co/auth/v1/callback`

---

## 5. Arquivos-chave (guia rápido)

```
webapp/
├── app/
│   ├── page.tsx                              # Landing (composição de 10 sections)
│   ├── login/
│   │   ├── page.tsx                          # Login client + Google button
│   │   └── actions.ts                        # loginAction, signupAction, logoutAction
│   ├── signup/page.tsx                       # Signup com plan pre-fill + Google
│   ├── auth/callback/route.ts                # OAuth callback + safety bootstrap
│   ├── pricing/page.tsx                      # Standalone pricing
│   ├── legal/{termos,privacidade,reembolso,cookies}/page.tsx
│   ├── app/                                  # Dashboard protegido
│   │   ├── layout.tsx                        # Sidebar + usage bars + redirect
│   │   ├── page.tsx                          # Dashboard home
│   │   ├── generate/page.tsx                 # Form de geração
│   │   ├── history/page.tsx                  # Histórico
│   │   └── billing/page.tsx                  # View-only billing
│   └── api/app/generate-package/route.ts     # Core API: IP limit + auth + quota + LLM + persist
├── components/
│   ├── GoogleAuthButton.tsx                  # Shared Google OAuth button
│   ├── Footer.tsx, CookieConsent.tsx
│   └── landing/{Hero,Pricing,FAQ,...}.tsx    # 10 landing sections
├── lib/
│   ├── landing-data.ts                       # PRICING_PLANS, FEATURES, FAQ, STATS, NICHES_SHOWCASE
│   ├── supabase/
│   │   ├── server.ts                         # createClient (SSR), createServiceClient (bypass RLS)
│   │   ├── middleware.ts                     # updateSession + /app/* protection
│   │   └── types.ts                          # PlanType, PLAN_LIMITS, formatLimit
│   ├── auth-helpers.ts                       # getSessionContext + lazy bootstrap
│   ├── generator.ts                          # Multi-provider LLM router + parseJson + timeouts
│   └── ip-rate-limit.ts                      # checkIpRateLimit + fail-closed
├── middleware.ts                             # Entry point (protects /app/*)
└── next.config.mjs                           # Security headers

docs/
├── PROJECT_REPORT.md                         # Relatório completo (Phase 1)
├── MASTER_SUPERVISION_PROMPT.md              # Prompt de supervisão externa
├── LANDING_PAGE_PROMPT_NEUTRAL.md            # Prompt brand-safe (Miro)
├── viralobj-pricing.xlsx                     # ← Planilha para Douglas editar preços
└── SESSION_HANDOFF_CHATGPT.md                # Este arquivo

mcp/
├── index.js                                  # MCP stdio server
└── tools/                                    # analyze, generate, generate_video, export, niches, post_instagram
```

---

## 6. Variáveis de ambiente (produção na Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://pclqjwegljrglaslppag.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...              # bypass RLS, server only
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GEMINI_API_KEY=...
VIRALOBJ_PROVIDER_ORDER=anthropic,openai,gemini    # opcional
ANTHROPIC_MODEL=claude-sonnet-4-6          # opcional
OPENAI_MODEL=gpt-4.1-mini                  # opcional
GEMINI_MODEL=gemini-2.5-flash              # opcional
FAL_KEY=...                                # só usado no MCP local por ora
```

Instagram tokens **todos expirados** (intencional, postagem deferida).
Kiwify **ainda não configurado**.

---

## 7. Decisões de arquitetura importantes

1. **Não criar projeto Supabase novo** — reusar `nexoominx` por economia ($10/mo) e porque ViralObj será absorvido pelo NexoOmnix depois. Schema `viralobj` isolado do schema `public`.
2. **Addon `addon_talking_objects` boolean em `tenants`** — já existia no NexoOmnix, permite habilitar/desabilitar ViralObj por workspace sem duplicar infra.
3. **Não usar Upstash/Redis** para IP rate limit — tabela Supabase + RPC SECURITY DEFINER é suficiente no MVP, zero deps novas.
4. **Compra/pagamento é a última função** — decisão explícita do Douglas. Focar em UX + produto antes de wire up Kiwify.
5. **Bilingual PT+EN** — nicho Brasil primeiro, mas pacotes já saem com captions/hashtags EN para facilitar expansão.
6. **MCP e webapp têm código de geração duplicado** — intencional. MCP serve dev local + agents Claude.ai, webapp serve clientes web. Futuro: extrair pacote compartilhado quando estabilizar.

---

## 8. Próximas etapas propostas (ordem sugerida)

1. **Douglas termina smoke test manual** (signup real + gerar 1 pacote via UI)
2. **Douglas habilita Google provider no Supabase** (~5 min)
3. **Douglas preenche `docs/viralobj-pricing.xlsx`** com novos preços/features e devolve
4. **Assistente aplica mudanças de pricing** em `landing-data.ts` + `PLAN_LIMITS` em `types.ts`
5. **Sprint 4 — Video worker** (~6h): portar pipeline Fal.ai do MCP pro webapp. Criar background worker ou função serverless de longa duração. Output: .mp4 no Supabase Storage + URL no row `generations`.
6. **Sprint 3 — Kiwify checkout** (~4h): webhook handler, upgrade automático de plano, página de obrigado.
7. **Beta fechado com 5-10 usuários** — dogfooding + feedback real.
8. **Primeira venda pública.**

---

## 9. Memórias persistidas (auto-memory local)

- Instagram posting deferido
- Railway db8-agent é vault central (Project-Access-Token header, não Bearer)
- Vercel deploy: `cd webapp && vercel --prod --yes`
- Supabase projeto nexoominx (`pclqjwegljrglaslppag`) é compartilhado com ViralObj

---

## 10. Como retomar este trabalho no ChatGPT

Cole este arquivo inteiro como system/context inicial. Depois mencione qual das "Próximas etapas" você quer atacar. O ChatGPT terá contexto completo sem precisar explorar o repo.

**Para aplicar mudanças de código** via ChatGPT: peça diffs unificados e aplique manualmente. Para operações em DB (Supabase RPCs/triggers): peça o SQL e execute via dashboard ou MCP Supabase.

**Credenciais nunca devem ser coladas no ChatGPT.** Elas vivem em Vercel env vars + Railway db8-agent vault + `.env` local.
