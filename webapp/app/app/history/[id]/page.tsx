import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";
import GenerationDetail from "@/components/app/GenerationDetail";

export default async function GenerationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) notFound();

  const g = data as Generation;
  const pkg = (g.package ?? {}) as {
    meta?: { topic_pt?: string; topic_en?: string; format?: string; tone?: string; duration?: number; niche?: string };
    characters?: Array<{ emoji?: string; name_pt?: string; name_en?: string; personality?: string; expression_arc?: string[]; voice_script_pt?: string; voice_script_en?: string; ai_prompt_midjourney?: string; timestamp_start?: string; timestamp_end?: string; id?: string }>;
    captions?: Array<{ time?: string; text?: string; character?: string; style?: string }>;
    post_copy?: { caption_pt?: string; caption_en?: string; hashtags_pt?: string[] | string; hashtags_en?: string[] | string };
    variations?: Array<{ title_pt?: string; title_en?: string; hook_pt?: string; hook_en?: string; objects?: string[]; description_pt?: string; description_en?: string; tone?: string }>;
  };
  const objects = g.objects ?? [];

  const rawSceneImages = (g as unknown as { scene_images?: Array<{ sceneId: string; imageUrl: string; sceneType: string }> | null }).scene_images;
  const approvedImages = (g as unknown as { approved_images?: string[] | null }).approved_images;
  const sceneImages = Array.isArray(approvedImages) && approvedImages.length > 0
    ? (rawSceneImages ?? []).filter((img) => approvedImages.includes(img.sceneId))
    : rawSceneImages;
  const sceneAudios = (g as unknown as { scene_audios?: Array<{ sceneId: string; audioUrl: string; sceneType: string; objectId: string; durationMs: number }> | null }).scene_audios;
  const sceneVideos = (g as unknown as { scene_videos?: Array<{ sceneId: string; sceneType: string; videoUrl: string; durationMs: number }> | null }).scene_videos;
  const videoUrl = (g as unknown as { video_url?: string | null }).video_url;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div className="min-w-0 flex-1">
          <Link href="/app/history" className="text-xs text-viral-accent hover:underline inline-flex items-center gap-1 mb-2">
            ← Voltar ao histórico
          </Link>
          <h1 className="text-2xl font-bold truncate">{pkg.meta?.topic_pt ?? g.topic}</h1>
          <div className="text-xs text-viral-muted mt-1 flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded bg-viral-accent/10 text-viral-accent text-[10px] uppercase">
              {g.niche}
            </span>
            <span>{g.tone}</span>
            <span>·</span>
            <span>{g.duration}s</span>
            <span>·</span>
            <span>{objects.length} objetos</span>
            <span>·</span>
            <span>{new Date(g.created_at).toLocaleString("pt-BR")}</span>
          </div>
        </div>
      </header>

      <div className="card p-5 bg-viral-bg/40">
        <GenerationDetail
          pkg={pkg}
          niche={g.niche}
          sceneImages={sceneImages}
          sceneAudios={sceneAudios}
          sceneVideos={sceneVideos}
          videoUrl={videoUrl}
        />
      </div>
    </div>
  );
}
