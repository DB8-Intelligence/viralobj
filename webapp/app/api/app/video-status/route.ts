import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Sprint 17 — gated.
 *
 * The bridge owns reel job status now: GET /api/reel/{jobId}/status on
 * api.viralobj.app, polled via lib/bridgeClient.getReelStatus(). The legacy
 * FAL queue probe used here is no longer reachable.
 */
export async function GET(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Video status moved to the bridge. Use the job_id returned by /api/app/generate-package and poll the bridge directly.",
      code: "STATUS_VIA_BRIDGE",
    },
    { status: 501 }
  );
}
