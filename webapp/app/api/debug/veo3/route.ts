import { NextRequest, NextResponse } from "next/server";
import { fal } from "@fal-ai/client";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "dmbbonanza@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

/**
 * Debug endpoint — isola a chamada ao Veo 3 Fast para diagnosticar
 * falhas do Step 5 sem depender do wizard inteiro.
 *
 * POST /api/debug/veo3
 * Body: {
 *   imageUrl?: string       — se omitido, usa imagem de teste hardcoded
 *   prompt?: string         — se omitido, usa prompt de teste
 *   duration?: "4s"|"6s"|"8s"
 *   generateAudio?: boolean
 *   speechText?: string     — fala em português (entra no prompt)
 * }
 *
 * Retorna:
 *   - success: true/false
 *   - elapsedMs: tempo total da chamada
 *   - payload: o que foi enviado pro Fal
 *   - response: resposta bruta do Fal (inclusive error body)
 *   - errorDetails: stack + message se exceção
 */
export async function POST(req: NextRequest) {
  const user = await (async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  })();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (!ADMIN_EMAILS.includes((user.email ?? "").toLowerCase())) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const imageUrl: string =
    body.imageUrl ??
    "https://v3b.fal.media/files/b/0a974914/qxb3ehpxdCmugveyh6XgJ_4184e23fa511401595815390ba63c505.jpg";
  const duration: "4s" | "6s" | "8s" = body.duration ?? "8s";
  const generateAudio = body.generateAudio !== false;
  const speechText = body.speechText ?? "Eu sou o Cacto, resistente no calor do Brasil.";
  const prompt =
    body.prompt ??
    `Character speaks directly to camera with confident animated expression. The character says in Portuguese: "${speechText}". Disney Pixar 3D animated style, dramatic lighting, 9:16 vertical video, cozy Brazilian apartment background, warm golden hour lighting with bokeh.`;

  const falKey = process.env.FAL_KEY?.trim();
  const payload = {
    prompt,
    image_url: imageUrl,
    aspect_ratio: "9:16" as const,
    duration,
    resolution: "720p" as const,
    generate_audio: generateAudio,
  };

  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    fal_key_present: !!falKey,
    fal_key_length: falKey?.length ?? 0,
    fal_key_has_newline: falKey !== process.env.FAL_KEY,
    env_FAL_VIDEO_READY: process.env.FAL_VIDEO_READY,
    endpoint: "fal-ai/veo3/fast/image-to-video",
    payload,
  };

  if (!falKey) {
    return NextResponse.json(
      { success: false, error: "FAL_KEY não configurada", diagnostics },
      { status: 500 },
    );
  }

  fal.config({ credentials: falKey });

  const startedAt = Date.now();
  try {
    const result = await fal.subscribe("fal-ai/veo3/fast/image-to-video", {
      input: payload,
      logs: true,
      onQueueUpdate: (update) => {
        console.log("[debug-veo3] queue update:", JSON.stringify(update).slice(0, 200));
      },
    });
    const elapsedMs = Date.now() - startedAt;

    // Persistir resultado raw pra análise posterior
    const svc = createServiceClient();
    await svc.from("bug_reports").insert({
      user_id: user.id,
      title: `[debug-veo3] ${elapsedMs}ms — ${(result as any)?.data?.video?.url ? "success" : "no_video_url"}`,
      description: "Automated Veo 3 debug test result",
      severity: "bug",
      context: {
        diagnostics,
        elapsedMs,
        result,
        source: "debug-veo3",
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      elapsedMs,
      diagnostics,
      videoUrl:
        (result as any)?.data?.video?.url ??
        (result as any)?.video?.url ??
        null,
      rawResponse: result,
    });
  } catch (err: any) {
    const elapsedMs = Date.now() - startedAt;
    const errorDetails = {
      message: err?.message ?? String(err),
      name: err?.name,
      status: err?.status,
      statusCode: err?.statusCode,
      body: err?.body,
      cause: err?.cause,
      stack: err?.stack?.split("\n").slice(0, 5),
    };
    console.error("[debug-veo3] ERROR", errorDetails);

    // Persistir erro pra análise
    const svc = createServiceClient();
    await svc.from("bug_reports").insert({
      user_id: user.id,
      title: `[debug-veo3] FAILED ${elapsedMs}ms — ${err?.message?.slice(0, 100) ?? "unknown"}`,
      description: "Automated Veo 3 debug test failure",
      severity: "blocker",
      context: {
        diagnostics,
        elapsedMs,
        errorDetails,
        source: "debug-veo3",
      },
    }).catch(() => {});

    return NextResponse.json(
      { success: false, elapsedMs, diagnostics, errorDetails },
      { status: 502 },
    );
  }
}
