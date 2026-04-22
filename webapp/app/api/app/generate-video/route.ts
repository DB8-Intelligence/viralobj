import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60; // agora é thin — só submete jobs ao Fal queue

const VEO3_ENDPOINT = "fal-ai/veo3/fast/image-to-video";
const MAX_SCENES = 4;

const PRIORITY: Record<string, number> = {
  intro: 0,
  dialogue: 1,
  reaction: 2,
  cta: 3,
};

/**
 * Submete as cenas aprovadas à fila async do Fal.ai Veo 3 Fast.
 * Retorna imediatamente com os request_ids — o cliente faz polling em
 * /api/app/video-status pra buscar os resultados.
 *
 * Isto substitui o padrão antigo com fal.subscribe() que bloqueava a função
 * do Vercel por 2-5min por cena, estourando timeout.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { generation_id, approved_images } = body;

    if (!generation_id) {
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
      .select("scene_images, edited_scripts, package")
      .eq("id", generation_id)
      .single();

    if (genErr || !gen) {
      return NextResponse.json({ error: "Geração não encontrada" }, { status: 404 });
    }

    const sceneImages = (gen.scene_images ?? []) as Array<{
      sceneId: string;
      sceneType: string;
      imageUrl: string;
      objectId?: string;
    }>;

    const approvedSet = new Set<string>(approved_images ?? []);
    const approved = approvedSet.size > 0
      ? sceneImages.filter((img) => approvedSet.has(img.sceneId))
      : sceneImages;

    const validScenes = approved
      .filter((img) => typeof img.imageUrl === "string" && img.imageUrl.startsWith("http") && !img.imageUrl.includes("placehold"))
      .sort((a, b) => (PRIORITY[a.sceneType] ?? 9) - (PRIORITY[b.sceneType] ?? 9))
      .slice(0, MAX_SCENES);

    if (validScenes.length === 0) {
      await svc.from("generations")
        .update({
          video_error: `Nenhuma cena aprovada com imagem válida (${approved.length} aprovadas, 0 com URL HTTP).`,
          pipeline_step: "failed",
        })
        .eq("id", generation_id);
      return NextResponse.json(
        { error: "Nenhuma cena válida para renderizar" },
        { status: 400 },
      );
    }

    // Montar scriptMap para injetar fala nos prompts
    const editedScripts = (gen.edited_scripts ?? {}) as Record<string, string>;
    const pkg = gen.package as { characters?: Array<{ id?: string; name_pt?: string; voice_script_pt?: string }> };
    const chars = pkg?.characters ?? [];
    const scriptMap = new Map<string, string>();
    for (const char of chars) {
      const rawId = char.id ?? char.name_pt ?? "";
      const charId = typeof rawId === "string" ? rawId : String(rawId);
      const script = editedScripts[charId] ?? char.voice_script_pt ?? "";
      if (script) {
        scriptMap.set(charId, script);
        if (char.name_pt && char.name_pt !== charId) scriptMap.set(char.name_pt, script);
      }
    }

    // Submeter cada cena ao Fal queue em paralelo — cada submit volta em <1s
    const queueJobs = await Promise.all(
      validScenes.map(async (img) => {
        const rawObjId = (img as unknown as { objectId?: string | number }).objectId ?? img.sceneId.split("-").slice(0, -1).join("-");
        const objectId = typeof rawObjId === "string" ? rawObjId : String(rawObjId);
        const objectIdNoNiche = objectId.replace(/-[^-]+$/, "");
        const speechText =
          scriptMap.get(objectId) ??
          scriptMap.get(objectIdNoNiche) ??
          scriptMap.get(img.sceneId) ??
          "";

        const sceneDirection =
          img.sceneType === "intro"
            ? "Static medium shot. The character looks at camera with confident animated expression"
            : img.sceneType === "dialogue"
              ? "The character gestures expressively while speaking with emotion"
              : img.sceneType === "reaction"
                ? "The character reacts with dramatic facial expression changes"
                : "Slow zoom in. The character gives final message with warm smile";

        const prompt = speechText
          ? `${sceneDirection}. The character says in Brazilian Portuguese: "${speechText}". Pixar 3D animated style, warm golden hour lighting, 9:16 vertical, cozy Brazilian background.`
          : `${sceneDirection}. Subtle idle animation with breathing and blinking. Pixar 3D style, warm cinematic lighting.`;

        try {
          const submitted = await fal.queue.submit(VEO3_ENDPOINT, {
            input: {
              prompt,
              image_url: img.imageUrl,
              aspect_ratio: "9:16",
              duration: "8s",
              resolution: "720p",
              generate_audio: true,
            },
          });

          return {
            sceneId: img.sceneId,
            sceneType: img.sceneType,
            requestId: submitted.request_id,
            imageUrl: img.imageUrl,
            promptPreview: prompt.slice(0, 180),
            status: "IN_QUEUE" as const,
            submittedAt: new Date().toISOString(),
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[generate-video] submit failed scene=${img.sceneId}: ${msg}`);
          return {
            sceneId: img.sceneId,
            sceneType: img.sceneType,
            requestId: null,
            imageUrl: img.imageUrl,
            promptPreview: prompt.slice(0, 180),
            status: "SUBMIT_FAILED" as const,
            error: msg,
            submittedAt: new Date().toISOString(),
          };
        }
      }),
    );

    const submittedCount = queueJobs.filter((j) => j.status === "IN_QUEUE").length;

    await svc
      .from("generations")
      .update({
        video_queue: queueJobs,
        video_provider: "fal",
        video_error: null,
        scene_videos: [],
        pipeline_step: submittedCount > 0 ? "video_rendering" : "failed",
      })
      .eq("id", generation_id);

    return NextResponse.json({
      generation_id,
      queue_items: queueJobs,
      submitted: submittedCount,
      total: queueJobs.length,
      status: submittedCount > 0 ? "processing" : "failed",
      poll_url: `/api/app/video-status?generation_id=${generation_id}`,
    }, { status: 202 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[generate-video] error:", e);
    try {
      const svc = createServiceClient();
      const body = await req.clone().json().catch(() => ({}));
      if (body.generation_id) {
        await svc
          .from("generations")
          .update({ video_error: msg, pipeline_step: "failed" })
          .eq("id", body.generation_id);
      }
    } catch { /* best effort */ }
    return NextResponse.json({ error: `Erro ao submeter vídeo: ${msg}` }, { status: 500 });
  }
}
