import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const VEO3_ENDPOINT = "fal-ai/veo3/fast/image-to-video";

interface QueueItem {
  sceneId: string;
  sceneType: string;
  requestId: string | null;
  imageUrl: string;
  promptPreview: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "SUBMIT_FAILED";
  videoUrl?: string;
  error?: string;
  submittedAt: string;
  completedAt?: string;
  durationMs?: number;
}

interface SceneVideo {
  sceneId: string;
  sceneType: "intro" | "dialogue" | "reaction" | "cta";
  videoUrl: string;
  durationMs: number;
}

/**
 * Polling endpoint — cliente chama a cada ~10s para verificar status dos
 * jobs Veo 3 submetidos pelo /generate-video.
 *
 * Para cada item IN_QUEUE/IN_PROGRESS, consulta o status no Fal; se COMPLETED,
 * busca o result e salva videoUrl. Atualiza scene_videos e pipeline_step
 * no Supabase quando todos terminam.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const generationId = req.nextUrl.searchParams.get("generation_id");
    if (!generationId) {
      return NextResponse.json({ error: "generation_id obrigatório" }, { status: 400 });
    }

    const falKey = process.env.FAL_KEY?.trim();
    if (!falKey) {
      return NextResponse.json({ error: "FAL_KEY não configurada" }, { status: 500 });
    }
    fal.config({ credentials: falKey });

    const svc = createServiceClient();

    const { data: gen, error: genErr } = await svc
      .from("generations")
      .select("video_queue, scene_videos, pipeline_step, profile_id")
      .eq("id", generationId)
      .single();

    if (genErr || !gen) {
      return NextResponse.json({ error: "Geração não encontrada" }, { status: 404 });
    }

    const queue = (gen.video_queue ?? []) as QueueItem[];
    if (queue.length === 0) {
      return NextResponse.json({
        generation_id: generationId,
        items: [],
        pending: 0,
        completed: 0,
        failed: 0,
        status: "idle",
      });
    }

    // Para cada item ainda não finalizado, consultar Fal
    const updatedQueue = await Promise.all(
      queue.map(async (item) => {
        if (item.status === "COMPLETED" || item.status === "FAILED" || item.status === "SUBMIT_FAILED") {
          return item;
        }
        if (!item.requestId) {
          return { ...item, status: "FAILED" as const, error: "requestId ausente" };
        }

        try {
          const status = await fal.queue.status(VEO3_ENDPOINT, {
            requestId: item.requestId,
          });

          if (status.status === "COMPLETED") {
            // Buscar resultado
            try {
              const result = await fal.queue.result(VEO3_ENDPOINT, {
                requestId: item.requestId,
              });
              const videoUrl =
                (result as { data?: { video?: { url?: string } } })?.data?.video?.url ??
                (result as { video?: { url?: string } })?.video?.url ??
                null;

              if (videoUrl) {
                const submittedAt = new Date(item.submittedAt).getTime();
                const now = Date.now();
                return {
                  ...item,
                  status: "COMPLETED" as const,
                  videoUrl,
                  completedAt: new Date(now).toISOString(),
                  durationMs: now - submittedAt,
                };
              }
              return {
                ...item,
                status: "FAILED" as const,
                error: "Resultado do Fal sem videoUrl",
              };
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              return { ...item, status: "FAILED" as const, error: `result fetch: ${msg}` };
            }
          }

          // IN_PROGRESS ou IN_QUEUE
          return {
            ...item,
            status: (status.status as "IN_QUEUE" | "IN_PROGRESS") ?? item.status,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[video-status] poll failed scene=${item.sceneId}: ${msg}`);
          return { ...item, status: "FAILED" as const, error: `status poll: ${msg}` };
        }
      }),
    );

    const completed = updatedQueue.filter((i) => i.status === "COMPLETED");
    const failed = updatedQueue.filter((i) => i.status === "FAILED" || i.status === "SUBMIT_FAILED");
    const pending = updatedQueue.filter((i) => i.status === "IN_QUEUE" || i.status === "IN_PROGRESS");

    const allDone = pending.length === 0;

    // Atualizar DB: queue sempre, scene_videos apenas com itens completed,
    // pipeline_step quando todos terminarem
    const sceneVideos: SceneVideo[] = completed
      .filter((i) => typeof i.videoUrl === "string")
      .map((i) => ({
        sceneId: i.sceneId,
        sceneType: i.sceneType as SceneVideo["sceneType"],
        videoUrl: i.videoUrl!,
        durationMs: i.durationMs ?? 8000,
      }));

    const updates: Record<string, unknown> = {
      video_queue: updatedQueue,
      scene_videos: sceneVideos,
    };

    if (allDone) {
      if (completed.length > 0) {
        updates.pipeline_step = "video_review";
        updates.video_url = sceneVideos[0]?.videoUrl ?? null;
        updates.video_error = failed.length > 0
          ? `${failed.length} cena(s) falharam: ${failed.map((f) => f.error ?? "unknown").join("; ").slice(0, 500)}`
          : null;
      } else {
        updates.pipeline_step = "failed";
        updates.video_error = `Todas as ${failed.length} cenas falharam no Veo 3`;
      }
    }

    await svc.from("generations").update(updates).eq("id", generationId);

    return NextResponse.json({
      generation_id: generationId,
      items: updatedQueue,
      pending: pending.length,
      completed: completed.length,
      failed: failed.length,
      total: updatedQueue.length,
      status: allDone
        ? (completed.length > 0 ? "completed" : "failed")
        : "processing",
      scene_videos: sceneVideos,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[video-status] error:", e);
    return NextResponse.json({ error: `Erro ao consultar status: ${msg}` }, { status: 500 });
  }
}
