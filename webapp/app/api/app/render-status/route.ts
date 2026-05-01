import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getReelStatus, BridgeError } from "@/lib/bridgeClient";

export const runtime = "nodejs";

/**
 * Sprint 27 — render-status proxy.
 *
 *   browser → GET /api/app/render-status?job_id=...
 *     → Supabase auth
 *     → bridgeClient.getReelStatus → GET /api/reel/{job_id}/status
 *     → returns { status, scenes:[{ public_url, gcs_uri, ... }], ... }
 *
 * Browser polls this every ~3s until status is "completed" or "failed".
 */
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get("job_id");
  if (!jobId) {
    return NextResponse.json(
      { error: "job_id query param obrigatório" },
      { status: 400 }
    );
  }

  try {
    const status = await getReelStatus(jobId);
    return NextResponse.json(status);
  } catch (e) {
    if (e instanceof BridgeError) {
      return NextResponse.json(
        {
          error: e.message,
          code: e.code ?? "BRIDGE_ERROR",
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
