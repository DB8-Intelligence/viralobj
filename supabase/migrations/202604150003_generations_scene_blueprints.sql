-- DEV-10: Persist structured scene blueprints (intro/dialogue/reaction/cta)
-- per object, for reuse in image, video, preview and edit pipelines.
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS scene_blueprints jsonb;

CREATE INDEX IF NOT EXISTS idx_generations_scene_blueprints
  ON public.generations USING gin (scene_blueprints);
