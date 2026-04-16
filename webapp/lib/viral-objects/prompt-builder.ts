import { ObjectBible } from './object-bible';
import { SceneBlueprint } from './scene-blueprint';

function isSceneBlueprint(scene: string | SceneBlueprint): scene is SceneBlueprint {
  return typeof scene === 'object' && scene !== null && 'sceneId' in scene;
}

export function buildVisualPrompt(
  bible: ObjectBible,
  scene: string | SceneBlueprint
) {
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
