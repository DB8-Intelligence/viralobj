import { ObjectBible } from './object-bible';
import { normalizeTone } from './normalize-tone';

interface VisualTraits {
  baseColor: string;
  shape: string;
  material?: string;
}

const OBJECT_VISUAL_LOOKUP: Record<string, VisualTraits> = {
  banana: {
    baseColor: "bright yellow with subtle brown stem",
    shape: "curved elongated fruit shape",
    material: "smooth organic peel",
  },
  tomate: {
    baseColor: "vivid red with green stem",
    shape: "round plump fruit shape",
    material: "shiny smooth skin",
  },
  abacate: {
    baseColor: "dark green outside, creamy yellow-green inside",
    shape: "oval pear-like fruit shape",
    material: "bumpy matte peel",
  },
  prato: {
    baseColor: "clean white porcelain",
    shape: "flat round dish with raised rim",
    material: "glossy ceramic",
  },
  panela: {
    baseColor: "brushed metallic silver",
    shape: "cylindrical pot with two side handles and a lid",
    material: "polished stainless steel",
  },
  vaso: {
    baseColor: "terracotta orange-brown",
    shape: "tapered cylindrical planter",
    material: "matte clay",
  },
  xicara: {
    baseColor: "white porcelain with a thin colored rim",
    shape: "small rounded cup with a curved handle",
    material: "glossy ceramic",
  },
  geladeira: {
    baseColor: "clean white with chrome handle",
    shape: "tall rectangular two-door appliance",
    material: "smooth matte enamel",
  },
  sofa: {
    baseColor: "soft beige upholstery",
    shape: "wide three-seat couch with plush cushions",
    material: "stitched fabric",
  },
  travesseiro: {
    baseColor: "soft white",
    shape: "plump rectangular pillow",
    material: "fluffy cotton fabric",
  },
  celular: {
    baseColor: "matte black with subtle reflections",
    shape: "flat rectangular smartphone with rounded corners",
    material: "glass front and aluminum frame",
  },
  notebook: {
    baseColor: "space gray aluminum",
    shape: "thin clamshell laptop",
    material: "brushed metal",
  },
  garrafa: {
    baseColor: "transparent glass with subtle green tint",
    shape: "tall cylindrical bottle with a narrow neck",
    material: "clear glass",
  },
  colher: {
    baseColor: "polished silver",
    shape: "elongated handle with an oval scoop",
    material: "shiny stainless steel",
  },
  cenoura: {
    baseColor: "vivid orange with green leafy top",
    shape: "tapered conical root vegetable",
    material: "slightly textured organic skin",
  },
};

const FALLBACK_TRAITS: VisualTraits = {
  baseColor: "natural object color",
  shape: "recognizable object silhouette",
  material: "slightly glossy stylized material",
};

function getObjectVisualTraits(objectName: string): VisualTraits {
  const key = objectName.trim().toLowerCase();
  return OBJECT_VISUAL_LOOKUP[key] ?? FALLBACK_TRAITS;
}

export function generateObjectBible(input: {
  object: string;
  niche: string;
  tone: string;
}): ObjectBible {
  const tone = normalizeTone(input.tone);
  const traits = getObjectVisualTraits(input.object);

  return {
    id: `${input.object}-${input.niche}`,

    name: input.object,
    category: input.niche,

    visual: {
      baseColor: traits.baseColor,
      material: traits.material ?? "slightly glossy plastic",
      shape: traits.shape
    },

    face: {
      eyes: "expressive cartoon eyes",
      mouth: "animated talking mouth",
      expressionBase: tone
    },

    body: {
      hasArms: true,
      hasLegs: false,
      armStyle: "cartoon flexible arms"
    },

    style: {
      rendering: "pixar",
      lighting: "soft cinematic lighting",
      mood: tone
    },

    voice: {
      tone: tone,
      pacing: "natural conversational",
      emotion: tone
    },

    constraints: {
      mustKeep: [
        "same color",
        "same character identity",
        "consistent face"
      ],
      mustAvoid: [
        "extra limbs",
        "realistic human skin",
        "distorted proportions"
      ]
    }
  };
}
