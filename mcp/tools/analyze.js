/**
 * ViralObj — analyze.js (LEGACY STUB)
 *
 * The original implementation used Anthropic Claude Vision to caption
 * extracted frames. As of the Google-Cloud-only migration, the
 * @anthropic-ai/sdk dependency was removed. This stub exists only so
 * mcp/index.js can still import the symbol without breaking the MCP
 * server boot. Re-implement on Vertex AI Gemini multimodal when needed.
 */
export async function analyzeVideo(/* { video_path, lang } */) {
  throw new Error(
    "analyzeVideo is not implemented in the Google-Cloud-only build. "
      + "The previous Anthropic-Vision integration was removed. Reimplement "
      + "using Vertex AI Gemini 1.5 Pro multimodal (it accepts video parts "
      + "natively) before re-enabling this tool.",
  );
}
