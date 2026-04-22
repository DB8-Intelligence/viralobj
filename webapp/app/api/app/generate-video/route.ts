import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { renderVideo } from "@/lib/viral-objects/video-render.service";

export const runtime = "nodejs";
export const maxDuration = 800; // Veo 3 Fast: ~1-2min/cena × 4 cenas + overhead; Vercel Pro permite até 800s

/**
 * Gera vídeos com lip sync para imagens e áudios aprovados pelo usuário.
 * Recebe: generation_id, approved_images (array de sceneIds aprovados)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { generation_id, approved_images } = body;

    if (!generation_id) {
      return NextResponse.json(
        { error: "generation_id obrigatório" },
        { status: 400 },
      );
    }

    const svc = createServiceClient();

    // Buscar geração com imagens, áudios e scripts editados
    const { data: gen, error: genErr } = await svc
      .from("generations")
      .select("scene_images, scene_audios, edited_scripts, package")
      .eq("id", generation_id)
      .single();

    if (genErr || !gen) {
      return NextResponse.json(
        { error: "Geração não encontrada" },
        { status: 404 },
      );
    }

    const sceneImages = (gen.scene_images ?? []) as Array<{
      sceneId: string;
      sceneType: string;
      imageUrl: string;
      objectId?: string;
    }>;

    const sceneAudios = (gen.scene_audios ?? []) as Array<{
      sceneId: string;
      sceneType: string;
      audioUrl: string;
      objectId?: string;
      durationMs: number;
    }>;

    // Filtrar apenas imagens aprovadas pelo usuário
    const approvedSet = new Set(approved_images ?? []);
    const approvedSceneImages = approvedSet.size > 0
      ? sceneImages.filter((img) => approvedSet.has(img.sceneId))
      : sceneImages;

    // Buscar scripts editados para incluir fala no prompt do Veo 3
    const editedScripts = (gen.edited_scripts ?? {}) as Record<string, string>;
    const pkg = gen.package as { characters?: Array<{ id?: string; name_pt?: string; voice_script_pt?: string }> };
    const chars = pkg?.characters ?? [];

    // Mapear scripts por objectId — normalizar tudo para string para bater com
    // scene_images.objectId (que vem como string). LLM pode retornar char.id como number.
    const scriptMap = new Map<string, string>();
    for (const char of chars) {
      const rawId = char.id ?? char.name_pt ?? "";
      const charId = typeof rawId === "string" ? rawId : String(rawId);
      const script = editedScripts[charId] ?? char.voice_script_pt ?? "";
      if (script) {
        scriptMap.set(charId, script);
        // Também indexar por name_pt (fallback) para caso scene_images use nome
        if (char.name_pt && char.name_pt !== charId) scriptMap.set(char.name_pt, script);
      }
    }

    // Montar timeline com imagens aprovadas + textos de fala
    const timelineScenes = approvedSceneImages
      .filter((img) => typeof img.imageUrl === "string" && img.imageUrl.startsWith("http") && !img.imageUrl.includes("placehold"))
      .map((img) => {
        const rawObjId = (img as any).objectId ?? img.sceneId.split("-").slice(0, -1).join("-");
        const objectId = typeof rawObjId === "string" ? rawObjId : String(rawObjId);
        // Tentar múltiplas chaves: objectId direto, sem niche suffix, sceneId inteiro
        const objectIdNoNiche = objectId.replace(/-[^-]+$/, ""); // "Cacto-plantas" → "Cacto"
        const script =
          scriptMap.get(objectId) ??
          scriptMap.get(objectIdNoNiche) ??
          scriptMap.get(img.sceneId) ??
          "";

        return {
          sceneId: img.sceneId,
          sceneType: img.sceneType as "intro" | "dialogue" | "reaction" | "cta",
          startMs: 0,
          endMs: 8000,
          durationMs: 8000,
          imageUrl: img.imageUrl,
          overlayText: script, // Texto que o Veo 3 vai usar para gerar voz
        };
      });

    console.log(
      `[generate-video] Renderizando ${timelineScenes.length} cenas para generation ${generation_id}`,
    );

    const startedAt = Date.now();
    const rendered = await renderVideo({
      generationId: generation_id,
      timeline: {
        totalDurationMs: timelineScenes.reduce((sum, s) => sum + s.durationMs, 0),
        scenes: timelineScenes,
      },
    });
    const elapsedMs = Date.now() - startedAt;

    const report = {
      scenes_requested: timelineScenes.length,
      scenes_rendered: rendered.sceneVideos.length,
      total_cost_usd: rendered.totalCostUsd ?? 0,
      elapsed_ms: elapsedMs,
      scene_reports: rendered.sceneReports ?? [],
      skip_reason: rendered.skipReason,
    };

    // Success real apenas quando provider real (não mock) E pelo menos 1 cena rendered
    const renderFailed = rendered.provider === "mock" || rendered.sceneVideos.length === 0;
    const videoError = renderFailed
      ? (rendered.skipReason
          ?? rendered.sceneReports?.find((s) => s.status === "failed")?.error
          ?? "Nenhuma cena foi renderizada")
      : null;

    // Salvar no banco — video_url só se real (não mock://). scene_videos sempre.
    await svc
      .from("generations")
      .update({
        video_url: renderFailed ? null : rendered.videoUrl,
        scene_videos: rendered.sceneVideos,
        video_provider: rendered.provider,
        video_error: videoError,
        video_render_report: report,
        pipeline_step: renderFailed ? "failed" : "video_review",
      })
      .eq("id", generation_id);

    if (renderFailed) {
      return NextResponse.json(
        {
          error: videoError,
          scene_videos: [],
          video_url: null,
          provider: rendered.provider,
          count: 0,
          report,
        },
        { status: 502 }, // 502 Bad Gateway — upstream provider failed
      );
    }

    return NextResponse.json({
      scene_videos: rendered.sceneVideos,
      video_url: rendered.videoUrl,
      provider: rendered.provider,
      count: rendered.sceneVideos.length,
      report,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[generate-video] error:", e);
    // Persist error so we have trail to debug later
    try {
      const svc = createServiceClient();
      const body = await req.clone().json().catch(() => ({}));
      if (body.generation_id) {
        await svc
          .from("generations")
          .update({
            video_error: msg,
            pipeline_step: "failed",
          })
          .eq("id", body.generation_id);
      }
    } catch { /* best effort */ }
    return NextResponse.json(
      { error: `Erro ao gerar vídeo: ${msg}` },
      { status: 500 },
    );
  }
}
