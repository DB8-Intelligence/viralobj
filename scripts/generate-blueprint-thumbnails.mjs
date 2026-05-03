#!/usr/bin/env node
/**
 * Sprint 41 — Gera 1 thumbnail por blueprint via Vertex AI Imagen 3 fast.
 *
 * Modelo:    imagen-3.0-fast-generate-001
 * Custo:     ~$0.02 por imagem
 * Aspecto:   9:16 (formato Reels real)
 * Saída:     webapp/public/blueprints/{id}.jpg
 *
 * Auth:      gcloud auth print-access-token (token de usuário)
 * API:       Vertex AI predict endpoint
 *
 * Uso:
 *   node scripts/generate-blueprint-thumbnails.mjs                # gera só os faltantes
 *   FORCE_REGENERATE=true node scripts/generate-blueprint-thumbnails.mjs   # sobrescreve
 *   DRY_RUN=true node scripts/generate-blueprint-thumbnails.mjs   # imprime prompts sem chamar API
 *
 * Idempotente: pula blueprints que já têm arquivo no destino, exceto com FORCE_REGENERATE.
 * Tolerante: se uma geração falha (safety filter, quota, etc.), loga e segue. O
 * card de blueprint cai pro fallback emoji+gradiente automaticamente.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const OUT_DIR = join(REPO_ROOT, "webapp", "public", "blueprints");
const BLUEPRINTS_FILE = join(REPO_ROOT, "webapp", "lib", "viralobj-blueprints.ts");

const PROJECT = "viralreel-ai-493701";
const LOCATION = "us-central1";
const MODEL = "imagen-3.0-fast-generate-001";
const ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`;

const FORCE = process.env.FORCE_REGENERATE === "true";
const DRY_RUN = process.env.DRY_RUN === "true";

// ─── Read blueprints from the source of truth ─────────────────────────
// We don't transpile TS here; just regex-extract the array literals.
function readBlueprints() {
  const src = readFileSync(BLUEPRINTS_FILE, "utf8");
  const match = src.match(/VIRALOBJ_BLUEPRINTS:\s*Blueprint\[\]\s*=\s*\[([\s\S]*?)\];\s*\n\s*const BY_ID/);
  if (!match) throw new Error("Could not find VIRALOBJ_BLUEPRINTS array in " + BLUEPRINTS_FILE);
  const arrayBody = match[1];
  const items = [];
  // Split on top-level },{ pairs. Use a quick lexer that respects depth.
  let depth = 0, start = 0;
  for (let i = 0; i < arrayBody.length; i++) {
    const c = arrayBody[i];
    if (c === "{") { if (depth === 0) start = i; depth++; }
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        items.push(arrayBody.slice(start, i + 1));
      }
    }
  }
  // For each item, extract the fields we need.
  return items.map((raw) => {
    const get = (key) => {
      const m = raw.match(new RegExp(`${key}\\s*:\\s*"([^"]*)"`));
      return m ? m[1] : null;
    };
    const getArr = (key) => {
      const m = raw.match(new RegExp(`${key}\\s*:\\s*\\[([^\\]]*)\\]`));
      if (!m) return [];
      return m[1].split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
    };
    return {
      id: get("id"),
      title: get("title"),
      niche: get("niche"),
      objects: getArr("objects"),
      topic: get("topic"),
      tone: get("tone"),
      description: get("description"),
    };
  }).filter((b) => b.id);
}

// ─── Prompt template ──────────────────────────────────────────────────
const TONE_VISUAL = {
  dramatic: "dramatic cinematic lighting, intense expression, high contrast",
  funny: "playful comedic expression, vibrant colors, slight cartoon exaggeration",
  emotional: "warm soft lighting, heartfelt vulnerable expression",
  sarcastic: "sly smirk, raised eyebrow, witty pose, cool tones",
  motivational: "uplifting bright lighting, confident triumphant pose",
};

function promptFor(b) {
  const objects = b.objects.join(" and ");
  const toneStyle = TONE_VISUAL[b.tone] ?? TONE_VISUAL.dramatic;
  return `3D Pixar Disney animation style thumbnail of an anthropomorphic ${objects} character with expressive face and big eyes, ${toneStyle}, depicting "${b.description}", subject centered in vertical 9:16 frame, clean minimalist background with subtle bokeh, viral TikTok Reels aesthetic, hyperrealistic detailed render, soft studio lighting, no text, no watermark, no logo`;
}

const NEGATIVE = "text, words, letters, watermark, logo, signature, blurry, low quality, multiple subjects, cluttered background, photo, realistic photo of real object, deformed, ugly";

// ─── Auth ─────────────────────────────────────────────────────────────
function getAccessToken() {
  // Prefer ADC; fall back to user token. Both work for Vertex AI predict
  // when the principal has aiplatform.endpoints.predict on the project.
  for (const cmd of [
    "gcloud auth application-default print-access-token",
    "gcloud auth print-access-token",
  ]) {
    try {
      const tok = execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      if (tok && tok.length > 100) return tok;
    } catch { /* try next */ }
  }
  throw new Error("Could not obtain a Google access token. Run `gcloud auth application-default login` first.");
}

// ─── One image ────────────────────────────────────────────────────────
async function generateOne(blueprint, token) {
  const prompt = promptFor(blueprint);
  const body = {
    instances: [{ prompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: "9:16",
      negativePrompt: NEGATIVE,
      personGeneration: "allow_adult",
      safetySetting: "block_some",
      outputOptions: { mimeType: "image/jpeg", compressionQuality: 88 },
    },
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 400)}`);
  }
  const json = await res.json();
  const pred = json.predictions?.[0];
  if (!pred?.bytesBase64Encoded) {
    throw new Error(`No prediction bytes returned. Raw: ${JSON.stringify(json).slice(0, 400)}`);
  }
  return Buffer.from(pred.bytesBase64Encoded, "base64");
}

// ─── Main ─────────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const blueprints = readBlueprints();
  console.log(`[blueprints] found ${blueprints.length} blueprints to process`);
  console.log(`[output]    ${OUT_DIR}`);
  console.log(`[model]     ${MODEL} (${DRY_RUN ? "DRY RUN — no API calls" : "live"})`);
  console.log(`[force]     ${FORCE ? "yes — overwriting existing" : "no — skipping existing files"}`);
  console.log("");

  if (DRY_RUN) {
    for (const b of blueprints) {
      console.log(`--- ${b.id} ---`);
      console.log(promptFor(b));
      console.log("");
    }
    return;
  }

  const token = getAccessToken();
  let ok = 0, skipped = 0, failed = 0;
  const failures = [];

  for (const b of blueprints) {
    const outFile = join(OUT_DIR, `${b.id}.jpg`);
    if (!FORCE && existsSync(outFile)) {
      console.log(`[skip] ${b.id}.jpg already exists`);
      skipped++;
      continue;
    }
    try {
      console.log(`[gen ] ${b.id} ...`);
      const t0 = Date.now();
      const buf = await generateOne(b, token);
      writeFileSync(outFile, buf);
      const dt = Date.now() - t0;
      console.log(`[ok  ] ${b.id}.jpg  (${(buf.length / 1024).toFixed(1)} KB in ${(dt / 1000).toFixed(1)}s)`);
      ok++;
    } catch (e) {
      console.warn(`[fail] ${b.id}: ${e.message}`);
      failures.push({ id: b.id, err: e.message });
      failed++;
    }
  }

  console.log("");
  console.log(`Summary: ${ok} generated, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) {
    console.log("Failures:");
    for (const f of failures) console.log(`  - ${f.id}: ${f.err.slice(0, 120)}`);
    console.log("(failed blueprints fall back to emoji+gradient on the card)");
  }
  console.log(`Estimated cost: ~$${(ok * 0.02).toFixed(2)} (${ok} images × $0.02)`);
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
