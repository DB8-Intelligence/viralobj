export type ObjectTone =
  | 'dramatic'
  | 'funny'
  | 'emotional'
  | 'sarcastic'
  | 'motivational';

export interface ObjectBible {
  id: string;
  name: string;
  category: string;

  visual: {
    baseColor: string;
    material: string;
    texture?: string;
    shape: string;
  };

  face: {
    eyes: string;
    mouth: string;
    expressionBase: string;
  };

  body: {
    hasArms: boolean;
    hasLegs: boolean;
    armStyle?: string;
    legStyle?: string;
  };

  style: {
    rendering: 'pixar' | '3d_cartoon' | 'semi_realistic';
    lighting: string;
    mood: string;
  };

  voice: {
    tone: ObjectTone;
    pacing: string;
    emotion: string;
  };

  constraints: {
    mustKeep: string[];
    mustAvoid: string[];
  };
}
