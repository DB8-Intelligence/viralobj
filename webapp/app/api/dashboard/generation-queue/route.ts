import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);

  const supabase = createServiceClient();

  const { data: jobs } = await supabase
    .from('generation_jobs')
    .select('id, tenant_id, user_id, status, progress, input, error, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!jobs || jobs.length === 0) {
    return NextResponse.json({ jobs: [], total: 0 });
  }

  const jobIds = jobs.map((j: Record<string, unknown>) => j.id as string);

  const { data: steps } = await supabase
    .from('generation_job_steps')
    .select('id, job_id, step, status, started_at, completed_at, error')
    .in('job_id', jobIds)
    .order('created_at', { ascending: true });

  type StepRow = Record<string, unknown>;
  const stepsByJob = new Map<string, StepRow[]>();
  for (const s of (steps ?? []) as StepRow[]) {
    const jobId = s.job_id as string;
    const list = stepsByJob.get(jobId) ?? [];
    list.push(s);
    stepsByJob.set(jobId, list);
  }

  const enriched = jobs.map((job: Record<string, unknown>) => {
    const jobSteps = stepsByJob.get(job.id as string) ?? [];
    const updatedAt = job.updated_at as string | null;
    const createdAt = job.created_at as string | null;
    const durationMs = updatedAt && createdAt
      ? new Date(updatedAt).getTime() - new Date(createdAt).getTime()
      : null;

    return {
      ...job,
      steps: jobSteps,
      durationMs,
      durationSec: durationMs ? Math.round(durationMs / 100) / 10 : null,
    };
  });

  return NextResponse.json({ jobs: enriched, total: jobs.length });
}
