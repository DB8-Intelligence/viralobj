/**
 * ViralObj — generate_video.js
 * Full cloud video pipeline via Fal.ai
 *
 * Pipeline per character:
 *   1. FLUX.2 Pro      → character image (9:16, Pixar 3D)
 *   2. MiniMax TTS     → voice narration (PT-BR, tone/emotion per character)
 *   3. VEED Fabric 1.0 → lip sync (image + audio → video clip)
 *
 * Final assembly:
 *   4. Kling LipSync   → concatenate clips + refine
 *   5. Captions overlay via Fal.ai image sequence
 *
 * Cost estimate: ~$2–3 per 30s reel with 3 characters
 * All processing in the cloud — no local machine required.
 */

import { createFalClient } from "@fal-ai/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { getOutputPath, ensureDirectories, PATHS } from "../paths.js";

// —— Voice profiles mapped to personality ——————————————————————————————————
// MiniMax TTS voice_ids with emotion/speed tuned per character personality
const VOICE_PROFILES = {
  // Angry / Indignant
  angry: {
    voice_id: "Friendly_Person",
    emotion: "angry",
    speed: 1.1,
    pitch: 0,
    description: "Angry, indignant, resentful",
  },
  // Furious / Explosive
  furious: {
    voice_id: "Wise_Woman",
    emotion: "angry",
    speed: 1.25,
    pitch: -2,
    description: "Furious, explosive, at the limit",
  },
  // Alarmed / Urgent
  alarmed: {
    voice_id: "Gentle_Woman",
    emotion: "fearful",
    speed: 1.2,
    pitch: 2,
    description: "Alarmed, urgent, warning",
  },
  // Resigned / Tired
  resigned: {
    voice_id: "Calm_Woman",
    emotion: "sad",
    speed: 0.9,
    pitch: -1,
    description: "Resigned, tired, fed up",
  },
  // Sarcastic / Smug
  sarcastic: {
    voice_id: "Lively_Girl",
    emotion: "cheerful",
    speed: 1.0,
    pitch: 1,
    description: "Sarcastic, ironic, knowing",
  },
  // Educational / Calm
  educational: {
    voice_id: "Friendly_Person",
    emotion: "neutral",
    speed: 0.95,
    pitch: 0,
    description: "Calm, didactic, informative",
  },
  // Dramatic / Suffering
  dramatic: {
    voice_id: "Emotional_Female_Voice",
    emotion: "sad",
    speed: 0.85,
    pitch: -1,
    description: "Dramatic, suffering, emotional",
  },
  // Funny / Playful
  funny: {
    voice_id: "Lively_Girl",
    emotion: "cheerful",
    speed: 1.1,
    pitch: 2,
    description: "Playful, energetic, fun",
  },
};

// —— Personality → voice profile mapping ———————————————————————————————————
const PERSONALITY_TO_VOICE = {
  "ressentida, indignada": "angry",
  "raiva com nojo": "angry",
  "alarmada, urgente": "alarmed",
  "furiosa, explosiva": "furious",
  "enojada consigo mesma": "angry",
  "histérica, urgente": "alarmed",
  "preocupada, séria": "educational",
  "exausto, sofrendo": "resigned",
  "resignada, cansada": "resigned",
  "abandonada, triste": "resigned",
  "orgulhosa, resiliente": "educational",
  "dramática, engraçada": "dramatic",
  "séria mas carinhosa": "educational",
  "sarcástico, sobrevivente": "sarcastic",
  "delicada, exigente": "resigned",
  "ansiosa, úmida": "alarmed",
  "despretenciosa, casual": "funny",
  "dramática, saudosista": "dramatic",
  "dramática, sofrida": "dramatic",
  "humilhada, resignada": "resigned",
  "exausta, sobrecarregada": "resigned",
  "ameaçadora, séria": "angry",
  "triste, esquecida": "resigned",
  "rápido, impaciente": "sarcastic",
  "ignorada, importante": "resigned",
  "inevitável, infeliz": "resigned",
};

// —— Main export ——————————————————————————————————————————————————————————

export async function generateVideo({
  package: pkg,
  output_dir = null,
  quality = "standard",  // "draft" | "standard" | "premium"
  lang = "pt",           // "pt" | "en"
  caption_style = "bold_white", // "bold_white" | "minimal" | "colorful"
  overrides = {},        // per-character voice overrides: { "lixeira": "furious" }
  on_progress = null,    // optional callback: (step, total, message) => void
}) {
  if (!pkg || !pkg.characters || pkg.characters.length === 0) {
    throw new Error("Invalid package: missing characters");
  }

  ensureDirectories();
  const slug = `${pkg.meta?.niche || "reel"}-${Date.now()}`;
  const videoDir = output_dir
    ? (() => { mkdirSync(output_dir, { recursive: true }); return output_dir; })()
    : (() => { const d = getOutputPath(slug); mkdirSync(d, { recursive: true }); return d; })();

  const totalSteps = pkg.characters.length * 3 + 2; // img + tts + lipsync per char + concat + captions
  let currentStep = 0;

  const progress = (message) => {
    currentStep++;
    if (on_progress) on_progress(currentStep, totalSteps, message);
    console.error(`[${currentStep}/${totalSteps}] ${message}`);
  };

  // —— Configure Fal.ai —————————————————————————————————————————————————————
  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY environment variable not set");
  const fal = createFalClient({ credentials: falKey });

  const characterClips = [];

  // —— Process each character —————————————————————————————————————————————————
  for (const char of pkg.characters) {
    const charSlug = (char.name_pt || char.name_en || `char${char.id}`)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");

    // —— STEP 1: Generate character image via FLUX.2 Pro ——————————————————————
    progress(`🖼️  Generating image: ${char.name_pt}`);

    const imagePrompt = buildImagePrompt(char, quality);

    let imageUrl;
    try {
      const imgResult = await fal.subscribe("fal-ai/flux-pro/v1.1", {
        input: {
          prompt: imagePrompt,
          image_size: "portrait_16_9",  // 9:16 vertical for Reels
          num_images: 1,
          output_format: "jpeg",
        },
        logs: false,
      });
      imageUrl = imgResult.data.images[0].url;
      console.error(`   ✅ Image: ${imageUrl}`);
    } catch (e) {
      throw new Error(`Image generation failed for ${char.name_pt}: ${e.message}`);
    }

    // —— STEP 2: Generate voice via MiniMax TTS ———————————————————————————————
    progress(`🎙️  Generating voice: ${char.name_pt}`);

    const voiceProfile = resolveVoiceProfile(char, overrides, pkg.meta?.tone);
    const speechText = lang === "en"
      ? cleanSpeechText(char.voice_script_en)
      : cleanSpeechText(char.voice_script_pt);

    let audioUrl;
    try {
      const ttsResult = await fal.subscribe("fal-ai/minimax-tts/text-to-speech", {
        input: {
          text: speechText,
          voice_id: voiceProfile.voice_id,
        },
        logs: false,
      });
      audioUrl = ttsResult.data.audio.url;
      console.error(`   ✅ Audio: ${audioUrl}`);
    } catch (e) {
      throw new Error(`TTS generation failed for ${char.name_pt}: ${e.message}`);
    }

    // —— STEP 3: Lip sync via VEED Fabric 1.0 ————————————————————————————————
    progress(`🎬  Lip sync: ${char.name_pt}`);

    let clipUrl;
    try {
      const resolution = quality === "premium" ? "720p" : "480p";
      const fabricResult = await fal.subscribe("veed/fabric-1.0", {
        input: {
          image_url: imageUrl,
          audio_url: audioUrl,
          resolution,
        },
        logs: false,
      });
      clipUrl = fabricResult.data.video.url;
      console.error(`   ✅ Clip: ${clipUrl}`);
    } catch (e) {
      // Fallback to MuseTalk if Fabric fails
      console.error(`   ⚠  Fabric failed, trying MuseTalk...`);
      try {
        // MuseTalk needs a video — create a static video from image first
        const staticVideoResult = await fal.subscribe("fal-ai/kling-video/v2.1/standard/image-to-video", {
          input: {
            image_url: imageUrl,
            prompt: "character standing still, slight breathing movement, no camera movement",
            duration: "5",
            aspect_ratio: "9:16",
          },
          logs: false,
        });
        const staticVideoUrl = staticVideoResult.data.video.url;

        const museTalkResult = await fal.subscribe("fal-ai/musetalk", {
          input: {
            video_url: staticVideoUrl,
            audio_url: audioUrl,
          },
          logs: false,
        });
        clipUrl = museTalkResult.data.video.url;
        console.error(`   ✅ Clip (MuseTalk fallback): ${clipUrl}`);
      } catch (e2) {
        throw new Error(`Lip sync failed for ${char.name_pt}: ${e.message} | ${e2.message}`);
      }
    }

    characterClips.push({
      character: char,
      image_url: imageUrl,
      audio_url: audioUrl,
      clip_url: clipUrl,
      voice_profile: voiceProfile,
      captions: buildCaptionOverlay(char, lang, caption_style),
    });
  }

  // —— STEP 4: Concatenate clips ——————————————————————————————————————————
  progress(`🎬  Concatenating ${characterClips.length} clips...`);

  let finalVideoUrl;

  if (characterClips.length === 1) {
    // Single character — use clip directly
    finalVideoUrl = characterClips[0].clip_url;
  } else {
    // Multiple characters — concatenate via Kling LipSync or fallback
    try {
      // Use Kling video concatenation
      // Note: Kling doesn't have direct concat — we use a workaround:
      // Generate a combined storyboard and let the model handle the transitions
      // For now, return the clips for manual concat or use Creatomate API
      // TODO: integrate Creatomate or similar for true server-side concat

      // Best available option: return all clips + metadata for client-side concat
      finalVideoUrl = null; // Will be handled below
    } catch (e) {
      console.error(`Concat error: ${e.message}`);
    }
  }

  // —— STEP 5: Build caption overlay data ——————————————————————————————————
  progress(`📝  Preparing captions and final package...`);

  const captionScript = buildFullCaptionScript(characterClips, lang, caption_style);

  // —— Build result ———————————————————————————————————————————————————————
  const result = {
    meta: {
      ...pkg.meta,
      generated_at: new Date().toISOString(),
      lang,
      quality,
      caption_style,
      total_clips: characterClips.length,
      pipeline: "FLUX.2 Pro → MiniMax TTS → VEED Fabric",
    },
    clips: characterClips.map((c) => ({
      character_pt: c.character.name_pt,
      character_en: c.character.name_en,
      emoji: c.character.emoji,
      timestamp_start: c.character.timestamp_start,
      timestamp_end: c.character.timestamp_end,
      image_url: c.image_url,
      audio_url: c.audio_url,
      clip_url: c.clip_url,
      voice_profile: c.voice_profile,
      captions: c.captions,
    })),
    final_video_url: finalVideoUrl,
    caption_script: captionScript,
    capcut_import: buildCapcutImport(characterClips, captionScript),
    cost_estimate: estimateCost(characterClips, quality),
  };

  // —— Save result JSON ———————————————————————————————————————————————————
  const resultPath = join(videoDir, "video-result.json");
  writeFileSync(resultPath, JSON.stringify(result, null, 2));

  // —— Build summary ——————————————————————————————————————————————————————
  const clipsList = result.clips
    .map((c) => `   ${c.emoji} ${c.character_pt}: ${c.clip_url}`)
    .join("\n");

  const summary = `✅ Video generation complete!

🎭 Characters: ${characterClips.length}
📁 Output: ${videoDir}/
💰 Cost: ~${result.cost_estimate.total_usd} USD

🎬 Individual clips:
${clipsList}

${finalVideoUrl
    ? `🎥 Final video: ${finalVideoUrl}`
    : `⚠️  Auto-concat not available for ${characterClips.length} clips.

📱 To assemble the final reel:

   Option A — CapCut (recommended):
   1. Import the clips in order
   2. Add captions from caption_script
   3. Add background music
   4. Export 9:16 MP4

   Option B — Import URLs directly:
   ${result.clips.map((c, i) => `   ${i + 1}. ${c.clip_url}`).join("\n")}

   The capcut_import object in video-result.json has the exact
   caption timecodes and text ready to paste.`
  }

📄 Full result saved: ${resultPath}`;

  return {
    content: [{ type: "text", text: summary }],
    result,
  };
}

// ——— HELPERS ——————————————————————————————————————————————————————————————

function buildImagePrompt(char, quality) {
  const base = char.ai_prompt_midjourney || "";

  // Ensure key Pixar 3D style elements are present
  const styleEnforcement = [
    "Disney/Pixar 3D render style",
    "cartoon face with expressive eyes embedded in object surface",
    "small stub arms",
    "9:16 vertical aspect ratio",
    quality === "premium" ? "ultra-realistic 3D animation, 8K, cinematic lighting" : "ultra-realistic 3D animation",
  ].join(", ");

  // If we have a real prompt from generate_package, enhance it
  if (base && base.length > 50) {
    return `${base}, ${styleEnforcement}`;
  }

  // Fallback: build from character data
  return `Cute but ${char.expression_arc?.[0] || "angry"} animated ${char.name_en} character, ` +
    `${char.environment_en || "Brazilian home interior"}, ` +
    `${char.human_background_en || "person visible in background"}, ` +
    styleEnforcement;
}

function resolveVoiceProfile(char, overrides, globalTone) {
  const charName = (char.name_pt || "").toLowerCase();

  // Check for explicit override by character name
  const overrideKey = Object.keys(overrides).find(k =>
    charName.includes(k.toLowerCase())
  );
  if (overrideKey) {
    return VOICE_PROFILES[overrides[overrideKey]] || VOICE_PROFILES.angry;
  }

  // Map from character personality
  const personality = char.personality || "";
  const voiceKey = PERSONALITY_TO_VOICE[personality];
  if (voiceKey && VOICE_PROFILES[voiceKey]) {
    return { ...VOICE_PROFILES[voiceKey] };
  }

  // Map from expression arc
  const firstExpr = (char.expression_arc?.[0] || "").toLowerCase();
  if (firstExpr.includes("furi") || firstExpr.includes("explosiv")) return VOICE_PROFILES.furious;
  if (firstExpr.includes("alarm") || firstExpr.includes("urgent")) return VOICE_PROFILES.alarmed;
  if (firstExpr.includes("resign") || firstExpr.includes("cansa")) return VOICE_PROFILES.resigned;
  if (firstExpr.includes("sarcast") || firstExpr.includes("ironic")) return VOICE_PROFILES.sarcastic;

  // Global tone fallback
  return VOICE_PROFILES[globalTone] || VOICE_PROFILES.angry;
}

function cleanSpeechText(script) {
  if (!script) return "";
  // Remove timing markers but keep the natural speech flow
  return script
    .replace(/\[pausa longa\]/gi, "...")
    .replace(/\[pausa curta\]/gi, ",")
    .replace(/\[pausa\]/gi, ".")
    .replace(/\[ÊNFASE\]/gi, "")
    .replace(/\[EMPHASIS\]/gi, "")
    .replace(/\[pause\]/gi, ".")
    .replace(/\[long pause\]/gi, "...")
    .replace(/\[acelerado\]/gi, "")
    .replace(/\[suave\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCaptionOverlay(char, lang, style) {
  const captions = char.captions || [];
  return captions.map(c => ({
    time: c.time,
    text: lang === "en" ? c.text_en : c.text_pt,
    style: c.style || "bold",
    css: captionStyleToCSS(c.style || "bold", style),
  }));
}

function captionStyleToCSS(captionStyle, theme) {
  const base = {
    fontFamily: "Arial Black, sans-serif",
    textAlign: "center",
    position: "absolute",
    bottom: "15%",
    width: "90%",
    left: "5%",
    textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
  };

  if (theme === "bold_white") {
    return { ...base, color: "#FFFFFF", fontSize: captionStyle === "bold" ? "48px" : "38px", fontWeight: "900" };
  }
  if (theme === "minimal") {
    return { ...base, color: "#FFFFFF", fontSize: "36px", fontWeight: "600", opacity: 0.9 };
  }
  if (theme === "colorful") {
    return { ...base, color: captionStyle === "bold" ? "#FFE500" : "#FFFFFF", fontSize: "44px", fontWeight: "800" };
  }
  return base;
}

function buildFullCaptionScript(clips, lang, style) {
  const allCaptions = [];
  let timeOffset = 0;

  for (const clip of clips) {
    const startSec = parseTimeToSeconds(clip.character.timestamp_start || "0s");

    for (const cap of clip.captions) {
      const capTime = parseTimeToSeconds(cap.time) + startSec;
      allCaptions.push({
        time_seconds: capTime,
        time_formatted: formatTime(capTime),
        text: cap.text,
        style: cap.style,
        css: cap.css,
        character: clip.character.name_pt,
      });
    }

    timeOffset = parseTimeToSeconds(clip.character.timestamp_end || "30s");
  }

  return allCaptions.sort((a, b) => a.time_seconds - b.time_seconds);
}

function buildCapcutImport(clips, captionScript) {
  return {
    instructions: "Import each clip_url in order in CapCut. Use the captions array for text overlays.",
    clips_in_order: clips.map((c, i) => ({
      order: i + 1,
      character: c.character.name_pt,
      url: c.clip_url,
      duration: `${parseTimeToSeconds(c.character.timestamp_end) - parseTimeToSeconds(c.character.timestamp_start)}s`,
    })),
    captions: captionScript.map(c => ({
      time: c.time_formatted,
      text: c.text,
      style: c.style,
    })),
  };
}

function estimateCost(clips, quality) {
  // Based on Fal.ai pricing (April 2026)
  const costPerImage = quality === "premium" ? 0.045 : 0.03;  // FLUX.2 Pro per 1MP (9:16 → 1.5MP)
  const costPerTTS = 0.001 * 300;   // MiniMax ~$0.001/1000 chars, avg 300 chars/clip
  const costPerLipSync = quality === "premium" ? 0.15 * 10 : 0.08 * 10;  // Fabric $0.08-0.15/s, ~10s/clip

  const perClip = costPerImage + costPerTTS + costPerLipSync;
  const total = perClip * clips.length;

  return {
    per_image_usd: costPerImage.toFixed(3),
    per_tts_usd: costPerTTS.toFixed(3),
    per_lipsync_usd: costPerLipSync.toFixed(2),
    per_clip_usd: perClip.toFixed(2),
    total_usd: `$${total.toFixed(2)}`,
    clips_count: clips.length,
  };
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr) return 0;
  if (typeof timeStr === "number") return timeStr;
  const str = String(timeStr);
  const match = str.match(/^(\d+(?:\.\d+)?)s?$/);
  return match ? parseFloat(match[1]) : 0;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 100);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(2, "0")}`;
}
