-- DEV-5: Persist Object Bibles (plural, one per input.object) with each
-- generation for character continuity across reels.
ALTER TABLE public.generations
  ADD COLUMN IF NOT EXISTS object_bibles jsonb;

CREATE INDEX IF NOT EXISTS idx_generations_object_bibles
  ON public.generations USING gin (object_bibles);

-- Backfill + drop the singular column if a prior run applied it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'generations'
      AND column_name = 'object_bible'
  ) THEN
    UPDATE public.generations
      SET object_bibles = COALESCE(object_bibles, object_bible)
      WHERE object_bible IS NOT NULL;
    ALTER TABLE public.generations DROP COLUMN object_bible;
  END IF;
END $$;
