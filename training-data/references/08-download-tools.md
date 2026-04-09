# Módulo 8 — Ferramentas de Download por Plataforma

## Estratégia por Plataforma (NexoPro Dashboard)

### YouTube / YouTube Shorts

**Frames gratuitos sem download (via API pública):**
```
https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg  ← capa HD
https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg      ← alta qualidade
https://img.youtube.com/vi/{VIDEO_ID}/0.jpg              ← frame 0 (capa)
https://img.youtube.com/vi/{VIDEO_ID}/1.jpg              ← frame 25%
https://img.youtube.com/vi/{VIDEO_ID}/2.jpg              ← frame 50%
https://img.youtube.com/vi/{VIDEO_ID}/3.jpg              ← frame 75%
```

**Metadados via oEmbed (sem autenticação):**
```
GET https://www.youtube.com/oembed?url={URL_ENCODED}&format=json
→ title, author_name, thumbnail_url, width, height
```

**Transcrição/Legendas:**
```
GET https://www.youtube.com/api/timedtext?lang=pt&v={VIDEO_ID}
GET https://www.youtube.com/api/timedtext?lang=en&v={VIDEO_ID}
→ XML com timestamps e texto
```

**Download (quando db8-agent tem yt-dlp):**
```bash
yt-dlp \
  --format "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
  --merge-output-format mp4 \
  -o "/tmp/yt_video.mp4" \
  "URL"
```

---

### Instagram (Reels e Posts)

**Metadados via oEmbed (posts públicos):**
```
GET https://api.instagram.com/oembed?url={URL_ENCODED}
→ thumbnail_url, title, author_name
Nota: alguns endpoints foram deprecados, tentar graph.instagram.com/oembed
```

**Download manual (mais confiável):**
| Ferramenta | URL | Qualidade |
|---|---|---|
| SnapInsta | snapinsta.app | HD |
| SaveInsta | saveinsta.app | HD |
| DownloadGram | downloadgram.org | HD |

**Download via yt-dlp (com cookies do browser):**
```bash
yt-dlp --cookies-from-browser chrome \
  --format "bestvideo+bestaudio/best" \
  --merge-output-format mp4 \
  -o "/tmp/ig_reel.mp4" "URL"
```

---

### TikTok

**oEmbed (público):**
```
GET https://www.tiktok.com/oembed?url={URL_ENCODED}
→ thumbnail_url, title, author_name, duration
```

**Download sem marca d'água:**
```bash
yt-dlp --format "bestvideo+bestaudio/best" \
  --merge-output-format mp4 \
  -o "/tmp/tiktok.mp4" "URL"
```

| Ferramenta | URL | Watermark |
|---|---|---|
| SSSTik | ssstik.io | ❌ sem |
| SnapTik | snaptik.app | ❌ sem |
| TikMate | tikmate.online | ❌ sem |

---

### Facebook / Reels

**Download:**
```bash
yt-dlp --format "best" -o "/tmp/fb_reel.mp4" "URL"
```

| Ferramenta | URL |
|---|---|
| FBDown | fbdown.net |
| GetFVid | getfvid.com |

---

## Processamento com ffmpeg (disponível no db8-agent)

```bash
# Verificar metadados do arquivo
ffprobe -v error \
  -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_name,width,height,codec_type \
  -of json video.mp4

# Extrair frames inteligentes (baseado na duração)
DURATION=$(ffprobe -v error -show_entries format=duration \
  -of default=noprint_wrappers=1:nokey=1 video.mp4)

# 10 frames distribuídos
ffmpeg -i video.mp4 -vf "fps=1/${dur/10}" \
  -vframes 10 /tmp/frames/frame_%02d.jpg -y

# Extrair áudio para transcrição
ffmpeg -i video.mp4 -ar 16000 -ac 1 -vn /tmp/audio.wav -y

# Comprimir para análise (se >50MB)
ffmpeg -i video.mp4 -vf scale=720:-2 -crf 28 -c:a aac output_compressed.mp4
```

---

## Endpoint a adicionar no db8-agent (Railway)

Para suporte completo de download + frame extraction, adicionar ao Python/FastAPI:

```python
# POST /extract-frames
# Body: { "url": "URL_DO_VIDEO_OU_DIRETO", "n_frames": 10 }
# Returns: { "frames": [base64_jpg, ...], "duration": float, "metadata": {} }

@app.post("/extract-frames")
async def extract_frames(req: ExtractFramesRequest):
    # 1. yt-dlp download
    # 2. ffprobe metadata
    # 3. ffmpeg frame extraction
    # 4. Return frames as base64
    pass
```

---

## Limites por plano

| Plano | Links/dia | Upload máx | Resolução análise |
|-------|-----------|------------|-------------------|
| pro | 10 | 50MB | Thumbnails + oEmbed |
| pro_plus | 30 | 100MB | Thumbnails + Frames via db8 |
| pro_max | ilimitado | 200MB | Full + Auto-post |
| enterprise | ilimitado | ilimitado | Full + Priority |