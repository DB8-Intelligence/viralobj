import type { SceneImagePrompt } from "./image-prompt-pack";

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
}

function mockImageUrl(sceneId: string): string {
  // Determinístico por sceneId — estável entre runs para facilitar debug/preview.
  const safe = encodeURIComponent(sceneId);
  return `https://placehold.co/576x1024/png?text=${safe}`;
}

// Flip to true ONLY when generateWithFal actually calls Fal.ai.
// While false, provider is always reported as "mock" even if FAL_KEY is set.
const FAL_INTEGRATION_READY = false;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateWithFal(input: GenerateSceneImageInput): Promise<string> {
  // TODO: integração real com Fal.ai (FLUX.2 Pro).
  return mockImageUrl(input.sceneId);
}

export async function generateSceneImage(
  input: GenerateSceneImageInput
): Promise<GeneratedSceneImage> {
  const useFal = FAL_INTEGRATION_READY && Boolean(process.env.FAL_KEY);

  const imageUrl = useFal
    ? await generateWithFal(input)
    : mockImageUrl(input.sceneId);

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
  prompts: SceneImagePrompt[]
): Promise<GeneratedSceneImage[]> {
  const results: GeneratedSceneImage[] = [];
  for (const p of prompts) {
    try {
      results.push(
        await generateSceneImage({
          objectId: p.objectId,
          sceneId: p.sceneId,
          sceneType: p.sceneType,
          prompt: p.prompt,
        })
      );
    } catch (err) {
      // Fallback mock: não deixa uma cena derrubar o lote inteiro.
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
