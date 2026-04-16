import {
  REMOTION_READY,
  FAL_VIDEO_READY,
  VEED_READY,
  FEATURE_PREVIEW_MODE,
  FFMPEG_CRF,
  FFMPEG_BITRATE,
  FFMPEG_PRESET,
  LOG_COSTS,
} from "../config/features";

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

/** Config FFmpeg exportada para uso futuro em assembly real */
export const ffmpegConfig = {
  crf: FFMPEG_CRF,
  bitrate: FFMPEG_BITRATE,
  preset: FFMPEG_PRESET,
  maxDuration: 60,
  resolution: { width: 576, height: 1024 },
  pixFmt: 'yuv420p' as const,
  audioCodec: 'aac' as const,
  audioBitrate: '128k',
};

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
  if (FEATURE_PREVIEW_MODE) {
    console.log(`[VideoRender] Preview mode — skipping lip-sync/render`);
    return {
      generationId: input.generationId,
      videoUrl: mockVideoUrl(input.generationId),
      provider: "mock",
      renderedAt: new Date().toISOString(),
      totalDurationMs: input.timeline.totalDurationMs,
    };
  }

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

  if (LOG_COSTS && provider !== "mock") {
    const costMap: Record<string, number> = { remotion: 0.10, fal: 0.16, veed: 0.12 };
    console.log(`[Cost] video-render: ~$${costMap[provider] ?? '?'} (${provider})`);
  }

  console.log(`[VideoRender] FFmpeg config: crf=${ffmpegConfig.crf}, bitrate=${ffmpegConfig.bitrate}`);

  return {
    generationId: input.generationId,
    videoUrl,
    provider,
    renderedAt: new Date().toISOString(),
    totalDurationMs: input.timeline.totalDurationMs,
  };
}
