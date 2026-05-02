-- Bug Reports table for in-app bug reporting widget
-- Spec: BUG_REPORTER_SPEC.md (validated in Manuscry, commit 46a9d63)

-- Helper: updated_at trigger function (reusable across tables)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'bug'
    CHECK (severity IN ('blocker', 'bug', 'suggestion')),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'investigating', 'fixed', 'wont_fix')),
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_bug_reports_status_date
  ON public.bug_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bug_reports_severity_status
  ON public.bug_reports(severity, status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_date
  ON public.bug_reports(user_id, created_at DESC);

-- Auto-update updated_at
CREATE TRIGGER bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bugs_own_read" ON public.bug_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bugs_own_insert" ON public.bug_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sem policy de UPDATE — triage é via service_role na API
