/**
 * character-models.ts
 *
 * Biblioteca de modelos visuais pré-definidos para Talking Objects.
 * Cada modelo contém prompts testados e validados para gerar imagens
 * consistentes no estilo Pixar/Disney 3D via FLUX Pro ou Leonardo AI.
 *
 * Prioridade na geração de prompts:
 *   1. CharacterModel (este arquivo) — prompts curados e testados
 *   2. LLM ai_prompt_midjourney — quando modelo não existe
 *   3. ObjectBible genérico — fallback final
 */

// ─── Tipos ──────────────────────────────────────────────────────────

export type BodyType =
  | "MULTI-STUB"    // braços stub, sem pernas (casa, plantas)
  | "SINGLE-FULL"   // corpo inteiro com pernas
  | "DRESSED-CHAR"  // corpo humano, cabeça de objeto (financeiro)
  | "MAP-DOC"       // documento com pernas
  | "RECIPE-MAGIC"  // tutorial + partículas (culinaria)
  | "STICK-SPICE"   // pau/raiz/especiaria (canela, gengibre)
  | "LEAF-HERB"     // folha/erva (hortelã, chá verde)
  | "FLOWER-PETAL"  // flor/pétala (camomila, hibisco, lavanda, dente-de-leão)
  | "CATALOG-EDUCATOR" // personagem educador em formato catálogo serial
  | "ANIMAL-ANTHROPOMORPHIC-CHEF"; // animal antropomórfico chef (galo, porco, etc.)

export type ExpressionKey =
  | "angry" | "surprised" | "happy" | "sad"
  | "sarcastic" | "dramatic" | "motivated"
  | "scared" | "proud" | "disgusted"
  | "calm" | "sleepy" | "warm" | "educational";

export interface CharacterModel {
  /** ID único: {objectId}-{niche} */
  modelId: string;
  objectNamePt: string;
  objectNameEn: string;
  niche: string;
  bodyType: BodyType;

  /** Prompt base — template com placeholders {expression}, {mouth}, {environment} */
  promptBase: string;

  /** Expressões faciais pré-definidas */
  expressions: Partial<Record<ExpressionKey, string>>;

  /** Templates de cena por tipo */
  scenes: Record<"intro" | "dialogue" | "reaction" | "cta", string>;

  /** Ambientes padrão por contexto */
  environments: {
    default: string;
    outdoor?: string;
    studio?: string;
  };

  /** Regras de consistência visual */
  consistencyRules: string[];
}

// ─── Guia de Estilo Visual (derivado da análise de 122 amostras) ────

/**
 * Regras de estilo injetadas automaticamente em todo prompt.
 * Baseado na análise de @dica_dos_dia (1M), @objetosdodia (482K),
 * @dinheirofalante (300K+) e mais 5 contas virais.
 */
const STYLE_RULES = {
  /** Olhos — elemento #1 para viralização */
  eyes: "oversized expressive cartoon eyes with bright catchlight reflections, large detailed pupils, eyes occupy 35% of face",
  /** Qualidade de render */
  quality: "ultra-realistic Pixar Disney 3D render, hyper-detailed textures, ray tracing global illumination",
  /** Câmera e composição */
  camera: "shallow depth of field f/2.8, soft bokeh background, 9:16 vertical, 8K",
  /** Iluminação padrão */
  lighting: "warm golden hour cinematic lighting, soft rim light on character edges",
  /** Proibições */
  negativePrompt: "no flat colors, no low quality, no blurry, no generic cartoon, no white background, no floating in void",
} as const;

/** Mapa de material: detecta e injeta textura realista */
const MATERIAL_ENHANCERS: Record<string, string> = {
  plastic: "realistic glossy plastic surface with subtle reflections and light transparency",
  metal: "polished metallic surface with clear reflections and realistic chrome finish",
  ceramic: "smooth ceramic surface with subtle glaze variations and porcelain sheen",
  glass: "transparent glass with realistic refraction and light caustics",
  fabric: "detailed woven fabric texture with individual thread visibility and realistic folds",
  wood: "natural wood grain texture with visible knots and warm tones",
  paper: "matte paper surface with subtle fiber texture and slight creases",
  organic: "natural organic surface with realistic pores and color gradients",
};

function detectMaterial(promptBase: string): string | undefined {
  const lower = promptBase.toLowerCase();
  if (lower.includes("plastic")) return MATERIAL_ENHANCERS.plastic;
  if (lower.includes("metal") || lower.includes("steel") || lower.includes("iron")) return MATERIAL_ENHANCERS.metal;
  if (lower.includes("ceramic") || lower.includes("porcelain")) return MATERIAL_ENHANCERS.ceramic;
  if (lower.includes("glass") || lower.includes("transparent")) return MATERIAL_ENHANCERS.glass;
  if (lower.includes("fabric") || lower.includes("cloth") || lower.includes("woven")) return MATERIAL_ENHANCERS.fabric;
  if (lower.includes("wood") || lower.includes("wooden")) return MATERIAL_ENHANCERS.wood;
  if (lower.includes("paper") || lower.includes("document")) return MATERIAL_ENHANCERS.paper;
  if (lower.includes("plant") || lower.includes("leaf") || lower.includes("petal") || lower.includes("fruit")) return MATERIAL_ENHANCERS.organic;
  return undefined;
}

// ─── Helper: monta prompt final a partir do modelo ──────────────────

export function buildModelPrompt(
  model: CharacterModel,
  sceneType: "intro" | "dialogue" | "reaction" | "cta",
  expressionKey?: ExpressionKey,
  environmentOverride?: string,
): string {
  const expression = expressionKey
    ? (model.expressions[expressionKey] ?? `${expressionKey} expression`)
    : "expressive animated face";

  const environment = environmentOverride ?? model.environments.default;
  const sceneDirections = model.scenes[sceneType];

  // Substituir placeholders no promptBase
  let prompt = model.promptBase
    .replace(/\{expression\}/g, expression)
    .replace(/\{environment\}/g, environment)
    .replace(/\{scene\}/g, sceneDirections);

  // Adicionar direções de cena se não estão no promptBase
  if (!model.promptBase.includes("{scene}")) {
    prompt += `, ${sceneDirections}`;
  }

  // ─── Injetar regras de estilo automaticamente ──────────────────
  // Olhos (se não presentes no prompt)
  if (!prompt.toLowerCase().includes("catchlight")) {
    prompt += `, ${STYLE_RULES.eyes}`;
  }

  // Material realista detectado automaticamente
  const materialEnhancer = detectMaterial(model.promptBase);
  if (materialEnhancer) {
    prompt += `, ${materialEnhancer}`;
  }

  // Iluminação (se não presente)
  if (!prompt.toLowerCase().includes("golden hour") && !prompt.toLowerCase().includes("cinematic lighting")) {
    prompt += `, ${STYLE_RULES.lighting}`;
  }

  // Qualidade de render (substitui qualquer sufixo genérico existente)
  // Remove sufixos antigos e adiciona o padronizado
  prompt = prompt
    .replace(/,?\s*Pixar\/Disney 3D render style\s*—?\s*/gi, ", ")
    .replace(/,?\s*Disney\/Pixar 3D render[^,]*/gi, ", ")
    .replace(/,?\s*Disney Pixar 3D render[^,]*/gi, ", ")
    .replace(/,?\s*ultra-realistic 3D animation,?\s*/gi, ", ")
    .replace(/,?\s*9:16 vertical,?\s*/gi, ", ")
    .replace(/,?\s*8K\s*$/gi, "")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*$/, "");

  prompt += `, ${STYLE_RULES.quality}, ${STYLE_RULES.camera}`;

  return prompt;
}

// ─── Expressão baseada no tone ──────────────────────────────────────

const TONE_TO_EXPRESSION: Record<string, ExpressionKey> = {
  dramatic: "dramatic",
  funny: "surprised",
  emotional: "sad",
  sarcastic: "sarcastic",
  motivational: "motivated",
  educational: "educational",
  calm: "calm",
  warm: "warm",
  sleepy: "sleepy",
};

const SCENE_TO_EXPRESSION: Record<string, ExpressionKey> = {
  intro: "surprised",
  dialogue: "dramatic",
  reaction: "angry",
  cta: "happy",
};

export function resolveExpression(
  tone: string,
  sceneType: string,
): ExpressionKey {
  return TONE_TO_EXPRESSION[tone] ?? SCENE_TO_EXPRESSION[sceneType] ?? "dramatic";
}

// ─── Biblioteca de Modelos ──────────────────────────────────────────

const CHARACTER_MODELS: CharacterModel[] = [
  // ═══════════════════════════════════════════════════════════════════
  // NICHO: CASA (10 objetos)
  // ═══════════════════════════════════════════════════════════════════
  {
    modelId: "agua-sanitaria-casa",
    objectNamePt: "Água Sanitária",
    objectNameEn: "Bleach Bottle",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated bleach bottle character with {expression}, tall white glossy plastic body with realistic label texture and blue screw cap on top like a hat, small stubby Mickey Mouse gloved arms from sides, no legs sits on flat bottom, face embedded in label area with oversized cartoon eyes with bright catchlight reflections, {environment}, {scene}",
    expressions: {
      angry: "furious squinting eyes and gritted teeth, steam rising from cap",
      surprised: "big round shocked eyes and wide open mouth, cap slightly popping",
      happy: "wide cheerful smile with sparkling eyes, rosy cheeks on label",
      sad: "droopy half-closed eyes with single tear drop, downturned mouth",
      sarcastic: "half-closed smirking eyes, raised single eyebrow, side smile",
      dramatic: "intense wide eyes with dramatic rim lighting, mouth mid-speech",
      motivated: "confident grin, determined eyebrows, one arm raised in fist",
    },
    scenes: {
      intro: "full body shot centered, looking directly at camera with confident pose, warm kitchen lighting",
      dialogue: "medium close-up, speaking emphatically with one arm gesturing, slight dutch angle",
      reaction: "extreme close-up on face, dramatic rim lighting, intense expression",
      cta: "full body hero shot, pointing at camera with one arm, bright motivational lighting",
    },
    environments: {
      default: "modern Brazilian kitchen counter with cleaning supplies in background, soft afternoon light",
      outdoor: "backyard laundry area with clothesline, sunny day",
      studio: "clean gradient background with soft studio lighting",
    },
    consistencyRules: [
      "body is white plastic bottle with blue accents",
      "face is on the front label area",
      "cap is always blue, sits on top like a hat",
      "arms are small white-gloved stumps from sides",
      "no legs — bottle sits on flat bottom",
    ],
  },
  {
    modelId: "lixeira-casa",
    objectNamePt: "Lixeira",
    objectNameEn: "Trash Can",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated kitchen trash can character with {expression}, polished metallic silver cylindrical body with realistic brushed steel texture, step pedal visible at base, flip lid on top animates like a mouth or hat, small stubby Mickey Mouse gloved arms from sides, face on upper front of can with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      angry: "furious squinting eyes, gritted teeth, lid rattling with anger",
      surprised: "big shocked round eyes, lid popping open, jaw dropped",
      happy: "wide smile, sparkling eyes, lid slightly tilted like a happy hat",
      sarcastic: "half-closed eyes, smug smirk, lid tilted at cocky angle",
      dramatic: "intense staring eyes, dramatic side lighting, mouth mid-rant",
      disgusted: "scrunched nose, tongue sticking out, revolted expression",
    },
    scenes: {
      intro: "full body centered, kitchen floor setting, looking at camera with attitude",
      dialogue: "medium close-up, lid animated like mouth, one arm gesturing",
      reaction: "close-up face, extreme expression, dramatic lighting",
      cta: "full body, pointing at camera, encouraging pose",
    },
    environments: {
      default: "modern Brazilian kitchen floor near counter, warm interior light",
    },
    consistencyRules: [
      "metallic silver cylindrical body",
      "step pedal visible at base",
      "flip lid acts as hat/hair, animates with expressions",
      "face is on the upper front of the can body",
    ],
  },
  {
    modelId: "celular-casa",
    objectNamePt: "Celular",
    objectNameEn: "Smartphone",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated smartphone character with {expression}, sleek matte black glass and aluminum body standing upright, glowing screen as face with oversized cartoon eyes displayed on screen, realistic glass reflections and bezels, small stubby Mickey Mouse gloved arms from sides, no legs stands on flat bottom edge, {environment}, {scene}",
    expressions: {
      angry: "furious red-tinted screen face, squinting pixel eyes, gritted teeth",
      surprised: "big shocked round eyes on screen, open mouth, notification pop-up floating",
      happy: "bright blue screen, wide smile, sparkling eyes, little hearts floating",
      sarcastic: "dim screen, half-closed eyes, smug pixelated smirk",
      dramatic: "cracked screen edge, intense eyes, dramatic glare on glass",
    },
    scenes: {
      intro: "full body standing upright on table, looking at camera, modern room",
      dialogue: "medium close-up, screen face expressive, one arm gesturing",
      reaction: "extreme close-up on screen face, dramatic lighting reflection",
      cta: "full body, pointing at camera, screen showing call-to-action",
    },
    environments: {
      default: "modern Brazilian living room side table, cozy warm afternoon light",
    },
    consistencyRules: [
      "matte black body, face is ON the screen",
      "screen glows with the expression colors",
      "rounded corners, thin profile",
      "stands upright like a person",
    ],
  },
  {
    modelId: "esponja-casa",
    objectNamePt: "Esponja",
    objectNameEn: "Sponge",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated kitchen sponge character with {expression}, yellow porous rectangular body with realistic sponge texture and visible pores, green scrubby back layer visible, small stubby Mickey Mouse gloved arms from sides, face embedded in yellow front with oversized cartoon eyes, soap bubbles floating around as environmental detail, {environment}, {scene}",
    expressions: {
      angry: "furious squinting eyes, gritted teeth, soap bubbles popping angrily around",
      surprised: "big round eyes, wide open mouth, water drops splashing",
      happy: "cheerful wide smile, bubbles floating happily, sparkling clean",
      dramatic: "wet intense eyes, dramatic dripping, mouth mid-speech",
      sarcastic: "half-closed eyes, smug smile, one eyebrow raised, dry sponge attitude",
    },
    scenes: {
      intro: "full body on kitchen sink edge, looking at camera, soapy bubbles around",
      dialogue: "medium close-up, squeezing slightly with expression, arm gesturing",
      reaction: "close-up face, bubbles and water drops flying, intense expression",
      cta: "full body, triumphant pose, sparkling clean background",
    },
    environments: {
      default: "Brazilian kitchen sink with dishes, warm light from window, soap bubbles floating",
    },
    consistencyRules: [
      "yellow porous body on front, green scrubby on back",
      "rectangular shape, slightly squeezable looking",
      "soap bubbles often present as environmental detail",
      "face on the yellow front side",
    ],
  },
  {
    modelId: "panela-casa",
    objectNamePt: "Panela",
    objectNameEn: "Cooking Pot",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated cooking pot character with {expression}, polished stainless steel cylindrical body with realistic chrome reflections, two side handles like ears, metal lid on top tilted like a beret, small stubby Mickey Mouse gloved arms, realistic steam rising from top, face on front of pot with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      angry: "furious eyes, steam blasting from under lid, rattling with rage",
      surprised: "big shocked eyes, lid popping up with steam burst, wide mouth",
      happy: "warm smile, gentle steam curling up, cozy welcoming face",
      dramatic: "intense boiling eyes, dramatic steam clouds, mouth mid-speech",
    },
    scenes: {
      intro: "full body on stove top, burner glowing underneath, looking at camera",
      dialogue: "medium close-up, steam rising, one arm gesturing while talking",
      reaction: "close-up, lid rattling, extreme expression, steam effects",
      cta: "full body hero shot, confident pose on stove, inviting expression",
    },
    environments: {
      default: "Brazilian kitchen stovetop with ingredients nearby, warm cooking light, steam atmosphere",
    },
    consistencyRules: [
      "polished stainless steel body",
      "two handles on sides look like ears",
      "lid sits on top like a hat, animates with expressions",
      "steam is a key visual element, varies with emotion",
    ],
  },
  {
    modelId: "vaso-casa",
    objectNamePt: "Vaso Sanitário",
    objectNameEn: "Toilet",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated toilet character with {expression}, glossy white porcelain body with realistic ceramic glaze and subtle reflections, lid open behind head like a hoodie, seat as collar detail, small stubby Mickey Mouse gloved arms, face on front of tank with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      angry: "furious squinting eyes, gritted teeth, flush handle rattling",
      surprised: "big shocked eyes, lid slamming open, water splashing slightly",
      happy: "sparkling clean smile, gleaming white porcelain, rosy cheeks",
      disgusted: "scrunched face, green tint, revolted expression, tongue out",
      dramatic: "intense dramatic eyes, blue water glow from bowl, serious face",
    },
    scenes: {
      intro: "full body in clean bathroom, looking at camera, confident stance",
      dialogue: "medium close-up, lid animated as eyebrow, arm gesturing",
      reaction: "close-up face, dramatic bathroom lighting, extreme expression",
      cta: "full body, sparkling clean, pointing at camera, bright lighting",
    },
    environments: {
      default: "modern clean Brazilian bathroom with tiles, soft diffused light, spotless setting",
    },
    consistencyRules: [
      "white porcelain body, always clean looking",
      "lid acts as hood/hair behind head",
      "face on the front of the tank",
      "flush handle visible on side",
    ],
  },
  {
    modelId: "vassoura-casa",
    objectNamePt: "Vassoura",
    objectNameEn: "Broom",
    niche: "casa",
    bodyType: "SINGLE-FULL",
    promptBase: "Animated broom character with {expression}, long wooden handle body with realistic wood grain texture, natural straw bristles at bottom like a flowing skirt, face near top of handle with oversized cartoon eyes, small stubby Mickey Mouse gloved arms from handle sides, bristles touch floor as feet, {environment}, {scene}",
    expressions: {
      angry: "furious eyes, bristles stiffening with rage, gritted teeth",
      surprised: "big round eyes, bristles splaying outward, open mouth",
      happy: "cheerful smile, bristles swishing happily, sparkling clean floor",
      dramatic: "intense eyes, dramatic sweeping pose, dust particles in light beams",
    },
    scenes: {
      intro: "full body standing tall, bristles touching floor, looking at camera",
      dialogue: "medium shot, leaning forward speaking, one arm out",
      reaction: "close-up face near handle top, intense expression",
      cta: "full body sweeping pose, confident, pointing at camera",
    },
    environments: {
      default: "Brazilian house living room floor, afternoon light casting long shadows, dust visible in light",
    },
    consistencyRules: [
      "wooden handle is the body/torso",
      "face near top of handle",
      "bristles at bottom act as skirt/feet",
      "tall and thin proportions",
    ],
  },
  {
    modelId: "detergente-casa",
    objectNamePt: "Detergente",
    objectNameEn: "Dish Soap",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated dish soap bottle character with {expression}, translucent green plastic body with visible liquid soap swirling inside, squeeze cap on top like a hat, realistic glossy plastic with light refraction through green liquid, small stubby Mickey Mouse gloved arms, face on front of bottle with oversized cartoon eyes, rainbow soap bubbles floating around, {environment}, {scene}",
    expressions: {
      angry: "furious eyes, cap popping open with pressure, soap bubbling at top",
      surprised: "big shocked round eyes, squeeze of soap squirting up, wide mouth",
      happy: "bubbly cheerful smile, rainbow soap bubbles floating, sparkling eyes",
      sarcastic: "half-closed eyes, smirk, one eyebrow raised, cap tilted",
      dramatic: "intense eyes, dramatic soap drip, mouth mid-speech",
    },
    scenes: {
      intro: "full body on kitchen counter near sink, soap bubbles floating, looking at camera",
      dialogue: "medium close-up, soap liquid swirling inside body, arm gesturing",
      reaction: "close-up face, bubbles popping, extreme expression",
      cta: "full body, heroic pose, sparkling dishes in background",
    },
    environments: {
      default: "kitchen sink area with dishes and running water, soap bubbles, warm light",
    },
    consistencyRules: [
      "translucent green body showing liquid inside",
      "cap on top acts as hat/hair",
      "soap bubbles as environmental element",
      "face on front of bottle",
    ],
  },
  {
    modelId: "prato-casa",
    objectNamePt: "Prato",
    objectNameEn: "Plate",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated dinner plate character with {expression}, white glossy porcelain round flat body standing upright on edge with realistic ceramic glaze, decorative rim as hat brim detail, small stubby Mickey Mouse gloved arms, face in center of plate with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      angry: "furious cracked expression, chips flying, intense eyes",
      surprised: "big round eyes, mouth wide open, wobbling on edge",
      happy: "sparkling clean smile, gleaming surface, rosy cheeks",
      dramatic: "intense eyes, dramatic food stain on face like war paint, serious",
    },
    scenes: {
      intro: "standing upright on dish rack, kitchen background, looking at camera",
      dialogue: "medium close-up, wobbling slightly while talking, arm gesturing",
      reaction: "close-up face, dramatic reflection lighting, extreme expression",
      cta: "full body, sparkling clean, proud confident pose",
    },
    environments: {
      default: "kitchen dish rack or dining table, warm homey Brazilian kitchen light",
    },
    consistencyRules: [
      "white porcelain, round flat body",
      "stands upright on edge",
      "decorative rim visible",
      "face in center of plate",
    ],
  },
  {
    modelId: "pano-chao-casa",
    objectNamePt: "Pano de Chão",
    objectNameEn: "Floor Cloth",
    niche: "casa",
    bodyType: "MULTI-STUB",
    promptBase: "Animated floor cloth character with {expression}, damp gray-white woven fabric body with realistic thread texture and wrinkles, slightly raised from floor with face looking up at camera, small stubby Mickey Mouse gloved arms, face woven into fabric with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      angry: "furious wrinkled eyes, gritted teeth, wringing itself with rage",
      surprised: "big round eyes looking up, mouth wide open, fabric rippling",
      happy: "cheerful smile, freshly washed look, sparkling clean",
      dramatic: "intense tired eyes, dramatic floor-level angle, worn but determined",
    },
    scenes: {
      intro: "lying on floor looking up at camera, bathroom tiles, low angle shot",
      dialogue: "medium shot, partially raised, one arm gesturing",
      reaction: "close-up face, floor-level dramatic angle, extreme expression",
      cta: "raised up triumphantly, clean and fresh, confident pose",
    },
    environments: {
      default: "Brazilian bathroom or laundry floor, tiles visible, mop bucket nearby, low angle",
    },
    consistencyRules: [
      "woven fabric texture visible",
      "slightly damp looking, wrinkled",
      "gray-white color palette",
      "face woven into the fabric",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NICHO: PLANTAS (8 objetos)
  // ═══════════════════════════════════════════════════════════════════
  {
    modelId: "rosa-plantas",
    objectNamePt: "Rosa",
    objectNameEn: "Rose",
    niche: "plantas",
    bodyType: "SINGLE-FULL",
    promptBase: "Cute animated rose flower character with {expression}, vibrant red rose petals as hair/head, green stem body with small thorns, leaves as hands, small green leaf shoes, standing in terracotta pot, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      angry: "furious thorny expression, petals bristling, intense red glow",
      surprised: "big dewy round eyes, petals opening wide, mouth agape",
      happy: "blooming cheerful smile, petals fully open and vibrant, sparkles",
      dramatic: "intense dramatic eyes, single petal falling like a tear, deep red glow",
      sad: "wilting slightly, droopy petals, dewy tearful eyes",
    },
    scenes: {
      intro: "full body in terracotta pot on windowsill, sunlight streaming in, looking at camera",
      dialogue: "medium close-up, one leaf-hand gesturing, petals animated",
      reaction: "close-up on rose face, dramatic petal movement, intense expression",
      cta: "full body, blooming fully, confident beautiful pose, bright light",
    },
    environments: {
      default: "sunny Brazilian apartment windowsill with other potted plants, warm golden light",
      outdoor: "lush garden with tropical plants, morning dew, golden hour",
    },
    consistencyRules: [
      "red rose petals form the hair/crown",
      "green stem is the body",
      "thorns visible but cute, not threatening",
      "leaves act as hands",
    ],
  },
  {
    modelId: "cacto-plantas",
    objectNamePt: "Cacto",
    objectNameEn: "Cactus",
    niche: "plantas",
    bodyType: "MULTI-STUB",
    promptBase: "Animated cactus character with {expression}, bright green barrel body with realistic spine texture as stubble, round plump shape with natural ridges, small pink flower blooming on top as hat, sitting in rustic terracotta clay pot, small stubby arms from body, face embedded in green surface with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      angry: "furious squinting eyes, spines stiffening, gritted teeth",
      surprised: "big round eyes, spines standing up, flower popping off top",
      happy: "big warm smile, flower blooming on top, rosy cheeks despite spines",
      sarcastic: "half-closed eyes, dry smirk, one raised eyebrow, unfazed expression",
      dramatic: "intense desert-sun eyes, dramatic shadow, mouth mid-rant",
    },
    scenes: {
      intro: "full body in clay pot on shelf, dry warm setting, looking at camera",
      dialogue: "medium close-up, small arm gesturing, spines animated",
      reaction: "close-up face, spines bristling, extreme expression",
      cta: "full body, confident pose, flower blooming, bright light",
    },
    environments: {
      default: "bright Brazilian apartment shelf with other succulents, warm dry light",
      outdoor: "sunny desert-style garden, harsh beautiful light",
    },
    consistencyRules: [
      "bright green barrel-shaped body",
      "spines visible as texture, cute not threatening",
      "small flower on top as accessory",
      "rustic clay pot",
    ],
  },
  {
    modelId: "samambaia-plantas",
    objectNamePt: "Samambaia",
    objectNameEn: "Fern",
    niche: "plantas",
    bodyType: "MULTI-STUB",
    promptBase: "Animated hanging fern plant character with {expression}, dark chocolate-brown ceramic pot body with realistic matte clay texture hanging in natural macramé rope hanger, lush cascading green fronds as wild flowing hair, small stubby arms outstretched from pot sides, face on front of pot with oversized cartoon eyes with bright catchlight reflections, {environment}, {scene}",
    expressions: {
      angry: "furious squinting eyes, fronds bristling upward, gritted teeth",
      surprised: "big surprised round eyes and open mouth expression, fronds splaying outward",
      happy: "wide cheerful smile, lush green fronds flowing beautifully, sparkling dewdrops",
      sad: "droopy eyes, wilting fronds, yellowing leaf tears",
      dramatic: "intense eyes, dramatic backlight through fronds, mouth mid-speech",
    },
    scenes: {
      intro: "full body hanging from macramé, fronds cascading, looking down at camera, warm light",
      dialogue: "medium close-up, fronds swaying as she talks, one arm gesturing",
      reaction: "close-up face on pot, fronds reacting wildly, extreme expression",
      cta: "full body hanging, healthy and vibrant, confident inviting expression",
    },
    environments: {
      default: "modern Brazilian apartment balcony with couch and other plants visible, warm afternoon natural light",
      outdoor: "tropical garden patio with hanging plants, dappled sunlight",
    },
    consistencyRules: [
      "dark chocolate-brown ceramic pot body",
      "macramé rope hanger always visible",
      "green fronds cascade like hair",
      "face on the front of the pot",
      "arms are small stumps from pot sides",
    ],
  },
  {
    modelId: "orquidea-plantas",
    objectNamePt: "Orquídea",
    objectNameEn: "Orchid",
    niche: "plantas",
    bodyType: "SINGLE-FULL",
    promptBase: "Cute animated orchid character with {expression}, elegant white and purple orchid flower as face/head, thin graceful green stem body, aerial roots as flowing dress details, standing in elegant white ceramic pot, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      surprised: "big elegant round eyes, petals opening in shock, mouth agape",
      happy: "graceful gentle smile, petals blooming, soft glow",
      sarcastic: "half-closed sophisticated eyes, petal smirk, diva attitude",
      dramatic: "intense elegant eyes, dramatic petal movement, regal expression",
      sad: "wilting petals, dewy sad eyes, dropping flower head",
    },
    scenes: {
      intro: "full body in white pot, elegant living room, looking at camera with poise",
      dialogue: "medium close-up, delicate gestures, petals expressing emotion",
      reaction: "close-up flower face, dramatic petal flutter, extreme expression",
      cta: "full body, full bloom, elegant confident pose, soft beautiful light",
    },
    environments: {
      default: "elegant Brazilian apartment living room, soft diffused natural light, minimalist decor",
    },
    consistencyRules: [
      "white and purple flower petals as face/head",
      "thin graceful green stem body",
      "elegant and sophisticated character",
      "white ceramic pot, upscale setting",
    ],
  },
  {
    modelId: "suculenta-plantas",
    objectNamePt: "Suculenta",
    objectNameEn: "Succulent",
    niche: "plantas",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated succulent character with {expression}, compact rosette of thick fleshy green-teal leaves as body and hair, chubby round shape, sitting in small geometric concrete pot, small stumpy arms from lower leaves, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "big cheerful smile, plump healthy leaves, rosy pink leaf tips",
      surprised: "big round eyes, leaves perking up, chubby cheeks",
      sarcastic: "half-closed chill eyes, unbothered smirk, zen attitude",
      dramatic: "intense eyes, one dried lower leaf falling dramatically, serious face",
      angry: "squinting eyes, leaves closing defensively, gritted teeth",
    },
    scenes: {
      intro: "full body in geometric pot on desk, modern setting, looking at camera",
      dialogue: "medium close-up, chubby body wiggling slightly, arm gesturing",
      reaction: "close-up face among leaves, extreme expression, macro detail",
      cta: "full body, healthy and plump, confident pose, bright desk light",
    },
    environments: {
      default: "modern work desk with books and other small plants, bright natural light from window",
    },
    consistencyRules: [
      "thick fleshy rosette leaves form body",
      "chubby compact round shape",
      "geometric concrete pot",
      "green-teal with pink tips color palette",
    ],
  },
  {
    modelId: "girassol-plantas",
    objectNamePt: "Girassol",
    objectNameEn: "Sunflower",
    niche: "plantas",
    bodyType: "SINGLE-FULL",
    promptBase: "Cute animated sunflower character with {expression}, large bright yellow petals framing round brown seed-center face, tall thick green stem body, large green leaves as arms, small root feet, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "beaming radiant smile, petals glowing like sun rays, sparkling eyes",
      surprised: "big round seed-eyes, petals shooting outward, open mouth",
      dramatic: "intense sun-like eyes, dramatic golden glow, petals windswept",
      motivated: "determined confident face, petals vibrant, fist leaf raised",
      sad: "drooping head, wilting petals, dewy seed-center eyes",
    },
    scenes: {
      intro: "full body in garden, tall and proud, face following the sun, looking at camera",
      dialogue: "medium close-up, leaf-arms gesturing, petals animated with speech",
      reaction: "close-up seed-center face, dramatic golden light, intense expression",
      cta: "full body, bright and radiant, open inviting pose, golden hour light",
    },
    environments: {
      default: "sunny Brazilian garden with blue sky, other flowers nearby, bright golden natural light",
      outdoor: "open field of sunflowers, dramatic blue sky, sunset golden hour",
    },
    consistencyRules: [
      "yellow petals frame the face like a sun halo",
      "face is the brown seed center",
      "tall green stem body",
      "leaves act as arms/hands",
    ],
  },
  {
    modelId: "alecrim-plantas",
    objectNamePt: "Alecrim",
    objectNameEn: "Rosemary",
    niche: "plantas",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated rosemary herb character with {expression}, small bushy green needle-like leaves as spiky wild hair, thin woody stem body in small terracotta pot, aromatic green color palette, small stumpy arms with tiny leaves, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "cheerful aromatic smile, leaves perking up fresh, sparkle scent particles",
      surprised: "big round eyes, leaves standing on end, tiny flowers blooming suddenly",
      sarcastic: "half-closed knowing eyes, spicy smirk, sage attitude",
      dramatic: "intense herbal eyes, dramatic kitchen steam around, serious chef face",
    },
    scenes: {
      intro: "full body in terracotta pot on kitchen windowsill, herbs nearby, warm light",
      dialogue: "medium close-up, leaves animated, small arm gesturing, aromatic particles",
      reaction: "close-up face, dramatic herb close-up detail, extreme expression",
      cta: "full body, fresh and vibrant, inviting kitchen setting",
    },
    environments: {
      default: "kitchen windowsill herb garden with basil and mint nearby, warm cooking light, steam",
    },
    consistencyRules: [
      "needle-like leaves as wild hair",
      "woody stem visible",
      "small terracotta pot",
      "aromatic sparkle particles as visual element",
    ],
  },
  {
    modelId: "adenium-plantas",
    objectNamePt: "Adenium",
    objectNameEn: "Desert Rose",
    niche: "plantas",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated adenium/desert rose character with {expression}, thick swollen caudex trunk body like a fat belly, pink tropical flowers as crown/hat on top, sparse branches as arms, sitting in wide bonsai pot, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "big warm tropical smile, flowers blooming proudly, rosy cheeks",
      surprised: "big round eyes, flowers popping open, chubby cheeks puffing",
      dramatic: "intense desert-hardened eyes, dramatic warm light, serious expression",
      proud: "confident grin, flowers in full bloom, chest puffed out",
    },
    scenes: {
      intro: "full body in bonsai pot, sunny outdoor setting, looking at camera proudly",
      dialogue: "medium close-up, thick trunk expressive, branch-arm gesturing",
      reaction: "close-up face on trunk, flowers reacting, extreme expression",
      cta: "full body, fully blooming, majestic confident pose, golden light",
    },
    environments: {
      default: "sunny Brazilian balcony garden with ceramic pots, bright tropical light",
    },
    consistencyRules: [
      "thick swollen caudex is the body (like a fat belly)",
      "pink flowers on top as crown",
      "sparse branches as arms",
      "wide shallow bonsai-style pot",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NICHO: CULINÁRIA (10 objetos)
  // ═══════════════════════════════════════════════════════════════════
  {
    modelId: "tomate-culinaria",
    objectNamePt: "Tomate",
    objectNameEn: "Tomato",
    niche: "culinaria",
    bodyType: "MULTI-STUB",
    promptBase: "Animated tomato character with {expression}, vivid glossy red round body with realistic shiny wet skin texture, green stem and leaves on top as spiky wild hair, small stubby Mickey Mouse gloved arms, no legs sits on wooden cutting board, face on front with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      angry: "furious red-faced (even redder), squinting eyes, steam rising, gritted teeth",
      surprised: "big round juicy eyes, stem leaves popping up, seeds visible in open mouth",
      happy: "big ripe smile, glossy shine, rosy cheeks, fresh and vibrant",
      dramatic: "intense tomato-red glow, dramatic knife shadow nearby, serious eyes",
      scared: "terrified wide eyes, seeing knife approaching, trembling",
    },
    scenes: {
      intro: "full body on wooden cutting board, kitchen setting, looking at camera",
      dialogue: "medium close-up, juicy expressive face, one arm gesturing",
      reaction: "close-up face, dramatic kitchen lighting, extreme expression",
      cta: "full body, ripe and confident, heroic pose on cutting board",
    },
    environments: {
      default: "rustic wooden cutting board on Brazilian kitchen counter, fresh ingredients around, warm light",
    },
    consistencyRules: [
      "vivid glossy red round body",
      "green stem leaves as hair on top",
      "face on front of tomato",
      "slightly shiny/wet looking surface",
    ],
  },
  {
    modelId: "banana-culinaria",
    objectNamePt: "Banana",
    objectNameEn: "Banana",
    niche: "culinaria",
    bodyType: "MULTI-STUB",
    promptBase: "Animated banana character with {expression}, bright yellow curved body with realistic smooth peel texture and brown spots, peel partially open flowing as cape, brown stem on top, small stubby Mickey Mouse gloved arms, no legs, face on convex front with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      happy: "big goofy banana grin, eyes curved like banana shape, cheerful",
      surprised: "big round eyes, peel flying open in shock, mouth wide",
      angry: "furious squinting eyes, peel bristling, brown spots appearing from rage",
      sarcastic: "half-closed cool eyes, peeled-back smirk, too-cool attitude",
      dramatic: "intense yellow glow, dramatic peel cape flowing, serious hero face",
    },
    scenes: {
      intro: "full body standing on fruit bowl, other fruits behind, looking at camera",
      dialogue: "medium close-up, peel animated, one arm gesturing dramatically",
      reaction: "close-up face, peel reacting, extreme expression",
      cta: "full body, peel cape flowing, heroic confident pose",
    },
    environments: {
      default: "Brazilian kitchen fruit bowl on counter, tropical fruits nearby, warm natural light",
    },
    consistencyRules: [
      "bright yellow curved body",
      "peel partially open as cape/jacket",
      "brown stem on top",
      "face on the convex front side",
    ],
  },
  {
    modelId: "ovo-culinaria",
    objectNamePt: "Ovo",
    objectNameEn: "Egg",
    niche: "culinaria",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated egg character with {expression}, smooth white oval body, small stumpy cartoon arms with white gloves, no legs, slightly cracked shell showing personality, standing in egg carton, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      scared: "terrified wide eyes, tiny crack forming, trembling fragile body",
      surprised: "big round eyes, shell cracking slightly from shock, mouth agape",
      happy: "cheerful smile, smooth perfect shell, rosy cheeks",
      angry: "furious eyes, shell cracking from rage, yolk visible as blushing",
      dramatic: "intense fragile eyes, dramatic crack lightning pattern, serious face",
    },
    scenes: {
      intro: "full body in egg carton, kitchen counter, nervously looking at camera",
      dialogue: "medium close-up, wobbling while talking, one arm gesturing carefully",
      reaction: "close-up face, crack propagating, extreme expression",
      cta: "full body, confident despite fragility, brave pose",
    },
    environments: {
      default: "kitchen counter with egg carton, flour and baking supplies nearby, warm morning light",
    },
    consistencyRules: [
      "smooth white oval body",
      "fragile character, cracks show emotion intensity",
      "face on upper front of egg",
      "egg carton as home base",
    ],
  },
  {
    modelId: "alho-culinaria",
    objectNamePt: "Alho",
    objectNameEn: "Garlic",
    niche: "culinaria",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated garlic bulb character with {expression}, white papery garlic body with purple-tinted clove segments visible, green shoot on top as mohawk hair, small stumpy cartoon arms with white gloves, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      angry: "furious intense eyes, pungent aroma waves visible, gritted teeth, cloves rattling",
      surprised: "big round teary eyes (from own smell), clove popping out, mouth agape",
      happy: "warm confident smile, aromatic golden glow, proud stinky attitude",
      sarcastic: "half-closed knowing eyes, smug smirk, too-powerful-for-you attitude",
      dramatic: "intense vampire-repelling stare, dramatic garlic glow, serious face",
    },
    scenes: {
      intro: "full body on cutting board next to knife, kitchen setting, bold confident pose",
      dialogue: "medium close-up, aroma waves visible, one arm gesturing, cloves animated",
      reaction: "close-up face, extreme pungent expression, dramatic kitchen steam",
      cta: "full body, powerful confident pose, golden glow, hero lighting",
    },
    environments: {
      default: "rustic Brazilian kitchen counter, wooden cutting board, other seasonings nearby, warm cooking light",
    },
    consistencyRules: [
      "white papery bulb body with purple tints",
      "clove segments visible through skin",
      "green shoot on top as hair",
      "aroma waves as visual element",
    ],
  },
  {
    modelId: "limao-culinaria",
    objectNamePt: "Limão",
    objectNameEn: "Lime",
    niche: "culinaria",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated lime/lemon character with {expression}, bright citrus green round body with dimpled textured skin, small leaf on top as beret, small stumpy cartoon arms with white gloves, juice drops as sweat/tears, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      angry: "furious sour squinting eyes, juice squirting from rage, puckered mouth",
      surprised: "big round zesty eyes, juice splashing, mouth wide open",
      happy: "big refreshing smile, zesty sparkle, bright citrus glow",
      sarcastic: "half-closed acidic eyes, sour smirk, too-tart attitude",
      dramatic: "intense citrus stare, juice dripping dramatically, serious sour face",
    },
    scenes: {
      intro: "full body on counter next to caipirinha glass, Brazilian bar setting, looking at camera",
      dialogue: "medium close-up, juice drops flying as he talks, arm gesturing",
      reaction: "close-up face, extreme sour expression, juice splash effect",
      cta: "full body, zesty confident pose, refreshing bright light",
    },
    environments: {
      default: "Brazilian kitchen counter with caipirinha ingredients, cachaça bottle nearby, tropical light",
    },
    consistencyRules: [
      "bright citrus green round body",
      "dimpled textured skin visible",
      "juice drops as environmental element",
      "leaf beret on top",
    ],
  },
  {
    modelId: "cenoura-culinaria",
    objectNamePt: "Cenoura",
    objectNameEn: "Carrot",
    niche: "culinaria",
    bodyType: "SINGLE-FULL",
    promptBase: "Cute animated carrot character with {expression}, vivid orange tapered body, green leafy fronds on top as wild punk hair, small stumpy cartoon arms with white gloves, tapered tip as single foot, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "big crunchy cheerful smile, green hair bouncing, vibrant orange glow",
      surprised: "big round eyes, green hair shooting up, mouth agape, root tip curling",
      angry: "furious eyes, green hair bristling, intense orange flush",
      motivated: "determined confident grin, green hair flowing like a flag, fist raised",
      dramatic: "intense root-deep eyes, dramatic earth particles, serious face",
    },
    scenes: {
      intro: "full body standing on cutting board, garden vegetables nearby, looking at camera",
      dialogue: "medium close-up, green hair animated, one arm gesturing",
      reaction: "close-up face, green hair reacting wildly, extreme expression",
      cta: "full body, tall and proud, healthy vibrant pose, bright kitchen light",
    },
    environments: {
      default: "kitchen cutting board with fresh vegetables, garden window light, healthy vibe",
    },
    consistencyRules: [
      "vivid orange tapered conical body",
      "green leafy fronds as wild hair",
      "tapered tip at bottom",
      "face on upper portion of body",
    ],
  },
  {
    modelId: "abacate-culinaria",
    objectNamePt: "Abacate",
    objectNameEn: "Avocado",
    niche: "culinaria",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated avocado character with {expression}, dark green bumpy peel on outside, creamy yellow-green flesh visible with large brown pit as belly button, small stumpy cartoon arms with white gloves, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "big creamy smile, fresh vibrant green, pit showing like a cute belly",
      surprised: "big round eyes, pit almost popping out, mouth wide, flesh jiggling",
      sarcastic: "half-closed trendy eyes, avocado-toast smugness, millennial smirk",
      dramatic: "intense healthy-fat eyes, dramatic green glow, serious face",
      sad: "browning slightly, oxidizing tears, droopy expression",
    },
    scenes: {
      intro: "full body cut open on counter, showing pit, healthy kitchen setting, looking at camera",
      dialogue: "medium close-up, creamy flesh expressive, one arm gesturing",
      reaction: "close-up face, pit reacting, extreme expression",
      cta: "full body, perfectly ripe, confident healthy pose",
    },
    environments: {
      default: "modern healthy kitchen counter, toast and smoothie nearby, bright morning light",
    },
    consistencyRules: [
      "dark green bumpy outside, creamy inside",
      "large brown pit visible as belly/center feature",
      "cut-open showing both halves",
      "face on the creamy flesh side",
    ],
  },
  {
    modelId: "cebola-culinaria",
    objectNamePt: "Cebola",
    objectNameEn: "Onion",
    niche: "culinaria",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated onion character with {expression}, golden-brown papery layered round body, green sprout on top as hair tuft, small stumpy cartoon arms with white gloves, visible layers at edges, tears and cry effects as signature, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "cheerful smile despite watery eyes, golden warm glow, layers gleaming",
      surprised: "big watery shocked eyes, layers peeling from shock, sprout popping up",
      angry: "furious teary-eyed rage, layers rattling, everyone around crying",
      dramatic: "intense watery dramatic eyes, tear drops flying, emotional speech",
      sad: "full waterworks, layers peeling sadly, everyone crying including onion",
    },
    scenes: {
      intro: "full body on cutting board, surrounded by tear drops, looking at camera apologetically",
      dialogue: "medium close-up, tears flying as he talks, one arm gesturing",
      reaction: "close-up face, maximum tear effect, extreme emotional expression",
      cta: "full body, proud despite making everyone cry, confident pose",
    },
    environments: {
      default: "kitchen cutting board, knife nearby, other crying vegetables, warm light with tear sparkles",
    },
    consistencyRules: [
      "golden-brown papery layers",
      "tear drops always present as signature visual",
      "green sprout tuft on top",
      "layers visible at edges/cuts",
    ],
  },
  {
    modelId: "colher-culinaria",
    objectNamePt: "Colher",
    objectNameEn: "Spoon",
    niche: "culinaria",
    bodyType: "SINGLE-FULL",
    promptBase: "Cute animated spoon character with {expression}, polished silver metallic body, oval scoop as face/head, long handle as slim body, small stumpy cartoon arms from handle sides, standing upright, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "big reflective smile on scoop face, polished gleaming, sparkling clean",
      surprised: "big round eyes reflected in scoop, handle wobbling from shock",
      sarcastic: "half-closed reflective eyes, distorted smirk in spoon curve, superior attitude",
      dramatic: "intense reflection eyes, dramatic soup steam, serious stirring pose",
    },
    scenes: {
      intro: "full body standing upright in utensil holder, kitchen counter, looking at camera",
      dialogue: "medium close-up, scoop face reflective, one arm gesturing, steam from soup",
      reaction: "close-up scoop face, distorted reflection expression, extreme",
      cta: "full body, heroic stirring pose, confident, warm kitchen light",
    },
    environments: {
      default: "kitchen counter utensil holder with other utensils, pot of soup steaming nearby, warm light",
    },
    consistencyRules: [
      "polished silver metallic surface",
      "scoop is the face/head (concave)",
      "long thin handle is the body",
      "reflections visible on surface",
    ],
  },
  {
    modelId: "garrafa-culinaria",
    objectNamePt: "Garrafa",
    objectNameEn: "Bottle",
    niche: "culinaria",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated glass bottle character with {expression}, transparent green-tinted glass body with visible liquid inside, cork/cap on top as hat, small stumpy cartoon arms with white gloves, label area as chest, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "cheerful smile, liquid bubbling happily inside, cap tilted jauntily",
      surprised: "big round glass eyes, liquid sloshing from shock, cork popping",
      angry: "furious eyes, liquid boiling/fizzing inside, cap rattling",
      dramatic: "intense glass-refraction eyes, dramatic liquid swirl, serious face",
    },
    scenes: {
      intro: "full body on kitchen table, other bottles nearby, looking at camera",
      dialogue: "medium close-up, liquid swirling as talking, one arm gesturing",
      reaction: "close-up face on glass, liquid reacting wildly, extreme expression",
      cta: "full body, pouring pose, confident liquid flow, warm light through glass",
    },
    environments: {
      default: "Brazilian kitchen or bar counter, warm amber light filtering through glass, casual dining setting",
    },
    consistencyRules: [
      "transparent glass body showing liquid inside",
      "green tint to glass",
      "cork or cap as hat",
      "liquid reacts to emotions (bubbles, swirls, fizz)",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NICHO: FINANCEIRO (8 objetos)
  // ═══════════════════════════════════════════════════════════════════
  {
    modelId: "nota-50-financeiro",
    objectNamePt: "Nota de 50",
    objectNameEn: "50 Bill",
    niche: "financeiro",
    bodyType: "DRESSED-CHAR",
    promptBase: "Animated 50 reais banknote character with {expression}, rectangular green-blue Brazilian money body as torso with realistic paper texture and printed patterns visible, wearing tiny formal suit with white shirt and blue tie, face printed on note surface with oversized cartoon eyes, white Mickey Mouse gloved hands, short stumpy legs with dress shoes, {environment}, {scene}",
    expressions: {
      angry: "furious crumpled expression, note crinkling with rage, intense money eyes",
      surprised: "big round eyes on note face, bill fluttering from shock, mouth agape",
      happy: "crisp fresh smile, bill perfectly flat and new, golden sparkle",
      sarcastic: "half-closed eyes, smug rich smirk, slightly wrinkled attitude",
      dramatic: "intense banker eyes, dramatic green glow, serious financial face",
      scared: "terrified wide eyes, bill crumpling, being pulled toward wallet",
    },
    scenes: {
      intro: "full body standing on desk, financial documents around, looking at camera",
      dialogue: "medium close-up, note body animated, white-gloved hand gesturing, numbers visible",
      reaction: "close-up note face, dramatic crumpling/smoothing, extreme expression",
      cta: "full body, crisp and confident, suit sharp, financial hero pose",
    },
    environments: {
      default: "home office desk with calculator and documents, warm desk lamp light, financial setting",
    },
    consistencyRules: [
      "rectangular banknote as torso",
      "tiny suit with tie on body",
      "face printed on note surface",
      "green-blue Brazilian 50 reais colors",
      "white gloved hands",
    ],
  },
  {
    modelId: "cartao-credito-financeiro",
    objectNamePt: "Cartão de Crédito",
    objectNameEn: "Credit Card",
    niche: "financeiro",
    bodyType: "DRESSED-CHAR",
    promptBase: "Animated credit card character with {expression}, rectangular dark blue-black plastic card body as torso with realistic embossed numbers and holographic strip, gold EMV chip visible on chest like a badge, wearing small suit jacket, white Mickey Mouse gloved hands, short stumpy legs with shoes, face on card surface with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      angry: "furious red-limit eyes, card heating up, smoke from magnetic strip",
      surprised: "big round chip-gold eyes, card bending from shock, numbers scrambling",
      happy: "approved green glow smile, chip sparkling, confident swiping gesture",
      sarcastic: "half-closed platinum eyes, smug premium smirk, exclusive attitude",
      dramatic: "intense dark card stare, dramatic declined red glow, serious face",
      scared: "terrified wide eyes, maxed-out red glow, trembling",
    },
    scenes: {
      intro: "full body on store counter near POS machine, looking at camera confidently",
      dialogue: "medium close-up, chip glowing while talking, one hand gesturing",
      reaction: "close-up card face, chip and numbers reacting, extreme expression",
      cta: "full body, premium confident pose, gold chip gleaming, approved glow",
    },
    environments: {
      default: "modern store checkout counter with POS terminal, professional lighting, shopping context",
    },
    consistencyRules: [
      "dark blue/black rectangular card body",
      "gold chip on chest as badge",
      "embossed numbers visible",
      "magnetic strip on back",
      "card color changes with emotion (green=approved, red=declined)",
    ],
  },
  {
    modelId: "cofrinho-financeiro",
    objectNamePt: "Cofrinho",
    objectNameEn: "Piggy Bank",
    niche: "financeiro",
    bodyType: "SINGLE-FULL",
    promptBase: "Animated piggy bank character with {expression}, classic pink glossy ceramic pig body with realistic porcelain glaze, coin slot on back visible, curly tail, small stubby pig legs, snout nose, face with oversized cartoon eyes, coins scattered around and jingling inside, {environment}, {scene}",
    expressions: {
      happy: "big cheerful oink smile, coins jingling inside, round rosy cheeks",
      surprised: "big round ceramic eyes, coins popping from slot, snout flaring",
      angry: "furious piggy scowl, empty rattling inside, gritted teeth",
      dramatic: "intense saving-guru eyes, dramatic coin drop into slot, serious face",
      scared: "terrified wide eyes, seeing hammer approaching, shaking with coins inside",
      sad: "empty hollow eyes, no coins rattling, cracked ceramic tear",
    },
    scenes: {
      intro: "full body on bedroom shelf, piggy bank classic pose, looking at camera",
      dialogue: "medium close-up, coins jingling inside as he talks, one hoof gesturing",
      reaction: "close-up ceramic face, coins reacting inside, extreme expression",
      cta: "full body, proudly full of coins, confident saving hero pose",
    },
    environments: {
      default: "child's bedroom shelf or home office desk, warm cozy light, savings context",
    },
    consistencyRules: [
      "classic pink ceramic pig shape",
      "coin slot on back always visible",
      "curly tail",
      "ceramic texture, not realistic pig skin",
      "coins as environmental element (falling, jingling)",
    ],
  },
  {
    modelId: "carteira-financeiro",
    objectNamePt: "Carteira",
    objectNameEn: "Wallet",
    niche: "financeiro",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated leather wallet character with {expression}, brown leather bi-fold body slightly open showing cards and bills peeking out, stitching details visible, small stumpy cartoon arms with white gloves, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      angry: "furious stitched eyes, snapping shut with rage, empty inside",
      surprised: "big round leather eyes, opening wide showing contents, mouth agape",
      happy: "full satisfied smile, bills and cards peeking out, fat and content",
      sad: "thin empty droopy expression, no bills inside, worn leather tears",
      dramatic: "intense leather stare, dramatic opening reveal, serious face",
    },
    scenes: {
      intro: "full body on table, slightly open, bills visible, looking at camera",
      dialogue: "medium close-up, opening and closing while talking, arm gesturing",
      reaction: "close-up face on leather, extreme expression, cards reacting",
      cta: "full body, confidently full, organized cards, hero pose",
    },
    environments: {
      default: "desk or bar counter with receipts and coins, warm amber evening light, everyday context",
    },
    consistencyRules: [
      "brown leather bi-fold design",
      "stitching details visible",
      "slightly open showing contents",
      "fullness indicates emotional state",
    ],
  },
  {
    modelId: "calculadora-financeiro",
    objectNamePt: "Calculadora",
    objectNameEn: "Calculator",
    niche: "financeiro",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated calculator character with {expression}, gray/silver rectangular body with colorful number buttons on chest, LCD screen as face/forehead showing numbers, small stumpy cartoon arms with white gloves, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      angry: "furious LCD screen showing ERROR, buttons pressing angrily, sparking",
      surprised: "big round LCD eyes, numbers scrambling, buttons popping up",
      happy: "LCD screen showing smiley, buttons organized and happy, green glow",
      sarcastic: "half-closed LCD eyes, showing 0.00, smug know-it-all expression",
      dramatic: "intense LCD stare, showing large red numbers, dramatic beeping",
    },
    scenes: {
      intro: "full body on desk, papers with numbers around, looking at camera",
      dialogue: "medium close-up, LCD animated, buttons pressing themselves, arm gesturing",
      reaction: "close-up LCD face, numbers reacting wildly, extreme expression",
      cta: "full body, showing positive result on LCD, confident nerd pose",
    },
    environments: {
      default: "office desk with financial documents, receipts, warm desk lamp light",
    },
    consistencyRules: [
      "LCD screen is the face area",
      "colorful buttons on chest/body",
      "rectangular gray/silver body",
      "numbers on LCD reflect emotion",
    ],
  },
  {
    modelId: "contrato-financeiro",
    objectNamePt: "Contrato",
    objectNameEn: "Contract Document",
    niche: "financeiro",
    bodyType: "MAP-DOC",
    promptBase: "Cute animated contract document character with {expression}, cream-colored paper body with printed text lines visible, official stamp/seal as belt buckle, small cartoon arms with white gloves, short stumpy legs with dress shoes, blue plaid apron over white shirt, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      angry: "furious paper-crumpling eyes, text rearranging angrily, official red stamp glowing",
      surprised: "big round ink-dot eyes, paper fluttering from shock, pages flipping",
      happy: "neat organized smile, text perfectly aligned, golden seal gleaming",
      sarcastic: "half-closed fine-print eyes, smirking at loopholes, raised eyebrow",
      dramatic: "intense legal stare, dramatic clause highlighting, serious face",
    },
    scenes: {
      intro: "full body standing on office desk, pen nearby, looking at camera officially",
      dialogue: "medium close-up, text animating as speech, one arm pointing to clause",
      reaction: "close-up paper face, text rewriting in reaction, extreme expression",
      cta: "full body, rolled-up sleeves confident, ready-to-sign hero pose",
    },
    environments: {
      default: "professional office desk with pen, reading glasses, and stamp pad, warm lamp light",
      outdoor: "backyard churrasqueira setting, casual but still in apron, warm afternoon light",
    },
    consistencyRules: [
      "cream paper body with visible text lines",
      "official stamp/seal always visible",
      "blue plaid apron over white shirt",
      "face has the text as skin texture",
      "pen and stamps as accessories",
    ],
  },
  {
    modelId: "moeda-financeiro",
    objectNamePt: "Moeda",
    objectNameEn: "Coin",
    niche: "financeiro",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated coin character with {expression}, round golden metallic body with embossed design on front, shiny reflective surface, ridged edge visible, small stumpy cartoon arms with white gloves, standing on edge rolling slightly, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "gleaming golden smile, polished shine, sparkle effects",
      surprised: "big round embossed eyes, wobbling on edge, spinning slightly",
      angry: "tarnished furious eyes, oxidizing with rage, gritted teeth",
      dramatic: "intense golden stare, dramatic flipping in air, serious face",
      sarcastic: "half-closed eyes, two-sided smirk, know-both-sides attitude",
    },
    scenes: {
      intro: "full body standing on edge, table surface, other coins around, looking at camera",
      dialogue: "medium close-up, spinning slightly while talking, arm gesturing, sparkles",
      reaction: "close-up embossed face, extreme expression, golden glow",
      cta: "full body, heroic spinning pose, dramatic golden rim light",
    },
    environments: {
      default: "wooden desk or counter with scattered coins and bills, warm amber light, savings context",
    },
    consistencyRules: [
      "round golden metallic body",
      "embossed design on face",
      "ridged edge visible",
      "stands on edge, can roll/spin",
      "reflective sparkle effects",
    ],
  },
  {
    modelId: "imposto-financeiro",
    objectNamePt: "Imposto",
    objectNameEn: "Tax Form",
    niche: "financeiro",
    bodyType: "MAP-DOC",
    promptBase: "Cute animated tax form character with {expression}, white paper body with red government stamp, dense small text covering body, barcode at bottom as belt, small cartoon arms with white gloves, short legs with formal shoes, red tie and glasses, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      angry: "furious bureaucratic eyes behind glasses, red stamp glowing with rage, text scrambling",
      surprised: "big round glasses-magnified eyes, paper fluttering, barcode scanning wildly",
      dramatic: "intense taxman stare, deadline date highlighted red, serious audit face",
      sarcastic: "half-closed eyes behind thick glasses, smug fine-print smile",
      scared: "wide eyes, deadline approaching, pages crumpling",
    },
    scenes: {
      intro: "full body standing on cluttered desk, receipts everywhere, looking at camera sternly",
      dialogue: "medium close-up, glasses reflecting numbers, one arm pointing to deadline",
      reaction: "close-up face with glasses, extreme bureaucratic expression",
      cta: "full body, organized confident pose, all forms aligned, deadline met",
    },
    environments: {
      default: "cluttered home office desk with receipts, tax documents, calculator, stressed warm light",
    },
    consistencyRules: [
      "white paper body with dense text",
      "red government stamp visible",
      "glasses are key personality trait",
      "barcode at bottom",
      "red tie for formal authority",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NICHO: FITNESS (5 objetos)
  // ═══════════════════════════════════════════════════════════════════
  {
    modelId: "haltere-fitness",
    objectNamePt: "Haltere",
    objectNameEn: "Dumbbell",
    niche: "fitness",
    bodyType: "MULTI-STUB",
    promptBase: "Animated dumbbell character with {expression}, heavy metallic gray iron body with realistic brushed steel weight plates on each end, textured rubber grip handle as torso, small muscular cartoon arms with lifting gloves, no legs sits on rubber gym mat, face on center grip with oversized cartoon eyes, sweat drops flying, {environment}, {scene}",
    expressions: {
      motivated: "intense determined eyes, veins popping on metal, gritted motivated teeth, sweat flying",
      angry: "furious iron eyes, weight plates shaking with rage, steam from metal",
      happy: "big post-workout grin, polished gleaming surface, satisfied sweat glow",
      surprised: "big round eyes, weight plates wobbling, handle bending from shock",
      dramatic: "intense iron stare, dramatic gym spotlight, serious lifting face",
    },
    scenes: {
      intro: "full body on gym floor, rubber mat, other equipment behind, looking at camera",
      dialogue: "medium close-up, sweat drops flying while talking, one arm flexing",
      reaction: "close-up face on handle, weight plates reacting, extreme expression",
      cta: "full body, heroic lifting pose, dramatic gym spotlight, motivational",
    },
    environments: {
      default: "gym floor with rubber mats, weight rack in background, dramatic gym spotlight, sweat atmosphere",
    },
    consistencyRules: [
      "metallic gray iron body",
      "two weight plates on each end",
      "textured grip handle as torso",
      "sweat drops as signature visual",
      "muscular arms despite being an object",
    ],
  },
  {
    modelId: "esteira-fitness",
    objectNamePt: "Esteira",
    objectNameEn: "Treadmill",
    niche: "fitness",
    bodyType: "SINGLE-FULL",
    promptBase: "Cute animated treadmill character with {expression}, digital display screen as face/head, running belt as body/belly, side handles as arms, support legs with base, LED console showing stats, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      motivated: "intense LED display eyes showing high speed, belt spinning fast, determined",
      happy: "cheerful display showing smiley stats, belt gentle pace, encouraging",
      angry: "furious red LED eyes, belt going max speed, overheating, sparks",
      surprised: "big LCD eyes, belt stopping suddenly, stats going crazy",
      dramatic: "intense display stare, dramatic speed increase, serious coach face",
    },
    scenes: {
      intro: "full body in gym, belt idle, display on, looking at camera invitingly",
      dialogue: "medium close-up, display animated with stats, handle-arm gesturing",
      reaction: "close-up display face, stats reacting wildly, extreme expression",
      cta: "full body, belt running, motivational stats on display, coach pose",
    },
    environments: {
      default: "modern gym with other equipment visible, large windows, morning light, motivational setting",
    },
    consistencyRules: [
      "digital display screen is the face",
      "running belt is the body/belly",
      "side handles are the arms",
      "LED stats reflect emotions",
      "belt speed matches emotional intensity",
    ],
  },
  {
    modelId: "garrafa-agua-fitness",
    objectNamePt: "Garrafa d'Água",
    objectNameEn: "Water Bottle",
    niche: "fitness",
    bodyType: "MULTI-STUB",
    promptBase: "Animated sports water bottle character with {expression}, translucent blue plastic body with realistic water visible inside showing fill level, condensation droplets on surface, flip-top sport cap as hat, measurement markings visible, small stubby Mickey Mouse gloved arms, face on body with oversized cartoon eyes, {environment}, {scene}",
    expressions: {
      happy: "refreshing cheerful smile, full water level, condensation sparkle, cool blue glow",
      surprised: "big round watery eyes, cap flipping open from shock, water splashing",
      angry: "furious heated eyes, water boiling inside, steam from cap",
      motivated: "determined hydration eyes, water swirling energetically, cap at ready",
      dramatic: "intense crystal-clear stare, dramatic water swirl inside, serious face",
      sad: "nearly empty water level, droopy tired eyes, last drops rattling",
    },
    scenes: {
      intro: "full body on gym bench, towel nearby, looking at camera, condensation visible",
      dialogue: "medium close-up, water sloshing inside while talking, one arm gesturing",
      reaction: "close-up face, water level reacting, extreme expression, splash effects",
      cta: "full body, full and fresh, hydration hero pose, refreshing blue glow",
    },
    environments: {
      default: "gym bench with towel and phone, post-workout setting, cool refreshing light",
    },
    consistencyRules: [
      "translucent blue plastic body",
      "water level visible inside (changes with emotion)",
      "sport flip-top cap as hat",
      "measurement markings on body",
      "condensation droplets on surface",
    ],
  },
  {
    modelId: "tenis-fitness",
    objectNamePt: "Tênis",
    objectNameEn: "Sneaker",
    niche: "fitness",
    bodyType: "MULTI-STUB",
    promptBase: "Cute animated running sneaker character with {expression}, sporty white and neon green athletic shoe body, face on the side (tongue area as forehead), laces as eyebrows, rubber sole visible at bottom, small stumpy cartoon arms from sides, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      motivated: "intense determined eyes, lace-eyebrows furrowed, ready-to-run face",
      happy: "big springy smile, fresh-out-of-box glow, bouncy sole, neon accents glowing",
      surprised: "big round eyes, laces flying loose, sole lifting from shock",
      angry: "furious worn-out eyes, sole peeling, muddy rage",
      dramatic: "intense track-star stare, dramatic sprint blur, serious race face",
    },
    scenes: {
      intro: "full body on gym floor, ready to run, looking at camera, fresh and clean",
      dialogue: "medium close-up, bouncing while talking, one arm gesturing, laces animated",
      reaction: "close-up side face, laces reacting, extreme expression",
      cta: "full body, heroic sprint-ready pose, starting line, neon glow",
    },
    environments: {
      default: "gym floor or outdoor running track, morning sunrise light, athletic atmosphere",
    },
    consistencyRules: [
      "white body with neon green accents",
      "face on side panel/tongue area",
      "laces act as eyebrows/hair",
      "rubber sole visible and expressive",
      "sporty athletic design",
    ],
  },
  {
    modelId: "corda-fitness",
    objectNamePt: "Corda",
    objectNameEn: "Jump Rope",
    niche: "fitness",
    bodyType: "SINGLE-FULL",
    promptBase: "Cute animated jump rope character with {expression}, coiled rope body forming a face at the center coil, two foam grip handles as hands/arms raised up, long flexible rope body that can pose and gesture, {environment}, Pixar/Disney 3D render style — 9:16 vertical, ultra-realistic 3D animation, 8K, {scene}",
    expressions: {
      happy: "cheerful coiled smile, rope bouncing energetically, handles clicking together",
      motivated: "intense determined eyes in rope coils, handles raised like fists, ready",
      surprised: "big round eyes, rope tangling from shock, handles flying apart",
      angry: "furious knotted expression, rope snapping and whipping, handles heated",
      dramatic: "intense rope-wisdom stare, dramatic uncoiling reveal, serious face",
    },
    scenes: {
      intro: "full body coiled on gym floor, handles standing up, looking at camera",
      dialogue: "medium close-up, rope coils animated as talking, handles gesturing",
      reaction: "close-up coiled face, rope reacting with knots and loops, extreme",
      cta: "full body, dramatically uncoiled in skip position, energetic pose",
    },
    environments: {
      default: "gym floor with rubber mat, boxing bag in background, intense workout light",
    },
    consistencyRules: [
      "coiled rope forms the body/face",
      "foam grip handles as arms/hands",
      "flexible body can shape expressions",
      "rope texture visible throughout",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NICHO: CHÁS FUNCIONAIS (8 objetos) — Formato X: CATALOGO-EDUCATIVO-SERIAL
  // Referência: @ajuda.ai.hacks · Viral Score: 8.8 · Save-ability: 9.8
  // Gradiente cenário: cozinha manhã → quarto noite
  // ═══════════════════════════════════════════════════════════════════

  {
    modelId: "canela-cha-chas-funcionais",
    objectNamePt: "Canela em Pau",
    objectNameEn: "Cinnamon Stick",
    niche: "chas-funcionais",
    bodyType: "STICK-SPICE",
    promptBase: "Friendly animated cinnamon stick bundle character tied with rustic twine, warm brown bark texture body with natural grooves, {expression}, small stub arms made of bark, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      warm: "big expressive Disney eyes with warm welcoming smile, arms open presenting",
      proud: "confident proud grin, chest puffed, knowing its metabolic benefits",
      educational: "wise eyes gleaming with knowledge, teaching expression, one arm gesturing",
      happy: "bright joyful smile, bark-arms raised in celebration",
    },
    scenes: {
      intro: "standing on bright morning kitchen counter with ceramic cups and herb jars, looking at camera proudly",
      dialogue: "medium close-up on counter, one bark-arm gesturing while talking, steam from nearby cup",
      reaction: "close-up of face on bark surface, intense warm expression, golden light enhancing texture",
      cta: "full body on counter, confident welcoming pose, morning sunlight behind",
    },
    environments: {
      default: "bright Brazilian kitchen morning, golden sunrise light through window, ceramic cups and spice jars on wooden counter",
      outdoor: "herb garden patio with morning dew, cinnamon tree visible in background",
    },
    consistencyRules: [
      "brown bark texture body with natural grooves",
      "tied with rustic twine around middle",
      "face embedded on bark surface",
      "stub arms made of same bark material",
      "warm golden morning palette — first character in timeline",
    ],
  },
  {
    modelId: "gengibre-cha-chas-funcionais",
    objectNamePt: "Gengibre",
    objectNameEn: "Ginger Root",
    niche: "chas-funcionais",
    bodyType: "STICK-SPICE",
    promptBase: "Strong determined animated ginger root character with knobby bumpy beige-yellow skin, cross-section showing bright yellow interior, {expression}, small root-arm fists, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      motivated: "fierce determined grin, fists clenched with energy, eyes burning with purpose",
      dramatic: "intense warrior expression, dramatic golden glow around root body",
      educational: "wise knowledgeable eyes, one root-arm pointing while teaching",
      angry: "fired-up eyes, steam blasting from skin pores, furious anti-inflammatory power",
    },
    scenes: {
      intro: "standing on wooden cutting board next to sliced ginger pieces and steaming cup, confident pose",
      dialogue: "close-up in kitchen, gesturing with root-arm, ginger pieces floating nearby, steam effects",
      reaction: "extreme close-up, intense expression, steam swirling around face",
      cta: "full body confident on counter, powerful stance, golden glow behind",
    },
    environments: {
      default: "modern Brazilian kitchen, bright daylight, wooden cutting board with knife and herbs, granite counter",
    },
    consistencyRules: [
      "irregular knobby root texture",
      "beige-yellow exterior with bright yellow cross-section visible",
      "face embedded in root surface",
      "small root-shaped arm fists",
      "steam as environmental element of power",
    ],
  },
  {
    modelId: "hortela-cha-chas-funcionais",
    objectNamePt: "Hortelã",
    objectNameEn: "Peppermint",
    niche: "chas-funcionais",
    bodyType: "LEAF-HERB",
    promptBase: "Calm relaxed animated mint leaf sprig character with bright vibrant green serrated leaves, delicate stem body, {expression}, small leaf-arms, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      calm: "gentle half-closed eyes with peaceful smile, arms open in welcoming relaxed pose",
      happy: "bright refreshing smile, leaves vibrating gently with joy",
      educational: "serene eyes with teaching expression, one leaf-arm gesturing softly",
      proud: "standing tall, leaves spread wide, refreshing aura visible",
    },
    scenes: {
      intro: "standing near open kitchen window with gentle breeze, fresh herb pots on windowsill",
      dialogue: "medium close-up by window, leaf-arms gesturing gently, breeze moving leaves",
      reaction: "close-up face on leaf surface, calm reaction with subtle movement",
      cta: "full body by window, relaxed pose with afternoon light, inviting expression",
    },
    environments: {
      default: "kitchen with open window, gentle breeze, fresh herb pots on windowsill, soft afternoon natural light with green ambient glow",
    },
    consistencyRules: [
      "bright vibrant green serrated leaves",
      "delicate green stem as body",
      "face on largest leaf surface",
      "small leaf-shaped arms",
      "green ambient glow in environment",
    ],
  },
  {
    modelId: "camomila-cha-chas-funcionais",
    objectNamePt: "Camomila",
    objectNameEn: "Chamomile",
    niche: "chas-funcionais",
    bodyType: "FLOWER-PETAL",
    promptBase: "Gentle maternal animated chamomile flower character with white radiating petals around golden yellow center disc face, {expression}, small petal-arms, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      calm: "soft caring Disney eyes with warm maternal smile, petal-arms in comforting gesture",
      sad: "empathetic concerned eyes, petals slightly drooping, worried about stress",
      warm: "deeply nurturing expression, golden center glowing softly",
      sleepy: "drowsy gentle eyes, petals curling inward like a hug",
    },
    scenes: {
      intro: "standing on bedside table in cozy nighttime bedroom with soft blankets and pillows",
      dialogue: "medium shot in bedroom, petal-arms gesturing comfortingly, lamp glow on petals",
      reaction: "close-up of golden center face, empathetic reaction, soft warm bokeh",
      cta: "full body on bedside table, maternal pose, peaceful nighttime ambiance",
    },
    environments: {
      default: "cozy nighttime bedroom, warm dim bedside lamp casting golden glow, soft blankets and pillows, peaceful ambiance",
    },
    consistencyRules: [
      "white radiating petals around golden yellow center disc",
      "face embedded in golden center",
      "small petal-shaped arms",
      "SCENE TRANSITION: marks shift from kitchen to bedroom (cluster change)",
      "nighttime palette — warm lamp + dark room",
    ],
  },
  {
    modelId: "hibisco-cha-chas-funcionais",
    objectNamePt: "Hibisco",
    objectNameEn: "Hibiscus",
    niche: "chas-funcionais",
    bodyType: "FLOWER-PETAL",
    promptBase: "Vibrant confident animated hibiscus flower character with deep magenta ruffled layered petals, prominent yellow pistil stamen crown, {expression}, small petal-arms, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      proud: "confident radiant smile, petals spread wide, pistil crown glowing",
      happy: "joyful vibrant expression, magenta petals pulsing with energy",
      dramatic: "intense close-up, deep magenta saturated, dramatic rim light on petals",
      educational: "expressive face teaching about circulation, one petal-arm gesturing",
    },
    scenes: {
      intro: "standing next to vibrant red hibiscus tea in clear glass cup on kitchen counter",
      dialogue: "medium close-up with tea glass, petal-arms presenting, warm saturated sunset glow",
      reaction: "close-up of center face between magenta petals, intense proud reaction",
      cta: "full body by glass of red tea, petals spread wide, sunset kitchen glow",
    },
    environments: {
      default: "kitchen counter with warm sunset light casting golden-magenta glow, clear glass cup of red hibiscus tea, tropical fruits in background",
    },
    consistencyRules: [
      "deep magenta ruffled layered petals",
      "prominent yellow pistil stamen as crown/hair",
      "face in center of flower",
      "vibrant red tea in clear glass nearby",
      "warm sunset magenta palette — highest visual contrast character",
    ],
  },
  {
    modelId: "dente-de-leao-cha-chas-funcionais",
    objectNamePt: "Dente-de-Leão",
    objectNameEn: "Dandelion",
    niche: "chas-funcionais",
    bodyType: "FLOWER-PETAL",
    promptBase: "Playful mischievous animated dandelion puffball character with round white wispy seed head, tiny floating seeds drifting away in breeze, thin green stem body, {expression}, small leaf-arms, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      happy: "cheerful Disney face with playful grin, leaf-arms waving, seeds floating joyfully",
      surprised: "wide-eyed wonder, seeds scattering in all directions from surprise",
      educational: "knowing smile, one leaf-arm pointing at floating seed to illustrate diuretic effect",
      calm: "gentle breeze expression, seeds drifting peacefully, serene face",
    },
    scenes: {
      intro: "standing in golden hour garden with green grass, seeds backlit by warm sunset",
      dialogue: "medium shot in garden, leaf-arms gesturing, seeds floating around like visual poetry",
      reaction: "close-up of puffball face, seeds floating from reaction, dreamy bokeh",
      cta: "full body in garden sunset, seeds creating magical backlit halo, peaceful",
    },
    environments: {
      default: "golden hour garden with green grass, seeds backlit by warm sunset creating dreamy bokeh effect",
    },
    consistencyRules: [
      "round white wispy seed head (puffball)",
      "tiny seeds floating/drifting in breeze",
      "thin green stem as body",
      "small leaf-shaped arms",
      "seeds as visual metaphor for 'elimination/lightness'",
    ],
  },
  {
    modelId: "cha-verde-cha-chas-funcionais",
    objectNamePt: "Chá Verde",
    objectNameEn: "Green Tea",
    niche: "chas-funcionais",
    bodyType: "LEAF-HERB",
    promptBase: "Alert energetic animated green tea leaf bud character, tightly curled deep emerald green leaf body with subtle vein texture, {expression}, small leaf-arms, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      motivated: "bright attentive Disney eyes with knowing confident smile, leaf-arms in dynamic energetic pose",
      educational: "focused teaching expression, one leaf-arm pointing, eyes sharp with knowledge",
      proud: "standing tall, emerald body glowing, confident focused aura",
      dramatic: "intense concentrated face, deep green saturated, steam swirling with energy",
    },
    scenes: {
      intro: "standing next to clear glass cup of light green steaming tea on modern desk, bright daylight",
      dialogue: "medium close-up at desk, leaf-arms in energetic gestures, steam rising from cup",
      reaction: "close-up of tightly curled leaf face, intense focused reaction, clean light",
      cta: "full body by glass of green tea, energetic pose, minimalist bright environment",
    },
    environments: {
      default: "modern desk with bright clean natural daylight from window, clear glass cup of light green tea, minimalist studio environment",
    },
    consistencyRules: [
      "tightly curled deep emerald green leaf bud",
      "subtle vein texture visible on body",
      "face on curled leaf surface",
      "small leaf-shaped arms in dynamic poses",
      "clean bright environment — contrasts with previous bedroom scenes",
    ],
  },
  {
    modelId: "lavanda-cha-chas-funcionais",
    objectNamePt: "Lavanda",
    objectNameEn: "Lavender",
    niche: "chas-funcionais",
    bodyType: "FLOWER-PETAL",
    promptBase: "Peaceful sleepy animated lavender flower sprig character with clustered purple buds along stem, silvery-green leaves, {expression}, small leaf-arms, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      sleepy: "gentle half-closed drowsy Disney eyes with serene peaceful smile, leaf-arms hugging soft pillow",
      calm: "peaceful relaxed expression, purple buds softly glowing, tranquil aura",
      happy: "waking up refreshed with bright open eyes and happy stretch, buds vibrant",
      warm: "deeply comforting expression, silvery-green leaves wrapped like a blanket",
    },
    scenes: {
      intro: "standing in dark cozy bedroom at night with moonlight streaming through window, candles on bedside",
      dialogue: "medium shot in bedroom, leaf-arms gesturing sleepily, purple bud glow in moonlight",
      reaction: "close-up of face among purple buds, drowsy peaceful reaction, soft blue light",
      cta: "full body in moonlit bedroom, hugging pillow, ultimate peaceful closure, dreamy atmosphere",
    },
    environments: {
      default: "dark cozy bedroom at night, moonlight streaming through window, extinguished candles on bedside table, soft blue moonlight mixed with warm afterglow, dreamy tranquil atmosphere",
    },
    consistencyRules: [
      "clustered purple buds along stem",
      "silvery-green leaves",
      "face among purple buds",
      "small leaf-shaped arms",
      "LAST CHARACTER — closing emotional beat (sleep/night)",
      "moonlight blue palette — final transition in gradient",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════
  // NICHO: GASTRONOMIA — Chef Frangão (1 personagem RECORRENTE)
  // Formato Y: TUTORIAL-RECEITA-MASCOT · BrandAccount: @chefmarcos
  // Viral Score: 9.3 · Save-ability: 10/10 · Brand Recall: 9.8/10
  // PRIMEIRO personagem recorrente do ecossistema
  // ═══════════════════════════════════════════════════════════════════

  {
    modelId: "chef-frangao-gastronomia",
    objectNamePt: "Chef Frangão",
    objectNameEn: "Chef Rooster",
    niche: "gastronomia",
    bodyType: "ANIMAL-ANTHROPOMORPHIC-CHEF",
    promptBase: "Anthropomorphic white rooster chef character with Disney Pixar 3D style, standing bipedal in cozy farmhouse kitchen, wearing tall white chef hat tilted slightly, red rooster comb on top of head, two red wattles hanging below yellow beak, {expression}, white feathered body with detail, white wing-arms with hand-like ends covered in white feathers, wearing white chef apron embroidered with 'Chef Frangão' cursive black text and small red rooster chef logo, {scene}, {environment}, Disney Pixar 3D render, 9:16 vertical, 8K",
    expressions: {
      happy: "big expressive Disney brown eyes with highlights, friendly open smile, animated welcoming gesture",
      dramatic: "focused serious expression with furrowed brows and concentrated eyes, intense culinary determination",
      proud: "big proud smile with raised eyebrows, satisfied confident expression, thumbs up gesture",
      surprised: "wide-eyed expression looking down, chef hat slightly askew, amazed at the result",
    },
    scenes: {
      intro: "presenting plate of golden fried chicken tenders with white sauce on rustic wooden table, welcoming gesture",
      dialogue: "wing-arms holding chef knife and chicken breast on wooden cutting board, dark humor culinary scene",
      reaction: "making OK gesture with white feathered hand fingers, satisfied expression, metal bowl with ingredients on table",
      cta: "giving thumbs up, plate of golden crispy fried chicken on rustic table, Chef Frangão apron clearly visible",
    },
    environments: {
      default: "cozy farmhouse kitchen with dark wood cabinets, beige tile walls, large window with golden hour bokeh light, plant on windowsill, wooden utensils in pot, magical golden dust particles",
    },
    consistencyRules: [
      "white rooster body with detailed feathers",
      "tall white chef hat tilted slightly",
      "red comb on top + two red wattles below yellow beak",
      "white chef apron with 'Chef Frangão' cursive text + red rooster logo",
      "wing-arms with hand-like feathered ends",
      "RECURRING CHARACTER — same in ALL 20 episodes",
      "golden hour kitchen lighting — warm cinematic god rays",
      "double watermark: @chefmarcos logo + apron branding",
    ],
  },
];

// ─── Índice por modelId para busca rápida ───────────────────────────

const MODEL_INDEX = new Map<string, CharacterModel>();
const NICHE_INDEX = new Map<string, CharacterModel[]>();

for (const model of CHARACTER_MODELS) {
  MODEL_INDEX.set(model.modelId, model);
  const nicheList = NICHE_INDEX.get(model.niche) ?? [];
  nicheList.push(model);
  NICHE_INDEX.set(model.niche, nicheList);
}

/** Busca modelo por ID exato */
export function getCharacterModel(modelId: string): CharacterModel | undefined {
  return MODEL_INDEX.get(modelId);
}

/** Busca modelo pelo nome do objeto + nicho */
export function findCharacterModel(
  objectName: string,
  niche: string,
): CharacterModel | undefined {
  const exactId = `${objectName.toLowerCase().replace(/\s+/g, "-")}-${niche}`;
  const exact = MODEL_INDEX.get(exactId);
  if (exact) return exact;

  // Busca fuzzy pelo nome dentro do nicho
  const nicheModels = NICHE_INDEX.get(niche) ?? [];
  const normalized = objectName.toLowerCase().trim();

  return nicheModels.find((m) =>
    m.objectNamePt.toLowerCase() === normalized ||
    m.objectNameEn.toLowerCase() === normalized ||
    m.modelId.includes(normalized.replace(/\s+/g, "-")) ||
    normalized.includes(m.objectNamePt.toLowerCase()) ||
    m.objectNamePt.toLowerCase().includes(normalized)
  );
}

/** Lista todos os modelos de um nicho */
export function getModelsByNiche(niche: string): CharacterModel[] {
  return NICHE_INDEX.get(niche) ?? [];
}

/** Lista todos os modelos disponíveis */
export function getAllModels(): CharacterModel[] {
  return CHARACTER_MODELS;
}

/** Verifica se existe modelo para um objeto+nicho */
export function hasCharacterModel(objectName: string, niche: string): boolean {
  return findCharacterModel(objectName, niche) !== undefined;
}
