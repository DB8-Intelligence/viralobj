-- Generation jobs pipeline (DEV-1..5, fixed QA-1)

CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid not null,
  status text not null default 'queued'
    check (status in ('queued','running','completed','failed')),
  progress int not null default 0 check (progress between 0 and 100),
  input jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.generation_job_steps (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.generation_jobs(id) on delete cascade,
  step text not null
    check (step in ('ingest','download','frame_extraction','reverse_engineering',
                    'blueprint','package_generation','video_generation','assembly',
                    'delivery','image_generation','audio_generation','timeline_build',
                    'video_render')),
  status text not null default 'pending'
    check (status in ('pending','running','completed','failed')),
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

CREATE TABLE IF NOT EXISTS public.generation_artifacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.generation_jobs(id) on delete cascade,
  type text not null,
  url text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_tenant   ON public.generation_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user     ON public.generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status   ON public.generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_steps_job     ON public.generation_job_steps(job_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_job ON public.generation_artifacts(job_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_generation_jobs_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_generation_jobs_updated_at ON public.generation_jobs;
CREATE TRIGGER trg_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_generation_jobs_updated_at();

-- RLS
ALTER TABLE public.generation_jobs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_job_steps  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_artifacts  ENABLE ROW LEVEL SECURITY;

-- Read policies (writes via service_role bypass RLS)
CREATE POLICY IF NOT EXISTS "jobs_select_own_tenant" ON public.generation_jobs
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY IF NOT EXISTS "steps_select_own_tenant" ON public.generation_job_steps
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM public.generation_jobs
      WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY IF NOT EXISTS "artifacts_select_own_tenant" ON public.generation_artifacts
  FOR SELECT USING (
    job_id IN (
      SELECT id FROM public.generation_jobs
      WHERE tenant_id IN (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    )
  );
