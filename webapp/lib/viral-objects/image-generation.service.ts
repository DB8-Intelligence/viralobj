import { fal } from "@fal-ai/client";
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

/** Gera seed deterministico a partir de jobId + sceneIndex */
function buildSeed(jobId?: string, sceneIndex?: number): number | undefined {
  if (!IP_ADAPTER_USE_SEED || !jobId) return undefined;
  // Hash simples: soma dos charCodes do jobId + offset do sceneIndex
  let hash = 0;
  for (let i = 0; i < jobId.length; i++) {
    hash = ((hash << 5) - hash + jobId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash + (sceneIndex ?? 0));
}

async function generateWithFal(input: GenerateSceneImageInput): Promise<string> {
  fal.config({ credentials: process.env.FAL_KEY });

  const useIpAdapter = FEATURE_IP_ADAPTER && Boolean(input.referenceImageUrl);
  const seed = buildSeed(input.jobId, input.sceneIndex);

  console.log(
    `[ImageGen] Calling fal-ai/flux-pro/v1.1 scene=${input.sceneId}` +
    (seed ? ` seed=${seed}` : '') +
    (useIpAdapter ? ` ip-adapter=true` : '')
  );

  const falInput = {
    prompt: input.prompt,
    image_size: "portrait_16_9" as const,
    num_images: 1 as const,
    output_format: "jpeg" as const,
    ...(seed !== undefined ? { seed } : {}),
    // IP-Adapter: passa imagem anterior como referencia de consistencia visual
    ...(useIpAdapter && input.referenceImageUrl
      ? {
          image_prompt: input.referenceImageUrl,
          image_prompt_strength: IP_ADAPTER_STRENGTH,
        }
      : {}),
  };

  const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
    input: falInput,
    logs: false,
  });

  const images = (result.data as Record<string, unknown>)?.images;
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error(`[ImageGen] Fal.ai returned no images for scene=${input.sceneId}`);
  }

  const imageUrl = (images[0] as Record<string, unknown>)?.url;
  if (typeof imageUrl !== 'string') {
    throw new Error(`[ImageGen] Fal.ai returned invalid image URL for scene=${input.sceneId}`);
  }

  console.log(`[ImageGen] OK scene=${input.sceneId} url=${imageUrl.substring(0, 80)}...`);
  return imageUrl;
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
