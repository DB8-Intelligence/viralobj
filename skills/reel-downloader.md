---
name: reel-downloader
version: 2.0
description: >
  Entry point do pipeline ViralObj. Baixa vídeos de redes sociais (Instagram, TikTok,
  YouTube Shorts), faz engenharia reversa completa via viralobj-reverse-engineer,
  gera o blueprint de reprodução, produz o vídeo via Fal.ai e opcionalmente posta
  no Instagram automaticamente.

  Use SEMPRE que o usuário: fornecer um link de vídeo, colar URL de reel/tiktok/shorts,
  pedir para baixar/analisar/recriar um vídeo, enviar um .mp4 para análise,
  dizer "baixe esse reel", "analise esse link", "recrie esse vídeo", "faça engenharia
  reversa desse reel", "como reproduzir esse estilo".

  Pipeline completo:
  download → analyze_video → reverse-engineer → generate_package → generate_video → post_to_instagram

  Integra com: viralobj-reverse-engineer (blueprint), viralobj MCP (6 tools), dataset.json (treinamento)
---

# Reel Downloader v2.0 — Pipeline Orchestrator

Entry point do ecossistema ViralObj. Conecta download → análise → blueprint → produção → publicação.

## Arquitetura

```
reel-downloader v2.0
  ↓
  ├── viralobj-reverse-engineer   (análise + blueprint)
  │     ├── 01-frame-analysis.md
  │     ├── 02-character-blueprint.md
  │     ├── 03-production-blueprint.md
  │     ├── 04-full-prompt-output.md
  │     └── 05-instagram-post.md
  │
  ├── MCP viralobj
  │     ├── analyze_video         (análise com Claude Vision)
  │     ├── generate_package      (pacote bilíngue PT+EN)
  │     ├── generate_video        (pipeline Fal.ai)
  │     ├── export_artifacts      (HTML dashboard + SKILL.md)
  │     ├── post_to_instagram     (Graph API)
  │     └── list_niches           (10 nichos, 72 objetos)
  │
  └── dataset.json               (alimenta o treinamento)
```

## Fluxo Principal

### MODO 1 — URL de Rede Social
```
1. DETECTAR PLATAFORMA
   Input: URL
   → instagram.com/reel/ | tiktok.com/@ | youtube.com/shorts/
   → Extrair metadados via oEmbed/API

2. DOWNLOAD
   → yt-dlp com cookies (se necessário)
   → Salvar em ./outputs/downloads/{slug}.mp4
   → Extrair metadados: duração, resolução, codec

3. ENGENHARIA REVERSA (viralobj-reverse-engineer)
   → Extrair frames via ffmpeg (8-14 frames estratégicos)
   → Análise frame a frame com Claude Vision
   → Detectar: formato, personagens, tipo de corpo, cenário
   → Gerar blueprint completo (04-full-prompt-output.md)

4. GERAR PACOTE (generate_package)
   → Usar blueprint como base + enriquecer com dataset.json
   → Pacote bilíngue PT + EN completo

5. GERAR VÍDEO (generate_video)
   → FLUX.2 Pro → MiniMax TTS → VEED Fabric
   → Pipeline Fal.ai automatizado

6. PUBLICAR (post_to_instagram) [opcional]
   → Graph API v21.0
   → Caption + hashtags + Stories

7. ATUALIZAR DATASET
   → Adicionar análise ao dataset.json
   → Novos prompts validados, expressões, combos
```

### MODO 2 — Arquivo .mp4 Local
```
1. Input: path do arquivo .mp4
2. Pular download → ir direto para ENGENHARIA REVERSA (passo 3)
3. Resto do pipeline idêntico
```

### MODO 3 — Briefing Manual (sem vídeo)
```
1. Input: nicho + objetos + tópico + tom
2. Pular download + engenharia reversa
3. Ir direto para generate_package (passo 4)
4. Resto do pipeline idêntico
```

---

## Download por Plataforma

### Instagram Reels
```bash
# Via yt-dlp (requer cookies para contas privadas)
yt-dlp --cookies-from-browser chrome \
  -o "./outputs/downloads/%(id)s.%(ext)s" \
  --write-info-json \
  --write-thumbnail \
  "https://www.instagram.com/reel/XXXXX/"

# Via oEmbed (metadados apenas — sem download)
curl "https://graph.facebook.com/v21.0/instagram_oembed?url=URL&access_token=TOKEN"
```

### TikTok
```bash
yt-dlp --cookies-from-browser chrome \
  -o "./outputs/downloads/%(id)s.%(ext)s" \
  --write-info-json \
  "https://www.tiktok.com/@user/video/XXXXX"
```

### YouTube Shorts
```bash
yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" \
  -o "./outputs/downloads/%(id)s.%(ext)s" \
  --write-info-json \
  --write-auto-sub --sub-lang pt,en \
  "https://youtube.com/shorts/XXXXX"

# Thumbnails gratuitas (sem download):
# https://img.youtube.com/vi/{VIDEO_ID}/0.jpg       (default)
# https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg (HD)
# https://img.youtube.com/vi/{VIDEO_ID}/1.jpg  2.jpg  3.jpg
```

### Fallback — Upload Manual
```
Se yt-dlp falhar ou URL não suportada:
→ Pedir ao usuário: "Me envie o arquivo .mp4 diretamente"
→ Ou: "Salve o vídeo em ~/viralobj/outputs/downloads/ e me diga o nome"
```

---

## Detecção de Plataforma

```javascript
function detectPlatform(url) {
  if (url.includes("instagram.com/reel") || url.includes("instagram.com/p/"))
    return { platform: "instagram", type: "reel" };
  if (url.includes("tiktok.com/") || url.includes("vm.tiktok.com"))
    return { platform: "tiktok", type: "video" };
  if (url.includes("youtube.com/shorts") || url.includes("youtu.be"))
    return { platform: "youtube", type: "shorts" };
  if (url.includes("fb.watch") || url.includes("facebook.com"))
    return { platform: "facebook", type: "reel" };
  if (url.includes("x.com") || url.includes("twitter.com"))
    return { platform: "x", type: "video" };
  return { platform: "unknown", type: "video" };
}
```

---

## Pipeline de Engenharia Reversa (após download)

### Passo 1 — Metadados + Frames
```bash
# Metadados
ffprobe -v error -show_entries format=duration,size \
  -show_entries stream=width,height,codec_name \
  -of json "$VIDEO"

# Frames estratégicos (timestamps: 0%, 7%, 15%, 22%, 30%, 40%, 50%, 65%, 75%, 85%, 93%, 97%)
ffmpeg -ss $TS -i "$VIDEO" -vframes 1 -q:v 2 "frame_$N.jpg"
```

### Passo 2 — Análise com Claude Vision
Usar `analyze_video` MCP tool → retorna JSON estruturado com:
- Formato detectado (MULTI-STUB, SINGLE-FULL, DRESSED-CHAR, MAP-DOC, RECIPE-MAGIC)
- Personagens com tipo de corpo, expressões, cenários
- Legendas transcritas
- Estilo visual e tom

### Passo 3 — Blueprint via viralobj-reverse-engineer
Aplicar os 5 módulos em sequência:
1. `01-frame-analysis.md` → ficha de análise preenchida
2. `02-character-blueprint.md` → prompt FLUX.2 Pro + perfil de voz por personagem
3. `03-production-blueprint.md` → câmera, SFX, música, legendas, capa
4. `04-full-prompt-output.md` → JSON unificado para Fal.ai
5. `05-instagram-post.md` → caption + hashtags + agendamento

### Passo 4 — Produção via MCP
```
generate_package(blueprint)  → pacote bilíngue
generate_video(package)      → clips .mp4 via Fal.ai
export_artifacts(package)    → HTML dashboard + SKILL.md
post_to_instagram(clips)     → publicação automática
```

---

## Atualização do Dataset

Após cada análise bem-sucedida, adicionar ao `training-data/dataset.json`:

```javascript
// Novos dados a incorporar:
{
  "validated_prompts": [/* prompts que geraram boas imagens */],
  "new_expressions": [/* expressões detectadas não catalogadas */],
  "new_combos": [/* combinações de objetos que funcionaram */],
  "format_detected": "MULTI-STUB", // formato catalogado
  "source_account": "@conta",
  "views_estimated": null, // se disponível
  "engagement_signals": ["high_retention", "many_comments"]
}
```

---

## Comandos Rápidos

| Comando do usuário | Pipeline ativado |
|-------------------|-----------------|
| "Baixe esse reel: [URL]" | Download → Análise → Blueprint |
| "Faça engenharia reversa desse vídeo" | Análise → Blueprint completo |
| "Analise e recrie esse reel" | Download → Análise → Package → Video |
| "Pipeline completo para esse reel" | Download → Análise → Package → Video → Instagram |
| "Analise esse .mp4: [path]" | Análise → Blueprint (sem download) |
| "Gere um reel de [nicho] com [objetos]" | Package → Video (sem análise) |

---

## Referências

- `viralobj-reverse-engineer/SKILL.md` — Motor de engenharia reversa
- `viralobj-reverse-engineer/references/01-05` — 5 módulos de análise
- `training-data/dataset.json` — Padrões validados
- `training-data/reel-references/GUIA-DE-ESTILOS.md` — Guia de estilos virais
- `training-data/references/01-09` — 9 módulos de referência do NexoOmnix
