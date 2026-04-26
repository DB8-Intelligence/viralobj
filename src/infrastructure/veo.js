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
  // Use the auth client's own request method instead of global fetch +
  // getRequestHeaders. google-auth-library@^10 returns a Web `Headers`
  // object from getRequestHeaders, which doesn't survive `{...headers}`
  // spread (Headers has no enumerable own properties). The result was
  // a request with NO Authorization, hence the Veo 401 we hit on the
  // first paid run. client.request() attaches the bearer token via the
  // gaxios interceptor and uses the same scope, so we get the right
  // bearer token without manually wiring headers.
  const client = await getAuth().getClient();
  const data = init.body
    ? typeof init.body === "string"
      ? JSON.parse(init.body)
      : init.body
    : undefined;
  try {
    const response = await client.request({
      url,
      method: init.method || (data ? "POST" : "GET"),
      data,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      // gaxios defaults: throw on non-2xx, parse JSON automatically.
    });
    return response.data ?? {};
  } catch (err) {
    const status = err.response?.status ?? err.status ?? err.code ?? "unknown";
    const body = err.response?.data ?? null;
    const msg =
      body?.error?.message ??
      (typeof body === "string" ? body : null) ??
      err.message ??
      `HTTP ${status}`;
    const wrapped = new Error(`Veo ${status}: ${msg}`);
    wrapped.status = status;
    wrapped.body = body;
    throw wrapped;
  }
}

/**
 * Build the EXACT JSON body that submitVeoJob would POST to
 * <endpoint>:predictLongRunning, without sending it. Single source of
 * truth so both the live submit and the /api/reel/veo-payload-preview
 * endpoint stay in lockstep — anything we add or remove here is
 * reflected in production AND in audits.
 *
 * @param {object} params  — same shape submitVeoJob accepts
 * @returns {{
 *   url: string,
 *   method: "POST",
 *   model: string,
 *   request_body: { instances: object[], parameters: object },
 *   audit: { contains_generate_audio: boolean, audio_keys: string[] }
 * }}
 */
export function buildVeoSubmitPayload({
  prompt,
  outputGcsUri,
  aspectRatio = "9:16",
  durationSeconds = 8,
  imageGcsUri = null,
  generateAudio = true,
}) {
  if (!prompt) throw new Error("buildVeoSubmitPayload: prompt is required");
  if (!outputGcsUri || !outputGcsUri.startsWith("gs://")) {
    throw new Error(
      'buildVeoSubmitPayload: outputGcsUri must be a gs:// URI (folder; include trailing "/")',
    );
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
    // Personal-content safety policy — keep wide so legitimate
    // professional reels (advogado, médico) aren't blocked.
    personGeneration: "allow_adult",
  };
  // generateAudio only exists on Veo 3+. Veo 2 fails the operation with
  // "Audio generation is not supported by this model" if the parameter
  // is present at all (true *or* false). Omit unless the model is veo-3+.
  if (/^veo-3/i.test(MODEL) && generateAudio) {
    parameters.generateAudio = generateAudio;
  }

  const audioKeys = Object.keys(parameters).filter((k) =>
    /audio/i.test(k),
  );

  return {
    url: `${endpointBase()}:predictLongRunning`,
    method: "POST",
    model: MODEL,
    request_body: { instances, parameters },
    audit: {
      contains_generate_audio: "generateAudio" in parameters,
      audio_keys: audioKeys,
    },
  };
}

/**
 * VEO_MOCK enables a deterministic, never-call-Vertex test mode. The
 * submit path returns a synthetic operation name shaped
 * `mock://<nonce>:<behavior>`, and the fetch path parses that string
 * back into a canned operation result. Behaviors: completed | failed |
 * processing | block. Default behavior on submit is "completed" so a
 * happy-path live test resolves on the next poll.
 */
function veoMockEnabled() {
  return process.env.VEO_MOCK === "true";
}

const MOCK_BUCKET = process.env.GCS_BUCKET_NAME || "viralobj-assets";

function makeMockOperationName(behavior = "completed") {
  const nonce = Math.random().toString(36).slice(2, 10);
  return `mock://${nonce}:${behavior}`;
}

function parseMockOperationName(name) {
  if (typeof name !== "string" || !name.startsWith("mock://")) return null;
  const tail = name.slice("mock://".length);
  const [id, behavior = "completed"] = tail.split(":");
  return { id, behavior };
}

/**
 * Submit a Veo render job. Returns the operation name immediately
 * (sub-second); the actual render runs on Google's side and is
 * retrieved via fetchVeoOperation().
 *
 * @param {object} params  — see buildVeoSubmitPayload
 * @returns {Promise<{ operationName: string, model: string, outputGcsUri: string }>}
 */
export async function submitVeoJob(params) {
  if (veoMockEnabled()) {
    // Build the payload anyway so the audit trail / logs reflect what a
    // real submit would have shipped — just don't send it.
    buildVeoSubmitPayload(params);
    const operationName = makeMockOperationName("completed");
    console.log(
      `[VEO_MOCK] active — synthetic operation ${operationName} (no Vertex contact)`,
    );
    return {
      operationName,
      model: `mock://${MODEL}`,
      outputGcsUri: params.outputGcsUri,
    };
  }
  const { url, request_body } = buildVeoSubmitPayload(params);
  const body = await authedFetch(url, {
    method: "POST",
    body: JSON.stringify(request_body),
  });
  if (!body?.name) {
    throw new Error(
      `Veo predictLongRunning returned no operation name: ${JSON.stringify(body).slice(0, 300)}`,
    );
  }
  return {
    operationName: body.name,
    model: MODEL,
    outputGcsUri: params.outputGcsUri,
  };
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

  // VEO_MOCK: parse the synthetic name written by submitVeoJob (or
  // injected by a Firestore fixture) and short-circuit with a canned
  // operation. Never contacts Vertex — safe for resilience tests.
  const mock = parseMockOperationName(operationName);
  if (mock) {
    if (!veoMockEnabled()) {
      console.warn(
        `[VEO_MOCK] received mock operation name "${operationName}" but VEO_MOCK!=true — refusing to contact Vertex with a non-real op. Returning failed.`,
      );
      return { done: true, error: `Mock operation seen with VEO_MOCK off: ${operationName}` };
    }
    console.log(`[VEO_MOCK] fetch ${operationName} → ${mock.behavior}`);
    switch (mock.behavior) {
      case "processing":
        return { done: false };
      case "block":
        return {
          done: true,
          blocked: true,
          raiReason: "MOCK_RAI_POLICY",
        };
      case "failed":
        return { done: true, error: "MOCK_FAILED" };
      case "completed":
      default: {
        const gcsUri = `gs://${MOCK_BUCKET}/mock/${mock.id}.mp4`;
        return { done: true, gcsUri, mimeType: "video/mp4" };
      }
    }
  }

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
  buildVeoSubmitPayload,
};
