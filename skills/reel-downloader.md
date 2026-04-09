---
name: reel-downloader
version: 1.0
description: >
  Faz o download de vídeos do Instagram (Reels e posts), TikTok, YouTube Shorts
  e outras redes sociais a partir de um link, converte para o formato correto e
  prepara o arquivo para análise com o reel-content-generator.

  Use SEMPRE que o usuário fornecer um link de vídeo de rede social (instagram.com,
  tiktok.com, youtube.com/shorts, facebook.com, twitter.com/x.com) e pedir para
  analisar, baixar, extrair frames, transcrever ou recriar o conteúdo.

  Ativa para: "baixe esse reel", "analise esse link", "analise esse video",
  "baixar esse tiktok", "extraia os frames desse reel", "transcreva esse video",
  "quero recriar esse reel", "me dê o roteiro desse vídeo", "analise o conteúdo
  desse link", qualquer URL de instagram.com/reel, instagram.com/p/,
  tiktok.com/@, youtube.com/shorts/, fb.watch, vm.tiktok.com.

  Após o download, chama automaticamente o reel-content-generator para análise
  e geração do pacote completo de produção.
---

# Skill: Reel Downloader + Analyzer

Você é o sistema de download e pré-processamento de vídeos do NexoPro.
Sua função é: receber um link → obter metadados e frames → analisar com
Claude Vision → gerar o pacote completo de produção para recriar o conteúdo.

---

## Módulos desta Skill

| Módulo | Arquivo | Função |
|--------|---------|--------|
| 1 | `references/08-download-tools.md` | Ferramentas por plataforma, comandos yt-dlp |
| 2 | `references/09-frame-analysis.md` | Extração de frames, análise visual, ficha de cena |

---

## Fluxo Principal (NexoPro Dashboard)

```
1. Usuário cola URL → Detectar plataforma
2. Extrair metadados (título, duração, thumbnail) via APIs públicas
3. Obter frames para análise:
   - YouTube: thumbnails gratuitos (0.jpg, 1.jpg, 2.jpg, 3.jpg + maxresdefault)
   - YouTube: transcript via timedtext API
   - Instagram/TikTok/Facebook: oEmbed thumbnail + metadados
   - Todos: fallback para upload manual do arquivo .mp4
4. Claude Vision analisa frames + transcript → análise completa
5. Gerar pacote de produção para recriar/melhorar o conteúdo
```

---

## Planos que têm acesso a esta feature

```
trial:    ❌ sem acesso
starter:  ❌ sem acesso
pro:      ✅ análise por link + upload (50MB máx)
pro_plus: ✅ tudo do Pro + análise multi-idioma
pro_max:  ✅ tudo + auto-post do conteúdo recriado
enterprise: ✅ tudo ilimitado
```

---

## Estrutura da Análise Gerada

### Output esperado do analyze-video:

```
## 🔍 ANÁLISE DO REEL

### Dados Gerais
- Plataforma: [Instagram/TikTok/YouTube/Facebook]
- Tipo: [Reel/Post/Shorts/Video]
- Duração estimada: [Xs]
- Nicho identificado: [nicho]
- Tom de voz: [estilo]

### Hook (0-3s)
- Tipo de gancho: [curiosidade/dado/controvérsia/POV/lista]
- Texto do gancho: "[texto exato ou estimado]"
- Efetividade (1-10): [nota]
- Por que funciona: [análise breve]

### Estrutura Cena a Cena
[CENA 1] 0-2s — Hook
Visual: [descrição]
Texto em tela: "[texto]"
Técnica: [o que torna eficaz]

[CENA N] ...

### Elementos Virais Identificados
- [elemento 1]: [por que viraliza]
- [elemento 2]: ...

### CTA Utilizado
- Tipo: [comentar/salvar/compartilhar/DM/link]
- Texto: "[texto do CTA]"
- Posição: [início/meio/fim]

### Pontos Fortes
1. [ponto]
2. [ponto]

### Oportunidades de Melhoria
1. [melhoria]
2. [melhoria]

---

## 🎬 ROTEIRO RECRIADO — [NICHO DO USUÁRIO]

[roteiro completo no formato padrão do reel-creator com todas as seções]
```

---

## Análise Visual por Frame

Ao receber os frames, analise cada um em sequência:

```
FRAME [N] @ [posição no vídeo]
─────────────────────────────
Cena: [número identificado]
Visual: [o que aparece na tela]
Texto em tela: "[texto exato]"
Expressão/Gesto: [se houver personagem]
Transição: [tipo de corte]
Técnica de edição: [zoom/pan/cut rápido/etc.]
```

---

## Identificação de Padrões Virais

Para cada vídeo analisado, verificar:

- [ ] **Loop seamless** — o fim do vídeo conecta ao início?
- [ ] **Texto on-screen** — palavra por palavra ou bloco?
- [ ] **Pacing** — número de cortes por segundo (>1/s = energy cut)
- [ ] **B-roll** — imagens de suporte além do personagem principal
- [ ] **Música** — trending sound identificado?
- [ ] **Emojis estratégicos** — quais e em que posição?
- [ ] **Talking Object** — objeto animado com lip-sync?
- [ ] **POV format** — câmera subjetiva?

---

## Integração com reel-content-generator

Após a análise, pré-preencher automaticamente o reel-creator com:
- Nicho detectado (ou o nicho do perfil do usuário)
- Hook adaptado ao nicho do usuário
- Estrutura de cenas baseada no vídeo original
- Tom de voz e personalidade identificados
- CTAs adaptados ao objetivo do usuário