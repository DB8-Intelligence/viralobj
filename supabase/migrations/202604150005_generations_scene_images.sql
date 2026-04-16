-- DEV-18: Persist generated per-scene images (mock or real provider)
-- for preview, debug, and downstream video assembly.
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS scene_images jsonb;

CREATE INDEX IF NOT EXISTS idx_generations_scene_images
  ON public.generations USING gin (scene_images);
