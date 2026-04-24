/**
 * ViralObj — PostgreSQL infrastructure (GCP Cloud SQL target)
 *
 * Connection pool + data access for the three core tables the bridge writes
 * from server.js: `professionals`, `niches`, `videos`, `user_history`.
 *
 * Env vars (loaded via dotenv in server.js):
 *   DB_HOST   — hostname or /cloudsql/<project>:<region>:<instance> for Unix socket
 *   DB_USER   — e.g. "viralobj_app"
 *   DB_PASS   — password
 *   DB_NAME   — e.g. "viralobj"
 *   DB_PORT   — 5432 by default
 *   DB_SSL    — "disable" to turn off TLS; otherwise TLS with rejectUnauthorized=false
 *               (Cloud SQL with the Auth Proxy or Unix socket doesn't need SSL at app level).
 *   LOG_QUERIES — "true" to log each query + elapsed ms (dev only, verbose).
 */

import pg from "pg";

const { Pool } = pg;

// Host can be a Unix socket (Cloud SQL Auth Proxy mode) OR a hostname/IP.
// For sockets, pg ignores port and uses the socket directly.
const host = process.env.DB_HOST;
const isSocket = typeof host === "string" && host.startsWith("/");

const pool = new Pool({
  host,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  // Socket connections handle TLS at the proxy layer; TCP needs TLS on.
  ssl:
    isSocket || process.env.DB_SSL === "disable"
      ? false
      : { rejectUnauthorized: false },
  max: parseInt(process.env.DB_POOL_MAX || "10", 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  // Errors on idle clients shouldn't kill the process — just log.
  console.error("[db] unexpected pool error:", err?.message ?? err);
});

/**
 * Low-level query helper. Use this for ad-hoc SELECTs / admin ops.
 * Prefer the named functions (saveVideo, getNiches, …) for standard flows.
 */
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    if (process.env.LOG_QUERIES === "true") {
      console.log(
        `[db] ${Date.now() - start}ms rows=${res.rowCount} | ${text.slice(0, 80).replace(/\s+/g, " ")}`,
      );
    }
    return res;
  } catch (err) {
    console.error(
      `[db] query failed in ${Date.now() - start}ms: ${text.slice(0, 80).replace(/\s+/g, " ")}`,
      err?.message ?? err,
    );
    throw err;
  }
}

/**
 * Cheap liveness check. Use in /health or startup smoke tests.
 * Returns { ok: true, elapsedMs } or throws.
 */
export async function ping() {
  const start = Date.now();
  await pool.query("SELECT 1");
  return { ok: true, elapsedMs: Date.now() - start };
}

// ─── videos ────────────────────────────────────────────────────────────────

/**
 * Insert a rendered scene video (or a placeholder row for pending Fal jobs).
 *
 * @param {object} params
 * @param {string|null} params.userId         — professionals.id (null for anonymous)
 * @param {string}      params.generationId   — links rows of the same reel together
 * @param {string}      params.sceneId        — e.g. "Cacto-plantas-intro"
 * @param {string}      params.sceneType      — intro | dialogue | reaction | cta
 * @param {string|null} params.videoUrl       — null when still in queue
 * @param {string|null} params.imageUrl       — source image sent to Veo 3
 * @param {number|null} params.durationMs
 * @param {string}      [params.provider]     — "fal" | "veo3" | "veed" | "mock"
 * @param {string|null} [params.requestId]    — Fal queue request_id
 * @param {string}      [params.status]       — pending | processing | completed | failed (default "completed")
 * @param {string|null} [params.error]
 * @param {number|null} [params.costUsd]
 * @returns {Promise<{ id: string, created_at: Date }>}
 */
export async function saveVideo({
  userId = null,
  generationId,
  sceneId,
  sceneType,
  videoUrl = null,
  imageUrl = null,
  durationMs = null,
  provider = "fal",
  requestId = null,
  status = "completed",
  error = null,
  costUsd = null,
}) {
  if (!generationId || !sceneId || !sceneType) {
    throw new Error("saveVideo: generationId, sceneId and sceneType are required");
  }
  const { rows } = await query(
    `INSERT INTO videos (
       user_id, generation_id, scene_id, scene_type,
       video_url, image_url, duration_ms,
       provider, request_id, status, error, cost_usd
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING id, created_at`,
    [
      userId,
      generationId,
      sceneId,
      sceneType,
      videoUrl,
      imageUrl,
      durationMs,
      provider,
      requestId,
      status,
      error,
      costUsd,
    ],
  );
  return rows[0];
}

// ─── professionals ────────────────────────────────────────────────────────

/**
 * Upsert a professional by email. Used by the Bridge when an incoming
 * generate-reel call carries `user_email` — we don't want to require a
 * separate signup endpoint just to record history.
 *
 * @param {object} params
 * @param {string}      params.email
 * @param {string|null} [params.fullName]
 * @param {string|null} [params.profession]  — should match niches.key when possible
 * @returns {Promise<{ id: string, email: string, full_name: string|null, profession: string|null }>}
 */
export async function ensureProfessional({ email, fullName = null, profession = null }) {
  if (!email) throw new Error("ensureProfessional: email is required");
  const { rows } = await query(
    `INSERT INTO professionals (email, full_name, profession)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET
       full_name  = COALESCE(EXCLUDED.full_name, professionals.full_name),
       profession = COALESCE(EXCLUDED.profession, professionals.profession),
       updated_at = now()
     RETURNING id, email, full_name, profession`,
    [email, fullName, profession],
  );
  return rows[0];
}

// ─── niches ────────────────────────────────────────────────────────────────

/**
 * Fetch niches from the DB. This is the DB-backed counterpart of
 * mcp/tools/niches.js `listNiches()` (in-memory constant) — the bridge can
 * fall back to the in-memory version if this table is empty.
 *
 * @param {object} [opts]
 * @param {"profissoes"|"lifestyle"|null} [opts.category]
 * @param {boolean} [opts.includeInactive]
 * @returns {Promise<Array<{key,category,name_pt,name_en,emoji,tone_default,objects,prompts_base}>>}
 */
export async function getNiches({ category = null, includeInactive = false } = {}) {
  const where = [];
  const params = [];
  if (!includeInactive) where.push("is_active = true");
  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  const sql = `
    SELECT key, category, name_pt, name_en, emoji, tone_default, objects, prompts_base
    FROM niches
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY category ASC, key ASC
  `;
  const { rows } = await query(sql, params);
  return rows;
}

/**
 * Count niches in the table. Used by /api/niches to decide whether to
 * trigger a fire-and-forget auto-seed on first request after deploy.
 */
export async function countNiches() {
  const { rows } = await query(`SELECT COUNT(*)::int AS n FROM niches`);
  return rows[0]?.n ?? 0;
}

/**
 * Bulk-upsert niches into the DB. Used for the initial seed from the
 * in-memory NICHES constant in mcp/tools/niches.js.
 *
 * Accepts the memory format: { key, category, name_pt, name_en, emoji,
 * tone_default, objects, prompts_base }. Missing fields default sanely.
 *
 * Runs inside a single transaction so the table is either fully seeded
 * or unchanged.
 *
 * @param {Array<object>} niches
 * @returns {Promise<{ inserted: number }>}
 */
export async function bulkInsertNiches(niches) {
  if (!Array.isArray(niches) || niches.length === 0) {
    return { inserted: 0 };
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let inserted = 0;
    for (const n of niches) {
      if (!n?.key) continue;
      const res = await client.query(
        `INSERT INTO niches (key, category, name_pt, name_en, emoji, tone_default, objects, prompts_base)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (key) DO UPDATE SET
           category     = EXCLUDED.category,
           name_pt      = EXCLUDED.name_pt,
           name_en      = EXCLUDED.name_en,
           emoji        = EXCLUDED.emoji,
           tone_default = EXCLUDED.tone_default,
           objects      = EXCLUDED.objects,
           prompts_base = EXCLUDED.prompts_base,
           updated_at   = now()`,
        [
          n.key,
          n.category ?? "lifestyle",
          n.name_pt ?? n.key,
          n.name_en ?? n.key,
          n.emoji ?? null,
          n.tone_default ?? "educational",
          JSON.stringify(n.objects ?? []),
          n.prompts_base ?? null,
        ],
      );
      inserted += res.rowCount ?? 0;
    }
    await client.query("COMMIT");
    return { inserted };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// ─── user_history ──────────────────────────────────────────────────────────

/**
 * Upsert a generation into user_history. The id is the generation_id so
 * repeated saves (e.g. after variation re-gen) overwrite cleanly.
 *
 * @param {object} params
 * @param {string}      params.userId
 * @param {string|null} [params.generationId]  — if null, the DB generates one
 * @param {string}      params.niche
 * @param {string}      params.topic
 * @param {string}      [params.tone]
 * @param {number}      [params.duration]      — seconds
 * @param {object}      params.packageData     — full generated JSON
 * @param {string|null} [params.providerUsed]  — "anthropic" | "openai" | "gemini"
 * @returns {Promise<{ id: string, created_at: Date }>}
 */
export async function saveUserHistory({
  userId,
  generationId = null,
  niche,
  topic,
  tone = null,
  duration = null,
  packageData,
  providerUsed = null,
}) {
  if (!userId) throw new Error("saveUserHistory: userId is required");
  if (!niche || !topic) throw new Error("saveUserHistory: niche and topic are required");

  const { rows } = await query(
    `INSERT INTO user_history (
       id, user_id, niche, topic, tone, duration, package, provider_used
     ) VALUES (
       COALESCE($1::uuid, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8
     )
     ON CONFLICT (id) DO UPDATE SET
       package       = EXCLUDED.package,
       provider_used = EXCLUDED.provider_used,
       topic         = EXCLUDED.topic,
       tone          = EXCLUDED.tone,
       duration      = EXCLUDED.duration
     RETURNING id, created_at`,
    [generationId, userId, niche, topic, tone, duration, packageData, providerUsed],
  );
  return rows[0];
}

// ─── graceful shutdown ────────────────────────────────────────────────────

/**
 * Close the pool so the process can exit cleanly (Ctrl+C, SIGTERM on
 * Cloud Run, etc.). Idempotent.
 */
export async function closePool() {
  try {
    await pool.end();
  } catch (err) {
    console.error("[db] closePool error:", err?.message ?? err);
  }
}

export default {
  query,
  ping,
  saveVideo,
  getNiches,
  countNiches,
  bulkInsertNiches,
  ensureProfessional,
  saveUserHistory,
  closePool,
};
