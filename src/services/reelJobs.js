/**
 * reelJobs — Firestore-native render pipeline.
 *
 * Owns every read/write against the reel_jobs collection and its
 * scenes subcollection. Veo submission/polling is delegated to
 * src/infrastructure/veo.js. Cost guards (MAX_SCENES_PER_REEL,
 * estimated_veo_cost) are computed inside this module so the route
 * handler stays thin.
 *
 * Doc layout:
 *
 *   reel_jobs/{jobId}                — one per generate-reel call
 *     ├── user_id, auth_provider, niche, topic, tone, duration
 *     ├── mode: "full"
 *     ├── status: queued | processing | completed | failed
 *     ├── scene_count, completed_scenes, failed_scenes
 *     ├── estimated_veo_cost, limited_by_max_scenes
 *     └── scenes/{index}/            — one doc per rendered scene
 *           ├── index, object, prompt, script
 *           ├── status: queued | submitted | processing | completed | failed
 *           ├── veo_operation, gcs_uri, public_url
 *           └── error
 */
import { firestore, FieldValue } from "../infrastructure/firebase.js";
import veo from "../infrastructure/veo.js";

const JOBS_COLLECTION = "reel_jobs";
const VEO_DURATION_SEC = parseInt(process.env.VEO_DURATION_SECONDS || "8", 10);
const VEO_PRICE_PER_SEC = 0.5; // Veo 2 base; bump when Veo 3 GA + pricing changes.
const RENDER_BUCKET = process.env.GCS_BUCKET_NAME || "viralobj-assets";

/**
 * Build a Veo prompt from one character card. Inlined here so the
 * service is self-contained — same shape the server used pre-Sprint 6.
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

function sceneTypeFor(idx, totalScenes) {
  if (idx === 0) return "intro";
  if (idx === totalScenes - 1 && totalScenes > 1) return "cta";
  return "dialogue";
}

function maxScenesPerReel() {
  // Read fresh on every call so an operator can flip the env at deploy
  // time without rebuilding. Defaults to 2 — we deliberately do not let
  // a missing env open the floodgates.
  const raw = parseInt(process.env.MAX_SCENES_PER_REEL || "2", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 2;
}

function veoTimeoutSeconds() {
  // Wall-clock budget per scene from the moment the job was created.
  // 600s (10 min) covers Veo 2 worst-case render of 8s clips with some
  // headroom for queue depth. Set lower in tests via env.
  const raw = parseInt(process.env.VEO_TIMEOUT_SECONDS || "600", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 600;
}

function timestampToMillis(ts) {
  // Firestore serverTimestamp arrives as a Timestamp object with toMillis().
  // Anything else (string, number, missing) is treated as 0 so a stale
  // doc without created_at never triggers a spurious timeout.
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const n = Date.parse(ts);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Create reel_jobs doc + scene subdocs and submit each scene to Veo.
 *
 * @param {object}  params
 * @param {object}  params.user         — { uid, email, provider }
 * @param {object}  params.package_     — Gemini package (characters[])
 * @param {string}  params.niche
 * @param {string}  params.topic
 * @param {string}  params.tone
 * @param {number}  params.duration
 * @param {string}  [params.providerUsed]
 * @returns {Promise<{
 *   jobId: string,
 *   sceneCount: number,
 *   estimatedVeoCost: number,
 *   limitedByMaxScenes: boolean,
 *   scenes: Array<{ index: number, status: string, veo_operation?: string, error?: string }>,
 * }>}
 */
export async function createJobAndSubmitScenes({
  user,
  package: pkg,
  niche,
  topic,
  tone,
  duration,
  providerUsed = null,
}) {
  const fs = firestore();
  const userId = user?.uid || "anonymous";
  const characters = Array.isArray(pkg?.characters) ? pkg.characters : [];
  const cap = maxScenesPerReel();
  const requested = characters.length;
  const sceneCount = Math.min(requested, cap);
  const limitedByMaxScenes = requested > cap;
  const estimatedVeoCost =
    Math.round(sceneCount * VEO_DURATION_SEC * VEO_PRICE_PER_SEC * 100) / 100;

  // Create the parent job first so the scenes subcollection has an
  // anchor even if Veo submits start failing. Deterministic doc id.
  const jobRef = fs.collection(JOBS_COLLECTION).doc();
  const jobId = jobRef.id;
  await jobRef.set({
    user_id: userId,
    user_email: user?.email || null,
    auth_provider: user?.provider || "anonymous",
    niche,
    topic,
    tone: tone || null,
    duration: duration || null,
    mode: "full",
    status: "queued",
    scene_count: sceneCount,
    completed_scenes: 0,
    failed_scenes: 0,
    estimated_veo_cost: estimatedVeoCost,
    limited_by_max_scenes: limitedByMaxScenes,
    requested_scenes: requested,
    provider_used: providerUsed,
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    error: null,
  });

  const sceneSubmissions = await Promise.all(
    characters.slice(0, sceneCount).map(async (character, idx) => {
      const sceneType = sceneTypeFor(idx, sceneCount);
      const prompt = buildVeoPrompt({ character, sceneType, niche, tone });
      const sceneId = String(idx);
      // Veo writes the MP4 inside this folder; the actual file's gcs_uri
      // arrives via fetchVeoOperation at status time.
      const outputFolder = `gs://${RENDER_BUCKET}/videos/${userId}/${jobId}/scene-${idx}/`;
      const sceneRef = jobRef.collection("scenes").doc(sceneId);

      // Pre-write the scene doc so a Veo submit failure leaves a
      // visible row instead of a missing record.
      await sceneRef.set({
        index: idx,
        scene_type: sceneType,
        object:
          character.name_pt ||
          character.name_en ||
          character.id?.toString() ||
          null,
        prompt,
        script: character.voice_script_pt || null,
        status: "queued",
        veo_operation: null,
        gcs_uri: null,
        public_url: null,
        output_folder: outputFolder,
        error: null,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });

      try {
        const submitted = await veo.submitVeoJob({
          prompt,
          outputGcsUri: outputFolder,
          aspectRatio: "9:16",
          durationSeconds: VEO_DURATION_SEC,
          generateAudio: true,
        });
        await sceneRef.update({
          status: "submitted",
          veo_operation: submitted.operationName,
          updated_at: FieldValue.serverTimestamp(),
        });
        return {
          index: idx,
          status: "submitted",
          veo_operation: submitted.operationName,
        };
      } catch (err) {
        const msg = err?.message ?? String(err);
        console.warn(
          `[reelJobs] Veo submit failed for job=${jobId} scene=${idx}:`,
          msg,
        );
        await sceneRef.update({
          status: "failed",
          error: msg.slice(0, 500),
          updated_at: FieldValue.serverTimestamp(),
        });
        return { index: idx, status: "failed", error: msg };
      }
    }),
  );

  // Roll the parent up: if every scene failed at submit time we surface
  // failed; otherwise the job is processing (Veo is busy on the rest).
  const submitted = sceneSubmissions.filter((s) => s.status === "submitted");
  const failed = sceneSubmissions.filter((s) => s.status === "failed");
  const jobStatus = submitted.length > 0 ? "processing" : "failed";

  await jobRef.update({
    status: jobStatus,
    failed_scenes: failed.length,
    updated_at: FieldValue.serverTimestamp(),
    error:
      jobStatus === "failed"
        ? "All scene submissions failed. See subcollection for per-scene errors."
        : null,
  });

  return {
    jobId,
    sceneCount,
    estimatedVeoCost,
    limitedByMaxScenes,
    scenes: sceneSubmissions,
  };
}

/**
 * Read the current state of a job + advance any in-flight scenes by
 * polling Vertex AI. Idempotent: terminal scenes short-circuit.
 *
 * @param {string} jobId
 * @returns {Promise<null | object>}  the aggregated status payload, or
 *                                    null when the job doesn't exist.
 */
export async function getJobStatus(jobId) {
  const fs = firestore();
  const jobRef = fs.collection(JOBS_COLLECTION).doc(jobId);
  const jobSnap = await jobRef.get();
  if (!jobSnap.exists) return null;
  const job = jobSnap.data();

  const scenesSnap = await jobRef.collection("scenes").orderBy("index").get();
  const scenes = scenesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Advance in-flight scenes. submit_failed and completed/failed are terminal.
  const timeoutMs = veoTimeoutSeconds() * 1000;
  const jobCreatedMs = timestampToMillis(job.created_at);
  const now = Date.now();
  await Promise.all(
    scenes.map(async (s) => {
      if (s.status === "completed" || s.status === "failed") return;

      const sceneRef = jobRef.collection("scenes").doc(s.id);

      // Timeout guard. Computed off the *job* created_at to align all
      // scenes on the same wall-clock budget. If created_at is missing
      // or parses to 0, timestampToMillis returns 0 → the comparison
      // against (now-budget) is always false and we never spuriously
      // time out a doc with bad metadata.
      if (jobCreatedMs > 0 && now - jobCreatedMs > timeoutMs) {
        const before = s.status;
        await sceneRef.update({
          status: "failed",
          error: `TIMEOUT after ${veoTimeoutSeconds()}s`,
          updated_at: FieldValue.serverTimestamp(),
        });
        s.status = "failed";
        s.error = `TIMEOUT after ${veoTimeoutSeconds()}s`;
        console.log(
          `[SCENE] ${jobId}/${s.index} ${before}→failed (TIMEOUT)`,
        );
        return;
      }

      if (!s.veo_operation) return;

      try {
        const op = await veo.fetchVeoOperation(s.veo_operation);
        const before = s.status;
        if (!op.done) {
          if (s.status !== "processing") {
            await sceneRef.update({
              status: "processing",
              updated_at: FieldValue.serverTimestamp(),
            });
            s.status = "processing";
            console.log(
              `[SCENE] ${jobId}/${s.index} ${before}→processing`,
            );
          }
          return;
        }
        if (op.blocked) {
          await sceneRef.update({
            status: "failed",
            error: `RAI blocked: ${op.raiReason ?? "unknown"}`.slice(0, 500),
            updated_at: FieldValue.serverTimestamp(),
          });
          s.status = "failed";
          s.error = op.raiReason;
          console.log(
            `[SCENE] ${jobId}/${s.index} ${before}→failed (RAI: ${op.raiReason})`,
          );
          return;
        }
        if (op.error) {
          await sceneRef.update({
            status: "failed",
            error: String(op.error).slice(0, 500),
            updated_at: FieldValue.serverTimestamp(),
          });
          s.status = "failed";
          s.error = op.error;
          console.log(
            `[SCENE] ${jobId}/${s.index} ${before}→failed (${op.error})`,
          );
          return;
        }
        const publicUrl = veo.gcsUriToPublicUrl(op.gcsUri);
        if (!publicUrl) {
          await sceneRef.update({
            status: "failed",
            error: `Invalid gcsUri returned: ${op.gcsUri}`,
            updated_at: FieldValue.serverTimestamp(),
          });
          s.status = "failed";
          console.log(
            `[SCENE] ${jobId}/${s.index} ${before}→failed (bad_gcs_uri)`,
          );
          return;
        }
        await sceneRef.update({
          status: "completed",
          gcs_uri: op.gcsUri,
          public_url: publicUrl,
          updated_at: FieldValue.serverTimestamp(),
        });
        s.status = "completed";
        s.gcs_uri = op.gcsUri;
        s.public_url = publicUrl;
        console.log(`[SCENE] ${jobId}/${s.index} ${before}→completed`);
      } catch (err) {
        // Transient Vertex error — leave the scene as-is so the next
        // poll retries. We don't want to mark failed on a token refresh.
        console.warn(
          `[reelJobs] Veo poll error for job=${jobId} scene=${s.index}:`,
          err?.message ?? err,
        );
      }
    }),
  );

  // Aggregate.
  const completed = scenes.filter((s) => s.status === "completed").length;
  const failed = scenes.filter((s) => s.status === "failed").length;
  const pending = scenes.filter(
    (s) => s.status === "queued" || s.status === "submitted" || s.status === "processing",
  ).length;
  const totalForRoll = job.scene_count ?? scenes.length;
  const allTerminal = pending === 0;
  let nextStatus = job.status;
  if (allTerminal) {
    nextStatus =
      completed === totalForRoll
        ? "completed"
        : failed > 0 && completed > 0
          ? "partial"
          : "failed";
  } else {
    nextStatus = "processing";
  }

  if (
    nextStatus !== job.status ||
    completed !== (job.completed_scenes ?? 0) ||
    failed !== (job.failed_scenes ?? 0)
  ) {
    const before = job.status;
    await jobRef.update({
      status: nextStatus,
      completed_scenes: completed,
      failed_scenes: failed,
      updated_at: FieldValue.serverTimestamp(),
    });
    job.status = nextStatus;
    job.completed_scenes = completed;
    job.failed_scenes = failed;
    if (before !== nextStatus) {
      console.log(
        `[JOB] ${jobId} ${before}→${nextStatus} (completed=${completed} failed=${failed} total=${totalForRoll})`,
      );
    }
  }

  return {
    job_id: jobId,
    status: nextStatus,
    scene_count: totalForRoll,
    completed_scenes: completed,
    failed_scenes: failed,
    estimated_veo_cost: job.estimated_veo_cost ?? null,
    limited_by_max_scenes: !!job.limited_by_max_scenes,
    requested_scenes: job.requested_scenes ?? totalForRoll,
    user_id: job.user_id,
    niche: job.niche,
    topic: job.topic,
    scenes: scenes.map((s) => ({
      index: s.index,
      object: s.object ?? null,
      status: s.status,
      veo_operation: s.veo_operation ?? null,
      public_url: s.public_url ?? null,
      gcs_uri: s.gcs_uri ?? null,
      error: s.error ?? null,
    })),
  };
}

export default { createJobAndSubmitScenes, getJobStatus };
