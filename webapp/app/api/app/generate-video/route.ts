import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Sprint 17 — gated.
 *
 * Video generation moved to the bridge (Vertex AI Veo) inside the full-render
 * flow of POST /api/generate-reel on the bridge service. Until
 * ENABLE_VEO_GENERATION=true on the bridge, the wizard's video step is
 * intentionally blocked here so no FAL/Veo3-via-FAL call goes out.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Video generation moved to the bridge (Vertex AI Veo). Trigger a full reel render once VEO is enabled.",
      code: "VIDEO_VIA_BRIDGE",
    },
    { status: 501 }
  );
}
