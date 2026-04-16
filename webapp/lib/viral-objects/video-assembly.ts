import type { VideoTimeline } from './video-timeline';

export type SceneType = "intro" | "dialogue" | "reaction" | "cta";

export interface VideoAssemblyScene {
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

export interface VideoAssembly {
  generationId: string;
  totalDurationMs: number;
  scenes: VideoAssemblyScene[];
}

export function buildVideoAssembly(input: {
  generationId: string;
  timeline: VideoTimeline;
}): VideoAssembly {
  return {
    generationId: input.generationId,
    totalDurationMs: input.timeline.totalDurationMs,
    scenes: input.timeline.scenes.map((s) => ({
      objectId: s.objectId,
      sceneId: s.sceneId,
      sceneType: s.sceneType,
      startMs: s.startMs,
      endMs: s.endMs,
      durationMs: s.durationMs,
      imageUrl: s.imageUrl,
      audioUrl: s.audioUrl,
      overlayText: s.overlayText,
    })),
  };
}
