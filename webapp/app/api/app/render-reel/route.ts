import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateReelFull, BridgeError } from "@/lib/bridgeClient";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Sprint 27 — render-reel proxy.
 *
 *   browser → POST /api/app/render-reel
 *     → Supabase auth (or skipped if MOCK)
 *     → bridgeClient.generateReelFull → POST /api/generate-reel (bridge)
 *     → returns { job_id, status_url, scene_count, ... }
 *
 * The mock bridge returns 202 with job_id="mock-job-001" and the status
 * proxy in this folder drives the UI to a deterministic completed state.
 */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty body OK */
  }

  if (!body.niche || !body.objects || !body.topic) {
    return NextResponse.json(
      { error: "Campos obrigatórios: niche, objects, topic" },
      { status: 400 }
    );
  }

  try {
    const resp = await generateReelFull({
      niche: body.niche as string,
      objects: Array.isArray(body.objects)
        ? (body.objects as string[])
        : [String(body.objects)],
      topic: body.topic as string,
      tone: (body.tone as string) ?? "dramatic",
      duration: (body.duration as number) ?? 15,
      lang: ((body.lang as "pt" | "en" | "both") ?? "both"),
      provider: "auto",
      user_email: user.email ?? null,
      user_name: null,
    });
    return NextResponse.json(resp);
  } catch (e) {
    if (e instanceof BridgeError) {
      return NextResponse.json(
        {
          error: e.message,
          code: e.code ?? "BRIDGE_ERROR",
          details: e.details,
        },
        { status: e.status }
      );
    }
    return NextResponse.json(
      { error: "Falha ao chamar o bridge.", code: "BRIDGE_UNAVAILABLE" },
      { status: 503 }
    );
  }
}
