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

    // Mapear scripts por objectId
    const scriptMap = new Map<string, string>();
    for (const char of chars) {
      const charId = char.id ?? char.name_pt ?? "";
      const script = editedScripts[charId] ?? char.voice_script_pt ?? "";
      if (script) scriptMap.set(charId, script);
    }

    // Montar timeline com imagens aprovadas + textos de fala
    const timelineScenes = approvedSceneImages
      .filter((img) => typeof img.imageUrl === "string" && img.imageUrl.startsWith("http") && !img.imageUrl.includes("placehold"))
      .map((img) => {
        const objectId = (img as any).objectId ?? img.sceneId.split("-").slice(0, -1).join("-");
        const script = scriptMap.get(objectId) ?? scriptMap.get(img.sceneId) ?? "";

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

    // Salvar no banco
    await svc
      .from("generations")
      .update({
        video_url: rendered.videoUrl,
        scene_videos: rendered.sceneVideos,
        pipeline_step: "video_review",
      })
      .eq("id", generation_id);

    return NextResponse.json({
      scene_videos: rendered.sceneVideos,
      video_url: rendered.videoUrl,
      provider: rendered.provider,
      count: rendered.sceneVideos.length,
      report: {
        scenes_requested: timelineScenes.length,
        scenes_rendered: rendered.sceneVideos.length,
        total_cost_usd: rendered.totalCostUsd ?? 0,
        elapsed_ms: elapsedMs,
        scene_reports: rendered.sceneReports ?? [],
        skip_reason: rendered.skipReason,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[generate-video] error:", e);
    return NextResponse.json(
      { error: `Erro ao gerar vídeo: ${msg}` },
      { status: 500 },
    );
  }
}
