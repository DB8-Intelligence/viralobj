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

// Runtime flag tracking whether we've attempted the DB-empty → in-memory
// seed during this process lifetime. Keeps us from stampeding seeds when
// many /api/niches calls hit an empty DB in parallel.
let seedAttempted = false;

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3001;

// ─── Middleware: auth via X-Gemini-Key ────────────────────────────────────

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
    let dbError = null;
    try {
      dbRows = await db.getNiches({ category });
    } catch (err) {
      dbError = err?.message ?? String(err);
      console.warn("[/api/niches] DB lookup failed, falling back to memory:", dbError);
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
    if (!seedAttempted && dbError === null && (dbRows?.length ?? 0) === 0) {
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

    // Persist to DB best-effort. DB failure must NOT affect the API response —
    // the package was generated successfully and the user should receive it.
    let persisted = { saved: false, reason: null, id: null };
    try {
      // Resolve a professional id. If caller supplied user_email, upsert them.
      // Otherwise fall back to a synthetic "system" professional so history
      // is still recorded (useful for Gemini Agent calls without user context).
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
      // Never throw from here. Log and attach reason to the response so the
      // caller knows the package was generated but not recorded.
      const msg = err?.message ?? String(err);
      console.warn("[/api/generate-reel] persistence skipped:", msg);
      persisted = { saved: false, reason: msg, id: null };
    }

    res.json({
      success: true,
      elapsed_ms: Date.now() - startedAt,
      provider_used: result.result?.provider_used,
      package: result.package,
      summary: result.content?.[0]?.text,
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
              enum: ["auto", "anthropic", "openai", "gemini"],
              default: "auto",
              description: "LLM provider. 'auto' uses VIRALOBJ_PROVIDER_ORDER fallback chain.",
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
        GenerateReelResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            elapsed_ms: { type: "integer", example: 8423 },
            provider_used: { type: "string", example: "anthropic" },
            package: {
              type: "object",
              description:
                "Full production package: meta, characters[], captions[], post_copy, variations[].",
            },
            summary: { type: "string", description: "Human-readable summary." },
            persisted: {
              type: "object",
              description:
                "DB persistence status for this generation. Non-blocking: saved=false "
                + "does not imply the overall call failed — the package is still returned.",
              properties: {
                saved: { type: "boolean", example: true },
                id: {
                  type: "string",
                  format: "uuid",
                  nullable: true,
                  description: "user_history.id of the persisted row; doubles as generation_id.",
                },
                reason: {
                  type: "string",
                  nullable: true,
                  description: "When saved=false, the reason (e.g. 'DB connection refused').",
                },
              },
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
          summary: "Generate a complete Talking Object reel package",
          description:
            "Calls Anthropic/OpenAI/Gemini (configurable fallback) to produce a bilingual (PT+EN) "
            + "production package: scene-by-scene script, AI image prompts, voice script, captions "
            + "timeline, post copy with hashtags, and 3 variations. Takes 5-20s depending on provider.",
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
              description: "Package generated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/GenerateReelResponse" },
                },
              },
            },
            "400": {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
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
            "500": {
              description: "Generation failed (all LLM providers)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
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
