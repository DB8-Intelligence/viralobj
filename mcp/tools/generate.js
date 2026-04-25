/**
 * ViralObj — generate.js
 *
 * Single-provider package generation via **Google Vertex AI Gemini 1.5 Pro**.
 * Authentication is Application Default Credentials (ADC) — on GCP runtimes
 * (Cloud Run / App Engine / GCE) the attached service account is used
 * automatically; locally, set GOOGLE_APPLICATION_CREDENTIALS.
 *
 * Migrated from Anthropic + OpenAI + Gemini-AI-Studio fallback chain.
 * Kept the same generatePackage() signature so callers (server.js,
 * mcp/index.js) don't need changes.
 */
import { VertexAI } from "@google-cloud/vertexai";
import { loadNicheData } from "./niches.js";

const VERTEX_PROJECT  = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
const VERTEX_LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const VERTEX_MODEL    = process.env.VERTEX_MODEL    || "gemini-1.5-pro";

// Lazy init: importing this module shouldn't blow up if the project id
// isn't set yet (e.g. local tests with DB-only flows).
let _vertex = null;
function getVertex() {
  if (!_vertex) {
    if (!VERTEX_PROJECT) {
      throw new Error(
        "GCP_PROJECT_ID (or GOOGLE_CLOUD_PROJECT) is not set — Vertex AI cannot authenticate."
      );
    }
    _vertex = new VertexAI({ project: VERTEX_PROJECT, location: VERTEX_LOCATION });
  }
  return _vertex;
}

/**
 * Call Gemini 1.5 Pro on Vertex AI with native systemInstruction.
 * Returns the parsed JSON package (responseMimeType=application/json
 * makes the model emit pure JSON, no markdown fences to strip).
 */
async function callVertex(systemPrompt, userPrompt) {
  const model = getVertex().getGenerativeModel({
    model: VERTEX_MODEL,
    // Native system instructions — the whole point of moving to Vertex.
    systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      // 32K accommodates a multi-character package on Gemini 2.5 — the
      // older 8192 cap silently truncated mid-JSON, which then surfaced
      // downstream as a baffling "Unexpected end of JSON input".
      maxOutputTokens: 32768,
      topP: 0.95,
    },
    safetySettings: [
      // ViralObj content is consumer-friendly; relax the lowest tier so
      // niches like 'saude-mental' or 'maternidade' that mention pain
      // points don't get spuriously blocked.
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  });

  const candidate = result?.response?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join("\n");
  const finishReason = candidate?.finishReason ?? "no_candidate";

  if (!text) {
    throw new Error(`Vertex AI returned empty content (finishReason=${finishReason})`);
  }
  return { text: text.trim(), finishReason };
}

function parsePackage({ text, finishReason }) {
  // responseMimeType=application/json should give us clean JSON, but be
  // defensive: pull the first balanced {...} block in case the model
  // wraps it in commentary on rare occasions.
  try {
    return JSON.parse(text);
  } catch (firstErr) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const preview = text.slice(0, 200).replace(/\s+/g, " ");
      throw new Error(
        `No JSON object in Vertex AI response (finishReason=${finishReason}, len=${text.length}, preview="${preview}")`,
      );
    }
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (secondErr) {
      const preview = jsonMatch[0].slice(0, 200).replace(/\s+/g, " ");
      throw new Error(
        `JSON parse failed after regex extraction (finishReason=${finishReason}, len=${text.length}, preview="${preview}", inner=${secondErr.message})`,
      );
    }
  }
}

/**
 * Generate a complete Talking Object production package.
 *
 * @param {object} args
 * @param {string} args.niche
 * @param {string[]} args.objects
 * @param {string} args.topic
 * @param {string} [args.tone="angry"]
 * @param {number} [args.duration=30]
 * @param {"pt"|"en"|"both"} [args.lang="both"]
 * @param {object|null} [args.analysis=null]
 * @param {string} [args.provider="auto"]  — kept for backward compat; only "vertex"/"auto" supported now.
 */
export async function generatePackage({
  niche,
  objects,
  topic,
  tone = "angry",
  duration = 30,
  lang = "both",
  analysis = null,
  // Kept for backward compatibility with old callers; ignored beyond
  // emitting a one-shot warning when someone explicitly asks for a
  // provider that no longer exists.
  provider = "auto",
}) {
  if (provider && provider !== "auto" && provider !== "vertex") {
    console.warn(
      `[generate] provider="${provider}" is no longer supported (Anthropic/OpenAI/Gemini-AI-Studio were removed). Falling back to Vertex AI.`
    );
  }

  const nicheData = await loadNicheData(niche);
  const numObjects = objects.length;
  const secsPerObject = Math.floor(duration / numObjects);

  const analysisContext = analysis
    ? `\n\nREAL VIDEO ANALYSIS (use as reference for style/tone/visuals):\n${JSON.stringify(analysis, null, 2)}`
    : "";

  // System instruction — sent natively via Vertex's systemInstruction param.
  // No more "Return ONLY valid JSON" coaching needed because
  // responseMimeType=application/json is enforced at the API layer.
  const systemPrompt = `You are ViralObj's content generation engine (viralobj.com).

Your job: produce viral Talking Object reels — animated 3D objects (Pixar/Disney style) that speak in first person about everyday mistakes within a niche.

Output language: bilingual (Brazilian Portuguese + English) with full production detail.

Voice scripts must use stage markers: [pausa], [ÊNFASE], [pausa longa] (PT) and [pause], [EMPHASIS], [long pause] (EN).

Image prompts must be in English, ready for Midjourney/Imagen, 9:16 vertical, ultra-detailed, Pixar 3D render, 8K.${analysisContext}`;

  const userPrompt = `Generate a complete Talking Object production package.

INPUTS:
- Niche: ${niche}
- Objects: ${objects.join(", ")}
- Topic: ${topic}
- Tone: ${tone}
- Duration: ${duration}s total (~${secsPerObject}s per object)
- Language output: ${lang}
- Objects per reel: ${numObjects}

NICHE CONTEXT:
${JSON.stringify(nicheData, null, 2)}

Return this exact JSON structure (no markdown, no commentary):
{
  "meta": {
    "niche": "${niche}",
    "topic_pt": "topic in Portuguese",
    "topic_en": "topic in English",
    "tone": "${tone}",
    "duration": ${duration},
    "objects_count": ${numObjects},
    "generated_at": "${new Date().toISOString()}"
  },
  "characters": [
    {
      "id": 1,
      "name_pt": "object name in Portuguese",
      "name_en": "object name in English",
      "emoji": "relevant emoji",
      "timestamp_start": "0s",
      "timestamp_end": "${secsPerObject}s",
      "environment_pt": "scene description in Portuguese",
      "environment_en": "scene description in English",
      "expression_arc": ["expression1", "expression2", "expression3"],
      "error_denounced_pt": "what mistake the object complains about (PT)",
      "error_denounced_en": "what mistake the object complains about (EN)",
      "human_background_pt": "description of human in background (PT)",
      "human_background_en": "description of human in background (EN)",
      "captions": [
        {"time": "Xs", "text_pt": "caption PT", "text_en": "caption EN", "style": "bold/regular"}
      ],
      "voice_script_pt": "full speech in Portuguese with [pausa], [ÊNFASE], [pausa longa] markers",
      "voice_script_en": "full speech in English with [pause], [EMPHASIS], [long pause] markers",
      "ai_prompt_midjourney": "detailed Midjourney/Imagen prompt in English for this character, 9:16 vertical, Pixar 3D style",
      "ai_prompt_kling": "Veo / Kling animation prompt in English for body movement"
    }
  ],
  "post_copy": {
    "hook_pt": "first line hook in Portuguese (stops scroll)",
    "hook_en": "first line hook in English",
    "body_pt": "post body in Portuguese with emoji bullets per object",
    "body_en": "post body in English with emoji bullets",
    "cta_pt": "call to action in Portuguese",
    "cta_en": "call to action in English",
    "hashtags_pt": ["#tag1", "#tag2", "...25 tags total for PT market"],
    "hashtags_en": ["#tag1", "#tag2", "...20 tags total for global market"]
  },
  "captions_full_script": [
    {"time": "Xs", "text_pt": "...", "text_en": "...", "character": "object name", "style": "bold/regular", "color": "white/red/green/etc"}
  ],
  "variations": [
    {
      "id": 1,
      "angle_pt": "variation angle description in Portuguese",
      "angle_en": "variation angle description in English",
      "title_pt": "variation title PT",
      "title_en": "variation title EN",
      "hook_pt": "hook in Portuguese",
      "hook_en": "hook in English",
      "objects": ["object1", "object2"],
      "format_note_pt": "production note PT",
      "format_note_en": "production note EN",
      "tags": ["high-retention", "viral", "educational"]
    }
  ],
  "production_stack": [
    {"step": 1, "tool": "Imagen 3 (Vertex AI)", "purpose_pt": "...", "purpose_en": "...", "priority": "essential"},
    {"step": 2, "tool": "Veo (Vertex AI)", "purpose_pt": "...", "purpose_en": "...", "priority": "essential"},
    {"step": 3, "tool": "GCS (viralobj-assets)", "purpose_pt": "...", "purpose_en": "...", "priority": "essential"},
    {"step": 4, "tool": "CapCut (manual)", "purpose_pt": "...", "purpose_en": "...", "priority": "optional"}
  ]
}`;

  let pkg;
  try {
    const raw = await callVertex(systemPrompt, userPrompt);
    pkg = parsePackage(raw);
  } catch (e) {
    throw new Error(`Vertex AI generation failed: ${e.message}`);
  }

  const summary = `✅ Package generated — ${pkg.meta?.topic_pt || topic}

🎭 ${numObjects} character(s): ${objects.join(", ")}
🏷️  Niche: ${niche} | Tone: ${tone} | Duration: ${duration}s
🌎 Bilingual: PT-BR + EN
🤖 Provider: vertex (${VERTEX_MODEL})

📦 Package includes:
   • ${numObjects} character scripts with AI prompts
   • Full caption timeline (PT + EN)
   • Post copy with ${pkg.post_copy?.hashtags_pt?.length || 25} PT hashtags + ${pkg.post_copy?.hashtags_en?.length || 20} EN hashtags
   • ${pkg.variations?.length ?? 3} variations
   • Production stack guide

→ Call export_artifacts to get HTML dashboard + installable skill.`;

  return {
    content: [{ type: "text", text: summary }],
    package: pkg,
    result: { provider_used: `vertex/${VERTEX_MODEL}` },
  };
}
