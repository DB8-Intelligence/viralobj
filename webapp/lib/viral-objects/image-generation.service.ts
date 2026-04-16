import type { SceneImagePrompt } from "./image-prompt-pack";
import {
  FAL_INTEGRATION_READY,
  FEATURE_IP_ADAPTER,
  IP_ADAPTER_STRENGTH,
  IP_ADAPTER_USE_SEED,
  LOG_COSTS,
} from "../config/features";

export type SceneType = "intro" | "dialogue" | "reaction" | "cta";

export interface GeneratedSceneImage {
  objectId: string;
  sceneId: string;
  sceneType: SceneType;
  prompt: string;
  imageUrl: string;
  provider: "mock" | "fal";
  generatedAt: string;
}

export interface GenerateSceneImageInput {
  objectId: string;
  sceneId: string;
  sceneType: SceneType;
  prompt: string;
  /** URL da imagem da cena anterior (para IP-Adapter character chaining) */
  referenceImageUrl?: string;
  /** Índice da cena no lote (0-based) */
  sceneIndex?: number;
  /** Job ID para seed determinístico */
  jobId?: string;
}

function mockImageUrl(sceneId: string): string {
  const safe = encodeURIComponent(sceneId);
  return `https://placehold.co/576x1024/png?text=${safe}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateWithFal(input: GenerateSceneImageInput): Promise<string> {
  // TODO: integração real com Fal.ai (FLUX.2 Pro).
  // Quando FAL_INTEGRATION_READY=true, chamar:
  //   fal.queue.submit("fal-ai/flux-pro", {
  //     prompt: input.prompt,
  //     image_prompt: useIpAdapter ? input.referenceImageUrl : undefined,
  //     image_prompt_strength: IP_ADAPTER_STRENGTH,
  //     seed: IP_ADAPTER_USE_SEED ? `${input.jobId}-${input.sceneIndex}` : undefined,
  //   })
  return mockImageUrl(input.sceneId);
}

export async function generateSceneImage(
  input: GenerateSceneImageInput
): Promise<GeneratedSceneImage> {
  const useFal = FAL_INTEGRATION_READY && Boolean(process.env.FAL_KEY);
  const useIpAdapter = useFal && FEATURE_IP_ADAPTER && Boolean(input.referenceImageUrl);

  if (useIpAdapter) {
    console.log(
      `[ImageGen] Scene ${input.sceneIndex ?? '?'} using IP-Adapter (strength: ${IP_ADAPTER_STRENGTH})`
    );
  }

  const imageUrl = useFal
    ? await generateWithFal(input)
    : mockImageUrl(input.sceneId);

  if (LOG_COSTS && useFal) {
    console.log(`[Cost] image-generation: ~$0.05 (fal-ai/flux-pro) scene=${input.sceneId}`);
  }

  return {
    objectId: input.objectId,
    sceneId: input.sceneId,
    sceneType: input.sceneType,
    prompt: input.prompt,
    imageUrl,
    provider: useFal ? "fal" : "mock",
    generatedAt: new Date().toISOString(),
  };
}

export async function generateSceneImages(
  prompts: SceneImagePrompt[],
  jobId?: string
): Promise<GeneratedSceneImage[]> {
  const results: GeneratedSceneImage[] = [];
  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    const previousImage = i > 0 ? results[i - 1]?.imageUrl : undefined;
    try {
      results.push(
        await generateSceneImage({
          objectId: p.objectId,
          sceneId: p.sceneId,
          sceneType: p.sceneType,
          prompt: p.prompt,
          referenceImageUrl: previousImage,
          sceneIndex: i,
          jobId,
        })
      );
    } catch (err) {
      console.error(`[generateSceneImages] ${p.sceneId} failed:`, err);
      results.push({
        objectId: p.objectId,
        sceneId: p.sceneId,
        sceneType: p.sceneType,
        prompt: p.prompt,
        imageUrl: mockImageUrl(p.sceneId),
        provider: "mock",
        generatedAt: new Date().toISOString(),
      });
    }
  }
  return results;
}
