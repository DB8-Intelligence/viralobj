import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Sprint 32 — credits balance proxy.
 *
 *   browser → GET /api/app/billing/credits
 *     → Supabase auth check
 *     → bridge GET /api/billing/credits with X-Gemini-Key
 *     → returns { credits, price_per_scene, ... }
 *
 * NOTE on user identity (Sprint 32 known issue):
 * Today the bridge sees this caller as `system:gemini-agent` (X-Gemini-Key
 * path) and returns the agent's wallet, not the Supabase user's. Until the
 * bridge accepts a Supabase-uid header (or Firebase Bearer), the same
 * balance is shared across all logged-in users in this account. That's
 * fine for early monetization with one operator; for multi-tenant SaaS
 * the bridge needs an Authorization: Bearer or X-Forwarded-User-Id mapping.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const bridgeUrl = process.env.NEXT_PUBLIC_BRIDGE_API_URL;
  const geminiKey = process.env.GEMINI_AGENT_TOKEN;
  if (!bridgeUrl || !geminiKey) {
    return NextResponse.json(
      { error: "Bridge não configurado", code: "BRIDGE_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${bridgeUrl}/api/billing/credits`, {
      method: "GET",
      headers: {
        "X-Gemini-Key": geminiKey,
        "X-Forwarded-User-Id": user.id,
        "X-Forwarded-User-Email": user.email ?? "",
      },
      // Don't cache — credits change after webhooks fire.
      cache: "no-store",
    });
    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }
    if (!res.ok) {
      return NextResponse.json(
        {
          error: (data as { message?: string })?.message ?? "Bridge error",
          code: (data as { error?: string })?.error ?? "BRIDGE_ERROR",
          credits: 0,
        },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      {
        error: String(e),
        code: "BRIDGE_UNAVAILABLE",
        credits: 0,
      },
      { status: 503 },
    );
  }
}
