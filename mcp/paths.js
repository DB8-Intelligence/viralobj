/**
 * ViralObj — paths.js
 * Central configuration for all project paths.
 * Single source of truth — change here, applies everywhere.
 *
 * Directory structure:
 *
 * ~/viralobj/
 * ├── downloads/          — all downloaded videos (input)
 * │   ├── instagram/
 * │   ├── tiktok/
 * │   ├── youtube/
 * │   └── uploaded/       — manually uploaded by user
 * ├── frames/             — extracted frames from videos
 * │   └── [video-slug]/
 * │       ├── f01.jpg
 * │       └── ...
 * ├── outputs/            — generated packages, HTML, skills
 * │   ├── [slug].html
 * │   ├── [slug]-skill/
 * │   └── [slug]/         — video clips from Fal.ai
 * ├── implementations/    — implementation prompts from analysis
 * │   └── [slug]-impl.md
 * ├── training-data/      — dataset + reference videos
 * │   ├── dataset.json
 * │   └── reel-references/
 * ├── mcp/
 * └── skills/
 */

import { join, resolve } from "path";
import { mkdirSync, existsSync } from "fs";
import { homedir } from "os";

// —— Base project root ————————————————————————————————————————————————————
// Resolves to ~/viralobj regardless of where the process starts
export const PROJECT_ROOT = process.env.VIRALOBJ_ROOT
  || resolve(join(homedir(), "viralobj"));

// —— All directories ——————————————————————————————————————————————————————
export const PATHS = {
  root:            PROJECT_ROOT,

  // INPUT — where videos arrive
  downloads:       join(PROJECT_ROOT, "downloads"),
  downloads_instagram: join(PROJECT_ROOT, "downloads", "instagram"),
  downloads_tiktok:    join(PROJECT_ROOT, "downloads", "tiktok"),
  downloads_youtube:   join(PROJECT_ROOT, "downloads", "youtube"),
  downloads_facebook:  join(PROJECT_ROOT, "downloads", "facebook"),
  downloads_twitter:   join(PROJECT_ROOT, "downloads", "twitter"),
  downloads_uploaded:  join(PROJECT_ROOT, "downloads", "uploaded"),

  // PROCESSING — frames extracted from videos
  frames:          join(PROJECT_ROOT, "frames"),

  // OUTPUT — generated content
  outputs:         join(PROJECT_ROOT, "outputs"),

  // IMPLEMENTATIONS — analysis output prompts
  implementations: join(PROJECT_ROOT, "implementations"),

  // TRAINING — dataset and references
  training:        join(PROJECT_ROOT, "training-data"),
  references:      join(PROJECT_ROOT, "training-data", "reel-references"),

  // SKILLS
  skills:          join(PROJECT_ROOT, "skills"),
};

// —— Helper: resolve download path by platform ————————————————————————————
export function getDownloadPath(platform, filename) {
  const platformDir = {
    instagram: PATHS.downloads_instagram,
    tiktok:    PATHS.downloads_tiktok,
    youtube:   PATHS.downloads_youtube,
    facebook:  PATHS.downloads_facebook,
    twitter:   PATHS.downloads_twitter,
    uploaded:  PATHS.downloads_uploaded,
    unknown:   PATHS.downloads,
  }[platform] || PATHS.downloads;

  return join(platformDir, filename);
}

// —— Helper: resolve frames path for a video —————————————————————————————
export function getFramesPath(videoSlug) {
  return join(PATHS.frames, videoSlug);
}

// —— Helper: resolve output path ——————————————————————————————————————————
export function getOutputPath(...parts) {
  return join(PATHS.outputs, ...parts);
}

// —— Helper: resolve implementation path ——————————————————————————————————
export function getImplPath(slug) {
  return join(PATHS.implementations, `${slug}-impl.md`);
}

// —— Bootstrap: create all directories if they don't exist ————————————————
export function ensureDirectories() {
  const dirs = Object.values(PATHS);
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
  return PATHS;
}

// —— Print all paths (for debugging) —————————————————————————————————————
export function printPaths() {
  console.error("\n📁 ViralObj Paths:");
  for (const [key, val] of Object.entries(PATHS)) {
    const exists = existsSync(val) ? "✅" : "❌";
    console.error(`  ${exists} ${key.padEnd(22)} ${val}`);
  }
  console.error("");
}
