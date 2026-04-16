-- Base schema for ViralObj (isolated Supabase)
-- Creates: tenants, profiles, generations, usage_monthly

-- Tenants
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  plan text NOT NULL DEFAULT 'trial'
    CHECK (plan IN ('trial','starter','pro','pro_plus','enterprise')),
  plan_expires_at timestamptz,
  addon_talking_objects boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  trial_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'member',
  is_active boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Generations
CREATE TABLE IF NOT EXISTS public.generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  niche text NOT NULL,
  objects text[] NOT NULL DEFAULT '{}',
  topic text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'dramatic',
  duration int NOT NULL DEFAULT 30,
  lang text NOT NULL DEFAULT 'pt',
  provider_used text,
  package jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Usage monthly
CREATE TABLE IF NOT EXISTS public.usage_monthly (
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month date NOT NULL,
  packages_count int NOT NULL DEFAULT 0,
  videos_count int NOT NULL DEFAULT 0,
  posts_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, month)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generations_tenant ON public.generations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_generations_profile ON public.generations(profile_id);
CREATE INDEX IF NOT EXISTS idx_usage_monthly_tenant ON public.usage_monthly(tenant_id);

-- RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_monthly ENABLE ROW LEVEL SECURITY;

-- Policies: users see own data
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "generations_select_own" ON public.generations;
CREATE POLICY "generations_select_own" ON public.generations
  FOR SELECT USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;
CREATE POLICY "tenants_select_own" ON public.tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "usage_select_own" ON public.usage_monthly;
CREATE POLICY "usage_select_own" ON public.usage_monthly
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );
