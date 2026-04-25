/**
 * ViralObj — Vertex AI Veo client
 *
 * Native Google Cloud video render. Replaces the previous Fal.ai bridge.
 *
 * Flow:
 *   1. submitVeoJob(prompt, gcsUri) → predictLongRunning → operationName
 *   2. fetchVeoOperation(operationName) → { done, gcsUri?, error? }
 *
 * Auth: Application Default Credentials (ADC). On Cloud Run / App Engine
 * the runtime service account is used automatically (must have role
 * roles/aiplatform.user). Locally, set GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Why predictLongRunning instead of streaming/sync: Veo renders take
 * 30s–3min per scene. We submit, get an operation name, persist it as
 * the row's request_id, and poll later from /api/reel/:id/status.
 *
 * Why storageUri: Veo writes the MP4 directly into our bucket. No
 * download-from-CDN-then-upload-to-GCS roundtrip. The operation result
 * just hands us the gs:// URI we already chose.
 *
 * Env:
 *   GCP_PROJECT_ID  | GOOGLE_CLOUD_PROJECT  — required
 *   VERTEX_LOCATION                          — default us-central1
 *   VEO_MODEL                                — default veo-2.0-generate-001
 *                                              (set to veo-3.0-generate-preview when GA)
 */

import { GoogleAuth } from "google-auth-library";

const PROJECT  = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const MODEL    = process.env.VEO_MODEL       || "veo-2.0-generate-001";

// Single GoogleAuth instance — handles token refresh, scope, ADC
// lookup. Same `cloud-platform` scope works across Vertex predict +
// long-running ops.
let _auth = null;
function getAuth() {
  if (!_auth) {
    _auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
  }
  return _auth;
}

function endpointBase() {
  if (!PROJECT) {
    throw new Error("GCP_PROJECT_ID (or GOOGLE_CLOUD_PROJECT) is not set — Veo cannot authenticate.");
  }
  return `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}`;
}

async function authedFetch(url, init = {}) {
  const client = await getAuth().getClient();
  const headers = await client.getRequestHeaders();
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { raw: text }; }
  if (!res.ok) {
    const msg = body?.error?.message ?? body?.raw ?? `HTTP ${res.status}`;
    const err = new Error(`Veo ${res.status}: ${msg}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/**
 * Submit a Veo render job. Returns the operation name immediately
 * (sub-second); the actual render runs on Google's side and is
 * retrieved via fetchVeoOperation().
 *
 * @param {object} params
 * @param {string} params.prompt                — text-to-video prompt
 * @param {string} params.outputGcsUri          — REQUIRED. e.g. "gs://viralobj-assets/videos/<history_id>/<scene_id>/"
 *                                                 Trailing slash matters — Veo treats it as a folder.
 * @param {"9:16"|"16:9"} [params.aspectRatio="9:16"]
 * @param {number} [params.durationSeconds=8]   — Veo 2 supports 5-8s; Veo 3 up to 8s today.
 * @param {string} [params.imageGcsUri]         — optional: image-to-video seed.
 * @param {boolean} [params.generateAudio=true] — Veo 3 only; ignored on Veo 2.
 * @returns {Promise<{ operationName: string, model: string, outputGcsUri: string }>}
 */
export async function submitVeoJob({
  prompt,
  outputGcsUri,
  aspectRatio = "9:16",
  durationSeconds = 8,
  imageGcsUri = null,
  generateAudio = true,
}) {
  if (!prompt) throw new Error("submitVeoJob: prompt is required");
  if (!outputGcsUri || !outputGcsUri.startsWith("gs://")) {
    throw new Error('submitVeoJob: outputGcsUri must be a gs:// URI (folder; include trailing "/")');
  }

  const instances = [{ prompt }];
  if (imageGcsUri) {
    instances[0].image = { gcsUri: imageGcsUri, mimeType: "image/jpeg" };
  }

  const parameters = {
    aspectRatio,
    durationSeconds,
    sampleCount: 1,
    storageUri: outputGcsUri,
    // Veo 3 honors generateAudio; older models silently ignore it.
    generateAudio,
    // Personal-content safety policy — keep wide so legitimate
    // professional reels (advogado, médico) aren't blocked.
    personGeneration: "allow_adult",
  };

  const body = await authedFetch(`${endpointBase()}:predictLongRunning`, {
    method: "POST",
    body: JSON.stringify({ instances, parameters }),
  });

  if (!body?.name) {
    throw new Error(`Veo predictLongRunning returned no operation name: ${JSON.stringify(body).slice(0, 300)}`);
  }
  return { operationName: body.name, model: MODEL, outputGcsUri };
}

/**
 * Fetch the status of a Veo long-running operation.
 *
 * Vertex AI long-running operations are polled via the model's
 * `:fetchPredictOperation` action (NOT the global :get). Returns:
 *   { done: false }                                 — still rendering
 *   { done: true,  gcsUri, mimeType }               — success; mp4 at gcsUri
 *   { done: true,  error: string }                  — failed
 *   { done: true,  blocked: true, raiReason }       — RAI safety filter
 *
 * @param {string} operationName  — full name like "projects/.../operations/abc"
 */
export async function fetchVeoOperation(operationName) {
  if (!operationName) throw new Error("fetchVeoOperation: operationName is required");

  const body = await authedFetch(`${endpointBase()}:fetchPredictOperation`, {
    method: "POST",
    body: JSON.stringify({ operationName }),
  });

  if (!body.done) return { done: false };

  if (body.error) {
    return {
      done: true,
      error: body.error.message ?? JSON.stringify(body.error).slice(0, 500),
    };
  }

  const videos = body.response?.videos ?? body.response?.predictions?.[0]?.videos ?? [];
  const first = Array.isArray(videos) ? videos[0] : null;

  // RAI-blocked responses come with raiMediaFilteredReasons / raiMediaFilteredCount
  if (!first?.gcsUri && (body.response?.raiMediaFilteredCount ?? 0) > 0) {
    return {
      done: true,
      blocked: true,
      raiReason: (body.response.raiMediaFilteredReasons ?? []).join("; ") || "RAI policy",
    };
  }

  if (!first?.gcsUri) {
    return {
      done: true,
      error: `Veo done but no gcsUri in response: ${JSON.stringify(body.response ?? {}).slice(0, 300)}`,
    };
  }

  return {
    done: true,
    gcsUri: first.gcsUri,
    mimeType: first.mimeType ?? "video/mp4",
  };
}

/**
 * Convert a gs:// URI returned by Veo into a public HTTPS URL.
 * Bucket must have allUsers:objectViewer (the bootstrap script grants
 * this by default on viralobj-assets).
 */
export function gcsUriToPublicUrl(gcsUri) {
  if (typeof gcsUri !== "string" || !gcsUri.startsWith("gs://")) return null;
  const [, , bucket, ...rest] = gcsUri.split("/");
  const objectPath = rest.map(encodeURIComponent).join("/");
  return `https://storage.googleapis.com/${bucket}/${objectPath}`;
}

/**
 * Liveness check — performs a no-op auth handshake. Throws if ADC isn't
 * configured (helpful during startup smoke tests).
 */
export async function ping() {
  const start = Date.now();
  await getAuth().getAccessToken();
  return { ok: true, model: MODEL, location: LOCATION, project: PROJECT, elapsedMs: Date.now() - start };
}

export default {
  submitVeoJob,
  fetchVeoOperation,
  gcsUriToPublicUrl,
  ping,
};
