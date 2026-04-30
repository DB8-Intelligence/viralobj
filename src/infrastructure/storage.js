/**
 * ViralObj — Google Cloud Storage infrastructure
 *
 * Uploads rendered media (Fal.ai / Veo 3 video outputs, generated images,
 * TTS audio) to the `viralobj-assets` bucket and returns stable public URLs.
 *
 * Why: Fal's response URLs (v3b.fal.media/…) expire after ~7 days. When
 * the Bridge hands the render result back to Gemini Enterprise, it must
 * be a durable URL we control — otherwise the Gemini Agent receives
 * links that 404 a week later.
 *
 * Authentication: uses Application Default Credentials (ADC).
 *   - On GCP (Cloud Run / App Engine / GCE / GKE): automatic via
 *     the runtime's attached service account.
 *   - Locally / Railway / Fly: set GOOGLE_APPLICATION_CREDENTIALS to the
 *     path of a service account JSON key.
 *
 * Env vars:
 *   GCS_BUCKET_NAME                — bucket name (default "viralobj-assets")
 *   GOOGLE_APPLICATION_CREDENTIALS — path to SA JSON (only off-GCP)
 *   GCP_PROJECT_ID                 — optional; inferred from ADC on GCP
 */

import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Storage } from "@google-cloud/storage";
import { isMockStorage } from "../config/runtime.js";

const MOCK_RESULT = (destinationName, sizeBytes = 0) => ({
  url: `mock://${destinationName}`,
  bucket: "mock",
  name: destinationName,
  sizeBytes,
  mock: true,
});

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "viralobj-assets";

// Storage client is lazy — the module can be imported in environments
// without GCP credentials (local dev, CI) without throwing at import time.
let _storage = null;
function getStorage() {
  if (!_storage) {
    _storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
    });
  }
  return _storage;
}

function getBucket() {
  return getStorage().bucket(BUCKET_NAME);
}

/**
 * Public HTTPS URL for an object in the configured bucket. Requires the
 * bucket (or the specific object) to grant `roles/storage.objectViewer`
 * to `allUsers`. For private buckets, use getSignedUrl() instead.
 *
 * @param {string} destinationName — object name (may include "/" segments)
 */
export function getPublicUrl(destinationName) {
  const encoded = destinationName.split("/").map(encodeURIComponent).join("/");
  return `https://storage.googleapis.com/${BUCKET_NAME}/${encoded}`;
}

/**
 * Upload a local file to GCS.
 *
 * @param {string} filePath         — absolute or relative path on disk
 * @param {string} destinationName  — object name in the bucket (may include folders)
 * @param {object} [opts]
 * @param {string} [opts.contentType]  — auto-detected from extension if omitted
 * @param {string} [opts.cacheControl] — e.g. "public, max-age=31536000"
 * @param {object} [opts.metadata]     — custom metadata {key: value}
 * @returns {Promise<{ url: string, bucket: string, name: string, sizeBytes: number }>}
 */
export async function uploadMedia(filePath, destinationName, opts = {}) {
  if (!filePath) throw new Error("uploadMedia: filePath is required");
  if (!destinationName) throw new Error("uploadMedia: destinationName is required");

  // Sprint 25.1 — local dev: pretend the upload succeeded.
  if (isMockStorage()) {
    console.log(`[MOCK_STORAGE] uploadMedia → mock://${destinationName}`);
    return MOCK_RESULT(destinationName);
  }

  const absolute = path.resolve(filePath);
  const stat = await fs.promises.stat(absolute);
  if (!stat.isFile()) throw new Error(`uploadMedia: not a file at ${absolute}`);

  const bucket = getBucket();
  await bucket.upload(absolute, {
    destination: destinationName,
    contentType: opts.contentType ?? inferContentType(destinationName),
    resumable: stat.size > 10 * 1024 * 1024, // resumable for >10MB
    metadata: {
      cacheControl: opts.cacheControl ?? "public, max-age=31536000",
      metadata: opts.metadata,
    },
  });

  return {
    url: getPublicUrl(destinationName),
    bucket: BUCKET_NAME,
    name: destinationName,
    sizeBytes: stat.size,
  };
}

/**
 * Download a remote URL (Fal, S3, whatever) and stream it straight into
 * GCS without hitting local disk. This is the hot path for the video
 * pipeline — Fal returns https://v3b.fal.media/... and we mirror it to
 * gs://viralobj-assets/... before handing the URL back to Gemini.
 *
 * Streams end-to-end to minimize memory use on small Cloud Run
 * instances (256MB+).
 *
 * @param {string} sourceUrl        — HTTP(S) URL to download
 * @param {string} destinationName  — object name in the bucket
 * @param {object} [opts]
 * @param {string} [opts.contentType]  — overrides the source Content-Type
 * @param {string} [opts.cacheControl]
 * @param {object} [opts.metadata]     — custom metadata (e.g. { source_url: ... })
 * @returns {Promise<{ url: string, bucket: string, name: string, sizeBytes: number, sourceContentType: string|null }>}
 */
export async function uploadFromUrl(sourceUrl, destinationName, opts = {}) {
  if (!sourceUrl || typeof sourceUrl !== "string" || !/^https?:\/\//.test(sourceUrl)) {
    throw new Error(`uploadFromUrl: invalid sourceUrl "${sourceUrl}"`);
  }
  if (!destinationName) throw new Error("uploadFromUrl: destinationName is required");

  // Sprint 25.1 — local dev: pretend the relay succeeded without fetching
  // anything. Avoids accidental egress in offline mode.
  if (isMockStorage()) {
    console.log(`[MOCK_STORAGE] uploadFromUrl(${sourceUrl}) → mock://${destinationName}`);
    return { ...MOCK_RESULT(destinationName), sourceContentType: null };
  }

  const res = await fetch(sourceUrl);
  if (!res.ok || !res.body) {
    throw new Error(
      `uploadFromUrl: source returned HTTP ${res.status} for ${sourceUrl}`,
    );
  }

  const sourceContentType = res.headers.get("content-type");
  const contentLength = parseInt(res.headers.get("content-length") || "0", 10);

  const file = getBucket().file(destinationName);
  const writeStream = file.createWriteStream({
    resumable: contentLength > 10 * 1024 * 1024, // resumable for >10MB
    contentType: opts.contentType ?? sourceContentType ?? inferContentType(destinationName),
    metadata: {
      cacheControl: opts.cacheControl ?? "public, max-age=31536000",
      metadata: {
        source_url: sourceUrl,
        ...(opts.metadata ?? {}),
      },
    },
  });

  // Node 18+: convert WHATWG ReadableStream (from fetch) to Node Readable
  // so we can pipe into @google-cloud/storage's write stream.
  const nodeReadable = Readable.fromWeb(res.body);
  await pipeline(nodeReadable, writeStream);

  // After pipeline resolves, query actual size GCS wrote (avoids trusting
  // Content-Length, which some CDNs don't send).
  const [metadata] = await file.getMetadata();
  const sizeBytes = parseInt(metadata.size ?? contentLength ?? 0, 10);

  return {
    url: getPublicUrl(destinationName),
    bucket: BUCKET_NAME,
    name: destinationName,
    sizeBytes,
    sourceContentType,
  };
}

/**
 * Optional: generate a V4 signed URL for a private object. Use when the
 * bucket is not public. Default expiry: 7 days.
 *
 * @param {string} objectName
 * @param {number} [expiresInSeconds=604800]  — 7 days
 */
export async function getSignedUrl(objectName, expiresInSeconds = 604_800) {
  const [url] = await getBucket().file(objectName).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
}

/**
 * Lightweight connectivity check. Returns { ok, bucket, elapsedMs } or throws.
 * Uses bucket.exists() which is a single HEAD request.
 */
export async function ping() {
  const start = Date.now();
  const [exists] = await getBucket().exists();
  return { ok: exists, bucket: BUCKET_NAME, elapsedMs: Date.now() - start };
}

// ─── helpers ──────────────────────────────────────────────────────────────

const CONTENT_TYPE_BY_EXT = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".json": "application/json",
  ".txt": "text/plain",
};

function inferContentType(name) {
  const ext = path.extname(name).toLowerCase();
  return CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream";
}

export default {
  uploadMedia,
  uploadFromUrl,
  getPublicUrl,
  getSignedUrl,
  ping,
};
