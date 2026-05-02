import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Sprint 18 — gated.
 *
 * Veo 3 ran via FAL during the multi-provider era. The bridge owns Vertex
 * AI Veo now, so the legacy debug helper that talked to fal-ai/veo3 was
 * removed with the @fal-ai/client SDK.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Debug Veo route retired. Use the bridge's POST /api/reel/veo-payload-preview on api.viralobj.app instead.",
      code: "DEBUG_VIA_BRIDGE",
    },
    { status: 501 }
  );
}
