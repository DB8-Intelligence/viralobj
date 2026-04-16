/**
 * Feature flags centralizadas para ViralObj.
 * Leitura de env vars com defaults seguros — tudo desligado até ativação explícita.
 *
 * Ativar em .env.local (dev) ou Vercel Dashboard (prod).
 */

function envBool(key: string, fallback = false): boolean {
  const v = process.env[key];
  if (v === undefined) return fallback;
  return v === 'true' || v === '1';
}

function envString<T extends string>(key: string, fallback: T): T {
  return (process.env[key] as T) || fallback;
}

function envInt(key: string, fallback: number): number {
  const v = process.env[key];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

// ---------------------------------------------------------------------------
// Providers — controle de ativação real vs mock
// ---------------------------------------------------------------------------

/** Imagem: FLUX.2 Pro via Fal.ai */
export const FAL_INTEGRATION_READY = envBool('FAL_INTEGRATION_READY');

/** IP-Adapter para character chaining entre cenas (requer FAL_INTEGRATION_READY) */
export const FEATURE_IP_ADAPTER = envBool('FEATURE_IP_ADAPTER');
export const IP_ADAPTER_STRENGTH = parseFloat(process.env.IP_ADAPTER_STRENGTH || '0.75');
export const IP_ADAPTER_USE_SEED = envBool('IP_ADAPTER_SEED', true);

/** TTS: qual provider usar */
export type TTSProviderType = 'elevenlabs' | 'minimax';
export const TTS_PROVIDER = envString<TTSProviderType>('TTS_PROVIDER', 'elevenlabs');
export const MINIMAX_READY = envBool('MINIMAX_READY');
export const ELEVENLABS_READY = envBool('ELEVENLABS_READY');

/** Vídeo render: qual provider usar */
export const REMOTION_READY = envBool('REMOTION_READY');
export const FAL_VIDEO_READY = envBool('FAL_VIDEO_READY');
export const VEED_READY = envBool('VEED_READY');

// ---------------------------------------------------------------------------
// FFmpeg / encoding
// ---------------------------------------------------------------------------

export const FFMPEG_CRF = envInt('FFMPEG_CRF', 23);
export const FFMPEG_BITRATE = envString('FFMPEG_BITRATE', '1500k');
export const FFMPEG_PRESET = envString<'ultrafast' | 'veryfast' | 'fast' | 'medium' | 'slow'>(
  'FFMPEG_PRESET',
  'fast'
);

// ---------------------------------------------------------------------------
// Modos de operação
// ---------------------------------------------------------------------------

/** Preview mode: pula lip-sync, mais barato */
export const FEATURE_PREVIEW_MODE = envBool('FEATURE_PREVIEW_MODE');

/** Logging de custos por provider */
export const LOG_COSTS = envBool('LOG_COSTS');

/** Logging de duração por step */
export const LOG_DURATIONS = envBool('LOG_DURATIONS', true);

// ---------------------------------------------------------------------------
// Helper: resumo para logs/debug
// ---------------------------------------------------------------------------

export function featureSummary(): Record<string, unknown> {
  return {
    fal: FAL_INTEGRATION_READY,
    ipAdapter: FEATURE_IP_ADAPTER,
    ttsProvider: TTS_PROVIDER,
    minimax: MINIMAX_READY,
    elevenlabs: ELEVENLABS_READY,
    remotion: REMOTION_READY,
    falVideo: FAL_VIDEO_READY,
    veed: VEED_READY,
    ffmpegCrf: FFMPEG_CRF,
    ffmpegBitrate: FFMPEG_BITRATE,
    previewMode: FEATURE_PREVIEW_MODE,
    logCosts: LOG_COSTS,
  };
}
