import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get('days') || '30', 10);
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const supabase = createServiceClient();

  const { data: artifacts } = await supabase
    .from('generation_artifacts')
    .select('id, job_id, type, metadata, created_at')
    .gte('created_at', since);

  const breakdown: Record<string, { count: number; estimatedCost: number }> = {
    scene_image: { count: 0, estimatedCost: 0 },
    scene_audio: { count: 0, estimatedCost: 0 },
    rendered_video: { count: 0, estimatedCost: 0 },
    other: { count: 0, estimatedCost: 0 },
  };

  // Custos estimados por tipo de artefato
  const costMap: Record<string, number> = {
    scene_image: 0.05,
    scene_audio: 0.0225,
    rendered_video: 0.16,
    scene_images_batch: 0,
    video_timeline: 0,
  };

  type Row = Record<string, unknown>;
  for (const a of ((artifacts ?? []) as Row[])) {
    const aType = a.type as string;
    const category = breakdown[aType] ? aType : 'other';
    breakdown[category].count += 1;
    breakdown[category].estimatedCost += costMap[aType] ?? 0;
  }

  const totalCost = Object.values(breakdown).reduce((s, b) => s + b.estimatedCost, 0);
  const totalArtifacts = (artifacts ?? []).length;

  return NextResponse.json({
    breakdown,
    totalCost: Math.round(totalCost * 100) / 100,
    totalArtifacts,
    period: { days, since },
  });
}
