import {
  MINIMAX_READY,
  ELEVENLABS_READY,
  TTS_PROVIDER,
  LOG_COSTS,
} from "../config/features";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateWithMinimax(input: GenerateSceneAudioInput): Promise<string> {
  // TODO: integração real com MiniMax TTS.
  return mockAudioUrl(input.sceneId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateWithElevenLabs(input: GenerateSceneAudioInput): Promise<string> {
  // TODO: integração real com ElevenLabs.
  return mockAudioUrl(input.sceneId);
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

  if (useMinimax) {
    audioUrl = await generateWithMinimax(input);
    provider = "minimax";
  } else if (useElevenLabs) {
    audioUrl = await generateWithElevenLabs(input);
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
    durationMs: estimateDurationMs(input.text),
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
