import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const supabase = createServiceClient();

  const [jobsRes, stepsRes] = await Promise.all([
    supabase
      .from('generation_jobs')
      .select('id, status, progress, created_at, updated_at')
      .gte('created_at', since),
    supabase
      .from('generation_job_steps')
      .select('id, job_id, step, status, started_at, completed_at, error')
      .gte('created_at', since),
  ]);

  type Row = Record<string, unknown>;
  const jobs = (jobsRes.data ?? []) as Row[];
  const steps = (stepsRes.data ?? []) as Row[];

  const totalJobs = jobs.length;
  const completed = jobs.filter((j) => j.status === 'completed').length;
  const failed = jobs.filter((j) => j.status === 'failed').length;
  const running = jobs.filter((j) => j.status === 'running').length;
  const queued = jobs.filter((j) => j.status === 'queued').length;

  const successRate = totalJobs > 0 ? Math.round((completed / totalJobs) * 100) : 0;

  const durations = jobs
    .filter((j) => j.status === 'completed' && j.updated_at && j.created_at)
    .map((j) => new Date(j.updated_at as string).getTime() - new Date(j.created_at as string).getTime());
  const avgDurationMs = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  const failedSteps = steps.filter((s) => s.status === 'failed').length;

  return NextResponse.json({
    totalJobs,
    completed,
    failed,
    running,
    queued,
    successRate,
    avgDurationMs,
    avgDurationSec: Math.round(avgDurationMs / 1000 * 10) / 10,
    failedSteps,
    totalSteps: steps.length,
    period: { days, since },
  });
}
