/**
 * webapp/lib/bridgeClient.ts
 *
 * Server-side client for the ViralObj Bridge (Cloud Run, viralobj-bridge).
 *
 * The bridge is the single source of truth for AI generation:
 *   webapp → bridge → Vertex AI Gemini / Veo / GCS / Firestore
 *
 * Auth: bridge requires `X-Gemini-Key` header with the GEMINI_AGENT_TOKEN
 * secret. This token MUST stay server-side — never import this file from a
 * client component.
 *
 * Env:
 *   NEXT_PUBLIC_BRIDGE_API_URL  e.g. https://api.viralobj.app
 *   GEMINI_AGENT_TOKEN          server-only secret (Secret Manager on prod)
 */

const BRIDGE_URL = process.env.NEXT_PUBLIC_BRIDGE_API_URL || "";
const GEMINI_KEY = process.env.GEMINI_AGENT_TOKEN || "";

export class BridgeError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "BridgeError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function ensureConfig() {
  if (!BRIDGE_URL) {
    throw new BridgeError(
      500,
      "NEXT_PUBLIC_BRIDGE_API_URL is not configured",
      "BRIDGE_NOT_CONFIGURED",
    );
  }
  if (!GEMINI_KEY) {
    throw new BridgeError(
      500,
      "GEMINI_AGENT_TOKEN is not configured",
      "BRIDGE_AUTH_NOT_CONFIGURED",
    );
  }
}

async function bridgeFetch(path: string, init?: RequestInit & { timeoutMs?: number }) {
  ensureConfig();
  const { timeoutMs = 60_000, ...rest } = init || {};
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${BRIDGE_URL}${path}`, {
      ...rest,
      headers: {
        "X-Gemini-Key": GEMINI_KEY,
        "Content-Type": "application/json",
        ...(rest.headers || {}),
      },
      signal: controller.signal,
    });
    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try { data = JSON.parse(text); } catch { data = text; }
    }
    if (!res.ok) {
      const obj = (data && typeof data === "object" ? data : {}) as Record<string, unknown>;
      throw new BridgeError(
        res.status,
        (obj.message as string) || (obj.error as string) || `Bridge ${res.status}`,
        obj.error as string | undefined,
        data,
      );
    }
    return data;
  } finally {
    clearTimeout(t);
  }
}

// ─── Payloads ──────────────────────────────────────────────────────────

export interface ReelPayload {
  niche: string;
  objects: string[];
  topic: string;
  tone?: string;
  duration?: number;
  lang?: "pt" | "en" | "both";
  provider?: "auto" | "anthropic" | "openai" | "gemini";
  user_email?: string | null;
  user_name?: string | null;
}

export interface DryRunResponse {
  ok: true;
  success: true;
  mode: "dry_run";
  elapsed_ms: number;
  provider_used: string;
  niche: string;
  data_source: string;
  package: Record<string, unknown>;
  summary?: string;
  videos: unknown[];
  cost_guard: {
    veo_called: false;
    veo_enabled: boolean;
    estimated_veo_cost: number;
    scenes_skipped: number;
  };
}

export interface FullRenderResponse {
  ok: true;
  success: true;
  mode: "full";
  job_id: string;
  status_url: string;
  [key: string]: unknown;
}

export interface ReelStatus {
  ok: boolean;
  job_id: string;
  status: string;
  scenes?: unknown[];
  [key: string]: unknown;
}

export interface CostPreviewPayload {
  scene_count?: number;
  duration?: number;
  objects?: string[];
}

// ─── Client functions ──────────────────────────────────────────────────

export async function generateReelDryRun(payload: ReelPayload): Promise<DryRunResponse> {
  return (await bridgeFetch("/api/generate-reel?dry_run=true", {
    method: "POST",
    body: JSON.stringify(payload),
    timeoutMs: 120_000,
  })) as DryRunResponse;
}

export async function generateReelFull(payload: ReelPayload): Promise<FullRenderResponse> {
  return (await bridgeFetch("/api/generate-reel", {
    method: "POST",
    body: JSON.stringify(payload),
    timeoutMs: 60_000,
  })) as FullRenderResponse;
}

export async function getReelStatus(jobId: string): Promise<ReelStatus> {
  if (!jobId) throw new BridgeError(400, "jobId is required", "MISSING_JOB_ID");
  return (await bridgeFetch(`/api/reel/${encodeURIComponent(jobId)}/status`, {
    method: "GET",
    timeoutMs: 30_000,
  })) as ReelStatus;
}

export async function getCostPreview(payload: CostPreviewPayload): Promise<unknown> {
  return await bridgeFetch("/api/reel/cost-preview", {
    method: "POST",
    body: JSON.stringify(payload),
    timeoutMs: 15_000,
  });
}
