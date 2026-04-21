"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NICHES } from "@/lib/niches-data";
import { NICHE_CONFIGS, TONE_OPTIONS } from "@/lib/niche-objects-data";
import type { ObjectTone } from "@/lib/viral-objects/object-bible";

// ─── Tipos do wizard ──────────────────────────────────────────────

type WizardStep = "input" | "images" | "script" | "audio" | "video" | "music";

interface GeneratedImage {
  sceneId: string;
  sceneType: string;
  imageUrl: string;
  objectId: string;
}

interface CharacterScript {
  id: string;
  name_pt: string;
  emoji: string;
  voice_script_pt: string;
  voice_script_en?: string;
}

interface GeneratedAudio {
  sceneId: string;
  sceneType: string;
  audioUrl: string;
  objectId: string;
  durationMs: number;
}

interface SceneVideo {
  sceneId: string;
  sceneType: string;
  videoUrl: string;
  durationMs: number;
}

const STEPS: { key: WizardStep; label: string; icon: string }[] = [
  { key: "input", label: "Tema", icon: "1" },
  { key: "images", label: "Imagens", icon: "2" },
  { key: "script", label: "Roteiro", icon: "3" },
  { key: "audio", label: "Voz", icon: "4" },
  { key: "video", label: "Vídeo", icon: "5" },
  { key: "music", label: "Música", icon: "6" },
];

export default function AppGeneratePage() {
  const router = useRouter();

  // ─── Estado do wizard ───────────────────────────────────────────
  const [step, setStep] = useState<WizardStep>("input");
  const [generationId, setGenerationId] = useState<string | null>(null);

  // Etapa 1: Input
  const [niche, setNiche] = useState("casa");
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [tone, setTone] = useState<ObjectTone>("dramatic");
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState<"single" | "multi">("multi");

  // Etapa 2: Imagens
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [approvedImages, setApprovedImages] = useState<Set<string>>(new Set());

  // Etapa 3: Roteiro
  const [characters, setCharacters] = useState<CharacterScript[]>([]);
  const [editedScripts, setEditedScripts] = useState<Record<string, string>>({});

  // Etapa 4: Áudio
  const [audios, setAudios] = useState<GeneratedAudio[]>([]);

  // Etapa 5: Vídeo
  const [videos, setVideos] = useState<SceneVideo[]>([]);

  // Global
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = NICHE_CONFIGS[niche];
  const objects = config?.objects ?? [];
  const topics = config?.topics ?? [];

  function handleNicheChange(newNiche: string) {
    setNiche(newNiche);
    setSelectedObjects([]);
    setSelectedTopic("");
    setCustomTopic("");
  }

  function toggleObject(objId: string) {
    if (mode === "single") {
      setSelectedObjects((prev) => (prev.includes(objId) ? [] : [objId]));
    } else {
      setSelectedObjects((prev) =>
        prev.includes(objId)
          ? prev.filter((id) => id !== objId)
          : prev.length < 5
            ? [...prev, objId]
            : prev,
      );
    }
  }

  function getObjectNames(): string[] {
    return selectedObjects.map((id) => {
      const obj = objects.find((o) => o.id === id);
      return obj?.name ?? id;
    });
  }

  function getFinalTopic(): string {
    if (customTopic.trim()) return customTopic.trim();
    const topic = topics.find((t) => t.id === selectedTopic);
    return topic?.label ?? selectedTopic;
  }

  function toggleImageApproval(sceneId: string) {
    setApprovedImages((prev) => {
      const next = new Set(prev);
      if (next.has(sceneId)) next.delete(sceneId);
      else next.add(sceneId);
      return next;
    });
  }

  function updateScript(charId: string, text: string) {
    setEditedScripts((prev) => ({ ...prev, [charId]: text }));
  }

  // ─── Etapa 1 → 2: Gerar roteiro + imagens ──────────────────────
  async function handleGenerateScriptAndImages() {
    if (selectedObjects.length === 0) {
      setError("Selecione pelo menos um personagem.");
      return;
    }
    if (!selectedTopic && !customTopic.trim()) {
      setError("Selecione ou escreva um tópico.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus("Criando roteiro com IA...");

    try {
      const res = await fetch("/api/app/generate-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          objects: getObjectNames(),
          topic: getFinalTopic(),
          tone,
          duration,
          lang: "both",
          provider: "auto",
          wizardMode: true, // Sinaliza para parar após imagens
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");

      setGenerationId(data.generation_id);

      // Extrair personagens do pacote
      const chars = (data.package?.characters ?? []).map((c: any) => ({
        id: c.id ?? c.name_pt,
        name_pt: c.name_pt,
        emoji: c.emoji ?? "🎭",
        voice_script_pt: c.voice_script_pt ?? "",
        voice_script_en: c.voice_script_en ?? "",
      }));
      setCharacters(chars);

      // Inicializar scripts editáveis
      const scripts: Record<string, string> = {};
      chars.forEach((c: CharacterScript) => {
        scripts[c.id] = c.voice_script_pt;
      });
      setEditedScripts(scripts);

      // Extrair imagens geradas
      const imgs = data.scene_images ?? [];
      setImages(imgs);

      // Aprovar todas por padrão (usuário pode desmarcar)
      setApprovedImages(new Set(imgs.map((i: GeneratedImage) => i.sceneId)));

      setStatus(null);
      setStep("images");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  // ─── Etapa 2 → 3: Aprovar imagens, ir para roteiro ─────────────
  function handleApproveImages() {
    if (approvedImages.size === 0) {
      setError("Selecione pelo menos uma imagem.");
      return;
    }
    setError(null);
    setStep("script");
  }

  // ─── Etapa 3 → 4: Aprovar roteiro, gerar áudio ─────────────────
  async function handleApproveScriptAndGenerateAudio() {
    setLoading(true);
    setError(null);
    setStatus("Gerando narração com voz natural...");

    try {
      const res = await fetch("/api/app/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generation_id: generationId,
          edited_scripts: editedScripts,
          approved_images: Array.from(approvedImages),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar áudio");

      setAudios(data.scene_audios ?? []);
      setStatus(null);
      setStep("audio");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  // ─── Etapa 4 → 5: Aprovar áudio, gerar vídeo ──────────────────
  async function handleApproveAudioAndGenerateVideo() {
    setLoading(true);
    setError(null);
    setStatus("Gerando vídeos com lip sync...");

    try {
      const res = await fetch("/api/app/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generation_id: generationId,
          approved_images: Array.from(approvedImages),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar vídeo");

      setVideos(data.scene_videos ?? []);
      setStatus(null);
      setStep("video");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  // ─── Etapa 5 → 6: Ir para música ──────────────────────────────
  function handleGoToMusic() {
    setStep("music");
  }

  // ─── Etapa 6: Finalizar ───────────────────────────────────────
  function handleFinalize() {
    router.push("/app/history");
    router.refresh();
  }

  // ─── Stepper visual ───────────────────────────────────────────
  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-1">Nova geração</h1>
        <p className="text-viral-muted text-sm">
          Siga as etapas para criar seu vídeo com aprovação em cada passo.
        </p>
      </header>

      {/* STEPPER */}
      <div className="card p-4">
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  i < currentStepIndex
                    ? "bg-emerald-500/20 text-emerald-400"
                    : i === currentStepIndex
                      ? "bg-viral-accent/20 text-viral-accent ring-2 ring-viral-accent"
                      : "bg-viral-border/20 text-viral-muted/40"
                }`}
              >
                {i < currentStepIndex ? "✓" : s.icon}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:inline ${
                  i === currentStepIndex ? "text-viral-accent" : "text-viral-muted/60"
                }`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-1 ${
                    i < currentStepIndex ? "bg-emerald-500/40" : "bg-viral-border/30"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ETAPA 1: INPUT ═══ */}
      {step === "input" && (
        <div className="space-y-5">
          {/* Nicho */}
          <div className="card p-5">
            <label className="label mb-3">Nicho</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {NICHES.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleNicheChange(n.id)}
                  className={`text-left p-3 rounded-lg border transition text-sm ${
                    niche === n.id
                      ? "border-viral-accent bg-viral-accent/10 text-viral-accent"
                      : "border-viral-border/40 hover:border-viral-border"
                  }`}
                >
                  <div className="font-medium">{n.label}</div>
                  <div className="text-[10px] text-viral-muted mt-0.5">
                    {n.objects_count} personagens
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Modo */}
          <div className="card p-5">
            <label className="label mb-3">Tipo de vídeo</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setMode("single"); setSelectedObjects(selectedObjects.slice(0, 1)); }}
                className={`p-4 rounded-lg border transition text-center ${
                  mode === "single" ? "border-viral-accent bg-viral-accent/10" : "border-viral-border/40 hover:border-viral-border"
                }`}
              >
                <div className="text-2xl mb-1">🎭</div>
                <div className="font-medium text-sm">Um personagem</div>
              </button>
              <button
                type="button"
                onClick={() => setMode("multi")}
                className={`p-4 rounded-lg border transition text-center ${
                  mode === "multi" ? "border-viral-accent bg-viral-accent/10" : "border-viral-border/40 hover:border-viral-border"
                }`}
              >
                <div className="text-2xl mb-1">🎬</div>
                <div className="font-medium text-sm">Vários personagens</div>
              </button>
            </div>
          </div>

          {/* Personagens */}
          <div className="card p-5">
            <label className="label mb-3">
              Personagens {mode === "single" ? "(escolha 1)" : `(${selectedObjects.length}/5)`}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {objects.map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => toggleObject(obj.id)}
                  className={`p-3 rounded-lg border transition text-center ${
                    selectedObjects.includes(obj.id)
                      ? "border-viral-accent bg-viral-accent/10 ring-1 ring-viral-accent"
                      : "border-viral-border/40 hover:border-viral-border"
                  }`}
                >
                  <div className="text-2xl mb-1">{obj.emoji}</div>
                  <div className="text-xs font-medium truncate">{obj.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tópico */}
          <div className="card p-5">
            <label className="label mb-3">Tópico</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setSelectedTopic(t.id); setCustomTopic(""); }}
                  className={`text-left p-3 rounded-lg border transition text-sm ${
                    selectedTopic === t.id
                      ? "border-viral-accent bg-viral-accent/10 text-viral-accent"
                      : "border-viral-border/40 hover:border-viral-border"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="input"
              placeholder="Ou escreva seu próprio tópico..."
              value={customTopic}
              onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(""); }}
            />
          </div>

          {/* Tom + Duração */}
          <div className="card p-5">
            <label className="label mb-3">Tom do personagem</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as ObjectTone)}
                  className={`p-3 rounded-lg border transition text-center ${
                    tone === t.id ? "border-viral-accent bg-viral-accent/10" : "border-viral-border/40 hover:border-viral-border"
                  }`}
                >
                  <div className="text-xl mb-1">{t.emoji}</div>
                  <div className="text-xs font-medium">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <label className="label mb-3">Duração do vídeo</label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`p-3 rounded-lg border transition text-center ${
                    duration === d ? "border-viral-accent bg-viral-accent/10" : "border-viral-border/40 hover:border-viral-border"
                  }`}
                >
                  <div className="font-bold">{d}s</div>
                  <div className="text-[10px] text-viral-muted">
                    {d === 15 ? "Curto" : d === 30 ? "Padrão" : d === 45 ? "Médio" : "Longo"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Botão avançar */}
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleGenerateScriptAndImages} className="btn-primary" disabled={loading}>
              {loading ? "Gerando..." : "Gerar roteiro e imagens →"}
            </button>
            <Link href="/app" className="btn-secondary">Cancelar</Link>
          </div>
        </div>
      )}

      {/* ═══ ETAPA 2: APROVAR IMAGENS ═══ */}
      {step === "images" && (
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-lg font-bold mb-1">Selecione as imagens que deseja usar</h2>
            <p className="text-xs text-viral-muted mb-4">
              Clique para selecionar/deselecionar. Apenas as imagens aprovadas serão usadas no vídeo final.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images
                .filter((img) => img.imageUrl.startsWith("http") && !img.imageUrl.includes("placehold"))
                .map((img) => (
                  <button
                    key={img.sceneId}
                    type="button"
                    onClick={() => toggleImageApproval(img.sceneId)}
                    className={`relative rounded-lg overflow-hidden border-2 transition ${
                      approvedImages.has(img.sceneId)
                        ? "border-emerald-400 ring-2 ring-emerald-400/30"
                        : "border-viral-border/40 opacity-50"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt={img.sceneId}
                      className="w-full aspect-[9/16] object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          approvedImages.has(img.sceneId) ? "bg-emerald-500 text-white" : "bg-black/50 text-white/50"
                        }`}
                      >
                        {approvedImages.has(img.sceneId) ? "✓" : ""}
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 p-2">
                      <span className="text-[10px] text-white uppercase">{img.sceneType}</span>
                    </div>
                  </button>
                ))}
            </div>
            <p className="text-xs text-viral-muted mt-3">
              {approvedImages.size} de {images.filter((i) => i.imageUrl.startsWith("http")).length} imagens selecionadas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep("input")} className="btn-secondary">
              ← Voltar
            </button>
            <button type="button" onClick={handleApproveImages} className="btn-primary">
              Aprovar imagens e continuar →
            </button>
          </div>
        </div>
      )}

      {/* ═══ ETAPA 3: APROVAR ROTEIRO ═══ */}
      {step === "script" && (
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-lg font-bold mb-1">Revise e edite o roteiro</h2>
            <p className="text-xs text-viral-muted mb-4">
              Edite o texto de fala de cada personagem. Este texto será usado para gerar a narração com voz.
            </p>
            <div className="space-y-4">
              {characters.map((char) => (
                <div key={char.id} className="bg-viral-bg/60 rounded-lg p-4 border border-viral-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{char.emoji}</span>
                    <span className="font-semibold text-sm">{char.name_pt}</span>
                  </div>
                  <textarea
                    value={editedScripts[char.id] ?? char.voice_script_pt}
                    onChange={(e) => updateScript(char.id, e.target.value)}
                    rows={4}
                    className="input w-full text-sm leading-relaxed"
                    placeholder="Texto de fala do personagem..."
                  />
                  <div className="text-[10px] text-viral-muted mt-1">
                    {(editedScripts[char.id] ?? char.voice_script_pt).length} caracteres
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep("images")} className="btn-secondary">
              ← Voltar
            </button>
            <button type="button" onClick={handleApproveScriptAndGenerateAudio} className="btn-primary" disabled={loading}>
              {loading ? "Gerando áudio..." : "Aprovar roteiro e gerar voz →"}
            </button>
          </div>
        </div>
      )}

      {/* ═══ ETAPA 4: OUVIR ÁUDIO ═══ */}
      {step === "audio" && (
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-lg font-bold mb-1">Ouça as narrações geradas</h2>
            <p className="text-xs text-viral-muted mb-4">
              Cada cena tem sua narração. Ouça e aprove antes de gerar os vídeos.
            </p>
            <div className="space-y-3">
              {audios
                .filter((a) => a.audioUrl && (a.audioUrl.startsWith("http") || a.audioUrl.startsWith("data:")))
                .map((audio, i) => {
                  const char = characters.find((c) => audio.sceneId.includes(c.id));
                  return (
                    <div key={i} className="flex items-center gap-3 bg-viral-bg/60 rounded-lg p-3 border border-viral-border/30">
                      <span className="text-lg flex-shrink-0">{char?.emoji ?? "🎙️"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {char?.name_pt ?? `Cena ${i + 1}`}
                          <span className="text-viral-muted ml-1">· {audio.sceneType}</span>
                        </div>
                        <div className="text-[10px] text-viral-muted">
                          {(audio.durationMs / 1000).toFixed(1)}s
                        </div>
                      </div>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <audio controls src={audio.audioUrl} className="h-8 max-w-[200px]" preload="none" />
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep("script")} className="btn-secondary">
              ← Voltar ao roteiro
            </button>
            <button type="button" onClick={handleApproveAudioAndGenerateVideo} className="btn-primary" disabled={loading}>
              {loading ? "Gerando vídeos..." : "Aprovar áudio e gerar vídeos →"}
            </button>
          </div>
        </div>
      )}

      {/* ═══ ETAPA 5: VÍDEOS GERADOS ═══ */}
      {step === "video" && (
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-lg font-bold mb-1">Vídeos gerados com lip sync</h2>
            <p className="text-xs text-viral-muted mb-4">
              Cada cena foi animada com lip sync via IA. Revise os vídeos abaixo.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videos
                .filter((v) => v.videoUrl.startsWith("http"))
                .map((vid, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-viral-border/40">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video controls src={vid.videoUrl} className="w-full aspect-[9/16] object-cover" preload="metadata" />
                    <div className="p-2 bg-viral-bg/60 text-center">
                      <span className="text-[10px] text-viral-muted uppercase">
                        {vid.sceneType} · {(vid.durationMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            {videos.filter((v) => v.videoUrl.startsWith("http")).length === 0 && (
              <div className="text-center text-viral-muted py-8">
                <p>Nenhum vídeo gerado ainda. Tente novamente.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep("audio")} className="btn-secondary">
              ← Voltar
            </button>
            <button type="button" onClick={handleGoToMusic} className="btn-primary">
              Continuar para trilha sonora →
            </button>
          </div>
        </div>
      )}

      {/* ═══ ETAPA 6: MÚSICA + FINALIZAR ═══ */}
      {step === "music" && (
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="text-lg font-bold mb-1">Trilha sonora e efeitos</h2>
            <p className="text-xs text-viral-muted mb-4">
              Em breve: seleção de fundo musical por tema e efeitos sonoros.
              Por enquanto, use o CapCut para adicionar trilha ao vídeo final.
            </p>
            <div className="bg-viral-accent/5 border border-viral-accent/20 rounded-lg p-4">
              <p className="text-xs text-viral-accent">
                💡 <strong>Dica:</strong> No CapCut, junte os vídeos das cenas na ordem, adicione uma trilha sonora
                do tema (busque por &quot;cinematic&quot; ou &quot;dramatic&quot;) e exporte em 9:16 para Instagram Reels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep("video")} className="btn-secondary">
              ← Voltar
            </button>
            <button type="button" onClick={handleFinalize} className="btn-primary">
              Finalizar e ir para o histórico →
            </button>
          </div>
        </div>
      )}

      {/* PROGRESSO */}
      {loading && status && (
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-300 font-medium">{status}</p>
            <p className="text-xs text-blue-400/70 mt-1">Isso pode levar alguns minutos. Não feche esta página.</p>
          </div>
        </div>
      )}

      {/* ERRO */}
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  );
}
