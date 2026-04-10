---
name: viralobj-reverse-engineer
version: 1.0
description: >
  Engenharia reversa completa de vídeos Talking Object virais. Analisa frame a frame,
  detecta todos os elementos de produção (personagem, corpo, câmera, expressões, legendas,
  efeitos, música, lip sync) e gera o blueprint completo para recriar ou superar o vídeo.
  Saída: prompt FLUX.2 Pro, roteiro de cenas, movimentações de câmera, script de voz com
  tons, efeitos sonoros, trilha, legendas estilizadas, capa do reel e instrução de postagem.

  Use SEMPRE para: "faça engenharia reversa desse vídeo", "como foi feito esse reel",
  "recrie esse talking object", "analise esse vídeo falante", "blueprint desse reel",
  "como reproduzir esse estilo", "decompõe esse vídeo", qualquer .mp4 enviado com
  personagem animado 3D, talking object, objeto falante ou personagem Pixar.

  Integra com: instagram-viral-engine (estratégia), reel-content-generator (pacote),
  viralobj MCP (geração automática via Fal.ai).

  Formatos detectados: multi-objeto stub arms · single char corpo completo ·
  personagem com roupa · mapa/documento animado · tutorial com partículas
---

# ViralObj Reverse Engineer

Motor de engenharia reversa de reels Talking Object.
Analisa vídeos reais e gera o blueprint completo de reprodução.

## Formatos Catalogados (baseado em análise real)

| ID | Formato | Exemplo detectado | Tipo de corpo |
|----|---------|------------------|---------------|
| MULTI-STUB | Multi-objeto stub arms | @coisadecasa.ia casa/plantas | Braços curtos, sem pernas |
| SINGLE-FULL | Single char corpo completo | Cravo-da-índia tutorial | Tronco + pernas, anda |
| DRESSED-CHAR | Personagem com roupa | Financiamento imobiliário | Corpo humano, cabeça = objeto |
| MAP-DOC | Mapa/documento animado | Mapa da Flórida Orlando | Corpo + pernas + zoom facial |
| RECIPE-MAGIC | Tutorial com partículas | Cravo aromatizante | Partículas douradas animadas |

## Módulos

| Módulo | Função | Arquivo |
|--------|--------|---------|
| 01-frame-analysis.md | Extração e análise frame a frame | references/01-frame-analysis.md |
| 02-character-blueprint.md | Blueprint do personagem (corpo, expressão, prompt) | references/02-character-blueprint.md |
| 03-production-blueprint.md | Câmera, efeitos, música, legendas, capa | references/03-production-blueprint.md |
| 04-full-prompt-output.md | Prompt completo unificado para Fal.ai | references/04-full-prompt-output.md |
| 05-instagram-post.md | Caption, hashtags, postagem automática | references/05-instagram-post.md |

## Fluxo de Execução

```
INPUT: vídeo .mp4 ou frames
  ↓
[01] ANÁLISE DE FRAMES
     → Detectar: formato, personagem(ns), tipo de corpo, duração
     → Extrair: legendas visíveis, expressões, cenário, câmera
  ↓
[02] BLUEPRINT DO PERSONAGEM
     → Nome, nicho, personalidade, tom de voz
     → Tipo de corpo: A (stub) / B (full body) / C (dressed) / D (map-doc)
     → Prompt FLUX.2 Pro completo por personagem
     → Perfil de voz MiniMax TTS (emoção, velocidade, tom)
  ↓
[03] BLUEPRINT DE PRODUÇÃO
     → Roteiro cena a cena com timecodes
     → Movimentos de câmera (zoom, pan, follow, close-up)
     → Efeitos visuais (partículas, brilhos, sombras, motion blur)
     → Trilha sonora (BPM, mood, estilo — royalty-free sugerido)
     → Efeitos sonoros por cena (swish, pop, click, ambient)
     → Legendas: estilo, fonte, cor, posição, pill/cápsula vs bold
     → Capa do reel (thumbnail prompt)
  ↓
[04] PROMPT COMPLETO UNIFICADO
     → JSON pronto para passar ao generate_video MCP
     → Inclui overrides de voz por personagem
  ↓
[05] POSTAGEM INSTAGRAM
     → Caption bilíngue PT + EN
     → Hashtags estratificadas (25 PT + 20 EN)
     → Agendamento ou postagem imediata via Graph API
```

## Regras de Análise

1. **Tipo de corpo**: determina qual pipeline Fal.ai usar
   - STUB → FLUX.2 Pro static + Fabric lip sync
   - FULL BODY → FLUX.2 Pro + Kling image-to-video (animação de corpo)
   - DRESSED → FLUX.2 Pro (personagem vestido) + Kling + Fabric
   - MAP-DOC → FLUX.2 Pro + Kling (walking animation) + zoom facial

2. **Legendas**: dois estilos detectados
   - **Estilo Alpha** (casa/plantas): bold branco, outline preto, centro-baixo
   - **Estilo Beta** (orlando/financial): pill branco com 2 cores (normal + destaque colorido)

3. **Câmera**: mapear movimento exato
   - Static: personagem parado, câmera fixa
   - Follow: câmera segue personagem andando
   - Zoom-in facial: começa wide, termina close no rosto
   - Mixed: combinação entre cenas

4. **Efeitos especiais detectados**:
   - Partículas douradas (cravo/bem-estar)
   - Bactérias animadas flutuando (celular)
   - Aranhas realistas (garrafa)
   - Liquid dripping (lixeira)
   - Motion trail (mapa andando)

## Referências Detalhadas

- `references/01-frame-analysis.md` — Protocolo de análise frame a frame
- `references/02-character-blueprint.md` — Templates de blueprint por tipo de corpo
- `references/03-production-blueprint.md` — Câmera, efeitos, trilha, legendas, capa
- `references/04-full-prompt-output.md` — Output JSON unificado para Fal.ai
- `references/05-instagram-post.md` — Caption, hashtags, Graph API postagem
