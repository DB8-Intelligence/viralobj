import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Sprint 17 — gated.
 *
 * TTS now runs through the bridge (Vertex AI / Cloud Text-to-Speech) inside
 * the full-render flow of POST /api/generate-reel on the bridge service.
 * Until ENABLE_VEO_GENERATION=true on the bridge, the wizard's audio step is
 * intentionally blocked here so no third-party TTS provider (ElevenLabs,
 * MiniMax, FAL audio) gets called from this process.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Audio generation moved to the bridge. Trigger a full reel render once VEO is enabled.",
      code: "AUDIO_VIA_BRIDGE",
    },
    { status: 501 }
  );
}
