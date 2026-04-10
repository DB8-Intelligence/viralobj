/**
 * ViralObj — niches.js
 * 12-niche library with object lists, personalities, validated prompts
 */

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
      "TOMA EM JEJUM E VÊ O QUE ACONTECE",
      "VITAMINA QUE EMAGRECE E DÁ ENERGIA",
      "DERMATOLOGISTA REVELOU O SEGREDO DA PELE PERFEITA",
      "CARDIOLOGISTA FICOU CHOCADO COM ESSE RESULTADO"
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
};

// ─── ANALYSIS OUTPUT PROMPT TEMPLATE ────────────────────────────────────────
// Used after every video analysis to generate ViralObj implementation prompt

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

  return `
# ViralObj Implementation Prompt
## Video: ${video_file} | Account: ${account}
## Generated: ${new Date().toISOString()}

---

## 1. NICHE ACTION

${is_new_niche
  ? `### ✅ CREATE NEW NICHE: \`${niche_key}\`
Add to \`~/viralobj/mcp/tools/niches.js\` in the NICHES object:

\`\`\`javascript
"${niche_key}": {
  name_pt: "${niche_detected.name_pt}",
  name_en: "${niche_detected.name_en}",
  emoji: "${niche_detected.emoji}",
  tone_default: "${niche_detected.tone_default}",
  format_default: "${format_type}",
  source_reference: "${account} — video analyzed ${new Date().toISOString().split("T")[0]}",
  objects: ${JSON.stringify(objects_to_add, null, 4)},
  prompts_base: "${niche_detected.prompts_base}",
},
\`\`\``
  : `### ✅ ADD TO EXISTING NICHE: \`${niche_key}\`
Add these objects to \`NICHES["${niche_key}"].objects\` in \`niches.js\`:

\`\`\`javascript
${objects_to_add.map(o => JSON.stringify(o)).join(",\n")}
\`\`\``
}

---

## 2. FORMAT ACTION

${is_new_format
  ? `### ✅ REGISTER NEW FORMAT TYPE: \`${format_type}\`
Add to \`dataset.json\` → \`validated_patterns.format_types\`:

\`\`\`json
"${format_type}": {
  "name": "${niche_detected.format_name}",
  "body": "${niche_detected.format_body}",
  "pipeline": "${niche_detected.pipeline}",
  "example": "${account}",
  "best_for": ${JSON.stringify(niche_detected.best_for)},
  "new": true,
  "caption_style": "${caption_style}",
  "signature": "${niche_detected.format_signature}"
}
\`\`\``
  : `### ✅ FORMAT \`${format_type}\` ALREADY EXISTS — no action needed`
}

---

## 3. DATASET UPDATE

Add to \`dataset.json\` → \`validated_prompts\`:

\`\`\`json
${JSON.stringify(prompts_validated, null, 2)}
\`\`\`

Add hooks to \`post_formulas\`:
\`\`\`json
${JSON.stringify(hooks_detected, null, 2)}
\`\`\`

Increment \`videos_analyzed\` by 1.
Add \`"${account}"\` to \`source_accounts\` if not present.

---

## 4. QUICK TEST

After applying, test in Claude Code:
\`\`\`
Generate a talking object reel for ${niche_key}
with ${objects_to_add[0]?.pt || character}
about [TOPIC]
format: ${format_type}
duration: 30 seconds
\`\`\`

---

## 5. COMMIT MESSAGE

\`\`\`
feat(niches): add ${is_new_niche ? niche_key + " niche" : objects_to_add.length + " objects to " + niche_key}

- Source: ${account} (${new Date().toISOString().split("T")[0]})
- Format: Type ${format_type}${is_new_format ? " (NEW)" : ""}
- Objects: ${objects_to_add.map(o => o.pt).join(", ")}
- Caption style: ${caption_style}
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
    sample_objects: n.objects.slice(0, 3).map(o => lang === "en" ? o.en : o.pt),
  }));

  const text = lang === "en"
    ? `🎭 ViralObj — Available Niches (${list.length} total)\n\n` +
      list.map(n =>
        `${n.emoji} ${n.key.padEnd(14)} | ${n.name.padEnd(25)} | ${n.objects_count} objects | tone: ${n.tone_default}\n   Objects: ${n.sample_objects.join(", ")}...`
      ).join("\n\n")
    : `🎭 ViralObj — Nichos Disponíveis (${list.length} total)\n\n` +
      list.map(n =>
        `${n.emoji} ${n.key.padEnd(14)} | ${n.name.padEnd(25)} | ${n.objects_count} objetos | tom: ${n.tone_default}\n   Objetos: ${n.sample_objects.join(", ")}...`
      ).join("\n\n");

  return {
    content: [{ type: "text", text }],
    niches: list,
  };
}
