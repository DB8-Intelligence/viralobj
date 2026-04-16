/**
 * webapp/lib/generator.ts
 * Multi-provider LLM router for Talking Object reel package generation.
 * Mirrors mcp/tools/generate.js but standalone (no Node-specific file I/O).
 */

import Anthropic from "@anthropic-ai/sdk";
import { NICHES } from "./niches-data";
import { generateObjectBible } from "./viral-objects/object-bible.generator";
import { buildSceneBlueprint, SceneBlueprint } from "./viral-objects/scene-blueprint";
import { normalizeTone } from "./viral-objects/normalize-tone";
import { buildSceneImagePromptPack } from "./viral-objects/image-prompt-pack";

const SCENE_TYPES: SceneBlueprint["sceneType"][] = ["intro", "dialogue", "reaction", "cta"];

const DEFAULT_ORDER = ["anthropic", "openai", "gemini"] as const;
type ProviderName = (typeof DEFAULT_ORDER)[number];

export interface GenerateInput {
  niche: string;
  objects: string[];
  topic: string;
  tone?: string;
  duration?: number;
  lang?: "pt" | "en" | "both";
  provider?: "auto" | ProviderName;
}

function resolveProviderOrder(requested: string | undefined): ProviderName[] {
  if (!requested || requested === "auto") {
    const envOrder = process.env.VIRALOBJ_PROVIDER_ORDER;
    if (envOrder) {
      const parsed = envOrder
        .split(",")
        .map((p) => p.trim().toLowerCase())
        .filter((p): p is ProviderName =>
          DEFAULT_ORDER.includes(p as ProviderName)
        );
      if (parsed.length) return parsed;
    }
    return [...DEFAULT_ORDER];
  }
  if (DEFAULT_ORDER.includes(requested as ProviderName)) {
    return [requested as ProviderName];
  }
  return [...DEFAULT_ORDER];
}

function buildPrompts(input: GenerateInput): { system: string; user: string } {
  const {
    niche,
    objects,
    topic,
    tone = "angry",
    duration = 30,
    lang = "both",
  } = input;
  const numObjects = objects.length;
  const secsPerObject = Math.floor(duration / Math.max(1, numObjects));

  const nicheData = NICHES.find((n) => n.id === niche) ?? {
    id: niche,
    label: niche,
    default_format: "A",
    tone,
    description: "",
  };

  const system = `You are ViralObj's content generation engine (viralobj.com).
You create viral Talking Object reels — animated 3D objects (Pixar/Disney style) that speak in first person.
You generate bilingual packages (Portuguese + English) with full production detail.
Return ONLY valid JSON. No markdown. No extra text.`;

  const user = `Generate a complete Talking Object production package.

INPUTS:
- Niche: ${niche}
- Objects: ${objects.join(", ")}
- Topic: ${topic}
- Tone: ${tone}
- Duration: ${duration}s total (~${secsPerObject}s per object)
- Language output: ${lang}
- Objects per reel: ${numObjects}

NICHE CONTEXT: ${JSON.stringify(nicheData)}

Return this EXACT JSON structure (no markdown, no extra text):
{
  "meta": {
    "niche": "${niche}",
    "topic_pt": "topic in PT",
    "topic_en": "topic in EN",
    "tone": "${tone}",
    "duration": ${duration},
    "format": "format id A-W"
  },
  "characters": [
    {
      "id": 1,
      "name_pt": "Object name in PT",
      "name_en": "Object name in EN",
      "emoji": "relevant emoji",
      "personality": "personality trait",
      "expression_arc": ["angry", "furious"],
      "voice_script_pt": "First-person monologue in PT (~${secsPerObject}s)",
      "voice_script_en": "First-person monologue in EN",
      "ai_prompt_midjourney": "FLUX/Midjourney prompt for Pixar 3D character, 9:16",
      "timestamp_start": "0s",
      "timestamp_end": "${secsPerObject}s"
    }
  ],
  "post_copy": {
    "caption_pt": "Full Instagram caption in PT",
    "caption_en": "Full Instagram caption in EN",
    "hashtags_pt": ["#hashtag1", "..."],
    "hashtags_en": ["#hashtag1", "..."]
  }
}

Create ${numObjects} character(s), one per object in the list above.`;

  return { system, user };
}

const PROVIDER_TIMEOUT_MS = 20000;

/**
 * Defensive JSON parser: scans for the first balanced {...} block by tracking
 * brace depth while skipping strings. Handles prose before/after + nested objects.
 */
function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    // fall through to scanning
  }

  const start = raw.indexOf("{");
  if (start < 0) throw new Error("No JSON object found in response");

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return JSON.parse(raw.slice(start, i + 1));
      }
    }
  }
  throw new Error("Unbalanced JSON braces in response");
}

async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fn(ctrl.signal);
  } catch (e) {
    if (ctrl.signal.aborted) {
      throw new Error(`${label} timeout after ${ms}ms`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropic(system: string, user: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not configured");
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return withTimeout(
    async (signal) => {
      const res = await client.messages.create(
        {
          model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
          max_tokens: 8000,
          system,
          messages: [
            { role: "user", content: user },
            // Prefill forces JSON-only output
            { role: "assistant", content: "{" },
          ],
        },
        { signal }
      );
      const text = res.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      return ("{" + text).trim();
    },
    PROVIDER_TIMEOUT_MS,
    "anthropic"
  );
}

async function callOpenAI(system: string, user: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  return withTimeout(
    async (signal) => {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          max_tokens: 8000,
          response_format: { type: "json_object" },
        }),
        signal,
      });
      if (!res.ok) {
        throw new Error(`OpenAI HTTP ${res.status}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() ?? "";
    },
    PROVIDER_TIMEOUT_MS,
    "openai"
  );
}

async function callGemini(system: string, user: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  return withTimeout(
    async (signal) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8000,
          },
        }),
        signal,
      });
      if (!res.ok) {
        throw new Error(`Gemini HTTP ${res.status}`);
      }
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    },
    PROVIDER_TIMEOUT_MS,
    "gemini"
  );
}

export class ProviderChainError extends Error {
  constructor(public readonly errors: string[]) {
    super("All LLM providers failed");
    this.name = "ProviderChainError";
  }
}

export async function generatePackage(input: GenerateInput) {
  const { system, user } = buildPrompts(input);
  const order = resolveProviderOrder(input.provider);
  const errors: string[] = [];

  for (const provider of order) {
    try {
      let raw: string;
      if (provider === "anthropic") raw = await callAnthropic(system, user);
      else if (provider === "openai") raw = await callOpenAI(system, user);
      else if (provider === "gemini") raw = await callGemini(system, user);
      else throw new Error(`Unknown provider: ${provider}`);

      const pkg = parseJson(raw) as Record<string, unknown>;
      const tone = normalizeTone(input.tone);
      const object_bibles = input.objects.map((obj) =>
        generateObjectBible({ object: obj, niche: input.niche, tone })
      );
      const scene_blueprints = object_bibles.map((bible) => ({
        objectId: bible.id,
        scenes: SCENE_TYPES.map((sceneType) =>
          buildSceneBlueprint({
            objectId: bible.id,
            sceneType,
            topic: input.topic,
            tone,
            niche: input.niche,
          })
        ),
      }));
      const scene_image_prompts = buildSceneImagePromptPack({
        objectBibles: object_bibles,
        sceneBlueprints: scene_blueprints,
      });

      // Map the LLM-produced character voice script to each sceneId so the audio
      // step uses the real first-person monologue, not the technical scene.action.
      const scene_texts: Record<string, string> = {};
      const characters =
        (pkg as { characters?: Array<Record<string, unknown>> }).characters ?? [];
      const preferredLang = input.lang === "en" ? "en" : "pt";
      object_bibles.forEach((bible, idx) => {
        const char = characters[idx] ?? {};
        const primary = char[`voice_script_${preferredLang}`];
        const secondary = char[`voice_script_${preferredLang === "pt" ? "en" : "pt"}`];
        const script = (typeof primary === "string" && primary) ||
          (typeof secondary === "string" && secondary) || "";
        if (!script.trim()) return;
        const sentences = script.trim().split(/(?<=[.!?…])\s+/).filter(Boolean);
        const group = scene_blueprints.find((g) => g.objectId === bible.id);
        if (!group) return;
        group.scenes.forEach((scene, sceneIdx) => {
          const text =
            sentences[sceneIdx] ??
            sentences[sceneIdx % Math.max(sentences.length, 1)] ??
            script;
          scene_texts[scene.sceneId] = text;
        });
      });

      return {
        ...pkg,
        provider_used: provider,
        object_bibles,
        scene_blueprints,
        scene_image_prompts,
        scene_texts,
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[generator] ${provider} failed:`, msg);
      errors.push(`${provider}: ${msg}`);
    }
  }

  throw new ProviderChainError(errors);
}
