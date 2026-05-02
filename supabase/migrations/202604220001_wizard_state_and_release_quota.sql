-- Fix schema drift: add columns the wizard writes but weren't in migrations
-- + create release_quota RPC (code calls it but only reserve_quota existed)

-- ============================================================================
-- 1. Colunas do wizard multi-step
-- ============================================================================

ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS pipeline_step text,
  ADD COLUMN IF NOT EXISTS approved_images jsonb,
  ADD COLUMN IF NOT EXISTS edited_scripts jsonb,
  ADD COLUMN IF NOT EXISTS scene_videos jsonb,
  ADD COLUMN IF NOT EXISTS free_input jsonb,
  ADD COLUMN IF NOT EXISTS music_config jsonb;

COMMENT ON COLUMN public.generations.pipeline_step IS
  'Current wizard step: images_review | audio_review | video_review | music_review | completed';

-- Constraint para validar transições válidas (mas permitir NULL para gerações legadas)
ALTER TABLE public.generations
  DROP CONSTRAINT IF EXISTS generations_pipeline_step_check;
ALTER TABLE public.generations
  ADD CONSTRAINT generations_pipeline_step_check
  CHECK (pipeline_step IS NULL OR pipeline_step IN (
    'images_review', 'audio_review', 'video_review', 'music_review', 'completed', 'failed'
  ));

-- Index para filtros de histórico por step
CREATE INDEX IF NOT EXISTS idx_generations_pipeline_step
  ON public.generations(profile_id, pipeline_step)
  WHERE pipeline_step IS NOT NULL;

-- ============================================================================
-- 2. Storage bucket para áudios (ElevenLabs/Minimax)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'viralobj-audio',
  'viralobj-audio',
  true,
  5242880, -- 5MB per file
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: qualquer user autenticado pode ler/upload no próprio namespace
DROP POLICY IF EXISTS "viralobj_audio_public_read" ON storage.objects;
CREATE POLICY "viralobj_audio_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'viralobj-audio');

DROP POLICY IF EXISTS "viralobj_audio_service_write" ON storage.objects;
CREATE POLICY "viralobj_audio_service_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'viralobj-audio');

-- ============================================================================
-- 3. RPC release_quota — espelho do reserve_quota para rollback
-- ============================================================================

CREATE OR REPLACE FUNCTION public.release_quota(
  p_tenant_id uuid,
  p_counter text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_month date := date_trunc('month', now())::date;
  v_current int;
BEGIN
  EXECUTE format(
    'SELECT %I FROM public.usage_monthly WHERE tenant_id = $1 AND month = $2 FOR UPDATE',
    p_counter || '_count'
  ) INTO v_current USING p_tenant_id, v_month;

  -- Nada a liberar se contador não existe ou já está em 0
  IF v_current IS NULL OR v_current <= 0 THEN
    RETURN false;
  END IF;

  EXECUTE format(
    'UPDATE public.usage_monthly SET %I = GREATEST(%I - 1, 0), updated_at = now() WHERE tenant_id = $1 AND month = $2',
    p_counter || '_count',
    p_counter || '_count'
  ) USING p_tenant_id, v_month;

  RETURN true;
END;
$$;
