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
  post_copy?: PostCopy;
  variations?: Array<{
    title_pt?: string;
    title_en?: string;
    hook_pt?: string;
    hook_en?: string;
    description_pt?: string;
    description_en?: string;
  }>;
}

interface Props {
  pkg: PackageData;
  sceneImages?: Array<{ sceneId: string; imageUrl: string; sceneType: string }> | null;
  videoUrl?: string | null;
}

type Tab = "roteiro" | "voz" | "post" | "preview";

const TAB_CONFIG: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "roteiro", label: "Roteiro", icon: "🎬" },
  { id: "voz", label: "Voz", icon: "🎙️" },
  { id: "post", label: "Post", icon: "📱" },
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

export default function GenerationDetail({ pkg, sceneImages, videoUrl }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("roteiro");

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

              {/* Imagem da cena (se disponivel) */}
              {sceneImages && sceneImages.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto">
                  {sceneImages
                    .filter((img) => img.sceneId.includes(char.id ?? `char-${idx}`))
                    .map((img, i) => (
                      img.imageUrl.startsWith("http") && !img.imageUrl.includes("placehold") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={img.imageUrl}
                          alt={`${char.name_pt} - ${img.sceneType}`}
                          className="w-20 h-32 object-cover rounded border border-viral-border/40"
                          loading="lazy"
                        />
                      ) : null
                    ))}
                </div>
              )}

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

      {/* PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          {/* Video */}
          <div className="card p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
              🎬 Vídeo Final
            </h4>
            {videoUrl && videoUrl.startsWith("http") ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video controls src={videoUrl} className="w-full max-w-md rounded border border-viral-border/40" />
            ) : (
              <div className="flex items-center gap-2 text-sm text-viral-muted py-4">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Vídeo em processamento...
              </div>
            )}
          </div>

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

          {/* Personagens resumo */}
          <div className="card p-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-viral-muted mb-3">
              🎭 Elenco
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {characters.map((char, i) => (
                <div key={i} className="bg-viral-bg/60 rounded p-3 text-center">
                  <div className="text-2xl mb-1">{char.emoji ?? "🎭"}</div>
                  <div className="text-xs font-medium text-viral-text">{char.name_pt}</div>
                  {char.timestamp_start && (
                    <div className="text-[10px] text-viral-muted">{char.timestamp_start}–{char.timestamp_end}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
