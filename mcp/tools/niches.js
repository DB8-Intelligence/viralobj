/**
 * ViralObj — niches.js
 * 18-niche library with object lists, personalities, validated prompts
 * Formats A–W | 135+ objects | 18 niches | Pipelines: FLUX.2+Fabric, Veo
 */

// ─── FORMAT DEFINITIONS (A–I originals, J+K v1.7.0, L+M v1.8.0, N–S v1.9.0, T–W v2.0.0) ──

export const FORMATS = {
  A: {
    id: "A",
    name: "MULTI-STUB",
    description: "Múltiplos objetos domésticos com stub arms (braços curtos) e sem pernas. Humano ao fundo cometendo o erro denunciado. Cada objeto em seu cenário brasileiro exclusivo.",
    body: "stub-arms-no-legs",
    legs: false,
    human_background: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "static-medium",
    expression_arc: "angry → furious → resigned",
    best_for: ["casa", "plantas", "financeiro"],
    tone: "angry",
    characters_per_video: "3-5",
    flux_template: {
      character: "[OBJETO DOMÉSTICO] animated character, [FORMA] shape body, face embedded on front surface with [EXPRESSÃO] expression, short stub arms, NO legs, [COR] color, standing on [CENÁRIO BRASILEIRO EXCLUSIVO], human character in background doing [ERRO], Disney/Pixar 3D render, 8K"
    },
    caption_style: "alpha",
    reference_account: "@coisadecasa.ia"
  },
  B: {
    id: "B",
    name: "SINGLE-FULL",
    description: "1 personagem com corpo completo (torso + pernas + pés). Caminha e interage. Usado para tutoriais, apresentações de produto, órgãos como personagem.",
    body: "full-body-legs",
    legs: true,
    human_background: false,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "medium-tracking",
    expression_arc: "confident → working → proud",
    best_for: ["culinaria", "natureza", "saude", "skincare-natural"],
    tone: "educational",
    flux_template: {
      character: "[OBJETO/INGREDIENTE] animated character, [FORMA] body shape, full body with torso legs and feet, face embedded on surface with [EXPRESSÃO] expression, [ACESSÓRIO], [COR] smooth texture, [CENÁRIO BRASILEIRO], Disney/Pixar 3D render, 8K"
    },
    caption_style: "alpha",
    reference_account: "@coisadecasa.ia"
  },
  C: {
    id: "C",
    name: "DRESSED-CHAR",
    description: "Objeto como cabeça em corpo humano vestido (terno, avental, jaleco). Corpo humanoide completo com roupas profissionais. Inclui variante animal-chef (frango/salmão com avental).",
    body: "object-head-human-body-dressed",
    legs: true,
    clothing: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "medium-close",
    expression_arc: "professional → authoritative → CTA",
    best_for: ["imoveis", "juridico", "empreendedorismo", "culinaria"],
    tone: "dramatic",
    flux_template: {
      character: "[OBJETO] as head on human body wearing [ROUPA PROFISSIONAL], [EXPRESSÃO] expression, standing in [CENÁRIO PROFISSIONAL], professional pose, Disney/Pixar 3D render, 8K"
    },
    caption_style: "beta",
    reference_account: "@snapinsta"
  },
  D: {
    id: "D",
    name: "MAP-DOC",
    description: "Mapa ou documento com pernas que caminha. Camera tracking acompanha o personagem. Formato viagem/educação.",
    body: "flat-document-with-legs",
    legs: true,
    camera_tracking: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "tracking-follow",
    expression_arc: "excited → informative → CTA",
    best_for: ["viagem", "imoveis", "educacao"],
    tone: "educational",
    flux_template: {
      character: "Animated [MAPA/DOCUMENTO] character, flat [TIPO] body with printed details visible, face embedded on surface, small legs walking, [EXPRESSÃO] expression, [CENÁRIO RELEVANTE], Disney/Pixar 3D render, 8K"
    },
    caption_style: "alpha",
    reference_account: "@objetosfalantes"
  },
  E: {
    id: "E",
    name: "RECIPE-MAGIC",
    description: "Corpo completo com partículas douradas mágicas ao redor. Efeito visual de receita/transformação. Cenário de cozinha com brilho.",
    body: "full-body-golden-particles",
    legs: true,
    particles: "golden-magic",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "medium-sparkle",
    expression_arc: "magical → teaching → proud",
    best_for: ["culinaria", "casa", "saude"],
    tone: "educational",
    flux_template: {
      character: "[INGREDIENTE] animated character, [FORMA] body, full body with legs, golden magic particles floating around, [EXPRESSÃO] expression, [CENÁRIO COZINHA] with warm lighting, Disney/Pixar 3D render, 8K"
    },
    caption_style: "alpha",
    reference_account: "@coisadecasa.ia"
  },
  F: {
    id: "F",
    name: "SINGLE-MULTI-COSTUME",
    description: "1 personagem único com múltiplas trocas de roupa/expressão por etapa da receita. Hook pill fixo no topo 0-5s. Cada step = nova intensidade de expressão.",
    body: "full-body-costume-changes",
    legs: true,
    costume_changes: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "static-medium",
    expression_arc: "happy → confident → angry → furious",
    best_for: ["saude-receitas", "culinaria", "beleza"],
    tone: "educational",
    flux_template: {
      character: "[INGREDIENTE] animated character, [FORMA] body, wearing [ROUPA STEP N], [EXPRESSÃO STEP N] expression, [CENÁRIO], golden particles, Disney/Pixar 3D render, 8K"
    },
    caption_style: "gamma",
    reference_account: "@objetosfalantes"
  },
  G: {
    id: "G",
    name: "DRESSED-CHAR+RECIPE-SPLIT-SCREEN",
    description: "50% Pixar 3D DRESSED-CHAR apresenta resultado + 50% vídeo real split-screen 3 painéis mostra preparo. Personagem com roupa profissional (nutricionista, chef, médico).",
    body: "object-head-human-body-professional",
    legs: true,
    split_screen: true,
    pipeline: ["FLUX.2 Pro", "CapCut (split-screen)", "VEED Fabric"],
    camera: "static-then-split",
    structure: "character_phase: 9s + recipe_phase: 6s = 15s total",
    best_for: ["saude-receitas", "culinaria", "beleza"],
    tone: "educational",
    flux_template: {
      character: "[INGREDIENTE] character wearing [ROUPA PROFISSIONAL: jaleco/avental], [EXPRESSÃO] expression, presenting [RESULTADO], professional authority pose, Disney/Pixar 3D render, 8K"
    },
    caption_style: "gamma-B",
    reference_account: "@objetosfalantes"
  },
  H: {
    id: "H",
    name: "VILLAIN-HERO NARRATIVE",
    description: "Vilão embedded NA superfície (parede, chão, pia) + Herói produto confronta + Batalha com destruição da colônia. 3 atos: vilão confiante (0-13s) → herói confronta (1s) → batalha+destruição (30s+). Palavra irônica final.",
    body: "villain-embedded-in-surface",
    acts: 3,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "dramatic-zoom-action",
    expression_arc: "confident → angry → terrified → ironic-resignation",
    best_for: ["casa", "saude", "natureza"],
    tone: "dramatic",
    flux_template: {
      villain: "[VILÃO: mofo/barata/aranha] character embedded IN [SUPERFÍCIE: parede/chão/pia], growing from surface texture, [EXPRESSÃO] expression, mini-colony children around, dark dramatic lighting, Disney/Pixar 3D render villain style, 8K",
      hero: "[PRODUTO LIMPEZA] animated hero character entering from right side, determined expression, spray nozzle ready, Disney/Pixar 3D render, 8K"
    },
    caption_style: "gamma-B-rodape",
    reference_account: "@objetosfalantes"
  },
  I: {
    id: "I",
    name: "DUO-SCENE",
    description: "2 personagens por cena em mesmo cenário, personalidades contrastantes (arrogante vs resignado). SEM humano ao fundo. Faces embedded na textura do alimento/produto. Variantes: gastronomia (stub arms, cenário BR) e banheiro (braços longos articulados, deterioração extrema).",
    body: "duo-contrasting-personalities",
    legs: true,
    human_background: false,
    characters_per_scene: 2,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "static-wide-duo",
    expression_arc: "contrasting duo dynamics",
    best_for: ["gastronomia", "casa", "culinaria", "fitness", "beleza"],
    tone: "funny",
    flux_template: {
      duo: "Two animated [CATEGORIA] characters side by side: LEFT: [PERSONAGEM A] with [EXPRESSÃO A]. RIGHT: [PERSONAGEM B] with [EXPRESSÃO B]. [CENÁRIO BRASILEIRO ICÔNICO], NO human characters, Disney/Pixar 3D render, 8K"
    },
    caption_style: "alpha-karaoke",
    reference_account: "@objetosfalantes",
    duo_dynamics: ["arrogante vs resignada", "saudável vs indulgente", "velho vs moderno", "ambos tristes"]
  },
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
  },
  L: {
    id: "L",
    name: "SINGLE-MULTI-SCENE-JOURNEY",
    description: "1 personagem percorre 3 ambientes domésticos diferentes demonstrando uso ou benefício do produto. Receita DIY ou tutorial de uso. Sem humano inteiro ao fundo. Props reais fotorrealísticos. Similar ao K mas em ambientes da CASA (não cozinha exclusiva) e com foco em limpeza/organização.",
    body: "full-body-product-homogeneous",
    legs: true,
    hands_detailed: true,
    gloves: false,
    color_homogeneous: true,
    human_background: false,
    props_realistic: true,
    scene_changes: "domestic-environment",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "cut-based",
    expression_arc: "sarcástico → trabalhando → orgulhoso",
    best_for: ["casa", "limpeza", "organizacao", "pets"],
    tone: "funny",
    sub_tone: "sarcástico-orgulhoso",
    scenes_per_video: "3",
    environments: ["cozinha", "banheiro", "quarto", "sala", "area-de-servico"],
    flux_template: {
      character_base: "[PRODUTO DOMÉSTICO] animated character, [FORMA DO PRODUTO] body shape, [COR DO PRODUTO] homogeneous color all over body, face embedded on product surface with expressive [COR] cartoon eyes, [COR] matching arms and hands, short legs and oval feet same color as product, no gloves no shoes, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K",
      scene_variant: "[BASE_CHAR] [EXPRESSÃO], [AÇÃO COM PROP], in realistic Brazilian [AMBIENTE DOMÉSTICO] with [DETALHES DO CÔMODO], [PRODUTO DIY ou PROP] visible, warm domestic lighting, 9:16 vertical, 8K"
    },
    caption_style: "beta-word-karaoke",
    reference_account: "@objetosfalantes",
    reference_video: "amaciante-vinagre-limpeza-33s",
    cataloged_date: "2026-04-10",
    objects_catalog: ["amaciante", "detergente", "sabao-em-po", "desinfetante", "agua-sanitaria"],
    diy_recipes: [
      { nome: "borrifador multiuso", ingredientes: ["amaciante", "vinagre", "agua"], usos: ["banheiro", "quarto", "estofado"] }
    ]
  },
  M: {
    id: "M",
    name: "FOOD-FIGHTER",
    description: "Múltiplos personagens de alimentos/produtos BR em disputa direta — cada um defende sua posição com raiva extrema e argumentos. Formato debate/batalha. Cenários brasileiros autênticos (feira, cozinha rústica, academia). Corpo do personagem é a embalagem/textura do próprio alimento.",
    body: "food-texture-embedded",
    legs: true,
    arms: "muscular-food-texture",
    human_background: "crowd-bokeh",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "tracking-follow-per-character",
    expression_arc: "desafiador → furioso → dominante",
    best_for: ["gastronomia", "fitness-nutricao", "culinaria"],
    tone: "angry",
    sub_tone: "competitivo-dramático",
    characters_per_video: "2-3",
    hook_style: "gamma-emoji-pill",
    caption_style: "gamma-emoji-pill",
    cenarios_BR: ["feira-livre", "cozinha-rustica", "academia-popular", "lanchonete-beira-de-estrada"],
    flux_template: {
      character_base: "[ALIMENTO/PRODUTO] animated character, body IS the [TEXTURA/EMBALAGEM] of the food, face embedded in texture with EXTREMELY angry expression, yellow glowing eyes or dark intense eyes, muscular [TEXTURA DO ALIMENTO] arms flexing, standing in [CENÁRIO BRASILEIRO AUTÊNTICO], ultra-detailed food texture on body, Disney/Pixar 3D render, 8K",
    },
    reference_account: "@objetosfalantes",
    reference_video: "tapioca-pastel-pacoquinha-24s",
    cataloged_date: "2026-04-10",
    duos_e_trios: [
      { tema: "saudável vs. guloso", personagens: ["tapioca", "pastel", "pacoquinha"] },
      { tema: "café da manhã", personagens: ["pão-francês", "tapioca", "fruta"] },
      { tema: "lanche", personagens: ["coxinha", "esfiha", "pastel"] }
    ]
  },
  // ─── Formats N–S (v1.9.0) ────────────────────────────────────────────────
  N: {
    id: "N", name: "APPLIANCE-HOST",
    description: "Eletrodoméstico é o personagem anfitrião que apresenta uma lista de itens. Cada item aparece como guest character dentro/ao lado do host. Host permanece durante todo o vídeo.",
    body: "appliance-full-body", host_permanent: true, guest_characters: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "static-medium-with-inserts", tone: "educational",
    best_for: ["saude-receitas", "culinaria", "saude", "fitness-nutricao"],
    caption_style: "highlight-keyword-color",
    flux_template: {
      host: "[ELETRODOMÉSTICO] animated character, [FORMA] body, transparent glass body showing [CONTEÚDO] inside, face embedded on [PARTE], full body with arms and legs, cheerful educational expression, [CENÁRIO COZINHA], Disney/Pixar 3D render, 8K",
      guest: "[ITEM DA LISTA] animated character appearing [DENTRO/AO LADO] of [HOST], friendly confident expression, 9:16 vertical, Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks",
    objects: ["liquidificador", "panela-pressao", "airfryer", "forno-micro-ondas", "chaleira"]
  },
  O: {
    id: "O", name: "INTERNAL-BODY-SCENE",
    description: "Cenário é o interior do corpo humano (intestino, estômago, veias, pulmão). Personagens Pixar 3D habitam e interagem dentro do órgão. Estética: caverna orgânica úmida com bioluminescência verde/azul.",
    body: "full-body-inside-organ", internal_scene: true, organic_environment: true, bioluminescence: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "tracking-inside-tunnel", tone: "dramatic",
    best_for: ["saude", "fitness-nutricao", "saude-mental"],
    caption_style: "alpha-bold-highlight",
    flux_template: {
      scene: "Interior of human [ÓRGÃO] as Pixar 3D environment, [TEXTURA ORGÂNICA] walls with bioluminescent [COR] glow, moist cave-like tunnel, [PERSONAGEM] character navigating through, visceral organic textures, Disney/Pixar 3D render ultra-realistic, 8K",
      character: "[ALIMENTO/REMÉDIO] animated character as hero [OU] [TOXINA/RESÍDUO] as villain, inside the [ÓRGÃO] environment, [EXPRESSÃO], Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks",
    organ_scenes: ["intestino-grosso", "intestino-delgado", "estomago", "veias-sangue", "pulmao", "cerebro"]
  },
  P: {
    id: "P", name: "TRIO-VILLAIN",
    description: "3 insetos/pragas vilões apresentados juntos em cena de 'troupe' — depois cada um é derrotado por seu truque caseiro específico. Tom: terror-cômico.",
    body: "insect-full-body-villain", villain_count: "3", group_intro: true, individual_defeat: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "wide-group-then-close-each", tone: "funny", sub_tone: "terror-comico",
    best_for: ["casa", "casa-pragas", "saude"],
    caption_style: "alpha-bold-white",
    flux_template: {
      group: "Three villain insect characters — [BARATA] wearing dirty apron, [MOSQUITO] elegant with glasses, [FORMIGA] muscular arms crossed — standing together on kitchen counter like a crime boss trio, dramatic lighting, Disney/Pixar 3D render villain style, 8K",
      defeat: "[INSETO] character [REAÇÃO DE DERROTA] hit by [TRUQUE CASEIRO], [EFEITO VISUAL], Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks",
    villain_roster: [
      { id: "barata-chefe", label: "Barata Chefe de Cozinha", accessory: "dirty-apron", expression: "arrogant" },
      { id: "mosquito-elegante", label: "Mosquito Elegante", accessory: "glasses-wings", expression: "sophisticated-villain" },
      { id: "formiga-muscular", label: "Formiga Capitã", accessory: "none", expression: "arms-crossed-confident" }
    ]
  },
  Q: {
    id: "Q", name: "MULTI-GROUP-SCENE",
    description: "Grupo de 4-8 personagens do mesmo tipo apresentados juntos em cenário temático elaborado (apotecário vintage, jardim encantado, templo). Cada personagem fala individualmente.",
    body: "various-same-category", group_size: "4-8", shared_scene: true, individual_spotlight: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "establishing-wide-then-zoom-each", tone: "educational",
    best_for: ["plantas", "espiritualidade", "saude", "saude-receitas"],
    caption_style: "highlight-keyword-color",
    flux_template: {
      group_scene: "Group of [N] animated [CATEGORIA] characters — [LISTA] — gathered in [CENÁRIO TEMÁTICO: apothecary vintage shop / enchanted garden / ancient temple], each with distinct personality and expression, warm [ILUMINAÇÃO], Disney/Pixar 3D render, 8K",
      individual: "Close-up of [PERSONAGEM] animated [OBJETO/PLANTA] character explaining [BENEFÍCIO], [EXPRESSÃO], same [CENÁRIO] background, Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks",
    scene_templates: {
      "apotecario-vintage": "Victorian apothecary shop with wooden shelves, amber bottles, botanical illustrations, stained glass window, warm candlelight",
      "jardim-encantado":   "Sunlit cottage garden with white picket fence, tomatoes and vegetables, warm golden hour light, dirt soil foreground",
      "templo-pedra":       "Ancient stone wall temple exterior, earthen ground, warm dramatic lighting, mystical atmosphere"
    }
  },
  R: {
    id: "R", name: "LIQUID-FACE-EMBEDDED",
    description: "Face do personagem está DENTRO do líquido de um recipiente transparente. O rosto emerge da superfície ou está submerso, integrado à textura do líquido. Cenário místico/ritualístico.",
    body: "face-in-liquid-no-full-body", liquid_embedded: true, container: "transparent-glass", mystical_setting: true,
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "close-to-medium-mystical", tone: "dramatic", sub_tone: "mistico-autoritario",
    best_for: ["espiritualidade", "saude", "casa"],
    caption_style: "alpha-bold-white",
    flux_template: {
      character: "[LÍQUIDO] [EXPRESSÃO] face embedded and emerging from inside a clear glass containing [LÍQUIDO] with [CRISTAIS/SAL/ERVAS], face molded from the liquid texture with amber glowing eyes, [EXPRESSÃO FURIOSA/DRAMÁTICA], antique mystic [CENÁRIO: apothecary/altar/dark kitchen], oil lamp lighting, Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks",
    liquid_types: ["agua-com-sal", "agua-com-cebola", "cha-de-ervas", "agua-florida", "mel-puro"]
  },
  S: {
    id: "S", name: "PLANT-HUMANOID",
    description: "Planta COM corpo humanoide completo — raiz = tronco/corpo, flores = cabelo/coroa, folhas = pele/roupa. Face humana feminina detalhada. Estética híbrida natureza+humano. Cenário africano/indígena ancestral.",
    body: "root-humanoid-organic", face_style: "realistic-human-feminine", hair: "flower-crown", skin: "root-bark-texture",
    pipeline: ["FLUX.2 Pro ou Veo", "MiniMax TTS", "VEED Fabric"],
    camera: "medium-portrait-cinematic", tone: "educational", sub_tone: "ancestral-mistico",
    best_for: ["plantas", "espiritualidade", "saude-natural"],
    caption_style: "alpha-word-simple",
    flux_template: {
      character: "[PLANTA] female humanoid character, body made of thick textured [ROOT/BARK] with wrinkles and organic patterns, [FLORES] crown as hair, feminine realistic face with [EXPRESSÃO], [FOLHAS/PÉTALAS] as clothing details, sitting or standing in [CENÁRIO AFRICANO/ANCESTRAL] environment with [WARRIORS/FIRE/JUNGLE] background, cinematic dramatic lighting, ultra-detailed organic textures, Disney/Pixar meets botanical illustration style, 8K"
    },
    reference_account: "@oficinassuculentas",
    plant_characters: [
      { id: "adenium-africana", label: "Adenium Africana", flowers: "pink-plumeria", bark: "thick-succulent-root" }
    ]
  },
  // ─── Formats T–W (v2.0.0) ────────────────────────────────────────────────
  T: {
    id: "T", name: "INGREDIENT-COMMANDER",
    description: "Ingrediente como comandante militar que inspeciona um problema (cabelo danificado, pele) e depois SE TRANSFORMA em líquido que penetra na superfície. Dois estados: sólido-autoritário → líquido-infiltrado.",
    body: "full-body-then-liquid-transform", two_states: true,
    state_1: "solid-military-commander", state_2: "liquid-flowing-infiltrating",
    surface_type: "hair-strand-or-skin-macro",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "medium-then-macro-surface", tone: "educational", sub_tone: "militar-didático",
    expression_arc: "autoritário-inspeção → determinado-infiltração",
    best_for: ["skincare-natural", "saude", "saude-receitas", "cabelo"],
    caption_style: "highlight-keyword-color",
    flux_template: {
      state_1: "[INGREDIENTE] animated character as military commander, [FORMA DO INGREDIENTE] body shape, green military beret with badge, camouflage tactical vest, hands on hips inspecting pose, standing in [CENÁRIO PROBLEMA: damaged hair strands / pore-filled skin], serious authoritative expression, Disney/Pixar 3D render, 8K",
      state_2: "Same [INGREDIENTE] character transforming into glowing [COR] liquid, flowing along [CABELO/PELE] surface, golden luminous trail, determined expression still visible in liquid form, macro close-up of [SUPERFÍCIE ORGÂNICA], Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks",
    objects_catalog: ["ovo-comandante", "mel-comandante", "oleo-coco-comandante", "vitamina-c-comandante"]
  },
  U: {
    id: "U", name: "INSECT-PARTY-NARRATIVE",
    description: "Narrativa de 3 atos com insetos. Ato 1: festa/bagunça em ambiente doméstico. Ato 2: chegada da tecnologia repelente (ondas/luz). Ato 3: inseto derrotado/exilado olhando de fora com expressão de perda.",
    acts: 3, arc: "celebração → confronto → derrota-exílio",
    party_props: ["birthday-hats", "food-crumbs", "juice-boxes"],
    defeat_effect: "ultrasonic-waves-blue OR toxic-fog OR UV-light",
    final_shot: "insect-watching-from-outside-window-sunset",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "wide-establishing-then-close-dramatic-then-cinematic-window",
    tone: "funny", sub_tone: "terror-comico-narrativo",
    best_for: ["casa", "casa-pragas"],
    caption_style: "alpha-bold-white",
    flux_template: {
      act1_party: "Charismatic [INSETO] commander character in tactical vest with big compound eyes, watching [COCKROACHES/MOSQUITOES/ANTS] with party hats eating and dancing on messy kitchen counter, full scene wide shot, party chaos, green kitchen cabinets background, Disney/Pixar 3D render, 8K",
      act2_defeat: "Blue ultrasonic wave rings expanding from device, [INSETOS] characters scattering in panic, motion blur, Disney/Pixar 3D render, 8K",
      act3_exile: "[INSETO] commander character hovering outside kitchen window at golden sunset, looking inside with sad/defeated expression, backlit cinematic shot, Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks"
  },
  V: {
    id: "V", name: "CLOTHING-CHARACTER",
    description: "ROUPA como personagem completo — flutua com face na frente, sem corpo humano dentro. Manga = braço, calça = perna. Cenário temático combina com tipo de roupa.",
    body: "floating-clothing-with-face", no_human_inside: true,
    face_position: "front-center-of-garment", arms: "sleeves-as-arms",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "medium-full-garment", tone: "funny", sub_tone: "vaidoso-elegante",
    expression_arc: "vaidoso → informativo → satisfeito",
    best_for: ["casa", "moda", "fitness"],
    flux_template: {
      character: "Animated [TIPO DE ROUPA] garment character, floating upright [ROUPA COMPLETA] with no human inside, face embedded on [FRENTE DA PEÇA] with [EXPRESSÃO] cartoon eyes, [MANGA] as arms gesturing, [CALÇA/INFERIOR] as legs, [COR E TECIDO] fabric texture visible, [CENÁRIO TEMÁTICO], Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks",
    garment_catalog: ["pijama-seda", "camiseta-algodao", "jaqueta-couro", "meia-esportiva", "toalha-velha"]
  },
  X: {
    id: "X", name: "CATALOGO-EDUCATIVO-SERIAL",
    description: "Catálogo educativo serial — 6-10 personagens apresentados em sequência sem arco narrativo. Cada personagem se apresenta em 1ª pessoa (~8s), conta seu benefício funcional e dá CTA educativo. Formato ideal para guias, listas e séries 'X coisas sobre Y'. Gradiente de cenário reforça transição temporal (ex: cozinha manhã → quarto noite).",
    body: "parallel-catalog-no-hierarchy", host_permanent: false, guest_carousel: true,
    characters_per_video: "6-10",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "medium-close-per-character-static", tone: "educational", sub_tone: "maternal-acolhedor",
    expression_arc: "acolhedor → educativo → sleepy-closure",
    best_for: ["chas-funcionais", "saude-receitas", "plantas", "skincare-natural"],
    narrative_framework: "Promessa+Hook → Apresentação Sequencial (cada: nome → benefício → quando usar) → Fechamento Emocional + CTA Salvamento",
    duration_range: [50, 65],
    flux_template: {
      character: "Cute animated [INGREDIENTE/PRODUTO] character with {expression}, [FORMA] body, face embedded on surface with expressive Disney eyes, small [MATERIAL]-arms, standing in [CENÁRIO TEMÁTICO BRASILEIRO], [ILUMINAÇÃO], Disney/Pixar 3D render, 9:16 vertical, 8K",
    },
    caption_style: "neon-outline",
    reference_account: "@ajuda.ai.hacks",
    series_structure: {
      segment_per_character: "6-10s: apresentação (nome + benefício + quando usar)",
      total_characters: "6-10 por episódio",
      gradient: "cenário evolui ao longo do vídeo (manhã→noite, cozinha→quarto)",
      cta: "salvamento ('salve esse vídeo')",
    },
    diff_vs_drama_novela: {
      narrative: "sem arco (paralelo) vs 5 atos com conflito",
      tone: "maternal-acolhedor vs denunciante-indignado",
      roles: "todos 'educator' em paridade vs vilão+herói+narrador",
      cta: "salvamento vs compartilhamento emocional",
    },
  },
  W: {
    id: "W", name: "OBJECT-IN-OWN-PRODUCT",
    description: "O personagem está literalmente DENTRO do produto final que ele mesmo cria. Ex: pau de canela dentro da xícara de chá de canela. Orgulhoso do próprio produto, como se estivesse em um spa.",
    body: "full-body-submerged-in-product", self_referential: true, product_is_scene: true,
    expression: "proud-satisfied-relaxed",
    pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
    camera: "medium-close-container-with-character", tone: "educational", sub_tone: "orgulhoso-relaxado",
    best_for: ["saude-receitas", "culinaria", "espiritualidade", "saude"],
    flux_template: {
      character: "Cute animated [INGREDIENTE] character with face, [FORMA DO INGREDIENTE] body, sitting or standing inside a [XÍCARA/TIGELA/COPO] filled with [PRODUTO FINAL], proud satisfied relaxed expression, warm [ILUMINAÇÃO DOURADA/RÚSTICA], [INGREDIENTES EXTRAS] around, Disney/Pixar 3D render, 8K"
    },
    reference_account: "@ajuda.ai.hacks",
    examples: [
      { ingredient: "canela-em-pau", product: "cha-de-canela", container: "xicara-vidro" },
      { ingredient: "gengibre", product: "cha-de-gengibre", container: "xicara-ceramica" },
      { ingredient: "hortelã", product: "agua-de-hortelã", container: "copo-vidro-alto" },
      { ingredient: "alho", product: "sopa-de-alho", container: "panela-rustica" },
      { ingredient: "limao", product: "agua-detox", container: "jarro-vidro" }
    ]
  },
  Y: {
    id: "Y", name: "TUTORIAL-RECEITA-MASCOT",
    description: "Tutorial técnico de receita conduzido por mascote-marca recorrente. Estrutura linear: hook reveal-first (mostra resultado) → ingredientes → preparo passo a passo → reveal final + CTA. Personagem único host em TODOS os episódios. Máximo save-ability + brand recall. Único formato com potencial de monetização via produtos físicos.",
    body: "animal-anthropomorphic-bipedal", host_permanent: true, mascot_recurring: true,
    characters_per_video: "1",
    pipeline: ["FLUX.2 Pro", "Kling 2.1 Pro", "MiniMax TTS", "Fabric/Hedra"],
    camera: "mix-dynamic-medium-closeup", tone: "educational", sub_tone: "humor-culinario-acolhedor",
    expression_arc: "animado → sério → satisfeito → orgulhoso",
    best_for: ["gastronomia", "culinaria", "receitas"],
    narrative_framework: "Hook Reveal-First → Ingrediente → Temperos → Preparo → Espera → Fritura/Reveal + CTA",
    duration_range: [45, 90],
    act_count: 6,
    flux_template: {
      character: "Anthropomorphic [ANIMAL] chef character with Disney Pixar 3D style, standing bipedal in cozy [CENÁRIO COZINHA], wearing [ROUPA DE CHEF], {expression}, [AÇÃO COM INGREDIENTE], [ILUMINAÇÃO GOLDEN HOUR], Disney/Pixar 3D render, 9:16 vertical, 8K",
    },
    caption_style: "gamma-bold-white-outline-accent",
    reference_account: "@chefmarcos",
    foley_layers: ["faca na tábua", "líquido na tigela", "óleo fritando", "vapor subindo", "ambient kitchen"],
    watermark_strategy: "double — logo do canal + marca no avental do mascote",
    monetization: {
      potential: "very_high",
      channels: ["products", "merch", "cookbook", "sponsorships", "brand_partnerships", "kids_kits"],
    },
  }
};

// ─── FORMAT REGISTRY (all 23 formats A–W + Y) ────────────────────────────────

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
  { id: "L", name: "SINGLE-MULTI-SCENE-JOURNEY",  niches: ["casa", "limpeza", "pets"],                                    tone: "funny" },
  { id: "M", name: "FOOD-FIGHTER",                 niches: ["gastronomia", "fitness-nutricao", "culinaria"],                tone: "angry" },
  { id: "N", name: "APPLIANCE-HOST",              niches: ["saude-receitas", "culinaria", "saude"],                        tone: "educational" },
  { id: "O", name: "INTERNAL-BODY-SCENE",         niches: ["saude", "fitness-nutricao"],                                   tone: "dramatic" },
  { id: "P", name: "TRIO-VILLAIN",                niches: ["casa", "casa-pragas"],                                         tone: "funny" },
  { id: "Q", name: "MULTI-GROUP-SCENE",           niches: ["plantas", "espiritualidade", "saude"],                          tone: "educational" },
  { id: "R", name: "LIQUID-FACE-EMBEDDED",        niches: ["espiritualidade", "saude", "casa"],                             tone: "dramatic" },
  { id: "S", name: "PLANT-HUMANOID",              niches: ["plantas", "espiritualidade", "saude-natural"],                  tone: "educational" },
  { id: "T", name: "INGREDIENT-COMMANDER",       niches: ["skincare-natural", "saude", "cabelo"],                          tone: "educational" },
  { id: "U", name: "INSECT-PARTY-NARRATIVE",     niches: ["casa", "casa-pragas"],                                          tone: "funny" },
  { id: "V", name: "CLOTHING-CHARACTER",          niches: ["casa", "moda", "fitness"],                                      tone: "funny" },
  { id: "W", name: "OBJECT-IN-OWN-PRODUCT",      niches: ["saude-receitas", "culinaria", "saude"],                          tone: "educational" },
  { id: "X", name: "CATALOGO-EDUCATIVO-SERIAL", niches: ["chas-funcionais", "saude-receitas", "plantas", "skincare-natural"], tone: "educational" },
  { id: "Y", name: "TUTORIAL-RECEITA-MASCOT",  niches: ["gastronomia", "culinaria", "receitas"],                                tone: "educational" },
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
  "gamma-emoji-pill": {
    id: "gamma-emoji-pill",
    description: "Pill branco no TOPO com emoji + texto maiúsculo em negrito. Posição fixa no topo durante todo o vídeo — funciona como headline permanente. Fonte bold arredondada preta. Diferente do gamma clássico que tem pill escuro.",
    font: "bold rounded",
    color: "#000000",
    background: "rgba(255,255,255,0.95)",
    border_radius: "12px",
    position: "top-center",
    padding: "12px 20px",
    duration: "full-video",
    emoji: true,
    uppercase: true,
    examples: ["🔥 TAPIOCA OU PASTEL? O RECADINHO É DIRETO! 🔥‍", "🧽 ESPONJA VELHA FALANDO A VERDADE! 🤣"]
  },
  "neon-outline": {
    id: "neon-outline",
    description: "Texto branco Montserrat Extra Bold com outline verde neon (#B3FF1A) 3px. Posição bottom-center. Usado no formato CATALOGO-EDUCATIVO-SERIAL para guias educativos com tom maternal. Cada frase acompanha a fala do personagem atual.",
    font: "Montserrat Extra Bold",
    color: "#FFFFFF",
    outline: "3px solid #B3FF1A",
    position: "center-bottom",
    pill: false,
    neon_glow: true,
    examples: ["EU SOU A CANELA", "ME BEBA QUANDO", "EU RELAXO O", "SE SENTIR ESTRESSADO", "PEGAR NO SONO"]
  },
  "highlight-keyword-color": {
    id: "highlight-keyword-color",
    description: "Texto karaokê bottom com palavra-chave destacada em COR diferente (verde neon, ciano, amarelo). Resto do texto em branco bold. Headline top em fundo semi-transparente.",
    font: "bold rounded",
    color_default: "#FFFFFF",
    color_highlight: "dynamic — verde #00FF88 / ciano #00E5FF / amarelo #FFE000",
    position: "center-bottom",
    outline: "2px black",
    headline_top: "bold black text on white semi-transparent background — full phrase visible throughout",
    examples: ["INCHADO", "ESPINAFRE", "INTESTINO", "PREGUIÇOSOS", "SANGUE"]
  },
  "gamma-bold-white-outline-accent": {
    id: "gamma-bold-white-outline-accent",
    description: "Branco bold com outline preto grosso + palavra-chave em amarelo dourado #FFD700. Uppercase. Bottom-center. Casa com paleta de comida frita (golden brown). Usado pelo formato TUTORIAL-RECEITA-MASCOT.",
    font: "sans-serif extrabold/black",
    weight: 800,
    size_px: 50,
    color: "#FFFFFF",
    outline: "3px solid #000000",
    highlight_color: "#FFD700",
    highlight_logic: "Destacar palavra-chave de AÇÃO ou DESCRITIVA central (ex: DOURADINHO, ESPETÁCULO, ESQUEÇA)",
    position: "bottom-center",
    position_offset_pct: 13,
    pill: false,
    transform: "uppercase",
    examples: ["ESQUEÇA TUDO", "PEITO DE FRANGO", "QUANDO ESTIVER DOURADINHO ASSIM", "OLHA QUE ESPETÁCULO"]
  },
  "headline-topo-bold": {
    id: "headline-topo-bold",
    description: "Frase completa em bold branco no topo, sem pill/fundo — texto diretamente sobre a imagem com outline preto. Presente durante todo o vídeo como headline fixa. Combinada com karaokê highlight-keyword-color no rodapé.",
    font: "bold sans-serif",
    color: "#FFFFFF",
    outline: "2-3px black",
    position: "top-center",
    duration: "full-video-static",
    bottom_complement: "highlight-keyword-color",
    examples: ["PARE DE ARRUINAR SEU SALMÃO! 🐟", "PARE DE GASTAR COM SKINCARE! 🍚✨", "PARE DE ARRUINAR SUAS ROUPAS! 🧺", "O que sua comida faz dentro de você... 🍔🔬"]
  },
};

// ─── PIPELINES ──────────────────────────────────────────────────────────────

export const PIPELINES = {
  "flux-fabric": {
    id: "flux-fabric",
    name: "FLUX.2 Pro + MiniMax TTS + VEED Fabric",
    description: "Pipeline padrão ViralObj. FLUX.2 Pro gera imagem, MiniMax TTS gera voz, VEED Fabric sincroniza lábios.",
    steps: ["FLUX.2 Pro → imagem 9:16", "MiniMax TTS → áudio PT-BR", "VEED Fabric → lip sync vídeo"],
    cost_range: "$2-4/reel",
    best_for: "all formats",
    default: true
  },
  "veo": {
    id: "veo",
    name: "Google Veo",
    description: "Pipeline alternativo ao FLUX.2+Fabric. Gera vídeo diretamente sem etapa separada de lip sync. Watermark 'Veo' visível no canto inferior direito (remover em pós se necessário). Qualidade de movimento superior ao Fabric para personagens orgânicos (plantas, líquidos, humanoides).",
    watermark: "Veo — bottom-right corner",
    strengths: ["organic-movement", "plant-characters", "liquid-effects", "long-duration"],
    pipeline_steps: ["Veo prompt → vídeo direto"],
    best_for_formats: ["Q", "R", "S", "O"],
    detected_in_videos: [29, 30, 33]
  }
};

// ─── SOURCE ACCOUNTS ────────────────────────────────────────────────────────

export const SOURCE_ACCOUNTS = {
  "@objetosfalantes": {
    handle: "@objetosfalantes",
    style: "talking-objects-viral-BR",
    formats_used: ["A","B","C","F","G","H","I","J","K","L","M"],
    niches: ["casa","saude-receitas","gastronomia","skincare-natural","culinaria-receitas","pets"],
    first_analyzed: "2026-04-09",
  },
  "@coisadecasa.ia": {
    handle: "@coisadecasa.ia",
    style: "casa-plantas-stub",
    formats_used: ["A"],
    niches: ["casa","plantas"],
    first_analyzed: "2026-04-09",
  },
  "@casasincerona": {
    handle: "@casasincerona",
    style: "humor-objetos-velhos",
    formats_used: ["A"],
    niches: ["casa"],
    first_analyzed: "2026-04-10",
    note: "Mesma estética de @coisadecasa.ia — provavelmente mesma equipe",
  },
  "@ajuda.ai.hacks": {
    handle: "@ajuda.ai.hacks",
    style: "saude-educativo-viral",
    formats_used: ["A","B","C","I","J","K","N","O","P","Q","R","T","U","V","W"],
    niches: ["saude","saude-receitas","fitness-nutricao","skincare-natural","casa","plantas","espiritualidade","saude-feminino","culinaria"],
    caption_pattern: "headline-topo + highlight-keyword-bottom + CTA 'Comenta: [PALAVRA]'",
    cta_comment_bait: true,
    pipeline_mix: ["FLUX.2 Pro + Fabric", "Veo"],
    watermark: "@ajuda.ai.hacks — center-middle plain text",
    logo: "pill vermelho/coral canto superior direito",
    first_analyzed: "2026-04-10",
    videos_analyzed: 19
  },
  "@dinheirofalante": {
    handle: "@dinheirofalante",
    style: "financeiro-dramatico",
    formats_used: ["A","C"],
    niches: ["financeiro"],
    first_analyzed: "2026-04-09",
    videos_analyzed: 1
  },
  "@chefmarcos": {
    handle: "@chefmarcos",
    style: "tutorial-receita-mascot-recorrente",
    formats_used: ["Y"],
    niches: ["gastronomia", "culinaria"],
    caption_pattern: "gamma-bold-white-outline-accent — branco + amarelo dourado destaque",
    pipeline_mix: ["FLUX.2 Pro + Kling 2.1 Pro + MiniMax TTS + Fabric"],
    watermark: "Dupla — logo Chef Marcos canto superior esquerdo + Chef Frangão bordado no avental",
    watermark_strategy: "double",
    recurring_character: "Chef Frangão (galo antropomórfico chef)",
    monetization_potential: "very_high",
    first_analyzed: "2026-04-20",
    videos_analyzed: 1,
    viral_score: 9.3
  },
  "@oficinassuculentas": {
    handle: "@oficinassuculentas",
    style: "plantas-ancestrais-premium",
    formats_used: ["S"],
    niches: ["plantas","espiritualidade"],
    caption_pattern: "word-karaoke simple + watermark bottom-center",
    pipeline_mix: ["FLUX.2 Pro (suspected)"],
    watermark: "@OFICINADASSUCULENTAS — bottom-center uppercase",
    first_analyzed: "2026-04-10",
    videos_analyzed: 1
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
      // —— Limpeza DIY (Tipo L) ——————————————————————————————————————————————
      { id: "amaciante", pt: "amaciante", en: "fabric softener", emoji: "💜", personality: "sarcástica, orgulhosa, sabe que é versátil", format: "L", shape: "plastic-bottle-2L-handle", color: "#B39DDB", cap_color: "#1565C0", body_type: "full-body-homogeneous", flux_base: "Cute animated fabric softener bottle character, large 2L plastic bottle body with handle, lilac/lavender purple homogeneous color all over body and limbs, face embedded on bottle front with expressive brown-amber cartoon eyes, long lilac arms with hands, short lilac legs and oval feet, blue plastic cap as hat, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K", voice: { voice_id: "Wise_Woman", emotion: "cheerful", speed: 1.05, pitch: 1 }, diy_props: ["garrafa-spray-vidro", "vinagre", "agua"] },
      // —— Objetos Velhos (Tipo A - @casasincerona) ——————————————————————————
      // —— Novos objetos casa v1.9.0 ————————————————————————————————————————
      { id: "oleo-cozinha-bottle", pt: "garrafa de óleo de cozinha", en: "cooking oil bottle", emoji: "🫗", personality: "apavorada, caindo, derramando", format: "K", pipeline_note: "Veo gerado", flux_base: "Terrified animated cooking oil bottle character, transparent golden-yellow plastic bottle body, liquid gold oil visible inside, scared wide-eyed expression, arms spread in panic falling position, pouring into white toilet bowl, clean marble bathroom background, Disney/Pixar 3D render, 8K" },
      // —— Máquina + Inseto narrativa v2.0.0 ————————————————————————————————
      { id: "maquina-lavar-robo", pt: "máquina de lavar robótica", en: "robotic washing machine", emoji: "🤖", personality: "ameaçadora, smug, high-tech", format: "V", flux_base: "Intimidating animated washing machine robot character, front-load washing machine body with green neon LED strips, menacing glowing green emoji face visible through porthole window, large robotic claw arms raised threateningly, rolling on industrial wheels, futuristic white circular room, Disney/Pixar 3D render, 8K", voice: { voice_id: "Wise_Woman", emotion: "angry", speed: 1.15, pitch: -2 } },
      { id: "moscao-comandante", pt: "moscão comandante", en: "fly commander", emoji: "🪰", personality: "carismático, confiante, líder dos insetos", format: "U", flux_base: "Charismatic animated housefly commander character, large dark blue-gray fly body, oversized orange compound eyes, small antennae, tactical beige vest with pouches, confident arms crossed, flying pose, Disney/Pixar 3D render villain-but-lovable style, 8K", voice: { voice_id: "Wise_Woman", emotion: "cheerful", speed: 1.05, pitch: 0 } },
      { id: "tabua-de-corte-obj", pt: "tábua de corte (personagem)", en: "cutting board character", emoji: "🪵", personality: "furiosa, enojada, bacteria-hater", format: "A", flux_base: "Extremely angry animated wooden cutting board character, large rectangular wood cutting board body with grain texture, furious disgusted face embedded in wood, brown grain eyebrows furrowed, lemon half and salt visible on surface, arms gripping edges, Disney/Pixar 3D render, 8K", voice: { voice_id: "Wise_Woman", emotion: "angry", speed: 1.15, pitch: -1 } },
      { id: "cueca-velha", pt: "cueca velha", en: "old underwear", emoji: "🩲", personality: "resignada, confusa, perdida", format: "A", shape: "underwear-flat-with-face", color: "#F8BBD9", flux_base: "Cute animated old pink underwear character, flat fabric body shape, face embedded in fabric with worried confused expression and big round eyes, small fabric arms spread open in confusion, short fabric legs, inside open wooden drawer with folded clothes, Disney/Pixar 3D render, ultra-realistic 3D animation, 8K", voice: { voice_id: "Calm_Woman", emotion: "sad", speed: 0.90, pitch: -1 } },
    ],
    prompts_base: "Brazilian home interior, Pixar 3D render, warm/cool lighting per room, human character in background making mistake",
    series_L: {
      name: "Receitas DIY de Limpeza",
      format: "L",
      episodes: [
        { ep: 1, object: "amaciante",      status: "catalogado",     receita: "borrifador multiuso com vinagre" },
        { ep: 2, object: "bicarbonato",    status: "pronto-produzir", receita: "pasta abrasiva com limão" },
        { ep: 3, object: "vinagre",        status: "pronto-produzir", receita: "desentupidor natural com bicarbonato" },
        { ep: 4, object: "sabao-de-coco",  status: "planejado",       receita: "spray multiuso natural" },
        { ep: 5, object: "agua-sanitaria", status: "planejado",       receita: "solução anti-mofo para box" }
      ]
    },
    series_higiene: {
      name: "Objetos que Precisam Ser Trocados",
      format: "A",
      account_ref: "@casasincerona",
      episodes: [
        { ep: 1, objects: ["cueca-velha","esponja-velha","escova-dente-velha","chinelo-velho"], status: "catalogado" },
        { ep: 2, objects: ["toalha-velha","travesseiro-velho","pano-de-prato-velho","bucha-velha"], status: "pronto-produzir" }
      ]
    },
    series_V: {
      name: "Roupas que Falam",
      format: "V",
      episodes: [
        { ep: 1, garment: "pijama-seda",     problem: "lavagem-errada",  status: "catalogado" },
        { ep: 2, garment: "jeans-preferido", problem: "desbotamento",    status: "pronto-produzir" },
        { ep: 3, garment: "toalha-velha",    problem: "odor-fungo",      status: "pronto-produzir" },
        { ep: 4, garment: "meia-esportiva",  problem: "mau-cheiro",      status: "planejado" }
      ]
    },
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
      // —— Chefs animais/alimentos (Tipo C-variant) v1.9.0 ——————————————————
      { id: "chef-frango", pt: "chef frango", en: "chef chicken", emoji: "🐔", personality: "orgulhoso, animado, cozinheiro", format: "C", body_type: "C-variant-animal", accessory: "white-chef-hat + gray-apron", flux_base: "Cheerful animated rooster/chicken character dressed as professional chef, full bird body with wings as arms, white chef hat, gray chef apron with wheat emblem, excited cooking expression, rustic warm restaurant kitchen background with hanging pots and pans, Disney/Pixar 3D render, 8K", voice: { voice_id: "Friendly_Person", emotion: "cheerful", speed: 1.10, pitch: 2 } },
      { id: "salmo-chef-auto", pt: "salmão chef (ensina a si mesmo)", en: "salmon self-chef", emoji: "🐟", personality: "furioso, didático, irônico — ensina a preparar a si mesmo", format: "C", irony_note: "salmão ensina como preparar salmão", flux_base: "Furious-but-educational animated salmon fillet character, half-round cut salmon body with orange-pink marbled texture and white fat lines, face on flat side, white apron, white gloves, pointing finger in teaching pose, dark granite kitchen counter, Disney/Pixar 3D render, 8K", voice: { voice_id: "Wise_Woman", emotion: "angry", speed: 1.20, pitch: -1 } },
      { id: "carne-moida-panela", pt: "carne moída na frigideira", en: "ground beef in pan", emoji: "🥩", personality: "apavorada, sendo pressionada por espátula humana", format: "B", hybrid_human: true, special_note: "Mão humana real interage com personagem Pixar — formato híbrido", flux_base: "Scared animated raw ground beef ball character, round meat ball body with grainy texture, terrified wide eyes, in black cast iron skillet on stove, metal spatula being pressed on top by REAL human hand (hybrid shot), Disney/Pixar 3D render integrated with real kitchen scene, 8K", voice: { voice_id: "Gentle_Woman", emotion: "fearful", speed: 1.25, pitch: 3 } },
      { id: "chef-carne", pt: "chef carne (Steak Master)", en: "chef steak", emoji: "🥩", personality: "confiante, apresentador, master", format: "C", body_type: "C-variant-food-chef", accessory: "chef-hat-labeled-STEAK-MASTER + white-gloves + white-apron", flux_base: "Confident animated beef steak character as chef, round marbled red meat body with visible fat marbling texture, face on meat surface with expressive brown eyes, white chef hat reading STEAK MASTER, white gloves, white apron, cheerful waving gesture, bright modern kitchen with green cabinets background, Disney/Pixar 3D render, 8K", voice: { voice_id: "Friendly_Person", emotion: "cheerful", speed: 1.05, pitch: 1 } },
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
      // —— Suplementos (Tipo A-MULTI grupo) v1.9.0 ——————————————————————————
      { id: "capsula-b12", pt: "cápsula B12", en: "B12 supplement", emoji: "💊", personality: "furiosa, alerta, urgente", format: "A", group_format: true, flux_base: "Extremely angry animated vitamin B12 supplement tablet character, white rectangular tablet body, face on tablet front with intense furious expression, small arms and legs, standing on wooden table beside B12 label, Disney/Pixar 3D render, 8K" },
      { id: "pulmao-personagem", pt: "pulmão (órgão-personagem)", en: "lung organ character", emoji: "🫁", personality: "exausto, danificado, em recuperação", format: "B", body_type: "organ-as-full-body", expression_arc: "exausto-danificado → recuperando → saudável", flux_base: "Tired worn-out animated lung organ character, bilobed pink lung body shape with trachea on top as neck, sad exhausted face, black smoke damage patch on one side, sitting hunched on bathroom marble counter, arms (bronchi) supporting body weight, Disney/Pixar 3D render, 8K", voice: { voice_id: "Calm_Woman", emotion: "sad", speed: 0.85, pitch: -2 } },
      { id: "arroz-karate", pt: "arroz mestre de karatê", en: "karate rice master", emoji: "🍚", personality: "furioso, mestre marcial, apontando dedo", format: "B", accessory: "black-karate-gi + white-belt + rice-hat", flux_base: "Tough animated cooked rice character as karate master, round white rice grain cluster body, face with fierce pointing expression, full black karate gi uniform, white belt, small rice hat on top, pointing finger authoritatively, white marble bathroom background with bamboo toothbrush and rice jar, Disney/Pixar 3D render, 8K", voice: { voice_id: "Wise_Woman", emotion: "angry", speed: 1.15, pitch: -1 } },
      { id: "capsula-omega3", pt: "cápsula Omega-3", en: "Omega-3 capsule", emoji: "🟡", personality: "furiosa, professora, acusadora", format: "A", group_format: true, flux_base: "Extremely angry animated Omega-3 fish oil capsule character, golden oval capsule body with Omega-3 label, intense furious expression, small muscular arms pointing accusingly, Disney/Pixar 3D render, 8K" },
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
      // —— Pets Parasitas (Tipo L-variant + H fusion) ————————————————————————
      { id: "cinto-de-couro", pt: "cinto de couro", en: "leather belt", emoji: "🐕", personality: "furioso, protetor do pet", format: "L-variant", shape: "leather-belt-vertical", color: "#5D4037", cenario_BR: "calçada-chuva-rua-brasileira", companion: "cachorro-vira-lata", flux_base: "Angry animated leather belt character, vertical brown leather belt body shape, face embedded in leather with FURIOUS expression, brown leather arms crossed, short leather legs with brown boots, standing on wet Brazilian sidewalk in the rain, stray dog companion beside it, authentic Brazilian street shops in background (açougue, padaria), Disney/Pixar 3D render, 8K", voice: { voice_id: "Wise_Woman", emotion: "angry", speed: 1.20, pitch: -1 } },
    ],
    prompts_base: "Brazilian home with pet, Pixar 3D render, loving but confused pet owner in background",
    sub_nicho_parasitas: {
      id: "pets-parasitas",
      label: "Pets — Parasitas",
      description: "Parasitas (pulgas, carrapatos, ácaros) como vilões Pixar que habitam o pelo do animal e são derrotados pelo produto antiparasitário. Fusão Tipo H (vilão) com Tipo J (macro corporal do animal).",
      format: "L-variant",
      vilao_body: "insect-muscular-dark",
      vilao_expression: "dominant → defeated → melting",
      hero: "produto-antiparasitario",
      macro_surface: "pelo-do-animal",
      liquid_defeat_effect: "colored-liquid-flood",
      tone: "angry",
      pipeline: ["FLUX.2 Pro", "MiniMax TTS", "VEED Fabric"],
      series: {
        name: "Vilões do Pelo",
        episodes: [
          { ep: 1, vilao: "pulga",      status: "catalogado",     derrota: "liquido-roxo-antiparasitario" },
          { ep: 2, vilao: "carrapato",  status: "pronto-produzir", derrota: "liquido-vermelho-acaricida" },
          { ep: 3, vilao: "acaro",      status: "planejado",       derrota: "spray-azul-antiacaro" },
          { ep: 4, vilao: "bicho-de-pe",status: "planejado",       derrota: "pomada-verde" }
        ]
      },
      flux_villain: "EXTREMELY angry muscular [PARASITA] cartoon character, dark [COR] chitin body, glowing [COR] eyes, multiple articulated legs gripping white animal fur strands, standing on macro close-up of pet skin surface with hair follicles visible, dominant threatening pose, Disney/Pixar 3D render villain style, 8K",
      flux_defeat: "Same [PARASITA] character MELTING/DISSOLVING in [COR] colored liquid flood rushing through fur strands, expression changing from rage to horror/defeat, [COR] liquid swirling around feet, Disney/Pixar 3D render, 8K"
    },
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
      // —— Chá funcional (Tipo W) v2.0.0 ————————————————————————————————————
      { id: "canela-em-pau-cha", pt: "canela em pau (no chá)", en: "cinnamon stick in tea", emoji: "☕", personality: "orgulhosa, satisfeita, relaxada dentro do próprio chá", format: "W", body_submerged: true, flux_base: "Happy proud animated cinnamon stick character, rectangular brown bark-textured body with face, sitting inside a glass cup of hot cinnamon tea, golden-amber liquid around body, proud satisfied expression, rustic warm wooden table, golden bokeh background, Disney/Pixar 3D render, 8K", voice: { voice_id: "Friendly_Person", emotion: "cheerful", speed: 1.05, pitch: 1 } },
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
    series_W: {
      name: "Guia dos Chás Funcionais",
      format: "W",
      episodes: [
        { ep: 1, ingredient: "canela-em-pau",  beneficio: "controle-glicemia",        status: "catalogado" },
        { ep: 2, ingredient: "gengibre",       beneficio: "digestao-antiinflamatorio", status: "pronto-produzir" },
        { ep: 3, ingredient: "hortelã",        beneficio: "digestao-refrescante",      status: "pronto-produzir" },
        { ep: 4, ingredient: "camomila",       beneficio: "sono-ansiedade",            status: "planejado" },
        { ep: 5, ingredient: "erva-cidreira",  beneficio: "calmante",                  status: "planejado" },
        { ep: 6, ingredient: "hibisco",        beneficio: "pressao-colesterol",        status: "planejado" },
        { ep: 7, ingredient: "cha-verde",      beneficio: "antioxidante-metabolismo",  status: "planejado" }
      ]
    },
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
      // —— Food Fighters (Tipo M) ————————————————————————————————————————————
      { id: "tapioca", pt: "tapioca", en: "tapioca", emoji: "🫓", personality: "furiosa, fitness, braços cruzados", format: "M", shape: "round-flat-disc", color: "#F5F5F0", texture: "grainy-cassava", accessory: "green-fitness-headband", cenario: "cozinha-rustica-madeira", flux_base: "Extremely angry animated tapioca character, round flat disc body shape with grainy cassava white texture, face embedded in disc with FURIOUS furrowed brows, arms crossed defiantly, green fitness headband on top, standing on rustic wooden kitchen counter, Disney/Pixar 3D render, 8K" },
      { id: "pastel", pt: "pastel de feira", en: "pastel", emoji: "🥟", personality: "ameaçador, intimidante, rei da feira", format: "M", shape: "rectangular-fried-crispy", color: "#D4870A", texture: "fried-crispy-bubbled", cenario: "feira-livre-brasileira", flux_base: "Extremely menacing animated pastel de feira character, rectangular fried pastry body with crispy bubbled golden texture all over, face embedded in pastry with intensely angry narrowed eyes, muscular fried-dough arms, standing in authentic Brazilian street fair (feira livre) with food stalls and blurred crowd in background, Disney/Pixar 3D render, 8K" },
      { id: "pacoquinha", pt: "paçoquinha", en: "peanut candy bar", emoji: "🥜", personality: "raiva extrema, musculosa, flexiona bíceps", format: "M", shape: "rectangular-package", color_primary: "#F9C707", color_secondary: "#CC1C1C", texture: "peanut-crumble-body", accessory: "white-sports-headband", cenario: "bancada-cozinha", flux_base: "Extremely enraged animated Paçoquita peanut candy character, rectangular yellow and red branded package body, face on package with EXPLOSIVE rage expression showing teeth, arms and legs made of compressed peanut crumble texture, muscular peanut arms flexing biceps, white sports headband, standing on kitchen counter, Disney/Pixar 3D render, 8K" },
    ],
    prompts_base: "Iconic Brazilian food setting — BBQ grill, padaria counter, festa junina table, gym counter, morning kitchen. NO human characters. Two food characters per scene, faces embedded directly in food texture, small stub arms. Disney/Pixar 3D render.",
    duo_rule: "ALWAYS pair contrasting personalities — saudável vs. indulgente, arrogante vs. resignado, tradicional vs. moderno",
    duo_dynamics: [
      "arrogante vs. resignada (picanha + linguiça)",
      "confiante vs. raivoso (pão de alho + espetinho)",
      "saudável furiosa vs. indulgente feliz (batata-doce + batata-frita)",
      "arrogante vs. inseguro (pudim + brigadeiro)"
    ],
    series_M: {
      name: "Batalha dos Alimentos BR",
      format: "M",
      hook_template: "🔥 [ALIMENTO A] VS [ALIMENTO B]: QUEM GANHA? ‍",
      episodes: [
        { ep: 1, tema: "saudável vs. guloso", fighters: ["tapioca","pastel","pacoquinha"], status: "catalogado" },
        { ep: 2, tema: "café da manhã",        fighters: ["pão-francês","tapioca","vitamina"], status: "pronto-produzir" },
        { ep: 3, tema: "lanche da tarde",      fighters: ["coxinha","esfiha","pastel"], status: "planejado" },
        { ep: 4, tema: "doce vs. salgado",     fighters: ["brigadeiro","coxinha"], status: "planejado" },
        { ep: 5, tema: "hidratação",           fighters: ["agua","refrigerante","suco"], status: "planejado" }
      ]
    },
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
    // ─── Sub-niche: cabelo (v2.0.0) ────────────────────────────────────────
    sub_niche_cabelo: {
      id: "cabelo",
      label: "Saúde Capilar",
      default_format: "T",
      alt_formats: ["J", "B"],
      series: {
        name: "Operação Resgate Capilar",
        format: "T",
        episodes: [
          { ep: 1, ingredient: "ovo",          problem: "pontas-duplas",  status: "catalogado" },
          { ep: 2, ingredient: "oleo-de-coco", problem: "ressecamento",   status: "pronto-produzir" },
          { ep: 3, ingredient: "abacate",      problem: "queda-capilar",  status: "planejado" },
          { ep: 4, ingredient: "mel",          problem: "cabelo-opaco",   status: "planejado" }
        ]
      },
      objects: [
        { id: "ovo-comandante", pt: "ovo comandante", en: "egg commander", emoji: "🥚", personality: "militar, autoritário, inspeciona e infiltra", format: "T", military_accessory: "green-beret + camouflage-vest", flux_base: "Tough animated egg character as military commander, oval egg-shaped body with determined face, green military beret with badge, camouflage tactical vest, muscular egg arms, inspecting damaged curly hair strands macro close-up, Disney/Pixar 3D render, 8K", flux_liquid: "Same egg character transforming into flowing golden yolk liquid, infiltrating along damaged hair strand surface, golden luminous trail along hair cuticle, Disney/Pixar 3D render, 8K", voice: { voice_id: "Wise_Woman", emotion: "angry", speed: 1.10, pitch: -1 } }
      ]
    },
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

  // ─── espiritualidade — Formats Q, R, S (v1.9.0) ──────────────────────────
  "espiritualidade": {
    name_pt: "Espiritualidade & Rituais",
    name_en: "Spirituality & Rituals",
    emoji: "🔮",
    tone_default: "dramatic",
    format_default: "Q",
    alt_formats: ["R", "S", "B"],
    sub_tone: "ancestral-mistico",
    bpm_range: [70, 90],
    music_style: "mystical ambient ethnic",
    caption_style: "alpha-bold-white",
    cta_pattern: "Comenta [PALAVRA] para receber mais",
    source_reference: "@ajuda.ai.hacks — rituais + ervas 2026-04-10",
    series: {
      name: "Ervas com Poder",
      format: "Q",
      episodes: [
        { ep: 1, tema: "7 ervas para abrir caminhos",  status: "catalogado",     objects: ["arruda","manjericao","alecrim","losna","guiné","espada-sao-jorge","sal-grosso"] },
        { ep: 2, tema: "rituais com água e sal",        status: "catalogado",     objects: ["agua-com-sal","cebola","alho"] },
        { ep: 3, tema: "plantas de proteção do lar",   status: "pronto-produzir", objects: ["espada-sao-jorge","arruda","comigo-ninguem-pode","pata-de-vaca"] },
        { ep: 4, tema: "ervas para prosperidade",      status: "planejado",       objects: ["manjericao","canela","cravo","louro","hortelã"] }
      ]
    },
    objects: [
      { id: "agua-com-sal", pt: "água com sal", en: "salt water", emoji: "🧂", personality: "furiosa, autoritária, mística", format: "R", face_style: "embedded-in-liquid", eye_color: "amber-glowing", cenario: "apotecario-mistico-vintage", flux_base: "Extremely powerful animated water character, face embedded INSIDE a clear tall glass filled with water and salt crystals, angry authoritative expression molded from the water texture, amber glowing eyes, face emerging from liquid surface, antique mystical apothecary background with oil lamp and old books, Disney/Pixar 3D render, 8K", voice: { voice_id: "Wise_Woman", emotion: "angry", speed: 1.00, pitch: -2 } },
      { id: "arruda", pt: "arruda", en: "rue herb", emoji: "🌿", personality: "confiante, poderosa, protetora", format: "Q", cenario: "jardim-encantado", flux_base: "Cute powerful animated arruda herb character, small green plant body with face embedded in leaves, confident protective expression, green glowing aura, cottage garden background, Disney/Pixar 3D render, 8K", voice: { voice_id: "Wise_Woman", emotion: "cheerful", speed: 1.00, pitch: 0 } },
    ],
    correlated_niches: ["plantas", "saude", "casa", "maternidade"],
    prompts_base: "Mystical/ritual setting — apothecary vintage, enchanted garden, stone temple. Warm candlelight or dramatic lightning. Disney/Pixar 3D render, 8K",
  },

  // ─── saude-feminino — Format B (v1.9.0) ───────────────────────────────────
  "saude-feminino": {
    name_pt: "Saúde Feminina",
    name_en: "Women's Health",
    emoji: "🩸",
    tone_default: "educational",
    format_default: "B",
    alt_formats: ["A", "J"],
    sub_tone: "empatico-urgente",
    bpm_range: [80, 100],
    music_style: "gentle piano with soft urgency",
    caption_style: "highlight-keyword-color",
    hook_style: "alerta-visual",
    source_reference: "@ajuda.ai.hacks — absorvente ciclo menstrual 2026-04-10",
    objects: [
      { id: "absorvente-ciclo", pt: "absorvente (ciclo menstrual)", en: "sanitary pad", emoji: "🩹", personality: "preocupado, empático, educativo", format: "B", expression_arc: "preocupado → explicando → empático", flux_base: "Cute animated sanitary pad character, white quilted rectangular body with face, worried concerned expression, holding color indicator showing menstrual blood color, full body with small arms and legs with blue shoes, realistic kitchen granite counter background, Disney/Pixar 3D render, 8K", voice: { voice_id: "Gentle_Woman", emotion: "fearful", speed: 0.95, pitch: 1 } },
      { id: "anticoncepcional-pilula", pt: "cartela de pílula anticoncepcional", en: "birth control pill pack", emoji: "💊", personality: "educadora, host do grupo, cheerful", format: "Q", role: "host-educator", accessory: "red-white-headphones-with-mic", companions: ["camisinha","diu","adesivo-hormonal","anel-vaginal","tabelinha"], flux_base: "Cute animated birth control pill blister pack character, rectangular silver-white blister pack body, face on front with expressive eyes, red and white headphones with microphone, small arms and legs, standing in colorful modern clinic waiting room with pop-art posters, Disney/Pixar 3D render, 8K", voice: { voice_id: "Friendly_Person", emotion: "cheerful", speed: 1.10, pitch: 2 } },
    ],
    series: {
      name: "Seu Ciclo Te Fala",
      format: "B",
      episodes: [
        { ep: 1, tema: "cores do ciclo menstrual",    status: "catalogado" },
        { ep: 2, tema: "cólica: o que o corpo diz",   status: "pronto-produzir" },
        { ep: 3, tema: "TPM — sinais e soluções",     status: "planejado" }
      ]
    },
    correlated_niches: ["saude", "maternidade"],
    prompts_base: "Empathetic health context, soft warm lighting, Pixar 3D render, educational gentle tone, 8K",
  },

  // ─── chas-funcionais — Format X (v2.1.0) ────────────────────────────────────
  "chas-funcionais": {
    name_pt: "Chás Funcionais",
    name_en: "Functional Teas",
    emoji: "🍵",
    tone_default: "educational",
    format_default: "X",
    alt_formats: ["W", "B", "Q"],
    sub_tone: "maternal-acolhedor",
    bpm_range: [65, 85],
    music_style: "gentle acoustic guitar + nature sounds, transitions piano at night scenes",
    caption_style: "neon-outline",
    hook_style: "guia-definitivo",
    source_reference: "@ajuda.ai.hacks — chás funcionais v2.1.0 — 2026-04-19",
    objects: [
      {
        id: "canela-cha", pt: "canela em pau", en: "cinnamon stick", emoji: "🪵",
        personality: "confiante, acolhedora, primeira a se apresentar",
        format: "X", role: "educator", body_type: "G-Stick-Cinnamon",
        beneficio: "controle glicêmico e metabolismo",
        timestamp: "0s–10s", cluster: "promessa-hook",
        expression_arc: "acolhedora → orgulhosa → educativa",
        flux_base: "Friendly animated cinnamon stick bundle character tied with rustic twine, warm brown bark texture body with natural grooves, big expressive Disney eyes with warm smile, small stub arms made of bark, standing on bright morning kitchen counter with ceramic cups and herb jars in background, golden sunrise light through window casting warm glow, Disney Pixar 3D render, 9:16 vertical, 8K",
        voice: { voice_id: "Calm_Woman", emotion: "warm", speed: 1.0, pitch: 0 },
      },
      {
        id: "gengibre-cha", pt: "gengibre", en: "ginger root", emoji: "🫚",
        personality: "forte, picante, determinado, anti-inflamatório",
        format: "X", role: "educator", body_type: "H-Root-Ginger",
        beneficio: "digestão e imunidade",
        timestamp: "10s–18s", cluster: "digestao-imunidade",
        expression_arc: "determinado → forte → protetor",
        flux_base: "Strong determined animated ginger root character with knobby bumpy beige-yellow skin, cross-section showing bright yellow interior, fierce expressive eyes with determined grin, small root-arm fists clenched with energy, standing on wooden cutting board next to sliced ginger pieces and steaming cup of tea, bright daylight kitchen, Disney Pixar 3D render, 9:16 vertical, 8K",
        voice: { voice_id: "Wise_Woman", emotion: "determined", speed: 1.1, pitch: -1 },
      },
      {
        id: "hortela-cha", pt: "hortelã", en: "peppermint", emoji: "🌿",
        personality: "refrescante, calma, relaxante digestivo",
        format: "X", role: "educator", body_type: "I-Leaf-Mint",
        beneficio: "relaxamento digestivo e alívio de cólicas",
        timestamp: "18s–25s", cluster: "digestao-imunidade",
        expression_arc: "calma → refrescante → aliviada",
        flux_base: "Calm relaxed animated mint leaf sprig character with bright vibrant green serrated leaves, delicate stem body, gentle half-closed eyes with peaceful smile, small leaf-arms open in welcoming relaxed pose, standing near open kitchen window with gentle breeze, fresh herb pots on windowsill, soft afternoon natural light with green ambient glow, Disney Pixar 3D render, 9:16 vertical, 8K",
        voice: { voice_id: "Friendly_Person", emotion: "calm", speed: 0.95, pitch: 1 },
      },
      {
        id: "camomila-cha", pt: "camomila", en: "chamomile", emoji: "🌼",
        personality: "maternal, suave, anti-estresse, muda cenário para quarto",
        format: "X", role: "educator", body_type: "J-Flower-Daisy",
        beneficio: "anti-estresse e relaxamento muscular",
        timestamp: "25s–30s", cluster: "relaxamento-emocional",
        scene_transition: "cozinha → quarto à noite (marca mudança de cluster)",
        expression_arc: "acolhedora → cuidadosa → maternal",
        flux_base: "Gentle maternal animated chamomile flower character with white radiating petals around golden yellow center disc face, soft caring Disney eyes with warm maternal smile, small petal-arms in comforting gesture, standing on bedside table in cozy nighttime bedroom with soft blankets and pillows, warm dim bedside lamp casting golden glow, peaceful nighttime ambiance, Disney Pixar 3D render, 9:16 vertical, 8K",
        voice: { voice_id: "Calm_Woman", emotion: "soothing", speed: 0.9, pitch: 1 },
      },
      {
        id: "hibisco-cha", pt: "hibisco", en: "hibiscus", emoji: "🌺",
        personality: "vibrante, confiante, cardiovascular",
        format: "X", role: "educator", body_type: "K-Flower-Hibiscus",
        beneficio: "circulação e saúde cardiovascular",
        timestamp: "30s–42s", cluster: "circulacao-diuretico",
        expression_arc: "vibrante → confiante → radiante",
        flux_base: "Vibrant confident animated hibiscus flower character with deep magenta ruffled layered petals, prominent yellow pistil stamen crown, expressive Disney face in center with confident radiant smile, small petal-arms spread wide presenting, standing next to vibrant red hibiscus tea in clear glass cup on kitchen counter, warm sunset light casting golden-magenta glow, tropical fruits in background, Disney Pixar 3D render, 9:16 vertical, 8K",
        voice: { voice_id: "Lively_Girl", emotion: "cheerful", speed: 1.05, pitch: 1 },
      },
      {
        id: "dente-de-leao-cha", pt: "dente-de-leão", en: "dandelion", emoji: "🌾",
        personality: "leve, brincalhão, diurético natural",
        format: "X", role: "educator", body_type: "L-Flower-Dandelion",
        beneficio: "diurético natural e saúde renal",
        timestamp: "42s–48s", cluster: "circulacao-diuretico",
        expression_arc: "brincalhão → leve → poético",
        flux_base: "Playful mischievous animated dandelion puffball character with round white wispy seed head, tiny floating seeds drifting away in breeze, thin green stem body, cheerful Disney face with playful grin, small leaf-arms waving, standing in golden hour garden with green grass, seeds backlit by warm sunset creating dreamy bokeh effect, Disney Pixar 3D render, 9:16 vertical, 8K",
        voice: { voice_id: "Friendly_Person", emotion: "playful", speed: 1.0, pitch: 2 },
      },
      {
        id: "cha-verde-cha", pt: "chá verde", en: "green tea", emoji: "🍃",
        personality: "focado, energético, antioxidante",
        format: "X", role: "educator", body_type: "I-Leaf-Teapoint",
        beneficio: "antioxidantes e metabolismo",
        timestamp: "48s–54s", cluster: "fechamento-sono",
        expression_arc: "atento → energético → focado",
        flux_base: "Alert energetic animated green tea leaf bud character, tightly curled deep emerald green leaf body with subtle vein texture, bright attentive Disney eyes with knowing confident smile, small leaf-arms in dynamic energetic pose, standing next to clear glass cup of light green steaming tea on modern desk, bright clean natural daylight from window, minimalist studio environment, Disney Pixar 3D render, 9:16 vertical, 8K",
        voice: { voice_id: "Wise_Woman", emotion: "focused", speed: 1.05, pitch: 0 },
      },
      {
        id: "lavanda-cha", pt: "lavanda", en: "lavender", emoji: "💜",
        personality: "sonolenta, pacífica, fechamento do guia, ansiedade→sono",
        format: "X", role: "educator", body_type: "K-Flower-Lavender",
        beneficio: "sono e ansiedade (fechamento emocional)",
        timestamp: "54s–62s", cluster: "fechamento-sono",
        scene_transition: "quarto escuro com lua, atmosfera noturna final",
        expression_arc: "sonolenta → pacífica → dormindo",
        flux_base: "Peaceful sleepy animated lavender flower sprig character with clustered purple buds along stem, silvery-green leaves, gentle half-closed drowsy Disney eyes with serene peaceful smile, small leaf-arms hugging soft pillow, standing in dark cozy bedroom at night with moonlight streaming through window, extinguished candles on bedside table, soft blue moonlight mixed with warm afterglow, dreamy tranquil atmosphere, Disney Pixar 3D render, 9:16 vertical, 8K",
        voice: { voice_id: "Calm_Woman", emotion: "sleepy", speed: 0.85, pitch: 2 },
      },
    ],
    clusters: [
      { id: "promessa-hook", name: "Promessa + Canela", time: "0–10s", description: "Hook 'guia definitivo' + primeiro chá" },
      { id: "digestao-imunidade", name: "Digestão & Imunidade", time: "10–25s", description: "Gengibre + Hortelã" },
      { id: "relaxamento-emocional", name: "Relaxamento Emocional", time: "25–30s", description: "Camomila (muda cenário para quarto)" },
      { id: "circulacao-diuretico", name: "Circulação & Diurético", time: "30–48s", description: "Hibisco + Dente-de-leão" },
      { id: "fechamento-sono", name: "Fechamento do Sono", time: "48–62s", description: "Chá verde + Lavanda (atmosfera noturna)" },
    ],
    gradient_cenario: "cozinha de dia → quarto à noite (reforça transição manhã→noite)",
    series_X: {
      name: "Guias Definitivos da Natureza",
      format: "X",
      episodes: [
        { ep: 1, tema: "chás funcionais (8 chás)", status: "em-producao", viral_score: 8.8 },
        { ep: 2, tema: "frutas funcionais", status: "planejado" },
        { ep: 3, tema: "temperos curativos", status: "planejado" },
        { ep: 4, tema: "grãos integrais", status: "planejado" },
        { ep: 5, tema: "vegetais crucíferos", status: "planejado" },
        { ep: 6, tema: "castanhas e sementes", status: "planejado" },
        { ep: 7, tema: "óleos essenciais", status: "planejado" },
        { ep: 8, tema: "plantas medicinais brasileiras", status: "planejado" },
        { ep: 9, tema: "probióticos naturais", status: "planejado" },
        { ep: 10, tema: "cogumelos funcionais", status: "planejado" },
      ],
      cadencia: "1 episódio a cada 10-15 dias (permite acumular salvamentos)",
    },
    hooks: [
      "ESSE É O GUIA DEFINITIVO DOS CHÁS FUNCIONAIS",
      "SALVE ESSE VÍDEO PARA CONSULTAR SEMPRE",
      "CADA CHÁ CURA UMA COISA DIFERENTE",
      "VOCÊ SABIA QUE ESSE CHÁ FUNCIONA COMO REMÉDIO?",
      "NÃO TOME CHÁ SEM SABER PRA QUE SERVE",
    ],
    cost_estimate: {
      per_episode: "$20.60",
      breakdown: {
        "8 personagens × 2 variações (FLUX.2 Pro)": "$3.20",
        "8 cenas × 6s vídeo (Kling 2.1 Pro)": "$14.40",
        "TTS PT-BR completo (MiniMax)": "$0.60",
        "Lip sync 8 cenas (Fabric/Hedra)": "$2.40",
      },
    },
    correlated_niches: ["saude", "saude-receitas", "plantas", "espiritualidade"],
    prompts_base: "Brazilian kitchen to bedroom gradient, ceramic/glass cups with hot tea, steam rising, warm golden lighting transitioning to moonlight blue, cozy home setting, Disney/Pixar 3D render, 9:16 vertical, 8K",
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

  // ─── Special case: casa-limpeza-DIY (Format L) ─────────────────────────────
  if (niche_key === "casa" && format_type === "L") {
    return `
# ViralObj Implementation — Casa Limpeza DIY (Format L)
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

### Format: L (SINGLE-MULTI-SCENE-JOURNEY) — OBRIGATÓRIO
### Série: Receitas DIY de Limpeza (5 eps)

3 ambientes por vídeo: cozinha → banheiro → quarto/sala
Personagem homogêneo (cor do produto em todo o corpo, SEM luvas, SEM tênis)
Voz: Wise_Woman | cheerful | 1.05x
Legenda: beta-word-karaoke

### Objects: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
${JSON.stringify(prompts_validated, null, 2)}
`;
  }

  // ─── Special case: gastronomia-fighter (Format M) ─────────────────────────
  if (niche_key === "gastronomia" && format_type === "M") {
    return `
# ViralObj Implementation — Gastronomia Fighter (Format M)
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

### Format: M (FOOD-FIGHTER) — OBRIGATÓRIO
### Série: Batalha dos Alimentos BR (5 eps)

Hook obrigatório: gamma-emoji-pill no topo durante todo o vídeo
2-3 personagens por vídeo, cada um em cenário BR autêntico
Corpo DO personagem é a textura do alimento — braços musculosos
Voz: Wise_Woman | angry | 1.25x
Legenda: gamma-emoji-pill

### Fighters: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
${JSON.stringify(prompts_validated, null, 2)}
`;
  }

  // ─── Special case: pets-parasitas (Format L-variant + H + J fusion) ───────
  if (niche_key === "pets-parasitas" || (niche_key === "pets" && format_type === "L-variant")) {
    return `
# ViralObj Implementation — Pets Parasitas (Format L-variant)
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

### Format: L-variant com fusão Tipo H (vilão) + Tipo J (macro pelo)
### Série: Vilões do Pelo (4 eps)

Vilão em macro dos pelos do animal
Arc: dominante → derrotado → dissolução em líquido colorido
Voz vilão: Wise_Woman | angry | 1.30x
Palavra irônica final: "ANTI [PARASITA]!"

### Characters: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
${JSON.stringify(prompts_validated, null, 2)}
`;
  }

  // ─── Special case: espiritualidade (Formats Q, R, S) ──────────────────────
  if (niche_key === "espiritualidade") {
    return `
# ViralObj Implementation — Espiritualidade (Formats Q/R/S)
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

### Format: Q (grupo) ou R (líquido) ou S (humanoide planta)
### Cenários: templo-pedra, apotecário-místico, jardim-encantado
### Séries: "Ervas com Poder", "Rituais com Água"

Voz: Wise_Woman | angry | 1.00x | -2 pitch
CTA: "Comenta [PALAVRA PODEROSA] aqui embaixo"
Pipeline: FLUX.2 Pro OU Veo (Veo recomendado para movimento orgânico)

### Objects: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
${JSON.stringify(prompts_validated, null, 2)}
`;
  }

  // ─── Special case: saude-feminino (Format B) ──────────────────────────────
  if (niche_key === "saude-feminino") {
    return `
# ViralObj Implementation — Saúde Feminina (Format B)
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

### Format: B ou A
### Tom: empático-urgente
### Série: "Seu Ciclo Te Fala"

Voz: Gentle_Woman | fearful→educational | 0.95x
Hook obrigatório: alerta visual (⚠️ ou 🩸 + texto bold)

### Objects: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
${JSON.stringify(prompts_validated, null, 2)}
`;
  }

  // ─── Special case: saude-interna (Format O) ───────────────────────────────
  if (niche_key === "saude" && format_type === "O") {
    return `
# ViralObj Implementation — Saúde Interna (Format O)
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

### Format: O (INTERNAL-BODY-SCENE)
### Cenário: interior orgânico com bioluminescência

Heróis: alimentos/remédios naturais dentro do órgão
Vilões: toxinas/resíduos/bactérias
Pipeline: Veo recomendado para movimento fluido dentro do órgão

### Objects: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
${JSON.stringify(prompts_validated, null, 2)}
`;
  }

  // ─── Special case: cabelo-capilar (Format T) ──────────────────────────────
  if (niche_key === "cabelo" || (niche_key === "skincare-natural" && format_type === "T")) {
    return `
# ViralObj Implementation — Cabelo Capilar (Format T)
## Video: ${video_file} | Account: ${account}

### Format: T (INGREDIENT-COMMANDER) — Estado 1: militar inspeção → Estado 2: liquefação infiltração
### Série: Operação Resgate Capilar (4 eps)
Voz: Wise_Woman | angry | 1.10x | -1 | Legenda: highlight-keyword-color
### Objects: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
`;
  }

  // ─── Special case: inseto-narrativa (Format U) ────────────────────────────
  if (format_type === "U") {
    return `
# ViralObj Implementation — Inseto Narrativa (Format U)
## Video: ${video_file} | Account: ${account}

### Format: U (INSECT-PARTY-NARRATIVE) — 3 atos: festa → derrota → exílio
Inseto com personalidade complexa e arco emocional. Cena final: pôr do sol, olhando de fora pela janela.
Voz: Wise_Woman | cheerful (ato1) → fearful (ato2-3) | Legenda: alpha-bold-white
### Characters: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
`;
  }

  // ─── Special case: roupa-personagem (Format V) ────────────────────────────
  if (format_type === "V") {
    return `
# ViralObj Implementation — Roupa Personagem (Format V)
## Video: ${video_file} | Account: ${account}

### Format: V (CLOTHING-CHARACTER) — Roupa flutua com face, sem humano dentro
### Série: Roupas que Falam (4 eps). Cenário combina com tipo de roupa.
Voz: Wise_Woman | angry | 1.15x
### Garments: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
`;
  }

  // ─── Special case: chá-funcional (Format W) ───────────────────────────────
  if (format_type === "W") {
    return `
# ViralObj Implementation — Chá Funcional (Format W)
## Video: ${video_file} | Account: ${account}

### Format: W (OBJECT-IN-OWN-PRODUCT) — Personagem dentro da própria xícara/bebida
### Série: Guia dos Chás Funcionais (7 eps)
Cenário: xícara/copo com chá como ambiente. Voz: Friendly_Person | cheerful | 1.05x
Legenda: highlight-keyword-color
### Ingredients: ${objects_to_add.map(o => o.pt || o.id).join(", ")}
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
