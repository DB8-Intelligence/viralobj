-- DEV-34: Persist final rendered video URL and the assembly structure used.
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_assembly jsonb;
