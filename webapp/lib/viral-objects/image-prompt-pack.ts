import { ObjectBible } from './object-bible';
import { SceneBlueprint } from './scene-blueprint';
import { buildVisualPrompt } from './prompt-builder';
import { findCharacterModel } from './character-models';

export interface SceneImagePrompt {
  objectId: string;
  sceneId: string;
  sceneType: 'intro' | 'dialogue' | 'reaction' | 'cta';
  prompt: string;
  /** Indica se usou modelo curado ou prompt genérico */
  promptSource: 'character-model' | 'llm-prompt' | 'object-bible';
}

export function buildSceneImagePromptPack(input: {
  objectBibles: ObjectBible[];
  sceneBlueprints: Array<{
    objectId: string;
    scenes: SceneBlueprint[];
  }>;
  /** Prompts do LLM (ai_prompt_midjourney) indexados por objectId */
  llmPrompts?: Record<string, string>;
  /** Nicho para buscar modelos pré-definidos */
  niche?: string;
}): SceneImagePrompt[] {
  const bibleIndex = new Map<string, ObjectBible>();
  for (const bible of input.objectBibles) {
    bibleIndex.set(bible.id, bible);
  }

  const pack: SceneImagePrompt[] = [];

  for (const group of input.sceneBlueprints) {
    const bible = bibleIndex.get(group.objectId);
    if (!bible) continue;

    const llmPrompt = input.llmPrompts?.[group.objectId];

    // Buscar modelo pré-definido pelo nome do objeto + nicho
    const model = input.niche
      ? findCharacterModel(bible.name, input.niche)
      : undefined;

    let promptSource: SceneImagePrompt['promptSource'] = 'object-bible';
    if (model) {
      promptSource = 'character-model';
      console.log(`[ImagePromptPack] Usando modelo curado: ${model.modelId} para ${bible.name}`);
    } else if (llmPrompt && llmPrompt.trim().length > 20) {
      promptSource = 'llm-prompt';
      console.log(`[ImagePromptPack] Usando prompt do LLM para ${bible.name}`);
    } else {
      console.log(`[ImagePromptPack] Fallback ObjectBible genérico para ${bible.name}`);
    }

    for (const scene of group.scenes) {
      pack.push({
        objectId: group.objectId,
        sceneId: scene.sceneId,
        sceneType: scene.sceneType,
        prompt: buildVisualPrompt(bible, scene, llmPrompt, model),
        promptSource,
      });
    }
  }

  return pack;
}
