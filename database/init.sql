-- ViralObj — PostgreSQL schema (GCP Cloud SQL target)
-- Run once against a fresh database:
--   psql "$DB_URL" -f database/init.sql
--
-- Idempotent: safe to re-run. Use CREATE … IF NOT EXISTS everywhere.
--
-- This schema backs the bridge server (src/infrastructure/database.js).
-- Tables:
--   professionals — user profiles (liberal professionals: advogado, médico, …)
--   niches        — catalog (mirror of mcp/tools/niches.js NICHES const;
--                   live-editable without code deploy)
--   videos        — rendered Veo 3 scene clips, one row per scene
--   user_history  — generated reel packages (one row per /api/generate-reel call)

-- ─── extensions ──────────────────────────────────────────────────────────

-- gen_random_uuid(), digest() — ships with Postgres 13+ but needs explicit load.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── helper: updated_at trigger ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════
-- 1. professionals — quem pode gerar conteúdo (corresponde ao "usuário")
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.professionals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text UNIQUE NOT NULL,
  full_name    text,
  profession   text,                      -- should match niches.key when possible
  phone        text,
  avatar_url   text,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_professionals_profession
  ON public.professionals (profession)
  WHERE profession IS NOT NULL;

DROP TRIGGER IF EXISTS professionals_updated_at ON public.professionals;
CREATE TRIGGER professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.professionals IS
  'Liberal professional profiles. profession is a free text matching niches.key when possible (advogado, contador, …).';

-- ═══════════════════════════════════════════════════════════════════════
-- 2. niches — catálogo editável sem deploy (mirror da const NICHES)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.niches (
  key            text PRIMARY KEY,
  category       text NOT NULL CHECK (category IN ('profissoes', 'lifestyle')),
  name_pt        text NOT NULL,
  name_en        text NOT NULL,
  emoji          text,
  tone_default   text NOT NULL DEFAULT 'educational'
                 CHECK (tone_default IN ('angry','dramatic','funny','educational','sarcastic','motivational')),
  objects        jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{ pt, en, emoji, personality }]
  prompts_base   text,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_niches_category_active
  ON public.niches (category, is_active);

DROP TRIGGER IF EXISTS niches_updated_at ON public.niches;
CREATE TRIGGER niches_updated_at
  BEFORE UPDATE ON public.niches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.niches IS
  'Niche catalog. On first deploy, seed from mcp/tools/niches.js (see README). objects is an array of { pt, en, emoji, personality }.';

-- ═══════════════════════════════════════════════════════════════════════
-- 3. user_history — 1 linha por pacote gerado (/api/generate-reel)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  niche           text NOT NULL REFERENCES public.niches(key) ON UPDATE CASCADE,
  topic           text NOT NULL,
  tone            text,
  duration        integer CHECK (duration IS NULL OR (duration BETWEEN 5 AND 180)),
  package         jsonb NOT NULL,                       -- full generatePackage() output
  provider_used   text,                                 -- anthropic | openai | gemini
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_user_recent
  ON public.user_history (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_history_niche_recent
  ON public.user_history (niche, created_at DESC);

COMMENT ON TABLE public.user_history IS
  'One row per /api/generate-reel call. id doubles as generation_id referenced by videos.generation_id.';

-- ═══════════════════════════════════════════════════════════════════════
-- 4. videos — clips renderizados (um por cena do reel)
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.videos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES public.professionals(id) ON DELETE SET NULL,
  generation_id  uuid REFERENCES public.user_history(id) ON DELETE CASCADE,
  scene_id       text NOT NULL,                         -- "Cacto-plantas-intro"
  scene_type     text NOT NULL
                 CHECK (scene_type IN ('intro', 'dialogue', 'reaction', 'cta')),
  video_url      text,                                  -- null while status='pending'
  image_url      text,                                  -- source image sent to Veo 3
  duration_ms    integer,
  provider       text NOT NULL DEFAULT 'fal'
                 CHECK (provider IN ('fal', 'veo3', 'veed', 'remotion', 'mock')),
  request_id     text,                                  -- Fal queue request_id
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','processing','completed','failed')),
  error          text,
  cost_usd       numeric(10,4),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_generation
  ON public.videos (generation_id, scene_type);

CREATE INDEX IF NOT EXISTS idx_videos_user_recent
  ON public.videos (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_videos_status_pending
  ON public.videos (status, created_at)
  WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_videos_request_id
  ON public.videos (request_id)
  WHERE request_id IS NOT NULL;

DROP TRIGGER IF EXISTS videos_updated_at ON public.videos;
CREATE TRIGGER videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.videos IS
  'One row per rendered scene clip. Pending/processing rows are polled against Fal queue API via request_id.';

-- ═══════════════════════════════════════════════════════════════════════
-- 5. seeds mínimos (so fresh installs have at least one niche to test)
-- ═══════════════════════════════════════════════════════════════════════

-- Two canonical rows to confirm the FK from user_history works after init.
-- The full 36 niches should be seeded by a script that reads mcp/tools/niches.js.
INSERT INTO public.niches (key, category, name_pt, name_en, emoji, tone_default, objects, prompts_base)
VALUES
  (
    'advogado', 'profissoes', 'Advocacia & Direito', 'Law & Legal Services', '⚖️', 'dramatic',
    '[
       {"pt":"martelo do juiz","en":"gavel","emoji":"🔨","personality":"autoritário, decisivo"},
       {"pt":"balança da justiça","en":"scales of justice","emoji":"⚖️","personality":"ponderada, imparcial"},
       {"pt":"código de leis","en":"law book","emoji":"📕","personality":"antigo, sábio"}
     ]'::jsonb,
    'Brazilian law firm or courtroom, dark wood, warm amber lighting, Pixar 3D render, 9:16, 8K'
  ),
  (
    'casa', 'lifestyle', 'Casa & Limpeza', 'Home & Cleaning', '🏠', 'angry',
    '[
       {"pt":"água sanitária","en":"bleach","emoji":"🧴","personality":"ressentida"},
       {"pt":"esponja de pia","en":"kitchen sponge","emoji":"🧽","personality":"enojada"},
       {"pt":"celular","en":"smartphone","emoji":"📱","personality":"raiva com nojo"}
     ]'::jsonb,
    'Brazilian home interior, Pixar 3D render, warm lighting, 9:16, 8K'
  )
ON CONFLICT (key) DO NOTHING;
