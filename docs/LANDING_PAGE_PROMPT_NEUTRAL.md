# ViralObj — Landing Page Prompt (Policy-Safe / Brand-Neutral)

**Versão limpa, sem menções a marcas protegidas** (Pixar, Disney, Flux, Midjourney, etc).
Use esta versão em Miro AI, ChatGPT com content filter, Claude.ai, ou qualquer tool que bloqueie referências a IP proprietário.

**Idioma:** Português BR
**Estilo visual:** Dark neon SaaS moderno (Linear / Vercel / Cursor / Arc vibes)

---

## 🎯 PAPEL

Você é um **Senior Product Designer + Landing Page Conversion Specialist** especializado em SaaS B2C brasileiros. Crie uma landing page de alta conversão para o produto **ViralObj** seguindo a estrutura, conteúdo e design tokens abaixo.

---

## 📦 PRODUTO

ViralObj é um gerador SaaS que usa IA para criar **reels curtos animados em estilo cartoon 3D estilizado**, onde objetos do cotidiano ganham rosto, personalidade e falam em primeira pessoa sobre dicas, erros ou segredos do dia a dia.

**Como funciona:** o usuário escolhe um nicho (casa, plantas, saúde, culinária, skincare, etc.), lista os objetos que quer falando e o tópico. A IA gera um pacote completo com roteiro bilíngue (PT+EN), prompts visuais, legendas e hashtags. Opcionalmente, gera o vídeo MP4 automático e agenda a publicação no Instagram.

**Diferencial:** dataset proprietário com 47 reels virais reais analisados frame a frame, 23 formatos visuais catalogados e 17 nichos prontos com 100+ objetos pré-configurados.

**Target:** Criadores de conteúdo brasileiros em nichos específicos que querem produzir reels profissionais sem contratar designer/editor.

**Promessa central:** "De ideia a reel pronto em 30 segundos, com roteiro viral validado."

---

## 🎨 DESIGN SYSTEM

### Paleta de Cores

```
Background:
  bg-primary:    #0A0A0F   (preto quase puro)
  bg-card:       #14141F   (superfície elevada, 90% opacidade)
  bg-elevated:   #1C1C2B   (dropdowns, tooltips)

Accents:
  accent-primary:   #FF3366  (rosa — CTAs principais)
  accent-secondary: #00E5FF  (ciano — highlights, badges)
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
Fonte principal: Inter (sans-serif)
Fonte display: Instrument Serif (apenas para eyebrow e quotes)

Escala desktop:
  display-xl:   72px / weight 800  (headline hero)
  display-lg:   56px / weight 700
  display-md:   40px / weight 700
  display-sm:   32px / weight 700
  heading:      24px / weight 600
  subheading:   18px / weight 500
  body-lg:      18px / weight 400
  body:         16px / weight 400
  small:        14px / weight 400
  caption:      12px / weight 500 / uppercase
```

### Espaçamento

```
Container max-width:  1200px
Section padding-y:    120px desktop / 80px mobile
Card padding:         32px
Border radius:        8px / 12px / 20px / pill
```

### Efeitos Visuais

```
Glassmorphism cards:
  background: rgba(20, 20, 31, 0.7)
  backdrop-filter: blur(16px)
  border: 1px solid rgba(255, 255, 255, 0.08)

Background ambient:
  radial gradients sutis rosa (20% 10%) e ciano (80% 60%) sobre fundo preto

Hover dos CTAs:
  glow rosa expandindo (box-shadow 0 0 40px rgba(255,51,102,0.4))

Hover dos cards:
  subir 4px + border accent-primary
```

---

## 📐 ESTRUTURA (11 seções)

### Seção 1 — Navbar (sticky, 72px)

```
Horizontal, space-between, backdrop-blur

Esquerda:
  Logo = círculo rosa + texto "ViralObj" (peso 700, 20px)

Centro (desktop):
  Links: Nichos · Como funciona · Preços · FAQ

Direita:
  Link "Entrar"
  Botão "Criar conta grátis" (accent-primary, pill, 10×20px)

Mobile: logo + hamburger
```

### Seção 2 — Hero (min 700px)

```
Layout: 2 colunas desktop 60/40 · 1 coluna mobile

COLUNA ESQUERDA (texto)

Eyebrow badge:
  pill com dot pulsante rosa + texto
  "✨ 47 vídeos virais analisados · 23 formatos"

Headline (display-xl):
  "Objetos que
  viralizam sozinhos"
  Segunda linha com gradient text (rosa → ciano)

Subheadline (body-lg, max-width 520px):
  "Crie reels curtos com objetos animados que falam em primeira pessoa.
  Pacote completo em 30 segundos: roteiro, prompts visuais, legendas
  e hashtags. Sem editar, sem gravar, sem contratar designer."

CTAs (flex row, gap 16px):
  [Criar conta grátis →]  accent-primary, glow on hover
  [Ver exemplo ao vivo]   border subtle, backdrop-blur

Trust line (small, text-muted):
  "✓ Grátis por 14 dias · ✓ Sem cartão · ✓ Cancele quando quiser"

COLUNA DIREITA (visual)

Mockup de smartphone (rotação -5deg)
Dentro do mockup: frame vertical 9:16 com imagem estilizada
de uma lixeira animada personificada com rosto expressivo,
com caption branca bold "EU sou a lixeira!"

Atrás do mockup: 3 círculos blur (glow effects)
  - círculo rosa grande atrás
  - círculo ciano menor top-right
  - círculo roxo menor bottom-left

Floating cards ao redor:
  "2.3M views" (top-left, ícone 👁)
  "+127% engajamento" (right, ícone 📈)
  "Gerado em 28s" (bottom, ícone ⚡)
```

### Seção 3 — Problema × Solução

```
Eyebrow: "POR QUE VIRALOBJ"
H2: "Produzir reel dá trabalho demais"
Sub: "Antes do ViralObj, você gastava horas no que devia levar minutos."

Layout: 2 colunas com seta no meio (desktop) / stacked (mobile)

ESQUERDA — "ANTES" (card border vermelho sutil)
Título: "Do jeito antigo"
  ❌ 4+ horas pesquisando referências
  ❌ R$ 200-500 pagando editor freelancer
  ❌ Precisa gravar voz, editar e legendar
  ❌ Sem garantia de viralização
  ❌ Difícil escalar (1-2 reels por semana)

→ Seta gradient rosa→ciano no meio

DIREITA — "AGORA" (card border accent + glow)
Título: "Com ViralObj"
  ✅ 30 segundos para gerar pacote completo
  ✅ R$ 47/mês no plano Starter
  ✅ IA escreve, gera visual, legenda
  ✅ Baseado em 47 reels que já viralizaram
  ✅ Produza 10+ reels por dia
```

### Seção 4 — Como funciona (3 steps)

```
Eyebrow: "COMO FUNCIONA"
H2: "3 passos. Sem fricção."
Sub: "Do input ao reel pronto pra postar."

Layout: 3 cards horizontais conectados por linha tracejada

CARD 1
Número grande: "01" (display-lg, rosa)
Ícone: alvo 🎯
Título: "Escolha seu nicho"
Body: "17 nichos prontos (casa, plantas, saúde, skincare...)
       com 100+ objetos catalogados com personalidade."

CARD 2
Número: "02"
Ícone: sparkles ✨
Título: "IA gera o pacote"
Body: "Roteiro bilíngue PT+EN, prompts de imagem, vozes,
       legendas e hashtags otimizadas."

CARD 3
Número: "03"
Ícone: rocket 🚀
Título: "Publique e viralize"
Body: "Exporta pra editor de vídeo, gera o MP4 automático
       ou agenda publicação no Instagram."
```

### Seção 5 — Features grid (6 cards)

```
Eyebrow: "RECURSOS"
H2: "Tudo que você precisa pra escalar"
Sub: "Pipeline de ponta a ponta construído em cima de 47 vídeos virais reais."

Grid 3×2 desktop / 1 col mobile
Cards glassmorphism com hover

CARD 1 — "17 Nichos Prontos"
Ícone: grid de 9 quadrados
Body: "Casa, plantas, saúde, culinária, espiritualidade, skincare,
       financeiro, pets, fitness, gastronomia e mais."

CARD 2 — "23 Formatos Visuais"
Ícone: shapes abstratas
Body: "Cada formato com câmera, tom e estilo extraídos de
       vídeos que atingiram milhões de views."

CARD 3 — "Multi-Provider IA"
Ícone: três círculos conectados
Body: "Claude, GPT e Gemini com fallback automático.
       Nunca fica offline."

CARD 4 — "Bilíngue PT + EN"
Ícone: globo
Body: "Pacote completo em português e inglês. Perfeito pra crescer
       audiência internacional."

CARD 5 — "Vídeo Automático" (badge EM BREVE)
Ícone: play button
Body: "Pipeline de geração de vídeo MP4 com lip sync real."

CARD 6 — "Auto-Post Instagram" (badge EM BREVE)
Ícone: calendário
Body: "Agende reels pela Graph API. Calendário drag-and-drop.
       Séries inteiras agendadas em minutos."
```

### Seção 6 — Stats (social proof numérico)

```
Full-width dark card com gradient sutil, sem headline

Layout: 4 colunas desktop / 2×2 mobile
Cada coluna:
  Número gigante (display-lg gradient text)
  Label (caption uppercase)

Os 4 stats:
  47     Vídeos virais analisados
  23     Formatos catalogados
  17     Nichos validados
  100+   Objetos com personalidade

Abaixo:
"Dataset proprietário construído analisando reels reais das maiores
contas brasileiras de conteúdo com objetos animados."
```

### Seção 7 — Pricing (4 cards)

```
Eyebrow: "PREÇOS"
H2: "Planos que crescem com você"
Sub: "Comece grátis. Upgrade quando estiver escalando."

Toggle mensal/anual (default mensal, anual -20%)
Grid 4 colunas desktop / stacked mobile com Pro destacado

CARD 1 — TRIAL
Preço: "Grátis"
Sub: "14 dias · Sem cartão"
CTA: "Começar agora" (secondary)
Features:
  ✓ 5 pacotes gerados
  ✓ 17 nichos completos
  ✓ Multi-provider IA
  ✓ Histórico ilimitado
  ✗ Geração de vídeo
  ✗ Auto-post Instagram

CARD 2 — STARTER
Preço: "R$ 47/mês"
Sub: "ou R$ 37 anual"
CTA: "Assinar Starter" (secondary)
Features:
  ✓ 30 pacotes/mês
  ✓ 10 vídeos gerados/mês
  ✓ 10 posts agendados/mês
  ✓ Tudo do Trial
  ✓ Suporte email

CARD 3 — PRO (DESTAQUE, border glow)
Badge: "MAIS POPULAR" (pill rosa no topo)
Preço: "R$ 147/mês"
Sub: "ou R$ 117 anual (20% off)"
CTA: "Assinar Pro" (primary, glow)
Features:
  ✓ 100 pacotes/mês
  ✓ 50 vídeos gerados/mês
  ✓ 50 posts agendados/mês
  ✓ Tudo do Starter
  ✓ Séries automatizadas
  ✓ Prioridade no fallback
  ✓ Suporte prioritário

CARD 4 — PRO+
Preço: "R$ 297/mês"
Sub: "ou R$ 237 anual"
CTA: "Assinar Pro+" (secondary)
Features:
  ✓ 300 pacotes/mês
  ✓ 150 vídeos gerados/mês
  ✓ 150 posts agendados/mês
  ✓ Tudo do Pro
  ✓ White-label (logo próprio)
  ✓ Múltiplos workspaces
  ✓ Suporte WhatsApp

Embaixo:
  Link: "Precisa de mais? Ver plano Enterprise →"
  Garantia: "🛡️ Garantia de 7 dias — reembolso 100% se não gostar"
```

### Seção 8 — Catálogo de nichos

```
Eyebrow: "17 NICHOS PRONTOS"
H2: "Criamos conteúdo para o seu público"
Sub: "Cada nicho com objetos validados, formato padrão e tom recomendado."

Grid 4 colunas desktop / 2 colunas mobile
Cards pequenos:
  - Emoji grande (48px)
  - Nome do nicho
  - Tom badge (pill colorido)
  - "X objetos"

Lista:
🏠 Casa                (angry)       30 objetos
🌱 Plantas             (educational)  8 objetos
💰 Financeiro          (dramatic)     8 objetos
🍳 Culinária           (educational) 13 objetos
🍃 Natureza            (dramatic)     5 objetos
💊 Saúde               (educational) 12 objetos
🐾 Pets                (educational)  6 objetos
💪 Fitness             (funny)        5 objetos
👶 Maternidade         (educational)  4 objetos
🧘 Saúde Mental        (educational)  4 objetos
🥗 Saúde & Receitas    (educational) 10 objetos
🍔 Gastronomia         (funny)       15 objetos
✨ Skincare Natural    (educational)  7 objetos
🔮 Espiritualidade     (dramatic)     5 objetos
🌸 Saúde Feminina      (educational)  4 objetos
🏘 Imóveis             (dramatic)     3 objetos
✈️ Viagem              (educational)  3 objetos

CTA: [Ver catálogo completo →] (secondary)
```

### Seção 9 — FAQ

```
Eyebrow: "PERGUNTAS FREQUENTES"
H2: "Dúvidas comuns"

Layout: accordion single column, max-width 720px, centralizado

Q1: "Como o ViralObj funciona na prática?"
A1: "Você escolhe um nicho, lista os objetos que quer falando,
    o tópico e o tom. A IA gera um pacote completo com roteiro
    PT+EN, prompts de imagem, voz, legendas e hashtags. Você
    exporta pra editor de vídeo ou gera o MP4 final automático."

Q2: "Preciso saber mexer em edição de vídeo?"
A2: "Não. Trial e Starter entregam o pacote pronto pra importar
    num editor visual em 5 cliques. Plano Pro gera o vídeo MP4
    final direto pela plataforma — sem editor."

Q3: "Os vídeos viralizam mesmo?"
A3: "Nosso sistema foi treinado em 47 reels virais reais
    analisados frame a frame. Extraímos 23 formatos visuais
    repetíveis e 17 nichos validados. Cada output segue os
    mesmos padrões que já funcionaram em contas com milhões
    de views."

Q4: "Qual a diferença entre os planos?"
A4: "Trial: 5 pacotes grátis por 14 dias. Starter: 30 + 10 + 10.
    Pro: 100 + 50 + 50. Pro+: 300 + 150 + 150. Enterprise:
    ilimitado com white-label."

Q5: "Posso cancelar quando quiser?"
A5: "Sim. Sem taxa, sem fidelidade. Cancele no painel e o
    acesso continua até o fim do período pago. Garantia
    incondicional de 7 dias."

Q6: "O conteúdo gerado é único?"
A6: "Sim. Cada geração é feita em tempo real pela IA.
    Você pode gerar múltiplas variações do mesmo input."

Q7: "Funciona em outros idiomas?"
A7: "Hoje geramos em PT-BR e EN-US bilíngue no mesmo pacote.
    Espanhol está no roadmap para Q2."

Q8: "Posso agendar posts no Instagram direto?"
A8: "No plano Pro você conecta sua conta Instagram Business
    via OAuth oficial e agenda reels diretamente pelo
    calendário integrado."
```

### Seção 10 — CTA Final

```
Full-width card com gradient rosa→ciano no background (15% opacity)

Centralizado:

Eyebrow: "PRONTO?"
H2 (display-lg gradient text): "Comece a viralizar hoje."
Sub (body-lg, max-width 560px):
  "14 dias grátis. Sem cartão. 5 pacotes prontos pra testar
  o potencial viral do seu nicho."

CTA primary (botão grande):
  [Criar minha conta grátis →]

Trust row:
  "Mais de [X] criadores já viralizaram com ViralObj"
```

### Seção 11 — Footer

```
Layout: 4 colunas desktop / 1 col mobile, padding-y 80px

COL 1 — Brand
  Logo ViralObj
  Tagline: "Objetos que viralizam sozinhos"
  Social icons (Instagram, YouTube, TikTok, LinkedIn)

COL 2 — Produto
  Nichos · Formatos · Preços · FAQ · Roadmap

COL 3 — Recursos
  Blog · Documentação · API · Suporte · Status

COL 4 — Legal
  Termos de Uso · Política de Privacidade · Reembolso · LGPD · Cookies

Bottom bar (border-top):
  Esquerda: "© 2026 DB8 Intelligence · CNPJ XX.XXX.XXX/0001-XX"
  Direita: "Feito com ❤️ no Brasil"
```

---

## 📱 RESPONSIVE

```
Mobile:   320–767px   (1 col, stacked, touch targets maiores)
Tablet:   768–1023px  (2 cols grids, nav condensada)
Desktop:  1024–1439px (layout completo)
Wide:     1440px+     (max-width 1200px container, centralizado)
```

**Regras mobile:**
- Hero: texto acima, visual abaixo
- Features/Pricing: 1 coluna vertical
- Navbar: hamburger
- Displays: -15% font-size
- Section padding: -40%

---

## ⚡ INTERAÇÕES

```
Hero entrance:
  - Headline: fade-up + scale 0.95→1 (600ms, delay 100ms)
  - Sub: fade-up (600ms, delay 300ms)
  - CTAs: fade-up (600ms, delay 500ms)
  - Mockup: slide from right + rotate -5deg (800ms, delay 200ms)

Botões:
  - Primary: glow intensifies on hover (300ms)
  - Press: scale 0.97 (100ms)

Cards (features, pricing):
  - Hover: translateY(-4px) + border glow (200ms)

Scroll:
  - Sections fade-in quando 30% visíveis
  - Stats: números contam de 0→valor (1200ms ease-out)

FAQ accordion:
  - Open: height auto + icon rotate 180deg (300ms)
```

---

## 🎯 COPY PRONTA (copy-paste)

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
"Crie reels curtos com objetos animados que falam em primeira pessoa.
Pacote completo em 30 segundos: roteiro, prompts visuais, legendas e hashtags."

# CTAs
Primários: "Criar conta grátis →", "Começar agora", "Assinar Pro"
Secundários: "Ver exemplo ao vivo", "Ver catálogo completo →"

# Trust
"✓ Grátis por 14 dias · ✓ Sem cartão · ✓ Cancele quando quiser"
"🛡️ Garantia de 7 dias — reembolso 100% se não gostar"

# Stats
"47 vídeos virais analisados"
"23 formatos catalogados"
"17 nichos validados"
"100+ objetos com personalidade"

# Eyebrows
POR QUE VIRALOBJ · COMO FUNCIONA · RECURSOS · 17 NICHOS PRONTOS
PREÇOS · PERGUNTAS FREQUENTES · PRONTO?
```

---

## 🖼️ PROMPTS DE IMAGEM (brand-safe)

Use essas descrições em qualquer gerador de imagens. **Nenhuma menciona marca protegida.**

### Hero — Personagem principal (dentro do mockup de smartphone)

```
A stylized 3D cartoon character of a household trash can with a personified
face — expressive angry eyes, furrowed brows, wide open shouting mouth,
small stub arms raised in frustration. Dark gray plastic body with small
black wheels. Standing on a Brazilian kitchen tile floor. Soft-focus
background showing a blurred human figure dropping trash on the floor.
Cute modern 3D mascot illustration style, warm cinematic lighting, soft
shadows, vibrant colors, 9:16 vertical aspect ratio, ultra detailed
texture, high quality render
```

### Floating card 1 — Lixeira feliz (com thumbs up)

```
A cheerful stylized 3D cartoon trash can character with a big smile,
dark gray plastic body with small black wheels, giving a thumbs up with
one small arm raised. Surrounded by sparkle effects and floating checkmark
icons. Isolated on a transparent or dark background with subtle pink glow.
Cute modern mascot illustration style, soft lighting, 9:16 vertical,
high quality 3D render
```

### Step 1 — Magnifying glass over objects

```
Isometric 3D illustration of a glowing magnifying glass hovering over a
grid of small cute 3D object mascots — a trash can, a house plant, a
coffee cup, a book — all with cartoon faces. Pink and cyan accent
colors. Dark gradient background. Modern minimalist cartoon style,
soft shadows, subtle glow effects
```

### Step 2 — AI brain generating content

```
Isometric 3D illustration of an abstract geometric brain shape with
pink-to-cyan gradient glow. Streams of small particles, text fragments
and tiny image icons flowing out of the brain like a waterfall.
Dark background with ambient light. Modern minimalist tech illustration
style, soft lighting, no text or logos
```

### Step 3 — Smartphone with viral reel

```
Isometric 3D illustration of a smartphone with a vertical video playing
on screen. A small rocket launching upward from the screen. A trending
arrow pointing up. Small floating heart and thumbs-up icons around the
phone. Pink and cyan accent colors on dark background. Modern minimalist
style, soft shadows, subtle glow
```

### Background pattern

```
Abstract dark background with subtle radial gradients. Deep black fading
to midnight blue. Soft pink glow in the top-left corner and cyan glow in
the bottom-right corner. Subtle grainy film texture overlay. Minimal,
elegant, cinematic, no text, no logos
```

---

## 🛠️ PARA MIRO AI (instrução direta)

**Cole tudo acima e adicione no final:**

> "Crie um board de wireframe low-fi com os seguintes frames:
>
> FRAME 1 — 'Sitemap'
>   Mapa de site mostrando as 11 seções conectadas por setas,
>   com título de cada uma em sticky note amarela.
>
> FRAME 2 — 'Desktop Wireframe'
>   Wireframe horizontal de 1440×4800px usando shapes retangulares
>   para cada bloco de conteúdo. Textos como placeholders. Cores
>   neutras cinza/preto.
>
> FRAME 3 — 'Mobile Wireframe'
>   Wireframe vertical de 375×5200px com mesma estrutura mas
>   stacked em 1 coluna.
>
> FRAME 4 — 'User Flow'
>   Fluxograma visitante → landing → pricing → signup → app dashboard,
>   usando shapes de fluxo conectados por setas.
>
> Use sticky notes amarelas para conteúdo de texto, azuis para CTAs
> e rosas para hierarquia/seções. Não precisa criar visuais detalhados
> — foco em estrutura e layout."

---

## 🛠️ PARA WEWEB (instrução direta)

**Cole tudo acima e adicione:**

> "Crie um projeto WeWeb novo com:
>
> 1. Design system em App Settings > Colors com os tokens de cor acima
> 2. Fontes: Inter (primary) e Instrument Serif (display)
> 3. Crie 2 collections locais:
>    - 'pricing_plans' com 4 registros (Trial, Starter, Pro, Pro+)
>      campos: name, price_monthly, price_yearly, features (array), is_popular
>    - 'niches' com 17 registros
>      campos: emoji, name, tone, objects_count
> 4. Componentes reutilizáveis:
>    - Navbar, Button, Card, PricingCard, FeatureCard, NicheCard, FAQItem, Footer
> 5. Página '/' estruturada em 11 sections (containers flex)
> 6. Bindings:
>    - Pricing grid itera sobre pricing_plans
>    - Niches grid itera sobre niches
> 7. Responsive: breakpoints desktop/tablet/mobile usando grid columns
> 8. Conectar ao endpoint https://viralobj.vercel.app/api/niches para
>    popular o grid de nichos dinamicamente (opcional)"

---

## 🛠️ PARA FIGMA AI

**Cole tudo acima e adicione:**

> "Crie o arquivo Figma com:
>
> 1. Página 'Design System':
>    - Color styles para todas as cores dos tokens
>    - Text styles para todos os níveis de tipografia
>    - Effect styles (glow, shadow, blur)
>
> 2. Página 'Desktop':
>    - Frame 1440×4800px
>    - Implementar todas as 11 seções
>    - Auto-layout em tudo
>    - Componentes (variants) para: Navbar, Button, Card, PricingCard,
>      FeatureCard, NicheCard, FAQItem, Footer
>
> 3. Página 'Mobile':
>    - Frame 375×5200px
>    - Versão responsiva
>
> 4. Página 'Assets':
>    - Placeholders para as imagens (usar retângulos cinza com descrição)"

---

## ✅ CHECKLIST DE QUALIDADE

- [ ] Headline compreendida em menos de 3 segundos
- [ ] CTA primário acima da dobra no hero
- [ ] Pricing visível em menos de 2 scrolls do topo
- [ ] Contraste AA (WCAG 2.1) em todos os textos
- [ ] CTAs usam accent-primary #FF3366 consistentemente
- [ ] Todos os cards têm hover state
- [ ] Footer com todos os links legais
- [ ] Mobile hamburger funcional
- [ ] FAQ com 8+ perguntas
- [ ] Pricing com "MAIS POPULAR" destacado
- [ ] Trust signals (garantia, grátis, sem cartão) em 2+ lugares
- [ ] Responsive testado em 375px, 768px, 1440px

---

## 📤 DELIVERABLES

1. **Arquivo/board** com a landing completa (desktop + mobile)
2. **Design system** documentado
3. **Componentes** reutilizáveis
4. **3+ imagens** geradas usando os prompts brand-safe acima
5. **Export compartilhável** (link público)

---

**Fim do Prompt Brand-Neutral.**

**Execute agora na ferramenta escolhida.**
