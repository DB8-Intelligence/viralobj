/**
 * ViralObj — download_reel.js
 * Downloads videos from Instagram, TikTok, YouTube Shorts automatically.
 *
 * Strategy (in order of attempt):
 *   1. SnapInsta API  → Instagram (posts, reels, stories)
 *   2. SSSTik API     → TikTok (no watermark)
 *   3. yt-dlp         → YouTube Shorts + fallback for others
 *   4. Cobalt API     → universal fallback (cobalt.tools)
 *
 * After download → calls analyze_video automatically
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync, unlinkSync, statSync } from "fs";
import { join, dirname } from "path";
import { createWriteStream } from "fs";
import https from "https";
import http from "http";
import { getDownloadPath, ensureDirectories, PATHS } from "../paths.js";

// —— Platform detection ——————————————————————————————————————————————————

function detectPlatform(url) {
  if (/instagram\.com\/(reel|p|tv)\//i.test(url)) return "instagram";
  if (/tiktok\.com/i.test(url) || /vm\.tiktok\.com/i.test(url)) return "tiktok";
  if (/youtube\.com\/shorts\//i.test(url) || /youtu\.be\//i.test(url)) return "youtube";
  if (/facebook\.com\/(reel|watch)/i.test(url) || /fb\.watch/i.test(url)) return "facebook";
  if (/twitter\.com|x\.com/i.test(url)) return "twitter";
  return "unknown";
}

// —— HTTP helper ————————————————————————————————————————————————————————

function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const lib = options.protocol === "http:" ? http : https;
    const req = lib.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ status: res.statusCode, body, headers: res.headers }));
    });
    req.on("error", reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error("Request timeout")); });
    if (postData) req.write(postData);
    req.end();
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const file = createWriteStream(destPath);
    lib.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
        "Referer": "https://www.instagram.com/",
      },
      timeout: 60000,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        try { unlinkSync(destPath); } catch {}
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve(destPath)));
      file.on("error", (err) => { try { unlinkSync(destPath); } catch {} reject(err); });
    }).on("error", (err) => { try { unlinkSync(destPath); } catch {} reject(err); });
  });
}

// —— Strategy 1: SnapInsta API (Instagram) ——————————————————————————————

async function trySnapInsta(url, destPath) {
  const postData = `q=${encodeURIComponent(url)}&t=media&lang=pt`;

  const res = await httpRequest({
    hostname: "snapinsta.app",
    path: "/api/ajaxSearch",
    method: "POST",
    protocol: "https:",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
      "X-Requested-With": "XMLHttpRequest",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://snapinsta.app/",
      "Origin": "https://snapinsta.app",
    },
  }, postData);

  if (res.status !== 200) throw new Error(`SnapInsta HTTP ${res.status}`);

  const html = res.body;
  const cdnPatterns = [
    /href="(https:\/\/[^"]*\.cdninstagram\.com[^"]*\.mp4[^"]*)"/gi,
    /href="(https:\/\/scontent[^"]*\.mp4[^"]*)"/gi,
    /"url":"(https:\\\/\\\/[^"]*\.mp4[^"]*)"/gi,
    /download_link['":\s]+"(https[^"]+\.mp4[^"]*)/gi,
  ];

  let videoUrl = null;
  for (const pattern of cdnPatterns) {
    const match = pattern.exec(html);
    if (match) {
      videoUrl = match[1].replace(/\\\/\\\//g, "//").replace(/\\\//g, "/");
      break;
    }
  }

  if (!videoUrl) throw new Error("SnapInsta: no video URL found in response");
  console.error(`   SnapInsta CDN URL found: ${videoUrl.slice(0, 80)}...`);
  await downloadFile(videoUrl, destPath);
  return destPath;
}

// —— Strategy 2: SSSTik (TikTok) ————————————————————————————————————————

async function trySSSTik(url, destPath) {
  const step1 = await httpRequest({
    hostname: "ssstik.io",
    path: "/",
    method: "GET",
    protocol: "https:",
    headers: { "User-Agent": "Mozilla/5.0 Chrome/120" },
  });

  const tokenMatch = step1.body.match(/s_tt\s*=\s*['"]([^'"]+)['"]/);
  if (!tokenMatch) throw new Error("SSSTik: cannot get token");
  const token = tokenMatch[1];

  const postData = `id=${encodeURIComponent(url)}&locale=pt&tt=${token}`;
  const step2 = await httpRequest({
    hostname: "ssstik.io",
    path: "/abc?url=dl",
    method: "POST",
    protocol: "https:",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
      "User-Agent": "Mozilla/5.0 Chrome/120",
      "Referer": "https://ssstik.io/",
    },
  }, postData);

  const dlMatch = step2.body.match(/href="(https:\/\/[^"]*\.mp4[^"]*)"/i)
    || step2.body.match(/download\s+href="([^"]+)"/i);
  if (!dlMatch) throw new Error("SSSTik: no download URL found");
  await downloadFile(dlMatch[1], destPath);
  return destPath;
}

// —— Strategy 3: yt-dlp —————————————————————————————————————————————————

async function tryYtDlp(url, destPath) {
  try {
    execSync("python -m yt_dlp --version", { stdio: "pipe" });
  } catch {
    try {
      execSync("pip install yt-dlp --break-system-packages -q", { stdio: "pipe", timeout: 30000 });
    } catch {
      throw new Error("yt-dlp not installed and could not auto-install");
    }
  }

  execSync(
    `python -m yt_dlp --no-playlist ` +
    `--format "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" ` +
    `--merge-output-format mp4 ` +
    `--output "${destPath}" ` +
    `--no-warnings --quiet "${url}"`,
    { timeout: 60000, stdio: "pipe" }
  );

  if (!existsSync(destPath)) throw new Error("yt-dlp: output file not created");
  return destPath;
}

// —— Strategy 4: Cobalt API —————————————————————————————————————————————

async function tryCobalt(url, destPath) {
  const postData = JSON.stringify({ url, vQuality: "720", filenamePattern: "basic" });

  const res = await httpRequest({
    hostname: "api.cobalt.tools",
    path: "/",
    method: "POST",
    protocol: "https:",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
      "Accept": "application/json",
      "User-Agent": "ViralObj/1.0 (viralobj.com)",
    },
  }, postData);

  const data = JSON.parse(res.body);
  if (!data.url) throw new Error(`Cobalt: ${data.error || "no URL returned"}`);
  await downloadFile(data.url, destPath);
  return destPath;
}

// —— Main export —————————————————————————————————————————————————————————

export async function downloadReel({
  url,
  output_dir = null,
  auto_analyze = true,
  lang = "pt",
}) {
  if (!url) throw new Error("URL is required");

  ensureDirectories();

  const platform = detectPlatform(url);
  const timestamp = Date.now();
  const slug = `${platform}_${timestamp}`;

  const destPath = output_dir
    ? join(output_dir, `${slug}.mp4`)
    : getDownloadPath(platform, `${slug}.mp4`);

  mkdirSync(dirname(destPath), { recursive: true });

  console.error(`\n🎬 ViralObj Download — ${platform.toUpperCase()}`);
  console.error(`   URL: ${url}`);
  console.error(`   Dest: ${destPath}\n`);

  // —— Try strategies in order ————————————————————————————————————————

  const strategies = [];

  if (platform === "instagram") {
    strategies.push(
      { name: "SnapInsta", fn: () => trySnapInsta(url, destPath) },
      { name: "Cobalt", fn: () => tryCobalt(url, destPath) },
      { name: "yt-dlp", fn: () => tryYtDlp(url, destPath) },
    );
  } else if (platform === "tiktok") {
    strategies.push(
      { name: "SSSTik", fn: () => trySSSTik(url, destPath) },
      { name: "Cobalt", fn: () => tryCobalt(url, destPath) },
      { name: "yt-dlp", fn: () => tryYtDlp(url, destPath) },
    );
  } else {
    strategies.push(
      { name: "yt-dlp", fn: () => tryYtDlp(url, destPath) },
      { name: "Cobalt", fn: () => tryCobalt(url, destPath) },
    );
  }

  let downloaded = false;
  let usedStrategy = null;
  const errors = [];

  for (const strategy of strategies) {
    try {
      console.error(`   Trying ${strategy.name}...`);
      await strategy.fn();

      if (existsSync(destPath)) {
        const size = (statSync(destPath).size / 1024 / 1024).toFixed(1);
        console.error(`   ✅ ${strategy.name} success — ${size}MB`);
        downloaded = true;
        usedStrategy = strategy.name;
        break;
      }
    } catch (e) {
      console.error(`   ❌ ${strategy.name} failed: ${e.message}`);
      errors.push(`${strategy.name}: ${e.message}`);
    }
  }

  if (!downloaded) {
    const manualInstructions = getManualInstructions(platform, url);
    return {
      content: [{
        type: "text",
        text: `❌ Download automático falhou em todas as estratégias.\n\n` +
          `Erros:\n${errors.map(e => `  • ${e}`).join("\n")}\n\n` +
          manualInstructions,
      }],
      success: false,
      errors,
    };
  }

  // —— Get video metadata —————————————————————————————————————————————

  let duration = 30;
  let width = 720, height = 1280;
  try {
    const meta = execSync(
      `ffprobe -v error -show_entries format=duration -show_entries stream=width,height ` +
      `-of default=noprint_wrappers=1 "${destPath}"`,
      { encoding: "utf8" }
    );
    duration = parseFloat(meta.match(/duration=(\d+\.?\d*)/)?.[1] || "30");
    width = parseInt(meta.match(/width=(\d+)/)?.[1] || "720");
    height = parseInt(meta.match(/height=(\d+)/)?.[1] || "1280");
  } catch (e) {
    console.error("   ⚠ ffprobe failed, using defaults");
  }

  const fileSizeMB = (statSync(destPath).size / 1024 / 1024).toFixed(1);

  const summary = `✅ Download completo!

📹 Plataforma: ${platform}
📁 Arquivo: ${destPath}
⚙️  Engine: ${usedStrategy}
📐 Resolução: ${width}×${height}
⏱️  Duração: ${duration.toFixed(1)}s
💾 Tamanho: ${fileSizeMB}MB

${auto_analyze
    ? `🔍 Próximo passo: analyze_video\n→ analyze_video({ video_path: "${destPath}", lang: "${lang}" })`
    : `✅ Vídeo pronto para análise.\n   Chame: analyze_video({ video_path: "${destPath}" })`
  }`;

  return {
    content: [{ type: "text", text: summary }],
    success: true,
    video_path: destPath,
    platform,
    duration,
    width,
    height,
    strategy_used: usedStrategy,
    next_action: auto_analyze ? "analyze_video" : null,
    next_args: auto_analyze ? { video_path: destPath, lang } : null,
  };
}

// —— Manual instructions fallback ————————————————————————————————————————

function getManualInstructions(platform, url) {
  const tools = {
    instagram: `📥 Download manual — Instagram\n\n` +
      `1. Acesse: https://snapinsta.app\n` +
      `2. Cole: ${url}\n` +
      `3. Clique Download → HD\n` +
      `4. Salve o .mp4 em ~/viralobj/downloads/instagram/`,
    tiktok: `📥 Download manual — TikTok\n\n` +
      `1. Acesse: https://ssstik.io\n` +
      `2. Cole: ${url}\n` +
      `3. Download without watermark\n` +
      `4. Salve o .mp4 em ~/viralobj/downloads/tiktok/`,
    youtube: `📥 Download manual — YouTube\n\n` +
      `1. Acesse: https://y2mate.com\n` +
      `2. Cole: ${url}\n` +
      `3. MP4 720p\n` +
      `4. Salve o .mp4 em ~/viralobj/downloads/youtube/`,
  };
  return tools[platform] || `📥 Baixe o vídeo manualmente e salve em ~/viralobj/downloads/uploaded/`;
}
