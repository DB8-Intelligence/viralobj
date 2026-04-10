/**
 * ViralObj — paths.js
 * Centralized path configuration for all MCP tools.
 * Every tool imports paths from here — never hardcode directories.
 */

import { join, resolve } from "path";
import { mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// —— Project root (parent of mcp/) ——————————————————————————————————————
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PROJECT_ROOT = resolve(__dirname, "..");

// —— Core directories ———————————————————————————————————————————————————
export const OUTPUTS_DIR = join(PROJECT_ROOT, "outputs");
export const DOWNLOADS_DIR = join(OUTPUTS_DIR, "downloads");
export const SKILLS_DIR = join(PROJECT_ROOT, "skills");
export const TRAINING_DIR = join(PROJECT_ROOT, "training-data");
export const MCP_DIR = join(PROJECT_ROOT, "mcp");
export const TOOLS_DIR = join(MCP_DIR, "tools");

// —— Training data paths ————————————————————————————————————————————————
export const DATASET_PATH = join(TRAINING_DIR, "dataset.json");
export const REEL_REFERENCES_DIR = join(TRAINING_DIR, "reel-references");
export const REFERENCES_DIR = join(TRAINING_DIR, "references");

// —— Skill paths ————————————————————————————————————————————————————————
export const REVERSE_ENGINEER_DIR = join(SKILLS_DIR, "viralobj-reverse-engineer");

// —— Env file ————————————————————————————————————————————————————————————
export const ENV_PATH = join(PROJECT_ROOT, ".env");

// —— Ensure directories exist ————————————————————————————————————————————
export function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function ensureOutputDirs() {
  ensureDir(OUTPUTS_DIR);
  ensureDir(DOWNLOADS_DIR);
}

// —— Helper: generate timestamped output dir ————————————————————————————
export function makeOutputDir(prefix) {
  const slug = `${prefix}-${Date.now()}`;
  const dir = join(OUTPUTS_DIR, slug);
  ensureDir(dir);
  return dir;
}

// —— Helper: download destination path ——————————————————————————————————
export function downloadPath(platform) {
  ensureDir(DOWNLOADS_DIR);
  return join(DOWNLOADS_DIR, `${platform}_${Date.now()}.mp4`);
}

// —— Helper: frames temp dir ————————————————————————————————————————————
export function framesDir(videoPath) {
  const dir = join(dirname(videoPath), `.viralobj_frames_${Date.now()}`);
  ensureDir(dir);
  return dir;
}
