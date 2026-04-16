import { NextRequest, NextResponse } from 'next/server';
import { JobService } from '@/lib/jobs/job.service';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const jobService = new JobService();

  const job = await jobService.createJob({
    tenant_id: body.tenantId,
    user_id: body.userId,
    status: 'queued',
    progress: 0,
    input: body
  });

  return NextResponse.json({
    jobId: job.id
  });
}
