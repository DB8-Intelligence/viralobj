-- Funcoes RPC necessarias para o webapp
-- Faltavam no Supabase isolado (migracao de NexoOmnix)

-- =====================================================================
-- 1. check_ip_rate_limit — protecao contra brute-force
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  ip text NOT NULL,
  bucket text NOT NULL,
  hits int NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (ip, bucket)
);

CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  p_ip text,
  p_bucket text,
  p_limit int,
  p_window_seconds int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hits int;
  v_window_start timestamptz;
  v_now timestamptz := now();
BEGIN
  SELECT hits, window_start INTO v_hits, v_window_start
  FROM public.ip_rate_limits
  WHERE ip = p_ip AND bucket = p_bucket;

  IF NOT FOUND THEN
    INSERT INTO public.ip_rate_limits (ip, bucket, hits, window_start)
    VALUES (p_ip, p_bucket, 1, v_now);
    RETURN true;
  END IF;

  -- Janela expirou? Resetar.
  IF v_window_start + (p_window_seconds || ' seconds')::interval < v_now THEN
    UPDATE public.ip_rate_limits
    SET hits = 1, window_start = v_now
    WHERE ip = p_ip AND bucket = p_bucket;
    RETURN true;
  END IF;

  -- Dentro da janela: incrementar e verificar
  IF v_hits >= p_limit THEN
    RETURN false;
  END IF;

  UPDATE public.ip_rate_limits
  SET hits = hits + 1
  WHERE ip = p_ip AND bucket = p_bucket;

  RETURN true;
END;
$$;

-- =====================================================================
-- 2. bootstrap_tenant_viralobj — auto-cria tenant + profile no signup
-- =====================================================================

CREATE OR REPLACE FUNCTION public.bootstrap_tenant_viralobj(
  p_user_id uuid,
  p_email text,
  p_full_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tenant_id uuid;
  v_slug text;
BEGIN
  -- Verificar se profile ja existe
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN;
  END IF;

  -- Gerar slug unico a partir do email
  v_slug := lower(regexp_replace(split_part(p_email, '@', 1), '[^a-z0-9]', '-', 'g'));
  v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 8);

  -- Criar tenant
  INSERT INTO public.tenants (name, slug, plan, addon_talking_objects, is_active, trial_ends_at)
  VALUES (
    coalesce(nullif(p_full_name, ''), split_part(p_email, '@', 1)),
    v_slug,
    'trial',
    true,
    true,
    now() + interval '14 days'
  )
  RETURNING id INTO v_tenant_id;

  -- Criar profile
  INSERT INTO public.profiles (id, tenant_id, full_name, email, role, is_active)
  VALUES (p_user_id, v_tenant_id, p_full_name, p_email, 'owner', true);

  -- Criar registro de uso mensal
  INSERT INTO public.usage_monthly (tenant_id, month, packages_count, videos_count, posts_count)
  VALUES (v_tenant_id, date_trunc('month', now())::date, 0, 0, 0);
END;
$$;

-- =====================================================================
-- 3. reserve_quota — reserva atomica de quota (previne race condition)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.reserve_quota(
  p_tenant_id uuid,
  p_counter text,
  p_limit int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current int;
  v_month date := date_trunc('month', now())::date;
BEGIN
  -- Garantir que existe registro para o mes atual
  INSERT INTO public.usage_monthly (tenant_id, month)
  VALUES (p_tenant_id, v_month)
  ON CONFLICT (tenant_id, month) DO NOTHING;

  -- Ler valor atual com lock
  EXECUTE format(
    'SELECT %I FROM public.usage_monthly WHERE tenant_id = $1 AND month = $2 FOR UPDATE',
    p_counter || '_count'
  ) INTO v_current USING p_tenant_id, v_month;

  IF v_current IS NULL THEN
    v_current := 0;
  END IF;

  -- Verificar limite
  IF v_current >= p_limit THEN
    RETURN false;
  END IF;

  -- Incrementar atomicamente
  EXECUTE format(
    'UPDATE public.usage_monthly SET %I = %I + 1, updated_at = now() WHERE tenant_id = $1 AND month = $2',
    p_counter || '_count',
    p_counter || '_count'
  ) USING p_tenant_id, v_month;

  RETURN true;
END;
$$;
