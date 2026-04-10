/**
 * ViralObj — niches.js
 * 15-niche library with object lists, personalities, validated prompts
 * Formats A–K | 87+ objects | 15 niches
 */

// ─── FORMAT DEFINITIONS (J + K are new in v1.7.0) ──────────────────────────

export const FORMATS = {
  J: {
    id: "J",
    name: "SINGLE-TUTORIAL-BODY",
    description: "1 personagem full-body percorre superfícies macro do corpo humano como cenários por dica. Sem humano inteiro ao fundo — apenas macrofotografia hiper-realista da pele/cabelo/dentes como palco. Contraste brutal: Pixar 3D + hiper-realismo orgânico.",
    body: "full-body-hands",
    legs: true,
    hands_detailed: true,
    human_background: false,
    body_surface_macro: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "zoom-in-surface",
    expression_arc: "confident → shocked → determined → satisfied → proud",
    best_for: ["skincare-natural", "saude-receitas", "beleza", "odontologia", "medicina"],
    tone: "educational",
    scenes_per_video: "5-7",
    flux_template: {
      character_base: "[EMOÇÃO] animated [OBJETO] character, [FORMA] shape, full body with torso, long arms with detailed 5-finger hands, legs and feet, [ACESSÓRIO], [COR OLHOS] expressive cartoon eyes, [COR] smooth skin texture, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K",
      scene_variant: "[BASE_CHAR] [EXPRESSÃO] expression, [AÇÃO], on extreme macro close-up of [SUPERFÍCIE CORPORAL] with [DETALHE HIPER-REALISTA], [PRODUTO/INGREDIENTE] visible, [ILUMINAÇÃO], 9:16 vertical, 8K"
    },
    caption_style: "alpha-karaoke",
    reference_account: "@objetosfalantes",
    reference_video: "oleo-de-coco-skincare-54s",
    cataloged_date: "2026-04-10",
    examples: [
      { object: "coconut-oil-drop", surfaces: ["nariz-poros", "couro-cabeludo", "dente-esmalte", "rosto-cravao", "pele-ressecada"] }
    ]
  },
  K: {
    id: "K",
    name: "SINGLE-RECIPE-JOURNEY",
    description: "1 personagem full-body executa uma receita completa passo a passo, mudando de cenário de cozinha a cada etapa. O objeto É o protagonista que cozinha — pega ingredientes, usa eletrodomésticos, refrigera, apresenta resultado. Sem humano ao fundo. Props fotorrealísticos de cozinha.",
    body: "full-body-cylindrical",
    legs: true,
    hands: "gloves-colored",
    shoes: "sneakers-contrast",
    human_background: false,
    props_realistic: true,
    scene_changes: "recipe-step",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "cut-based",
    expression_arc: "confident → working → proud → CTA-vaidade",
    label_reveal: true,
    best_for: ["culinaria-receitas", "gastronomia", "casa", "fitness-nutricao"],
    tone: "funny",
    sub_tone: "vaidoso-orgulhoso",
    scenes_per_video: "4-5",
    flux_template: {
      character_base: "[OBJETO EMBALAGEM] animated character, [FORMA CILÍNDRICA/EMBALAGEM] body shape, [RÓTULO ORIGINAL] label design visible on body, face embedded on label area with [COR] expressive eyes, colored [MATERIAL] gloves matching label color, short legs with contrasting red sneakers, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K",
      scene_variant: "[BASE_CHAR] [EXPRESSÃO], [AÇÃO COM PROP], in realistic Brazilian kitchen scene with [CENÁRIO ESPECÍFICO], [PROP FOTORREALÍSTICO] visible in detail, [ILUMINAÇÃO COZINHA], 9:16 vertical, 8K"
    },
    caption_style: "beta-word-karaoke",
    cta_label_invert: true,
    reference_account: "@objetosfalantes",
    reference_video: "leite-condensado-receita-47s",
    cataloged_date: "2026-04-10",
    technical_notes: {
      asmr_close: "1 frame sem personagem — super close no produto/textura. Ativa resposta sensorial. Usar em 1-2 frames por vídeo.",
      inside_angle: "1 cena em local inusitado (dentro geladeira, dentro forno). Para o scroll por ser visualmente inesperado.",
      label_reveal: "Nos últimos 10s o rótulo do personagem INVERTE paleta de cores. Sinaliza encerramento + reforça identidade."
    }
  }
};

// ─── FORMAT REGISTRY (all 11 formats A–K) ───────────────────────────────────

export const FORMAT_REGISTRY = [
  { id: "A", name: "MULTI-STUB",                    niches: ["casa", "plantas", "financeiro"],                              tone: "angry" },
  { id: "B", name: "SINGLE-FULL",                   niches: ["culinaria", "natureza", "saude"],                             tone: "educational" },
  { id: "C", name: "DRESSED-CHAR",                  niches: ["imoveis", "juridico", "empreendedorismo"],                    tone: "dramatic" },
  { id: "D", name: "MAP-DOC",                       niches: ["viagem", "imoveis", "educacao"],                              tone: "educational" },
  { id: "E", name: "RECIPE-MAGIC",                  niches: ["culinaria", "casa", "saude"],                                 tone: "educational" },
  { id: "F", name: "SINGLE-MULTI-COSTUME",          niches: ["saude-receitas", "culinaria", "beleza"],                      tone: "educational" },
  { id: "G", name: "DRESSED-CHAR+RECIPE-SPLIT",     niches: ["saude-receitas", "culinaria", "beleza"],                      tone: "educational" },
  { id: "H", name: "VILLAIN-HERO NARRATIVE",         niches: ["casa", "saude", "natureza"],                                  tone: "dramatic" },
  { id: "I", name: "DUO-SCENE",                     niches: ["gastronomia", "casa", "culinaria", "fitness", "beleza"],       tone: "funny" },
  { id: "J", name: "SINGLE-TUTORIAL-BODY",          niches: ["skincare-natural", "saude-receitas", "beleza", "odontologia"], tone: "educational" },
  { id: "K", name: "SINGLE-RECIPE-JOURNEY",         niches: ["culinaria-receitas", "gastronomia", "casa"],                  tone: "funny" },
];

// ─── CAPTION STYLES ─────────────────────────────────────────────────────────

export const CAPTION_STYLES = {
  "alpha": {
    id: "alpha",
    description: "bold white Arial Black, 2px black outline, center-bottom, ALL CAPS or mixed",
    font: "Arial Black",
    color: "#FFFFFF",
    outline: "2px solid #000000",
    position: "center-bottom",
    pill: false,
  },
  "beta": {
    id: "beta",
    description: "white pill, 2 colors (normal + highlight), 12px border-radius",
    font: "bold rounded",
    color: "#FFFFFF",
    pill: true,
    border_radius: "12px",
  },
  "gamma": {
    id: "gamma",
    description: "dark pill top (hook 0-5s) + white pill watermark (mid+) + single-word karaoke bottom",
    pill: true,
    position: "top+bottom",
  },
  "gamma-B": {
    id: "gamma-B",
    description: "WHITE pill top BLACK text (hook 0-Xs) + white pill watermark + single-word karaoke bottom bold rounded",
    pill: true,
    position: "top+bottom",
  },
  "gamma-B-rodape": {
    id: "gamma-B-rodape",
    description: "WHITE pill top BLACK text (hook 0-4s) + plain WHITE TEXT watermark bottom-center (NO pill) + single ironic word pill at very end",
    pill: true,
    position: "top+bottom",
  },
  "alpha-karaoke": {
    id: "alpha-karaoke",
    description: "NO top hook pill. Single word karaoke bottom-center (bold white, no pill, black outline) + plain white text watermark bottom-right",
    font: "bold rounded",
    color: "#FFFFFF",
    outline: "2px solid #000000",
    position: "center-bottom",
    pill: false,
    watermark: "plain text bottom-right white",
  },
  "beta-word-karaoke": {
    id: "beta-word-karaoke",
    description: "1 palavra isolada por beat de voz. Bold arredondada, branco 100% opaco, outline preto ~3px, posição centro-baixo. Watermark @conta plain text bottom-center cor branca.",
    font: "bold rounded",
    color: "#FFFFFF",
    outline: "3px solid #000000",
    position: "center-bottom",
    words_per_frame: 1,
    pill: false,
    watermark: "plain text bottom-center white",
    examples: ["Leite", "ingredientes", "tá?", "pra", "liquidificador", "ganhar", "delícia", "leva", "gostoso"]
  },
};

// ─── NICHES ─────────────────────────────────────────────────────────────────

export const NICHES = {
  casa: {
    name_pt: "Casa & Limpeza",
    name_en: "Home & Cleaning",
    emoji: "🏠",
    tone_default: "angry",
    objects: [
      { pt: "água sanitária", en: "bleach", emoji: "🧴", personality: "ressentida, indignada" },
      { pt: "celular", en: "smartphone", emoji: "📱", personality: "raiva com nojo" },
      { pt: "garrafa pet", en: "plastic bottle", emoji: "🍶", personality: "alarmada, urgente" },
      { pt: "lixeira", en: "trash can", emoji: "🗑️", personality: "furiosa, explosiva" },
      { pt: "esponja de pia", en: "kitchen sponge", emoji: "🧽", personality: "enojada consigo mesma" },
      { pt: "pano de prato", en: "dish cloth", emoji: "🧻", personality: "histérica, urgente" },
      { pt: "tábua de corte", en: "cutting board", emoji: "🪵", personality: "preocupada, séria" },
      { pt: "travesseiro", en: "pillow", emoji: "🛏️", personality: "exausto, sofrendo" },
      { pt: "toalha de banho", en: "bath towel", emoji: "🏳️", personality: "resignada, cansada" },
      { pt: "escova de dentes", en: "toothbrush", emoji: "🪥", personality: "abandonada, triste" },
      { pt: "mofo de parede", en: "wall mold", emoji: "🦠", personality: "arrogante, confiante, vilão cômico", format: "H", special: "grows FROM wall surface — embedded character, not standalone. Has mini-colony children around it." },
      { pt: "spray de limpeza", en: "cleaning spray bottle", emoji: "🧴", personality: "herói silencioso, furioso, determinado", format: "A", special: "hero counterpart to mofo — enters scene from right side" },
      // —— Banheiro Duos (Tipo I) ————————————————————————————————————————————
      { pt: "sabonete velho", en: "old bar soap", emoji: "🧼", personality: "furiosa, resentida, se sente substituída", format: "I", partner: "sabonete líquido", deterioration: "camadas de pele rosa/branca/amarela derretendo" },
      { pt: "sabonete líquido", en: "liquid soap", emoji: "🧴", personality: "assustada, chora fácil, tímida, transparente", format: "I", partner: "sabonete velho", special: "confetti dots inside transparent body, huge anime tears" },
      { pt: "escova velha descabelada", en: "old worn toothbrush", emoji: "🪥", personality: "raivosa, cabelos explodindo, se sente ultrapassada", format: "I", partner: "escova elétrica", special: "cabelos/cerdas para fora como monstro, corpo azul deteriorado com label ESCOVA DESCABELADA" },
      { pt: "escova elétrica", en: "electric toothbrush", emoji: "⚡", personality: "assustada, elegante, high-tech", format: "I", partner: "escova velha", special: "aura de luz azul neon vibrando no topo, label ESCOVA ELÉTRICA PRISTINE" },
      { pt: "creme dental clássico", en: "classic toothpaste", emoji: "🪥", personality: "raivosa, clássica, defensiva do flúor", format: "I", partner: "creme carvão", special: "tubo amassado vermelho DENTAGUARD, corpo encolhido mas furioso" },
      { pt: "creme carvão ativado", en: "charcoal toothpaste", emoji: "⬛", personality: "assustada, chora lágrimas pretas", format: "I", partner: "creme dental clássico", special: "preto com lágrimas negras escorrendo, label ACTIVATED CHARCOAL" },
      { pt: "shampoo de galão", en: "gallon shampoo", emoji: "🍶", personality: "raivosa, se sente ignorada apesar de durar anos", format: "I", partner: "shampoo a seco", special: "2L amarelo amassado, vapor de raiva pelas narinas, label SHAMPOO DE GALÃO NEUTRO" },
      { pt: "shampoo a seco", en: "dry shampoo", emoji: "💸", personality: "assustada, premium, delicada, se sente frágil", format: "I", partner: "shampoo de galão", special: "lata aerosol rosa slim, pernas de metal finas, label SHAMPOO A SECO PREMIUM 200ml" },
      { pt: "barbeador enferrujado", en: "old rusty razor", emoji: "🪒", personality: "resignada, triste, completamente deteriorada, não tem mais raiva", format: "I", partner: "depilador elétrico", deterioration: "plástico amarelo com ferrugem marrom, cerdas completamente destruídas" },
      { pt: "depilador elétrico", en: "electric epilator", emoji: "🌸", personality: "também triste, solidária com o velho, não gosta de ver sofrimento", format: "I", partner: "barbeador enferrujado", special: "branco/rosê elegante, olhos grandes anime azuis cheios de lágrimas de compaixão" },
    ],
    prompts_base: "Brazilian home interior, Pixar 3D render, warm/cool lighting per room, human character in background making mistake",
  },
  plantas: {
    name_pt: "Plantas & Jardinagem",
    name_en: "Plants & Gardening",
    emoji: "🌿",
    tone_default: "educational",
    objects: [
      { pt: "adenium (rosa do deserto)", en: "desert rose", emoji: "🌸", personality: "orgulhosa, resiliente" },
      { pt: "jibóia", en: "pothos", emoji: "🪴", personality: "dramática, engraçada" },
      { pt: "rosa", en: "rose", emoji: "🌹", personality: "séria mas carinhosa" },
      { pt: "cacto", en: "cactus", emoji: "🌵", personality: "sarcástico, sobrevivente" },
      { pt: "orquídea", en: "orchid", emoji: "🌺", personality: "delicada, exigente" },
      { pt: "samambaia", en: "fern", emoji: "🌿", personality: "ansiosa, úmida" },
      { pt: "suculenta", en: "succulent", emoji: "🪴", personality: "despretenciosa, casual" },
      { pt: "ficus", en: "ficus", emoji: "🌳", personality: "dramática, saudosista" },
    ],
    prompts_base: "Garden or indoor setting, Pixar 3D render, golden hour warm light, gardener character in background",
  },
  financeiro: {
    name_pt: "Finanças & Dinheiro",
    name_en: "Finance & Money",
    emoji: "💰",
    tone_default: "dramatic",
    objects: [
      { pt: "nota de R$50", en: "R$50 bill", emoji: "💵", personality: "dramática, sofrida" },
      { pt: "moeda de R$1", en: "R$1 coin", emoji: "🪙", personality: "humilhada, resignada" },
      { pt: "cartão de crédito", en: "credit card", emoji: "💳", personality: "exausta, sobrecarregada" },
      { pt: "boleto", en: "bill/invoice", emoji: "📄", personality: "ameaçadora, séria" },
      { pt: "poupança", en: "savings account", emoji: "🏦", personality: "triste, esquecida" },
      { pt: "PIX", en: "instant payment", emoji: "⚡", personality: "rápido, impaciente" },
      { pt: "nota fiscal", en: "receipt/invoice", emoji: "🧾", personality: "ignorada, importante" },
      { pt: "imposto", en: "tax", emoji: "📊", personality: "inevitável, infeliz" },
    ],
    prompts_base: "Brazilian financial context, supermarket/home/office, Pixar 3D render, person making financial mistake in background",
  },
  culinaria: {
    name_pt: "Culinária & Gastronomia",
    name_en: "Cooking & Food",
    emoji: "🍳",
    tone_default: "educational",
    objects: [
      { pt: "tomate chef", en: "chef tomato", emoji: "🍅", personality: "alegre, ensinando" },
      { pt: "frigideira", en: "frying pan", emoji: "🍳", personality: "exasperada, técnica" },
      { pt: "colher de pau", en: "wooden spoon", emoji: "🥄", personality: "sábia, experiente" },
      { pt: "azeite", en: "olive oil", emoji: "🫙", personality: "refinada, orgulhosa" },
      { pt: "alho", en: "garlic", emoji: "🧄", personality: "poderoso, intenso" },
      { pt: "açúcar", en: "sugar", emoji: "🍬", personality: "doce, sedutora" },
      { pt: "fermento", en: "yeast/baking powder", emoji: "🌡️", personality: "ansioso, expansivo" },
      { pt: "forno", en: "oven", emoji: "♨️", personality: "autoritário, preciso" },
    ],
    prompts_base: "Modern Brazilian kitchen, warm cooking atmosphere, Pixar 3D render, cook/chef character, ingredients on counter",
  },
  natureza: {
    name_pt: "Natureza & Sobrevivência",
    name_en: "Nature & Survival",
    emoji: "🌱",
    tone_default: "dramatic",
    objects: [
      { pt: "planta venenosa", en: "poisonous plant", emoji: "🌿", personality: "perigosa, sedutora" },
      { pt: "inseto", en: "insect", emoji: "🐛", personality: "ameaçador, pequeno" },
      { pt: "cogumelo silvestre", en: "wild mushroom", emoji: "🍄", personality: "traiçoeiro, belo" },
      { pt: "cobra", en: "snake", emoji: "🐍", personality: "calma, perigosa" },
      { pt: "abelha", en: "bee", emoji: "🐝", personality: "incompreendida, útil" },
    ],
    prompts_base: "Nature/outdoor setting, dramatic lighting, Pixar 3D render, person approaching dangerously in background",
  },
  saude: {
    name_pt: "Saúde & Bem-estar",
    name_en: "Health & Wellness",
    emoji: "💊",
    tone_default: "educational",
    objects: [
      { pt: "copo d'água", en: "glass of water", emoji: "💧", personality: "negligenciada, essencial" },
      { pt: "comprimido", en: "pill/medicine", emoji: "💊", personality: "mal administrado, preocupado" },
      { pt: "tensão arterial", en: "blood pressure monitor", emoji: "🩺", personality: "alertando, urgente" },
      { pt: "termômetro", en: "thermometer", emoji: "🌡️", personality: "ignorado, preciso" },
      { pt: "protetor solar", en: "sunscreen", emoji: "☀️", personality: "rejeitado, necessário" },
      { pt: "vitamina", en: "vitamin supplement", emoji: "🔶", personality: "esquecida, esperançosa" },
      { pt: "açúcar refinado", en: "refined sugar", emoji: "🍬", personality: "culpado, sedutor" },
      { pt: "cigarro", en: "cigarette", emoji: "🚬", personality: "arrependido, honesto" },
    ],
    prompts_base: "Health/home context, Pixar 3D render, person ignoring health advice in background",
  },
  pets: {
    name_pt: "Pets & Animais",
    name_en: "Pets & Animals",
    emoji: "🐾",
    tone_default: "educational",
    objects: [
      { pt: "ração de pet", en: "pet food", emoji: "🦴", personality: "preocupada com nutrição" },
      { pt: "coleira", en: "collar", emoji: "🦮", personality: "bem-intencionada, cuidadosa" },
      { pt: "vacina", en: "vaccine", emoji: "💉", personality: "protetora, incompreendida" },
      { pt: "brinquedo do pet", en: "pet toy", emoji: "🎾", personality: "entusiasmada, energética" },
      { pt: "caixa de areia", en: "litter box", emoji: "📦", personality: "revoltada, insalubre" },
      { pt: "antipulgas", en: "flea treatment", emoji: "🔬", personality: "séria, preventiva" },
    ],
    prompts_base: "Brazilian home with pet, Pixar 3D render, loving but confused pet owner in background",
  },
  fitness: {
    name_pt: "Fitness & Academia",
    name_en: "Fitness & Gym",
    emoji: "🏋️",
    tone_default: "funny",
    objects: [
      { pt: "halter", en: "dumbbell", emoji: "🏋️", personality: "frustrado com forma errada" },
      { pt: "whey protein", en: "protein shake", emoji: "🥛", personality: "mal utilizado, preocupado" },
      { pt: "tênis de corrida", en: "running shoes", emoji: "👟", personality: "abandonado, resiliente" },
      { pt: "tapete de yoga", en: "yoga mat", emoji: "🧘", personality: "negligenciado, paciente" },
      { pt: "esteira", en: "treadmill", emoji: "🏃", personality: "subutilizado, motivador" },
      { pt: "garrafa de água", en: "water bottle", emoji: "💧", personality: "ignorado, vital" },
      { pt: "luva de musculação", en: "gym gloves", emoji: "🥊", personality: "envelhecida, dedicada" },
    ],
    prompts_base: "Gym or home workout space, Pixar 3D render, person doing exercise incorrectly in background",
  },
  maternidade: {
    name_pt: "Maternidade & Família",
    name_en: "Parenting & Family",
    emoji: "🍼",
    tone_default: "educational",
    objects: [
      { pt: "fralda", en: "diaper", emoji: "🍼", personality: "urgente, sobrecarregada" },
      { pt: "mamadeira", en: "baby bottle", emoji: "🍼", personality: "cuidadosa, higiênica" },
      { pt: "termômetro de bebê", en: "baby thermometer", emoji: "🌡️", personality: "preocupada, precisa" },
      { pt: "berço", en: "crib", emoji: "🛏️", personality: "cansado, dedicado" },
      { pt: "chupeta", en: "pacifier", emoji: "😴", personality: "incompreendida, essencial" },
      { pt: "carrinho de bebê", en: "stroller", emoji: "👶", personality: "orgulhosa, protetora" },
    ],
    prompts_base: "Baby room or family home, Pixar 3D render, tired but loving parent in background",
  },
  "saude-mental": {
    name_pt: "Saúde Mental & Mindfulness",
    name_en: "Mental Health & Mindfulness",
    emoji: "🧘",
    tone_default: "educational",
    objects: [
      { pt: "celular (dependência)", en: "smartphone (addiction)", emoji: "📱", personality: "viciante, honesta" },
      { pt: "alarme do despertador", en: "alarm clock", emoji: "⏰", personality: "odiado, necessário" },
      { pt: "travesseiro", en: "pillow", emoji: "😴", personality: "exausto, sábio" },
      { pt: "diário", en: "journal", emoji: "📓", personality: "esperançoso, esquecido" },
      { pt: "app de meditação", en: "meditation app", emoji: "🧘", personality: "ignorado, paciente" },
      { pt: "café (excesso)", en: "coffee (excess)", emoji: "☕", personality: "culpado, dependente" },
    ],
    prompts_base: "Modern bedroom or office, Pixar 3D render, stressed person in background, mindfulness context",
  },

  // ─── NEW NICHES — Added from video analysis ──────────────────────────────

  "saude-receitas": {
    name_pt: "Saúde & Receitas Naturais",
    name_en: "Health & Natural Recipes",
    emoji: "🫚",
    tone_default: "educational",
    format_default: "F",
    source_reference: "@objetosfalantes, @casasincerona — canela video 2026-04-09",
    objects: [
      { pt: "canela em pau", en: "cinnamon stick", emoji: "🪵", personality: "confiante, instrutora, multi-expressão", format: "F", costumes: ["sem roupa", "avental chef", "chapéu chef"] },
      { pt: "gengibre", en: "ginger root", emoji: "🫚", personality: "picante, urgente, dramático", format: "F" },
      { pt: "limão", en: "lemon", emoji: "🍋", personality: "ácido, direto, eficiente", format: "B" },
      { pt: "alho", en: "garlic", emoji: "🧄", personality: "poderoso, mal compreendido, intenso", format: "B" },
      { pt: "cúrcuma", en: "turmeric", emoji: "🟡", personality: "anti-inflamatória, orgulhosa, científica", format: "F" },
      { pt: "chá verde", en: "green tea", emoji: "🍵", personality: "refinada, zen, poderosa", format: "B" },
      { pt: "mel", en: "honey", emoji: "🍯", personality: "doce mas firme, protetora", format: "E" },
      { pt: "vinagre de maçã", en: "apple cider vinegar", emoji: "🍎", personality: "azeda, incompreendida, eficaz", format: "A" },
      { pt: "chia", en: "chia seeds", emoji: "⚫", personality: "pequena mas poderosa, surpresa", format: "A" },
      { pt: "erva-cidreira", en: "lemon balm", emoji: "🌿", personality: "calmante, suave, acolhedora", format: "E" },
      { pt: "maçã nutricionista", en: "apple nutritionist", emoji: "🍎", personality: "confiante, científica, positiva", format: "G", costume: "jaleco branco nutricionista, segura copo de vitamina + colher" },
      { pt: "aveia", en: "oat flakes", emoji: "🥣", personality: "modesta, poderosa, subestimada", format: "A" },
      { pt: "banana cardiologista", en: "banana cardiologist", emoji: "🍌", personality: "energética, expert em coração", format: "G", costume: "jaleco branco + estetoscópio" },
      { pt: "morango dermatologista", en: "strawberry dermatologist", emoji: "🍓", personality: "delicada, especialista em pele", format: "G", costume: "jaleco branco + prancheta" },
    ],
    prompts_base: "Brazilian kitchen, marble counter, glass pot boiling on gas stove, natural ingredients around, warm golden lighting, Pixar 3D render, no human in background (ingredient is the star)",
    caption_style: "gamma",
    caption_gamma: {
      top_fixed: "Bold dark pill, white ALL CAPS text, benefit statement, persists 0-5s",
      watermark: "White pill @account top-left, appears from mid-video",
      bottom_karaoke: "Single word at a time, colorful/white, no pill, bold rounded font"
    },
    hooks: [
      "LIMPA TODA SUJEIRA E SECA BARRIGA",
      "ELA QUEIMA GORDURA DORMINDO",
      "A RECEITA QUE MÉDICO NÃO QUER QUE VOCÊ SAIBA",
      "ESSE CHÁ SIMPLES MUDOU MINHA VIDA",
      "TOMA EM JEJUM E VÊ O QUE ACONTECE"
    ],
  },

  // ─── gastronomia — Type I DUO-SCENE ─────────────────────────────────────────
  "gastronomia": {
    name_pt: "Gastronomia & Comida Brasileira",
    name_en: "Brazilian Food & Gastronomy",
    emoji: "🍽️",
    tone_default: "funny",
    format_default: "I",
    source_reference: "@objetosfalantes — duos comida BR 2026-04-09",
    objects: [
      { pt: "picanha", en: "picanha steak", emoji: "🥩", personality: "arrogante, rainha do churrasco", format: "I", partner: "linguiça" },
      { pt: "linguiça", en: "sausage", emoji: "🌭", personality: "resignada, raivosa, sempre no segundo lugar", format: "I", partner: "picanha" },
      { pt: "pão de alho", en: "garlic bread", emoji: "🍞", personality: "confiante, essencial, sabe disso", format: "I", partner: "espetinho" },
      { pt: "pão de queijo", en: "cheese bread", emoji: "🧀", personality: "sarcástico, orgulho mineiro/BR", format: "I" },
      { pt: "pastel", en: "pastel", emoji: "🫔", personality: "rei da feira, popular, briguento", format: "I", partner: "hamburguer" },
      { pt: "coxinha", en: "coxinha", emoji: "🍗", personality: "malandreira, sedutora, irresistível", format: "I", partner: "empadinha" },
      { pt: "pudim", en: "flan pudding", emoji: "🍮", personality: "arrogante, rei das festas, status", format: "I", partner: "brigadeiro" },
      { pt: "brigadeiro", en: "brigadeiro", emoji: "🍫", personality: "inseguro, impressionado, humilde", format: "I", partner: "pudim" },
      { pt: "batata-doce", en: "sweet potato", emoji: "🍠", personality: "furiosa, saudável, brava com o mundo", format: "I", partner: "batata-frita cheddar" },
      { pt: "batata-frita cheddar", en: "loaded cheese fries", emoji: "🍟", personality: "feliz, despreocupada, deliciosa e sabe", format: "I", partner: "batata-doce" },
    ],
    prompts_base: "Iconic Brazilian food setting — BBQ grill, padaria counter, festa junina table, gym counter, morning kitchen. NO human characters. Two food characters per scene, faces embedded directly in food texture, small stub arms. Disney/Pixar 3D render.",
    duo_rule: "ALWAYS pair contrasting personalities — saudável vs. indulgente, arrogante vs. resignado, tradicional vs. moderno",
    duo_dynamics: [
      "arrogante vs. resignada (picanha + linguiça)",
      "confiante vs. raivoso (pão de alho + espetinho)",
      "saudável furiosa vs. indulgente feliz (batata-doce + batata-frita)",
      "arrogante vs. inseguro (pudim + brigadeiro)"
    ],
  },

  "frutas-drama": {
    name_pt: "Frutas & Drama",
    name_en: "Fruit Drama",
    emoji: "🍓",
    tone_default: "dramatic",
    format_default: "C",
    source_reference: "Tendência viral BR abril/2026 — Abacatudo, Moranguete, Bananildo",
    objects: [
      { pt: "morango (Moranguete)", en: "strawberry", emoji: "🍓", personality: "dramática, passional, protagonista", format: "C" },
      { pt: "abacate (Abacatudo)", en: "avocado", emoji: "🥑", personality: "confiante, charme, traidor", format: "C" },
      { pt: "banana (Bananildo)", en: "banana", emoji: "🍌", personality: "ingênuo, engraçado, azarado", format: "C" },
      { pt: "pera (Perita)", en: "pear", emoji: "🍐", personality: "delicada, sedutora, misteriosa", format: "C" },
      { pt: "laranja (Laranjo)", en: "orange", emoji: "🍊", personality: "explosivo, esportista, direto", format: "C" },
      { pt: "melancia (Melão)", en: "watermelon", emoji: "🍉", personality: "rico, superficial, arrogante", format: "C" },
    ],
    prompts_base: "Brazilian social scenario — BBQ, party, apartment, office, Pixar 3D render, DRESSED-CHAR style (fruit as head on human body), expressive faces, dramatic lighting",
    content_warning: "Use only educational/positive storylines — avoid toxic relationship portrayal",
  },

  // ─── skincare-natural — Type J SINGLE-TUTORIAL-BODY (v1.7.0) ─────────────
  "skincare-natural": {
    name_pt: "Skincare Natural",
    name_en: "Natural Skincare",
    emoji: "🧴",
    tone_default: "educational",
    format_default: "J",
    alt_formats: ["B", "F", "G"],
    source_reference: "@objetosfalantes — oleo-de-coco-skincare 2026-04-10",
    expression: "confident-teacher",
    bpm_range: [88, 105],
    music_style: "warm acoustic spa",
    caption_style: "alpha-karaoke",
    series: {
      name: "Ingredientes Naturais Que Curam",
      format: "J",
      episodes: [
        { ep: 1, object: "oleo-de-coco",    status: "catalogado",     surfaces: ["nariz-poros","couro-cabeludo","dente-esmalte","cravao","pele-ressecada"] },
        { ep: 2, object: "mel",             status: "pronto-produzir", surfaces: ["ferida","acne","garganta","cabelo","queimadura-solar"] },
        { ep: 3, object: "aloe-vera",       status: "pronto-produzir", surfaces: ["queimadura-solar","pele-oleosa","couro-cabeludo","olheiras","cicatriz"] },
        { ep: 4, object: "bicarbonato",     status: "planejado",       surfaces: ["dente","axila","pes","fungo-unha"] },
        { ep: 5, object: "vinagre-de-maca", status: "planejado",       surfaces: ["cabelo","estomago","pele-oleosa","caspa"] },
        { ep: 6, object: "curcuma",         status: "planejado",       surfaces: ["inflamacao","dente","pele","articulacao"] },
        { ep: 7, object: "gengibre",        status: "planejado",       surfaces: ["garganta","estomago","couro-cabeludo","articulacao"] }
      ]
    },
    objects: [
      {
        id: "oleo-de-coco",
        pt: "óleo de coco",
        en: "coconut oil",
        emoji: "🥥",
        label: "Óleo de Coco",
        shape: "teardrop-cream-white",
        accessory: "green-leaf-scarf",
        eye_color: "brown-amber",
        body_type: "full-body-hands",
        personality: "confiante, educativa, carinhosa",
        format: "J",
        flux_base: "Cute animated coconut oil drop character, white cream teardrop shape with pointed tip, full body with torso, long arms with detailed 5-finger hands, legs and feet, green leaf scarf necktie around neck, expressive brown-amber cartoon eyes, brown arched eyebrows, smooth white cream skin texture, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K",
        voice: { voice_id: "Friendly_Person", emotion: "cheerful", speed: 1.05, pitch: 1 },
        surfaces_catalog: {
          "nariz-poros":    "extreme macro close-up of human nose with highly visible open pores and blackheads, pore craters in ultra-high detail, skin texture hiper-realistic",
          "couro-cabeludo": "macro close-up of dark hair scalp with oily golden honey-colored liquid spreading between hair roots and follicles, ultra-detailed hair strands",
          "dente-esmalte":  "macro close-up of white tooth enamel surface with gum pink tissue, turmeric yellow paste dripping, dental texture ultra-realistic",
          "cravao":         "extreme macro close-up of human nose skin with massive blackhead visible, enlarged pore dark opening, skin texture ultra-realistic hiper-macro",
          "pele-ressecada": "extreme macro close-up of severely dry cracked skin heel or elbow, deep skin fissures and cracks ultra-detailed, flaky dead skin texture"
        }
      },
      {
        id: "mel",
        pt: "mel",
        en: "honey",
        emoji: "🍯",
        label: "Mel",
        shape: "round-oval-golden-amber",
        accessory: "tiny-bee-antennae",
        eye_color: "dark-brown",
        personality: "doce, protetora, sábia",
        format: "J",
        flux_base: "Cute animated honey drop character, round golden amber teardrop shape, full body with arms hands and legs, tiny bee antenna on top, warm golden glow skin texture, sticky honey drip effect on body edges, big expressive dark cartoon eyes, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K",
        voice: { voice_id: "Friendly_Person", emotion: "cheerful", speed: 1.00, pitch: 1 }
      },
      {
        id: "aloe-vera",
        pt: "aloe vera / babosa",
        en: "aloe vera",
        emoji: "🌿",
        label: "Aloe Vera / Babosa",
        shape: "succulent-leaf-green",
        accessory: "transparent-gel-drip",
        eye_color: "green-lime",
        personality: "calma, refrescante, curadora",
        format: "J",
        flux_base: "Cute animated aloe vera character, green succulent leaf shape with pointed tip, full body with torso arms hands and legs, transparent cooling gel dripping from body, calming green eyes, white gloves, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K",
        voice: { voice_id: "Calm_Woman", emotion: "cheerful", speed: 0.95, pitch: 1 }
      }
    ],
    body_surfaces: [
      "nariz-poros","couro-cabeludo","dente-esmalte","cravao-blackhead",
      "pele-ressecada","olheiras","acne","cicatriz","axila","pes-calcanhares",
      "labios-ressecados","couro-cabeludo-caspa","unha-fungo","queimadura-solar"
    ],
    correlated_niches: ["saude-receitas","casa","maternidade","fitness","saude"],
    prompts_base: "Extreme macro close-up of human body surface as background, Pixar 3D character walking on/interacting with surface, hyper-realistic organic texture + Disney/Pixar 3D render contrast, warm clinical lighting, 9:16 vertical, 8K",
  },

  // ─── culinaria-receitas — Type K SINGLE-RECIPE-JOURNEY (v1.7.0) ──────────
  "culinaria-receitas": {
    name_pt: "Culinária & Receitas Virais",
    name_en: "Cooking & Viral Recipes",
    emoji: "🍰",
    tone_default: "funny",
    format_default: "K",
    alt_formats: ["B", "E", "F"],
    source_reference: "@objetosfalantes — leite-condensado-receita 2026-04-10",
    caption_style: "beta-word-karaoke",
    series_K: {
      name: "Ingredientes que Fazem Receita Sozinhos",
      format: "K",
      episodes: [
        { ep: 1, object: "leite-condensado", status: "catalogado",     receita: "sorvete caseiro 3 ingredientes" },
        { ep: 2, object: "nutella",          status: "pronto-produzir", receita: "crepe de nutella" },
        { ep: 3, object: "ovos",             status: "pronto-produzir", receita: "omelete de microondas" },
        { ep: 4, object: "farinha-de-trigo", status: "planejado",       receita: "bolo de caneca" },
        { ep: 5, object: "manteiga",         status: "planejado",       receita: "biscoito amanteigado simples" },
        { ep: 6, object: "banana",           status: "planejado",       receita: "sorvete de banana 1 ingrediente" },
        { ep: 7, object: "iogurte",          status: "planejado",       receita: "panqueca de iogurte" }
      ]
    },
    objects: [
      {
        id: "leite-condensado",
        pt: "leite condensado",
        en: "sweetened condensed milk",
        emoji: "🥫",
        label: "Leite Condensado",
        shape: "cylindrical-can",
        label_color_primary: "#1E6FBF",
        label_color_secondary: "#FFFFFF",
        glove_color: "#1E6FBF",
        shoe_color: "#FF3333",
        pants_color: "#2C2C2C",
        eye_color: "brown-amber",
        expression_dominant: "proud-confident",
        label_invert_cta: true,
        personality: "vaidosa, orgulhosa, sabe que é indispensável",
        format: "K",
        flux_base: "Cute animated sweetened condensed milk can character, cylindrical tin can body with blue and white label reading SWEETENED CONDENSED MILK, face embedded on label with expressive brown-amber cartoon eyes and black arched eyebrows, blue cartoon gloves, short black pants, bright red sneakers, rosy cheeks, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K",
        flux_cta_variant: "Same character with INVERTED LABEL color scheme — white background with blue text, confident winking expression, thumbs up gesture, Disney/Pixar 3D render, 8K",
        voice: { voice_id: "Lively_Girl", emotion: "cheerful", speed: 1.10, pitch: 2 },
        props_catalog: {
          "bancada-madeira":    "warm wooden kitchen countertop, bright window with natural light bokeh, colorful ceramic bowls on shelves, Brazilian home kitchen atmosphere",
          "liquidificador":     "clear glass blender with thick creamy white mixture inside, modern electric blender base, kitchen countertop",
          "geladeira-interior": "open refrigerator interior, white LED lit shelves, fresh fruits and vegetables visible, glass jars and containers, cold temperature effect",
          "tigela-vidro":       "large clear glass mixing bowl with creamy condensed milk dripping from silver spoon, smooth cream texture"
        }
      }
    ],
    kitchen_scenes: [
      "bancada-madeira-clara","liquidificador-vidro","batedeira-stand",
      "forno-aberto","geladeira-interior","mesa-posta-apresentacao",
      "fogao-panela-fervendo","microondas-aberto"
    ],
    camera_techniques: {
      "asmr-close":      "Super close no produto final sem personagem. 1-2 frames por vídeo. Ativa resposta sensorial.",
      "personagem-prop": "Plano médio com personagem + prop fotorrealístico. Proporção Pixar:real = diferencial do formato.",
      "inside-angle":    "Personagem dentro de geladeira ou forno abertos. Ângulo inusitado = parada de scroll garantida."
    },
    correlated_niches: ["gastronomia","casa","maternidade","fitness-nutricao"],
    prompts_base: "Realistic Brazilian kitchen scene with photorealistic props, Pixar 3D character interacting with real kitchen items, warm kitchen lighting, 9:16 vertical, 8K",
  },
};

// ─── ANALYSIS OUTPUT PROMPT TEMPLATE ────────────────────────────────────────

export function generateImplementationPrompt(analysis) {
  const {
    video_file,
    account,
    niche_detected,
    niche_key,
    is_new_niche,
    format_type,
    is_new_format,
    character,
    objects_to_add,
    caption_style,
    hooks_detected,
    prompts_validated,
  } = analysis;

  // ─── Special case: skincare-natural (Format J) ────────────────────────────
  if (niche_key === "skincare-natural") {
    return `
# ViralObj Implementation — Skincare Natural (Format J)
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

### Format: J (SINGLE-TUTORIAL-BODY) — OBRIGATÓRIO
### Série: Ingredientes Naturais Que Curam (7 eps)

Técnica: personagem percorre superfícies macro do corpo humano
Voz: Friendly_Person | cheerful | 1.05x | +1
Legenda: alpha-karaoke
Nichos correlacionados: saude-receitas, casa, maternidade, fitness

### Objects: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
### Caption style: ${caption_style || "alpha-karaoke"}

${JSON.stringify(prompts_validated, null, 2)}
`;
  }

  // ─── Special case: culinaria-receitas (Format K) ──────────────────────────
  if (niche_key === "culinaria-receitas" || (niche_key === "culinaria-receitas-K")) {
    return `
# ViralObj Implementation — Culinária Receitas (Format K)
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

### Format: K (SINGLE-RECIPE-JOURNEY) — OBRIGATÓRIO
### Série: Ingredientes que Fazem Receita Sozinhos (7 eps)

3 técnicas obrigatórias: ASMR close + inside angle + label reveal
Voz: Lively_Girl | cheerful | 1.10x | +2
Legenda: beta-word-karaoke
Nichos correlacionados: gastronomia, casa, maternidade, fitness-nutricao

### Objects: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
### Caption style: ${caption_style || "beta-word-karaoke"}

${JSON.stringify(prompts_validated, null, 2)}
`;
  }

  // ─── Default template ─────────────────────────────────────────────────────
  return `
# ViralObj Implementation Prompt
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

---

## 1. NICHE ACTION

${is_new_niche
  ? `### ✅ CREATE NEW NICHE: \`${niche_key}\`
Add to \`~/viralobj/mcp/tools/niches.js\`:

\`\`\`javascript
"${niche_key}": {
  name_pt: "${niche_detected.name_pt}",
  name_en: "${niche_detected.name_en}",
  emoji: "${niche_detected.emoji}",
  tone_default: "${niche_detected.tone_default}",
  format_default: "${format_type}",
  source_reference: "${account} — ${new Date().toISOString().split("T")[0]}",
  objects: ${JSON.stringify(objects_to_add, null, 4)},
  prompts_base: "${niche_detected.prompts_base}",
},
\`\`\``
  : `### ✅ ADD TO EXISTING NICHE: \`${niche_key}\`
\`\`\`javascript
${objects_to_add.map(o => JSON.stringify(o)).join(",\n")}
\`\`\``
}

## 2. FORMAT: ${format_type} ${is_new_format ? "(NEW)" : "(exists)"}

## 3. DATASET: +1 video, +${prompts_validated?.length || 0} prompts, add "${account}"

## 4. COMMIT
\`\`\`
feat(niches): add ${is_new_niche ? niche_key : objects_to_add.length + " objects to " + niche_key}
Source: ${account} | Format: ${format_type} | Caption: ${caption_style}
\`\`\`
`;
}

export async function loadNicheData(niche) {
  const data = NICHES[niche];
  if (!data) {
    const available = Object.keys(NICHES).join(", ");
    throw new Error(`Unknown niche: "${niche}". Available: ${available}`);
  }
  return data;
}

export async function listNiches({ lang = "pt" } = {}) {
  const list = Object.entries(NICHES).map(([key, n]) => ({
    key,
    name: lang === "en" ? n.name_en : n.name_pt,
    emoji: n.emoji,
    objects_count: n.objects.length,
    tone_default: n.tone_default,
    sample_objects: n.objects.slice(0, 3).map(o => lang === "en" ? (o.en || o.id) : (o.pt || o.id)),
  }));

  const text = lang === "en"
    ? `🎭 ViralObj — Available Niches (${list.length} total)\n\n` +
      list.map(n =>
        `${n.emoji} ${n.key.padEnd(18)} | ${n.name.padEnd(28)} | ${n.objects_count} objects | tone: ${n.tone_default}\n   Objects: ${n.sample_objects.join(", ")}...`
      ).join("\n\n")
    : `🎭 ViralObj — Nichos Disponíveis (${list.length} total)\n\n` +
      list.map(n =>
        `${n.emoji} ${n.key.padEnd(18)} | ${n.name.padEnd(28)} | ${n.objects_count} objetos | tom: ${n.tone_default}\n   Objetos: ${n.sample_objects.join(", ")}...`
      ).join("\n\n");

  return {
    content: [{ type: "text", text }],
    niches: list,
  };
}
