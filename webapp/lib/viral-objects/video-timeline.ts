export type SceneType = "intro" | "dialogue" | "reaction" | "cta";

export interface TimelineScene {
  objectId: string;
  sceneId: string;
  sceneType: SceneType;
  startMs: number;
  endMs: number;
  durationMs: number;
  imageUrl?: string;
  audioUrl?: string;
  overlayText?: string;
}

export interface VideoTimeline {
  totalDurationMs: number;
  scenes: TimelineScene[];
}

const FALLBACK_SCENE_DURATION_MS = 2500;

export function buildVideoTimeline(input: {
  sceneBlueprints: Array<{
    objectId: string;
    scenes: Array<{
      sceneId: string;
      sceneType: SceneType;
      overlayText?: string;
    }>;
  }>;
  sceneImages: Array<{
    sceneId: string;
    imageUrl: string;
  }>;
  sceneAudios: Array<{
    sceneId: string;
    audioUrl: string;
    durationMs?: number;
  }>;
}): VideoTimeline {
  const imageBySceneId = new Map<string, string>();
  for (const img of input.sceneImages) {
    imageBySceneId.set(img.sceneId, img.imageUrl);
  }

  const audioBySceneId = new Map<
    string,
    { audioUrl: string; durationMs?: number }
  >();
  for (const a of input.sceneAudios) {
    audioBySceneId.set(a.sceneId, {
      audioUrl: a.audioUrl,
      durationMs: a.durationMs,
    });
  }

  const scenes: TimelineScene[] = [];
  let cursor = 0;

  for (const group of input.sceneBlueprints) {
    for (const scene of group.scenes) {
      const audio = audioBySceneId.get(scene.sceneId);
      const image = imageBySceneId.get(scene.sceneId);
      const durationMs = audio?.durationMs ?? FALLBACK_SCENE_DURATION_MS;
      const startMs = cursor;
      const endMs = startMs + durationMs;

      scenes.push({
        objectId: group.objectId,
        sceneId: scene.sceneId,
        sceneType: scene.sceneType,
        startMs,
        endMs,
        durationMs,
        imageUrl: image,
        audioUrl: audio?.audioUrl,
        overlayText: scene.overlayText,
      });

      cursor = endMs;
    }
  }

  return {
    totalDurationMs: cursor,
    scenes,
  };
}
