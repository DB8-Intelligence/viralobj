import { fal } from "@fal-ai/client";
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

export interface RenderedSceneVideo {
  sceneId: string;
  sceneType: SceneType;
  videoUrl: string;
  durationMs: number;
}

export interface SceneRenderReport {
  sceneId: string;
  sceneType: SceneType;
  status: "success" | "failed" | "skipped";
  videoUrl?: string;
  durationMs?: number;
  costUsd?: number;
  error?: string;
  promptPreview?: string;
}

export interface RenderedVideo {
  generationId: string;
  videoUrl: string;
  sceneVideos: RenderedSceneVideo[];
  provider: VideoProvider;
  renderedAt: string;
  totalDurationMs: number;
  totalCostUsd?: number;
  sceneReports?: SceneRenderReport[];
  skipReason?: string;
}

/** Config FFmpeg exportada para uso futuro em assembly real */
export const ffmpegConfig = {
  crf: FFMPEG_CRF,
  bitrate: FFMPEG_BITRATE,
  preset: FFMPEG_PRESET,
  maxDuration: 60,
  resolution: { width: 576, height: 1024 },
  pixFmt: "yuv420p" as const,
  audioCodec: "aac" as const,
  audioBitrate: "128k",
};

function mockVideoUrl(generationId: string): string {
  return `mock://video/${encodeURIComponent(generationId)}.mp4`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function renderWithRemotion(input: RenderVideoInput): Promise<RenderedVideo> {
  // TODO: integração futura com Remotion SSR render para assembly completo.
  return {
    generationId: input.generationId,
    videoUrl: mockVideoUrl(input.generationId),
    sceneVideos: [],
    provider: "remotion",
    renderedAt: new Date().toISOString(),
    totalDurationMs: input.timeline.totalDurationMs,
  };
}

/**
 * Renderiza vídeo via Google Veo 3 Fast (image-to-video) no Fal.ai.
 *
 * UMA CHAMADA por cena: imagem + prompt (com fala) → vídeo completo
 * com voz gerada, lip sync, efeitos sonoros e animação.
 *
 * Custo: $0.15/segundo (fast) → $1.20 por cena de 8s
 * Resultado: vídeo 720p/1080p com áudio integrado, pronto para postar.
 */
async function renderWithFal(input: RenderVideoInput): Promise<RenderedVideo> {
  fal.config({ credentials: process.env.FAL_KEY });

  const sceneVideos: RenderedSceneVideo[] = [];
  const sceneReports: SceneRenderReport[] = [];
  let totalCost = 0;

  const MAX_SCENE_VIDEOS = 4;
  const allValid = input.timeline.scenes.filter(
    (s) => typeof s.imageUrl === "string" && s.imageUrl.startsWith("http") && !s.imageUrl.includes("placehold"),
  );

  const priorityOrder: Record<string, number> = {
    intro: 0,
    dialogue: 1,
    reaction: 2,
    cta: 3,
  };
  const validScenes = allValid
    .sort(
      (a, b) =>
        (priorityOrder[a.sceneType] ?? 9) -
        (priorityOrder[b.sceneType] ?? 9),
    )
    .slice(0, MAX_SCENE_VIDEOS);

  if (validScenes.length === 0) {
    const reason = `Nenhuma cena válida: ${input.timeline.scenes.length} cenas no timeline, 0 com imageUrl começando com "http" (não-placeholder).`;
    console.warn("[VideoRender]", reason);
    return {
      generationId: input.generationId,
      videoUrl: mockVideoUrl(input.generationId),
      sceneVideos: [],
      provider: "mock",
      renderedAt: new Date().toISOString(),
      totalDurationMs: input.timeline.totalDurationMs,
      skipReason: reason,
      sceneReports: input.timeline.scenes.map((s) => ({
        sceneId: s.sceneId,
        sceneType: s.sceneType as SceneType,
        status: "skipped" as const,
        error: "imageUrl inválida ou placeholder",
      })),
    };
  }

  console.log(
    `[VideoRender] Renderizando ${validScenes.length} de ${allValid.length} cenas via Veo 3 Fast (max ${MAX_SCENE_VIDEOS})...`,
  );

  for (const scene of validScenes) {
    const rawDuration = Math.ceil(scene.durationMs / 1000);
    const veoDuration: "4s" | "6s" | "8s" =
      rawDuration <= 4 ? "4s" : rawDuration <= 6 ? "6s" : "8s";
    const durationSec = parseInt(veoDuration);

    const speechText = scene.overlayText ?? "";
    const sceneDirection =
      scene.sceneType === "intro"
        ? "Character speaks directly to camera with confident animated expression"
        : scene.sceneType === "dialogue"
          ? "Character gestures expressively while speaking with emotion"
          : scene.sceneType === "reaction"
            ? "Character reacts with dramatic facial expression changes"
            : "Character gives final message with thumbs up and warm smile";

    const prompt = speechText
      ? `${sceneDirection}. The character says in Portuguese: "${speechText}". Disney Pixar 3D animated style, dramatic lighting, 9:16 vertical video, cozy Brazilian kitchen or living room background, warm golden hour lighting with bokeh.`
      : `${sceneDirection}. Disney Pixar 3D animated character with expressive face, subtle idle animation with breathing and blinking, warm cinematic lighting, cozy environment.`;

    try {
      console.log(
        `[VideoRender] Veo 3 Fast: ${scene.sceneId} (${veoDuration}, audio=true)`,
      );

      const result = await fal.subscribe(
        "fal-ai/veo3/fast/image-to-video",
        {
          input: {
            prompt,
            image_url: scene.imageUrl!,
            aspect_ratio: "9:16",
            duration: veoDuration,
            resolution: "720p",
            generate_audio: true,
          },
          logs: false,
        },
      );

      const videoUrl =
        (result as any)?.data?.video?.url ??
        (result as any)?.video?.url ??
        null;

      if (videoUrl) {
        sceneVideos.push({
          sceneId: scene.sceneId,
          sceneType: scene.sceneType as SceneType,
          videoUrl,
          durationMs: durationSec * 1000,
        });

        const sceneCost = durationSec * 0.15;
        totalCost += sceneCost;
        sceneReports.push({
          sceneId: scene.sceneId,
          sceneType: scene.sceneType as SceneType,
          status: "success",
          videoUrl,
          durationMs: durationSec * 1000,
          costUsd: sceneCost,
          promptPreview: prompt.slice(0, 180),
        });
        console.log(
          `[VideoRender] ✓ ${scene.sceneId}: ${videoUrl.substring(0, 60)}... (~$${sceneCost.toFixed(2)})`,
        );
      } else {
        const errMsg = `Resposta do Veo 3 sem videoUrl: ${JSON.stringify(result).substring(0, 200)}`;
        console.warn(`[VideoRender] ✗ ${scene.sceneId}: ${errMsg}`);
        sceneReports.push({
          sceneId: scene.sceneId,
          sceneType: scene.sceneType as SceneType,
          status: "failed",
          error: errMsg,
          promptPreview: prompt.slice(0, 180),
        });
      }
    } catch (err: any) {
      const errMsg = err?.message ?? String(err);
      console.error(`[VideoRender] ✗ ${scene.sceneId} falhou: ${errMsg}`);
      sceneReports.push({
        sceneId: scene.sceneId,
        sceneType: scene.sceneType as SceneType,
        status: "failed",
        error: errMsg,
        promptPreview: prompt.slice(0, 180),
      });
    }
  }

  // Cenas que nem foram tentadas (acima do MAX_SCENE_VIDEOS)
  for (const s of allValid.slice(MAX_SCENE_VIDEOS)) {
    sceneReports.push({
      sceneId: s.sceneId,
      sceneType: s.sceneType as SceneType,
      status: "skipped",
      error: `Excedeu limite de ${MAX_SCENE_VIDEOS} cenas/render`,
    });
  }

  if (LOG_COSTS) {
    console.log(
      `[Cost] video-render: ~$${totalCost.toFixed(2)} (${sceneVideos.length} cenas via Veo 3 Fast)`,
    );
  }

  const primaryVideoUrl =
    sceneVideos.length > 0
      ? sceneVideos[0].videoUrl
      : mockVideoUrl(input.generationId);

  return {
    generationId: input.generationId,
    videoUrl: primaryVideoUrl,
    sceneVideos,
    provider: "fal",
    renderedAt: new Date().toISOString(),
    totalDurationMs: sceneVideos.reduce((sum, s) => sum + s.durationMs, 0),
    totalCostUsd: totalCost,
    sceneReports,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function renderWithVeed(input: RenderVideoInput): Promise<RenderedVideo> {
  // TODO: integração real com VEED API.
  return {
    generationId: input.generationId,
    videoUrl: mockVideoUrl(input.generationId),
    sceneVideos: [],
    provider: "veed",
    renderedAt: new Date().toISOString(),
    totalDurationMs: input.timeline.totalDurationMs,
  };
}

export async function renderVideo(
  input: RenderVideoInput,
): Promise<RenderedVideo> {
  if (FEATURE_PREVIEW_MODE) {
    console.log("[VideoRender] Preview mode — skipping lip-sync/render");
    return {
      generationId: input.generationId,
      videoUrl: mockVideoUrl(input.generationId),
      sceneVideos: [],
      provider: "mock",
      renderedAt: new Date().toISOString(),
      totalDurationMs: input.timeline.totalDurationMs,
    };
  }

  const useRemotion =
    REMOTION_READY && Boolean(process.env.REMOTION_RENDER_URL);
  const useFal =
    !useRemotion && FAL_VIDEO_READY && Boolean(process.env.FAL_KEY);
  const useVeed =
    !useRemotion && !useFal && VEED_READY && Boolean(process.env.VEED_API_KEY);

  let rendered: RenderedVideo;

  if (useRemotion) {
    rendered = await renderWithRemotion(input);
  } else if (useFal) {
    rendered = await renderWithFal(input);
  } else if (useVeed) {
    rendered = await renderWithVeed(input);
  } else {
    const reasons: string[] = [];
    if (!REMOTION_READY) reasons.push("REMOTION_READY=false");
    if (!FAL_VIDEO_READY) reasons.push("FAL_VIDEO_READY=false");
    else if (!process.env.FAL_KEY) reasons.push("FAL_KEY ausente");
    if (!VEED_READY) reasons.push("VEED_READY=false");
    rendered = {
      generationId: input.generationId,
      videoUrl: mockVideoUrl(input.generationId),
      sceneVideos: [],
      provider: "mock",
      renderedAt: new Date().toISOString(),
      totalDurationMs: input.timeline.totalDurationMs,
      skipReason: `Nenhum provider de vídeo habilitado: ${reasons.join(", ")}`,
    };
  }

  if (LOG_COSTS && rendered.provider !== "mock") {
    console.log(
      `[VideoRender] ${rendered.sceneVideos.length} cenas renderizadas via ${rendered.provider}`,
    );
  }

  return rendered;
}
