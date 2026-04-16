-- DEV-14: Persist final per-scene image prompts (enriched via buildVisualPrompt)
-- for debug, reuse and downstream image generation.
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS scene_image_prompts jsonb;

CREATE INDEX IF NOT EXISTS idx_generations_scene_image_prompts
  ON public.generations USING gin (scene_image_prompts);
