-- DEV-29: Persist per-scene audio outputs and the assembled video timeline.
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS scene_audios jsonb,
  ADD COLUMN IF NOT EXISTS video_timeline jsonb;

CREATE INDEX IF NOT EXISTS idx_generations_scene_audios
  ON public.generations USING gin (scene_audios);

CREATE INDEX IF NOT EXISTS idx_generations_video_timeline
  ON public.generations USING gin (video_timeline);
