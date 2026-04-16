export type SceneType = "intro" | "dialogue" | "reaction" | "cta";
export type VideoProvider = "mock" | "remotion" | "fal" | "veed";

export interface RenderVideoInput {
  generationId: string;
  objectId?: string;
  timeline: {
    totalDurationMs: number;
    scenes: Array<{
      sceneId: string;
      sceneType: SceneType;
      startMs: number;
      endMs: number;
      durationMs: number;
      imageUrl?: string;
      audioUrl?: string;
      overlayText?: string;
    }>;
  };
}

export interface RenderedVideo {
  generationId: string;
  videoUrl: string;
  provider: VideoProvider;
  renderedAt: string;
  totalDurationMs: number;
}

// Flip to true ONLY when a real render pipeline is wired.
const REMOTION_READY = false;
const FAL_VIDEO_READY = false;
const VEED_READY = false;

function mockVideoUrl(generationId: string): string {
  return `mock://video/${encodeURIComponent(generationId)}.mp4`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function renderWithRemotion(input: RenderVideoInput): Promise<string> {
  // TODO: integração real com Remotion SSR render.
  return mockVideoUrl(input.generationId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function renderWithFal(input: RenderVideoInput): Promise<string> {
  // TODO: integração real com Fal.ai VEED Fabric (lip sync image+audio → video).
  return mockVideoUrl(input.generationId);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function renderWithVeed(input: RenderVideoInput): Promise<string> {
  // TODO: integração real com VEED API.
  return mockVideoUrl(input.generationId);
}

export async function renderVideo(
  input: RenderVideoInput
): Promise<RenderedVideo> {
  const useRemotion = REMOTION_READY && Boolean(process.env.REMOTION_RENDER_URL);
  const useFal = !useRemotion && FAL_VIDEO_READY && Boolean(process.env.FAL_KEY);
  const useVeed = !useRemotion && !useFal && VEED_READY && Boolean(process.env.VEED_API_KEY);

  let videoUrl: string;
  let provider: VideoProvider;

  if (useRemotion) {
    videoUrl = await renderWithRemotion(input);
    provider = "remotion";
  } else if (useFal) {
    videoUrl = await renderWithFal(input);
    provider = "fal";
  } else if (useVeed) {
    videoUrl = await renderWithVeed(input);
    provider = "veed";
  } else {
    videoUrl = mockVideoUrl(input.generationId);
    provider = "mock";
  }

  return {
    generationId: input.generationId,
    videoUrl,
    provider,
    renderedAt: new Date().toISOString(),
    totalDurationMs: input.timeline.totalDurationMs,
  };
}
