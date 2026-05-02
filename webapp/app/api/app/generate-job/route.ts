import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Sprint 17/18 — gated.
 *
 * Reel render jobs are tracked in Firestore by the bridge now. The legacy
 * Supabase JobService + JobOrchestrator pipeline (FAL / ElevenLabs) was
 * removed in Sprint 18.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Job creation moved to the bridge. Trigger renders via /api/app/generate-package which calls api.viralobj.app under the hood.",
      code: "JOB_VIA_BRIDGE",
    },
    { status: 501 }
  );
}
