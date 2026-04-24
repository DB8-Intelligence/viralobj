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

    const result = await listNiches({ lang, category });
    res.json({
      success: true,
      count: result.niches.length,
      category: category ?? "all",
      categories: result.categories,
      niches: result.niches,
      summary: result.content?.[0]?.text,
    });
  } catch (err) {
    console.error("[/api/niches]", err);
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

    res.json({
      success: true,
      elapsed_ms: Date.now() - startedAt,
      provider_used: result.result?.provider_used,
      package: result.package,
      summary: result.content?.[0]?.text,
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
                      count: { type: "integer" },
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
