---
name: reel-downloader
version: 2.0
description: "Faz download de vídeos do Instagram, TikTok, YouTube Shorts e outras redes a partir de um link. Após o download, integra automaticamente com viralobj-reverse-engineer para engenharia reversa completa e generate_package do MCP viralobj para geração do pacote de produção. Use para: baixar reel, analisar link, extrair frames, recriar talking object, blueprint de vídeo. URLs: instagram.com/reel, instagram.com/p, tiktok.com, youtube.com/shorts, fb.watch."
---

# Reel Downloader v2.0 — ViralObj Integration

Download de vídeos de redes sociais + pipeline automático de análise ViralObj.

```
LINK  →  DOWNLOAD  →  FRAMES  →  REVERSE ENGINEER  →  PACOTE COMPLETO
```

---

## Fluxo Principal

```
PASSO 1 → Detectar plataforma e tipo de link
PASSO 2 → Tentar download via yt-dlp (automático)
PASSO 3 → Se falhar → guiar download manual (30 segundos)
PASSO 4 → Extrair frames + áudio com ffmpeg
PASSO 5 → Engenharia reversa com viralobj-reverse-engineer
PASSO 6 → Gerar pacote completo via MCP viralobj
PASSO 7 → (Opcional) Postagem automática no Instagram
```

---

## PASSO 1 — Detectar plataforma

| URL | Plataforma | Notas |
|-----|-----------|-------|
| instagram.com/reel/ | Instagram Reel | Requer cookies ou manual |
| instagram.com/p/ | Instagram Post | Requer cookies ou manual |
| tiktok.com/@.../video/ | TikTok | yt-dlp funciona bem |
| vm.tiktok.com/ | TikTok short | Redireciona automaticamente |
| youtube.com/shorts/ | YouTube Shorts | yt-dlp funciona perfeitamente |
| youtu.be/ ou youtube.com/watch | YouTube | yt-dlp funciona |
| fb.watch/ ou facebook.com/reel | Facebook | Requer cookies |
| twitter.com ou x.com | X/Twitter | yt-dlp funciona |

---

## PASSO 2 — Download automático via yt-dlp

```bash
# Verificar disponibilidade
if command -v yt-dlp &> /dev/null; then
  echo "YT-DLP_AVAILABLE"
else
  pip install yt-dlp --break-system-packages -q 2>&1 | tail -2
fi
```

Se disponível:

```bash
URL="[URL_DO_USUARIO]"
OUT="/tmp/viralobj_download_$(date +%s).mp4"

yt-dlp \
  --no-playlist \
  --format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
  --merge-output-format mp4 \
  --output "$OUT" \
  --no-warnings \
  --quiet \
  "$URL"

if [ -f "$OUT" ]; then
  echo "DOWNLOAD_OK: $OUT"
else
  echo "DOWNLOAD_FAILED — proceeding to manual"
fi
```

---

## PASSO 3 — Download manual guiado (fallback)

Quando o download automático falhar (Instagram bloqueia sem cookies), apresente:

> O Instagram bloqueia downloads diretos por segurança.
> É rápido — escolha uma opção abaixo:

**Opção A — SnapInsta (Instagram) · Mais fácil**
1. Acesse **snapinsta.app**
2. Cole o link do reel → Download → HD
3. Suba o `.mp4` aqui no chat

**Opção B — SSSTik (TikTok) · Sem marca d'água**
1. Acesse **ssstik.io**
2. Cole o link → Download without watermark

**Opção C — Y2Mate (YouTube Shorts)**
1. Acesse **y2mate.com**
2. Cole o link → MP4 720p ou 1080p

**Opção D — Extensão Chrome**
- "Video DownloadHelper" ou "Instagram Downloader"
- Clique com botão direito no vídeo → Salvar

> Assim que subir o arquivo, processo tudo automaticamente!

---

## PASSO 4 — Extrair frames e áudio

```python
import subprocess, os

video_path = "[CAMINHO_DO_VIDEO]"

# Metadados
result = subprocess.run([
    "ffprobe", "-v", "error",
    "-show_entries", "format=duration,size",
    "-show_entries", "stream=width,height,codec_name,codec_type",
    "-of", "default", video_path
], capture_output=True, text=True)
print(result.stdout)

# Duração
dur_result = subprocess.run([
    "ffprobe", "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    video_path
], capture_output=True, text=True)
duration = float(dur_result.stdout.strip() or "30")

# Frames estratégicos — cobertura uniforme
frames_dir = f"/tmp/viralobj_frames_{os.path.basename(video_path)}"
os.makedirs(frames_dir, exist_ok=True)

# Pontos de extração: 0% até 97% em 12 pontos
pcts = [0, 0.07, 0.15, 0.22, 0.30, 0.40, 0.50, 0.62, 0.72, 0.82, 0.90, 0.97]
extracted = []
for i, p in enumerate(pcts):
    ts = round(duration * p, 2)
    out = f"{frames_dir}/frame_{i+1:02d}.jpg"
    r = subprocess.run([
        "ffmpeg", "-ss", str(ts), "-i", video_path,
        "-vframes", "1", "-q:v", "2", out, "-y", "-loglevel", "quiet"
    ], capture_output=True)
    if os.path.exists(out):
        extracted.append({"path": out, "timestamp": ts, "index": i+1})
        print(f"  Frame {i+1:02d} @ {ts}s ✓")

# Áudio para transcrição
audio_path = f"{frames_dir}/audio.wav"
subprocess.run([
    "ffmpeg", "-i", video_path,
    "-ar", "16000", "-ac", "1", "-vn",
    audio_path, "-y", "-loglevel", "quiet"
], capture_output=True)

print(f"\n✅ {len(extracted)} frames + áudio extraídos")
print(f"   Frames: {frames_dir}/")
print(f"   Áudio:  {audio_path}")
```

---

## PASSO 5 — Engenharia reversa automática

Após extrair os frames, chamar automaticamente a skill `viralobj-reverse-engineer`:

```
Leia: /mnt/skills/user/viralobj-reverse-engineer/SKILL.md
Leia: /mnt/skills/user/viralobj-reverse-engineer/references/01-frame-analysis.md

Analise os frames extraídos e preencha a ficha completa:
- Formato detectado (MULTI-STUB / SINGLE-FULL / DRESSED-CHAR / MAP-DOC / RECIPE-MAGIC)
- Nicho
- Personagem(ns) com tipo de corpo
- Câmera
- Legendas detectadas por frame
- Efeitos especiais
- Trilha sonora
- Capa/thumbnail

Em seguida, gere o blueprint JSON completo seguindo:
/mnt/skills/user/viralobj-reverse-engineer/references/04-full-prompt-output.md
```

---

## PASSO 6 — Gerar pacote via MCP viralobj

Com o blueprint pronto, chamar o MCP:

```
Usando o MCP viralobj:

1. generate_package com:
   - niche: [nicho detectado]
   - objects: [personagens detectados]
   - topic: [tema identificado]
   - tone: [tom detectado]
   - duration: [duração do vídeo]
   - lang: "both"
   - analysis: [resultado da engenharia reversa]

2. export_artifacts para gerar HTML dashboard + skill instalável
```

---

## PASSO 7 — Postagem automática (opcional)

Perguntar ao usuário após gerar o pacote:

```
✅ Pacote gerado com sucesso!

Deseja:
A) Gerar o vídeo automaticamente via Fal.ai
B) Postar no Instagram agora
C) Agendar postagem
D) Apenas salvar o pacote

(Responda A, B, C ou D)
```

Se B ou C → usar MCP `post_to_instagram` com:
```
- video_url: URL do vídeo gerado
- caption_pt + caption_en do pacote
- hashtags_pt + hashtags_en
- schedule_time (se C)
```

---

## Plataformas suportadas

| Plataforma | Download auto | Qualidade | Notas |
|-----------|--------------|----------|-------|
| Instagram Reels | ⚠️ Precisa cookies | 720p/1080p | Usar manual na maioria dos casos |
| Instagram Posts | ⚠️ Precisa cookies | Nativa | Mesma situação |
| TikTok | ✅ yt-dlp funciona | 720p/1080p | Sem marca d'água com ssstik |
| YouTube Shorts | ✅ Perfeito | 1080p | Melhor opção para auto |
| YouTube | ✅ Perfeito | 4K | yt-dlp completo |
| Facebook Reels | ⚠️ Precisa cookies | 720p | Manual recomendado |
| X/Twitter | ✅ Funciona bem | 720p | yt-dlp estável |

---

## Erros comuns e soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `robots.txt blocked` | Plataforma bloqueia | PASSO 3 — download manual |
| `yt-dlp not found` | Não instalado | `pip install yt-dlp --break-system-packages` |
| `No internet in container` | Rede isolada | PASSO 3 direto |
| `File too large >50MB` | Vídeo longo | Pedir versão comprimida |
| `Not MP4 format` | Formato diferente | `ffmpeg -i input.xxx output.mp4` |
| `Private video` | Conta privada | Não é possível baixar — pedir upload manual |

---

## Integração com o ecossistema ViralObj

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
  │     └── post_to_instagram     (Graph API)
  │
  └── dataset.json               (alimenta o treinamento)
```
