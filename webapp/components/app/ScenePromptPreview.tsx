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

const SCENE_LABELS: Record<string, string> = {
  intro: "Abertura",
  dialogue: "Diálogo",
  reaction: "Reação",
  cta: "Chamada para ação",
};

function isRealUrl(url?: string | null): boolean {
  return Boolean(url && url.startsWith("http") && !url.includes("placehold.co"));
}

export default function ScenePromptPreview({
  objectBibles,
  sceneBlueprints,
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

  const imagesByScene = new Map<string, GeneratedSceneImage>();
  for (const img of sceneImages ?? []) {
    imagesByScene.set(img.sceneId, img);
  }

  const audiosByScene = new Map<string, GeneratedSceneAudio>();
  for (const a of sceneAudios ?? []) {
    audiosByScene.set(a.sceneId, a);
  }

  const totalDuration = videoTimeline
    ? `${Math.round(videoTimeline.totalDurationMs / 1000)}s`
    : null;

  return (
    <div className="space-y-4">
      {/* Video final */}
      <div className="rounded-lg border border-viral-border/60 bg-viral-bg/40 p-4">
        <h4 className="text-sm font-semibold mb-2">Vídeo final</h4>
        {videoUrl && isRealUrl(videoUrl) ? (
          <div className="space-y-2">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              controls
              src={videoUrl}
              className="w-full max-w-md rounded border border-viral-border/40"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-viral-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Vídeo em processamento...
          </div>
        )}
        {totalDuration && (
          <p className="text-xs text-viral-muted mt-2">
            Duração estimada: {totalDuration}
          </p>
        )}
      </div>

      {/* Personagens e cenas */}
      {objectBibles.map((bible) => {
        const scenes = blueprintsByObject.get(bible.id) ?? [];
        return (
          <div
            key={bible.id}
            className="rounded-lg border border-viral-border/60 bg-viral-bg/40 p-4"
          >
            {/* Header do personagem */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-viral-accent/20 flex items-center justify-center text-lg">
                {bible.visual.baseColor === "yellow" ? "🍌" :
                 bible.visual.baseColor === "white" ? "🧴" :
                 bible.visual.baseColor === "black" ? "📱" :
                 bible.visual.baseColor === "silver" ? "🗑️" : "🎭"}
              </div>
              <div>
                <h4 className="font-semibold capitalize">{bible.name}</h4>
                <p className="text-xs text-viral-muted">
                  {bible.visual.baseColor} · {bible.visual.shape} · tom {bible.voice.tone}
                </p>
              </div>
            </div>

            {/* Cenas */}
            {scenes.length === 0 ? (
              <p className="text-sm text-viral-muted italic">
                Nenhuma cena gerada para este personagem.
              </p>
            ) : (
              <div className="space-y-3">
                {scenes.map((scene) => {
                  const image = imagesByScene.get(scene.sceneId);
                  const audio = audiosByScene.get(scene.sceneId);
                  const hasRealImage = isRealUrl(image?.imageUrl);

                  return (
                    <div
                      key={scene.sceneId}
                      className="rounded border border-viral-border/40 bg-viral-bg/60 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase text-viral-accent">
                          {SCENE_LABELS[scene.sceneType] ?? scene.sceneType}
                        </span>
                        {audio?.durationMs && (
                          <span className="text-[10px] text-viral-muted">
                            {Math.round(audio.durationMs / 1000)}s
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {/* Imagem da cena */}
                        <div className="flex-shrink-0">
                          {hasRealImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image!.imageUrl}
                              alt={`${bible.name} - ${scene.sceneType}`}
                              className="w-24 h-40 object-cover rounded border border-viral-border/40"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-24 h-40 rounded border border-viral-border/40 bg-viral-border/20 flex items-center justify-center">
                              <span className="text-xs text-viral-muted text-center px-1">
                                {image ? "Gerando..." : "Aguardando"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Texto da cena */}
                        <div className="flex-1 min-w-0">
                          {scene.overlayText && (
                            <p className="text-sm text-viral-text mb-1">
                              &ldquo;{scene.overlayText}&rdquo;
                            </p>
                          )}
                          {scene.action && (
                            <p className="text-xs text-viral-muted">
                              {scene.action}
                            </p>
                          )}
                          {scene.environment && (
                            <p className="text-[10px] text-viral-muted/70 mt-1">
                              Cenário: {scene.environment}
                            </p>
                          )}
                          {audio && audio.provider !== "mock" && (
                            <div className="mt-2 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span className="text-[10px] text-emerald-400">Áudio gerado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
