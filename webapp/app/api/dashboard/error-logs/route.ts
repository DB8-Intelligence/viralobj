import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  const supabase = createServiceClient();

  const { data: failedSteps } = await supabase
    .from('generation_job_steps')
    .select('id, job_id, step, status, error, started_at, completed_at, created_at')
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Tambem buscar jobs failed (sem step especifico)
  const { data: failedJobs } = await supabase
    .from('generation_jobs')
    .select('id, status, error, created_at, updated_at')
    .eq('status', 'failed')
    .order('created_at', { ascending: false })
    .limit(limit);

  return NextResponse.json({
    failedSteps: failedSteps ?? [],
    failedJobs: failedJobs ?? [],
    totalErrors: (failedSteps?.length ?? 0) + (failedJobs?.length ?? 0),
  });
}
