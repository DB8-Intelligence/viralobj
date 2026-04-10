# Módulo 02 — Blueprint do Personagem

## Tipo A — STUB ARMS (Multi-objeto)
*Referência real: @coisadecasa.ia casa e plantas*

**Características:**
- Objeto inanimado com rosto na superfície frontal
- Braços curtos (stubs) — sem pernas
- Expressão exagerada — raiva/indignação dominante
- Cenário real ao fundo com humano Pixar fazendo erro

**Pipeline Fal.ai:** FLUX.2 Pro → VEED Fabric 1.0 (lip sync)

**Template de prompt FLUX.2 Pro:**
```
[ANGRY/EXPRESSION] animated [OBJECT NAME] character, [OBJECT DESCRIPTION],
cartoon face with [EXPRESSION ADJECTIVE] furrowed brows and [MOUTH POSITION] mouth,
small white stub arms [ARM POSITION], [SPECIAL PROPS if any],
[BRAZILIAN ENVIRONMENT] background, [LIGHTING],
[PIXAR HUMAN DESCRIPTION] visible in background [DOING WRONG ACTION],
Disney/Pixar 3D render quality, ultra-realistic 3D animation
— 9:16 vertical, 8K
```

**Exemplos validados:**
- Água sanitária: brava, braços cruzados, cozinha branca, mulher preocupada
- Lixeira: furiosa punhos fechados, cozinha clara, homem saindo com saco
- Alface: resignada braços cruzados, cozinha com legumes, mulher cozinhando

---

## Tipo B — FULL BODY (Personagem com pernas)
*Referência real: Cravo-da-índia tutorial, Mapa da Flórida*

**Características:**
- Personagem com tronco completo + pernas articuladas
- ANDA pelo cenário, gesticula amplamente
- Expressão range maior — de triste a alegre
- Câmera pode SEGUIR o personagem (tracking shot)
- Zoom dramático no rosto em momentos-chave

**Pipeline Fal.ai:**
```
FLUX.2 Pro (personagem static pose)
  → Kling v2.1 image-to-video (animar corpo + caminhar)
  → VEED Fabric (lip sync sobre o vídeo animado)
```

**Template de prompt FLUX.2 Pro:**
```
Cute animated [OBJECT] character with full body — torso, arms and legs,
[EXPRESSION] cartoon face, [BODY POSE/ACTION],
[DISTINCTIVE VISUAL DETAIL], [SPECIAL PROPS],
[SPECIFIC ENVIRONMENT — street/bathroom/garden],
[LIGHTING — golden hour/cool/warm],
Disney/Pixar 3D render, full body visible from head to feet
— 9:16 vertical, ultra-realistic 3D animation, 8K
```

**Template Kling animation prompt:**
```
[CHARACTER] walking naturally forward on [SURFACE],
arms swinging gently, head moving slightly,
camera follows from slight low angle,
cinematic smooth motion, 5 seconds
```

**Exemplos validados:**
- Cravo-da-índia: corpo completo, sentado na borda da pia, partículas douradas saindo do pote
- Mapa da Flórida: andando pela calçada de subúrbio americano, zoom no rosto quando fala

---

## Tipo C — DRESSED CHARACTER (Roupa completa)
*Referência real: Contrato de Financiamento Imobiliário @snapinsta*

**Características:**
- Objeto é a "cabeça" de um corpo humano vestido
- Usa roupa contextual (avental, terno, uniforme)
- Mãos com luvas brancas Pixar
- Interage fisicamente com objetos do cenário
- Expressão muito expressiva no "rosto" do objeto

**Pipeline Fal.ai:**
```
FLUX.2 Pro (personagem com corpo e roupa)
  → Kling v2.1 (animar gestos e ações)
  → VEED Fabric (lip sync na "cabeça/objeto")
```

**Template de prompt FLUX.2 Pro:**
```
Animated [OBJECT] character dressed as [PROFESSION/ROLE],
[OBJECT] as the head/face of a humanoid body,
wearing [CLOTHING DESCRIPTION], white cartoon gloves,
[ACTION — holding tool, pointing, cooking],
[CONTEXTUAL ENVIRONMENT — BBQ/office/kitchen],
expressive [EMOTION] face on the [OBJECT],
Disney/Pixar 3D render, full body from head to feet
— 9:16 vertical, ultra-realistic 3D animation, 8K
```

**Exemplos validados:**
- Contrato imobiliário: avental xadrez, segura espátula, churrasco no quintal americano
- Nota fiscal: jaleco branco, segura caneta, escritório contábil

---

## Tipo D — MAP/DOCUMENT ANIMATED
*Referência real: Mapa da Flórida (Orlando)*

**Características:**
- Documento/mapa dobrado com rosto e corpo
- Anda COM DESTINO — tem lugar para ir
- Câmera tracking + zoom progressivo no rosto
- Caption com PILL STYLE (fundo branco, 2 cores)
- Location pin/marker animado no corpo do mapa

**Pipeline Fal.ai:**
```
FLUX.2 Pro (mapa com rosto, corpo e pernas)
  → Kling v2.1 (walking animation + câmera tracking)
  → VEED Fabric (lip sync)
```

**Template específico:**
```
Animated [MAP/DOCUMENT TYPE] character with folded paper texture,
expressive [EMOTION] cartoon face with [EYE COLOR] eyes,
full humanoid body — torso, arms, legs made of the document material,
visible [GEOGRAPHIC FEATURE/TEXT] on the body surface,
[LOCATION PIN/MARKER] visible on body,
walking on [ENVIRONMENT — sidewalk/street/office floor],
[BACKGROUND SETTING — suburban neighborhood/city/office],
Disney/Pixar 3D render, full body visible
— 9:16 vertical, ultra-realistic 3D animation, 8K
```

**Movimentos de câmera validados (Orlando):**
```
Shot 1 (0-8s): Wide shot, personagem andando pela calçada, câmera lateral
Shot 2 (8-16s): Medium shot seguindo, câmera ligeiramente abaixo (low angle)
Shot 3 (16-28s): Progressive zoom no rosto enquanto gesticula, câmera frontal
```

---

## Tipo E — RECIPE/TUTORIAL WITH MAGIC
*Referência real: Cravo-da-índia aromatizante*

**Características:**
- Personagem ENSINA algo (receita, dica, tutorial)
- Tom caloroso, alegre, entusiasmado — NÃO brava
- Efeitos visuais mágicos (partículas douradas, brilhos, aroma)
- Câmera: alternância entre personagem e ingredientes/resultado
- Humano ao fundo executando a receita

**Pipeline Fal.ai:**
```
FLUX.2 Pro (personagem + ingredientes/resultado)
  → Kling v2.1 (partículas douradas + animação corpo)
  → VEED Fabric (lip sync)
```

**Efeitos especiais:**
- Partículas douradas: geradas no Kling com prompt "golden sparkle particles floating upward"
- Aroma visual: ondas de calor/cor saindo do objeto
- Brilhos nos ingredientes: prompt "glowing magical light on [ingredient]"

---

## Perfis de Voz por Tipo de Personagem

| Tipo | MiniMax Voice ID | Emotion | Speed | Pitch | Quando usar |
|------|-----------------|---------|-------|-------|-------------|
| Stub Angry | Wise_Woman | angry | 1.15 | -1 | Casa, objetos bravos |
| Stub Furious | Wise_Woman | angry | 1.3 | -2 | Lixeira, escova — máxima raiva |
| Stub Alarmed | Gentle_Woman | fearful | 1.2 | +2 | Garrafa, urgência |
| Full Body Happy | Friendly_Person | cheerful | 1.0 | +1 | Cravo, tutorial feliz |
| Full Body Walking | Friendly_Person | neutral | 0.95 | 0 | Mapa, personagem que anda |
| Dressed Professional | Calm_Woman | neutral | 0.9 | -1 | Contrato, documento profissional |
| Recipe Tutorial | Lively_Girl | cheerful | 1.05 | +2 | Tutorial, dica, receita |
| Dramatic Resigned | Emotional_Female_Voice | sad | 0.85 | -2 | Nota R$50, personagens dramáticos |
