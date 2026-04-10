# Módulo 04 — Output JSON Unificado para Fal.ai + Instagram

## Estrutura completa do blueprint gerado pela engenharia reversa

```json
{
  "meta": {
    "source_video": "nome_do_arquivo.mp4",
    "duration_seconds": 30,
    "format_type": "MULTI-STUB | SINGLE-FULL | DRESSED-CHAR | MAP-DOC | RECIPE-MAGIC",
    "niche": "casa | plantas | financeiro | fitness | ...",
    "body_type": "A | B | C | D | E",
    "caption_style": "alpha_bold | beta_pill",
    "camera_style": "static | follow | zoom-in | mixed",
    "reverse_engineered_at": "ISO timestamp",
    "estimated_cost_usd": "$2.50"
  },

  "characters": [
    {
      "id": 1,
      "name_pt": "nome do personagem",
      "name_en": "character name",
      "emoji": "🗑️",
      "body_type": "A",
      "timestamp_start": "0s",
      "timestamp_end": "10s",

      "visual": {
        "flux_prompt": "Full FLUX.2 Pro prompt in English — 9:16 vertical, Pixar 3D...",
        "kling_prompt": "Animation prompt for body movement if body_type B/C/D",
        "environment": "specific scene description",
        "lighting": "golden hour | cool bathroom | warm kitchen | dramatic",
        "special_effects": ["golden particles", "dripping liquid", "floating bacteria"],
        "camera_movement": "static | zoom-in to face | tracking follow"
      },

      "voice": {
        "minimax_voice_id": "Wise_Woman",
        "emotion": "angry | cheerful | sad | fearful | neutral",
        "speed": 1.15,
        "pitch": -1,
        "language": "pt-BR",
        "script_pt": "roteiro completo PT-BR com [pausa] [ÊNFASE] [pausa longa]",
        "script_en": "full script EN with [pause] [EMPHASIS] [long pause]"
      },

      "captions": [
        {
          "time": "0s",
          "text_pt": "TEXTO DA LEGENDA",
          "text_en": "CAPTION TEXT",
          "style": "alpha_bold | beta_pill",
          "color_primary": "#FFFFFF",
          "color_highlight": "#FFE500",
          "position": "center-bottom"
        }
      ]
    }
  ],

  "production": {
    "sound_effects": [
      { "time": "0s", "effect": "swoosh", "description": "entrada do personagem" },
      { "time": "5s", "effect": "pop", "description": "revelação de informação" },
      { "time": "10s", "effect": "cut_transition", "description": "corte entre personagens" }
    ],
    "background_music": {
      "mood": "upbeat | dramatic | warm | mysterious | energetic",
      "bpm": 120,
      "style": "lo-fi | cinematic | pop | acoustic",
      "volume_db": -18,
      "suggested_track": "nome da música royalty-free sugerida",
      "freemusicarchive_query": "query para buscar no FMA"
    },
    "scene_transitions": "direct_cut | fade | swipe",
    "thumbnail": {
      "flux_prompt": "Prompt para gerar a capa do reel — frame mais impactante do personagem",
      "text_overlay": "texto que vai na capa",
      "style": "bold_title | minimal | dramatic"
    }
  },

  "instagram": {
    "caption_pt": "texto completo do post em português com emojis e CTA",
    "caption_en": "full post text in English with emojis and CTA",
    "hashtags_pt": ["#tag1", "...25 tags"],
    "hashtags_en": ["#tag1", "...20 tags"],
    "post_type": "reel",
    "share_to_stories": true,
    "schedule": {
      "post_now": false,
      "scheduled_time": "ISO datetime",
      "timezone": "America/Sao_Paulo"
    },
    "graph_api": {
      "endpoint": "POST /me/media",
      "fields": {
        "media_type": "REELS",
        "video_url": "URL do vídeo final gerado",
        "caption": "caption + hashtags",
        "thumb_offset": 2000,
        "share_to_feed": true
      }
    }
  },

  "fal_pipeline": {
    "step_1_image": {
      "model": "fal-ai/flux-pro/v1.1",
      "per_character": true
    },
    "step_2_tts": {
      "model": "fal-ai/minimax-tts/text-to-speech",
      "per_character": true
    },
    "step_3_body_animation": {
      "model": "fal-ai/kling-video/v2.1/standard/image-to-video",
      "only_if_body_type": ["B", "C", "D"]
    },
    "step_4_lipsync": {
      "model": "veed/fabric-1.0",
      "fallback": "fal-ai/musetalk"
    },
    "step_5_effects": {
      "model": "fal-ai/kling-video/v2.1/standard/image-to-video",
      "only_if_special_effects": true
    },
    "step_6_concat": {
      "method": "capcut_import | creatomate_api | manual",
      "caption_overlay": true,
      "music_overlay": true
    }
  }
}
```

## Como passar para o MCP generate_video

```javascript
// No Claude Code:
const blueprint = /* resultado da engenharia reversa */;

// Converter blueprint para formato do generate_video:
const videoRequest = {
  package: {
    meta: blueprint.meta,
    characters: blueprint.characters.map(c => ({
      ...c,
      ai_prompt_midjourney: c.visual.flux_prompt,
      ai_prompt_kling: c.visual.kling_prompt,
      voice_script_pt: c.voice.script_pt,
      voice_script_en: c.voice.script_en,
      captions: c.captions,
    })),
    production: blueprint.production,
  },
  output_dir: "./outputs",
  quality: "standard",
  lang: "pt",
  overrides: blueprint.characters.reduce((acc, c) => {
    acc[c.name_pt] = c.voice.emotion;
    return acc;
  }, {}),
};

// Chamar o MCP:
// "Generate video from this blueprint"
```
