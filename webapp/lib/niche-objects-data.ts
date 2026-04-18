/**
 * Objetos e topicos sugeridos por nicho.
 * Dados usados no formulario de geracao para guiar o usuario.
 */

export interface NicheObject {
  id: string;
  name: string;
  emoji: string;
}

export interface NicheTopic {
  id: string;
  label: string;
}

export interface NicheConfig {
  objects: NicheObject[];
  topics: NicheTopic[];
}

export const NICHE_CONFIGS: Record<string, NicheConfig> = {
  casa: {
    objects: [
      { id: "agua-sanitaria", name: "Água Sanitária", emoji: "🧴" },
      { id: "lixeira", name: "Lixeira", emoji: "🗑️" },
      { id: "celular", name: "Celular", emoji: "📱" },
      { id: "esponja", name: "Esponja", emoji: "🧽" },
      { id: "prato", name: "Prato", emoji: "🍽️" },
      { id: "panela", name: "Panela", emoji: "🍳" },
      { id: "vaso", name: "Vaso Sanitário", emoji: "🚽" },
      { id: "vassoura", name: "Vassoura", emoji: "🧹" },
      { id: "detergente", name: "Detergente", emoji: "🧴" },
      { id: "pano-chao", name: "Pano de Chão", emoji: "🧹" },
    ],
    topics: [
      { id: "higiene-domestica", label: "Erros de higiene doméstica" },
      { id: "bacterias-cozinha", label: "Bactérias escondidas na cozinha" },
      { id: "limpeza-banheiro", label: "Como limpar o banheiro corretamente" },
      { id: "organizacao-casa", label: "Dicas de organização da casa" },
      { id: "erros-lavanderia", label: "Erros que destroem suas roupas" },
      { id: "mofo-umidade", label: "Mofo e umidade: como combater" },
    ],
  },
  plantas: {
    objects: [
      { id: "rosa", name: "Rosa", emoji: "🌹" },
      { id: "girassol", name: "Girassol", emoji: "🌻" },
      { id: "cacto", name: "Cacto", emoji: "🌵" },
      { id: "samambaia", name: "Samambaia", emoji: "🌿" },
      { id: "alecrim", name: "Alecrim", emoji: "🌱" },
      { id: "adenium", name: "Adenium", emoji: "🌺" },
      { id: "orquidea", name: "Orquídea", emoji: "🌸" },
      { id: "suculenta", name: "Suculenta", emoji: "🪴" },
    ],
    topics: [
      { id: "rega-correta", label: "Como regar suas plantas corretamente" },
      { id: "sol-sombra", label: "Sol ou sombra? Onde colocar cada planta" },
      { id: "pragas-plantas", label: "Pragas que atacam suas plantas" },
      { id: "adubo-caseiro", label: "Adubo caseiro que funciona" },
      { id: "plantas-apartamento", label: "Plantas ideais para apartamento" },
    ],
  },
  financeiro: {
    objects: [
      { id: "nota-50", name: "Nota de 50", emoji: "💵" },
      { id: "moeda", name: "Moeda", emoji: "🪙" },
      { id: "cartao-credito", name: "Cartão de Crédito", emoji: "💳" },
      { id: "cofrinho", name: "Cofrinho", emoji: "🐷" },
      { id: "carteira", name: "Carteira", emoji: "👛" },
      { id: "calculadora", name: "Calculadora", emoji: "🧮" },
      { id: "contrato", name: "Contrato", emoji: "📄" },
      { id: "imposto", name: "Imposto", emoji: "📋" },
    ],
    topics: [
      { id: "economia-pessoal", label: "Por que economizar é importante" },
      { id: "inflacao", label: "Inflação e planejamento financeiro" },
      { id: "debito-credito", label: "Débito vs Crédito: qual usar?" },
      { id: "investimentos", label: "Primeiros passos para investir" },
      { id: "dividas", label: "Como sair das dívidas" },
      { id: "imposto-renda", label: "Erros no Imposto de Renda" },
    ],
  },
  culinaria: {
    objects: [
      { id: "tomate", name: "Tomate", emoji: "🍅" },
      { id: "cenoura", name: "Cenoura", emoji: "🥕" },
      { id: "abacate", name: "Abacate", emoji: "🥑" },
      { id: "banana", name: "Banana", emoji: "🍌" },
      { id: "colher", name: "Colher", emoji: "🥄" },
      { id: "garrafa", name: "Garrafa", emoji: "🍶" },
      { id: "alho", name: "Alho", emoji: "🧄" },
      { id: "cebola", name: "Cebola", emoji: "🧅" },
      { id: "limao", name: "Limão", emoji: "🍋" },
      { id: "ovo", name: "Ovo", emoji: "🥚" },
    ],
    topics: [
      { id: "erros-cozinha", label: "Erros comuns na cozinha" },
      { id: "temperos", label: "Temperos que transformam pratos" },
      { id: "conservacao", label: "Como conservar alimentos corretamente" },
      { id: "receita-rapida", label: "Receitas rápidas de 15 minutos" },
      { id: "comida-brasileira", label: "Segredos da comida brasileira" },
    ],
  },
  natureza: {
    objects: [
      { id: "garrafa-pet", name: "Garrafa PET", emoji: "🍾" },
      { id: "sacola", name: "Sacola Plástica", emoji: "🛍️" },
      { id: "canudo", name: "Canudo", emoji: "🥤" },
      { id: "arvore", name: "Árvore", emoji: "🌳" },
      { id: "gota-agua", name: "Gota d'Água", emoji: "💧" },
    ],
    topics: [
      { id: "reciclagem", label: "Por que reciclar é urgente" },
      { id: "oceanos-plastico", label: "Plástico nos oceanos" },
      { id: "agua-escassa", label: "Água: recurso que está acabando" },
      { id: "desmatamento", label: "Desmatamento e suas consequências" },
      { id: "sustentabilidade", label: "Dicas de sustentabilidade no dia a dia" },
    ],
  },
  saude: {
    objects: [
      { id: "termometro", name: "Termômetro", emoji: "🌡️" },
      { id: "pilula", name: "Pílula", emoji: "💊" },
      { id: "estetoscopio", name: "Estetoscópio", emoji: "🩺" },
      { id: "balanca", name: "Balança", emoji: "⚖️" },
      { id: "seringa", name: "Seringa", emoji: "💉" },
      { id: "coracao", name: "Coração", emoji: "❤️" },
    ],
    topics: [
      { id: "automedicacao", label: "Perigos da automedicação" },
      { id: "hidratacao", label: "Importância da hidratação" },
      { id: "sono-saude", label: "Como o sono afeta sua saúde" },
      { id: "checkup", label: "Check-up: quando fazer?" },
      { id: "vitaminas", label: "Vitaminas que você está ignorando" },
    ],
  },
  pets: {
    objects: [
      { id: "racao", name: "Ração", emoji: "🦴" },
      { id: "coleira", name: "Coleira", emoji: "📿" },
      { id: "brinquedo-pet", name: "Brinquedo", emoji: "🧸" },
      { id: "cama-pet", name: "Cama Pet", emoji: "🛏️" },
      { id: "comedouro", name: "Comedouro", emoji: "🍽️" },
      { id: "escova-pet", name: "Escova", emoji: "🪮" },
    ],
    topics: [
      { id: "alimentacao-pet", label: "Erros na alimentação do pet" },
      { id: "banho-pet", label: "Frequência ideal de banho" },
      { id: "vacinas-pet", label: "Vacinas que seu pet precisa" },
      { id: "sinais-doenca", label: "Sinais de que seu pet está doente" },
      { id: "passeio", label: "Importância do passeio diário" },
    ],
  },
  fitness: {
    objects: [
      { id: "haltere", name: "Haltere", emoji: "🏋️" },
      { id: "esteira", name: "Esteira", emoji: "🏃" },
      { id: "garrafa-agua", name: "Garrafa d'Água", emoji: "💧" },
      { id: "tenis", name: "Tênis", emoji: "👟" },
      { id: "corda", name: "Corda", emoji: "🪢" },
    ],
    topics: [
      { id: "erros-academia", label: "Erros que você comete na academia" },
      { id: "alongamento", label: "Alongamento: antes ou depois?" },
      { id: "treino-casa", label: "Treino eficiente em casa" },
      { id: "proteina", label: "Proteína: quanto você precisa?" },
      { id: "descanso", label: "A importância do descanso muscular" },
    ],
  },
  maternidade: {
    objects: [
      { id: "mamadeira", name: "Mamadeira", emoji: "🍼" },
      { id: "chupeta", name: "Chupeta", emoji: "👶" },
      { id: "fralda", name: "Fralda", emoji: "🧷" },
      { id: "berco", name: "Berço", emoji: "🛏️" },
    ],
    topics: [
      { id: "amamentacao", label: "Dicas de amamentação" },
      { id: "sono-bebe", label: "Como fazer o bebê dormir" },
      { id: "introducao-alimentar", label: "Introdução alimentar correta" },
      { id: "seguranca-bebe", label: "Segurança do bebê em casa" },
    ],
  },
  "saude-mental": {
    objects: [
      { id: "travesseiro", name: "Travesseiro", emoji: "🛏️" },
      { id: "xicara", name: "Xícara de Chá", emoji: "☕" },
      { id: "vela", name: "Vela", emoji: "🕯️" },
      { id: "diario", name: "Diário", emoji: "📔" },
    ],
    topics: [
      { id: "ansiedade", label: "Como lidar com a ansiedade" },
      { id: "insonia", label: "Insônia: causas e soluções" },
      { id: "autoconhecimento", label: "Autoconhecimento no dia a dia" },
      { id: "burnout", label: "Sinais de burnout" },
      { id: "meditacao", label: "Meditação para iniciantes" },
    ],
  },
  gastronomia: {
    objects: [
      { id: "arroz", name: "Arroz", emoji: "🍚" },
      { id: "feijao", name: "Feijão", emoji: "🫘" },
      { id: "alface", name: "Alface", emoji: "🥬" },
      { id: "picanha", name: "Picanha", emoji: "🥩" },
      { id: "farofa", name: "Farofa", emoji: "🌾" },
      { id: "pao-frances", name: "Pão Francês", emoji: "🥖" },
    ],
    topics: [
      { id: "salada-fastfood", label: "Salada vs Fast Food" },
      { id: "combinacao-perfeita", label: "Combinação perfeita brasileira" },
      { id: "churrasco", label: "Segredos do churrasco perfeito" },
      { id: "cafe-manha", label: "Café da manhã que dá energia" },
      { id: "comida-afetiva", label: "Comida afetiva: sabor de infância" },
    ],
  },
};

export const TONE_OPTIONS = [
  { id: "dramatic", label: "Dramático", emoji: "🎭", description: "Intenso e impactante" },
  { id: "funny", label: "Engraçado", emoji: "😂", description: "Humor e descontração" },
  { id: "emotional", label: "Emocional", emoji: "😢", description: "Toca o coração" },
  { id: "sarcastic", label: "Sarcástico", emoji: "😏", description: "Ironia e deboche" },
  { id: "motivational", label: "Motivacional", emoji: "💪", description: "Inspira e educa" },
] as const;
