# ViralObj — Master Prompt para Geração de Landing Page

**Uso:** Cole este documento inteiro em Figma AI, Miro AI, WeWeb, ou qualquer ferramenta de design. Auto-contido com todo o conteúdo, estrutura, design tokens e prompts de imagem.

**Idioma da landing:** Português BR (público-alvo brasileiro)
**Estilo:** Dark neon SaaS moderno (inspirações: Linear, Vercel, Cursor, Arc)

---

## 🎯 PAPEL (para a IA do design tool)

Você é um **Senior Product Designer + Landing Page Conversion Specialist** especializado em SaaS B2C brasileiros. Sua tarefa é criar uma landing page de alta conversão para o produto **ViralObj**, seguindo EXATAMENTE a estrutura, conteúdo, hierarquia visual e design tokens definidos abaixo.

Saída esperada:
- **Figma:** arquivo completo com 1 frame desktop (1440×4800) + 1 frame mobile (375×5200) + design system linkado
- **Miro:** board com wireframe low-fi usando sticky notes e shapes
- **WeWeb:** projeto com páginas estruturadas em componentes reutilizáveis + coleções para os dados de pricing

---

## 📦 O PRODUTO EM 1 PARÁGRAFO

ViralObj é um gerador SaaS de reels virais para Instagram que usa IA para criar **objetos 3D animados estilo Pixar/Disney que falam em primeira pessoa**. O usuário escolhe nicho + objetos + tópico, e a IA gera roteiro bilíngue PT+EN, prompts visuais, legendas, hashtags e voz. Diferencial: dataset proprietário com 47 vídeos virais reais analisados, 23 formatos visuais repetíveis e 17 nichos prontos.

**Target:** Criadores de conteúdo brasileiros (casa, saúde, plantas, culinária, espiritualidade, skincare natural) que querem produzir reels profissionais sem contratar designer/editor.

**Promessa central:** "De ideia a reel pronto em 30 segundos, com roteiro viral validado."

---

## 🎨 DESIGN SYSTEM

### Paleta de Cores

```
Background:
  bg-primary:     #0A0A0F   (deep near-black)
  bg-card:        #14141F   (elevated surface, 90% opacity)
  bg-elevated:    #1C1C2B   (dropdowns, tooltips)

Accents:
  accent-primary:   #FF3366  (pink — CTAs principais)
  accent-secondary: #00E5FF  (cyan — highlights, badges)
  accent-gradient:  linear-gradient(135deg, #FF3366 0%, #B000FF 50%, #00E5FF 100%)

Text:
  text-primary:   #F5F5F7   (headlines, body)
  text-secondary: #A8A8B8   (subheadings)
  text-muted:     #6A6A7D   (captions, labels)

Borders:
  border-subtle:  #2A2A3A
  border-glow:    rgba(255, 51, 102, 0.3)

Status:
  success: #00E676
  warning: #FFB800
  error:   #FF4757
```

### Typography

```
Font family:  Inter (Google Fonts) — fallback: system-ui, -apple-system, sans-serif
Alt display:  Instrument Serif (apenas para eyebrow texts e quotes)

Scale (desktop):
  display-xl:   72px / 1.05 / -0.03em / weight 800   (hero headline)
  display-lg:   56px / 1.1  / -0.02em / weight 700
  display-md:   40px / 1.15 / -0.02em / weight 700
  display-sm:   32px / 1.2  / -0.01em / weight 700
  heading:      24px / 1.3  / -0.01em / weight 600
  subheading:   18px / 1.5  /  0      / weight 500
  body-lg:      18px / 1.6  /  0      / weight 400
  body:         16px / 1.6  /  0      / weight 400
  small:        14px / 1.5  /  0      / weight 400
  caption:      12px / 1.4  /  0.02em / weight 500 / uppercase

Scale (mobile): multiplicar por 0.7 para display-xl/lg, demais por 0.85
```

### Spacing & Layout

```
Container max-width:  1200px
Section padding-y:    120px desktop / 80px mobile
Section gap:          96px desktop / 64px mobile
Card padding:         32px
Border radius:        small 8px / medium 12px / large 20px / pill 999px
```

### Visual Effects

```
Glassmorphism:
  background: rgba(20, 20, 31, 0.7)
  backdrop-filter: blur(16px)
  border: 1px solid rgba(255, 255, 255, 0.08)

Background ambient:
  radial-gradient(circle at 20% 10%, rgba(255, 51, 102, 0.08) 0%, transparent 40%),
  radial-gradient(circle at 80% 60%, rgba(0, 229, 255, 0.06) 0%, transparent 50%)

Glow on CTA hover:
  box-shadow: 0 0 40px rgba(255, 51, 102, 0.4)

Card hover:
  transform: translateY(-4px)
  border-color: rgba(255, 51, 102, 0.4)
```

---

## 📐 ESTRUTURA DA PÁGINA (11 seções)

### Section 1 — Navbar (sticky, altura 72px)

```
Layout: horizontal, space-between, backdrop-blur

Left:
  - Logo: círculo rosa (#FF3366) + texto "ViralObj" (weight 700, 20px)

Center (desktop apenas):
  - Link "Nichos" → #niches
  - Link "Como funciona" → #how-it-works
  - Link "Preços" → #pricing
  - Link "FAQ" → #faq

Right:
  - Link "Entrar" (text-secondary, hover text-primary)
  - Botão "Criar conta grátis" (accent-primary, pill radius, 10px 20px)

Mobile:
  - Logo + hamburger menu (desliza de cima, dark overlay)
```

### Section 2 — Hero (min-height 700px)

```
Layout: 2 colunas desktop (60/40) / 1 coluna mobile
Padding-top: 120px (desktop) para dar respiro da nav

Coluna esquerda (texto):
  Eyebrow badge:
    pill com border subtle + dot pulsante rosa + texto
    "✨ 47 vídeos virais analisados · 23 formatos"
    caption uppercase

  Headline (display-xl):
    "Objetos que
    viralizam sozinhos"
    A segunda linha com gradient text (accent-gradient)

  Subheadline (body-lg, text-secondary, max-width 520px):
    "Crie reels virais com objetos 3D estilo Pixar que falam em primeira pessoa.
    Pacote completo em 30 segundos: roteiro, prompts visuais, legendas e hashtags.
    Sem editar, sem gravar, sem contratar designer."

  CTAs (flex row, gap 16px):
    [Criar conta grátis →]  — accent-primary, glow on hover, 14px 28px
    [Ver exemplo ao vivo]   — border subtle, backdrop-blur, 14px 28px

  Trust line (small, text-muted, margin-top 24px):
    "✓ Grátis por 14 dias · ✓ Sem cartão · ✓ Cancele quando quiser"

Coluna direita (visual):
  Mockup de iPhone 15 Pro (rotação -5deg)
  Dentro do mockup: frame de reel vertical 9:16 mostrando
  um personagem 3D Pixar — lixeira animada com face brava,
  dizendo "EU sou a lixeira!" em caption branca bold

  Atrás do mockup: 3 círculos com blur (glow effects)
  - círculo rosa grande atrás
  - círculo ciano menor em cima direita
  - círculo roxo menor embaixo esquerda

  Floating cards ao redor do mockup:
  - "2.3M views" (canto superior esquerdo, com ícone 👁)
  - "+127% engajamento" (direita, com ícone 📈)
  - "Gerado em 28s" (embaixo, com ícone ⚡)
```

### Section 3 — Problem/Solution (antes × depois)

```
Eyebrow: "POR QUE VIRALOBJ"
H2 (display-md): "Produzir reel dá trabalho demais"
Sub: "Antes do ViralObj, você gastava horas no que devia levar minutos."

Layout: 2 colunas com seta no meio (desktop) / stacked (mobile)

Coluna esquerda — "ANTES" (card com border vermelho sutil):
  Título: "Do jeito antigo"
  Lista com ícones ❌:
  - 4+ horas pesquisando referências
  - R$ 200-500 pagando editor freelancer
  - Precisa gravar voz, edit e legendar
  - Sem garantia de viralização
  - Difícil escalar (1-2 reels por semana)

Seta → gradient rosa→ciano no meio

Coluna direita — "AGORA" (card com border accent-primary + glow):
  Título: "Com ViralObj"
  Lista com ícones ✅:
  - 30 segundos para gerar pacote completo
  - R$ 47/mês ilimitado no plano Pro
  - IA escreve, a IA gera visual, a IA legenda
  - Baseado em 47 reels que já viralizaram
  - Produza 10+ reels por dia
```

### Section 4 — Como funciona (3 steps)

```
Eyebrow: "COMO FUNCIONA"
H2: "3 passos. Sem fricção."
Sub: "Do input ao reel pronto pra postar."

Layout: 3 cards horizontais conectados por linha tracejada (desktop)
       3 cards stacked (mobile)

Card 1:
  Número grande: "01" (display-lg, accent-primary)
  Ícone: 🎯 ou pin drop
  Título (heading): "Escolha seu nicho"
  Body: "17 nichos prontos (casa, plantas, saúde, skincare...)
         100+ objetos catalogados com personalidade pronta."

Card 2:
  Número: "02"
  Ícone: ✨ ou sparkles
  Título: "IA gera o pacote"
  Body: "Roteiro bilíngue PT+EN, prompts Flux/Midjourney,
         vozes MiniMax TTS, legendas e hashtags otimizadas."

Card 3:
  Número: "03"
  Ícone: 🚀 ou rocket
  Título: "Publique e viralize"
  Body: "Exporta pra CapCut, gera o vídeo MP4 direto via FLUX + Veo,
         ou agenda publicação automática no Instagram."
```

### Section 5 — Features grid (6 cards)

```
Eyebrow: "RECURSOS"
H2: "Tudo que você precisa pra escalar"
Sub: "Pipeline de ponta a ponta construído em cima de 47 vídeos virais reais."

Grid: 3 colunas × 2 linhas (desktop) / 1 col (mobile)
Cards com glassmorphism + hover effect

Card 1 — "17 Nichos Prontos"
  Ícone: grid de 9 quadrados
  Body: "Casa, plantas, saúde, culinária, espiritualidade, skincare,
         financeiro, pets, fitness, gastronomia e mais. Bibliotecas
         de objetos com personalidade e prompts AI validados."

Card 2 — "23 Formatos Visuais"
  Ícone: abstract shapes
  Body: "De MULTI-STUB a PLANT-HUMANOID. Cada formato com câmera,
         tom, pipeline e caption style extraídos de vídeos que
         atingiram milhões de views."

Card 3 — "Multi-Provider IA"
  Ícone: três círculos conectados
  Body: "Claude 4.6, GPT-4.1 e Gemini 2.5 com fallback automático.
         Nunca fica offline. Gere pacotes mesmo se um provider cair."

Card 4 — "Bilíngue PT + EN"
  Ícone: globo ou bandeiras
  Body: "Pacote completo em português e inglês. Perfeito pra crescer
         audiência internacional sem retrabalho."

Card 5 — "Vídeo Automático"
  Ícone: play button com engrenagem
  Body: "Pipeline FLUX Pro + MiniMax TTS + VEED Fabric.
         Gera MP4 com lip sync real. Alternativa Google Veo 2 para
         movimento orgânico em plantas e líquidos."
  Badge: "EM BREVE"

Card 6 — "Auto-Post Instagram"
  Ícone: calendário com seta
  Body: "Agende reels inteiros pela Graph API v21.0. Calendário
         drag-and-drop. Séries inteiras produzidas e agendadas em
         minutos."
  Badge: "EM BREVE"
```

### Section 6 — Social proof / stats

```
Sem headline — full-width dark card com gradient sutil

Layout: 4 colunas (desktop) / 2×2 (mobile)
Cada coluna:
  Número grande (display-lg, gradient text): "47"
  Label (caption): "Vídeos virais analisados"

Stats:
  47     Vídeos virais analisados
  23     Formatos catalogados
  17     Nichos validados
  100+   Objetos com personalidade

Abaixo, pequeno texto:
"Dataset proprietário construído analisando reels reais das maiores
contas brasileiras de Talking Objects: @coisadecasa.ia, @objetosfalantes,
@ajuda.ai.hacks, @oficinassuculentas, @casasincerona."
```

### Section 7 — Pricing (4 cards)

```
Eyebrow: "PREÇOS"
H2: "Planos que crescem com você"
Sub: "Comece grátis. Upgrade quando estiver escalando."

Toggle mensal/anual (mensal default) — salvar 20% no anual

Grid: 4 colunas (desktop) / 1 col (mobile, com card Pro destacado)
Cada card: glassmorphism, card "Pro" com border accent-primary + badge "MAIS POPULAR"

════════ CARD 1 — TRIAL ════════
Preço: "Grátis"
Subtexto: "14 dias · Sem cartão"
CTA: "Começar agora" (secondary button)
Features:
  ✓ 5 pacotes gerados
  ✓ 17 nichos completos
  ✓ Multi-provider IA
  ✓ Histórico ilimitado
  ✗ Geração de vídeo
  ✗ Auto-post Instagram

════════ CARD 2 — STARTER ════════
Preço: "R$ 47"
Subtexto: "por mês · ou R$ 37 anual"
CTA: "Assinar Starter" (secondary button)
Features:
  ✓ 30 pacotes/mês
  ✓ 10 vídeos gerados/mês
  ✓ 10 posts agendados/mês
  ✓ Tudo do Trial
  ✓ Suporte email

════════ CARD 3 — PRO (DESTAQUE) ════════
Badge: "MAIS POPULAR" (pill accent-primary no topo do card)
Border: glow accent-primary
Preço: "R$ 147"
Subtexto: "por mês · ou R$ 117 anual (20% off)"
CTA: "Assinar Pro" (primary button com glow)
Features:
  ✓ 100 pacotes/mês
  ✓ 50 vídeos gerados/mês
  ✓ 50 posts agendados/mês
  ✓ Tudo do Starter
  ✓ Séries automatizadas
  ✓ Prioridade no fallback LLM
  ✓ Suporte prioritário

════════ CARD 4 — PRO+ ════════
Preço: "R$ 297"
Subtexto: "por mês · ou R$ 237 anual"
CTA: "Assinar Pro+" (secondary button)
Features:
  ✓ 300 pacotes/mês
  ✓ 150 vídeos gerados/mês
  ✓ 150 posts agendados/mês
  ✓ Tudo do Pro
  ✓ White-label (logo próprio)
  ✓ Múltiplos workspaces
  ✓ Suporte WhatsApp

Embaixo dos cards:
  Link pequeno: "Precisa de mais? Ver plano Enterprise →"

Legenda de garantia (centro, body, text-muted):
  "🛡️  Garantia de 7 dias — reembolso 100% se não gostar"
```

### Section 8 — Nichos showcase (catálogo visual)

```
Eyebrow: "17 NICHOS PRONTOS"
H2: "Criamos conteúdo para o seu público"
Sub: "Cada nicho com objetos validados, formato padrão e tom recomendado."

Layout: grid responsivo (4 col desktop / 2 col mobile)
Cards pequenos com:
  - Emoji/ícone (48px)
  - Nome do nicho (subheading)
  - Tom badge (pill colorido por tom)
  - Count "X objetos"

Os 17 nichos:
  🏠 Casa                 (angry)      30 objetos
  🌱 Plantas               (educational) 8 objetos
  💰 Financeiro            (dramatic)    8 objetos
  🍳 Culinária             (educational) 13 objetos
  🍃 Natureza              (dramatic)    5 objetos
  💊 Saúde                 (educational) 12 objetos
  🐾 Pets                  (educational) 6 objetos
  💪 Fitness               (funny)       5 objetos
  👶 Maternidade           (educational) 4 objetos
  🧘 Saúde Mental          (educational) 4 objetos
  🥗 Saúde & Receitas      (educational) 10 objetos
  🍔 Gastronomia           (funny)       15 objetos
  ✨ Skincare Natural      (educational) 7 objetos
  🔮 Espiritualidade       (dramatic)    5 objetos
  🌸 Saúde Feminina        (educational) 4 objetos
  🏘 Imóveis               (dramatic)    3 objetos
  ✈️ Viagem                (educational) 3 objetos

CTA embaixo do grid:
  [Ver catálogo completo →] (secondary button)
```

### Section 9 — FAQ (8 perguntas)

```
Eyebrow: "PERGUNTAS FREQUENTES"
H2: "Dúvidas comuns"

Layout: accordion single-column, max-width 720px, centralizado

Q1: "Como o ViralObj funciona na prática?"
A1: "Você escolhe um nicho, lista os objetos que quer falando (ex: lixeira,
    celular, alface), o tópico e o tom. A IA gera um pacote completo com
    roteiro em PT+EN, prompts para gerar imagens no Flux/Midjourney, voz,
    legendas otimizadas e hashtags. Você pode exportar pra CapCut ou
    gerar o vídeo automaticamente via nosso pipeline Fal.ai."

Q2: "Preciso saber mexer em edição de vídeo?"
A2: "Não. O plano Trial e Starter te dão o pacote pronto pra importar no
    CapCut em 5 cliques. No plano Pro, você gera o vídeo MP4 final direto
    pela nossa plataforma — sem editor nenhum."

Q3: "Os vídeos são bons mesmo? Viralizam?"
A3: "Nosso sistema foi treinado em 47 reels virais reais analisados frame
    a frame. Extraímos 23 formatos visuais repetíveis e 17 nichos
    validados. Cada output segue os mesmos padrões que já funcionaram em
    contas com milhões de views."

Q4: "Qual a diferença entre os planos?"
A4: "Trial: 5 pacotes grátis por 14 dias (sem vídeo). Starter: 30 pacotes
    + 10 vídeos + 10 posts agendados por mês. Pro: 100 + 50 + 50.
    Pro+: 300 + 150 + 150. Enterprise: ilimitado com white-label."

Q5: "Posso cancelar quando quiser?"
A5: "Sim. Sem taxa, sem fidelidade. Cancele no próprio painel e o acesso
    continua até o fim do período pago. Oferecemos também garantia
    incondicional de 7 dias — reembolso 100% se não gostar."

Q6: "O conteúdo gerado é único?"
A6: "Sim. Cada geração é feita em tempo real pela IA (Claude, GPT-4 ou
    Gemini). Você pode gerar múltiplas variações do mesmo input e o
    resultado nunca se repete."

Q7: "Funciona pra qualquer idioma?"
A7: "Hoje geramos em Português BR e Inglês US (bilíngue no mesmo pacote).
    Espanhol está no roadmap para Q2."

Q8: "Posso agendar posts no Instagram direto?"
A8: "No plano Pro e superior, você conecta sua conta Instagram Business
    via OAuth oficial da Meta e agenda reels diretamente pelo nosso
    calendário. Suporta publicação imediata ou agendada (até 75 dias
    no futuro), além de compartilhamento automático nos Stories."
```

### Section 10 — CTA Final

```
Full-width card com gradient rosa→cyan no background (15% opacity)

Layout: centralizado

Eyebrow: "PRONTO?"
H2 (display-lg, gradient text): "Comece a viralizar hoje."
Sub (body-lg, max-width 560px):
  "14 dias grátis. Sem cartão. 5 pacotes prontos pra testar
  o potencial viral do seu nicho."

CTA primary (botão grande 60×280):
  [Criar minha conta grátis →]

Trust row (small, text-muted):
  "Mais de [X] criadores já viralizaram com ViralObj"
  (placeholder — substituir com número real depois)
```

### Section 11 — Footer

```
Layout: 4 colunas (desktop) / 1 col (mobile)
Padding-y: 80px
Border-top: subtle

Coluna 1 — Brand:
  Logo ViralObj
  Tagline: "Objetos que viralizam sozinhos"
  Social icons: Instagram, YouTube, TikTok, LinkedIn
                (placeholders, sem link real ainda)

Coluna 2 — Produto:
  - Nichos
  - Formatos
  - Preços
  - FAQ
  - Roadmap

Coluna 3 — Recursos:
  - Blog (soon)
  - Documentação
  - API (Enterprise)
  - Suporte
  - Status

Coluna 4 — Legal:
  - Termos de Uso
  - Política de Privacidade
  - Política de Reembolso
  - LGPD
  - Cookies

Bottom bar (border-top subtle, padding-y 32px):
  Esquerda: "© 2026 DB8 Intelligence · CNPJ XX.XXX.XXX/0001-XX"
  Direita: "Feito com ❤️ no Brasil"
```

---

## 🖼️ PROMPTS PARA GERAR IMAGENS (Flux Pro / Midjourney / DALL-E 3)

Use essas prompts para gerar os visuais que vão dentro do mockup do iPhone no hero, floating cards e outras ilustrações.

### Hero — Personagem 3D principal (iPhone mockup)

```
Cute but furious animated trash can character, dark gray plastic body with
black wheels, face embedded on front with intensely angry expression,
furrowed brows, wide open shouting mouth, small stub arms raised in anger,
standing on Brazilian kitchen tile floor, blurred background with human
figure visible dropping trash on floor, Disney/Pixar 3D render style,
ultra-realistic 3D animation, 8K, cinematic warm lighting, 9:16 vertical
aspect ratio
```

### Section 3 — Floating card visual 1 (lixeira happy)

```
Cheerful animated trash can character with face, same gray body and black
wheels, giving thumbs up with big smile, surrounded by sparkle effects
and floating checkmarks, Disney/Pixar 3D render, 9:16 vertical, 8K
```

### Section 4 — How it works illustrations (3 ícones isométricos)

```
Step 1: Isometric 3D illustration of a floating magnifying glass hovering
over a grid of small cute 3D object characters (trash can, plant, cup,
book), Pixar style, pink and cyan accent colors, dark background

Step 2: Isometric 3D illustration of an abstract AI brain with gradient
glow (pink to cyan), streams of particles flowing out representing text
and images being generated, dark background

Step 3: Isometric 3D illustration of a smartphone with a reel playing,
rocket launching from the screen, trending arrow going up, Instagram
heart icons floating, dark background
```

### Section 6 — Background pattern

```
Abstract dark background with subtle radial gradients, deep black to
midnight blue, soft pink glow in top-left corner and cyan glow in
bottom-right, grainy film texture overlay, minimal, elegant, cinematic
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile:    320–767px   (1 column, stacked everything, larger touch targets)
Tablet:    768–1023px  (2 columns for grids, condensed nav)
Desktop:   1024–1439px (full layout)
Wide:      1440px+     (max-width 1200px container, centered)
```

**Regras mobile-specific:**
- Hero: texto acima, visual abaixo
- Features grid: 1 coluna vertical
- Pricing: 1 coluna com card Pro em destaque
- Navbar: hamburger menu
- Font size: -15% nas displays
- Padding section: -40%

---

## ⚡ INTERAÇÕES & MICROANIMAÇÕES

```
Hero entrance:
  - Headline: fade-up + slight scale 0.95→1 (600ms ease-out, delay 100ms)
  - Sub: fade-up (600ms, delay 300ms)
  - CTAs: fade-up (600ms, delay 500ms)
  - iPhone mockup: slide-in from right + rotation -5deg (800ms, delay 200ms)

Buttons:
  - Primary: glow intensifies on hover (300ms)
  - Press: scale 0.97 (100ms)

Cards (features, pricing):
  - Hover: translateY(-4px) + border glow (200ms)

Scroll triggered:
  - Sections fade-in when 30% visible
  - Stats (section 6): números contam de 0→valor (1200ms ease-out)

FAQ accordion:
  - Open: height auto + icon rotate 180deg (300ms ease-out)
```

---

## 🛠️ INSTRUÇÕES ESPECÍFICAS POR FERRAMENTA

### 📐 Para Figma AI / Wireframer / Magician

Cole o prompt inteiro e adicione no final:

> "Crie 2 frames:
> 1. 'Desktop 1440' — 1440×4800px — implementando todas as 11 seções
> 2. 'Mobile 375' — 375×5200px — versão mobile responsiva
>
> Use componentes (auto-layout + variants) para navbar, cards, botões e pricing cards.
> Crie uma página separada 'Design System' com color styles e text styles linkados."

### 🗂️ Para Miro AI

Adicione:

> "Crie um board de wireframe low-fi com:
> - 1 frame para mapa de site (todas as 11 seções com títulos e conexões)
> - 1 frame para wireframe desktop com shapes (rect, text) representando cada componente
> - 1 frame para wireframe mobile
> - 1 frame para user flow (visitante → landing → pricing → checkout → /app)
>
> Use sticky notes amarelas para conteúdo, azuis para CTAs, rosas para hierarquia."

### 🔧 Para WeWeb

Adicione:

> "Crie um projeto novo com:
> - Design system em 'App Settings > Colors' com os tokens de cor acima
> - Font families: Inter (primary), Instrument Serif (display)
> - Crie collections 'pricing_plans' e 'niches' com os dados acima
> - Estruture a página '/' com 11 sections, cada uma como container flexbox
> - Componentes reutilizáveis: Navbar, Button, Card, PricingCard, FAQItem, Footer
> - Bindings: pricing cards iteram sobre coleção 'pricing_plans', niches grid itera sobre 'niches'
> - Responsive: use breakpoints desktop/tablet/mobile"

---

## ✅ CHECKLIST DE QUALIDADE (o design precisa passar)

- [ ] Headline lida e entendida em menos de 3 segundos
- [ ] CTA primário visível acima da dobra (hero)
- [ ] Pricing visível sem precisar rolar mais que 2 scrolls do topo
- [ ] Contraste AA em todos os textos (WCAG 2.1)
- [ ] Nenhum texto cinza em cima de background cinza
- [ ] CTAs primários usam accent-primary #FF3366 consistentemente
- [ ] Nenhum card sem hover state
- [ ] Footer tem todos os links legais (ToS, Privacy, Refund)
- [ ] Mobile navbar com hamburger funcional
- [ ] FAQ tem 8+ perguntas respondidas
- [ ] Pricing tem plano "mais popular" destacado
- [ ] Trust signals (garantia, grátis, sem cartão) visíveis em 2 lugares
- [ ] Imagens em 9:16 para mockups de reels
- [ ] Responsive testado em 375px, 768px, 1440px

---

## 🎯 COPY PRINCIPAL (para copy-paste rápido)

```
# Headlines
"Objetos que viralizam sozinhos"
"Produzir reel dá trabalho demais"
"3 passos. Sem fricção."
"Tudo que você precisa pra escalar"
"Planos que crescem com você"
"Dúvidas comuns"
"Comece a viralizar hoje."

# Subtítulos
"Crie reels virais com objetos 3D estilo Pixar que falam em primeira pessoa.
Pacote completo em 30 segundos: roteiro, prompts visuais, legendas e hashtags."

# CTAs
Primários: "Criar conta grátis →", "Começar agora", "Assinar Pro"
Secundários: "Ver exemplo ao vivo", "Ver catálogo completo →", "Saber mais"

# Trust / garantias
"✓ Grátis por 14 dias · ✓ Sem cartão · ✓ Cancele quando quiser"
"🛡️  Garantia de 7 dias — reembolso 100% se não gostar"

# Stats
"47 vídeos virais analisados"
"23 formatos catalogados"
"17 nichos validados"
"100+ objetos com personalidade"

# Eyebrows (caption uppercase)
"POR QUE VIRALOBJ"
"COMO FUNCIONA"
"RECURSOS"
"17 NICHOS PRONTOS"
"PREÇOS"
"PERGUNTAS FREQUENTES"
"PRONTO?"
```

---

## 📤 DELIVERABLES ESPERADOS

Ao final, eu (você que usa a ferramenta) devo ter:

1. **Arquivo Figma/Miro/WeWeb** com a landing completa (desktop + mobile)
2. **Design system** documentado (cores, tipo, espaçamentos)
3. **Componentes reutilizáveis** (navbar, cards, botões, pricing cards)
4. **Pelo menos 3 imagens geradas** (hero mockup + 2 floating cards) via Flux/MJ/DALL-E usando os prompts acima
5. **Export** em formato compartilhável (PNG hero, link Figma público, URL WeWeb staging)

---

**Fim do Master Prompt para Landing Page.**

**Agora, execute esse briefing na ferramenta escolhida (Figma/Miro/WeWeb) e produza a landing conforme especificado.**
