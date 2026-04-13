/**
 * Dados legais e da empresa — single source of truth.
 * Substitua os placeholders quando o CNPJ/endereço reais estiverem disponíveis.
 */

export const COMPANY = {
  name: "DB8 Intelligence",
  legal_name: "DB8 Intelligence Ltda", // Placeholder
  cnpj: "XX.XXX.XXX/0001-XX", // Placeholder
  address: "Brasil", // Placeholder — substituir por endereço completo
  email: {
    support: "suporte@viralobj.com",
    legal: "legal@viralobj.com",
    dpo: "dpo@viralobj.com", // Data Protection Officer (LGPD)
  },
  product: {
    name: "ViralObj",
    domain: "viralobj.com",
    url: "https://viralobj.vercel.app",
    tagline: "Objetos que viralizam sozinhos",
  },
  jurisdiction: "Comarca de [Cidade/UF]", // Placeholder — foro de resolução de disputas
  last_updated: "2026-04-13",
  effective_date: "2026-04-13",
} as const;

/**
 * Se você tiver CNPJ real, substitua os placeholders:
 * - legal_name: razão social
 * - cnpj: número CNPJ formatado
 * - address: rua, número, bairro, cidade, UF, CEP
 * - jurisdiction: comarca responsável por disputas
 */
