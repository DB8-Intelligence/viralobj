# Módulo 05 — Instagram Postagem Automática

## Setup necessário (já configurado no NexoOmnix)

```
Facebook App → Instagram Graph API
  ├── App ID
  ├── App Secret
  ├── Instagram Business Account ID
  └── Long-lived Access Token (60 dias)
```

Variáveis de ambiente (Railway db8-agent):
```
INSTAGRAM_ACCESS_TOKEN=...
INSTAGRAM_ACCOUNT_ID=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

---

## Fluxo de Postagem Automática

### PASSO 1 — Upload do container (vídeo)

```javascript
// POST /me/media → criar container
const container = await fetch(
  `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media`,
  {
    method: "POST",
    body: JSON.stringify({
      media_type: "REELS",
      video_url: VIDEO_URL,          // URL pública do vídeo final
      caption: caption + "\n\n" + hashtags,
      thumb_offset: 2000,            // thumbnail no segundo 2
      share_to_feed: true,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  }
);
const { id: containerId } = await container.json();
```

### PASSO 2 — Verificar status do container

```javascript
// Aguardar até status = FINISHED
let status = "IN_PROGRESS";
while (status !== "FINISHED") {
  await sleep(5000);
  const check = await fetch(
    `https://graph.facebook.com/v21.0/${containerId}?fields=status_code`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );
  const data = await check.json();
  status = data.status_code;
  if (status === "ERROR") throw new Error("Container upload failed");
}
```

### PASSO 3 — Publicar

```javascript
// POST /me/media_publish
const publish = await fetch(
  `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media_publish`,
  {
    method: "POST",
    body: JSON.stringify({ creation_id: containerId }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  }
);
const { id: mediaId } = await publish.json();
console.log(`✅ Published: https://www.instagram.com/reel/${mediaId}`);
```

---

## Agendamento (publicação futura)

```javascript
// Adicionar scheduled_publish_time ao container
const scheduledTime = Math.floor(new Date("2026-04-10T18:00:00-03:00").getTime() / 1000);

const container = await fetch(`https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media`, {
  method: "POST",
  body: JSON.stringify({
    media_type: "REELS",
    video_url: VIDEO_URL,
    caption: caption,
    published: false,                        // não publicar ainda
    scheduled_publish_time: scheduledTime,   // quando publicar
  }),
});
```

---

## Melhores horários por nicho (PT-BR)

| Nicho | Melhor horário | Dias |
|-------|---------------|------|
| Casa/Limpeza | 18h–21h | Seg, Qua, Sex |
| Plantas | 7h–9h ou 19h–21h | Ter, Qui, Sáb |
| Financeiro | 12h–14h ou 18h–20h | Seg–Sex |
| Fitness | 6h–8h ou 17h–19h | Todos |
| Pets | 19h–21h | Sex, Sáb, Dom |
| Culinária | 11h–13h ou 17h–19h | Qua, Sex, Dom |

---

## Caption Template Multi-nicho

```
PT-BR:
{hook_pt}

{body_pt}

{cta_pt}

.
.
.
{hashtags_pt}

---

EN (nos primeiros comentários ou segunda legenda):
{hook_en}
{cta_en}
{hashtags_en}
```

---

## Compartilhar nos Stories automaticamente

```javascript
// Após publicar no feed, republicar nos Stories
const storyContainer = await fetch(
  `https://graph.facebook.com/v21.0/${ACCOUNT_ID}/media`,
  {
    method: "POST",
    body: JSON.stringify({
      media_type: "STORIES",
      video_url: VIDEO_URL,
    }),
  }
);
```

---

## Estrutura do MCP tool post_to_instagram

```javascript
export async function postToInstagram({
  video_url,
  caption_pt,
  caption_en,
  hashtags_pt,
  hashtags_en,
  schedule_time = null,  // ISO string or null for immediate
  share_to_stories = true,
  thumbnail_url = null,
}) {
  // Monta caption completo
  const caption = [
    caption_pt,
    "",
    hashtags_pt.join(" "),
    "",
    "---",
    "",
    caption_en,
    hashtags_en.join(" "),
  ].join("\n");

  // Upload + publish
  const containerId = await uploadContainer(video_url, caption, schedule_time, thumbnail_url);
  await waitForContainer(containerId);
  const mediaId = await publishContainer(containerId);

  if (share_to_stories) {
    await shareToStories(video_url);
  }

  return {
    media_id: mediaId,
    url: `https://www.instagram.com/reel/${mediaId}`,
    scheduled: !!schedule_time,
  };
}
```
