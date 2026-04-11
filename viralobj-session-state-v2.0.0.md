# ViralObj — Estado Completo do Projeto
## Sessão registrada: 2026-04-10
## Projeto: DB8-Intelligence / ViralObj
## Repositório: https://github.com/DB8-Intelligence/viralobj

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas
```
~/viralobj/
├── mcp/
│   ├── paths.js              → CENTRAL DE PATHS (fonte única)
│   ├── index.js              → 7 tools MCP registradas
│   └── tools/
│       ├── analyze.js        → extrai frames + Claude Vision
│       ├── download_reel.js  → 4 estratégias: SnapInsta→SSSTik→yt-dlp→Cobalt
│       ├── export.js         → HTML dashboard + SKILL.md instalável
│       ├── generate.js       → pacote bilíngue PT+EN
│       ├── generate_video.js → pipeline Fal.ai + Veo completo
│       └── niches.js         → 23 formatos + 14 nichos + 100+ objetos
├── downloads/
├── frames/
├── outputs/
├── implementations/
├── training-data/
│   └── dataset.json          → v2.0.0 — 47 vídeos analisados
└── sync.sh
```

---

## 📊 Dataset v2.0.0 — Estado Atual

```
version: 2.0.0
videos_analyzed: 47
formats_total: 23  (A → W)
source_accounts: @coisadecasa.ia, @dinheirofalante, @objetosfalantes,
                 @casasincerona, @ajuda.ai.hacks, @oficinassuculentas
pipelines: FLUX.2 Pro + Fabric, Google Veo
last_updated: 2026-04-10
```

---

## 🎬 23 Formatos Catalogados (A → W)

| Tipo | Nome | Corpo | Pipeline | Exemplo | Nicho |
|------|------|-------|----------|---------|-------|
| A | MULTI-STUB | braços curtos, múltiplos objetos | FLUX.2+Fabric | @coisadecasa.ia casa | casa, plantas |
| B | SINGLE-FULL | corpo completo + pernas | FLUX.2+Kling+Fabric | cravo tutorial | culinaria, saude |
| C | DRESSED-CHAR | objeto=cabeça, corpo humano vestido | FLUX.2+Kling+Fabric | financiamento imob | imoveis, juridico |
| D | MAP-DOC | mapa/doc com pernas + tracking | FLUX.2+Kling+Fabric | mapa Orlando | viagem |
| E | RECIPE-MAGIC | corpo completo + partículas douradas | FLUX.2+Kling+Fabric | cravo aromatizante | culinaria |
| F | SINGLE-MULTI-COSTUME | 1 personagem + trocas de roupa | FLUX.2+Kling+Fabric | canela em pau | saude-receitas |
| G | DRESSED-CHAR + SPLIT-SCREEN | 50% Pixar + 50% vídeo real | FLUX.2+CapCut+Fabric | maçã nutricionista | saude-receitas |
| H | VILLAIN-HERO NARRATIVE | vilão embedded + herói + batalha | FLUX.2+Kling+Fabric+CapCut | mofo de parede | casa |
| I | DUO-SCENE | 2 personagens por cena sem humano | FLUX.2+Kling x2+Fabric x2 | duos comida BR | gastronomia |
| J | SINGLE-TUTORIAL-BODY | 1 personagem em macro do corpo humano | FLUX.2+Fabric | óleo de coco skincare | skincare-natural |
| K | SINGLE-RECIPE-JOURNEY | 1 personagem percorre cenários da receita | FLUX.2+Fabric (ou Veo) | leite condensado | culinaria |
| L | SINGLE-MULTI-SCENE-JOURNEY | 1 personagem percorre 3 ambientes domésticos | FLUX.2+Fabric | amaciante+vinagre DIY | casa |
| M | FOOD-FIGHTER | múltiplos alimentos em batalha | FLUX.2+Fabric | tapioca vs pastel | gastronomia |
| N | APPLIANCE-HOST | eletrodoméstico anfitrião apresenta lista | FLUX.2+Fabric | liquidificador+sucos | saude-receitas |
| O | INTERNAL-BODY-SCENE | cenário = interior do corpo humano | FLUX.2+Fabric | intestino/veias | saude |
| P | TRIO-VILLAIN | 3 pragas/vilões em troupe + derrota | FLUX.2+Fabric | barata+mosquito+formiga | casa |
| Q | MULTI-GROUP-SCENE | 4-8 do mesmo tipo em cenário temático | FLUX.2+Fabric (ou Veo) | 6 plantas medicinais | plantas |
| R | LIQUID-FACE-EMBEDDED | face emergindo do interior do líquido | FLUX.2+Fabric | água com sal ritual | espiritualidade |
| S | PLANT-HUMANOID | planta com corpo humanóide orgânico | FLUX.2 ou Veo | adenium africana | plantas |
| T | INGREDIENT-COMMANDER | ingrediente militar → líquido que infiltra | FLUX.2+Fabric | ovo no cabelo | skincare/cabelo |
| U | INSECT-PARTY-NARRATIVE | insetos 3 atos: festa→derrota→exílio | FLUX.2+Fabric | moscão+festa | casa |
| V | CLOTHING-CHARACTER | roupa como personagem (sem humano dentro) | FLUX.2+Fabric | pijama de seda | casa/moda |
| W | OBJECT-IN-OWN-PRODUCT | personagem dentro do próprio produto | FLUX.2+Fabric | canela no chá | saude-receitas |

---

## 🎨 10 Estilos de Legenda

| Estilo | Descrição |
|--------|-----------|
| alpha | Bold branco outline preto, centro-baixo, ALL CAPS |
| beta | Pill branco 2 cores (normal + destaque colorido) |
| gamma | Pill escuro topo + pill branco watermark + karaokê bottom |
| gamma-B | Pill BRANCO texto PRETO topo + watermark + karaokê |
| gamma-B-rodape | Pill branco topo + watermark RODAPÉ + palavra irônica final |
| alpha-karaoke | SEM hook topo + palavra única bottom + watermark plain text |
| beta-word-karaoke | 1 palavra por beat, bold arredondada, outline preto |
| gamma-emoji-pill | Pill branco topo com emoji + texto MAIÚSCULO (permanente) |
| highlight-keyword-color | Karaokê com palavra-chave em cor neon (verde/ciano/amarelo) |
| headline-topo-bold | Frase completa bold branco no topo durante todo vídeo |

---

## 🗂️ 17 Nichos no Sistema

| Nicho | Formatos padrão | Tom | Séries ativas |
|-------|----------------|-----|--------------|
| casa | A/H/I/L/P/U/V | angry/funny | DIY Limpeza, Objetos Velhos, Roupas que Falam |
| plantas | A/B/Q/S | educational | — |
| financeiro | A | dramatic | — |
| culinaria | B/C/E/K/M/W | educational/funny | Ingredientes que Fazem Receita Sozinhos, Chefs Animais |
| natureza | B | dramatic | — |
| saude | B/N/O/Q | educational | Vilões da Saúde, Órgãos Personagens |
| pets | A/L | educational | Vilões do Pelo |
| fitness | A/M | funny | — |
| maternidade | A | educational | — |
| saude-mental | A | educational | — |
| saude-receitas | F/G/N/W | educational | Ingredientes Naturais que Curam, Guia dos Chás Funcionais |
| gastronomia | I/M | funny | Batalha dos Alimentos BR, Duos BR |
| skincare-natural | J/T | educational | Ingredientes Naturais, Operação Resgate Capilar |
| espiritualidade | Q/R/S | dramatic | Ervas com Poder, Rituais com Água |
| saude-feminino | A/B/Q | educational | Seu Ciclo Te Fala, Anticoncepcionais |
| culinaria-receitas | K | funny | Ingredientes que Fazem Receita Sozinhos |
| frutas-drama | C | dramatic | — |

---

## 📺 47 Vídeos Analisados

| # | Conta | Conteúdo | Formato | Nicho | Data |
|---|-------|----------|---------|-------|------|
| 1-5 | @coisadecasa.ia/@snapinsta/@objetosfalantes | casa/plantas/culinaria/financeiro/viagem | A/E/C/D | vários | sessão anterior |
| 6 | @objetosfalantes/@casasincerona | canela em pau | F | saude-receitas | 2026-04-09 |
| 7 | @objetosfalantes | maçã nutricionista | G | saude-receitas | 2026-04-09 |
| 8 | @objetosfalantes | mofo de parede | H | casa | 2026-04-09 |
| 9 | @objetosfalantes | duos comida brasileira (7 duos) | I | gastronomia | 2026-04-09 |
| 10 | @objetosfalantes | duos banheiro (5 duos) | I | casa | 2026-04-10 |
| 11 | @objetosfalantes | óleo de coco skincare | J ✨ | skincare-natural | 2026-04-10 |
| 12 | @objetosfalantes | leite condensado receita | K ✨ | culinaria | 2026-04-10 |
| 13 | @objetosfalantes | amaciante+vinagre borrifador DIY | L ✨ | casa | 2026-04-10 |
| 14 | @objetosfalantes | tapioca vs pastel vs paçoquinha | M ✨ | gastronomia | 2026-04-10 |
| 15 | @objetosfalantes | cinto de couro + pulga | L-variant | pets | 2026-04-10 |
| 16 | @casasincerona | cueca+esponja+escova+chinelo velhos | A | casa | 2026-04-10 |
| 17 | @ajuda.ai.hacks | liquidificador + 7 sucos | N ✨ | saude-receitas | 2026-04-10 |
| 18 | @ajuda.ai.hacks | intestino + café + caju | O ✨ | saude | 2026-04-10 |
| 19 | @ajuda.ai.hacks | absorvente ciclo menstrual | B | saude-feminino | 2026-04-10 |
| 20 | @ajuda.ai.hacks | barata+mosquito+formiga trio | P ✨ | casa | 2026-04-10 |
| 21 | @ajuda.ai.hacks | hambúrguer vilão + banana herói | I | fitness-nutricao | 2026-04-10 |
| 22 | @ajuda.ai.hacks | sabonete morango + sérum caro | I | skincare-natural | 2026-04-10 |
| 23 | @ajuda.ai.hacks | queijo processado+real+ovo+tomate | A | saude | 2026-04-10 |
| 24 | @ajuda.ai.hacks | lavanda+espada-s.jorge dormitório | A | plantas | 2026-04-10 |
| 25 | @ajuda.ai.hacks | 6 plantas medicinais apotecário | Q ✨ | plantas | 2026-04-10 |
| 26 | @ajuda.ai.hacks | água+sal+cebola+alho rituais | R ✨ | espiritualidade | 2026-04-10 |
| 27 | @ajuda.ai.hacks | chef frango molho cogumelos | C | culinaria | 2026-04-10 |
| 28 | @ajuda.ai.hacks | chef carne steak master | C | culinaria | 2026-04-10 |
| 29 | @ajuda.ai.hacks | óleo no vaso sanitário (Veo) | K | casa | 2026-04-10 |
| 30 | @ajuda.ai.hacks | máscara clara de ovo militar (Veo) | J | skincare-natural | 2026-04-10 |
| 31 | @ajuda.ai.hacks | tábua de corte + bactérias cozinha | A | casa | 2026-04-10 |
| 32 | @ajuda.ai.hacks | plantas guardiãs jardim | Q | plantas | 2026-04-10 |
| 33 | @ajuda.ai.hacks | 7 ervas abrir caminhos (Veo, 143s) | Q | espiritualidade | 2026-04-10 |
| 34 | @oficinassuculentas | planta africana humanóide feminina | S ✨ | plantas | 2026-04-10 |
| 35 | canal saúde | suplementos B12+omega3+ashwagandha | A | saude | 2026-04-10 |
| 36 | @ajuda.ai.hacks | anticoncepcionais 6 métodos clínica | Q | saude-feminino | 2026-04-11 |
| 37 | @ajuda.ai.hacks | ovo comandante resgate capilar | T ✨ | skincare-natural | 2026-04-11 |
| 38 | @ajuda.ai.hacks | festa dos insetos narrativa 3 atos | U ✨ | casa | 2026-04-11 |
| 39 | @ajuda.ai.hacks | salmão chef (ensina a si mesmo) | C | culinaria | 2026-04-11 |
| 40 | @ajuda.ai.hacks | lavanderia máquina robô + pijama seda | V ✨ | casa | 2026-04-11 |
| 41 | @ajuda.ai.hacks | arroz karatê skincare caseiro | B | skincare-natural | 2026-04-11 |
| 42 | @ajuda.ai.hacks | mel urso real vs falso | K | saude | 2026-04-11 |
| 43 | @ajuda.ai.hacks | vilões saúde gordura nas veias | O | saude | 2026-04-11 |
| 44 | @ajuda.ai.hacks | pulmão recuperando do cigarro | B | saude | 2026-04-11 |
| 45 | @ajuda.ai.hacks | carne moída na frigideira (híbrido) | B | culinaria | 2026-04-11 |
| 46 | @ajuda.ai.hacks | canela no chá guia funcional | W ✨ | saude-receitas | 2026-04-11 |

✨ = formato novo descoberto nesta sessão

---

## 📄 Prompts de Instalação Gerados (esta sessão)

| Arquivo | Versão | Commit |
|---------|--------|--------|
| viralobj-install-prompt-v1.7.0.md | v1.5→v1.7 | 0a746e1 |
| viralobj-install-prompt-v1.8.0.md | v1.7→v1.8 | b1bffc1 |
| viralobj-install-prompt-v1.9.0.md | v1.8→v1.9 | 42368d2 |
| viralobj-install-prompt-v2.0.0.md | v1.9→v2.0 | 26a5b8d |

**Todos já aplicados e commitados.**

---

## 🔧 Séries Prontas para Produzir

### Séries com episódios catalogados ✅

```
Ingredientes Naturais Que Curam (Tipo J — skincare-natural):
  Ep.1: Óleo de Coco        → catalogado
  Ep.2: Mel                 → pronto-produzir
  Ep.3: Aloe Vera           → pronto-produzir

Ingredientes que Fazem Receita Sozinhos (Tipo K — culinaria):
  Ep.1: Leite Condensado    → catalogado
  Ep.2: Nutella             → pronto-produzir

Receitas DIY de Limpeza (Tipo L — casa):
  Ep.1: Amaciante+Vinagre  → catalogado
  Ep.2: Bicarbonato+Limão  → pronto-produzir

Batalha dos Alimentos BR (Tipo M — gastronomia):
  Ep.1: Tapioca/Pastel/Paçoquinha → catalogado

Vilões do Pelo (Tipo L-variant — pets):
  Ep.1: Pulga              → catalogado
  Ep.2: Carrapato          → pronto-produzir

Ervas com Poder (Tipo Q — espiritualidade):
  Ep.1: 7 ervas abrir caminhos → catalogado
  Ep.2: Rituais água+sal   → catalogado

Seu Ciclo Te Fala (Tipo B — saude-feminino):
  Ep.1: Cores do ciclo     → catalogado

Operação Resgate Capilar (Tipo T — skincare/cabelo):
  Ep.1: Ovo               → catalogado

Guia dos Chás Funcionais (Tipo W — saude-receitas):
  Ep.1: Canela             → catalogado
  Ep.2: Gengibre           → pronto-produzir
  Ep.3: Hortelã            → pronto-produzir

Roupas que Falam (Tipo V — casa):
  Ep.1: Pijama de Seda    → catalogado
```

---

## 🛠️ Pipelines de Produção

### Pipeline Principal — FLUX.2 Pro + MiniMax TTS + VEED Fabric
```
FLUX.2 Pro ($0.05/img)    → imagem 9:16 Pixar 3D
MiniMax TTS ($0.10)       → voz PT-BR com emoção
VEED Fabric 1.0 ($0.80)  → lip sync
Total: ~$2-3 por reel com 3 personagens
```

### Pipeline Alternativo — Google Veo
```
Veo prompt ($variável)    → vídeo direto com movimento orgânico
Detectado em: vídeos #29, #30, #33
Melhor para: plantas, líquidos, humanóides orgânicos, longa duração
Watermark "Veo" visível no canto inferior direito
```

---

## ⚙️ Infraestrutura

### APIs disponíveis (Railway → api.db8intelligence.com.br)
- `ANTHROPIC_API_KEY` ✅
- `FAL_KEY` ✅ (FLUX.2 Pro)
- `INSTAGRAM_ACCESS_TOKEN` ✅
- `INSTAGRAM_ACCOUNT_ID` ✅

### Repositório
- GitHub: `DB8-Intelligence/viralobj`
- Branch ativa: `main`

---

## 📏 Regras de Ouro do Dataset v2.0

1. Cada objeto tem 1 cenário brasileiro exclusivo — nunca genérico
2. Pixar 3D render ONLY — nunca flat design (exceto Tipo V: clothing-character)
3. Tipo A: múltiplos objetos, stub arms, humano ao fundo fazendo erro
4. Tipo I: 2 personagens por cena, sem humano, rótulos legíveis
5. Tipo J: corpo humano macro = cenário, sem humano inteiro
6. Tipo K: 3 técnicas obrigatórias — ASMR close + inside angle + label reveal
7. Tipo O: interior do órgão com bioluminescência = cenário
8. Tipo T: dois estados — sólido-militar → líquido-infiltrante
9. Tipo U: 3 atos obrigatórios — festa → derrota → exílio ao pôr do sol
10. Tipo V: roupa flutua com face, SEM humano dentro
11. Tipo W: personagem dentro do próprio produto final
12. Google Veo: usar para movimento orgânico (plantas, líquidos, Tipo Q/R/S)
13. CTA padrão @ajuda.ai.hacks: "Comenta [PALAVRA]" como trigger de engajamento
14. Série = mínimo 3 episódios planejados antes de iniciar produção

---

*Documento gerado automaticamente — ViralObj · NexoOmnix · DB8 Intelligence*
*Sessão: 2026-04-10/11 | v2.0.0 | 47 vídeos | 23 formatos | 17 nichos*
