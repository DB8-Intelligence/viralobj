export interface SceneBlueprint {
  sceneId: string;
  objectId: string;
  sceneType: 'intro' | 'dialogue' | 'reaction' | 'cta';
  environment: string;
  camera: string;
  action: string;
  expressionOverride?: string;
  overlayText?: string;
}

export function buildSceneBlueprint(input: {
  objectId: string;
  sceneType: 'intro' | 'dialogue' | 'reaction' | 'cta';
  topic: string;
  tone: string;
  niche: string;
}): SceneBlueprint {
  const baseMap = {
    intro: {
      environment: `contextual ${input.niche} environment`,
      camera: 'medium shot, centered framing',
      action: `introducing the topic: ${input.topic}`
    },
    dialogue: {
      environment: `contextual ${input.niche} environment`,
      camera: 'medium close-up, expressive framing',
      action: `speaking emphatically about ${input.topic}`
    },
    reaction: {
      environment: `same scene environment`,
      camera: 'close-up reaction shot',
      action: `strong emotional reaction about ${input.topic}`
    },
    cta: {
      environment: `same branded ${input.niche} environment`,
      camera: 'hero shot, direct eye contact',
      action: `final call to action about ${input.topic}`
    }
  };

  const selected = baseMap[input.sceneType];

  return {
    sceneId: `${input.objectId}-${input.sceneType}`,
    objectId: input.objectId,
    sceneType: input.sceneType,
    environment: selected.environment,
    camera: selected.camera,
    action: selected.action,
    expressionOverride: input.tone
  };
}
