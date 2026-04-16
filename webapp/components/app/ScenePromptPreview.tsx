import type { ObjectBible } from "@/lib/viral-objects/object-bible";
import type { SceneBlueprint } from "@/lib/viral-objects/scene-blueprint";
import type { SceneImagePrompt } from "@/lib/viral-objects/image-prompt-pack";
import type { GeneratedSceneImage } from "@/lib/viral-objects/image-generation.service";
import type { GeneratedSceneAudio } from "@/lib/viral-objects/audio-generation.service";
import type { VideoTimeline } from "@/lib/viral-objects/video-timeline";

interface Props {
  objectBibles?: ObjectBible[] | null;
  sceneBlueprints?: Array<{ objectId: string; scenes: SceneBlueprint[] }> | null;
  sceneImagePrompts?: SceneImagePrompt[] | null;
  sceneImages?: GeneratedSceneImage[] | null;
  sceneAudios?: GeneratedSceneAudio[] | null;
  videoTimeline?: VideoTimeline | null;
  videoUrl?: string | null;
}

export default function ScenePromptPreview({
  objectBibles,
  sceneBlueprints,
  sceneImagePrompts,
  sceneImages,
  sceneAudios,
  videoTimeline,
  videoUrl,
}: Props) {
  if (!objectBibles?.length) return null;

  const blueprintsByObject = new Map<string, SceneBlueprint[]>();
  for (const group of sceneBlueprints ?? []) {
    blueprintsByObject.set(group.objectId, group.scenes);
  }

  const promptsByScene = new Map<string, string>();
  for (const p of sceneImagePrompts ?? []) {
    promptsByScene.set(p.sceneId, p.prompt);
  }

  const imagesByScene = new Map<string, GeneratedSceneImage>();
  for (const img of sceneImages ?? []) {
    imagesByScene.set(img.sceneId, img);
  }

  const audiosByScene = new Map<string, GeneratedSceneAudio>();
  for (const a of sceneAudios ?? []) {
    audiosByScene.set(a.sceneId, a);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-viral-muted">
        Preview de cenas
      </h3>

      <div className="rounded-lg border border-viral-border/60 bg-viral-bg/40 p-3 text-xs space-y-2">
        <div className="font-semibold">Vídeo final</div>
        {videoUrl ? (
          videoUrl.startsWith("http") ? (
            <div className="space-y-2">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                controls
                src={videoUrl}
                className="w-full max-w-sm rounded border border-viral-border/40"
              />
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer"
                className="underline text-viral-muted"
              >
                {videoUrl}
              </a>
            </div>
          ) : (
            <div className="text-viral-muted">
              <span className="opacity-70">url:</span> {videoUrl}
              <span className="ml-2 opacity-50">(mock — preview indisponível)</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 italic text-viral-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-viral-muted/60 animate-pulse" />
            Vídeo em renderização…
          </div>
        )}
      </div>

      {videoTimeline ? (
        <div className="rounded-lg border border-viral-border/60 bg-viral-bg/40 p-3 text-xs">
          <div className="font-semibold mb-1">
            Timeline · total {videoTimeline.totalDurationMs} ms
          </div>
          <ul className="space-y-0.5 text-viral-muted">
            {videoTimeline.scenes.map((s) => (
              <li key={s.sceneId}>
                <span className="uppercase opacity-70">{s.sceneType}</span>{" "}
                <span className="opacity-70">{s.sceneId}</span>{" "}
                — {s.startMs}→{s.endMs} ms ({s.durationMs} ms)
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {objectBibles.map((bible) => {
        const scenes = blueprintsByObject.get(bible.id) ?? [];
        return (
          <div
            key={bible.id}
            className="rounded-lg border border-viral-border/60 bg-viral-bg/40 p-4"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="font-semibold">{bible.name}</div>
                <div className="text-xs text-viral-muted">{bible.id}</div>
              </div>
              <div className="text-xs text-viral-muted text-right space-y-0.5">
                <div>
                  <span className="opacity-70">cor:</span> {bible.visual.baseColor}
                </div>
                <div>
                  <span className="opacity-70">forma:</span> {bible.visual.shape}
                </div>
                <div>
                  <span className="opacity-70">tone:</span> {bible.voice.tone}
                </div>
              </div>
            </div>

            {scenes.length === 0 ? (
              <div className="text-xs text-viral-muted italic">
                Nenhuma cena gerada para este objeto.
              </div>
            ) : (
              <div className="space-y-2">
                {scenes.map((scene) => {
                  const prompt = promptsByScene.get(scene.sceneId);
                  const image = imagesByScene.get(scene.sceneId);
                  const audio = audiosByScene.get(scene.sceneId);
                  return (
                    <details
                      key={scene.sceneId}
                      className="rounded border border-viral-border/40 bg-viral-bg/60"
                    >
                      <summary className="cursor-pointer px-3 py-2 text-xs list-none flex items-center justify-between gap-2">
                        <span className="font-medium uppercase">{scene.sceneType}</span>
                        <span className="text-viral-muted truncate">
                          {scene.action}
                        </span>
                      </summary>
                      <div className="border-t border-viral-border/40 px-3 py-2 text-[11px] text-viral-muted space-y-2">
                        {image ? (
                          <div className="space-y-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.imageUrl}
                              alt={`${scene.sceneType} – ${scene.sceneId}`}
                              className="w-full max-w-[240px] rounded border border-viral-border/40 bg-black/30"
                              loading="lazy"
                            />
                            <div className="flex items-center gap-2">
                              <span className="opacity-70">provider:</span>
                              <span>{image.provider}</span>
                              <a
                                href={image.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline truncate"
                              >
                                {image.imageUrl}
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 italic">
                            <span className="inline-block w-2 h-2 rounded-full bg-viral-muted/60 animate-pulse" />
                            Gerando imagem…
                          </div>
                        )}
                        {audio ? (
                          <div className="space-y-0.5">
                            <div>
                              <span className="opacity-70">audio:</span>{" "}
                              <span>{audio.audioUrl}</span>
                            </div>
                            <div>
                              <span className="opacity-70">duração:</span>{" "}
                              {audio.durationMs ?? "?"} ms
                              <span className="opacity-70 ml-2">provider:</span>{" "}
                              {audio.provider}
                            </div>
                          </div>
                        ) : (
                          <div className="italic">áudio ainda não gerado</div>
                        )}
                        <div>
                          <span className="opacity-70">environment:</span>{" "}
                          {scene.environment}
                        </div>
                        <div>
                          <span className="opacity-70">camera:</span> {scene.camera}
                        </div>
                        {prompt ? (
                          <pre className="whitespace-pre-wrap overflow-x-auto max-h-60 rounded bg-black/30 p-2">
                            {prompt}
                          </pre>
                        ) : (
                          <div className="italic">Prompt não disponível.</div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
