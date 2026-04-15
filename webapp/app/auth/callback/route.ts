import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * OAuth callback: exchanges code for session, bootstraps tenant if needed.
 * The auth.users trigger (on_auth_user_confirmed_viralobj) usually handles
 * this, but we also call the RPC here as a safety net for race conditions.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[auth/callback] exchange failed:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  // Safety-net bootstrap (trigger should have handled this already)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    const fullName =
      (data.user.user_metadata as { full_name?: string; name?: string } | undefined)
        ?.full_name ??
      (data.user.user_metadata as { name?: string } | undefined)?.name ??
      data.user.email ??
      "";
    const { error: rpcErr } = await supabase.rpc("bootstrap_tenant_viralobj", {
      p_user_id: data.user.id,
      p_email: data.user.email ?? "",
      p_full_name: fullName,
    });
    if (rpcErr) {
      console.error("[auth/callback] bootstrap failed:", rpcErr.message);
      return NextResponse.redirect(`${origin}/login?error=bootstrap_failed`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
