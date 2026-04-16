import { NextRequest, NextResponse } from "next/server";
import { generatePackage, ProviderChainError } from "@/lib/generator";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS, type PlanType } from "@/lib/supabase/types";
import { checkIpRateLimit } from "@/lib/ip-rate-limit";
import { normalizeTone } from "@/lib/viral-objects/normalize-tone";
import { JobService } from "@/lib/jobs/job.service";
import { JobOrchestrator } from "@/lib/jobs/orchestrator";

export const runtime = "nodejs";
export const maxDuration = 90;

/**
 * Protected generate endpoint.
 * - Requires auth (via session cookie)
 * - Enforces per-plan monthly rate limit
 * - Persists generation to viralobj.generations
 * - Increments usage counter atomically
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

    // Trial expiry check
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

    // ─── 4. Atomic quota reservation (prevents race condition) ──────────────
    const svc = createServiceClient();
    const limit = PLAN_LIMITS[tenant.plan].packages;

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

    const reservation = Array.isArray(reserveData) ? reserveData[0] : reserveData;
    if (!reservation?.reserved) {
      return NextResponse.json(
        {
          error: `Limite mensal atingido (${limit}/${limit}). Faça upgrade para continuar.`,
          code: "LIMIT_REACHED",
        },
        { status: 402 }
      );
    }

    const used = (reservation.used_after as number) - 1;

    // ─── 5. Generate (reservation rolls back on failure) ────────────────────
    const normalizedTone = normalizeTone(body.tone as string | undefined);
    let pkg;
    try {
      pkg = await generatePackage({
        niche: body.niche as string,
        objects: Array.isArray(body.objects) ? (body.objects as string[]) : [],
        topic: body.topic as string,
        tone: normalizedTone,
        duration: body.duration as number | undefined,
        lang: (body.lang as "pt" | "en" | "both") ?? "both",
        provider: (body.provider as "auto" | "anthropic" | "openai" | "gemini") ?? "auto",
      });
    } catch (genErr) {
      await svc.rpc("release_quota", { p_tenant_id: tenant.id, p_counter: "packages" });
      console.error(`[generate-package ${reqId}] generation failed:`, genErr);
      if (genErr instanceof ProviderChainError) {
        return NextResponse.json(
          { error: "Todos os provedores de IA falharam. Tente novamente em instantes.", reqId, code: "ALL_PROVIDERS_FAILED" },
          { status: 503 }
        );
      }
      throw genErr;
    }

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
        provider_used: (pkg as { provider_used?: string }).provider_used ?? null,
        package: pkg,
        object_bibles: (pkg as { object_bibles?: unknown }).object_bibles ?? null,
        scene_blueprints: (pkg as { scene_blueprints?: unknown }).scene_blueprints ?? null,
        scene_image_prompts: (pkg as { scene_image_prompts?: unknown }).scene_image_prompts ?? null,
        scene_images: (pkg as { scene_images?: unknown }).scene_images ?? null,
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

    // ─── 6. Dispatch async image generation job (fire-and-forget) ──────────
    let jobId: string | null = null;
    try {
      const jobService = new JobService();
      const job = await jobService.createJob({
        tenant_id: tenant.id,
        user_id: user.id,
        status: "queued",
        progress: 0,
        input: {
          generation_id: saved.id,
          scene_image_prompts:
            (pkg as { scene_image_prompts?: unknown }).scene_image_prompts ?? [],
          scene_blueprints:
            (pkg as { scene_blueprints?: unknown }).scene_blueprints ?? [],
          scene_texts:
            (pkg as { scene_texts?: Record<string, string> }).scene_texts ?? null,
        },
      });
      jobId = job?.id ?? null;
      if (jobId) {
        new JobOrchestrator()
          .run(jobId)
          .catch((err) =>
            console.error(`[generate-package ${reqId}] orchestrator:`, err)
          );
      }
    } catch (jobErr) {
      console.error(`[generate-package ${reqId}] job dispatch failed:`, jobErr);
    }

    return NextResponse.json({
      package: pkg,
      generation_id: saved.id,
      job_id: jobId,
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
