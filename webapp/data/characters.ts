/**
 * ViralObj — Landing Character Catalog
 *
 * Catálogo curado dos personagens exibidos na gallery da landing page.
 * Sincronizado com training-data/dataset.json v1.5.0.
 *
 * Niche values devem bater com niches.js:
 *   casa | plantas | financeiro | culinaria | natureza | saude |
 *   pets | fitness | maternidade | saude-mental | saude-receitas |
 *   frutas-drama | gastronomia
 */

export type NicheCssClass =
  | 'niche-cozinha'
  | 'niche-plantas'
  | 'niche-financas'
  | 'niche-fitness'
  | 'niche-pets'
  | 'niche-saude'
  | 'niche-casa';

export interface LandingCharacter {
  name: string;
  niche: string;
  nicheCls: NicheCssClass;
  img: string;
}

export const landingCharacters: LandingCharacter[] = [
  { name: 'Macarrão Explosivo',     niche: 'Culinária', nicheCls: 'niche-cozinha', img: '/landing/char-pasta.jpg' },
  { name: 'Detergente Hulk',        niche: 'Casa',      nicheCls: 'niche-casa',    img: '/landing/char-detergente-hulk.jpg' },
  { name: 'Doce de Leite Furioso',  niche: 'Culinária', nicheCls: 'niche-cozinha', img: '/landing/char-doce-leite-furioso.jpg' },
  { name: 'Chave Dourada',          niche: 'Casa',      nicheCls: 'niche-casa',    img: '/landing/char-chave.jpg' },
  { name: 'Detergente Revoltado',   niche: 'Casa',      nicheCls: 'niche-casa',    img: '/landing/char-detergente.jpg' },
  { name: 'Doce de Leite Feliz',    niche: 'Culinária', nicheCls: 'niche-cozinha', img: '/landing/char-doce-leite.jpg' },
  { name: 'Vírus Furioso',          niche: 'Saúde',     nicheCls: 'niche-saude',   img: '/landing/char-virus.jpg' },
  { name: 'Insulina Animada',       niche: 'Saúde',     nicheCls: 'niche-saude',   img: '/landing/char-insulin.jpg' },
  { name: 'Tubo Cientista',         niche: 'Saúde',     nicheCls: 'niche-saude',   img: '/landing/char-vial.jpg' },
  { name: 'Pílula Elétrica',        niche: 'Saúde',     nicheCls: 'niche-saude',   img: '/landing/char-pill.jpg' },
  { name: 'Bactéria Sorridente',    niche: 'Saúde',     nicheCls: 'niche-saude',   img: '/landing/char-bacteria.jpg' },
  { name: 'Cérebro Mecânico',       niche: 'Saúde',     nicheCls: 'niche-saude',   img: '/landing/char-brain.jpg' },
  { name: 'Plaqueta Valente',       niche: 'Saúde',     nicheCls: 'niche-saude',   img: '/landing/char-platelet.jpg' },
  { name: 'Abacate Smoothie',       niche: 'Culinária', nicheCls: 'niche-cozinha', img: '/landing/char-avocado.jpg' },
];

/** Nichos exibidos no marquee de prova social. Sincronizado com niches.js. */
export const marqueeNiches = [
  'Casa',
  'Plantas',
  'Culinária',
  'Finanças',
  'Fitness',
  'Saúde',
  'Pets',
  'Maternidade',
  'Natureza',
  'Gastronomia',
  'Saúde Mental',
  'Saúde & Receitas',
] as const;

/** Métricas exibidas na section de stats (alinhadas com dataset v1.5.0). */
export const landingMetrics = {
  creators: '500+',
  niches: 12,
  characters: '100+',
  timePerReel: '2min',
} as const;
