/**
 * ViralObj — generate_video.js
 * Full cloud video pipeline via Fal.ai
 *
 * Pipeline A — FLUX (default):
 *   1. FLUX Pro v1.1    -> character image (9:16, Pixar 3D)
 *   2. MiniMax TTS      -> voice narration (PT-BR, tone/emotion per character)
 *   3. VEED Fabric 1.0  -> lip sync (image + audio -> video clip)
 *   4. ffmpeg concat    -> concatenate clips (fallback: individual clips)
 *
 * Pipeline B — Veo (organic movement, best for Q/R/S/O formats):
 *   1. Google Veo 2     -> video directly from prompt (9:16, organic motion)
 *   2. MiniMax TTS      -> voice narration
 *   3. ffmpeg merge     -> combine video + audio
 *
 * Cost estimate: ~$2-4 per 30s reel with 3 characters
 */

import { createFalClient } from "@fal-ai/client";
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { getOutputPath, ensureDirectories, PATHS } from "../paths.js";

// -- Voice profiles mapped to personality -----------------------------------------
const VOICE_PROFILES = {
  angry: {
    voice_id: "Friendly_Person", emotion: "angry", speed: 1.1, pitch: 0,
    description: "Angry, indignant, resentful",
  },
  furious: {
    voice_id: "Wise_Woman", emotion: "angry", speed: 1.25, pitch: -2,
    description: "Furious, explosive, at the limit",
  },
  alarmed: {
    voice_id: "Gentle_Woman", emotion: "fearful", speed: 1.2, pitch: 2,
    description: "Alarmed, urgent, warning",
  },
  resigned: {
    voice_id: "Calm_Woman", emotion: "sad", speed: 0.9, pitch: -1,
    description: "Resigned, tired, fed up",
  },
  sarcastic: {
    voice_id: "Lively_Girl", emotion: "cheerful", speed: 1.0, pitch: 1,
    description: "Sarcastic, ironic, knowing",
  },
  educational: {
    voice_id: "Friendly_Person", emotion: "neutral", speed: 0.95, pitch: 0,
    description: "Calm, didactic, informative",
  },
  dramatic: {
    voice_id: "Emotional_Female_Voice", emotion: "sad", speed: 0.85, pitch: -1,
    description: "Dramatic, suffering, emotional",
  },
  funny: {
    voice_id: "Lively_Girl", emotion: "cheerful", speed: 1.1, pitch: 2,
    description: "Playful, energetic, fun",
  },
  professional: {
    voice_id: "Friendly_Person", emotion: "neutral", speed: 1.0, pitch: 0,
    description: "Professional, authoritative, confident",
  },
};

// -- Personality -> voice profile mapping -----------------------------------------
const PERSONALITY_TO_VOICE = {
  "ressentida, indignada": "angry",
  "raiva com nojo": "angry",
  "alarmada, urgente": "alarmed",
  "furiosa, explosiva": "furious",
  "enojada consigo mesma": "angry",
  "hist\u00e9rica, urgente": "alarmed",
  "preocupada, s\u00e9ria": "educational",
  "exausto, sofrendo": "resigned",
  "resignada, cansada": "resigned",
  "abandonada, triste": "resigned",
  "orgulhosa, resiliente": "educational",
  "dram\u00e1tica, engra\u00e7ada": "dramatic",
  "s\u00e9ria mas carinhosa": "educational",
  "sarc\u00e1stico, sobrevivente": "sarcastic",
  "delicada, exigente": "resigned",
  "ansiosa, \u00famida": "alarmed",
  "despretenciosa, casual": "funny",
  "dram\u00e1tica, saudosista": "dramatic",
  "dram\u00e1tica, sofrida": "dramatic",
  "humilhada, resignada": "resigned",
  "exausta, sobrecarregada": "resigned",
  "amea\u00e7adora, s\u00e9ria": "angry",
  "triste, esquecida": "resigned",
  "r\u00e1pido, impaciente": "sarcastic",
  "ignorada, importante": "resigned",
  "inevit\u00e1vel, infeliz": "resigned",
  "confiante, cient\u00edfica, positiva": "professional",
  "energ\u00e9tica, expert em cora\u00e7\u00e3o": "professional",
  "delicada, especialista em pele": "professional",
};

// -- Main export ------------------------------------------------------------------

export async function generateVideo({
  package: pkg,
  output_dir = null,
  quality = "standard",
  lang = "pt",
  pipeline = "flux",
  caption_style = "bold_white",
  overrides = {},
  on_progress = null,
}) {
  if (!pkg || !pkg.characters || pkg.characters.length === 0) {
    throw new Error("Invalid package: missing characters");
  }

  ensureDirectories();
  const slug = `${pkg.meta?.niche || "reel"}-${Date.now()}`;
  const videoDir = output_dir
    ? (() => { mkdirSync(output_dir, { recursive: true }); return output_dir; })()
    : (() => { const d = getOutputPath(slug); mkdirSync(d, { recursive: true }); return d; })();

  const useVeo = pipeline === "veo";
  const stepsPerChar = useVeo ? 2 : 3;
  const totalSteps = pkg.characters.length * stepsPerChar + 2;
  let currentStep = 0;

  const progress = (message) => {
    currentStep++;
    if (on_progress) on_progress(currentStep, totalSteps, message);
    console.error(`[${currentStep}/${totalSteps}] ${message}`);
  };

  const falKey = process.env.FAL_KEY;
  if (!falKey) throw new Error("FAL_KEY environment variable not set");
  const fal = createFalClient({ credentials: falKey });

  const characterClips = [];

  // -- Process each character -----------------------------------------------------
  for (const char of pkg.characters) {
    const voiceProfile = resolveVoiceProfile(char, overrides, pkg.meta?.tone);
    const speechText = lang === "en"
      ? cleanSpeechText(char.voice_script_en)
      : cleanSpeechText(char.voice_script_pt);

    let imageUrl = null;
    let audioUrl = null;
    let clipUrl = null;

    if (useVeo) {
      // === VEO PIPELINE: prompt -> video directly ================================
      progress(`\uD83C\uDFAC  Generating Veo video: ${char.name_pt}`);

      const veoPrompt = buildVeoPrompt(char, quality);
      try {
        const veoResult = await fal.subscribe("fal-ai/veo2", {
          input: {
            prompt: veoPrompt,
            aspect_ratio: "9:16",
            duration: "8",
          },
          logs: false,
        });
        clipUrl = veoResult.data.video.url;
        console.error(`   \u2705 Veo video: ${clipUrl}`);
      } catch (e) {
        console.error(`   \u26A0  Veo failed (${e.message}), falling back to FLUX...`);
        const fluxResult = await runFluxPipeline(fal, char, speechText, voiceProfile, quality, progress);
        imageUrl = fluxResult.imageUrl;
        audioUrl = fluxResult.audioUrl;
        clipUrl = fluxResult.clipUrl;
      }

      // TTS for audio track (if Veo succeeded and we don't have audio yet)
      if (!audioUrl) {
        progress(`\uD83C\uDF99\uFE0F  Generating voice: ${char.name_pt}`);
        audioUrl = await generateTTS(fal, speechText, voiceProfile, char.name_pt);
      }

      // Merge Veo video + TTS audio via ffmpeg
      if (clipUrl && audioUrl && !clipUrl.endsWith(".mp4") && hasFfmpeg()) {
        try {
          const charSlug = sanitizeSlug(char);
          const mergedPath = join(videoDir, `${charSlug}-merged.mp4`);
          await downloadAndMergeAV(clipUrl, audioUrl, mergedPath);
          clipUrl = mergedPath;
          console.error(`   \u2705 Merged video+audio: ${mergedPath}`);
        } catch (e) {
          console.error(`   \u26A0  AV merge failed: ${e.message}`);
        }
      }
    } else {
      // === FLUX PIPELINE: image -> TTS -> lip sync ===============================
      const fluxResult = await runFluxPipeline(fal, char, speechText, voiceProfile, quality, progress);
      imageUrl = fluxResult.imageUrl;
      audioUrl = fluxResult.audioUrl;
      clipUrl = fluxResult.clipUrl;
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

  // -- STEP: Concatenate clips ----------------------------------------------------
  progress(`\uD83C\uDFAC  Concatenating ${characterClips.length} clips...`);

  let finalVideoUrl;
  if (characterClips.length === 1) {
    finalVideoUrl = characterClips[0].clip_url;
  } else {
    finalVideoUrl = await concatClips(characterClips, videoDir);
  }

  // -- STEP: Build caption overlay data -------------------------------------------
  progress(`\uD83D\uDCDD  Preparing captions and final package...`);

  const captionScript = buildFullCaptionScript(characterClips, lang, caption_style);
  const pipelineLabel = useVeo
    ? "Google Veo 2 + MiniMax TTS"
    : "FLUX Pro v1.1 \u2192 MiniMax TTS \u2192 VEED Fabric";

  // -- Build result ---------------------------------------------------------------
  const result = {
    meta: {
      ...pkg.meta,
      generated_at: new Date().toISOString(),
      lang,
      quality,
      pipeline,
      caption_style,
      total_clips: characterClips.length,
      pipeline_label: pipelineLabel,
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
    cost_estimate: estimateCost(characterClips, quality, useVeo),
  };

  const resultPath = join(videoDir, "video-result.json");
  writeFileSync(resultPath, JSON.stringify(result, null, 2));

  const clipsList = result.clips
    .map((c) => `   ${c.emoji} ${c.character_pt}: ${c.clip_url}`)
    .join("\n");

  const summary = `\u2705 Video generation complete!

\uD83C\uDFAD Characters: ${characterClips.length}
\uD83D\uDCC1 Output: ${videoDir}/
\uD83D\uDCB0 Cost: ~${result.cost_estimate.total_usd} USD
\uD83D\uDD27 Pipeline: ${pipelineLabel}

\uD83C\uDFAC Individual clips:
${clipsList}

${finalVideoUrl
    ? `\uD83C\uDFA5 Final video: ${finalVideoUrl}`
    : `\u26A0\uFE0F  Auto-concat not available (ffmpeg not found). ${characterClips.length} individual clips returned.

\uD83D\uDCF1 To assemble the final reel:

   Option A \u2014 CapCut (recommended):
   1. Import the clips in order
   2. Add captions from caption_script
   3. Add background music
   4. Export 9:16 MP4

   Option B \u2014 Import URLs directly:
   ${result.clips.map((c, i) => `   ${i + 1}. ${c.clip_url}`).join("\n")}

   The capcut_import object in video-result.json has the exact
   caption timecodes and text ready to paste.`
  }

\uD83D\uDCC4 Full result saved: ${resultPath}`;

  return {
    content: [{ type: "text", text: summary }],
    result,
  };
}

// === PIPELINE SUB-FUNCTIONS =====================================================

async function runFluxPipeline(fal, char, speechText, voiceProfile, quality, progress) {
  // Step 1: Image
  progress(`\uD83D\uDDBC\uFE0F  Generating image: ${char.name_pt}`);
  const imagePrompt = buildImagePrompt(char, quality);
  let imageUrl;
  try {
    const imgResult = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt: imagePrompt,
        image_size: "portrait_16_9",
        num_images: 1,
        output_format: "jpeg",
      },
      logs: false,
    });
    imageUrl = imgResult.data.images[0].url;
    console.error(`   \u2705 Image: ${imageUrl}`);
  } catch (e) {
    throw new Error(`Image generation failed for ${char.name_pt}: ${e.message}`);
  }

  // Step 2: TTS
  progress(`\uD83C\uDF99\uFE0F  Generating voice: ${char.name_pt}`);
  const audioUrl = await generateTTS(fal, speechText, voiceProfile, char.name_pt);

  // Step 3: Lip sync
  progress(`\uD83C\uDFAC  Lip sync: ${char.name_pt}`);
  const clipUrl = await generateLipSync(fal, imageUrl, audioUrl, quality, char.name_pt);

  return { imageUrl, audioUrl, clipUrl };
}

async function generateTTS(fal, speechText, voiceProfile, charName) {
  try {
    const ttsResult = await fal.subscribe("fal-ai/minimax-tts/text-to-speech", {
      input: {
        text: speechText,
        voice_id: voiceProfile.voice_id,
      },
      logs: false,
    });
    const url = ttsResult.data.audio.url;
    console.error(`   \u2705 Audio: ${url}`);
    return url;
  } catch (e) {
    throw new Error(`TTS generation failed for ${charName}: ${e.message}`);
  }
}

async function generateLipSync(fal, imageUrl, audioUrl, quality, charName) {
  try {
    const resolution = quality === "premium" ? "720p" : "480p";
    const fabricResult = await fal.subscribe("veed/fabric-1.0", {
      input: { image_url: imageUrl, audio_url: audioUrl, resolution },
      logs: false,
    });
    const url = fabricResult.data.video.url;
    console.error(`   \u2705 Clip: ${url}`);
    return url;
  } catch (e) {
    console.error(`   \u26A0  Fabric failed, trying MuseTalk...`);
    try {
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
        input: { video_url: staticVideoUrl, audio_url: audioUrl },
        logs: false,
      });
      const url = museTalkResult.data.video.url;
      console.error(`   \u2705 Clip (MuseTalk fallback): ${url}`);
      return url;
    } catch (e2) {
      throw new Error(`Lip sync failed for ${charName}: ${e.message} | ${e2.message}`);
    }
  }
}

// === CONCAT & MERGE =============================================================

function hasFfmpeg() {
  try {
    execSync("ffmpeg -version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function concatClips(characterClips, videoDir) {
  if (!hasFfmpeg()) {
    console.error("   \u26A0  ffmpeg not found, skipping concat");
    return null;
  }

  const clipUrls = characterClips.map(c => c.clip_url);
  const isAllUrls = clipUrls.every(u => typeof u === "string" && u.startsWith("http"));

  if (!isAllUrls) {
    // Some clips are local files (from Veo merge) - build ffmpeg concat list
    const listPath = join(videoDir, "concat-list.txt");
    const listContent = clipUrls.map(u => `file '${u}'`).join("\n");
    writeFileSync(listPath, listContent);

    const outputPath = join(videoDir, "final-reel.mp4");
    try {
      execSync(
        `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`,
        { stdio: "pipe", timeout: 120000 }
      );
      console.error(`   \u2705 Concatenated: ${outputPath}`);
      return outputPath;
    } catch (e) {
      console.error(`   \u26A0  Concat failed: ${e.message}`);
      return null;
    }
  }

  // All clips are remote URLs - download then concat
  try {
    const localClips = [];
    for (let i = 0; i < clipUrls.length; i++) {
      const localPath = join(videoDir, `clip-${i}.mp4`);
      execSync(`curl -sL -o "${localPath}" "${clipUrls[i]}"`, { stdio: "pipe", timeout: 60000 });
      localClips.push(localPath);
    }

    const listPath = join(videoDir, "concat-list.txt");
    const listContent = localClips.map(p => `file '${p}'`).join("\n");
    writeFileSync(listPath, listContent);

    const outputPath = join(videoDir, "final-reel.mp4");
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`,
      { stdio: "pipe", timeout: 120000 }
    );

    // Clean up individual clips
    for (const p of localClips) {
      try { unlinkSync(p); } catch {}
    }
    try { unlinkSync(listPath); } catch {}

    console.error(`   \u2705 Concatenated: ${outputPath}`);
    return outputPath;
  } catch (e) {
    console.error(`   \u26A0  Concat failed: ${e.message}`);
    return null;
  }
}

async function downloadAndMergeAV(videoUrl, audioUrl, outputPath) {
  const tmpVideo = outputPath.replace(".mp4", "-v.mp4");
  const tmpAudio = outputPath.replace(".mp4", "-a.mp3");

  execSync(`curl -sL -o "${tmpVideo}" "${videoUrl}"`, { stdio: "pipe", timeout: 60000 });
  execSync(`curl -sL -o "${tmpAudio}" "${audioUrl}"`, { stdio: "pipe", timeout: 60000 });
  execSync(
    `ffmpeg -y -i "${tmpVideo}" -i "${tmpAudio}" -c:v copy -c:a aac -shortest "${outputPath}"`,
    { stdio: "pipe", timeout: 60000 }
  );

  try { unlinkSync(tmpVideo); } catch {}
  try { unlinkSync(tmpAudio); } catch {}
}

// === PROMPT BUILDERS =============================================================

function buildImagePrompt(char, quality) {
  const base = char.ai_prompt_midjourney || "";
  const styleEnforcement = [
    "Disney/Pixar 3D render style",
    "cartoon face with expressive eyes embedded in object surface",
    "small stub arms",
    "9:16 vertical aspect ratio",
    quality === "premium" ? "ultra-realistic 3D animation, 8K, cinematic lighting" : "ultra-realistic 3D animation",
  ].join(", ");

  if (base && base.length > 50) {
    return `${base}, ${styleEnforcement}`;
  }

  return `Cute but ${char.expression_arc?.[0] || "angry"} animated ${char.name_en} character, ` +
    `${char.environment_en || "Brazilian home interior"}, ` +
    `${char.human_background_en || "person visible in background"}, ` +
    styleEnforcement;
}

function buildVeoPrompt(char, quality) {
  const base = char.ai_prompt_midjourney || "";
  const veoStyle = [
    "Animated Disney/Pixar 3D character with organic natural movement",
    "subtle breathing and body sway",
    "9:16 vertical video",
    quality === "premium" ? "cinematic lighting, ultra-detailed, 4K" : "high quality 3D animation",
  ].join(", ");

  if (base && base.length > 50) {
    return `${base}, ${veoStyle}, gentle movement, no camera shake`;
  }

  return `Animated ${char.name_en || char.name_pt} character, ` +
    `${char.environment_en || "warm Brazilian scene"}, ` +
    `${veoStyle}, gentle idle animation, no camera movement`;
}

// === VOICE & TEXT ================================================================

function resolveVoiceProfile(char, overrides, globalTone) {
  const charName = (char.name_pt || "").toLowerCase();

  const overrideKey = Object.keys(overrides).find(k =>
    charName.includes(k.toLowerCase())
  );
  if (overrideKey) {
    return VOICE_PROFILES[overrides[overrideKey]] || VOICE_PROFILES.angry;
  }

  const personality = char.personality || "";
  const voiceKey = PERSONALITY_TO_VOICE[personality];
  if (voiceKey && VOICE_PROFILES[voiceKey]) {
    return { ...VOICE_PROFILES[voiceKey] };
  }

  const firstExpr = (char.expression_arc?.[0] || "").toLowerCase();
  if (firstExpr.includes("furi") || firstExpr.includes("explosiv")) return VOICE_PROFILES.furious;
  if (firstExpr.includes("alarm") || firstExpr.includes("urgent")) return VOICE_PROFILES.alarmed;
  if (firstExpr.includes("resign") || firstExpr.includes("cansa")) return VOICE_PROFILES.resigned;
  if (firstExpr.includes("sarcast") || firstExpr.includes("ironic")) return VOICE_PROFILES.sarcastic;
  if (firstExpr.includes("profess") || firstExpr.includes("confid")) return VOICE_PROFILES.professional;

  return VOICE_PROFILES[globalTone] || VOICE_PROFILES.angry;
}

function cleanSpeechText(script) {
  if (!script) return "";
  return script
    .replace(/\[pausa longa\]/gi, "...")
    .replace(/\[pausa curta\]/gi, ",")
    .replace(/\[pausa\]/gi, ".")
    .replace(/\[\u00caENFASE\]/gi, "")
    .replace(/\[EMPHASIS\]/gi, "")
    .replace(/\[pause\]/gi, ".")
    .replace(/\[long pause\]/gi, "...")
    .replace(/\[acelerado\]/gi, "")
    .replace(/\[suave\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeSlug(char) {
  return (char.name_pt || char.name_en || `char${char.id || 0}`)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
}

// === CAPTIONS ====================================================================

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
  const baseBottom = {
    fontFamily: "Arial Black, sans-serif",
    textAlign: "center",
    position: "absolute",
    bottom: "15%",
    width: "90%",
    left: "5%",
    textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
  };

  const baseTop = {
    fontFamily: "Arial Black, sans-serif",
    textAlign: "center",
    position: "absolute",
    top: "5%",
    width: "90%",
    left: "5%",
  };

  switch (theme) {
    // --- Legacy styles (backward compatible) ---
    case "bold_white":
      return { ...baseBottom, color: "#FFFFFF", fontSize: captionStyle === "bold" ? "48px" : "38px", fontWeight: "900" };
    case "minimal":
      return { ...baseBottom, color: "#FFFFFF", fontSize: "36px", fontWeight: "600", opacity: 0.9 };
    case "colorful":
      return { ...baseBottom, color: captionStyle === "bold" ? "#FFE500" : "#FFFFFF", fontSize: "44px", fontWeight: "800" };

    // --- ViralObj caption styles (10 documented) ---
    case "alpha":
      return { ...baseBottom, color: "#FFFFFF", fontSize: "48px", fontWeight: "900", textTransform: "uppercase" };

    case "beta":
      return {
        ...baseBottom,
        color: "#000000",
        fontSize: "38px",
        fontWeight: "800",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: "12px",
        padding: "8px 16px",
        textShadow: "none",
      };

    case "gamma":
      return {
        ...baseBottom,
        color: "#FFFFFF",
        fontSize: "42px",
        fontWeight: "900",
        // gamma: dark pill top + white pill watermark + single-word karaoke bottom
      };

    case "gamma-B":
      return {
        ...baseTop,
        color: "#000000",
        fontSize: "36px",
        fontWeight: "800",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: "12px",
        padding: "10px 18px",
      };

    case "gamma-B-rodape":
      return {
        ...baseTop,
        color: "#000000",
        fontSize: "36px",
        fontWeight: "800",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: "12px",
        padding: "10px 18px",
        // rodape: plain white text watermark bottom-center, ironic word at end
      };

    case "alpha-karaoke":
      return {
        ...baseBottom,
        color: "#FFFFFF",
        fontSize: "52px",
        fontWeight: "900",
        // Single word per beat, no top hook pill, plain text watermark bottom
      };

    case "beta-word-karaoke":
      return {
        ...baseBottom,
        color: "#FFFFFF",
        fontSize: "52px",
        fontWeight: "900",
        fontFamily: "Rounded Mplus 1c, Arial Black, sans-serif",
        // 1 word per beat, bold rounded, white, outline preto
      };

    case "gamma-emoji-pill":
      return {
        ...baseTop,
        color: "#000000",
        fontSize: "34px",
        fontWeight: "900",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: "12px",
        padding: "12px 20px",
        textTransform: "uppercase",
        // Full-video fixed headline with emoji
      };

    case "highlight-keyword-color":
      return {
        ...baseBottom,
        color: "#FFFFFF",
        fontSize: "44px",
        fontWeight: "900",
        // Keyword highlighted in neon color: #00FF88 / #00E5FF / #FFE000
        highlightColors: ["#00FF88", "#00E5FF", "#FFE000"],
      };

    case "headline-topo-bold":
      return {
        ...baseTop,
        color: "#FFFFFF",
        fontSize: "38px",
        fontWeight: "900",
        textShadow: "-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000",
        // Full phrase bold white top, no pill, combined with highlight-keyword-color bottom
      };

    default:
      return { ...baseBottom, color: "#FFFFFF", fontSize: "42px", fontWeight: "900" };
  }
}

function buildFullCaptionScript(clips, lang, style) {
  const allCaptions = [];

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

// === COST ========================================================================

function estimateCost(clips, quality, useVeo = false) {
  if (useVeo) {
    const costPerVeo = 0.50;    // Veo 2 ~$0.50/video
    const costPerTTS = 0.30;    // MiniMax TTS
    const perClip = costPerVeo + costPerTTS;
    const total = perClip * clips.length;
    return {
      per_veo_usd: costPerVeo.toFixed(2),
      per_tts_usd: costPerTTS.toFixed(2),
      per_clip_usd: perClip.toFixed(2),
      total_usd: `$${total.toFixed(2)}`,
      clips_count: clips.length,
      pipeline: "veo",
    };
  }

  const costPerImage = quality === "premium" ? 0.045 : 0.03;
  const costPerTTS = 0.001 * 300;
  const costPerLipSync = quality === "premium" ? 0.15 * 10 : 0.08 * 10;
  const perClip = costPerImage + costPerTTS + costPerLipSync;
  const total = perClip * clips.length;

  return {
    per_image_usd: costPerImage.toFixed(3),
    per_tts_usd: costPerTTS.toFixed(3),
    per_lipsync_usd: costPerLipSync.toFixed(2),
    per_clip_usd: perClip.toFixed(2),
    total_usd: `$${total.toFixed(2)}`,
    clips_count: clips.length,
    pipeline: "flux",
  };
}

// === UTILS =======================================================================

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
