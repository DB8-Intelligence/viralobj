import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const supabase = createServiceClient();

  const { data: steps } = await supabase
    .from('generation_job_steps')
    .select('step, status, started_at, completed_at')
    .eq('status', 'completed')
    .gte('created_at', since);

  type Row = Record<string, unknown>;
  const byStep: Record<string, number[]> = {};

  for (const s of ((steps ?? []) as Row[])) {
    if (!s.started_at || !s.completed_at) continue;
    const durationMs = new Date(s.completed_at as string).getTime() - new Date(s.started_at as string).getTime();
    const stepName = s.step as string;
    if (!byStep[stepName]) byStep[stepName] = [];
    byStep[stepName].push(durationMs);
  }

  const metrics = Object.entries(byStep).map(([step, durations]) => {
    durations.sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;
    const p50 = durations[Math.floor(durations.length * 0.5)] ?? 0;
    const p95 = durations[Math.floor(durations.length * 0.95)] ?? 0;

    return {
      step,
      count: durations.length,
      avgMs: Math.round(avg),
      avgSec: Math.round(avg / 100) / 10,
      minMs: durations[0] ?? 0,
      maxMs: durations[durations.length - 1] ?? 0,
      p50Ms: p50,
      p95Ms: p95,
    };
  });

  // Ordenar pela sequencia natural do pipeline
  const stepOrder = ['ingest', 'image_generation', 'audio_generation', 'timeline_build', 'video_render'];
  metrics.sort((a, b) => stepOrder.indexOf(a.step) - stepOrder.indexOf(b.step));

  return NextResponse.json({
    metrics,
    totalCompletedSteps: (steps ?? []).length,
    period: { days, since },
  });
}
