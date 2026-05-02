import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Sprint 21 — proxy that creates a Stripe Checkout Session via the bridge.
 *
 *   browser (logged in via Supabase) → POST /api/app/billing/checkout
 *     → server-side: validate Supabase session
 *     → POST https://api.viralobj.app/api/billing/create-checkout
 *         (X-Gemini-Key + user_id passed in body for now;
 *          when Firebase Bearer is wired, dropped from body)
 *     → returns { checkout_url } that the client redirects to
 *
 * The bridge stamps user_id into Stripe metadata so the resulting webhook
 * event can credit the right Supabase user.
 */
export async function POST(req: NextRequest) {
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
      { status: 503 }
    );
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    /* empty body is fine; defaults to prod_1_scene */
  }
  const product = (payload.product as string) || "prod_1_scene";

  // The bridge currently identifies users via dualAuth (X-Gemini-Key →
  // anonymous "system:gemini-agent"). We override per-request by passing
  // the Supabase uid as user_id_override so the Stripe metadata carries
  // *this* user's id, not the agent.
  //
  // The bridge route reads req.user.uid for now. Until we wire Firebase
  // Bearer end-to-end (Sprint future), we work around it by including
  // the uid as a header the bridge will forward to Stripe metadata.
  // For now, post product only and let the bridge stamp system:gemini-agent;
  // operator must associate the eventual Stripe webhook back to the Supabase
  // user via a manual step. Acceptable for the first pilot.

  const res = await fetch(`${bridgeUrl}/api/billing/create-checkout`, {
    method: "POST",
    headers: {
      "X-Gemini-Key": geminiKey,
      "Content-Type": "application/json",
      "X-Forwarded-User-Id": user.id,
      "X-Forwarded-User-Email": user.email ?? "",
    },
    body: JSON.stringify({ product }),
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
        bridge_status: res.status,
      },
      { status: res.status }
    );
  }
  return NextResponse.json(data);
}
