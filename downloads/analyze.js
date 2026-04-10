/**
 * ViralObj — analyze.js
 * Extracts frames from video, detects Talking Object characters,
 * returns structured analysis for package generation.
 */

import { execSync, exec } from "child_process";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { join, basename, dirname } from "path";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { getFramesPath, ensureDirectories } from "../paths.js";

const client = new Anthropic();

export async function analyzeVideo({ video_path, lang = "pt" }) {
  // —— 1. Validate file ————————————————————————————————————————————————————
  if (!existsSync(video_path)) {
    throw new Error(`Video file not found: ${video_path}`);
  }

  // —— 2. Get video metadata ———————————————————————————————————————————————
  let duration = 30;
  try {
    const meta = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${video_path}"`,
      { encoding: "utf8" }
    ).trim();
    duration = parseFloat(meta) || 30;
  } catch (e) {
    console.error("ffprobe failed, using default duration 30s");
  }

  // —— 3. Extract frames ———————————————————————————————————————————————————
  ensureDirectories();
  const videoSlug = `${basename(video_path, ".mp4")}_${Date.now()}`;
  const framesDir = getFramesPath(videoSlug);
  mkdirSync(framesDir, { recursive: true });

  const numFrames = Math.min(14, Math.max(8, Math.floor(duration / 2)));
  const timestamps = Array.from({ length: numFrames }, (_, i) =>
    ((duration * i) / (numFrames - 1)).toFixed(2)
  );

  const extractedFrames = [];
  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    const framePath = join(framesDir, `frame_${String(i + 1).padStart(2, "0")}.jpg`);
    try {
      execSync(
        `ffmpeg -ss ${ts} -i "${video_path}" -vframes 1 -q:v 2 "${framePath}" -y -loglevel quiet`,
        { timeout: 10000 }
      );
      if (existsSync(framePath)) {
        extractedFrames.push({ path: framePath, timestamp: ts });
      }
    } catch (e) {
      console.error(`Frame extraction failed at ${ts}s`);
    }
  }

  if (extractedFrames.length === 0) {
    throw new Error("No frames could be extracted. Is ffmpeg installed?");
  }

  // —— 4. Analyze frames with Claude Vision ———————————————————————————————
  const imageContents = extractedFrames.map((f) => {
    const imageData = readFileSync(f.path).toString("base64");
    return {
      type: "image",
      source: { type: "base64", media_type: "image/jpeg", data: imageData },
    };
  });

  const systemPrompt = lang === "en"
    ? `You are a Talking Objects content analyst for ViralObj (viralobj.com).
       Analyze video frames and identify animated 3D characters (objects with faces).
       Return ONLY valid JSON, no markdown, no extra text.`
    : `Você é analista de conteúdo Talking Objects para o ViralObj (viralobj.com).
       Analise frames de vídeo e identifique personagens 3D animados (objetos com rosto).
       Retorne APENAS JSON válido, sem markdown, sem texto extra.`;

  const userPrompt = lang === "en"
    ? `Analyze these ${extractedFrames.length} video frames extracted from a social media reel.

Identify ALL animated Talking Object characters (objects with cartoon faces and expressions).
For each character, extract the visible caption text.

Return this exact JSON structure:
{
  "niche": "string (casa/plants/finance/fitness/pets/health/cooking/nature/parenting/mental-health)",
  "format": "string (multi-object/single-character/tutorial/revelation)",
  "duration_seconds": ${duration},
  "tone": "string (angry/funny/educational/dramatic/cute/sarcastic)",
  "source_account": "string (account watermark if visible, else null)",
  "characters": [
    {
      "name": "object name in English",
      "name_pt": "object name in Portuguese",
      "timestamp_start": "Xs",
      "timestamp_end": "Xs",
      "environment": "scene description",
      "expression_arc": ["expression1", "expression2"],
      "captions_detected": ["caption text 1", "caption text 2"],
      "inferred_speech": "what the object is likely saying",
      "error_denounced": "what mistake/issue the object is complaining about",
      "human_character": "description of human in background (if any)"
    }
  ],
  "visual_style": {
    "render": "3D Pixar/Disney or other",
    "lighting": "golden hour/cold/warm/neutral",
    "background_type": "kitchen/bathroom/garden/etc"
  },
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1"]
}`
    : `Analise estes ${extractedFrames.length} frames extraídos de um reel de rede social.

Identifique TODOS os personagens Talking Object animados (objetos com rostos de cartoon e expressões).
Para cada personagem, extraia o texto das legendas visíveis.

Retorne exatamente esta estrutura JSON:
{
  "niche": "string (casa/plantas/financeiro/fitness/pets/saude/culinaria/natureza/maternidade/saude-mental)",
  "format": "string (multi-objeto/personagem-unico/tutorial/revelacao)",
  "duration_seconds": ${duration},
  "tone": "string (brava/engraçada/educativa/dramatica/fofa/sarcastica)",
  "source_account": "string (conta da watermark se visível, senão null)",
  "characters": [
    {
      "name": "nome do objeto em inglês",
      "name_pt": "nome do objeto em português",
      "timestamp_start": "Xs",
      "timestamp_end": "Xs",
      "environment": "descrição do cenário",
      "expression_arc": ["expressão1", "expressão2"],
      "captions_detected": ["texto legenda 1", "texto legenda 2"],
      "inferred_speech": "o que o objeto provavelmente está dizendo",
      "error_denounced": "qual erro/problema o objeto está denunciando",
      "human_character": "descrição do humano ao fundo (se houver)"
    }
  ],
  "visual_style": {
    "render": "3D Pixar/Disney ou outro",
    "lighting": "golden hour/fria/quente/neutra",
    "background_type": "cozinha/banheiro/jardim/etc"
  },
  "strengths": ["ponto forte 1", "ponto forte 2"],
  "improvements": ["melhoria 1"]
}`;

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          ...imageContents,
          { type: "text", text: userPrompt },
        ],
      },
    ],
  });

  // —— 5. Parse response ———————————————————————————————————————————————————
  let analysis;
  try {
    const raw = response.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    analysis = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch (e) {
    throw new Error(`Failed to parse Claude analysis: ${e.message}`);
  }

  // —— 6. Add metadata ————————————————————————————————————————————————————
  analysis.meta = {
    video_path,
    frames_extracted: extractedFrames.length,
    frames_dir: framesDir,
    analyzed_at: new Date().toISOString(),
    lang,
  };

  const summary = lang === "en"
    ? `✅ Analysis complete\n\n` +
      `📹 Video: ${basename(video_path)} (${duration.toFixed(0)}s)\n` +
      `🎭 Format: ${analysis.format}\n` +
      `🏷️ Niche: ${analysis.niche}\n` +
      `🎪 Characters found: ${analysis.characters?.length || 0}\n` +
      `${analysis.characters?.map((c, i) => `  ${i + 1}. ${c.name_pt || c.name} — "${(c.captions_detected || []).join('" / "')}"`)?.join("\n") || ""}\n\n` +
      `Ready to call generate_package with this analysis.`
    : `✅ Análise concluída\n\n` +
      `📹 Vídeo: ${basename(video_path)} (${duration.toFixed(0)}s)\n` +
      `🎭 Formato: ${analysis.format}\n` +
      `🏷️ Nicho: ${analysis.niche}\n` +
      `🎪 Personagens encontrados: ${analysis.characters?.length || 0}\n` +
      `${analysis.characters?.map((c, i) => `  ${i + 1}. ${c.name_pt || c.name} — "${(c.captions_detected || []).join('" / "')}"`)?.join("\n") || ""}\n\n` +
      `Pronto para chamar generate_package com esta análise.`;

  return {
    content: [
      { type: "text", text: summary },
      { type: "text", text: JSON.stringify(analysis, null, 2) },
    ],
    analysis,
  };
}
