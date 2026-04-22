import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  generateSceneAudios,
  type SceneAudioInput,
} from "@/lib/viral-objects/audio-generation.service";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Gera áudios TTS para scripts aprovados pelo usuário no wizard.
 * Recebe: generation_id, edited_scripts, approved_images
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
    const { generation_id, edited_scripts, approved_images } = body;

    if (!generation_id) {
      return NextResponse.json(
        { error: "generation_id obrigatório" },
        { status: 400 },
      );
    }

    const svc = createServiceClient();

    // Buscar geração existente
    const { data: gen, error: genErr } = await svc
      .from("generations")
      .select("package, scene_blueprints")
      .eq("id", generation_id)
      .single();

    if (genErr || !gen) {
      return NextResponse.json(
        { error: "Geração não encontrada" },
        { status: 404 },
      );
    }

    const pkg = gen.package as {
      characters?: Array<{
        id?: string;
        name_pt?: string;
        voice_script_pt?: string;
      }>;
    };

    // Montar inputs de áudio usando scripts editados pelo usuário
    const audioInputs: SceneAudioInput[] = [];
    const chars = pkg.characters ?? [];

    for (const char of chars) {
      // Normalizar: LLM pode retornar id como number (1) ou string ("Cacto-plantas").
      // Sempre usar string para matching consistente com scene_images.objectId.
      const rawId = char.id ?? char.name_pt ?? "";
      const charId = typeof rawId === "string" ? rawId : String(rawId);
      const script = edited_scripts?.[charId] ?? char.voice_script_pt ?? "";
      if (!script) continue;

      // Gerar 1 áudio por personagem (intro scene)
      audioInputs.push({
        objectId: charId,
        sceneId: `${charId}-audio`,
        sceneType: "dialogue",
        text: script,
        generationId: generation_id,
      });
    }

    console.log(
      `[generate-audio] Gerando ${audioInputs.length} áudios para generation ${generation_id}`,
    );

    const sceneAudios = await generateSceneAudios(audioInputs);
    const uploadedCount = sceneAudios.filter((a) =>
      typeof a.audioUrl === "string" && a.audioUrl.startsWith("http"),
    ).length;
    console.log(
      `[generate-audio] ${uploadedCount}/${sceneAudios.length} áudios com URL pública (storage upload OK)`,
    );

    // Salvar no banco
    await svc
      .from("generations")
      .update({
        scene_audios: sceneAudios,
        edited_scripts: edited_scripts,
        approved_images: approved_images,
        pipeline_step: "audio_review",
      })
      .eq("id", generation_id);

    return NextResponse.json({
      scene_audios: sceneAudios,
      count: sceneAudios.length,
    });
  } catch (e) {
    console.error("[generate-audio] error:", e);
    return NextResponse.json(
      { error: "Erro ao gerar áudio" },
      { status: 500 },
    );
  }
}
