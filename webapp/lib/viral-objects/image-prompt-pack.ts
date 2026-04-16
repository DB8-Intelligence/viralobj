import { ObjectBible } from './object-bible';
import { SceneBlueprint } from './scene-blueprint';
import { buildVisualPrompt } from './prompt-builder';

export interface SceneImagePrompt {
  objectId: string;
  sceneId: string;
  sceneType: 'intro' | 'dialogue' | 'reaction' | 'cta';
  prompt: string;
}

export function buildSceneImagePromptPack(input: {
  objectBibles: ObjectBible[];
  sceneBlueprints: Array<{
    objectId: string;
    scenes: SceneBlueprint[];
  }>;
}): SceneImagePrompt[] {
  const bibleIndex = new Map<string, ObjectBible>();
  for (const bible of input.objectBibles) {
    bibleIndex.set(bible.id, bible);
  }

  const pack: SceneImagePrompt[] = [];

  for (const group of input.sceneBlueprints) {
    const bible = bibleIndex.get(group.objectId);
    if (!bible) continue;

    for (const scene of group.scenes) {
      pack.push({
        objectId: group.objectId,
        sceneId: scene.sceneId,
        sceneType: scene.sceneType,
        prompt: buildVisualPrompt(bible, scene),
      });
    }
  }

  return pack;
}
