"use client";

import { useState } from "react";

interface Character {
  id?: string;
  name_pt?: string;
  name_en?: string;
  emoji?: string;
  personality?: string;
  expression_arc?: string[];
  voice_script_pt?: string;
  voice_script_en?: string;
  ai_prompt_midjourney?: string;
  timestamp_start?: string;
  timestamp_end?: string;
}

interface PostCopy {
  caption_pt?: string;
  caption_en?: string;
  hashtags_pt?: string[] | string;
  hashtags_en?: string[] | string;
}

interface Caption {
  time?: string;
  text?: string;
  character?: string;
  style?: string;
}

interface Variation {
  title_pt?: string;
  title_en?: string;
  hook_pt?: string;
  hook_en?: string;
  objects?: string[];
  description_pt?: string;
  description_en?: string;
  tone?: string;
}

interface PackageData {
  meta?: {
    niche?: string;
    topic_pt?: string;
    topic_en?: string;
    tone?: string;
    duration?: number;
    format?: string;
  };
  characters?: Character[];
  captions?: Caption[];
  post_copy?: PostCopy;
  variations?: Variation[];
}

interface SceneAudio {
  sceneId: string;
  audioUrl: string;
  sceneType: string;
  objectId: string;
  durationMs: number;
}

interface SceneVideo {
  sceneId: string;
  sceneType: string;
  videoUrl: string;
  durationMs: number;
}

interface Props {
  pkg: PackageData;
  niche?: string;
  sceneImages?: Array<{ sceneId: string; imageUrl: string; sceneType: string }> | null;
  sceneAudios?: SceneAudio[] | null;
  sceneVideos?: SceneVideo[] | null;
  videoUrl?: string | null;
}

type Tab = "roteiro" | "voz" | "legendas" | "post" | "variacoes" | "preview";

const TAB_CONFIG: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "roteiro", label: "Roteiro", icon: "🎬" },
  { id: "voz", label: "Voz", icon: "🎙️" },
  { id: "legendas", label: "Legendas", icon: "📝" },
  { id: "post", label: "Post", icon: "📱" },
  { id: "variacoes", label: "Variações", icon: "🔄" },
  { id: "preview", label: "Preview", icon: "👁️" },
];

function parseHashtags(raw?: string[] | string): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((h) => h.replace(/^#/, "").trim()).filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((h: string) => h.replace(/^#/, "").trim());
  } catch { /* ignore */ }
  return raw.split(/[,\s]+/).map((h) => h.replace(/^#/, "").trim()).filter(Boolean);
}

function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-viral-accent/10 border border-viral-accent/20 rounded text-viral-accent hover:bg-viral-accent/20 transition"
    >
      {copied ? "✓ Copiado!" : `📋 ${label}`}
    </button>
  );
}

export default function GenerationDetail({ pkg, niche, sceneImages, sceneAudios, sceneVideos, videoUrl }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("roteiro");
  const [generatingVariation, setGeneratingVariation] = useState<number | null>(null);

  const characters = pkg.characters ?? [];
  const meta = pkg.meta;
  const postCopy = pkg.post_copy;

  if (characters.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-viral-border/60 overflow-x-auto">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap border-b-2 transition ${
              activeTab === tab.id
                ? "text-viral-accent border-viral-accent"
                : "text-viral-muted border-transparent hover:text-viral-text"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ROTEIRO */}
      {activeTab === "roteiro" && (
        <div className="space-y-3">
          {characters.map((char, idx) => (
            <div key={idx} className="card p-4 border-l-2 border-viral-accent/40">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-viral-border/40">
                <span className="text-2xl">{char.emoji ?? "🎭"}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-viral-text">{char.name_pt ?? `Personagem ${idx + 1}`}</h4>
                  {char.personality && (
                    <p className="text-[10px] text-viral-muted">{char.personality}</p>
                  )}
                </div>
                {char.timestamp_start && (
                  <span className="text-[10px] text-viral-accent font-mono">
                    ⏱ {char.timestamp_start}–{char.timestamp_end}
                  </span>
                )}
              </div>

              {/* Arco de expressao */}
              {char.expression_arc && char.expression_arc.length > 0 && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {char.expression_arc.map((expr, i) => (
                    <span key={i} className="flex items-center gap-1">
                      {i > 0 && <span className="text-viral-muted text-xs">→</span>}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-viral-accent/10 border border-viral-accent/20 text-viral-accent">
                        {expr}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              {/* Imagens da cena (FLUX Pro) */}
              {sceneImages && sceneImages.length > 0 && (() => {
                const charId = char.id ?? `char-${idx}`;
                const charImages = sceneImages.filter(
                  (img) => charId && img.sceneId && img.sceneId.includes(charId) &&
                    img.imageUrl?.startsWith("http") && !img.imageUrl?.includes("placehold")
                );
                if (charImages.length === 0) return null;
                return (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    {charImages.map((img, i) => (
                      <a
                        key={i}
                        href={img.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex-shrink-0 rounded-lg overflow-hidden border border-viral-border/40 hover:border-viral-accent/60 transition group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.imageUrl}
                          alt={`${char.name_pt} - ${img.sceneType}`}
                          className="w-24 h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                          <span className="text-[9px] text-white/80 uppercase font-medium">{img.sceneType}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                );
              })()}

              {/* Descricao da cena */}
              {char.ai_prompt_midjourney && (
                <div className="text-xs text-viral-muted bg-viral-bg/60 rounded p-3 leading-relaxed">
                  <span className="text-[9px] uppercase tracking-wider text-viral-muted/60 block mb-1">Cena</span>
                  {char.ai_prompt_midjourney.split(",").slice(0, 3).join(", ")}...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VOZ */}
      {activeTab === "voz" && (
        <div className="space-y-3">
          <div className="card p-4 bg-amber-500/5 border-amber-500/20">
            <p className="text-xs text-amber-400">
              💡 Dica: Use vozes diferentes para cada personagem no ElevenLabs para tornar o formato mais memorável.
            </p>
          </div>

          {characters.map((char, idx) => (
            <div key={idx} className="card p-4 border-l-2 border-amber-500/40">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{char.emoji ?? "🎭"}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  {char.name_pt ?? `Personagem ${idx + 1}`}
                </span>
                {char.timestamp_start && (
                  <span className="text-[10px] text-viral-muted ml-auto font-mono">
                    {char.timestamp_start}–{char.timestamp_end}
                  </span>
                )}
              </div>

              {char.voice_script_pt ? (
                <div className="text-sm text-viral-text leading-relaxed italic">
                  &ldquo;{char.voice_script_pt}&rdquo;
                </div>
              ) : (
                <p className="text-xs text-viral-muted italic">Roteiro de voz não disponível.</p>
              )}

              {char.voice_script_en && (
                <details className="mt-2">
                  <summary className="text-[10px] text-viral-muted cursor-pointer hover:text-viral-text">
                    🇺🇸 English version
                  </summary>
                  <div className="text-xs text-viral-muted mt-1 italic leading-relaxed">
                    &ldquo;{char.voice_script_en}&rdquo;
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* POST */}
      {activeTab === "post" && (
        <div className="space-y-4">
          {/* Caption PT */}
          {postCopy?.caption_pt && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
                📱 Caption Instagram (PT-BR)
              </h4>
              <div className="bg-viral-bg/60 rounded-lg p-4 text-sm text-viral-text leading-relaxed whitespace-pre-line mb-3">
                {postCopy.caption_pt}
              </div>
              <CopyButton text={postCopy.caption_pt} label="Copiar caption" />
            </div>
          )}

          {/* Caption EN */}
          {postCopy?.caption_en && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
                🇺🇸 Caption (English)
              </h4>
              <div className="bg-viral-bg/60 rounded-lg p-4 text-sm text-viral-text leading-relaxed whitespace-pre-line mb-3">
                {postCopy.caption_en}
              </div>
              <CopyButton text={postCopy.caption_en} label="Copiar caption EN" />
            </div>
          )}

          {/* Hashtags */}
          {(postCopy?.hashtags_pt || postCopy?.hashtags_en) && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
                # Hashtags
              </h4>
              {postCopy?.hashtags_pt && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {parseHashtags(postCopy.hashtags_pt).map((h, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-viral-accent/10 text-viral-accent">
                        #{h}
                      </span>
                    ))}
                  </div>
                  <CopyButton
                    text={parseHashtags(postCopy.hashtags_pt).map((h) => `#${h}`).join(" ")}
                    label="Copiar hashtags PT"
                  />
                </div>
              )}
              {postCopy?.hashtags_en && (
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {parseHashtags(postCopy.hashtags_en).map((h, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                        #{h}
                      </span>
                    ))}
                  </div>
                  <CopyButton
                    text={parseHashtags(postCopy.hashtags_en).map((h) => `#${h}`).join(" ")}
                    label="Copiar hashtags EN"
                  />
                </div>
              )}
            </div>
          )}

          {/* Texto completo para copiar */}
          {postCopy?.caption_pt && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
                📋 Texto completo (caption + hashtags)
              </h4>
              <CopyButton
                text={`${postCopy.caption_pt}\n\n${parseHashtags(postCopy.hashtags_pt).map((h) => `#${h}`).join(" ")}`}
                label="Copiar tudo PT-BR"
              />
            </div>
          )}
        </div>
      )}

      {/* LEGENDAS */}
      {activeTab === "legendas" && (
        <div className="space-y-3">
          {pkg.captions && pkg.captions.length > 0 ? (
            <div className="card p-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-viral-border/60 text-[10px] uppercase tracking-wider text-viral-muted">
                    <th className="text-left px-3 py-2 w-16">Tempo</th>
                    <th className="text-left px-3 py-2">Legenda</th>
                    <th className="text-left px-3 py-2 hidden sm:table-cell">Personagem / Estilo</th>
                  </tr>
                </thead>
                <tbody>
                  {pkg.captions.map((cap, i) => (
                    <tr key={i} className="border-b border-viral-border/30 hover:bg-viral-border/10">
                      <td className="px-3 py-2 text-viral-accent font-mono text-xs">
                        [{cap.time}]
                      </td>
                      <td className="px-3 py-2 text-viral-text font-medium">
                        {cap.text}
                      </td>
                      <td className="px-3 py-2 text-xs text-viral-muted hidden sm:table-cell">
                        {cap.character}{cap.style ? ` · ${cap.style}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card p-8 text-center text-sm text-viral-muted">
              Legendas nao disponíveis para esta geração.
              <p className="text-[10px] mt-2 text-viral-muted/60">
                Gere um novo pacote para incluir legendas timestamped.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VARIACOES */}
      {activeTab === "variacoes" && (
        <div className="space-y-3">
          {pkg.variations && pkg.variations.length > 0 ? (
            <>
              <div className="card p-4 bg-amber-500/5 border-amber-500/20">
                <p className="text-xs text-amber-400">
                  💡 Escolha uma variação e clique para gerar — mesmo formato, ângulo diferente, alta retenção garantida.
                </p>
              </div>
              {pkg.variations.map((v, i) => {
                const isGenerating = generatingVariation === i;
                return (
                <div key={i} className="card p-5 hover:border-viral-accent/40 transition">
                  <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-2">
                    Variação {String(i + 1).padStart(2, "0")}
                    {v.tone && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-viral-accent/10 text-viral-accent">
                        {v.tone}
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-viral-text mb-2">{v.title_pt}</h4>
                  {v.hook_pt && (
                    <div className="text-sm italic text-viral-accent/80 mb-2 pl-3 border-l-2 border-viral-accent/30">
                      &ldquo;{v.hook_pt}&rdquo;
                    </div>
                  )}
                  {v.description_pt && (
                    <p className="text-xs text-viral-muted leading-relaxed">{v.description_pt}</p>
                  )}
                  {v.objects && v.objects.length > 0 && (
                    <div className="mt-2 flex gap-1.5 flex-wrap">
                      {v.objects.map((obj, j) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 rounded bg-viral-border/30 text-viral-text">
                          {obj}
                        </span>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      setGeneratingVariation(i);
                      try {
                        const res = await fetch("/api/app/generate-package", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            niche: niche ?? meta?.niche ?? "casa",
                            objects: v.objects ?? [],
                            topic: v.title_pt ?? v.description_pt ?? "",
                            tone: v.tone ?? meta?.tone ?? "dramatic",
                            duration: meta?.duration ?? 30,
                            lang: "both",
                            provider: "auto",
                          }),
                        });
                        if (res.ok) {
                          window.location.href = "/app/history";
                        } else {
                          const data = await res.json();
                          alert(data.error || "Erro ao gerar variação");
                        }
                      } catch (err) {
                        alert("Erro de conexão. Tente novamente.");
                      } finally {
                        setGeneratingVariation(null);
                      }
                    }}
                    disabled={isGenerating}
                    className="mt-3 w-full py-2 rounded-lg text-xs font-medium transition bg-viral-accent/10 border border-viral-accent/30 text-viral-accent hover:bg-viral-accent/20 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border-2 border-viral-accent border-t-transparent rounded-full animate-spin" />
                        Gerando...
                      </span>
                    ) : (
                      "Gerar esta variação →"
                    )}
                  </button>
                </div>
                );
              })}
            </>
          ) : (
            <div className="card p-8 text-center text-sm text-viral-muted">
              Variações não disponíveis para esta geração.
              <p className="text-[10px] mt-2 text-viral-muted/60">
                Gere um novo pacote para incluir 3 variações de alta retenção.
              </p>
            </div>
          )}
        </div>
      )}

      {/* PREVIEW */}
      {activeTab === "preview" && (() => {
        const realImages = (sceneImages ?? []).filter(
          (img) => img.imageUrl?.startsWith("http") && !img.imageUrl?.includes("placehold")
        );
        const realAudios = (sceneAudios ?? []).filter(
          (a) => a.audioUrl && (a.audioUrl.startsWith("http") || a.audioUrl.startsWith("data:"))
        );
        const hasVideo = videoUrl && videoUrl.startsWith("http") && !videoUrl.startsWith("mock://");
        const realSceneVideos = (sceneVideos ?? []).filter(
          (v) => v.videoUrl && v.videoUrl.startsWith("http"),
        );

        return (
        <div className="space-y-4">
          {/* Status do pacote */}
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="text-emerald-400 text-lg">✓</span>
              </div>
              <div>
                <p className="text-sm font-medium text-viral-text">Pacote de produção pronto!</p>
                <p className="text-[10px] text-viral-muted">
                  {realImages.length} imagens · {realAudios.length} áudios · {(pkg.captions ?? []).length} legendas
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-emerald-500/5 rounded p-2">
                <span className="text-emerald-400 text-sm">✓</span>
                <p className="text-[10px] text-viral-muted mt-1">Roteiro</p>
              </div>
              <div className={`rounded p-2 ${realImages.length > 0 ? "bg-emerald-500/5" : "bg-amber-500/5"}`}>
                <span className={`text-sm ${realImages.length > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {realImages.length > 0 ? "✓" : "⏳"}
                </span>
                <p className="text-[10px] text-viral-muted mt-1">Imagens</p>
              </div>
              <div className={`rounded p-2 ${realAudios.length > 0 ? "bg-emerald-500/5" : "bg-amber-500/5"}`}>
                <span className={`text-sm ${realAudios.length > 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {realAudios.length > 0 ? "✓" : "⏳"}
                </span>
                <p className="text-[10px] text-viral-muted mt-1">Áudio</p>
              </div>
              <div className={`rounded p-2 ${hasVideo || realSceneVideos.length > 0 ? "bg-emerald-500/5" : "bg-viral-border/10"}`}>
                <span className={`text-sm ${hasVideo || realSceneVideos.length > 0 ? "text-emerald-400" : "text-viral-muted/40"}`}>
                  {hasVideo || realSceneVideos.length > 0 ? "✓" : "—"}
                </span>
                <p className="text-[10px] text-viral-muted mt-1">Vídeo</p>
              </div>
            </div>
          </div>

          {/* Video player (se disponivel) */}
          {hasVideo && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
                🎬 Vídeo Final
              </h4>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video controls src={videoUrl!} className="w-full max-w-md rounded border border-viral-border/40" />
            </div>
          )}

          {/* Vídeos por cena (lip sync) */}
          {realSceneVideos.length > 0 && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
                🎬 Vídeos gerados ({realSceneVideos.length} cenas com lip sync)
              </h4>
              <p className="text-[10px] text-viral-muted mb-3">
                Cada cena foi animada com lip sync via IA. Use esses vídeos para montar o reel final.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {realSceneVideos.map((vid, i) => {
                  const char = characters.find((c) => {
                    const cid = c.id ?? "";
                    return cid && vid.sceneId && vid.sceneId.includes(cid);
                  });
                  return (
                    <div
                      key={i}
                      className="rounded-lg overflow-hidden border border-viral-border/40"
                    >
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video
                        controls
                        src={vid.videoUrl}
                        className="w-full aspect-[9/16] object-cover"
                        preload="metadata"
                      />
                      <div className="p-2 bg-viral-bg/60 flex items-center gap-2">
                        {char?.emoji && (
                          <span className="text-sm">{char.emoji}</span>
                        )}
                        <span className="text-[10px] text-viral-text font-medium truncate">
                          {char?.name_pt ?? `Cena ${i + 1}`}
                        </span>
                        <span className="text-[9px] text-viral-muted uppercase ml-auto">
                          {vid.sceneType} · {(vid.durationMs / 1000).toFixed(1)}s
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Galeria de imagens FLUX */}
          {realImages.length > 0 && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
                🎨 Imagens geradas ({realImages.length} cenas)
              </h4>
              <p className="text-[10px] text-viral-muted mb-3">
                Imagens 3D Pixar geradas via FLUX Pro. Clique para abrir em tela cheia.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {realImages.map((img, i) => {
                  const char = characters.find((c) => {
                    const cid = c.id ?? "";
                    return cid && img.sceneId && img.sceneId.includes(cid);
                  });
                  return (
                    <a
                      key={i}
                      href={img.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block rounded-lg overflow-hidden border border-viral-border/40 hover:border-viral-accent/60 transition"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.imageUrl}
                        alt={`Cena ${img.sceneType} - ${char?.name_pt ?? ""}`}
                        className="w-full aspect-[9/16] object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="flex items-center gap-1">
                          {char?.emoji && <span className="text-xs">{char.emoji}</span>}
                          <span className="text-[10px] text-white font-medium truncate">
                            {char?.name_pt ?? img.sceneType}
                          </span>
                        </div>
                        <span className="text-[9px] text-white/60 uppercase">{img.sceneType}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Áudios ElevenLabs */}
          {realAudios.length > 0 && (
            <div className="card p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
                🎙️ Áudios gerados ({realAudios.length} cenas)
              </h4>
              <p className="text-[10px] text-viral-muted mb-3">
                Narração gerada via ElevenLabs. Ouça cada cena individualmente.
              </p>
              <div className="space-y-2">
                {realAudios.map((audio, i) => {
                  const char = characters.find((c) => {
                    const cid = c.id ?? "";
                    if (!cid) return false;
                    return (audio.objectId && audio.objectId.includes(cid)) ||
                           (audio.sceneId && audio.sceneId.includes(cid));
                  });
                  return (
                    <div key={i} className="flex items-center gap-3 bg-viral-bg/60 rounded-lg p-3 border border-viral-border/30">
                      <span className="text-lg flex-shrink-0">{char?.emoji ?? "🎙️"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-viral-text truncate">
                          {char?.name_pt ?? `Cena ${i + 1}`}
                          <span className="text-viral-muted ml-1">· {audio.sceneType}</span>
                        </div>
                        {audio.durationMs > 0 && (
                          <div className="text-[10px] text-viral-muted">
                            {(audio.durationMs / 1000).toFixed(1)}s
                          </div>
                        )}
                      </div>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <audio controls src={audio.audioUrl} className="h-8 max-w-[200px]" preload="none" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dica de montagem */}
          {realSceneVideos.length > 0 && !hasVideo && (
            <div className="card p-4 bg-viral-accent/5 border-viral-accent/20">
              <p className="text-xs text-viral-accent">
                💡 <strong>Dica:</strong> Use os vídeos de cena acima para montar seu reel no CapCut. Junte na ordem, adicione legendas e trilha sonora. Montagem automática em breve!
              </p>
            </div>
          )}
          {realImages.length > 0 && realSceneVideos.length === 0 && !hasVideo && (
            <div className="card p-4 bg-viral-accent/5 border-viral-accent/20">
              <p className="text-xs text-viral-accent">
                💡 <strong>Dica:</strong> Use as imagens e áudios acima para montar seu vídeo no CapCut ou editor de sua preferência.
              </p>
            </div>
          )}

          {/* Info do pacote */}
          <div className="card p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
              📊 Informações do Pacote
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-viral-bg/60 rounded p-3 text-center">
                <div className="text-xl font-bold text-viral-accent">{characters.length}</div>
                <div className="text-[10px] text-viral-muted uppercase">Personagens</div>
              </div>
              <div className="bg-viral-bg/60 rounded p-3 text-center">
                <div className="text-xl font-bold text-viral-accent">{meta?.duration ?? 30}s</div>
                <div className="text-[10px] text-viral-muted uppercase">Duração</div>
              </div>
              <div className="bg-viral-bg/60 rounded p-3 text-center">
                <div className="text-xl font-bold text-viral-accent">{meta?.format ?? "A"}</div>
                <div className="text-[10px] text-viral-muted uppercase">Formato</div>
              </div>
              <div className="bg-viral-bg/60 rounded p-3 text-center">
                <div className="text-xl font-bold text-viral-accent">
                  {parseHashtags(postCopy?.hashtags_pt).length}
                </div>
                <div className="text-[10px] text-viral-muted uppercase">Hashtags</div>
              </div>
            </div>
          </div>

          {/* Elenco */}
          <div className="card p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
              🎭 Elenco
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {characters.map((char, i) => {
                const charId = char.id ?? `char-${i}`;
                const charImage = realImages.find((img) => charId && img.sceneId && img.sceneId.includes(charId));
                return (
                  <div key={i} className="bg-viral-bg/60 rounded-lg overflow-hidden border border-viral-border/30">
                    {charImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={charImage.imageUrl}
                        alt={char.name_pt ?? ""}
                        className="w-full aspect-square object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center bg-viral-border/10">
                        <span className="text-4xl">{char.emoji ?? "🎭"}</span>
                      </div>
                    )}
                    <div className="p-2 text-center">
                      <div className="text-xs font-medium text-viral-text">{char.name_pt}</div>
                      {char.timestamp_start && (
                        <div className="text-[10px] text-viral-muted">{char.timestamp_start}–{char.timestamp_end}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
