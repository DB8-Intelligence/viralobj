import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";
import ScenePromptPreview from "@/components/app/ScenePromptPreview";
import type { ObjectBible } from "@/lib/viral-objects/object-bible";
import type { SceneBlueprint } from "@/lib/viral-objects/scene-blueprint";
import type { SceneImagePrompt } from "@/lib/viral-objects/image-prompt-pack";
import type { GeneratedSceneImage } from "@/lib/viral-objects/image-generation.service";
import type { GeneratedSceneAudio } from "@/lib/viral-objects/audio-generation.service";
import type { VideoTimeline } from "@/lib/viral-objects/video-timeline";

export default async function HistoryPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const generations = (data ?? []) as Generation[];

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Histórico</h1>
          <p className="text-viral-muted">
            {generations.length} geração{generations.length === 1 ? "" : "ões"}
          </p>
        </div>
        <Link href="/app/generate" className="btn-primary">
          Nova geração →
        </Link>
      </header>

      {generations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-viral-muted text-sm mb-4">
            Você ainda não gerou nenhum pacote.
          </div>
          <Link href="/app/generate" className="btn-primary">
            Criar primeiro pacote →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((g) => {
            const pkg = g.package as {
              meta?: { topic_pt?: string; topic_en?: string; format?: string };
              characters?: Array<{ emoji?: string; name_pt?: string }>;
            };
            return (
              <details key={g.id} className="card overflow-hidden">
                <summary className="cursor-pointer p-5 list-none">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {pkg.meta?.topic_pt ?? g.topic}
                      </div>
                      <div className="text-xs text-viral-muted mt-1">
                        {g.niche} · {g.tone} · {g.duration}s · {g.objects.length} obj
                        {g.provider_used && ` · via ${g.provider_used}`}
                      </div>
                    </div>
                    <div className="text-xs text-viral-muted whitespace-nowrap">
                      {new Date(g.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {pkg.characters && pkg.characters.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pkg.characters.map((c, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-full bg-viral-border/30"
                        >
                          {c.emoji} {c.name_pt}
                        </span>
                      ))}
                    </div>
                  )}
                </summary>
                <div className="border-t border-viral-border/60 p-5 bg-viral-bg/40 space-y-5">
                  <ScenePromptPreview
                    objectBibles={
                      (g as unknown as { object_bibles?: ObjectBible[] | null })
                        .object_bibles ?? null
                    }
                    sceneBlueprints={
                      (g as unknown as {
                        scene_blueprints?: Array<{ objectId: string; scenes: SceneBlueprint[] }> | null;
                      }).scene_blueprints ?? null
                    }
                    sceneImagePrompts={
                      (g as unknown as { scene_image_prompts?: SceneImagePrompt[] | null })
                        .scene_image_prompts ?? null
                    }
                    sceneImages={
                      (g as unknown as { scene_images?: GeneratedSceneImage[] | null })
                        .scene_images ?? null
                    }
                    sceneAudios={
                      (g as unknown as { scene_audios?: GeneratedSceneAudio[] | null })
                        .scene_audios ?? null
                    }
                    videoTimeline={
                      (g as unknown as { video_timeline?: VideoTimeline | null })
                        .video_timeline ?? null
                    }
                    videoUrl={
                      (g as unknown as { video_url?: string | null })
                        .video_url ?? null
                    }
                  />
                  {/* Captions para Instagram */}
                  {pkg.meta && (
                    <div className="card p-4 space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted">Caption Instagram</h4>
                      <p className="text-sm text-viral-text whitespace-pre-wrap">
                        {(g.package as { post_copy?: { caption_pt?: string } }).post_copy?.caption_pt ?? "—"}
                      </p>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
