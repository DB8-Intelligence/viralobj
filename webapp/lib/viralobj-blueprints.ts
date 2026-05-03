/**
 * Blueprints de objetos falantes virais (Sprint 40).
 *
 * Inspiração: galeria de templates do Leonardo AI / RunwayML, mas focada
 * em "Talking Object" reels. Cada blueprint é um pacote pronto pra remix:
 * niche + objects + topic + tone + duration. O usuário clica "Remixar" e
 * cai em /app/generate?blueprint=<id> com tudo preenchido.
 *
 * Futuro:
 * - blueprints podem vir de generations públicas dos usuários
 * - score = views + remixes + completion_rate
 * - usuários podem optar por tornar seus reels remixáveis
 * - filtro por idioma, duração e formato vertical/horizontal
 *
 * Por enquanto a lista é estática e curada — basta o usuário ver "produto"
 * e entender o loop de criação.
 */

export type Blueprint = {
  id: string;
  title: string;
  niche: string;
  objects: string[];
  topic: string;
  tone: "dramatic" | "funny" | "emotional" | "sarcastic" | "motivational";
  duration: number;
  /** Caminho relativo a `/public/blueprints/`. Se a imagem não existir, o card faz fallback pra emoji+gradiente. */
  thumbnail?: string;
  /** Emoji decorativo do card quando não há thumbnail real. */
  emoji: string;
  /** Tags livres pra filtros futuros (categoria/intenção). */
  tags: string[];
  /** Métrica curta exibida no card pra dar prova social. */
  metric: string;
  /** 1 frase, exibida no card e no remix. */
  description: string;
};

export const VIRALOBJ_BLUEPRINTS: Blueprint[] = [
  {
    id: "sponge-bacteria",
    title: "Esponja vs Bactérias",
    niche: "casa",
    objects: ["esponja", "bactéria"],
    topic: "esponja é nojenta depois de 7 dias",
    tone: "dramatic",
    duration: 15,
    emoji: "🧽",
    tags: ["limpeza", "choque", "casa"],
    metric: "Alta retenção",
    description: "Uma esponja revoltada revela que virou um cultivo de bactérias.",
  },
  {
    id: "vinegar-multitool",
    title: "Vinagre Branco Multiuso",
    niche: "casa",
    objects: ["vinagre", "panela"],
    topic: "vinagre branco multiuso",
    tone: "dramatic",
    duration: 15,
    emoji: "🍶",
    tags: ["limpeza", "hack", "casa"],
    metric: "Salva no feed",
    description: "Vinagre branco lista os 5 usos que ninguém te contou.",
  },
  {
    id: "credit-card-debt",
    title: "Cartão de Crédito Sincero",
    niche: "financeiro",
    objects: ["cartão de crédito", "boleto"],
    topic: "dívida no rotativo cobra 400% ao ano",
    tone: "sarcastic",
    duration: 15,
    emoji: "💳",
    tags: ["finanças", "dívida", "educação"],
    metric: "Alto compartilhamento",
    description: "Um cartão de crédito debochado explica o perigo do rotativo.",
  },
  {
    id: "ir-confession",
    title: "IR Confessa Tudo",
    niche: "financeiro",
    objects: ["calculadora", "contrato"],
    topic: "como o IR consome 30% do salário",
    tone: "dramatic",
    duration: 15,
    emoji: "🧮",
    tags: ["finanças", "imposto", "alerta"],
    metric: "Alta intenção",
    description: "A calculadora explica em 15s por que sua restituição some.",
  },
  {
    id: "dog-food-warning",
    title: "Pote de Ração Alerta",
    niche: "pets",
    objects: ["ração", "comedouro"],
    topic: "comida humana que mata cachorro",
    tone: "emotional",
    duration: 15,
    emoji: "🦴",
    tags: ["pets", "alerta", "saúde animal"],
    metric: "Alta intenção",
    description: "Um pote de ração alerta donos sobre alimentos perigosos.",
  },
  {
    id: "stressed-cat",
    title: "Gato Estressado Conta Tudo",
    niche: "pets",
    objects: ["coleira", "brinquedo"],
    topic: "como saber se gato está estressado",
    tone: "emotional",
    duration: 15,
    emoji: "🐈",
    tags: ["pets", "comportamento", "gato"],
    metric: "Alto engajamento",
    description: "Um brinquedo abandonado explica os sinais de estresse felino.",
  },
  {
    id: "no-knead-bread",
    title: "Pão Sem Sova",
    niche: "culinaria",
    objects: ["pão", "forno"],
    topic: "pão sem sova de 5 ingredientes",
    tone: "funny",
    duration: 15,
    emoji: "🥖",
    tags: ["culinária", "receita", "cozinha"],
    metric: "Salva no feed",
    description: "Um pão preguiçoso ensina a receita que dispensa sova.",
  },
  {
    id: "perfect-egg",
    title: "Ovo Perfeito Reclamando",
    niche: "culinaria",
    objects: ["ovo", "frigideira"],
    topic: "ovo perfeito sem tempo de cozinhar",
    tone: "funny",
    duration: 15,
    emoji: "🥚",
    tags: ["culinária", "hack", "café"],
    metric: "Compartilhável",
    description: "Um ovo cético revela o método sem cronômetro.",
  },
  {
    id: "anti-inflammatory-foods",
    title: "Limão Sincero",
    niche: "saude",
    objects: ["limão", "estetoscópio"],
    topic: "alimentos que reduzem inflamação",
    tone: "motivational",
    duration: 15,
    emoji: "🍋",
    tags: ["saúde", "alimentação", "bem-estar"],
    metric: "Alta retenção",
    description: "Um limão lista os 3 alimentos anti-inflamatórios do dia a dia.",
  },
  {
    id: "creatine-cycle",
    title: "Haltere Sobre Creatina",
    niche: "fitness",
    objects: ["haltere", "garrafa d'água"],
    topic: "creatina: precisa fazer ciclo",
    tone: "motivational",
    duration: 15,
    emoji: "🏋️",
    tags: ["fitness", "suplementação", "academia"],
    metric: "Engajamento",
    description: "Um haltere desfaz o mito do ciclo de creatina em 15s.",
  },
];

const BY_ID: Record<string, Blueprint> = Object.fromEntries(
  VIRALOBJ_BLUEPRINTS.map((b) => [b.id, b]),
);

export function getBlueprintById(id: string): Blueprint | undefined {
  return BY_ID[id];
}

/** Conjunto único de nichos cobertos pela lista — usado no filtro da galeria. */
export function listBlueprintNiches(): string[] {
  return Array.from(new Set(VIRALOBJ_BLUEPRINTS.map((b) => b.niche))).sort();
}
