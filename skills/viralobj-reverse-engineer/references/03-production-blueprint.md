# Módulo 03 — Blueprint de Produção

## Movimentos de Câmera (detectados nos 5 vídeos)

### Static (casa, plantas)
```
Personagem fixo no centro, câmera imóvel.
Expressão e braços fazem todo o trabalho visual.
Prompt Kling: "static camera, character centered, subtle breathing animation"
```

### Tracking Follow (orlando/mapa)
```
Câmera segue o personagem andando.
Ângulo ligeiramente baixo (low angle) — faz personagem parecer maior.
Prompt Kling: "smooth tracking shot following character walking forward,
               slight low angle, camera moves with character pace"
```

### Progressive Zoom (orlando/close-up)
```
Começa wide, vai fechando no rosto progressivamente.
Usa no momento mais importante da fala.
Prompt Kling: "slow zoom in from medium shot to close-up face,
               smooth cinematic movement, 5 seconds"
```

### Mixed (cravo/tutorial)
```
Alterna entre: personagem inteiro + close nos ingredientes + resultado.
Prompt Kling por cena específica.
```

---

## Efeitos Visuais por Tipo

### Partículas Douradas (tutorial/bem-estar)
```
Kling prompt: "golden sparkle particles floating upward from jar,
               magical warm light, soft glow effect, enchanting atmosphere"
Aplicar em: cenas de receita, resultado positivo, magia
```

### Bactérias Animadas (celular)
```
Adicionar como layer separada no CapCut ou via Kling:
"colorful cute 3D bacteria characters floating around smartphone,
 blue teal pink orange purple germs with tiny eyes, bouncing movement"
```

### Liquid Dripping (lixeira)
```
Incluir no prompt da imagem:
"dark liquid dripping from overflowing garbage bag above,
 drips falling in slow motion, splatter on white floor"
```

### Spiders/Teias (garrafa)
```
Incluir no prompt:
"realistic spiders crawling on transparent bottle surface,
 cobwebs stretched across the bottle, dramatic dark lighting"
```

### Motion Trail (mapa andando)
```
Kling prompt addition: "subtle motion blur on legs and feet while walking,
                        cinematic feel, smooth movement"
```

---

## Trilha Sonora — Biblioteca por Nicho

### Casa / Limpeza
- Mood: urgente, levemente dramático, cômica
- BPM: 110–120
- Style: upbeat with tension
- Free tracks: freemusicarchive.org query "upbeat comedy tension"
- Volume: -18dB (voz em -12dB)

### Plantas / Natureza
- Mood: orgânico, caloroso, acolhedor
- BPM: 80–95
- Style: acoustic, soft piano, nature sounds
- Free tracks: "peaceful acoustic garden"
- Volume: -20dB

### Financeiro / Imóveis
- Mood: confiante, motivacional, aspiracional
- BPM: 100–115
- Style: corporate upbeat, light orchestral
- Free tracks: "corporate motivational positive"
- Volume: -18dB

### Tutorial / Receita
- Mood: feliz, aconchegante, nostálgico
- BPM: 90–105
- Style: ukulele, kitchen sounds, warm acoustic
- Free tracks: "happy cooking tutorial warm"
- Volume: -20dB

---

## Efeitos Sonoros por Cena

### Entrada do personagem
```
Tipo: swoosh + impact
Quando: primeiros 0.3s de cada personagem novo
Arquivo sugerido: "whoosh_impact_01.mp3"
```

### Revelação / Ponto importante
```
Tipo: "ding" ou "pop" 
Quando: palavra-chave ou dado chocante
Arquivo: "notification_pop.mp3"
```

### Corte entre personagens
```
Tipo: "cut_swipe" sutil
Quando: transição direta entre objetos
Arquivo: "swipe_transition.mp3"
```

### Efeito de susto/alerta
```
Tipo: "stinger" breve
Quando: dado alarmante (bactérias, veneno, perigo)
Arquivo: "alert_sting.mp3"
```

### Partículas/Magia
```
Tipo: "sparkle_shimmer"
Quando: partículas douradas, resultado positivo
Arquivo: "magic_sparkle.mp3"
```

---

## Legendas — Dois Estilos Validados

### Estilo Alpha (casa, plantas, cravo)
```css
font-family: "Arial Black", sans-serif;
font-weight: 900;
font-size: 48px;
color: #FFFFFF;
text-shadow: -2px -2px 0 #000, 2px -2px 0 #000,
             -2px 2px 0 #000, 2px 2px 0 #000;
position: bottom-center;
margin-bottom: 15%;
```
Aplicação: `TEXTO EM CAIXA ALTA` para gancho, texto normal para desenvolvimento

### Estilo Beta (orlando, snap/financeiro)
```css
/* Container pill */
background: rgba(255,255,255,0.92);
border-radius: 12px;
padding: 8px 20px;

/* Texto normal */
font-family: "Georgia", serif;  /* ou sans-serif clean */
font-weight: 400;
color: #1a1a1a;

/* Palavra-chave destacada */
color: #C9A84C;  /* dourado */
/* ou */
color: #FF4444;  /* vermelho urgência */
font-weight: 700;
```

---

## Capa do Reel (Thumbnail)

### Regras detectadas nos 5 vídeos
1. Personagem em expressão MÁXIMA (mais dramática do vídeo)
2. Cenário ao fundo bem iluminado e nítido
3. Texto sobreposto: bold, grande, 1–5 palavras, cor chamativa
4. Nenhuma capa é preta ou genérica

### Template de prompt para thumbnail
```
[CHARACTER] in most dramatic/expressive pose of the video,
[EXACT SCENE DESCRIPTION],
extreme expression — [EMOTION AT PEAK],
[BACKGROUND FULLY LIT AND DETAILED],
text overlay space at top: "[TITLE TEXT]",
thumbnail composition optimized for Instagram Reels cover
— 9:16 vertical, ultra-realistic 3D, 8K, vibrant colors
```

### Texto da capa por formato
- Casa/objetos bravos: `"EU ESTOU COM RAIVA"` ou nome do objeto em caps
- Tutorial: nome da receita/dica — `"AROMATIZANTE CASEIRO 🏠"`
- Financeiro: dado impactante — `"VOCÊ ESTÁ PERDENDO R$"` 
- Mapa/localização: lugar + emoji — `"FLÓRIDA 🌴"`
