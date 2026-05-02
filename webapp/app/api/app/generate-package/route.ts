import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, type PlanType } from "@/lib/supabase/types";
import { checkIpRateLimit } from "@/lib/ip-rate-limit";
import { normalizeTone } from "@/lib/viral-objects/normalize-tone";
import {
  generateReelDryRun,
  generateReelFull,
  BridgeError,
  type ReelPayload,
} from "@/lib/bridgeClient";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Protected generate endpoint.
 *
 * Sprint 17: AI now runs through the ViralObj Bridge on Cloud Run.
 *   webapp → POST https://api.viralobj.app/api/generate-reel
 *
 * Auth + tenant/quota stays here (Supabase). The bridge owns Gemini, Veo,
 * Cloud Storage and Firestore — no Anthropic / FAL / ElevenLabs from this
 * process anymore.
 *
 * Body forwards `dry_run` to the bridge:
 *   - dry_run=true (default for the wizard step 1) → text-only package
 *   - dry_run=false → full render; bridge replies 403 VEO_DISABLED until
 *     ENABLE_VEO_GENERATION=true is set on the bridge service.
 */
export async function POST(req: NextRequest) {
  const reqId = crypto.randomUUID().slice(0, 8);
  try {
    // ─── 0. IP rate limit (burst protection) ─────────────────────────────────
    const { allowed } = await checkIpRateLimit("generate_package", 20, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Aguarde um momento.", code: "IP_RATE_LIMIT" },
        { status: 429 }
      );
    }

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

    if (tenant.plan === "trial" && tenant.trial_ends_at) {
      if (new Date(tenant.trial_ends_at).getTime() < Date.now()) {
        return NextResponse.json(
          { error: "Seu período trial expirou. Faça upgrade para continuar." },
          { status: 402 }
        );
      }
    }

    // ─── 3. Parse body ───────────────────────────────────────────────────────
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Body JSON inválido", reqId },
        { status: 400 }
      );
    }

    if (!body.niche || !body.objects || !body.topic) {
      return NextResponse.json(
        { error: "Campos obrigatórios: niche, objects, topic", reqId },
        { status: 400 }
      );
    }

    const dryRun = body.dry_run !== false; // default to dry_run for safety
    const isWizardMode = body.wizardMode === true;

    // ─── 4. Atomic quota reservation (prevents race condition) ──────────────
    const svc = createServiceClient();
    const limit = PLAN_LIMITS[tenant.plan].packages;
    const isAdmin = profile.role === "owner" && tenant.plan === "enterprise";

    let used = 0;
    if (!isAdmin) {
      const { data: reserveData, error: reserveErr } = await svc.rpc("reserve_quota", {
        p_tenant_id: tenant.id,
        p_counter: "packages",
        p_limit: limit,
      });

      if (reserveErr) {
        return NextResponse.json(
          { error: `Erro ao reservar quota: ${reserveErr.message}` },
          { status: 500 }
        );
      }

      const reserved = Array.isArray(reserveData) ? reserveData[0] : reserveData;
      if (reserved !== true) {
        return NextResponse.json(
          {
            error: `Limite mensal atingido (${limit}/${limit}). Faça upgrade para continuar.`,
            code: "LIMIT_REACHED",
          },
          { status: 402 }
        );
      }

      const { data: usageRow } = await svc
        .from("usage_monthly")
        .select("packages_count")
        .eq("tenant_id", tenant.id)
        .single();
      used = ((usageRow?.packages_count as number) ?? 1) - 1;
    }

    // ─── 5. Call the bridge (Vertex AI Gemini) ───────────────────────────────
    const normalizedTone = normalizeTone(body.tone as string | undefined);
    const payload: ReelPayload = {
      niche: body.niche as string,
      objects: Array.isArray(body.objects) ? (body.objects as string[]) : [],
      topic: body.topic as string,
      tone: normalizedTone,
      duration: body.duration as number | undefined,
      lang: ((body.lang as "pt" | "en" | "both") ?? "both"),
      provider: "auto",
      user_email: user.email ?? null,
      user_name:
        (profile as { full_name?: string | null }).full_name ?? null,
    };

    let bridgeResp;
    try {
      bridgeResp = dryRun
        ? await generateReelDryRun(payload)
        : await generateReelFull(payload);
    } catch (e) {
      await svc.rpc("release_quota", { p_tenant_id: tenant.id, p_counter: "packages" });
      if (e instanceof BridgeError) {
        // Forward VEO_DISABLED / PAYMENT_REQUIRED / etc. with the bridge's status.
        return NextResponse.json(
          {
            error: e.message,
            code: e.code ?? "BRIDGE_ERROR",
            reqId,
            details: e.details,
          },
          { status: e.status }
        );
      }
      console.error(`[generate-package ${reqId}] bridge call failed:`, e);
      return NextResponse.json(
        { error: "Falha ao chamar o bridge.", reqId, code: "BRIDGE_UNAVAILABLE" },
        { status: 503 }
      );
    }

    const pkg = (bridgeResp as { package?: unknown }).package ?? bridgeResp;
    const providerUsed = (bridgeResp as { provider_used?: string }).provider_used ?? null;

    // ─── 6. Persist (Supabase still owns generations until Sprint 18) ────────
    const { data: saved, error: insertErr } = await svc
      .from("generations")
      .insert({
        tenant_id: tenant.id,
        profile_id: user.id,
        niche: body.niche,
        objects: body.objects,
        topic: body.topic,
        tone: normalizedTone,
        duration: body.duration ?? 30,
        lang: body.lang ?? "both",
        provider_used: providerUsed,
        package: pkg,
        object_bibles: (pkg as { object_bibles?: unknown }).object_bibles ?? null,
        scene_blueprints: (pkg as { scene_blueprints?: unknown }).scene_blueprints ?? null,
        scene_image_prompts: (pkg as { scene_image_prompts?: unknown }).scene_image_prompts ?? null,
        scene_images: null, // images come from full render only
      })
      .select("id")
      .single();

    if (insertErr) {
      await svc.rpc("release_quota", { p_tenant_id: tenant.id, p_counter: "packages" });
      console.error(`[generate-package ${reqId}] insert failed:`, insertErr.message);
      return NextResponse.json(
        { error: "Erro ao salvar geração. Tente novamente.", reqId },
        { status: 500 }
      );
    }

    // ─── 7. Response ─────────────────────────────────────────────────────────
    return NextResponse.json({
      package: pkg,
      generation_id: saved.id,
      provider_used: providerUsed,
      mode: dryRun ? "dry_run" : "full",
      bridge_summary: (bridgeResp as { summary?: string }).summary ?? null,
      cost_guard: (bridgeResp as { cost_guard?: unknown }).cost_guard ?? null,
      job_id: (bridgeResp as { job_id?: string }).job_id ?? null,
      status_url: (bridgeResp as { status_url?: string }).status_url ?? null,
      scene_images: [],
      wizard_step: isWizardMode ? "script_review" : null,
      usage: {
        used: used + 1,
        max: limit,
        remaining: Math.max(0, limit - (used + 1)),
      },
    });
  } catch (e) {
    console.error(`[generate-package ${reqId}] unhandled:`, e);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente.", reqId },
      { status: 500 }
    );
  }
}
