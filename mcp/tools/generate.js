/**
 * ViralObj — generate.js
 * Generates complete Talking Object production package:
 * scene script, AI prompts, voice script, captions, post copy, hashtags, variations
 */

import Anthropic from "@anthropic-ai/sdk";
import { loadNicheData } from "./niches.js";

const client = new Anthropic();

const DEFAULT_PROVIDER_ORDER = ["anthropic", "openai", "gemini"];

function getProviderOrder(provider = "auto") {
  if (provider && provider !== "auto") {
    return [provider];
  }

  const envOrder = (process.env.VIRALOBJ_PROVIDER_ORDER || "")
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  const valid = envOrder.filter((p) => DEFAULT_PROVIDER_ORDER.includes(p));
  return valid.length ? valid : DEFAULT_PROVIDER_ORDER;
}

async function callAnthropic(systemPrompt, userPrompt) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }

  const response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content?.[0]?.text?.trim() || "";
}

async function callOpenAI(systemPrompt, userPrompt) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 0.7,
      max_completion_tokens: 8000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || "OpenAI request failed");
  }

  const text = json?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("OpenAI returned empty content");
  }

  return text.trim();
}

async function callGemini(systemPrompt, userPrompt) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || "Gemini request failed");
  }

  const text = json?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text)
    .filter(Boolean)
    .join("\n");

  if (!text) {
    throw new Error("Gemini returned empty content");
  }

  return text.trim();
}

function parsePackage(raw) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
}

async function generateWithProviderOrder(providerOrder, systemPrompt, userPrompt) {
  const errors = [];

  for (const provider of providerOrder) {
    try {
      let raw;
      if (provider === "anthropic") {
        raw = await callAnthropic(systemPrompt, userPrompt);
      } else if (provider === "openai") {
        raw = await callOpenAI(systemPrompt, userPrompt);
      } else if (provider === "gemini") {
        raw = await callGemini(systemPrompt, userPrompt);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      const pkg = parsePackage(raw);
      return { pkg, provider };
    } catch (error) {
      errors.push(`${provider}: ${error.message}`);
    }
  }

  throw new Error(`All providers failed -> ${errors.join(" | ")}`);
}

export async function generatePackage({
  niche,
  objects,
  topic,
  tone = "angry",
  duration = 30,
  lang = "both",
  analysis = null,
  provider = "auto",
}) {
  const nicheData = await loadNicheData(niche);
  const numObjects = objects.length;
  const secsPerObject = Math.floor(duration / numObjects);

  // ── Build context from real analysis if available ──────────────────────
  const analysisContext = analysis
    ? `\n\nREAL VIDEO ANALYSIS (use as reference for style/tone/visuals):\n${JSON.stringify(analysis, null, 2)}`
    : "";

  const systemPrompt = `You are ViralObj's content generation engine (viralobj.com).
You create viral Talking Object reels — animated 3D objects (Pixar/Disney style) that speak in first person.
You generate bilingual packages (Portuguese + English) with full production detail.
Return ONLY valid JSON. No markdown. No extra text.${analysisContext}`;

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

Return this exact JSON structure:
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
      "ai_prompt_midjourney": "detailed Midjourney/DALL-E prompt in English for this character, 9:16 vertical, Pixar 3D style",
      "ai_prompt_kling": "Kling AI / Runway animation prompt in English for body movement"
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
    {"step": 1, "tool": "Midjourney v6", "purpose_pt": "...", "purpose_en": "...", "priority": "essential"},
    {"step": 2, "tool": "ElevenLabs", "purpose_pt": "...", "purpose_en": "...", "priority": "essential"},
    {"step": 3, "tool": "HeyGen", "purpose_pt": "...", "purpose_en": "...", "priority": "essential"},
    {"step": 4, "tool": "CapCut", "purpose_pt": "...", "purpose_en": "...", "priority": "essential"}
  ]
}`;

  const providerOrder = getProviderOrder(provider);

  let pkg;
  let selectedProvider;
  try {
    const generated = await generateWithProviderOrder(
      providerOrder,
      systemPrompt,
      userPrompt
    );
    pkg = generated.pkg;
    selectedProvider = generated.provider;
  } catch (e) {
    throw new Error(`Failed to parse package: ${e.message}`);
  }

  const summary = `✅ Package generated — ${pkg.meta?.topic_pt || topic}

🎭 ${numObjects} character(s): ${objects.join(", ")}
🏷️  Niche: ${niche} | Tone: ${tone} | Duration: ${duration}s
🌎 Bilingual: PT-BR + EN
🤖 Provider: ${selectedProvider}

📦 Package includes:
   • ${numObjects} character scripts with AI prompts
   • Full caption timeline (PT + EN)
   • Post copy with ${pkg.post_copy?.hashtags_pt?.length || 25} PT hashtags + ${pkg.post_copy?.hashtags_en?.length || 20} EN hashtags
   • 3 variations
   • Production stack guide

→ Call export_artifacts to get HTML dashboard + installable skill.`;

  return {
    content: [{ type: "text", text: summary }],
    package: pkg,
  };
}
