/**
 * ViralObj — Server Bridge (Express REST API)
 *
 * Exposes MCP tools (generatePackage, listNiches) as HTTP endpoints for
 * Gemini Enterprise (or any external orchestrator) to consume.
 *
 * Deploy target: Railway (Node.js service).
 * Auth: X-Gemini-Key header validated against GEMINI_AGENT_TOKEN env.
 *
 * Routes:
 *   GET  /health                — unauthenticated health check
 *   GET  /openapi.json          — OpenAPI 3.0 spec (for Gemini grounding)
 *   GET  /api/niches            — list all 18 niches with samples (auth)
 *   POST /api/generate-reel     — generate full Talking Object package (auth)
 */

import "dotenv/config";
import express from "express";
import { pathToFileURL } from "url";
import { generatePackage } from "./mcp/tools/generate.js";
import { listNiches } from "./mcp/tools/niches.js";
import { firestore, FieldValue } from "./src/infrastructure/firebase.js";
import {
  getNichesFromFirestore,
  getNicheBySlugFromFirestore,
  saveGenerationHistoryToFirestore,
} from "./src/infrastructure/firestoreRepository.js";
import { dualAuth } from "./src/middleware/firebaseAuth.js";
import {
  createJobAndSubmitScenes,
  getJobStatus,
} from "./src/services/reelJobs.js";

// Cost-guard config used by dry_run to compute what a live Veo render
// *would* have charged. Live render itself is no longer wired into this
// service — see the 501 branch in /api/generate-reel and the migration
// note at the top of this file.
const VEO_DURATION_SEC = parseInt(process.env.VEO_DURATION_SECONDS || "8", 10);
const MAX_RENDER_SCENES = parseInt(process.env.VEO_MAX_SCENES || "4", 10);

// Backward-compat mirror into the legacy "generations" collection
// (introduced in Sprint 4). Sprint 5 added "generation_history" as the
// canonical destination; this helper keeps both populated until any
// downstream consumer migrates. Fire-and-forget — failures never block.
function recordGeneration({ user, niche, mode, status, providerUsed, topic = null, tone = null, duration = null }) {
  return firestore()
    .collection("generations")
    .add({
      user_id: user?.uid || "anonymous",
      user_email: user?.email || null,
      auth_provider: user?.provider || "anonymous",
      niche,
      mode,
      status,
      provider: "vertex",
      provider_used: providerUsed || null,
      topic,
      tone,
      duration,
      created_at: FieldValue.serverTimestamp(),
    })
    .then((ref) => ref.id)
    .catch((err) => {
      console.warn(
        "[firestore] generations.add failed:",
        err?.message ?? err,
      );
      return null;
    });
}

const app = express();
app.disable("x-powered-by");
// Cloud Run terminates TLS at the proxy and forwards via X-Forwarded-Proto.
// Without trust proxy, req.protocol always reports "http" — which then
// shows up as broken http:// links inside /agent-manifest.json and
// /openapi.json's servers[].url. Trust the front-end to tell us the truth.
app.set("trust proxy", true);
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;

// ─── Middleware: auth via X-Gemini-Key ────────────────────────────────────

// requireGeminiKey was retired in Sprint 6 — its only callers (the
// admin migration endpoint and /api/reel/{id}/status) were both deleted
// when Cloud SQL came out. dualAuth (Bearer | X-Gemini-Key) now guards
// every authed route; legacy callers keep working unchanged.

// ─── Public routes ────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "viralobj-bridge",
    version: "1.0.0",
    uptime_seconds: Math.floor(process.uptime()),
    node: process.version,
  });
});

// Readiness probe with real liveness checks for the Cloud Run revision.
// Routed at /readyz (and aliased /healthz) — Google's frontend intercepts
// the bare /healthz path on Cloud Run and answers 404 before our handler
// ever runs, so /readyz is what callers should actually hit. Both paths
// share the handler so the OpenAPI alias stays honest. Never calls Gemini
// or Veo (those are paid). DB check is a sub-millisecond SELECT 1.
app.get(["/readyz", "/healthz"], async (_req, res) => {
  // Cloud SQL was decommissioned in Sprint 6; the database check is now
  // a constant "deprecated" placeholder so consumers parsing the field
  // don't crash. Firestore is the live primary and is reachable through
  // the same ADC the rest of the bridge uses; we sidestep a per-probe
  // Firestore read because every /api/niches request is itself a probe.
  const checks = {
    server: "ok",
    database: "deprecated (Cloud SQL retired Sprint 6)",
    firestore: "via-ADC",
    storage: "unknown",
    vertex: "unknown",
  };
  const failures = [];

  // Storage: env presence — we don't HEAD the bucket here to avoid a
  // round-trip on every probe.
  if (process.env.GCS_BUCKET_NAME) {
    checks.storage = `configured (${process.env.GCS_BUCKET_NAME})`;
  } else {
    checks.storage = "fail: GCS_BUCKET_NAME not set";
    failures.push("storage");
  }

  // Vertex: env presence only. Listing models would be a paid API call.
  const project = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const model = process.env.VERTEX_MODEL || "gemini-1.5-pro";
  if (project) {
    checks.vertex = `configured (project=${project}, model=${model})`;
  } else {
    checks.vertex = "fail: GCP_PROJECT_ID not set";
    failures.push("vertex");
  }

  const ok = failures.length === 0;
  res.status(ok ? 200 : 503).json({
    ok,
    service: "viralobj-bridge",
    version: "cloud-run",
    checks,
    failed: failures,
  });
});

// /api/admin/migrate-niches-to-firestore was retired in Sprint 6 — its
// only purpose was the one-shot Postgres → Firestore migration, which
// completed successfully with 36 niches + 18 professionals before
// Cloud SQL was stopped. The endpoint depended on the now-removed
// scripts/migrate-postgres-to-firestore.mjs and on database.js.

app.get("/openapi.json", (req, res) => {
  const baseUrl = process.env.PUBLIC_URL
    || `${req.protocol}://${req.get("host")}`;
  res.json(buildOpenApiSpec(baseUrl));
});

// Compact JSON manifest for Gemini Agent Builder. Mirrors the full
// gcp-agent-manifest.json (which is a richer OpenAPI extension) but with
// just the fields a connector needs to bootstrap. URLs are resolved at
// request time so the manifest always reports the live Cloud Run host.
app.get("/agent-manifest.json", (req, res) => {
  const baseUrl =
    process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
  const veoEnabled = process.env.ENABLE_VEO_GENERATION === "true";
  res.json({
    name: "ViralObj Bridge",
    description:
      "Google Cloud native API for generating viral talking object reel packages.",
    base_url: baseUrl,
    openapi_url: `${baseUrl}/openapi.json`,
    health_url: `${baseUrl}/readyz`,
    auth: {
      type: "apiKey",
      header: "X-Gemini-Key",
    },
    capabilities: [
      "list_niches",
      "generate_reel_package_dry_run",
      "generate_reel_package_with_veo_when_enabled",
    ],
    safety: {
      veo_default_enabled: veoEnabled,
      dry_run_supported: true,
    },
  });
});

// ─── Protected routes (require X-Gemini-Key) ──────────────────────────────

app.get("/api/niches", dualAuth, async (req, res) => {
  try {
    const lang = req.query.lang === "en" ? "en" : "pt";
    const rawCategory =
      typeof req.query.category === "string" ? req.query.category : null;
    const category =
      rawCategory && ["profissoes", "lifestyle"].includes(rawCategory)
        ? rawCategory
        : null;

    // Firestore is the only datastore now. No fallback. If the read
    // fails or returns zero docs, surface 500 — silent degradation
    // hid stale data during the dual-write phase and we are past that.
    const fs = await getNichesFromFirestore({ category, lang });
    if (!fs || fs.count === 0) {
      console.error(
        "[/api/niches] Firestore returned 0 docs — refusing to serve",
        "an empty catalog (this used to fall back to Cloud SQL but Cloud",
        "SQL was retired in Sprint 6).",
      );
      return res.status(500).json({
        ok: false,
        success: false,
        error: "EMPTY_NICHES_CATALOG",
        message:
          "Firestore niches collection returned 0 documents. Re-run the migration or seed the collection.",
      });
    }
    return res.json({
      ok: true,
      success: true,
      source: "firestore",
      count: fs.count,
      category: category ?? "all",
      categories: fs.categories,
      niches: fs.niches,
    });
  } catch (err) {
    console.error("[/api/niches] Firestore read failed:", err);
    res.status(500).json({
      ok: false,
      success: false,
      error: err?.message || String(err),
    });
  }
});

app.post("/api/generate-reel", dualAuth, async (req, res) => {
  const startedAt = Date.now();
  try {
    const {
      niche,
      objects,
      topic,
      tone = "angry",
      duration = 30,
      lang = "both",
      provider = "auto",
      analysis = null,
      user_email = null,
      user_name = null,
    } = req.body || {};

    // Twin entry points for dry_run: query string for cURL/agent ergonomics,
    // body for SDK-style callers. Either turns the call into a Gemini-only
    // text validation that never touches Veo.
    const dryRun =
      req.query?.dry_run === "true" || req.body?.dry_run === true;
    // Cost guard: hard kill switch for Veo. When this env is anything other
    // than the literal string "true", paid video generation is blocked even
    // if dry_run is omitted. Toggle on Cloud Run with
    // `gcloud run services update ... --update-env-vars=ENABLE_VEO_GENERATION=true`.
    const veoEnabled = process.env.ENABLE_VEO_GENERATION === "true";

    // Validation
    if (!niche || typeof niche !== "string") {
      return res.status(400).json({ success: false, error: "Field 'niche' (string) is required." });
    }
    if (!Array.isArray(objects) || objects.length === 0) {
      return res.status(400).json({ success: false, error: "Field 'objects' (non-empty array of strings) is required." });
    }
    if (!topic || typeof topic !== "string") {
      return res.status(400).json({ success: false, error: "Field 'topic' (string) is required." });
    }
    if (duration && (duration < 10 || duration > 90)) {
      return res.status(400).json({ success: false, error: "'duration' must be between 10 and 90 seconds." });
    }

    // Lookup the niche to tag the response with its source. Informational
    // — generatePackage uses its own in-memory niche reference data, so an
    // unknown slug here does not block generation. Firestore is the only
    // catalog left after Sprint 6; "memory" means the slug isn't even in
    // Firestore but we'll still try to generate it from mcp/tools/niches.js.
    let dataSource = "memory";
    try {
      const fsNiche = await getNicheBySlugFromFirestore(niche);
      if (fsNiche) dataSource = "firestore";
    } catch (err) {
      console.warn(
        "[/api/generate-reel] Firestore niche lookup failed:",
        err?.message ?? err,
      );
    }

    // Reject before paying the Gemini call when Veo is disabled and the
    // caller did not opt into dry_run. Saves both the LLM cost and the
    // operator's confusion when expecting video output.
    if (!veoEnabled && !dryRun) {
      console.log(
        "[VEO_DISABLED] generation blocked by ENABLE_VEO_GENERATION=false (use dry_run=true for text-only)",
      );
      return res.status(403).json({
        ok: false,
        success: false,
        error: "VEO_DISABLED",
        message:
          "Veo generation is disabled by ENABLE_VEO_GENERATION=false. Use dry_run=true for text-only validation.",
      });
    }

    const result = await generatePackage({
      niche,
      objects,
      topic,
      tone,
      duration,
      lang,
      provider,
      analysis,
    });

    // dry_run short-circuit: Gemini ran, package is in memory, Veo never
    // gets called and no DB rows are created. cost_guard advertises what
    // a real run *would* have cost so callers can budget before flipping
    // ENABLE_VEO_GENERATION=true.
    if (dryRun) {
      console.log("[DRY_RUN] Skipping Veo video generation");
      const charCount = Array.isArray(result.package?.characters)
        ? result.package.characters.length
        : 0;
      const sceneCount = Math.min(charCount, MAX_RENDER_SCENES);
      // Mirrors the cost line in /api/reel/.../status (Veo 2 base pricing).
      const estimatedCost =
        Math.round(sceneCount * VEO_DURATION_SEC * 0.50 * 100) / 100;

      // Fire-and-forget Firestore mirror — never block the dry_run path
      // on the write. errors are logged inside recordGeneration().
      recordGeneration({
        user: req.user,
        niche,
        mode: "dry_run",
        status: "completed",
        providerUsed: result.result?.provider_used,
        topic,
        tone,
        duration,
      });
      saveGenerationHistoryToFirestore({
        user_id: req.user?.uid || "anonymous",
        user_email: req.user?.email || null,
        auth_provider: req.user?.provider || "anonymous",
        niche,
        topic,
        mode: "dry_run",
        status: "completed",
        provider: "vertex",
        provider_used: result.result?.provider_used ?? null,
        data_source: dataSource,
        tone,
        duration,
      });

      return res.status(200).json({
        ok: true,
        success: true,
        mode: "dry_run",
        elapsed_ms: Date.now() - startedAt,
        provider_used: result.result?.provider_used,
        niche,
        data_source: dataSource,
        package: result.package,
        summary: result.content?.[0]?.text,
        videos: [],
        cost_guard: {
          veo_called: false,
          veo_enabled: veoEnabled,
          estimated_veo_cost: estimatedCost,
          scenes_skipped: sceneCount,
        },
      });
    }

    // ── Live render path (Sprint 7, Firestore-native) ────────────────────
    // We only get here when ENABLE_VEO_GENERATION=='true' AND the caller
    // did not pass dry_run. Each of the next steps is bounded so a slow
    // Veo region or a flaky scene cannot hang Cloud Run past its timeout.
    let job;
    try {
      job = await createJobAndSubmitScenes({
        user: req.user,
        package: result.package,
        niche,
        topic,
        tone,
        duration,
        providerUsed: result.result?.provider_used,
      });
    } catch (err) {
      console.error("[/api/generate-reel] reelJobs.createJobAndSubmitScenes:", err);
      return res.status(500).json({
        ok: false,
        success: false,
        error: "VEO_SUBMIT_FAILED",
        message: err?.message ?? String(err),
        elapsed_ms: Date.now() - startedAt,
      });
    }

    const allFailed = job.scenes.every((s) => s.status === "failed");
    saveGenerationHistoryToFirestore({
      user_id: req.user?.uid || "anonymous",
      user_email: req.user?.email || null,
      auth_provider: req.user?.provider || "anonymous",
      niche,
      topic,
      mode: "full",
      status: allFailed ? "failed" : "processing",
      provider: "vertex",
      provider_used: result.result?.provider_used ?? null,
      data_source: dataSource,
      job_id: job.jobId,
      tone,
      duration,
    });

    return res.status(allFailed ? 500 : 202).json({
      ok: !allFailed,
      success: !allFailed,
      mode: "full",
      job_id: job.jobId,
      status: allFailed ? "failed" : "processing",
      scene_count: job.sceneCount,
      requested_scenes: result.package?.characters?.length ?? job.sceneCount,
      limited_by_max_scenes: job.limitedByMaxScenes,
      estimated_veo_cost: job.estimatedVeoCost,
      status_url: `/api/reel/${job.jobId}/status`,
      data_source: dataSource,
      elapsed_ms: Date.now() - startedAt,
      provider_used: result.result?.provider_used,
      scenes: job.scenes.map((s) => ({
        index: s.index,
        status: s.status,
        veo_operation: s.veo_operation ?? null,
        error: s.error ?? null,
      })),
    });
  } catch (err) {
    console.error("[/api/generate-reel]", err);
    res.status(500).json({
      success: false,
      elapsed_ms: Date.now() - startedAt,
      error: err?.message || String(err),
    });
  }
});

// Cost preflight — pure arithmetic, no Gemini, no Veo, no Firestore
// writes. Lets a caller know what a full-mode render would cost before
// spending. The response mirrors the cap and feature-flag the live
// pipeline would apply at the same instant.
app.post("/api/reel/cost-preview", dualAuth, (req, res) => {
  const body = req.body || {};
  const requested =
    Number.isFinite(body.scene_count) && body.scene_count > 0
      ? Math.floor(body.scene_count)
      : Array.isArray(body.objects)
        ? body.objects.length
        : 0;
  const durationSeconds =
    Number.isFinite(body.duration) && body.duration > 0
      ? Math.floor(body.duration)
      : parseInt(process.env.VEO_DURATION_SECONDS || "8", 10);

  if (requested <= 0) {
    return res.status(400).json({
      ok: false,
      success: false,
      error: "INVALID_SCENE_COUNT",
      message:
        "Provide scene_count (integer > 0) or a non-empty objects[] array.",
    });
  }

  const cap = parseInt(process.env.MAX_SCENES_PER_REEL || "2", 10);
  const allowed = Math.max(1, Math.min(requested, cap));
  // Veo 2 base price; keep in sync with reelJobs.js's VEO_PRICE_PER_SEC.
  const estimated =
    Math.round(allowed * durationSeconds * 0.5 * 100) / 100;
  const veoEnabled = process.env.ENABLE_VEO_GENERATION === "true";

  res.json({
    ok: true,
    success: true,
    scene_count_requested: requested,
    scene_count_allowed: allowed,
    duration_seconds: durationSeconds,
    estimated_veo_cost: estimated,
    currency: "USD",
    veo_enabled: veoEnabled,
    would_run: veoEnabled,
    limited_by_max_scenes: requested > cap,
  });
});

// Polling endpoint for the Firestore-native render pipeline. Replaces
// the SQL-bound /api/reel/{history_id}/status retired in Sprint 6.
app.get("/api/reel/:jobId/status", dualAuth, async (req, res) => {
  const { jobId } = req.params;
  const startedAt = Date.now();
  try {
    const status = await getJobStatus(jobId);
    if (!status) {
      return res.status(404).json({
        ok: false,
        success: false,
        error: "JOB_NOT_FOUND",
        message: `No reel_jobs document for job_id=${jobId}`,
      });
    }
    return res.json({
      ok: true,
      success: true,
      elapsed_ms: Date.now() - startedAt,
      ...status,
    });
  } catch (err) {
    console.error(`[/api/reel/${jobId}/status]`, err);
    res.status(500).json({
      ok: false,
      success: false,
      error: err?.message || String(err),
    });
  }
});

// ─── OpenAPI 3.0 spec generator ───────────────────────────────────────────

function buildOpenApiSpec(baseUrl) {
  return {
    openapi: "3.0.3",
    info: {
      title: "ViralObj Bridge API",
      version: "1.0.0",
      description:
        "Bridge REST API exposing ViralObj's Talking Object generator to Gemini Enterprise agents. "
        + "Generates viral reel packages (scripts, prompts, captions, post copy) for 18 niches in PT/EN.",
      contact: { name: "ViralObj", url: "https://viralobj.com" },
    },
    servers: [{ url: baseUrl, description: "Current host" }],
    components: {
      securitySchemes: {
        GeminiKey: {
          type: "apiKey",
          in: "header",
          name: "X-Gemini-Key",
          description: "Agent token set via GEMINI_AGENT_TOKEN env var.",
        },
      },
      schemas: {
        NicheSummary: {
          type: "object",
          properties: {
            key: { type: "string", example: "advogado" },
            name: { type: "string", example: "Advocacia & Direito" },
            emoji: { type: "string", example: "⚖️" },
            category: {
              type: "string",
              enum: ["profissoes", "lifestyle"],
              description:
                "'profissoes' = professional services (advogado, contador, médico, …). "
                + "'lifestyle' = daily-life niches (casa, plantas, financeiro, …).",
              example: "profissoes",
            },
            objects_count: { type: "integer", example: 3 },
            tone_default: { type: "string", example: "dramatic" },
            sample_objects: { type: "array", items: { type: "string" } },
          },
        },
        GenerateReelRequest: {
          type: "object",
          required: ["niche", "objects", "topic"],
          properties: {
            niche: {
              type: "string",
              description: "Niche key from /api/niches (e.g. casa, plantas, saude).",
              example: "casa",
            },
            objects: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              description: "Object names to feature (2-5 recommended).",
              example: ["Detergente", "Esponja", "Pano"],
            },
            topic: {
              type: "string",
              description: "Core topic/message the reel should convey.",
              example: "Erros comuns ao lavar louça",
            },
            tone: {
              type: "string",
              description: "Emotional tone. Defaults to niche's tone_default.",
              enum: ["angry", "dramatic", "funny", "educational", "sarcastic", "motivational"],
              default: "angry",
            },
            duration: {
              type: "integer",
              minimum: 10,
              maximum: 90,
              default: 30,
              description: "Total reel duration in seconds.",
            },
            lang: {
              type: "string",
              enum: ["pt", "en", "both"],
              default: "both",
            },
            provider: {
              type: "string",
              enum: ["auto", "vertex"],
              default: "auto",
              description: "LLM provider. Only 'vertex' (Gemini 1.5 Pro on Vertex AI) is supported; other values are ignored for backward compatibility.",
            },
            user_email: {
              type: "string",
              format: "email",
              description:
                "Optional email of the professional making the request. Currently informational — Sprint 6 stopped writing it to a relational professionals table; the Firestore-native replacement will reintroduce upsert semantics.",
              example: "advogado@escritorio.com.br",
            },
            user_name: {
              type: "string",
              description: "Optional full name; informational (see user_email).",
              example: "Dra. Maria Silva",
            },
          },
        },
        // VideoJob and SceneVideo schemas were removed in Sprint 6 along
        // with the live render pipeline that produced them. They will
        // return when the Firestore-native render flow lands.
        GenerateReelResponse: {
          type: "object",
          description:
            "Two shapes, keyed off `mode`:\n"
            + "  • mode='dry_run' (HTTP 200): Gemini package returned, Veo skipped.\n"
            + "  • mode='full'    (HTTP 202): reel_jobs doc created, scenes submitted to Veo. "
            + "Poll status_url to watch each scene complete.",
          properties: {
            ok: { type: "boolean", example: true },
            success: { type: "boolean", example: true },
            mode: {
              type: "string",
              enum: ["dry_run", "full"],
            },
            elapsed_ms: { type: "integer", example: 8423 },
            provider_used: { type: "string", example: "vertex/gemini-2.5-flash" },
            niche: { type: "string" },
            data_source: {
              type: "string",
              enum: ["firestore", "memory"],
            },
            // dry_run-only fields:
            package: {
              type: "object",
              description: "Full production package (dry_run only).",
            },
            summary: { type: "string", description: "Pretty-printed summary (dry_run only)." },
            videos: {
              type: "array",
              items: { type: "object" },
              description: "Always [] on dry_run; absent on full mode.",
            },
            cost_guard: {
              type: "object",
              description: "Reports what a live run would cost (dry_run only).",
              properties: {
                veo_called: { type: "boolean", example: false },
                veo_enabled: { type: "boolean", example: false },
                estimated_veo_cost: { type: "number", example: 16 },
                scenes_skipped: { type: "integer", example: 4 },
              },
            },
            // full-mode-only fields:
            job_id: { type: "string", description: "reel_jobs document id; pass to /api/reel/{jobId}/status." },
            status: {
              type: "string",
              enum: ["processing", "failed"],
              description: "Initial job status — 'processing' when at least one scene was submitted to Veo.",
            },
            scene_count: { type: "integer", description: "Scenes actually submitted (capped by MAX_SCENES_PER_REEL)." },
            requested_scenes: { type: "integer", description: "Scenes the package would have had without the cap." },
            limited_by_max_scenes: { type: "boolean", description: "true when scene_count < requested_scenes." },
            estimated_veo_cost: { type: "number", description: "USD. scene_count × VEO_DURATION_SECONDS × 0.50." },
            status_url: { type: "string", description: "Relative URL the caller should poll." },
            scenes: {
              type: "array",
              items: { $ref: "#/components/schemas/SubmittedScene" },
              description: "One entry per scene that was created in Firestore.",
            },
          },
        },
        SubmittedScene: {
          type: "object",
          properties: {
            index: { type: "integer" },
            status: { type: "string", enum: ["queued", "submitted", "processing", "completed", "failed"] },
            veo_operation: { type: "string", nullable: true },
            error: { type: "string", nullable: true },
          },
        },
        ReelJobStatus: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            success: { type: "boolean" },
            elapsed_ms: { type: "integer" },
            job_id: { type: "string" },
            status: {
              type: "string",
              enum: ["queued", "processing", "completed", "failed", "partial"],
            },
            scene_count: { type: "integer" },
            completed_scenes: { type: "integer" },
            failed_scenes: { type: "integer" },
            estimated_veo_cost: { type: "number", nullable: true },
            limited_by_max_scenes: { type: "boolean" },
            requested_scenes: { type: "integer" },
            user_id: { type: "string" },
            niche: { type: "string" },
            topic: { type: "string" },
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  index: { type: "integer" },
                  object: { type: "string", nullable: true },
                  status: { type: "string", enum: ["queued", "submitted", "processing", "completed", "failed"] },
                  veo_operation: { type: "string", nullable: true },
                  public_url: { type: "string", format: "uri", nullable: true },
                  gcs_uri: { type: "string", nullable: true },
                  error: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        // ReelStatusResponse removed in Sprint 6 with the /api/reel/{id}/status path.
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
        VeoDisabledError: {
          type: "object",
          description:
            "Returned with HTTP 403 when ENABLE_VEO_GENERATION is not 'true' and the caller did not pass dry_run=true.",
          properties: {
            ok: { type: "boolean", example: false },
            success: { type: "boolean", example: false },
            error: { type: "string", example: "VEO_DISABLED" },
            message: {
              type: "string",
              example:
                "Veo generation is disabled by ENABLE_VEO_GENERATION=false. Use dry_run=true for text-only validation.",
            },
          },
        },
        HealthzResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean", example: true },
            service: { type: "string", example: "viralobj-bridge" },
            version: { type: "string", example: "cloud-run" },
            checks: {
              type: "object",
              properties: {
                server: { type: "string", example: "ok" },
                database: { type: "string", example: "ok (3ms)" },
                storage: { type: "string", example: "configured (viralobj-assets)" },
                vertex: { type: "string", example: "configured (project=viralreel-ai-493701, model=gemini-2.5-flash)" },
              },
            },
            failed: { type: "array", items: { type: "string" } },
          },
        },
        AgentManifest: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            base_url: { type: "string", format: "uri" },
            openapi_url: { type: "string", format: "uri" },
            health_url: { type: "string", format: "uri" },
            auth: {
              type: "object",
              properties: {
                type: { type: "string", example: "apiKey" },
                header: { type: "string", example: "X-Gemini-Key" },
              },
            },
            capabilities: { type: "array", items: { type: "string" } },
            safety: {
              type: "object",
              properties: {
                veo_default_enabled: { type: "boolean" },
                dry_run_supported: { type: "boolean" },
              },
            },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          summary: "Liveness probe (unauthenticated, no dependencies)",
          tags: ["meta"],
          responses: {
            "200": {
              description: "Service is up",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      service: { type: "string" },
                      version: { type: "string" },
                      uptime_seconds: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/readyz": {
        get: {
          summary: "Readiness probe (unauthenticated, real DB + env checks)",
          description:
            "Exercises the database (SELECT 1) and verifies storage and Vertex env presence. Returns 503 if any check fails. Never calls Gemini or Veo (zero cost). Also reachable at the alias /healthz, but Google's Cloud Run frontend intercepts /healthz before the container — use /readyz from external probes.",
          tags: ["meta"],
          responses: {
            "200": {
              description: "All checks passing",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthzResponse" },
                },
              },
            },
            "503": {
              description: "At least one check failed (db/storage/vertex)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HealthzResponse" },
                },
              },
            },
          },
        },
      },
      "/agent-manifest.json": {
        get: {
          summary: "Compact connector manifest for Gemini Agent Builder",
          tags: ["meta"],
          responses: {
            "200": {
              description: "Connector manifest with live URLs",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AgentManifest" },
                },
              },
            },
          },
        },
      },
      "/api/niches": {
        get: {
          summary: "List all niches with object samples, grouped by category",
          description:
            "Returns all available niches organized in two categories: "
            + "'profissoes' (professional services — advogado, contador, médico, …) "
            + "and 'lifestyle' (daily-life — casa, plantas, financeiro, …). "
            + "Each niche lists key, name, emoji, category, object_count, tone_default, "
            + "and 3 sample_objects. Always call this first when the user hasn't "
            + "specified a niche, or to validate a niche before generating.",
          tags: ["catalog"],
          security: [{ GeminiKey: [] }],
          parameters: [
            {
              name: "lang",
              in: "query",
              schema: { type: "string", enum: ["pt", "en"], default: "pt" },
              description: "Language of names and samples.",
            },
            {
              name: "category",
              in: "query",
              required: false,
              schema: { type: "string", enum: ["profissoes", "lifestyle"] },
              description:
                "Filter by category. Omit to list all. Use 'profissoes' when the user "
                + "is a professional (advogado, dentista, coach, …) looking to produce "
                + "service-marketing reels; use 'lifestyle' for general consumer content.",
            },
          ],
          responses: {
            "200": {
              description: "List of niches",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                      source: {
                        type: "string",
                        enum: ["firestore"],
                        description:
                          "Always 'firestore' after Sprint 6. The legacy 'db' / 'db-fallback' / 'memory' values were retired with Cloud SQL.",
                      },
                      count: { type: "integer" },
                      category: { type: "string", enum: ["all", "profissoes", "lifestyle"] },
                      categories: { type: "array", items: { type: "string" } },
                      niches: {
                        type: "array",
                        items: { $ref: "#/components/schemas/NicheSummary" },
                      },
                      summary: { type: "string" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Missing or invalid X-Gemini-Key / Bearer token",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "EMPTY_NICHES_CATALOG — Firestore returned 0 docs (post-Sprint 6 there is no fallback).",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/generate-reel": {
        post: {
          summary: "Generate reel package — dry_run (200) or full render (202)",
          description:
            "Two modes:\n\n"
            + "  • dry_run=true → Gemini only; HTTP 200 with package + cost_guard.\n"
            + "  • dry_run=false (full mode) → Gemini + Veo submit; HTTP 202 with job_id + status_url.\n\n"
            + "Full-mode flow (Sprint 7, Firestore-native):\n"
            + "  1. Vertex AI Gemini produces the bilingual package (5-30s).\n"
            + "  2. Up to MAX_SCENES_PER_REEL characters are picked; estimated_veo_cost is computed.\n"
            + "  3. A reel_jobs/{jobId} doc is created in Firestore with one scenes/{index} subdoc per scene.\n"
            + "  4. Each scene is submitted to Vertex AI Veo as a long-running operation; the operation name is stored on the scene doc.\n"
            + "  5. The caller polls GET /api/reel/{jobId}/status until status='completed'.\n\n"
            + "Behaviour by flag:\n"
            + "  • ENABLE_VEO_GENERATION!='true' (default) + no dry_run → 403 VEO_DISABLED.\n"
            + "  • ENABLE_VEO_GENERATION=='true' + no dry_run → 202 with job_id (or 500 VEO_SUBMIT_FAILED if every scene submit fails).\n\n"
            + "Auth: dualAuth — Bearer Firebase ID token preferred, X-Gemini-Key fallback.",
          tags: ["generation"],
          security: [{ GeminiKey: [] }],
          parameters: [
            {
              name: "dry_run",
              in: "query",
              required: false,
              schema: { type: "boolean", default: false },
              description:
                "When true, generates only the text package via Gemini and returns videos:[] with a cost_guard summary. Veo is never called and nothing is persisted. Equivalent to passing { \"dry_run\": true } in the JSON body.",
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/GenerateReelRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "dry_run success — Gemini package returned, Veo skipped, cost_guard populated.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GenerateReelResponse" },
                },
              },
            },
            "202": {
              description: "Full render accepted — reel_jobs/{job_id} created, scenes submitted to Veo. Poll status_url.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GenerateReelResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            "401": {
              description: "Missing or invalid X-Gemini-Key / Bearer token",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            "403": {
              description:
                "VEO_DISABLED — paid Veo generation is gated off via ENABLE_VEO_GENERATION!='true' and the caller did not pass dry_run=true.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/VeoDisabledError" } },
              },
            },
            "429": {
              description:
                "COST_LIMIT_EXCEEDED — placeholder for future per-tenant rate limits. Currently unused; MAX_SCENES_PER_REEL caps cost transparently inside a single call instead of rejecting it.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            "500": {
              description:
                "Generation failed. Two distinct errors share this status:\n  • Vertex AI Gemini error — `error: '<vertex message>'`.\n  • VEO_SUBMIT_FAILED — every scene's Veo submission failed; the reel_jobs doc is left in status='failed' for inspection.",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
          },
        },
      },
      "/api/reel/cost-preview": {
        post: {
          summary: "Estimate the Veo bill for a full render — no Gemini, no Veo, zero cost",
          description:
            "Pure arithmetic. Reads MAX_SCENES_PER_REEL, ENABLE_VEO_GENERATION and VEO_DURATION_SECONDS from the live revision and returns what a full-mode /api/generate-reel call *would* cost right now. Useful for an agent or UI to surface a budget warning before the user commits.",
          tags: ["generation"],
          security: [{ GeminiKey: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    scene_count: { type: "integer", minimum: 1, description: "Scenes the caller intends to render. Defaults to objects.length when omitted." },
                    duration: { type: "integer", minimum: 1, description: "Per-scene duration in seconds. Defaults to VEO_DURATION_SECONDS (8)." },
                    objects: { type: "array", items: { type: "string" }, description: "Object list; only its length is read here." },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Cost preview computed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean", example: true },
                      success: { type: "boolean", example: true },
                      scene_count_requested: { type: "integer", example: 1 },
                      scene_count_allowed: {
                        type: "integer",
                        example: 1,
                        description: "min(requested, MAX_SCENES_PER_REEL).",
                      },
                      duration_seconds: { type: "integer", example: 8 },
                      estimated_veo_cost: { type: "number", example: 4 },
                      currency: { type: "string", example: "USD" },
                      veo_enabled: {
                        type: "boolean",
                        description: "Mirrors ENABLE_VEO_GENERATION on the active revision.",
                      },
                      would_run: {
                        type: "boolean",
                        description: "Same as veo_enabled — when false, a follow-up POST /api/generate-reel without dry_run will be rejected with 403 VEO_DISABLED.",
                      },
                      limited_by_max_scenes: { type: "boolean" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "INVALID_SCENE_COUNT — neither scene_count nor objects[] supplied a positive count.",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
            "401": {
              description: "Missing or invalid X-Gemini-Key / Bearer token",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/api/reel/{jobId}/status": {
        get: {
          summary: "Poll a Firestore reel_jobs render until every scene is terminal",
          description:
            "Idempotent. For each scene whose status is queued/submitted/processing, the bridge "
            + "calls Vertex AI's fetchPredictOperation, updates the scene doc, and rolls up the "
            + "parent job (status=completed when every scene completed; partial when at least one "
            + "completed and at least one failed; failed when none completed). Veo writes the MP4 "
            + "directly into gs://viralobj-assets/videos/{user_id}/{job_id}/scene-{index}/ via "
            + "storageUri; this endpoint stores the gcs_uri Veo returns and exposes the public_url.",
          tags: ["generation"],
          security: [{ GeminiKey: [] }],
          parameters: [
            {
              name: "jobId",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "The job_id returned by POST /api/generate-reel in full mode.",
            },
          ],
          responses: {
            "200": {
              description: "Current job + scenes state",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ReelJobStatus" } },
              },
            },
            "401": {
              description: "Missing or invalid X-Gemini-Key / Bearer token",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            "404": {
              description: "JOB_NOT_FOUND — no reel_jobs document for that jobId",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            "500": {
              description: "Firestore or Veo poll error",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
          },
        },
      },
    },
  };
}

// ─── Start server (skipped when imported for testing) ─────────────────────

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  app.listen(PORT, () => {
    console.log(`[viralobj-bridge] listening on :${PORT}`);
    console.log(`[viralobj-bridge] OpenAPI at ${process.env.PUBLIC_URL || `http://localhost:${PORT}`}/openapi.json`);
    if (!process.env.GEMINI_AGENT_TOKEN) {
      console.warn("[viralobj-bridge] WARNING: GEMINI_AGENT_TOKEN not set — protected routes will return 500.");
    }
  });
}

export default app;
