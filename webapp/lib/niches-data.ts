/**
 * Niches + Formats data — mirrored from mcp/tools/niches.js
 * Kept as a standalone module so the Cloud Run dashboard build doesn't
 * need to import from outside the webapp/ directory.
 */

export interface NicheSummary {
  id: string;
  label: string;
  default_format: string;
  tone: string;
  objects_count: number;
  description: string;
}

export interface FormatSummary {
  id: string;
  name: string;
  tone: string;
  best_for: string[];
}

export const NICHES: NicheSummary[] = [
  { id: "casa", label: "Casa & Limpeza", default_format: "A", tone: "angry", objects_count: 30, description: "Objetos domésticos com stub arms + humano ao fundo cometendo erros de higiene/limpeza" },
  { id: "plantas", label: "Plantas", default_format: "A", tone: "educational", objects_count: 8, description: "Plantas e flores com personalidade, educativas e ancestrais" },
  { id: "financeiro", label: "Financeiro", default_format: "A", tone: "dramatic", objects_count: 8, description: "Documentos, contratos e dinheiro dramatizando impostos e fluxo de caixa" },
  { id: "culinaria", label: "Culinária", default_format: "C", tone: "educational", objects_count: 13, description: "Ingredientes e alimentos ensinando técnicas — inclui chefs animais (frango, salmão)" },
  { id: "natureza", label: "Natureza", default_format: "B", tone: "dramatic", objects_count: 5, description: "Elementos naturais com voz e corpo" },
  { id: "saude", label: "Saúde", default_format: "B", tone: "educational", objects_count: 12, description: "Órgãos, cápsulas e alimentos-remédio. Cenários internos do corpo (Formato O)" },
  { id: "pets", label: "Pets", default_format: "A", tone: "educational", objects_count: 6, description: "Cuidados com animais, incluindo sub-nicho pets-parasitas" },
  { id: "fitness", label: "Fitness", default_format: "A", tone: "funny", objects_count: 5, description: "Alimentos e equipamentos em contexto esportivo" },
  { id: "maternidade", label: "Maternidade", default_format: "A", tone: "educational", objects_count: 4, description: "Cuidado materno e infantil" },
  { id: "saude-mental", label: "Saúde Mental", default_format: "A", tone: "educational", objects_count: 4, description: "Ansiedade, sono, autoconhecimento" },
  { id: "saude-receitas", label: "Saúde & Receitas", default_format: "F", tone: "educational", objects_count: 10, description: "Ingredientes que curam — tutoriais com mudanças de figurino" },
  { id: "gastronomia", label: "Gastronomia", default_format: "I", tone: "funny", objects_count: 15, description: "Duos contrastantes de comidas BR — batalhas e debates" },
  { id: "skincare-natural", label: "Skincare Natural", default_format: "J", tone: "educational", objects_count: 7, description: "Ingredientes naturais em macrofotografia hiper-realista do corpo" },
  { id: "espiritualidade", label: "Espiritualidade & Rituais", default_format: "Q", tone: "dramatic", objects_count: 5, description: "Ervas, cristais, rituais. Tom autoritário-místico ancestral" },
  { id: "saude-feminino", label: "Saúde Feminina", default_format: "B", tone: "educational", objects_count: 4, description: "Ciclo menstrual, cuidados íntimos. Tom empático-urgente" },
  { id: "imoveis", label: "Imóveis", default_format: "C", tone: "dramatic", objects_count: 3, description: "Contratos, plantas baixas, documentos" },
  { id: "viagem", label: "Viagem", default_format: "D", tone: "educational", objects_count: 3, description: "Mapas e documentos que caminham com camera tracking" },
  { id: "chas-funcionais", label: "Chás Funcionais", default_format: "X", tone: "educational", objects_count: 8, description: "8 chás funcionais em formato catálogo-educativo: cada chá se apresenta com benefício e quando usar" },
];

export const FORMATS: FormatSummary[] = [
  { id: "A", name: "MULTI-STUB", tone: "angry", best_for: ["casa", "plantas", "financeiro"] },
  { id: "B", name: "SINGLE-FULL", tone: "educational", best_for: ["culinaria", "natureza", "saude"] },
  { id: "C", name: "DRESSED-CHAR", tone: "dramatic", best_for: ["imoveis", "juridico", "culinaria"] },
  { id: "D", name: "MAP-DOC", tone: "educational", best_for: ["viagem", "imoveis"] },
  { id: "E", name: "RECIPE-MAGIC", tone: "educational", best_for: ["culinaria", "casa", "saude"] },
  { id: "F", name: "SINGLE-MULTI-COSTUME", tone: "educational", best_for: ["saude-receitas", "culinaria"] },
  { id: "G", name: "DRESSED-CHAR+RECIPE-SPLIT-SCREEN", tone: "educational", best_for: ["saude-receitas"] },
  { id: "H", name: "VILLAIN-HERO NARRATIVE", tone: "dramatic", best_for: ["casa", "saude", "natureza"] },
  { id: "I", name: "DUO-SCENE", tone: "funny", best_for: ["gastronomia", "casa", "culinaria"] },
  { id: "J", name: "SINGLE-TUTORIAL-BODY", tone: "educational", best_for: ["skincare-natural", "saude-receitas"] },
  { id: "K", name: "SINGLE-RECIPE-JOURNEY", tone: "funny", best_for: ["culinaria", "gastronomia", "casa"] },
  { id: "L", name: "SINGLE-MULTI-SCENE-JOURNEY", tone: "funny", best_for: ["casa", "limpeza", "pets"] },
  { id: "M", name: "FOOD-FIGHTER", tone: "angry", best_for: ["gastronomia", "fitness-nutricao"] },
  { id: "N", name: "APPLIANCE-HOST", tone: "educational", best_for: ["saude-receitas", "culinaria"] },
  { id: "O", name: "INTERNAL-BODY-SCENE", tone: "dramatic", best_for: ["saude", "fitness-nutricao"] },
  { id: "P", name: "TRIO-VILLAIN", tone: "funny", best_for: ["casa", "casa-pragas"] },
  { id: "Q", name: "MULTI-GROUP-SCENE", tone: "educational", best_for: ["plantas", "espiritualidade"] },
  { id: "R", name: "LIQUID-FACE-EMBEDDED", tone: "dramatic", best_for: ["espiritualidade", "saude"] },
  { id: "S", name: "PLANT-HUMANOID", tone: "educational", best_for: ["plantas", "espiritualidade"] },
  { id: "T", name: "INGREDIENT-COMMANDER", tone: "educational", best_for: ["skincare-natural", "cabelo"] },
  { id: "U", name: "INSECT-PARTY-NARRATIVE", tone: "funny", best_for: ["casa", "casa-pragas"] },
  { id: "V", name: "CLOTHING-CHARACTER", tone: "funny", best_for: ["casa", "moda", "fitness"] },
  { id: "W", name: "OBJECT-IN-OWN-PRODUCT", tone: "educational", best_for: ["saude-receitas", "culinaria"] },
  { id: "X", name: "CATALOGO-EDUCATIVO-SERIAL", tone: "educational", best_for: ["chas-funcionais", "saude-receitas", "plantas", "skincare-natural"] },
  { id: "Y", name: "TUTORIAL-RECEITA-MASCOT", tone: "educational", best_for: ["gastronomia", "culinaria", "receitas"] },
];

export const TONE_COLORS: Record<string, string> = {
  angry: "text-red-400 bg-red-500/10",
  furious: "text-red-500 bg-red-500/15",
  funny: "text-yellow-400 bg-yellow-500/10",
  educational: "text-cyan-400 bg-cyan-500/10",
  dramatic: "text-purple-400 bg-purple-500/10",
  alarmed: "text-orange-400 bg-orange-500/10",
  sarcastic: "text-pink-400 bg-pink-500/10",
};
