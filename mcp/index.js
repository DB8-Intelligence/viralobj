#!/usr/bin/env node
/**
 * ViralObj MCP Server
 * Talking Objects Content Generator — viralobj.com
 * Claude Code integration via Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { analyzeVideo } from "./tools/analyze.js";
import { generatePackage } from "./tools/generate.js";
import { generateVideo } from "./tools/generate_video.js";
import { downloadReel } from "./tools/download_reel.js";
import { exportArtifacts } from "./tools/export.js";
import { listNiches } from "./tools/niches.js";

const server = new Server(
  { name: "viralobj-mcp", version: "1.2.0" },
  { capabilities: { tools: {} } }
);

// ─── TOOLS LIST ────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_video",
      description:
        "Analyzes a .mp4 video file: extracts frames, detects Talking Object characters, identifies niche, format, expressions, and captions. Returns structured analysis ready for package generation. / Analisa um vídeo .mp4: extrai frames, detecta personagens Talking Object, identifica nicho, formato, expressões e legendas.",
      inputSchema: {
        type: "object",
        properties: {
          video_path: {
            type: "string",
            description: "Absolute path to the .mp4 video file",
          },
          lang: {
            type: "string",
            enum: ["pt", "en"],
            default: "pt",
            description: "Output language: pt = Portuguese, en = English",
          },
        },
        required: ["video_path"],
      },
    },
    {
      name: "generate_package",
      description:
        "Generates a complete Talking Object production package: scene script, AI prompts, voice script, captions, post copy, hashtags, and 3 variations. / Gera pacote completo de produção: roteiro, prompts AI, voz, legendas, post e variações.",
      inputSchema: {
        type: "object",
        properties: {
          niche: {
            type: "string",
            description:
              "Content niche (e.g. casa, plantas, financeiro, pets, fitness, saude, culinaria, natureza, maternidade, saude-mental, saude-receitas, frutas-drama)",
          },
          objects: {
            type: "array",
            items: { type: "string" },
            description:
              "List of talking objects to feature (e.g. ['água sanitária', 'celular', 'lixeira'])",
          },
          topic: {
            type: "string",
            description:
              "Main topic or message of the reel (e.g. 'erros de higiene doméstica')",
          },
          tone: {
            type: "string",
            enum: [
              "angry",
              "funny",
              "educational",
              "dramatic",
              "cute",
              "sarcastic",
            ],
            default: "angry",
            description: "Tone of the objects",
          },
          duration: {
            type: "number",
            enum: [15, 30, 45, 60],
            default: 30,
            description: "Target reel duration in seconds",
          },
          lang: {
            type: "string",
            enum: ["pt", "en", "both"],
            default: "both",
            description: "Output language",
          },
          analysis: {
            type: "object",
            description:
              "Optional: pass result from analyze_video to generate package based on real video analysis",
          },
          provider: {
            type: "string",
            enum: ["auto", "anthropic", "openai", "gemini"],
            default: "auto",
            description:
              "LLM provider routing: auto uses fallback order from VIRALOBJ_PROVIDER_ORDER",
          },
        },
        required: ["niche", "objects", "topic"],
      },
    },
    {
      name: "download_reel",
      description:
        "Downloads videos automatically from Instagram, TikTok, YouTube Shorts, Facebook and Twitter/X. Uses SnapInsta (Instagram), SSSTik (TikTok), yt-dlp and Cobalt as fallbacks. After download, triggers analyze_video automatically. / Baixa vídeos automaticamente do Instagram, TikTok, YouTube Shorts. Após download, aciona analyze_video automaticamente.",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "Full URL of the video (instagram.com/reel/, tiktok.com, youtube.com/shorts/, etc.)",
          },
          output_dir: {
            type: "string",
            description: "Output directory for the downloaded video (default: downloads/[platform]/)",
          },
          auto_analyze: {
            type: "boolean",
            default: true,
            description: "Automatically call analyze_video after download (default: true)",
          },
          lang: {
            type: "string",
            enum: ["pt", "en"],
            default: "pt",
            description: "Language for analysis output",
          },
        },
        required: ["url"],
      },
    },
    {
      name: "generate_video",
      description:
        "Generates the complete .mp4 video automatically via Fal.ai cloud APIs: character image (FLUX Pro v1.1) → voice narration (MiniMax TTS, tone per character) → lip sync (VEED Fabric). No manual work required. Requires FAL_KEY. / Gera o vídeo .mp4 completo automaticamente via Fal.ai: imagem do personagem → voz com tonalidade por personagem → lip sync. Sem trabalho manual.",
      inputSchema: {
        type: "object",
        properties: {
          package: {
            type: "object",
            description: "Production package from generate_package",
          },
          output_dir: {
            type: "string",
            description: "Output directory (default: ./outputs)",
          },
          quality: {
            type: "string",
            enum: ["draft", "standard", "premium"],
            default: "standard",
            description: "draft=$0.50/reel · standard=$2/reel · premium=$4/reel",
          },
          lang: {
            type: "string",
            enum: ["pt", "en"],
            default: "pt",
            description: "Language for voice narration",
          },
          caption_style: {
            type: "string",
            enum: ["bold_white", "minimal", "colorful"],
            default: "bold_white",
            description: "Caption visual style",
          },
          overrides: {
            type: "object",
            description: "Override voice tone per character. E.g.: { 'lixeira': 'furious', 'alface': 'resigned' }. Available tones: angry, furious, alarmed, resigned, sarcastic, educational, dramatic, funny, professional",
          },
        },
        required: ["package"],
      },
    },
    {
      name: "export_artifacts",
      description:
        "Exports the production package as: (1) interactive HTML dashboard and (2) installable SKILL.md for Claude Code. Both files are saved to the output directory. / Exporta o pacote como HTML interativo e SKILL.md instalável no Claude Code.",
      inputSchema: {
        type: "object",
        properties: {
          package: {
            type: "object",
            description: "Production package from generate_package",
          },
          output_dir: {
            type: "string",
            description:
              "Output directory path (default: ./outputs). The HTML and skill folder will be created here.",
          },
          slug: {
            type: "string",
            description:
              "File name slug (e.g. 'casa-limpeza'). Auto-generated from niche+topic if not provided.",
          },
        },
        required: ["package"],
      },
    },
    {
      name: "list_niches",
      description:
        "Lists all available niches with their pre-loaded object libraries and validated AI prompts. / Lista todos os nichos disponíveis com bibliotecas de objetos e prompts AI validados.",
      inputSchema: {
        type: "object",
        properties: {
          lang: {
            type: "string",
            enum: ["pt", "en"],
            default: "pt",
          },
        },
      },
    },
  ],
}));

// ─── TOOL HANDLERS ─────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "analyze_video":
        return await analyzeVideo(args);
      case "download_reel":
        return await downloadReel(args);
      case "generate_package":
        return await generatePackage(args);
      case "generate_video":
        return await generateVideo(args);
      case "export_artifacts":
        return await exportArtifacts(args);
      case "list_niches":
        return await listNiches(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// ─── START ──────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("ViralObj MCP Server v1.2.0 running — viralobj.com");
