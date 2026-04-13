# ViralObj — Master Supervision Prompt

**Uso:** Cole este documento inteiro em qualquer LLM (Claude, GPT-4, Gemini) para que ele atue como revisor sênior do projeto ViralObj. Auto-contido — não precisa acesso ao repositório.

**Gerado em:** 2026-04-12
**Versão do projeto:** Fase 1 (Auth + Dashboard deployed)
**URL produção:** https://viralobj.vercel.app

---

## 🎯 PAPEL DO REVISOR

Você é um **Staff Engineer + Product Manager sênior** contratado para fazer uma supervisão geral completa do projeto **ViralObj**. Seu trabalho é:

1. **Auditar** a arquitetura, código, schema de banco, fluxos de auth e rate limiting apresentados abaixo
2. **Identificar riscos** críticos de segurança, performance, UX ou escalabilidade
3. **Questionar decisões** que pareçam subótimas e propor alternativas concretas
4. **Validar o plano comercial** (pricing, unit economics, caminho até primeira venda)
5. **Priorizar** as próximas ações do roadmap com impacto × esforço
6. **Entregar** um relatório de supervisão estruturado conforme a seção "DELIVERABLES" no final

Seja direto, específico e cite o item exato que está comentando (ex: "no API route `/api/app/generate-package` linha X"). Evite generalidades como "melhore os testes" — diga exatamente o que testar, onde, como.

---

## 📖 CONTEXTO DE NEGÓCIO

**Produto:** SaaS que gera reels virais do Instagram usando objetos 3D animados estilo Pixar/Disney que falam em primeira pessoa. Usuário escolhe nicho e tópico → IA retorna pacote completo (roteiro bilíngue PT+EN, prompts visuais, voz, legendas, hashtags) → (opcional) gera vídeo MP4 via Fal.ai → (opcional) publica no Instagram via Graph API.

**Diferencial:** Dataset proprietário de **47 vídeos virais reais** analisados frame-a-frame, extraindo **23 formatos visuais repetíveis** (A-W) e **17 nichos** validados, com **100+ objetos catalogados**.

**Target:** Criadores de conteúdo BR que querem automatizar produção de reels (nichos: casa, plantas, saúde, culinária, espiritualidade, skincare).

**Modelo de receita:** SaaS recorrente com planos (trial → starter → pro → pro+ → enterprise).

**Ecossistema:** Produto da **DB8 Intelligence**, planejado para virar módulo do SaaS maior **NexoOmnix**. Por isso reusa a infra de auth/billing/tenants do nexoominx.

---

## 🏗️ STACK TECNOLÓGICO

| Camada | Tecnologia | Versão/Notas |
|--------|------------|--------------|
| **Frontend** | Next.js App Router + TypeScript + Tailwind CSS | 14.2.35 (patched), TS 5, Tailwind 3.4 |
| **Backend API** | Next.js Route Handlers (nodejs + edge runtimes) | 60s maxDuration para generate |
| **Auth** | Supabase Auth (JWT cookies via @supabase/ssr) | email+senha, middleware SSR |
| **Database** | Supabase PostgreSQL 17 (project: `pclqjwegljrglaslppag` / nexoominx) | us-west-2, RLS enabled |
| **LLM** | Anthropic Claude 4.6, OpenAI GPT-4.1-mini, Google Gemini 2.5 Flash | Fallback chain configurável |
| **Image gen** | Fal.ai → FLUX Pro v1.1 | Para personagens 9:16 |
| **Video gen** | Fal.ai → VEED Fabric 1.0 (lip sync) + Google Veo 2 (organic) | Pipeline dual |
| **TTS** | Fal.ai → MiniMax TTS | 9 voice profiles (angry, furious, alarmed, etc.) |
| **Deploy** | Vercel (`db8-intelligence/viralobj`) | Free tier |
| **Secrets vault** | Railway (`api.db8intelligence.com.br`) | FastAPI + GraphQL access via Project Token |
| **MCP integration** | @modelcontextprotocol/sdk (stdio transport) | Para uso CLI no Claude Code |
| **Payment (planejado)** | Kiwify (BR, já no ecossistema) ou Stripe | Não integrado ainda |

---

## 🗂️ ESTRUTURA DE PASTAS (REAL)

```
c:/Users/Douglas/viralobj/
├── CLAUDE.md                              # project instructions
├── README.md
├── bootstrap.sh                           # setup script
├── package.json                           # raiz (MCP server)
├── sync.sh                                # git sync helper
│
├── mcp/                                   # MCP SERVER (Node, stdio)
│   ├── index.js                           # registers 7 tools
│   ├── paths.js                           # path resolver
│   └── tools/
│       ├── analyze.js                     # ffmpeg + Claude Vision
│       ├── download_reel.js               # 4-strategy fallback
│       ├── export.js                      # HTML dashboard + SKILL.md
│       ├── generate.js                    # multi-provider LLM
│       ├── generate_video.js              # FLUX + Veo + ffmpeg concat
│       ├── niches.js                      # 1500+ lines: FORMATS, NICHES, etc.
│       └── post_instagram.js              # Graph API v21.0
│
├── training-data/
│   ├── dataset.json                       # 47 videos, 23 formats, 17 niches
│   ├── references/                        # 9 reference modules
│   ├── reel-references/                   # visual style guide
│   └── reverse-engineer-samples/
│
├── skills/                                # Claude Code skills (read during MCP use)
│   ├── reel-downloader.md                 # v2.0 pipeline orchestrator
│   ├── reel-downloader-v2-SKILL.md
│   ├── instagram-viral-engine.md
│   ├── instagram-viral-engine.skill
│   ├── reel-content-generator.skill
│   ├── CLAUDE-reelcreator.md
│   ├── viralobj-reverse-engineer/         # 5-module reverse engineering
│   └── [niche-specific folders]           # casa, culinaria, financeiro, etc.
│
├── webapp/                                # NEXT.JS 14 WEB APP (deployed to Vercel)
│   ├── package.json                       # next 14.2.35, @supabase/ssr, @anthropic-ai/sdk
│   ├── tsconfig.json
│   ├── tailwind.config.ts                 # dark neon theme
│   ├── postcss.config.mjs
│   ├── next.config.mjs
│   ├── middleware.ts                      # protects /app/*, refreshes session
│   │
│   ├── app/                               # App Router
│   │   ├── layout.tsx                     # root (public nav, detects logged-in)
│   │   ├── globals.css                    # tailwind + custom utilities
│   │   ├── page.tsx                       # LANDING (/)
│   │   ├── niches/
│   │   │   └── page.tsx                   # PUBLIC catalog (/niches)
│   │   ├── login/
│   │   │   ├── actions.ts                 # Server Actions: login, signup, logout, bootstrapTenant
│   │   │   └── page.tsx                   # /login
│   │   ├── signup/
│   │   │   └── page.tsx                   # /signup
│   │   ├── app/                           # PROTECTED (middleware redirect to /login)
│   │   │   ├── layout.tsx                 # Sidebar + workspace + usage bars + logout
│   │   │   ├── page.tsx                   # /app (dashboard)
│   │   │   ├── generate/
│   │   │   │   └── page.tsx               # /app/generate
│   │   │   └── history/
│   │   │       └── page.tsx               # /app/history
│   │   └── api/
│   │       ├── niches/
│   │       │   └── route.ts               # GET /api/niches (edge, public)
│   │       └── app/
│   │           └── generate-package/
│   │               └── route.ts           # POST /api/app/generate-package (nodejs, auth + rate limit)
│   │
│   └── lib/
│       ├── niches-data.ts                 # TS mirror of niches.js (17 niches + 23 formats)
│       ├── generator.ts                   # Multi-provider LLM router (Anthropic/OpenAI/Gemini)
│       ├── auth-helpers.ts                # getSessionContext() → profile + tenant + usage + limits
│       └── supabase/
│           ├── types.ts                   # TS interfaces + PLAN_LIMITS constants
│           ├── server.ts                  # createClient() with cookies + createServiceClient()
│           ├── browser.ts                 # createBrowserClient for client components
│           └── middleware.ts              # updateSession() for middleware.ts
│
└── docs/
    ├── PROJECT_REPORT.md                  # Complete stakeholder report (12 sections)
    ├── MASTER_SUPERVISION_PROMPT.md       # This file
    └── ecosistema-arquitetura.md          # DB8 Intelligence ecosystem architecture
```

---

## 📦 INVENTÁRIO DE TELAS (ROTAS DO WEBAPP)

### Públicas

| Rota | Tipo | Função | Componentes-chave |
|------|------|--------|-------------------|
| `/` | Server Component | Landing page marketing. Hero com gradient, 4 features grid, pipeline de 4 steps, CTA final. Nav detecta logged-in state. | Hero, FeaturesGrid, PipelineSteps, CTAcard |
| `/niches` | Server Component (static) | Catálogo público dos 17 nichos + tabela dos 23 formatos. Cards com tom-colored badges. | NichesGrid, FormatsTable |
| `/login` | Client Component | Form de login email/senha. Usa Server Action `loginAction`. Suporta `?next=/app/generate` redirect. | Form, useState (error, loading) |
| `/signup` | Client Component | Form de cadastro (nome, email, senha). Usa Server Action `signupAction` que auto-cria tenant + profile + trial 14d. | Form, useState (error, success, loading) |

### Protegidas (middleware redirect to `/login?next=...` se não autenticado)

| Rota | Tipo | Função | Componentes-chave |
|------|------|--------|-------------------|
| `/app` | Server Component | Dashboard. Stats cards (pacotes/vídeos/posts usados), CTA "Nova geração", lista 5 gerações recentes. | StatCard, GenerationsList |
| `/app/layout.tsx` | Server Component | Layout comum a todas as rotas `/app/*`. Sidebar com workspace name + plan badge + nav (Dashboard, Nova geração, Histórico, Nichos externo) + barras de uso mensal (amarelo ≥70%, vermelho ≥90%) + logout. | Sidebar, UsageBar, SidebarLink |
| `/app/generate` | Client Component | Form de geração (niche dropdown, objects comma-separated, topic, tone, duration, provider). POST para `/api/app/generate-package`. Após sucesso, `router.push('/app/history')`. | Form, useState (6 fields + loading + error) |
| `/app/history` | Server Component | Lista collapsible de até 50 gerações do tenant atual. Cada item abre `<details>` mostrando JSON completo. | HistoryList, `<details>` |

### API Routes

| Método + Rota | Runtime | Auth | Função |
|--------------|---------|------|--------|
| `GET /api/niches` | edge | público | Retorna `{niches: [...], formats: [...], totals: {niches:17, formats:23}}` |
| `POST /api/app/generate-package` | nodejs (60s) | session cookie obrigatório | 1) Auth check, 2) Load profile+tenant+plan, 3) Check `is_active` + `addon_talking_objects` + trial expiry, 4) Check monthly rate limit via `usage_monthly`, 5) Call `generatePackage()` (multi-provider), 6) Persist to `viralobj.generations` (via service role), 7) Atomic RPC `increment_usage()`, 8) Return `{package, generation_id, usage}` |

---

## 🗄️ SCHEMA DO BANCO (Supabase `pclqjwegljrglaslppag`)

### Schema `public` (reusado do NexoOmnix — não criado por ViralObj)

```sql
-- Já existente, não replicar. Relevante para ViralObj:

public.tenants (
  id uuid PK,
  name text,
  slug text UNIQUE,
  niche niche_type ENUM ('beleza','tecnico','saude','juridico','imoveis','pet','educacao','nutricao','engenharia','fotografia','gastronomia','fitness','financas'),
  plan plan_type ENUM ('trial','starter','pro','pro_plus','enterprise') DEFAULT 'trial',
  plan_expires_at timestamptz,
  cnpj text, cpf text, email text, phone text, whatsapp text,
  address_* text,
  logo_url text, primary_color text,
  is_active boolean NOT NULL DEFAULT true,
  trial_ends_at timestamptz,
  stripe_customer_id text, stripe_subscription_id text, stripe_price_id text,
  kiwify_order_id text, kiwify_product_id text, kiwify_billing_cycle text,
  addon_talking_objects boolean NOT NULL DEFAULT false,  -- FLAG usado por ViralObj
  addon_talking_objects_stripe_sub text,
  created_at timestamptz, updated_at timestamptz
)

public.profiles (
  id uuid PK REFERENCES auth.users,
  tenant_id uuid NOT NULL REFERENCES tenants,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text, avatar_url text,
  role text NOT NULL,                      -- 'owner', 'admin', 'member'
  is_active boolean NOT NULL,
  last_seen_at timestamptz,
  created_at timestamptz, updated_at timestamptz
)

-- Enum de planos:
plan_type ENUM ('trial', 'starter', 'pro', 'pro_plus', 'enterprise')
```

### Schema `viralobj` (criado nesta fase — migration `viralobj_schema_init`)

```sql
CREATE SCHEMA viralobj;

-- ─── Histórico de pacotes gerados ──────────────────────
CREATE TABLE viralobj.generations (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  niche text NOT NULL,
  objects jsonb NOT NULL,                  -- ['água sanitária', 'lixeira']
  topic text NOT NULL,
  tone text NOT NULL DEFAULT 'angry',
  duration int NOT NULL DEFAULT 30,
  lang text NOT NULL DEFAULT 'both',
  provider_used text,                      -- 'anthropic' | 'openai' | 'gemini'
  package jsonb NOT NULL,                  -- Full LLM response
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_generations_tenant_created ON viralobj.generations (tenant_id, created_at DESC);
CREATE INDEX idx_generations_profile_created ON viralobj.generations (profile_id, created_at DESC);

-- ─── Contador mensal de uso por tenant ─────────────────
CREATE TABLE viralobj.usage_monthly (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month date NOT NULL,                     -- first day of month
  packages_count int NOT NULL DEFAULT 0,
  videos_count int NOT NULL DEFAULT 0,
  posts_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, month)
);

-- ─── Séries de reels (para auto-posting futuro) ────────
CREATE TABLE viralobj.series (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  niche text NOT NULL,
  format text NOT NULL,                    -- 'A' .. 'W'
  episodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_series_tenant_status ON viralobj.series (tenant_id, status);

-- ─── Row Level Security (RLS) ──────────────────────────
ALTER TABLE viralobj.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE viralobj.usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE viralobj.series ENABLE ROW LEVEL SECURITY;

-- Users só vêem/editam dados do próprio tenant
CREATE POLICY generations_tenant_isolation ON viralobj.generations
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY usage_tenant_isolation ON viralobj.usage_monthly
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY series_tenant_isolation ON viralobj.series
  USING (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- ─── RPC: atomic usage increment (SECURITY DEFINER) ────
CREATE OR REPLACE FUNCTION viralobj.increment_usage(
  p_tenant_id uuid,
  p_counter text   -- 'packages' | 'videos' | 'posts'
) RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = viralobj, public
AS $$
DECLARE
  v_month date := date_trunc('month', now())::date;
  v_count int := 0;
BEGIN
  INSERT INTO viralobj.usage_monthly (tenant_id, month)
  VALUES (p_tenant_id, v_month)
  ON CONFLICT (tenant_id, month) DO NOTHING;

  IF p_counter = 'packages' THEN
    UPDATE viralobj.usage_monthly
    SET packages_count = packages_count + 1, updated_at = now()
    WHERE tenant_id = p_tenant_id AND month = v_month
    RETURNING packages_count INTO v_count;
  ELSIF p_counter = 'videos' THEN
    UPDATE viralobj.usage_monthly
    SET videos_count = videos_count + 1, updated_at = now()
    WHERE tenant_id = p_tenant_id AND month = v_month
    RETURNING videos_count INTO v_count;
  ELSIF p_counter = 'posts' THEN
    UPDATE viralobj.usage_monthly
    SET posts_count = posts_count + 1, updated_at = now()
    WHERE tenant_id = p_tenant_id AND month = v_month
    RETURNING posts_count INTO v_count;
  END IF;

  RETURN v_count;
END;
$$;

-- ─── RPC: get plan limit (IMMUTABLE) ───────────────────
CREATE OR REPLACE FUNCTION viralobj.get_plan_limit(
  p_plan public.plan_type,
  p_counter text
) RETURNS int LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN p_counter = 'packages' THEN CASE p_plan
      WHEN 'trial'      THEN 5
      WHEN 'starter'    THEN 30
      WHEN 'pro'        THEN 100
      WHEN 'pro_plus'   THEN 300
      WHEN 'enterprise' THEN 999999
    END
    WHEN p_counter = 'videos' THEN CASE p_plan
      WHEN 'trial'      THEN 0
      WHEN 'starter'    THEN 10
      WHEN 'pro'        THEN 50
      WHEN 'pro_plus'   THEN 150
      WHEN 'enterprise' THEN 999999
    END
    WHEN p_counter = 'posts' THEN CASE p_plan
      WHEN 'trial'      THEN 0
      WHEN 'starter'    THEN 10
      WHEN 'pro'        THEN 50
      WHEN 'pro_plus'   THEN 150
      WHEN 'enterprise' THEN 999999
    END
    ELSE 0
  END;
$$;

GRANT USAGE ON SCHEMA viralobj TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA viralobj TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION viralobj.increment_usage(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION viralobj.get_plan_limit(public.plan_type, text) TO authenticated, service_role;
```

---

## 🔑 TYPESCRIPT MODELS (webapp/lib/supabase/types.ts)

```typescript
export type PlanType = "trial" | "starter" | "pro" | "pro_plus" | "enterprise";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  plan_expires_at: string | null;
  addon_talking_objects: boolean;
  is_active: boolean;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;                 // = auth.users.id
  tenant_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;               // 'owner' | 'admin' | 'member'
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export interface Generation {
  id: string;
  tenant_id: string;
  profile_id: string;
  niche: string;
  objects: string[];
  topic: string;
  tone: string;
  duration: number;
  lang: string;
  provider_used: string | null;
  package: Record<string, unknown>;
  created_at: string;
}

export interface UsageMonthly {
  tenant_id: string;
  month: string;              // YYYY-MM-01
  packages_count: number;
  videos_count: number;
  posts_count: number;
  updated_at: string;
}

export const PLAN_LIMITS: Record<PlanType, {packages: number; videos: number; posts: number}> = {
  trial:      { packages: 5,      videos: 0,      posts: 0      },
  starter:    { packages: 30,     videos: 10,     posts: 10     },
  pro:        { packages: 100,    videos: 50,     posts: 50     },
  pro_plus:   { packages: 300,    videos: 150,    posts: 150    },
  enterprise: { packages: 999999, videos: 999999, posts: 999999 },
};

export const PLAN_LABELS: Record<PlanType, string> = {
  trial: "Trial",
  starter: "Starter",
  pro: "Pro",
  pro_plus: "Pro+",
  enterprise: "Enterprise",
};
```

---

## 🧠 LLM GENERATOR (webapp/lib/generator.ts — núcleo da API)

```typescript
// Multi-provider LLM router. Mirrors mcp/tools/generate.js but standalone for Vercel.

import Anthropic from "@anthropic-ai/sdk";
import { NICHES } from "./niches-data";

const DEFAULT_ORDER = ["anthropic", "openai", "gemini"] as const;
type ProviderName = (typeof DEFAULT_ORDER)[number];

export interface GenerateInput {
  niche: string;
  objects: string[];
  topic: string;
  tone?: string;          // 'angry' | 'funny' | 'educational' | 'dramatic' | 'cute' | 'sarcastic'
  duration?: number;      // 15 | 30 | 45 | 60
  lang?: "pt" | "en" | "both";
  provider?: "auto" | ProviderName;
}

// Resolve order: explicit provider > VIRALOBJ_PROVIDER_ORDER env > DEFAULT_ORDER
function resolveProviderOrder(requested?: string): ProviderName[] { ... }

// Build the system + user prompt for the LLM.
// System: "You are ViralObj's content generation engine...Return ONLY valid JSON."
// User: complete structured prompt with niche context + exact JSON schema
function buildPrompts(input: GenerateInput): { system: string; user: string } { ... }

// Three provider calls, each normalizing to a string response
async function callAnthropic(system, user): Promise<string> {
  // model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6"
  // max_tokens: 8000
}
async function callOpenAI(system, user): Promise<string> {
  // model: process.env.OPENAI_MODEL || "gpt-4.1-mini"
  // response_format: { type: "json_object" }
  // max_tokens: 8000
}
async function callGemini(system, user): Promise<string> {
  // model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
  // generationConfig.responseMimeType: "application/json"
}

// Main entrypoint: tries providers in order, returns first success
export async function generatePackage(input: GenerateInput) {
  const { system, user } = buildPrompts(input);
  const order = resolveProviderOrder(input.provider);
  const errors: string[] = [];

  for (const provider of order) {
    try {
      const raw = await [callAnthropic, callOpenAI, callGemini][i](system, user);
      const pkg = parseJson(raw);
      return { ...pkg, provider_used: provider };
    } catch (e) {
      errors.push(`${provider}: ${e.message}`);
    }
  }
  throw new Error(`All providers failed → ${errors.join(" | ")}`);
}
```

### Expected LLM output shape

```json
{
  "meta": {
    "niche": "casa",
    "topic_pt": "Erros de higiene doméstica",
    "topic_en": "Household hygiene mistakes",
    "tone": "angry",
    "duration": 30,
    "format": "A"
  },
  "characters": [
    {
      "id": 1,
      "name_pt": "Lixeira",
      "name_en": "Trash Can",
      "emoji": "🗑️",
      "personality": "Indignada, explosiva",
      "expression_arc": ["angry", "furious"],
      "voice_script_pt": "EU Sou a lixeira! Tô aqui do lado...",
      "voice_script_en": "I'm the trash can!...",
      "ai_prompt_midjourney": "Furious animated trash can character... 9:16",
      "timestamp_start": "0s",
      "timestamp_end": "10s"
    }
  ],
  "post_copy": {
    "caption_pt": "🔥 Você usa lixeira certo?...",
    "caption_en": "🔥 Are you using your trash can right?...",
    "hashtags_pt": ["#casa", "#limpeza", ...],
    "hashtags_en": ["#home", "#cleaning", ...]
  },
  "provider_used": "anthropic"
}
```

---

## 🔐 AUTH FLOW (Server Actions em webapp/app/login/actions.ts)

### Signup (auto-bootstrap tenant)

```typescript
export async function signupAction(formData: FormData) {
  const supabase = createClient();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("full_name"));

  // 1. Supabase Auth signup
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } },
  });
  if (error) return { error: error.message };

  // 2. If email confirmation is OFF, session is immediate → bootstrap
  if (data.session) {
    await bootstrapTenant(supabase, data.user.id, email, fullName);
    redirect("/app");
  }
  return { success: "Verifique seu email..." };
}

async function bootstrapTenant(supabase, userId, email, fullName) {
  // Create tenant with 14-day trial + addon_talking_objects = true
  const slug = email.split("@")[0] + "-" + userId.slice(0, 6);
  const { data: tenant } = await supabase
    .from("tenants")
    .insert({
      name: fullName || email,
      slug,
      niche: "beleza",           // default, user changes later
      plan: "trial",
      addon_talking_objects: true,
      is_active: true,
      trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
      email,
    })
    .select("id").single();

  // Create profile linked to auth.users
  await supabase.from("profiles").insert({
    id: userId,
    tenant_id: tenant.id,
    full_name: fullName || email,
    email,
    role: "owner",
    is_active: true,
  });
}
```

### Login / Logout

```typescript
export async function loginAction(formData: FormData) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (error) return { error: error.message };
  redirect(formData.get("next") || "/app");
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}
```

### Middleware (webapp/middleware.ts + lib/supabase/middleware.ts)

```typescript
// middleware.ts
export async function middleware(request) {
  return await updateSession(request);
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

// lib/supabase/middleware.ts — updateSession()
// 1. Create server supabase client reading cookies from request
// 2. Call supabase.auth.getUser() → refreshes JWT if needed
// 3. If pathname startsWith "/app" and no user → redirect /login?next=pathname
// 4. If pathname startsWith "/login" or "/signup" and user exists → redirect /app
// 5. Return response with refreshed cookies
```

---

## 🛡️ API GUARD (webapp/app/api/app/generate-package/route.ts)

```typescript
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // ─── 1. Auth check ────────────────────────────────
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 401;

  // ─── 2. Load profile + tenant ─────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, tenant:tenants(id, plan, addon_talking_objects, is_active, trial_ends_at)")
    .eq("id", user.id).single();
  if (!profile) return 403;

  const tenant = profile.tenant;

  // ─── 3. Active + addon + trial expiry ─────────────
  if (!tenant.is_active) return 403 "Workspace desativado";
  if (!tenant.addon_talking_objects) return 403 "Addon não ativo";
  if (tenant.plan === "trial" && tenant.trial_ends_at < now) return 402 "Trial expirado";

  // ─── 4. Monthly rate limit ────────────────────────
  const monthStart = firstDayOfCurrentMonth();
  const { data: usage } = await supabase
    .from("usage_monthly")
    .select("packages_count")
    .eq("tenant_id", tenant.id).eq("month", monthStart).maybeSingle();
  const used = usage?.packages_count ?? 0;
  const limit = PLAN_LIMITS[tenant.plan].packages;
  if (used >= limit) return 402 { error, code: "LIMIT_REACHED" };

  // ─── 5. Generate package (multi-provider) ─────────
  const body = await req.json();
  const pkg = await generatePackage({
    niche: body.niche,
    objects: body.objects,
    topic: body.topic,
    tone: body.tone,
    duration: body.duration,
    lang: body.lang ?? "both",
    provider: body.provider ?? "auto",
  });

  // ─── 6. Persist + increment (service role) ────────
  const svc = createServiceClient();
  const { data: saved } = await svc
    .from("generations")
    .insert({
      tenant_id: tenant.id,
      profile_id: user.id,
      niche: body.niche,
      objects: body.objects,
      topic: body.topic,
      tone: body.tone ?? "angry",
      duration: body.duration ?? 30,
      lang: body.lang ?? "both",
      provider_used: pkg.provider_used ?? null,
      package: pkg,
    })
    .select("id").single();

  await svc.rpc("increment_usage", { p_tenant_id: tenant.id, p_counter: "packages" });

  return { package: pkg, generation_id: saved.id, usage: {used: used+1, max: limit, remaining: ...} };
}
```

---

## 🎨 DESIGN SYSTEM

### Tailwind config (webapp/tailwind.config.ts)

```typescript
colors: {
  viral: {
    bg:      "#0a0a0f",   // page background
    card:    "#14141f",   // card background
    border:  "#2a2a3a",   // borders
    accent:  "#ff3366",   // primary CTA (pink)
    accent2: "#00e5ff",   // secondary (cyan)
    text:    "#f5f5f7",   // body text
    muted:   "#8888a0",   // muted text
  },
},
fontFamily: {
  sans: ["Inter", "system-ui", "sans-serif"],
},
```

### Global CSS utilities (webapp/app/globals.css)

```css
body {
  background-image:
    radial-gradient(circle at 20% 10%, rgba(255, 51, 102, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 80% 60%, rgba(0, 229, 255, 0.06) 0%, transparent 50%);
}

.card        → rounded-xl border border-viral-border bg-viral-card/70 backdrop-blur-sm
.btn-primary → bg-viral-accent, white text, py-2.5 px-5, hover:bg-viral-accent/90
.btn-secondary → border + card bg, hover:border-viral-accent/60
.input       → border + card bg, focus:border-viral-accent focus:ring-viral-accent
.label       → uppercase tracking-wider text-xs text-viral-muted
```

### Visual language

- **Dark neon** — fundo quase preto com gradientes sutis rosa/ciano
- **Glassmorphism cards** — `bg-viral-card/70 backdrop-blur-sm` border sutil
- **Tom badges** — cores mapeadas a cada tom (`angry=red`, `funny=yellow`, `educational=cyan`, `dramatic=purple`, etc.)
- **Usage bars** — gradient color state (accent/yellow/red)
- **Gradient CTAs** — `bg-gradient-to-r from-viral-accent via-pink-400 to-viral-accent2`

---

## 🔧 MCP SERVER (7 tools disponíveis no Claude Code)

| Tool | Descrição | Input schema | Output |
|------|-----------|--------------|--------|
| `analyze_video` | ffprobe + ffmpeg frame extraction + Claude Vision (claude-opus-4-6) | `{video_path: string, lang: 'pt'\|'en'}` | `{characters, niche, format, expressions, captions}` |
| `download_reel` | 4-strategy fallback: SnapInsta → SSSTik → yt-dlp → Cobalt | `{url, output_dir?, auto_analyze?, lang?}` | `{path, metadata, optional analysis}` |
| `generate_package` | Multi-provider LLM (anthropic/openai/gemini/auto) | `{niche, objects[], topic, tone?, duration?, lang?, analysis?, provider?}` | Complete bilingual production package |
| `generate_video` | FLUX Pro + MiniMax TTS + VEED Fabric (or Veo 2) + ffmpeg concat | `{package, output_dir?, quality?, pipeline?, lang?, caption_style?, overrides?}` | `{clips[], final_video_url, capcut_import, cost_estimate}` |
| `export_artifacts` | HTML dashboard + installable SKILL.md | `{package, output_dir?, slug?}` | `{html_path, skill_path}` |
| `post_to_instagram` | Graph API v21.0 publish + schedule + stories | `{video_url, caption_pt, caption_en?, hashtags_pt[], hashtags_en[], schedule_time?, share_to_stories?, lang?}` | `{media_id, url, story_id?}` — **BLOCKED: tokens expired** |
| `list_niches` | All 17 niches with object libraries | `{lang?}` | Formatted list |

### Dataset (training-data/dataset.json v2.0)

```
version: 2.0.0
videos_analyzed: 47
formats_total: 23 (A-W)
source_accounts: [@coisadecasa.ia, @objetosfalantes, @casasincerona, @ajuda.ai.hacks, @oficinassuculentas, @dinheirofalante]

23 FORMATS:
A  MULTI-STUB                              stub arms, no legs, humano fundo
B  SINGLE-FULL                             full body com pernas
C  DRESSED-CHAR                            objeto = cabeça + corpo humano
D  MAP-DOC                                 mapa/documento com pernas + tracking
E  RECIPE-MAGIC                            full body + partículas douradas
F  SINGLE-MULTI-COSTUME                    1 personagem + trocas de roupa
G  DRESSED-CHAR+RECIPE-SPLIT-SCREEN        50% Pixar + 50% vídeo real
H  VILLAIN-HERO NARRATIVE                  vilão embedded + herói + batalha (3 atos)
I  DUO-SCENE                               2 personagens contrastantes
J  SINGLE-TUTORIAL-BODY                    personagem em macro do corpo humano
K  SINGLE-RECIPE-JOURNEY                   receita completa 4-5 cenários
L  SINGLE-MULTI-SCENE-JOURNEY              3 ambientes domésticos (DIY)
M  FOOD-FIGHTER                            batalha de alimentos BR
N  APPLIANCE-HOST                          eletrodoméstico anfitrião + guests
O  INTERNAL-BODY-SCENE                     interior de órgão com bioluminescência
P  TRIO-VILLAIN                            3 pragas em troupe
Q  MULTI-GROUP-SCENE                       4-8 personagens em cenário temático
R  LIQUID-FACE-EMBEDDED                    face dentro de líquido transparente
S  PLANT-HUMANOID                          planta humanoide ancestral
T  INGREDIENT-COMMANDER                    ingrediente militar → líquido
U  INSECT-PARTY-NARRATIVE                  3 atos: festa → derrota → exílio
V  CLOTHING-CHARACTER                      roupa como personagem (sem humano)
W  OBJECT-IN-OWN-PRODUCT                   personagem dentro do próprio produto

17 NICHES with their default formats:
casa (A), plantas (A), financeiro (A), culinaria (C), natureza (B), saude (B),
pets (A), fitness (A), maternidade (A), saude-mental (A), saude-receitas (F),
gastronomia (I), skincare-natural (J), espiritualidade (Q), saude-feminino (B),
imoveis (C), viagem (D)

10 CAPTION STYLES:
alpha, beta, gamma, gamma-B, gamma-B-rodape, alpha-karaoke,
beta-word-karaoke, gamma-emoji-pill, highlight-keyword-color, headline-topo-bold

9 VOICE PROFILES (MiniMax):
angry (Friendly_Person), furious (Wise_Woman), alarmed (Gentle_Woman),
resigned (Calm_Woman), sarcastic (Lively_Girl), educational (Friendly_Person),
dramatic (Emotional_Female_Voice), funny (Lively_Girl), professional (Friendly_Person)
```

---

## 🌍 ENVIRONMENT VARIABLES

### Vercel production (webapp)

| Variable | Valor (primeiros 20 chars) | Runtime |
|----------|---------------------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://pclqjwegljrglaslppag...` | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` | server-only |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-mXrO47L...` | server-only |
| `OPENAI_API_KEY` | `sk-proj-aakcif3RVyg...` | server-only |
| `GEMINI_API_KEY` | `AIzaSyDRd2f-Zlf7ReG...` | server-only |
| `VIRALOBJ_PROVIDER_ORDER` | `anthropic,openai,gemini` | server |

### MCP server local (.env na raiz)

```bash
ANTHROPIC_API_KEY=sk-ant-...
FAL_KEY=2d79a705-...             # Fal.ai para FLUX, TTS, Fabric, Veo
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
VIRALOBJ_PROVIDER_ORDER=anthropic,openai,gemini
# INSTAGRAM_ACCESS_TOKEN=         # expired — needs refresh
# INSTAGRAM_ACCOUNT_ID=1668979704091045
```

### Railway db8-agent (central vault, queryable via GraphQL Project Token)

Contains keys for: Supabase, Anthropic, OpenAI, Gemini, FAL, Kiwify, ASAAS, Stripe, Meta/Instagram, Resend, Z-API, N8N, YouTube OAuth.

**Important:** Instagram/Meta credentials are all expired (verified 2026-04-12). The health endpoint at `/health` only reports `anthropic_configured`, `elevenlabs_configured`, `fal_configured` — doesn't expose OpenAI/Gemini/others.

---

## ✅ ESTADO ATUAL — O QUE FUNCIONA

| Área | Status | Verificação |
|------|--------|-------------|
| **MCP server v1.3.0** | ✅ 7 tools registradas | `node -e "import('./mcp/index.js')"` |
| **Dataset v2.0** | ✅ 47 vídeos, 23 formatos, 17 nichos | `videos_analyzed === 47` |
| **3 LLM providers** | ✅ Todos testados live | `generate_package` com `provider: "anthropic"` / `openai` / `gemini` → OK |
| **Multi-provider fallback** | ✅ Configurável via env | `VIRALOBJ_PROVIDER_ORDER=anthropic,openai,gemini` |
| **Veo pipeline** | ✅ Com fallback para FLUX | `generate_video` com `pipeline: "veo"` |
| **ffmpeg concat** | ✅ Multi-personagem | Detecta ffmpeg local, fallback graceful |
| **Webapp deployed** | ✅ https://viralobj.vercel.app | `curl /api/niches` → 17/23 |
| **Middleware protection** | ✅ /app/* redirects to /login | `curl -I /app` → 307 to /login?next=/app |
| **Supabase auth** | ✅ Email+senha, Server Actions | Signup + login + logout testados |
| **Schema viralobj** | ✅ Migration aplicada | 3 tables + 2 RPCs + RLS |
| **Rate limiting** | ✅ Check por plano antes de gerar | HTTP 402 `LIMIT_REACHED` |
| **Persistência** | ✅ Toda geração em `generations` | Atomic counter via RPC |

## ❌ ESTADO ATUAL — O QUE NÃO FUNCIONA / FALTA

| Gap | Descrição | Impacto |
|-----|-----------|---------|
| **Sales page / pricing** | Landing atual é showcase, não conversion-first | Bloqueia primeira venda |
| **Pagamento** | Nenhuma integração Kiwify/Stripe ainda | Bloqueia primeira venda |
| **Legal** | Sem ToS, Privacy, Refund | Bloqueia primeira venda legalmente |
| **Domínio próprio** | `viralobj.com` não configurado | Credibilidade/SEO |
| **Instagram posting** | Tokens Meta expirados no Railway | Feature anunciada não funciona |
| **Video gen via web** | Timeout Vercel 60s vs pipeline 5-10min | Feature crítica não acessível |
| **Storage de vídeos gerados** | Nenhum Supabase Storage configurado | Necessário para Fase 3 |
| **Webhook Kiwify** | Não existe | Bloqueia pagamento |
| **Auto-posting scheduler** | Não existe | Killer feature de retenção |
| **Email transacional** | Não configurado (Resend disponível) | Onboarding fraco |
| **Error monitoring** | Sem Sentry/similar | Risco de bugs em prod não detectados |
| **Testes automatizados** | Só 1 teste trivial em package.json | Qualidade não garantida |
| **Cookie consent** | Não existe | Risco LGPD |
| **Rate limiting por IP** | Só por tenant, API pode ser abusada por bots | Risco de custo descontrolado |
| **Moderação de conteúdo** | Sem filtro do que o user pode gerar | Risco de conteúdo inapropriado |

---

## 📅 ROADMAP RESUMIDO

```
Sprint 1 — ✅ DONE
└── Phase 1: Auth + Dashboard + Rate Limit + Persistence

Sprint 2 — Monetização (2-3 dias)
├── Sales page conversion-first (pricing cards + FAQ + testemunhos mock)
├── Kiwify product setup + webhook handler + /api/webhooks/kiwify
├── /app/billing page (view plan, upgrade, cancel)
├── Upgrade flow Kiwify → update tenants.plan
└── Block: needs pricing + CNPJ decisions

Sprint 3 — Legal + Domain (1 dia)
├── ToS, Privacy, Refund templates
├── Cookie consent banner
├── viralobj.com DNS on Vercel
├── Resend email setup (welcome, upgrade, limits)
└── Block: needs CNPJ + domain

                   ┌─────────────────────┐
                   │ FIRST PAYING CUSTOMER│  ← gate here
                   └─────────────────────┘

Sprint 4 — Video gen production (3-4 dias)
├── Inngest job queue setup
├── Worker function that calls Fal.ai pipeline
├── /app/generate updates to "queue video generation"
├── Status polling UI
├── Supabase Storage for generated videos
└── Webhook notification when ready

Sprint 5 — Instagram auto-post (3-4 dias)
├── Refresh Meta tokens (user action needed)
├── Meta Login OAuth per user
├── /app/instagram connect page
├── Calendar view with drag-drop
├── Scheduled posts queue (Inngest cron)
└── Block: needs Meta app + tokens
```

---

## 🧪 COMANDOS DE VALIDAÇÃO

### Verificar MCP server
```bash
cd c:/Users/Douglas/viralobj
node -e "import('./mcp/index.js')"
# → "ViralObj MCP Server v1.3.0 running — viralobj.com"
```

### Testar multi-provider
```bash
node --env-file=.env -e "
import('./mcp/tools/generate.js').then(async m => {
  for (const provider of ['anthropic','openai','gemini']) {
    const r = await m.generatePackage({
      niche: 'casa', objects: ['lixeira'], topic: 'teste',
      duration: 15, lang: 'pt', provider,
    });
    console.log(provider, 'OK -> used:', r.result.provider_used);
  }
});
"
```

### Testar webapp build
```bash
cd webapp && npm run build
# → Route (app) table with ~11 routes, no errors
```

### Smoke test produção
```bash
curl -I https://viralobj.vercel.app/app
# → 307 /login?next=/app

curl https://viralobj.vercel.app/api/niches
# → {"niches": [...], "formats": [...], "totals": {"niches": 17, "formats": 23}}
```

### Query Supabase viralobj schema
```sql
SELECT count(*) FROM viralobj.generations;
SELECT tenant_id, month, packages_count FROM viralobj.usage_monthly ORDER BY month DESC LIMIT 10;
SELECT viralobj.get_plan_limit('pro', 'packages');  -- → 100
```

---

## 🔍 CRITÉRIOS DE REVISÃO QUE VOCÊ (SUPERVISOR) DEVE COBRIR

Quando fizer a auditoria, cubra **obrigatoriamente** estes ângulos. Para cada um, dê uma nota (✅ OK / ⚠️ Atenção / ❌ Problema) e justifique com item específico.

### 1. Segurança
- [ ] RLS está adequadamente configurado em todas as 3 tabelas de `viralobj`?
- [ ] A função `increment_usage` com `SECURITY DEFINER` está protegida contra abuse?
- [ ] O uso de `createServiceClient()` no route handler `/api/app/generate-package` é justificável? Bypassa RLS corretamente?
- [ ] Tem algum path onde um user pode ver dados de outro tenant?
- [ ] As Server Actions estão validando inputs (SQL injection, XSS)?
- [ ] Environment vars estão corretamente separadas entre public/private (`NEXT_PUBLIC_` prefix)?
- [ ] A `SUPABASE_SERVICE_ROLE_KEY` jamais é exposta ao client?
- [ ] Middleware está corretamente protegendo todas as rotas `/app/*`?

### 2. Arquitetura & Escalabilidade
- [ ] A duplicação `mcp/tools/niches.js` ↔ `webapp/lib/niches-data.ts` é aceitável? Como evitar drift?
- [ ] Por que o webapp não importa direto de `../mcp/tools/`? (resposta: Vercel build isolation) — é razoável?
- [ ] A decisão de usar schema `viralobj` dentro de `nexoominx` em vez de projeto Supabase dedicado tem downside técnico?
- [ ] O fluxo `auth.getUser() → select profile → check limit → generate → persist → RPC` tem race condition possível?
- [ ] O que acontece se `increment_usage` RPC falhar após persistir a generation? (contador fica desatualizado)
- [ ] A API route tem timeout de 60s — suficiente para LLMs lentos?

### 3. UX / Fluxo do Usuário
- [ ] Fluxo signup → bootstrap tenant → /app está sem fricção?
- [ ] O que acontece se a Server Action `signupAction` falhar no meio (signup OK mas tenant fail)? O user fica "órfão"?
- [ ] Error states são claros para o user (ex: HTTP 402 LIMIT_REACHED)?
- [ ] Dashboard mostra o que o user precisa ver na primeira visita?
- [ ] Mobile UX dos forms `/app/generate` está adequado?

### 4. Código / Qualidade
- [ ] O generator.ts está robusto contra respostas malformadas do LLM?
- [ ] O parseJson regex `/\{[\s\S]*\}/` é frágil? Poderia falhar em qual caso?
- [ ] Há tratamento adequado para timeouts de LLM?
- [ ] Há logs suficientes para debug de produção?
- [ ] TypeScript strict mode está ativo e sendo respeitado?

### 5. Modelo de Negócio
- [ ] Os preços sugeridos (Starter R$47 / Pro R$147 / Pro+ R$297 / Enterprise R$497) fazem sentido para o mercado BR de criadores de conteúdo?
- [ ] Os limites de uso por plano são generosos demais ou apertados demais?
- [ ] Margem bruta estimada (35-46%) é saudável considerando os custos variáveis de LLM + Fal.ai?
- [ ] O trial de 14 dias + 5 pacotes é suficiente para ativação?
- [ ] A estratégia de reusar NexoOmnix (Kiwify integration, Stripe integration, addon_talking_objects flag) é execução-friendly?

### 6. Roadmap & Priorização
- [ ] A ordem dos sprints (Monetização → Legal → Video gen → Instagram) está correta? Algum deveria vir antes?
- [ ] O que seria o MVP absoluto para conseguir primeira venda? Há features dispensáveis que estão no plano?
- [ ] Qual é o maior risco ao não fazer algo prioritário primeiro?

### 7. Custos Operacionais
- [ ] Vercel hobby (60s timeout) é sustentável ou precisamos de Pro desde Sprint 2?
- [ ] O custo estimado de LLM (~$0.01/package) é realista?
- [ ] Há algum serviço "escondido" que vai aparecer quando escalar?

---

## 📋 DELIVERABLES (o que você, supervisor, deve me entregar)

**Escreva um relatório de supervisão com esta estrutura exata:**

### 1. Resumo executivo (3-5 bullets)
Sua avaliação geral do projeto em termos de maturidade técnica, risco e prontidão para comercialização.

### 2. Nota por critério (tabela)
```
| Critério           | Nota | Resumo                      |
|--------------------|------|-----------------------------|
| Segurança          | ✅/⚠️/❌ | ...                         |
| Arquitetura        | ✅/⚠️/❌ | ...                         |
| UX                 | ✅/⚠️/❌ | ...                         |
| Qualidade código   | ✅/⚠️/❌ | ...                         |
| Modelo de negócio  | ✅/⚠️/❌ | ...                         |
| Roadmap            | ✅/⚠️/❌ | ...                         |
| Custos             | ✅/⚠️/❌ | ...                         |
```

### 3. Top 5 riscos críticos
Liste os 5 problemas mais graves encontrados, cada um com:
- **Problema** (cite o arquivo/linha/item específico)
- **Impacto** (o que quebra se isso não for resolvido)
- **Solução concreta** (exatamente o que fazer)

### 4. Top 5 quick wins
5 melhorias de alto impacto × baixo esforço (≤1h cada) que deveriam ser feitas antes do próximo sprint.

### 5. Crítica ao roadmap
O plano Sprint 2 → 3 → 4 → 5 está correto? Você mudaria a ordem? Adicionaria / removeria algo?

### 6. Validação do modelo de negócio
Os preços, planos e unit economics fazem sentido? Qual é o maior risco comercial?

### 7. Recomendações finais
Seu veredicto: o projeto está pronto para avançar para Sprint 2 (monetização)? Há algum blocker que deve ser resolvido ANTES?

---

## 🎯 CONTEXTO ADICIONAL

- **Histórico desta sessão:** 9 commits de implementação feitos em sequência; o último é `9da4750` (Phase 1 Auth) e `6732c32` (PROJECT_REPORT.md).
- **Stakeholder:** Single founder (Douglas / DB8 Intelligence) tocando múltiplos projetos (NexoOmnix, ImobCreator, ChannelOS, BookAgent, Manuscry).
- **Urgência:** Primeira venda é prioridade máxima. Tudo que não contribuir diretamente para isso pode ser adiado.
- **Orçamento de desenvolvimento:** Tempo do founder + Claude Code. Infraestrutura <$50/mês.
- **Mercado alvo:** Criadores de conteúdo BR de nichos específicos (casa, saúde, plantas, culinária). Ticket médio esperado R$100-300/mês.

---

**Fim do Master Supervision Prompt.**
**Agora, como supervisor, execute a auditoria e entregue o relatório conforme a seção DELIVERABLES acima.**
