import {
  MINIMAX_READY,
  ELEVENLABS_READY,
  TTS_PROVIDER,
  LOG_COSTS,
} from "../config/features";
import { uploadAudioToStorage } from "./storage";

export type SceneType = "intro" | "dialogue" | "reaction" | "cta";
export type AudioProvider = "mock" | "minimax" | "elevenlabs";

export interface GeneratedSceneAudio {
  objectId: string;
  sceneId: string;
  sceneType: SceneType;
  text: string;
  audioUrl: string;
  provider: AudioProvider;
  generatedAt: string;
  durationMs?: number;
}

export interface GenerateSceneAudioInput {
  objectId: string;
  sceneId: string;
  sceneType: SceneType;
  text: string;
  /** When provided, ElevenLabs audio is uploaded to Supabase Storage
   *  instead of returned as a data: URI (required for Veo 3 image-to-video). */
  generationId?: string;
}

export type SceneAudioInput = GenerateSceneAudioInput;

// ~180 words per minute → ~333ms per word. Deterministic estimate for mock.
const MS_PER_WORD = 333;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateDurationMs(text: string): number {
  const words = countWords(text);
  // Minimum 1s floor so empty/one-word scenes still have a sensible slot.
  return Math.max(1000, words * MS_PER_WORD);
}

function mockAudioUrl(sceneId: string): string {
  return `mock://audio/${encodeURIComponent(sceneId)}.mp3`;
}

// Vozes ElevenLabs para objetos falantes (dramaticos, expressivos)
const ELEVENLABS_VOICES: Record<string, string> = {
  dramatic: 'pNInz6obpgDQGcFmaJgB', // Adam — grave, dramatico
  funny: 'EXAVITQu4vr4xnSDxMaL',    // Bella — animado
  emotional: 'onwK4e9ZLuTAKqWW03F9', // Daniel — emotivo
  sarcastic: 'N2lVS1w4EtoT3dr4eOWO', // Callum — sarcastico
  motivational: 'TX3LPaxmHKxFdv7VOQHJ', // Liam — energetico
};

function pickVoiceId(sceneType: SceneType): string {
  const map: Record<SceneType, string> = {
    intro: ELEVENLABS_VOICES.dramatic,
    dialogue: ELEVENLABS_VOICES.funny,
    reaction: ELEVENLABS_VOICES.emotional,
    cta: ELEVENLABS_VOICES.motivational,
  };
  return map[sceneType] ?? ELEVENLABS_VOICES.dramatic;
}

async function generateWithMinimax(input: GenerateSceneAudioInput): Promise<{ url: string; durationMs: number }> {
  // MiniMax via Fal.ai (mesmo pattern do MCP generate_video.js)
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: process.env.FAL_KEY });

  console.log(`[TTS] MiniMax generating scene=${input.sceneId}`);

  const result = await fal.subscribe("fal-ai/minimax-tts/text-to-speech", {
    input: {
      text: input.text,
      voice_id: "male-qn-qingse", // voz padrao MiniMax PT-BR compativel
    },
    logs: false,
  });

  const data = result.data as Record<string, unknown>;
  const audioUrl = (data.audio as Record<string, unknown>)?.url as string;
  if (!audioUrl) throw new Error(`[TTS] MiniMax returned no audio for scene=${input.sceneId}`);

  const durationMs = ((data.audio as Record<string, unknown>)?.duration as number ?? 0) * 1000;

  console.log(`[TTS] MiniMax OK scene=${input.sceneId} url=${audioUrl.substring(0, 60)}...`);
  return { url: audioUrl, durationMs: durationMs || estimateDurationMs(input.text) };
}

async function generateWithElevenLabs(input: GenerateSceneAudioInput): Promise<{ url: string; durationMs: number }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('[TTS] ELEVENLABS_API_KEY not set');

  const voiceId = pickVoiceId(input.sceneType);

  console.log(`[TTS] ElevenLabs generating scene=${input.sceneId} voice=${voiceId}`);

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: input.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.4,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown');
    throw new Error(`[TTS] ElevenLabs API error ${response.status}: ${errText}`);
  }

  const audioBuffer = await response.arrayBuffer();

  // Upload to Supabase Storage so downstream (Veo 3) gets an HTTP URL,
  // not a data: URI that image-to-video providers reject.
  const uploaded = await uploadAudioToStorage({
    generationId: input.generationId ?? "standalone",
    sceneId: input.sceneId,
    buffer: audioBuffer,
    contentType: "audio/mpeg",
  });

  // Estimar duracao pelo tamanho (MP3 ~128kbps = 16KB/s)
  const estimatedDurationMs = Math.round((uploaded.sizeBytes / 16000) * 1000);

  console.log(
    `[TTS] ElevenLabs OK scene=${input.sceneId} size=${uploaded.sizeBytes}b ~${Math.round(estimatedDurationMs / 1000)}s (storage=${uploaded.storedInBucket})`,
  );
  return { url: uploaded.url, durationMs: estimatedDurationMs || estimateDurationMs(input.text) };
}

export async function generateSceneAudio(
  input: GenerateSceneAudioInput
): Promise<GeneratedSceneAudio> {
  // TTS_PROVIDER env var seleciona preferência; flags *_READY controlam se o código está pronto.
  const preferMinimax = TTS_PROVIDER === 'minimax';
  const useMinimax = preferMinimax && MINIMAX_READY && Boolean(process.env.MINIMAX_API_KEY);
  const useElevenLabs =
    !useMinimax && ELEVENLABS_READY && Boolean(process.env.ELEVENLABS_API_KEY);

  let audioUrl: string;
  let provider: AudioProvider;
  let realDurationMs: number | undefined;

  if (useMinimax) {
    const result = await generateWithMinimax(input);
    audioUrl = result.url;
    realDurationMs = result.durationMs;
    provider = "minimax";
  } else if (useElevenLabs) {
    const result = await generateWithElevenLabs(input);
    audioUrl = result.url;
    realDurationMs = result.durationMs;
    provider = "elevenlabs";
  } else {
    audioUrl = mockAudioUrl(input.sceneId);
    provider = "mock";
  }

  if (LOG_COSTS && provider !== "mock") {
    const cost = provider === "minimax" ? 0.0125 : 0.0225;
    console.log(`[Cost] audio-generation: ~$${cost} (${provider}) scene=${input.sceneId}`);
  }

  return {
    objectId: input.objectId,
    sceneId: input.sceneId,
    sceneType: input.sceneType,
    text: input.text,
    audioUrl,
    provider,
    generatedAt: new Date().toISOString(),
    durationMs: realDurationMs ?? estimateDurationMs(input.text),
  };
}

export async function generateSceneAudios(
  inputs: SceneAudioInput[]
): Promise<GeneratedSceneAudio[]> {
  const results: GeneratedSceneAudio[] = [];
  for (const input of inputs) {
    try {
      results.push(await generateSceneAudio(input));
    } catch (err) {
      // Fallback mock: não deixa uma cena derrubar o lote inteiro.
      console.error(`[generateSceneAudios] ${input.sceneId} failed:`, err);
      results.push({
        objectId: input.objectId,
        sceneId: input.sceneId,
        sceneType: input.sceneType,
        text: input.text,
        audioUrl: mockAudioUrl(input.sceneId),
        provider: "mock",
        generatedAt: new Date().toISOString(),
        durationMs: estimateDurationMs(input.text),
      });
    }
  }
  return results;
}
