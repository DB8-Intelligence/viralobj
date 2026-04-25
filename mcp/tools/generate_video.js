/**
 * ViralObj — generate_video.js (LEGACY STUB)
 *
 * The original implementation submitted scenes to Fal.ai (FLUX Pro for
 * images, MiniMax for TTS, VEED Fabric for lip-sync, Veo via Fal for
 * video) and stitched the result. As of the Google-Cloud-only
 * migration, the @fal-ai/client dependency was removed and the entire
 * render pipeline moved into the Bridge server (server.js) using
 * Vertex AI Veo via src/infrastructure/veo.js.
 *
 * This stub remains so mcp/index.js can still import the symbol
 * without breaking the MCP server boot. To regenerate videos end-to-end
 * outside the Bridge (e.g. as an MCP tool), call submitVeoJob /
 * fetchVeoOperation from src/infrastructure/veo.js directly.
 */
export async function generateVideo(/* args */) {
  throw new Error(
    "generateVideo is not implemented in the Google-Cloud-only build. "
      + "The Fal.ai integration was removed; render now happens inside the "
      + "Bridge server via Vertex AI Veo (src/infrastructure/veo.js + the "
      + "/api/generate-reel + /api/reel/{id}/status endpoints).",
  );
}
