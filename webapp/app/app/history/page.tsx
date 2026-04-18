import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Generation } from "@/lib/supabase/types";
import GenerationDetail from "@/components/app/GenerationDetail";

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
          <div className="text-4xl mb-4">🎬</div>
          <div className="text-viral-muted text-sm mb-4">
            Você ainda não gerou nenhum pacote.
          </div>
          <Link href="/app/generate" className="btn-primary">
            Criar primeiro pacote →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {generations.map((g) => {
            const pkg = g.package as {
              meta?: { topic_pt?: string; topic_en?: string; format?: string; tone?: string; duration?: number; niche?: string };
              characters?: Array<{ emoji?: string; name_pt?: string; name_en?: string; personality?: string; expression_arc?: string[]; voice_script_pt?: string; voice_script_en?: string; ai_prompt_midjourney?: string; timestamp_start?: string; timestamp_end?: string; id?: string }>;
              captions?: Array<{ time?: string; text?: string; character?: string; style?: string }>;
              post_copy?: { caption_pt?: string; caption_en?: string; hashtags_pt?: string[] | string; hashtags_en?: string[] | string };
              variations?: Array<{ title_pt?: string; title_en?: string; hook_pt?: string; hook_en?: string; objects?: string[]; description_pt?: string; description_en?: string; tone?: string }>;
            };

            const sceneImages = (g as unknown as { scene_images?: Array<{ sceneId: string; imageUrl: string; sceneType: string }> | null }).scene_images;
            const videoUrl = (g as unknown as { video_url?: string | null }).video_url;

            return (
              <details key={g.id} className="card overflow-hidden group">
                <summary className="cursor-pointer p-5 list-none hover:bg-viral-border/10 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-viral-text">
                        {pkg.meta?.topic_pt ?? g.topic}
                      </div>
                      <div className="text-xs text-viral-muted mt-1 flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-viral-accent/10 text-viral-accent text-[10px] uppercase">
                          {g.niche}
                        </span>
                        <span>{g.tone}</span>
                        <span>·</span>
                        <span>{g.duration}s</span>
                        <span>·</span>
                        <span>{g.objects.length} obj</span>
                        {g.provider_used && (
                          <>
                            <span>·</span>
                            <span>via {g.provider_used}</span>
                          </>
                        )}
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
                          className="text-xs px-2.5 py-1 rounded-full bg-viral-border/30 flex items-center gap-1"
                        >
                          <span>{c.emoji}</span>
                          <span>{c.name_pt}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </summary>
                <div className="border-t border-viral-border/60 p-5 bg-viral-bg/40">
                  <GenerationDetail
                    pkg={pkg}
                    sceneImages={sceneImages}
                    videoUrl={videoUrl}
                  />
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
