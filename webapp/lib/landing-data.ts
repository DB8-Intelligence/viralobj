/**
 * Landing page content — single source of truth.
 * Mudar preços, features, FAQ aqui reflete em toda a landing.
 */

// ─── Problem × Solution ──────────────────────────────────────────────────────

export const PROBLEM_ITEMS = [
  "4+ horas pesquisando referências",
  "R$ 200-500 pagando editor freelancer",
  "Precisa gravar voz, editar e legendar",
  "Sem garantia de viralização",
  "Difícil escalar (1-2 reels por semana)",
];

export const SOLUTION_ITEMS = [
  "30 segundos para gerar pacote completo",
  "R$ 47/mês no plano Starter",
  "IA escreve, gera visual, legenda",
  "Baseado em 47 reels que já viralizaram",
  "Produza 10+ reels por dia",
];

// ─── How it works (3 steps) ──────────────────────────────────────────────────

export const STEPS = [
  {
    number: "01",
    icon: "🎯",
    title: "Escolha seu nicho",
    body: "17 nichos prontos (casa, plantas, saúde, skincare...) com 100+ objetos catalogados com personalidade.",
  },
  {
    number: "02",
    icon: "✨",
    title: "IA gera o pacote",
    body: "Roteiro bilíngue PT+EN, prompts de imagem, vozes, legendas e hashtags otimizadas.",
  },
  {
    number: "03",
    icon: "🚀",
    title: "Publique e viralize",
    body: "Exporta pra editor de vídeo, gera o MP4 automático ou agenda publicação no Instagram.",
  },
];

// ─── Features (6 cards) ──────────────────────────────────────────────────────

export const FEATURES = [
  {
    icon: "🧩",
    title: "17 Nichos Prontos",
    body: "Casa, plantas, saúde, culinária, espiritualidade, skincare, financeiro, pets, fitness, gastronomia e mais.",
  },
  {
    icon: "🎨",
    title: "23 Formatos Visuais",
    body: "Cada formato com câmera, tom e estilo extraídos de vídeos que atingiram milhões de views.",
  },
  {
    icon: "🧠",
    title: "Multi-Provider IA",
    body: "Claude, GPT e Gemini com fallback automático. Nunca fica offline.",
  },
  {
    icon: "🌍",
    title: "Bilíngue PT + EN",
    body: "Pacote completo em português e inglês. Perfeito pra crescer audiência internacional.",
  },
  {
    icon: "🎬",
    title: "Vídeo Automático",
    body: "Pipeline de geração de vídeo MP4 com lip sync real.",
    badge: "EM BREVE",
  },
  {
    icon: "📅",
    title: "Auto-Post Instagram",
    body: "Agende reels pela Graph API. Calendário drag-and-drop. Séries inteiras agendadas em minutos.",
    badge: "EM BREVE",
  },
];

// ─── Stats (social proof) ────────────────────────────────────────────────────

export const STATS = [
  { value: "47", label: "Vídeos virais analisados" },
  { value: "23", label: "Formatos catalogados" },
  { value: "17", label: "Nichos validados" },
  { value: "100+", label: "Objetos com personalidade" },
];

// ─── Pricing plans ───────────────────────────────────────────────────────────

export interface PricingPlan {
  id: "trial" | "starter" | "pro" | "pro_plus";
  name: string;
  priceMonthly: string;
  priceYearly: string;
  sub: string;
  cta: string;
  ctaHref: string;
  features: { label: string; included: boolean }[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "trial",
    name: "Trial",
    priceMonthly: "Grátis",
    priceYearly: "Grátis",
    sub: "14 dias · Sem cartão",
    cta: "Começar agora",
    ctaHref: "/signup",
    features: [
      { label: "5 pacotes gerados", included: true },
      { label: "17 nichos completos", included: true },
      { label: "Multi-provider IA", included: true },
      { label: "Histórico ilimitado", included: true },
      { label: "Geração de vídeo", included: false },
      { label: "Auto-post Instagram", included: false },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: "R$ 47",
    priceYearly: "R$ 37",
    sub: "por mês",
    cta: "Assinar Starter",
    ctaHref: "/signup?plan=starter",
    features: [
      { label: "30 pacotes/mês", included: true },
      { label: "10 vídeos gerados/mês", included: true },
      { label: "10 posts agendados/mês", included: true },
      { label: "Tudo do Trial", included: true },
      { label: "Suporte email", included: true },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: "R$ 147",
    priceYearly: "R$ 117",
    sub: "por mês",
    cta: "Assinar Pro",
    ctaHref: "/signup?plan=pro",
    popular: true,
    features: [
      { label: "100 pacotes/mês", included: true },
      { label: "50 vídeos gerados/mês", included: true },
      { label: "50 posts agendados/mês", included: true },
      { label: "Tudo do Starter", included: true },
      { label: "Séries automatizadas", included: true },
      { label: "Prioridade no fallback", included: true },
      { label: "Suporte prioritário", included: true },
    ],
  },
  {
    id: "pro_plus",
    name: "Pro+",
    priceMonthly: "R$ 297",
    priceYearly: "R$ 237",
    sub: "por mês",
    cta: "Assinar Pro+",
    ctaHref: "/signup?plan=pro_plus",
    features: [
      { label: "300 pacotes/mês", included: true },
      { label: "150 vídeos gerados/mês", included: true },
      { label: "150 posts agendados/mês", included: true },
      { label: "Tudo do Pro", included: true },
      { label: "White-label (logo próprio)", included: true },
      { label: "Múltiplos workspaces", included: true },
      { label: "Suporte WhatsApp", included: true },
    ],
  },
];

// ─── Niches showcase ─────────────────────────────────────────────────────────

export interface NicheShowcase {
  emoji: string;
  name: string;
  tone: string;
  objects: number;
}

export const NICHES_SHOWCASE: NicheShowcase[] = [
  { emoji: "🏠", name: "Casa", tone: "angry", objects: 30 },
  { emoji: "🌱", name: "Plantas", tone: "educational", objects: 8 },
  { emoji: "💰", name: "Financeiro", tone: "dramatic", objects: 8 },
  { emoji: "🍳", name: "Culinária", tone: "educational", objects: 13 },
  { emoji: "🍃", name: "Natureza", tone: "dramatic", objects: 5 },
  { emoji: "💊", name: "Saúde", tone: "educational", objects: 12 },
  { emoji: "🐾", name: "Pets", tone: "educational", objects: 6 },
  { emoji: "💪", name: "Fitness", tone: "funny", objects: 5 },
  { emoji: "👶", name: "Maternidade", tone: "educational", objects: 4 },
  { emoji: "🧘", name: "Saúde Mental", tone: "educational", objects: 4 },
  { emoji: "🥗", name: "Saúde & Receitas", tone: "educational", objects: 10 },
  { emoji: "🍔", name: "Gastronomia", tone: "funny", objects: 15 },
  { emoji: "✨", name: "Skincare Natural", tone: "educational", objects: 7 },
  { emoji: "🔮", name: "Espiritualidade", tone: "dramatic", objects: 5 },
  { emoji: "🌸", name: "Saúde Feminina", tone: "educational", objects: 4 },
  { emoji: "🏘️", name: "Imóveis", tone: "dramatic", objects: 3 },
  { emoji: "✈️", name: "Viagem", tone: "educational", objects: 3 },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

export const FAQ_ITEMS = [
  {
    q: "Como o ViralObj funciona na prática?",
    a: "Você escolhe um nicho, lista os objetos que quer falando, o tópico e o tom. A IA gera um pacote completo com roteiro PT+EN, prompts de imagem, voz, legendas e hashtags. Você exporta pra editor de vídeo ou gera o MP4 final automático.",
  },
  {
    q: "Preciso saber mexer em edição de vídeo?",
    a: "Não. Trial e Starter entregam o pacote pronto pra importar num editor visual em 5 cliques. Plano Pro gera o vídeo MP4 final direto pela plataforma — sem editor.",
  },
  {
    q: "Os vídeos viralizam mesmo?",
    a: "Nosso sistema foi treinado em 47 reels virais reais analisados frame a frame. Extraímos 23 formatos visuais repetíveis e 17 nichos validados. Cada output segue os mesmos padrões que já funcionaram em contas com milhões de views.",
  },
  {
    q: "Qual a diferença entre os planos?",
    a: "Trial: 5 pacotes grátis por 14 dias. Starter: 30 + 10 + 10. Pro: 100 + 50 + 50. Pro+: 300 + 150 + 150. Enterprise: ilimitado com white-label.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Sem taxa, sem fidelidade. Cancele no painel e o acesso continua até o fim do período pago. Garantia incondicional de 7 dias.",
  },
  {
    q: "O conteúdo gerado é único?",
    a: "Sim. Cada geração é feita em tempo real pela IA. Você pode gerar múltiplas variações do mesmo input.",
  },
  {
    q: "Funciona em outros idiomas?",
    a: "Hoje geramos em PT-BR e EN-US bilíngue no mesmo pacote. Espanhol está no roadmap.",
  },
  {
    q: "Posso agendar posts no Instagram direto?",
    a: "No plano Pro você conecta sua conta Instagram Business via OAuth oficial e agenda reels diretamente pelo calendário integrado.",
  },
];

// ─── Tone badge colors ───────────────────────────────────────────────────────

export const TONE_BADGE: Record<string, string> = {
  angry: "bg-red-500/10 text-red-400",
  furious: "bg-red-500/15 text-red-500",
  funny: "bg-yellow-500/10 text-yellow-400",
  educational: "bg-cyan-500/10 text-cyan-400",
  dramatic: "bg-purple-500/10 text-purple-400",
};
