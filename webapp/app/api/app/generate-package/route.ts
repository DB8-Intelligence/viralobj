import { NextRequest, NextResponse } from "next/server";
import { generatePackage } from "@/lib/generator";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, type PlanType } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Protected generate endpoint.
 * - Requires auth (via session cookie)
 * - Enforces per-plan monthly rate limit
 * - Persists generation to viralobj.generations
 * - Increments usage counter atomically
 */
export async function POST(req: NextRequest) {
  try {
    // ─── 1. Auth check ───────────────────────────────────────────────────────
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // ─── 2. Load profile + tenant + plan ─────────────────────────────────────
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("*, tenant:tenants(id, plan, addon_talking_objects, is_active, trial_ends_at)")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 403 });
    }

    const tenant = (profile as unknown as {
      tenant: { id: string; plan: PlanType; addon_talking_objects: boolean; is_active: boolean; trial_ends_at: string | null };
    }).tenant;

    if (!tenant.is_active) {
      return NextResponse.json({ error: "Workspace desativado" }, { status: 403 });
    }

    if (!tenant.addon_talking_objects) {
      return NextResponse.json(
        { error: "Addon Talking Objects não está ativo neste workspace" },
        { status: 403 }
      );
    }

    // Trial expiry check
    if (tenant.plan === "trial" && tenant.trial_ends_at) {
      if (new Date(tenant.trial_ends_at).getTime() < Date.now()) {
        return NextResponse.json(
          { error: "Seu período trial expirou. Faça upgrade para continuar." },
          { status: 402 }
        );
      }
    }

    // ─── 3. Rate limit check (current month) ─────────────────────────────────
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStr = monthStart.toISOString().slice(0, 10);

    const { data: usage } = await supabase
      .from("usage_monthly")
      .select("packages_count")
      .eq("tenant_id", tenant.id)
      .eq("month", monthStr)
      .maybeSingle();

    const used = usage?.packages_count ?? 0;
    const limit = PLAN_LIMITS[tenant.plan].packages;

    if (used >= limit) {
      return NextResponse.json(
        {
          error: `Limite mensal atingido (${used}/${limit}). Faça upgrade para continuar.`,
          code: "LIMIT_REACHED",
        },
        { status: 402 }
      );
    }

    // ─── 4. Parse body + generate ────────────────────────────────────────────
    const body = await req.json();

    if (!body.niche || !body.objects || !body.topic) {
      return NextResponse.json(
        { error: "Campos obrigatórios: niche, objects, topic" },
        { status: 400 }
      );
    }

    const pkg = await generatePackage({
      niche: body.niche,
      objects: Array.isArray(body.objects) ? body.objects : [],
      topic: body.topic,
      tone: body.tone,
      duration: body.duration,
      lang: body.lang ?? "both",
      provider: body.provider ?? "auto",
    });

    // ─── 5. Persist + increment usage (via service role to bypass RLS quirks) ─
    const svc = createServiceClient();

    const { data: saved, error: insertErr } = await svc
      .from("generations")
      .insert({
        tenant_id: tenant.id,
        profile_id: user.id,
        niche: body.niche,
        objects: body.objects,
        topic: body.topic,
        tone: body.tone ?? "angry",
        duration: body.duration ?? 30,
        lang: body.lang ?? "both",
        provider_used: (pkg as { provider_used?: string }).provider_used ?? null,
        package: pkg,
      })
      .select("id")
      .single();

    if (insertErr) {
      return NextResponse.json(
        { error: `Erro ao salvar geração: ${insertErr.message}` },
        { status: 500 }
      );
    }

    // Increment counter via RPC (atomic)
    await svc.rpc("increment_usage", {
      p_tenant_id: tenant.id,
      p_counter: "packages",
    });

    return NextResponse.json({
      package: pkg,
      generation_id: saved.id,
      usage: {
        used: used + 1,
        max: limit,
        remaining: Math.max(0, limit - (used + 1)),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
