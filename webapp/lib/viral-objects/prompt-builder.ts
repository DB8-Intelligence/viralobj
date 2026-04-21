import { ObjectBible } from './object-bible';
import { SceneBlueprint } from './scene-blueprint';
import {
  CharacterModel,
  buildModelPrompt,
  resolveExpression,
} from './character-models';

function isSceneBlueprint(scene: string | SceneBlueprint): scene is SceneBlueprint {
  return typeof scene === 'object' && scene !== null && 'sceneId' in scene;
}

/**
 * Constrói o prompt visual para FLUX Pro.
 *
 * Prioridade:
 * 1. CharacterModel pré-definido (curado e testado) — MELHOR resultado
 * 2. LLM ai_prompt_midjourney — quando modelo não existe
 * 3. ObjectBible genérico — fallback final
 */
export function buildVisualPrompt(
  bible: ObjectBible,
  scene: string | SceneBlueprint,
  llmPrompt?: string,
  model?: CharacterModel,
) {
  // ─── PRIORIDADE 1: CharacterModel pré-definido ───────────────────
  if (model && isSceneBlueprint(scene)) {
    const expressionKey = resolveExpression(
      scene.expressionOverride ?? bible.face.expressionBase,
      scene.sceneType,
    );
    return buildModelPrompt(model, scene.sceneType, expressionKey);
  }

  if (model && !isSceneBlueprint(scene)) {
    // Cena como string — usa modelo com scene type 'dialogue' como default
    const expressionKey = resolveExpression(bible.face.expressionBase, 'dialogue');
    return buildModelPrompt(model, 'dialogue', expressionKey);
  }

  // ─── PRIORIDADE 2: LLM ai_prompt_midjourney ──────────────────────
  if (llmPrompt && llmPrompt.trim().length > 20) {
    if (!isSceneBlueprint(scene)) {
      return `${llmPrompt.trim()},

scene: ${scene},

ultra-realistic Pixar 3D render, 8K cinematic, aspect ratio 9:16`;
    }

    const expression = scene.expressionOverride ?? bible.face.expressionBase;
    const overlayLine = scene.overlayText
      ? `\noverlay text on screen: "${scene.overlayText}",`
      : '';

    return `${llmPrompt.trim()},

scene type: ${scene.sceneType},
environment: ${scene.environment},
camera angle: ${scene.camera},
character action: ${scene.action},
facial expression: ${expression},${overlayLine}

ultra-realistic Pixar 3D render, 8K cinematic, aspect ratio 9:16`;
  }

  // ─── PRIORIDADE 3: ObjectBible genérico (fallback) ────────────────
  if (!isSceneBlueprint(scene)) {
    return `
${bible.name} as a 3D animated character,
pixar style,
base color: ${bible.visual.baseColor},
shape: ${bible.visual.shape},
material: ${bible.visual.material},
eyes: ${bible.face.eyes},
mouth: ${bible.face.mouth},
base expression: ${bible.face.expressionBase},

scene: ${scene},

lighting: ${bible.style.lighting},
mood: ${bible.style.mood},

high quality, cinematic, 9:16

KEEP CONSISTENT:
${bible.constraints.mustKeep.join(", ")}

AVOID:
${bible.constraints.mustAvoid.join(", ")}
`;
  }

  const expression = scene.expressionOverride ?? bible.face.expressionBase;
  const overlayLine = scene.overlayText
    ? `\noverlay text: ${scene.overlayText},`
    : '';

  return `
${bible.name} as a 3D animated character,
pixar style,
base color: ${bible.visual.baseColor},
shape: ${bible.visual.shape},
material: ${bible.visual.material},
eyes: ${bible.face.eyes},
mouth: ${bible.face.mouth},
base expression: ${bible.face.expressionBase},

scene type: ${scene.sceneType},
environment: ${scene.environment},
camera: ${scene.camera},
action: ${scene.action},
expression override: ${expression},${overlayLine}

lighting: ${bible.style.lighting},
mood: ${bible.style.mood},

high quality, cinematic, 9:16

KEEP CONSISTENT:
${bible.constraints.mustKeep.join(", ")}

AVOID:
${bible.constraints.mustAvoid.join(", ")}
`;
}
