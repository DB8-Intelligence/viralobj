import { createServiceClient } from "@/lib/supabase/server";

const BUCKET_AUDIO = "viralobj-audio";

/**
 * Upload audio buffer to Supabase Storage and return public URL.
 * Falls back to data: URI with logged warning if upload fails, so the
 * wizard never hard-breaks on storage issues.
 */
export async function uploadAudioToStorage(params: {
  generationId: string;
  sceneId: string;
  buffer: ArrayBuffer;
  contentType?: string;
}): Promise<{ url: string; storedInBucket: boolean; sizeBytes: number }> {
  const { generationId, sceneId, buffer, contentType = "audio/mpeg" } = params;
  const sizeBytes = buffer.byteLength;

  try {
    const svc = createServiceClient();
    const path = `${generationId}/${sceneId}.mp3`;

    const { error } = await svc.storage
      .from(BUCKET_AUDIO)
      .upload(path, Buffer.from(buffer), {
        contentType,
        upsert: true,
        cacheControl: "3600",
      });

    if (error) {
      console.warn(
        `[storage] audio upload failed (sceneId=${sceneId}): ${error.message}. Falling back to data URI.`,
      );
      return {
        url: bufferToDataUri(buffer, contentType),
        storedInBucket: false,
        sizeBytes,
      };
    }

    const { data: publicData } = svc.storage.from(BUCKET_AUDIO).getPublicUrl(path);
    return {
      url: publicData.publicUrl,
      storedInBucket: true,
      sizeBytes,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[storage] audio upload exception (sceneId=${sceneId}): ${msg}. Falling back to data URI.`);
    return {
      url: bufferToDataUri(buffer, contentType),
      storedInBucket: false,
      sizeBytes,
    };
  }
}

function bufferToDataUri(buffer: ArrayBuffer, contentType: string): string {
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
}
