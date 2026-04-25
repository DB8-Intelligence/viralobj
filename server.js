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
import { listNiches, NICHES } from "./mcp/tools/niches.js";
import db from "./src/infrastructure/database.js";
import storage from "./src/infrastructure/storage.js";
import veo from "./src/infrastructure/veo.js";

// Render config — Veo 2/3 on Vertex AI. No more Fal.ai or external API keys;
// auth is Application Default Credentials (the runtime service account on
// Cloud Run / App Engine, or GOOGLE_APPLICATION_CREDENTIALS locally).
const VEO_DURATION_SEC = parseInt(process.env.VEO_DURATION_SECONDS || "8", 10);
const MAX_RENDER_SCENES = parseInt(process.env.VEO_MAX_SCENES || "4", 10);
const RENDER_BUCKET = process.env.GCS_BUCKET_NAME || "viralobj-assets";

// Veo render is unconditionally available when GCP_PROJECT_ID is set and
// the runtime SA has roles/aiplatform.user — there's no "API key" to
// verify upfront. We use an env presence check just to skip the submit
// path with a friendly skip_reason in dev environments without ADC.
function veoAvailable() {
  return Boolean(process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT);
}

// Runtime flag tracking whether we've attempted the DB-empty → in-memory
// seed during this process lifetime. Keeps us from stampeding seeds when
// many /api/niches calls hit an empty DB in parallel.
let seedAttempted = false;

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;

// ─── Middleware: auth via X-Gemini-Key ────────────────────────────────────

/**
 * Build a Veo 3 prompt from a character card in the generated package.
 * Combines visual description (ai_prompt_midjourney) with first-person
 * speech (voice_script_pt) and a scene direction derived from scene_type.
 */
function buildVeoPrompt({ character, sceneType, niche, tone }) {
  const visual =
    character.ai_prompt_midjourney ??
    `Animated ${character.name_pt || character.name_en || "object"} character in Disney/Pixar 3D style`;
  const speech = character.voice_script_pt?.trim() ?? "";
  const direction =
    sceneType === "intro"
      ? "Static medium shot, looking directly at camera with confident expression"
      : sceneType === "dialogue"
        ? "Expressive gesturing while speaking, emotional emphasis"
        : sceneType === "reaction"
          ? "Strong facial reaction — shock, indignation, or realization"
          : "Closing call-to-action with warm smile and inviting gesture";

  const moodTag = tone ? ` ${tone} tone.` : "";
  const setting = `Cozy Brazilian setting, warm golden hour cinematic lighting, 9:16 vertical, 8K.${moodTag}`;

  if (speech) {
    return `${visual}. ${direction}. The character speaks directly to camera in Brazilian Portuguese, saying: "${speech}". ${setting} Niche: ${niche}.`;
  }
  return `${visual}. ${direction}. Subtle idle animation — breathing, blinking, micro-expressions. ${setting} Niche: ${niche}.`;
}

function requireGeminiKey(req, res, next) {
  const expected = process.env.GEMINI_AGENT_TOKEN;
  if (!expected) {
    return res.status(500).json({
      error: "Server misconfigured: GEMINI_AGENT_TOKEN not set in environment.",
    });
  }
  const provided = req.header("X-Gemini-Key") || req.header("x-gemini-key");
  if (!provided || provided !== expected) {
    return res.status(401).json({
      error: "Unauthorized. Valid X-Gemini-Key header required.",
    });
  }
  next();
}

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

app.get("/openapi.json", (req, res) => {
  const baseUrl = process.env.PUBLIC_URL
    || `${req.protocol}://${req.get("host")}`;
  res.json(buildOpenApiSpec(baseUrl));
});

// ─── Protected routes (require X-Gemini-Key) ──────────────────────────────

app.get("/api/niches", requireGeminiKey, async (req, res) => {
  try {
    const lang = (req.query.lang === "en" ? "en" : "pt");
    const rawCategory = typeof req.query.category === "string" ? req.query.category : null;
    const category = rawCategory && ["profissoes", "lifestyle"].includes(rawCategory)
      ? rawCategory
      : null;

    // 1) Try DB first. If it returns rows, use them.
    let dbRows = null;
    let dbFailed = false;
    let dbError = null;
    try {
      dbRows = await db.getNiches({ category });
    } catch (err) {
      dbFailed = true;
      // Some pg errors arrive with an empty .message — fall through to
      // String(err) and finally to null so the JSON body is always either
      // a meaningful string or null, never "".
      const msg = err?.message?.trim() || String(err)?.trim();
      dbError = msg && msg !== "[object Object]" ? msg : null;
      console.warn("[/api/niches] DB lookup failed, falling back to memory:", err);
    }

    if (Array.isArray(dbRows) && dbRows.length > 0) {
      // Shape DB rows to match the in-memory listNiches response.
      const niches = dbRows.map((n) => ({
        key: n.key,
        name: lang === "en" ? n.name_en : n.name_pt,
        emoji: n.emoji,
        category: n.category,
        objects_count: Array.isArray(n.objects) ? n.objects.length : 0,
        tone_default: n.tone_default,
        sample_objects: (Array.isArray(n.objects) ? n.objects.slice(0, 3) : [])
          .map((o) => lang === "en" ? (o.en || o.id || o.pt) : (o.pt || o.id || o.en)),
      }));
      const categories = [...new Set(niches.map((n) => n.category))];
      return res.json({
        success: true,
        source: "db",
        count: niches.length,
        category: category ?? "all",
        categories,
        niches,
      });
    }

    // 2) Fall back to in-memory. Use this path when:
    //    - DB errored (connection refused, auth, etc.)
    //    - DB connected but returned 0 rows (fresh install before seed)
    const memoryResult = await listNiches({ lang, category });

    // 3) If DB was reachable but empty, fire-and-forget auto-seed so the
    //    next request can serve from DB. Never awaits — response stays fast.
    if (!seedAttempted && !dbFailed && (dbRows?.length ?? 0) === 0) {
      seedAttempted = true;
      const allNiches = Object.entries(NICHES).map(([key, n]) => ({
        key,
        category: n.category ?? "lifestyle",
        name_pt: n.name_pt,
        name_en: n.name_en,
        emoji: n.emoji,
        tone_default: n.tone_default,
        objects: n.objects ?? [],
        prompts_base: n.prompts_base ?? null,
      }));
      db.bulkInsertNiches(allNiches)
        .then((r) => console.log(`[/api/niches] auto-seeded ${r.inserted} niches into DB`))
        .catch((err) => {
          console.warn("[/api/niches] auto-seed failed:", err?.message ?? err);
          seedAttempted = false; // allow retry on next call
        });
    }

    res.json({
      success: true,
      source: "memory",
      db_error: dbError,
      count: memoryResult.niches.length,
      category: category ?? "all",
      categories: memoryResult.categories,
      niches: memoryResult.niches,
      summary: memoryResult.content?.[0]?.text,
    });
  } catch (err) {
    // Only hits if BOTH DB AND memory fail — memory failing should be impossible,
    // but we still guard against it.
    console.error("[/api/niches] catastrophic:", err);
    res.status(500).json({
      success: false,
      error: err?.message || String(err),
    });
  }
});

app.post("/api/generate-reel", requireGeminiKey, async (req, res) => {
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
      return res.status(200).json({
        ok: true,
        success: true,
        mode: "dry_run",
        elapsed_ms: Date.now() - startedAt,
        provider_used: result.result?.provider_used,
        niche,
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

    // Persist to DB best-effort. DB failure must NOT affect the API response —
    // the package was generated successfully and the user should receive it.
    let persisted = { saved: false, reason: null, id: null };
    let professionalId = null;
    try {
      const resolvedEmail = typeof user_email === "string" && user_email.trim()
        ? user_email.trim().toLowerCase()
        : "system@viralobj.bridge";
      const resolvedName = resolvedEmail === "system@viralobj.bridge"
        ? "Bridge system user"
        : (user_name ?? null);

      const professional = await db.ensureProfessional({
        email: resolvedEmail,
        fullName: resolvedName,
        profession: niche,
      });
      professionalId = professional.id;

      const historyRow = await db.saveUserHistory({
        userId: professional.id,
        niche,
        topic,
        tone,
        duration,
        packageData: result.package,
        providerUsed: result.result?.provider_used ?? null,
      });

      persisted = { saved: true, reason: null, id: historyRow.id };
    } catch (err) {
      const msg = err?.message ?? String(err);
      console.warn("[/api/generate-reel] persistence skipped:", msg);
      persisted = { saved: false, reason: msg, id: null };
    }

    // ── Video render pipeline ──────────────────────────────────────────
    // Submit each character to Vertex AI Veo as a long-running operation.
    // We can ONLY do this when we have a history_id (FK from
    // videos.generation_id); if persistence failed we return the text
    // package without video jobs.
    //
    // Each submit takes <1s — no risk of Cloud Run timeout. The
    // Fal render itself (~1-3 min/scene) happens in Fal's workers and is
    // retrieved asynchronously by the /api/reel/:id/status endpoint.
    const historyId = persisted.id;
    let videoJobs = [];
    let renderSkipReason = null;

    if (!historyId) {
      renderSkipReason = "DB persistence failed — cannot link video rows (FK videos.generation_id)";
    } else if (!veoAvailable()) {
      renderSkipReason = "GCP_PROJECT_ID not set — Vertex AI Veo render disabled";
    } else {
      const characters = Array.isArray(result.package?.characters)
        ? result.package.characters
        : [];
      const scenes = characters.slice(0, MAX_RENDER_SCENES);

      videoJobs = await Promise.all(
        scenes.map(async (character, idx) => {
          const sceneType =
            idx === 0
              ? "intro"
              : idx === scenes.length - 1 && scenes.length > 1
                ? "cta"
                : "dialogue";
          const sceneId = `${historyId}:${idx}:${sceneType}`;
          const prompt = buildVeoPrompt({ character, sceneType, niche, tone });
          // Veo writes the MP4 directly into this folder — no
          // download-and-reupload step. Trailing slash is intentional.
          const outputGcsUri = `gs://${RENDER_BUCKET}/videos/${historyId}/${encodeURIComponent(sceneId)}/`;

          try {
            const submitted = await veo.submitVeoJob({
              prompt,
              outputGcsUri,
              aspectRatio: "9:16",
              durationSeconds: VEO_DURATION_SEC,
              generateAudio: true,
            });

            // Persist a "pending" row keyed by Veo operation name so the
            // status endpoint can resume polling after a process restart.
            try {
              await db.saveVideo({
                userId: professionalId,
                generationId: historyId,
                sceneId,
                sceneType,
                videoUrl: null,
                imageUrl: null,
                provider: "vertex-veo",
                requestId: submitted.operationName,
                status: "pending",
              });
            } catch (dbErr) {
              console.warn(
                `[/api/generate-reel] saveVideo failed for ${sceneId}:`,
                dbErr?.message ?? dbErr,
              );
            }

            return {
              scene_id: sceneId,
              scene_type: sceneType,
              request_id: submitted.operationName,
              status: "pending",
              prompt_preview: prompt.slice(0, 160),
              output_gcs_uri: outputGcsUri,
            };
          } catch (err) {
            const msg = err?.message ?? String(err);
            console.warn(
              `[/api/generate-reel] Veo submit failed for ${sceneId}:`,
              msg,
            );
            return {
              scene_id: sceneId,
              scene_type: sceneType,
              status: "submit_failed",
              error: msg,
            };
          }
        }),
      );
    }

    const hasProcessing = videoJobs.some((j) => j.status === "pending");
    const renderStatus = hasProcessing
      ? "processing"
      : videoJobs.length === 0
        ? "text_only"
        : "failed";

    const pollUrl = hasProcessing && historyId
      ? `/api/reel/${encodeURIComponent(historyId)}/status`
      : null;

    res.status(hasProcessing ? 202 : 200).json({
      success: true,
      elapsed_ms: Date.now() - startedAt,
      provider_used: result.result?.provider_used,
      package: result.package,
      summary: result.content?.[0]?.text,
      history_id: historyId,
      // video_url is null at this point. Poll /api/reel/{history_id}/status
      // every ~10s; the first scene's durable GCS URL appears there once
      // Fal finishes and the bridge mirrors the MP4 into gs://viralobj-assets.
      video_url: null,
      render_status: renderStatus,
      render_skip_reason: renderSkipReason,
      video_jobs: videoJobs,
      poll_url: pollUrl,
      persisted,
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

/**
 * GET /api/reel/:history_id/status
 *
 * Polling endpoint the Gemini Agent (or any client) calls every ~10s after
 * /api/generate-reel returns 202. For each videos row that is still
 * pending/processing:
 *
 *   1. Ask Vertex AI for the long-running operation status.
 *   2. On done: read the gs:// URI Veo wrote into the bucket, convert
 *      it to a public https URL via veo.gcsUriToPublicUrl(), and UPDATE
 *      the row with status='completed' + the durable GCS URL.
 *   3. On error / RAI-blocked: mark the row failed with the message.
 *
 * The endpoint is idempotent — re-calling after completion just reads rows.
 */
app.get("/api/reel/:history_id/status", requireGeminiKey, async (req, res) => {
  const { history_id } = req.params;
  const startedAt = Date.now();

  try {
    // 1) Read current video rows.
    let videos;
    try {
      videos = await db.getVideosByGenerationId(history_id);
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "DB unavailable — cannot read video jobs",
        detail: err?.message ?? String(err),
      });
    }
    if (videos.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No video jobs for history_id=${history_id}`,
      });
    }

    // 2) For each still-active row, advance status via Vertex AI Veo.
    // The MP4 is already in GCS — Veo wrote it there at submit time.
    const veoReady = veoAvailable();
    const updated = await Promise.all(
      videos.map(async (v) => {
        // Terminal states short-circuit.
        if (v.status === "completed" || v.status === "failed") return v;
        if (!v.request_id) return v;
        if (!veoReady) return v; // no GCP_PROJECT_ID — leave as pending

        try {
          const op = await veo.fetchVeoOperation(v.request_id);

          // Still rendering → flip to "processing" on first detection.
          if (!op.done) {
            if (v.status !== "processing") {
              try {
                const row = await db.updateVideoByRequestId(v.request_id, {
                  status: "processing",
                });
                return row ?? { ...v, status: "processing" };
              } catch {
                return { ...v, status: "processing" };
              }
            }
            return v;
          }

          // RAI safety filter blocked the render — terminal failure.
          if (op.blocked) {
            const row = await db.updateVideoByRequestId(v.request_id, {
              status: "failed",
              error: `RAI blocked: ${op.raiReason}`,
            });
            return row ?? { ...v, status: "failed", error: op.raiReason };
          }

          // Operation errored on the Vertex side.
          if (op.error) {
            const row = await db.updateVideoByRequestId(v.request_id, {
              status: "failed",
              error: op.error.slice(0, 500),
            });
            return row ?? { ...v, status: "failed", error: op.error };
          }

          // Done + has a gcsUri. Veo already wrote the MP4 into our bucket;
          // we just convert gs://... → public https URL and persist.
          const publicUrl = veo.gcsUriToPublicUrl(op.gcsUri);
          if (!publicUrl) {
            const row = await db.updateVideoByRequestId(v.request_id, {
              status: "failed",
              error: `Invalid gcsUri returned: ${op.gcsUri}`,
            });
            return row ?? { ...v, status: "failed", error: "bad_gcs_uri" };
          }

          const row = await db.updateVideoByRequestId(v.request_id, {
            status: "completed",
            video_url: publicUrl,
            duration_ms: VEO_DURATION_SEC * 1000,
            // Veo 2 base pricing — adjust when Veo 3 GA / quotas change.
            cost_usd: VEO_DURATION_SEC * 0.50,
            provider: "vertex-veo",
          });
          return row ?? { ...v, status: "completed", video_url: publicUrl };
        } catch (err) {
          // Vertex poll itself threw — don't burn the row, let the
          // next 10s poll retry. Common transient: rate limit, ADC
          // token refresh.
          console.warn(
            `[/api/reel/${history_id}/status] Veo poll error for ${v.scene_id}:`,
            err?.message ?? err,
          );
          return v;
        }
      }),
    );

    // 3) Aggregate + respond.
    const completed = updated.filter((v) => v.status === "completed");
    const pending = updated.filter((v) => v.status === "pending" || v.status === "processing");
    const failed = updated.filter((v) => v.status === "failed");

    const overall =
      pending.length > 0
        ? "processing"
        : completed.length > 0
          ? "completed"
          : "failed";

    res.json({
      success: true,
      elapsed_ms: Date.now() - startedAt,
      history_id,
      status: overall,
      progress: {
        completed: completed.length,
        pending: pending.length,
        failed: failed.length,
        total: updated.length,
      },
      // First completed scene's durable URL — the headline result for the
      // Gemini Agent to hand back to the user.
      video_url: completed[0]?.video_url ?? null,
      // Full per-scene breakdown.
      scene_videos: updated.map((v) => ({
        scene_id: v.scene_id,
        scene_type: v.scene_type,
        status: v.status,
        video_url: v.video_url ?? null,
        duration_ms: v.duration_ms,
        error: v.error ?? null,
      })),
    });
  } catch (err) {
    console.error(`[/api/reel/${history_id}/status]`, err);
    res.status(500).json({
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
                "Optional email of the professional making the request. When present, "
                + "the row is upserted into professionals and user_history is linked to "
                + "that id. When absent, history is saved under a synthetic system user.",
              example: "advogado@escritorio.com.br",
            },
            user_name: {
              type: "string",
              description: "Optional full name; only used when creating a new professional row.",
              example: "Dra. Maria Silva",
            },
          },
        },
        VideoJob: {
          type: "object",
          properties: {
            scene_id: { type: "string", example: "<history_id>:0:intro" },
            scene_type: { type: "string", enum: ["intro", "dialogue", "reaction", "cta"] },
            request_id: { type: "string", nullable: true, description: "Vertex AI Veo long-running operation name." },
            status: {
              type: "string",
              enum: ["pending", "processing", "completed", "failed", "submit_failed"],
            },
            prompt_preview: { type: "string", nullable: true },
            error: { type: "string", nullable: true },
          },
        },
        SceneVideo: {
          type: "object",
          properties: {
            scene_id: { type: "string" },
            scene_type: { type: "string", enum: ["intro", "dialogue", "reaction", "cta"] },
            status: { type: "string", enum: ["pending", "processing", "completed", "failed"] },
            video_url: {
              type: "string",
              format: "uri",
              nullable: true,
              description: "Durable GCS URL once status=completed.",
            },
            duration_ms: { type: "integer", nullable: true },
            error: { type: "string", nullable: true },
          },
        },
        GenerateReelResponse: {
          type: "object",
          description:
            "ASYNC response. HTTP 202 when at least one scene was submitted to Fal "
            + "(status='processing'); HTTP 200 when no render happened (status='text_only' "
            + "or 'failed'). Poll GET /api/reel/{history_id}/status every ~10s to obtain "
            + "the final GCS video_url.",
          properties: {
            success: { type: "boolean", example: true },
            elapsed_ms: { type: "integer", example: 8423 },
            provider_used: { type: "string", example: "vertex/gemini-1.5-pro" },
            package: {
              type: "object",
              description: "Full production package: meta, characters[], captions[], post_copy, variations[].",
            },
            summary: { type: "string" },
            history_id: {
              type: "string",
              format: "uuid",
              nullable: true,
              description:
                "UUID of the user_history row. Doubles as generation_id. Persist this "
                + "next to the professional's email for future 'memory'-style lookups.",
            },
            video_url: {
              type: "string",
              format: "uri",
              nullable: true,
              description:
                "ALWAYS null at this stage — the render is async. Poll /api/reel/{history_id}/status "
                + "to receive the durable GCS URL when the first scene completes.",
            },
            render_status: {
              type: "string",
              enum: ["processing", "text_only", "failed"],
              description:
                "processing=jobs submitted to Vertex AI Veo; text_only=no render (DB or GCP_PROJECT_ID missing); failed=all submits failed.",
            },
            render_skip_reason: { type: "string", nullable: true },
            video_jobs: {
              type: "array",
              items: { $ref: "#/components/schemas/VideoJob" },
              description: "One entry per character in package.characters[] (max 4).",
            },
            poll_url: {
              type: "string",
              nullable: true,
              description: "Relative URL the client/agent should GET every ~10s until status='completed'.",
            },
            persisted: {
              type: "object",
              properties: {
                saved: { type: "boolean" },
                id: { type: "string", format: "uuid", nullable: true },
                reason: { type: "string", nullable: true },
              },
            },
          },
        },
        ReelStatusResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            elapsed_ms: { type: "integer" },
            history_id: { type: "string", format: "uuid" },
            status: {
              type: "string",
              enum: ["processing", "completed", "failed"],
              description: "Aggregate: processing if any scene is still pending/processing; completed if >=1 scene succeeded and none is pending; failed if all scenes failed.",
            },
            progress: {
              type: "object",
              properties: {
                completed: { type: "integer" },
                pending: { type: "integer" },
                failed: { type: "integer" },
                total: { type: "integer" },
              },
            },
            video_url: {
              type: "string",
              format: "uri",
              nullable: true,
              description:
                "First completed scene's durable URL on Google Cloud Storage. Veo writes the MP4 directly into gs://viralobj-assets/videos/{history_id}/{scene_id}/ — no extra upload step.",
            },
            scene_videos: {
              type: "array",
              items: { $ref: "#/components/schemas/SceneVideo" },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          summary: "Health check (unauthenticated)",
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
                        enum: ["db", "memory"],
                        description:
                          "'db' when served from Cloud SQL. 'memory' when DB is unreachable "
                          + "or empty — in the latter case an async auto-seed is dispatched.",
                      },
                      db_error: {
                        type: "string",
                        nullable: true,
                        description: "Populated when source='memory' due to a DB error.",
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
              description: "Missing or invalid X-Gemini-Key",
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
          summary: "Generate package + submit video render jobs (async)",
          description:
            "Two things happen synchronously:\n"
            + "  1. Vertex AI Gemini 1.5 Pro produces the bilingual production package (5-15s).\n"
            + "  2. Each character is submitted to Vertex AI Veo as a long-running operation (sub-second per submit).\n\n"
            + "The actual video render (30s-3min per scene) runs on Google's side. Veo writes the MP4 "
            + "directly into gs://viralobj-assets/videos/{history_id}/{scene_id}/ via storageUri — no "
            + "download/upload roundtrip. When the call returns, video_url is null and status='processing'; "
            + "the caller must poll GET /api/reel/{history_id}/status every ~10s. When the operation "
            + "completes, the status endpoint converts the gs:// URI to a public https URL and returns it.\n\n"
            + "Auth: Application Default Credentials (no API keys). On Cloud Run / App Engine the runtime "
            + "service account is used; locally, set GOOGLE_APPLICATION_CREDENTIALS.\n\n"
            + "HTTP status: 202 (accepted) when at least one scene was submitted, 200 when the render "
            + "was skipped (text_only) because DB or GCP_PROJECT_ID were unavailable.",
          tags: ["generation"],
          security: [{ GeminiKey: [] }],
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
              description: "Package generated; no render jobs submitted (text_only / failed).",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GenerateReelResponse" },
                },
              },
            },
            "202": {
              description: "Package generated and render jobs submitted — poll /status.",
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
              description: "Missing or invalid X-Gemini-Key",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            "500": {
              description: "Generation failed (all LLM providers)",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
          },
        },
      },
      "/api/reel/{history_id}/status": {
        get: {
          summary: "Poll render progress; returns GCS URL when scenes complete",
          description:
            "Idempotent polling endpoint. For each videos row still pending/processing:\n"
            + "  1. Fetches the Vertex AI Veo long-running operation status.\n"
            + "  2. On done: reads the gs:// URI Veo wrote into the bucket "
            + "(no extra upload — Veo writes directly via storageUri), converts to a public https "
            + "URL, and updates the row with status='completed' + video_url.\n"
            + "  3. On error / RAI-blocked: stores the message in videos.error.\n\n"
            + "Returns the full scene_videos[] breakdown plus a headline video_url (first "
            + "completed scene).",
          tags: ["generation"],
          security: [{ GeminiKey: [] }],
          parameters: [
            {
              name: "history_id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
              description: "The history_id returned by POST /api/generate-reel.",
            },
          ],
          responses: {
            "200": {
              description: "Current render state for the reel",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ReelStatusResponse" },
                },
              },
            },
            "401": {
              description: "Missing or invalid X-Gemini-Key",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            "404": {
              description: "No video jobs found for this history_id",
              content: {
                "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
              },
            },
            "500": {
              description: "DB or other server error",
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
