"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NICHES } from "@/lib/niches-data";
import { NICHE_CONFIGS, TONE_OPTIONS } from "@/lib/niche-objects-data";
import type { ObjectTone } from "@/lib/viral-objects/object-bible";

export default function AppGeneratePage() {
  const router = useRouter();
  const [niche, setNiche] = useState("casa");
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [tone, setTone] = useState<ObjectTone>("dramatic");
  const [duration, setDuration] = useState(30);
  const [mode, setMode] = useState<"single" | "multi">("multi");

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
      setSelectedObjects((prev) =>
        prev.includes(objId) ? [] : [objId]
      );
    } else {
      setSelectedObjects((prev) =>
        prev.includes(objId)
          ? prev.filter((id) => id !== objId)
          : prev.length < 5 ? [...prev, objId] : prev
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

    const statusSteps = [
      "Criando roteiro com IA...",
      "Gerando identidade visual dos personagens...",
      "Montando cenas e prompts...",
      "Gerando imagens 3D (FLUX Pro)...",
      "Gerando narração com voz natural...",
      "Montando timeline do vídeo...",
      "Finalizando...",
    ];

    let stepIdx = 0;
    const progressTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, statusSteps.length - 1);
      setStatus(statusSteps[stepIdx]);
    }, 8000);

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
        }),
      });

      clearInterval(progressTimer);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");

      setStatus("Pronto! Redirecionando...");
      router.push(`/app/history`);
      router.refresh();
    } catch (err: unknown) {
      clearInterval(progressTimer);
      setError(err instanceof Error ? err.message : String(err));
      setStatus(null);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold mb-1">Nova geração</h1>
        <p className="text-viral-muted">
          Escolha o nicho, selecione os personagens e o tópico. A IA gera tudo automaticamente.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* NICHO */}
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

        {/* MODO: 1 personagem ou varios */}
        <div className="card p-5">
          <label className="label mb-3">Tipo de vídeo</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setMode("single"); setSelectedObjects(selectedObjects.slice(0, 1)); }}
              className={`p-4 rounded-lg border transition text-center ${
                mode === "single"
                  ? "border-viral-accent bg-viral-accent/10"
                  : "border-viral-border/40 hover:border-viral-border"
              }`}
            >
              <div className="text-2xl mb-1">🎭</div>
              <div className="font-medium text-sm">Um personagem</div>
              <div className="text-[10px] text-viral-muted mt-1">
                Foco em um objeto falando sobre o tema
              </div>
            </button>
            <button
              type="button"
              onClick={() => setMode("multi")}
              className={`p-4 rounded-lg border transition text-center ${
                mode === "multi"
                  ? "border-viral-accent bg-viral-accent/10"
                  : "border-viral-border/40 hover:border-viral-border"
              }`}
            >
              <div className="text-2xl mb-1">🎬</div>
              <div className="font-medium text-sm">Vários personagens</div>
              <div className="text-[10px] text-viral-muted mt-1">
                Até 5 objetos no mesmo vídeo
              </div>
            </button>
          </div>
        </div>

        {/* PERSONAGENS */}
        <div className="card p-5">
          <label className="label mb-1">
            Personagens {mode === "single" ? "(escolha 1)" : `(${selectedObjects.length}/5)`}
          </label>
          <p className="text-xs text-viral-muted mb-3">
            Clique para selecionar os objetos falantes do seu vídeo.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {objects.map((obj) => {
              const isSelected = selectedObjects.includes(obj.id);
              return (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => toggleObject(obj.id)}
                  className={`p-3 rounded-lg border transition text-center ${
                    isSelected
                      ? "border-viral-accent bg-viral-accent/10 ring-1 ring-viral-accent"
                      : "border-viral-border/40 hover:border-viral-border"
                  }`}
                >
                  <div className="text-2xl mb-1">{obj.emoji}</div>
                  <div className="text-xs font-medium truncate">{obj.name}</div>
                </button>
              );
            })}
          </div>
          {!config && (
            <p className="text-xs text-viral-muted mt-2 italic">
              Personagens não disponíveis para este nicho ainda.
            </p>
          )}
        </div>

        {/* TOPICO */}
        <div className="card p-5">
          <label className="label mb-1">Tópico</label>
          <p className="text-xs text-viral-muted mb-3">
            Escolha um tópico sugerido ou escreva o seu.
          </p>
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
          <div>
            <input
              type="text"
              className="input"
              placeholder="Ou escreva seu próprio tópico..."
              value={customTopic}
              onChange={(e) => { setCustomTopic(e.target.value); setSelectedTopic(""); }}
            />
          </div>
        </div>

        {/* TOM */}
        <div className="card p-5">
          <label className="label mb-3">Tom do personagem</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id as ObjectTone)}
                className={`p-3 rounded-lg border transition text-center ${
                  tone === t.id
                    ? "border-viral-accent bg-viral-accent/10"
                    : "border-viral-border/40 hover:border-viral-border"
                }`}
              >
                <div className="text-xl mb-1">{t.emoji}</div>
                <div className="text-xs font-medium">{t.label}</div>
                <div className="text-[10px] text-viral-muted mt-0.5">{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* DURACAO */}
        <div className="card p-5">
          <label className="label mb-3">Duração do vídeo</label>
          <div className="grid grid-cols-4 gap-2">
            {[15, 30, 45, 60].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`p-3 rounded-lg border transition text-center ${
                  duration === d
                    ? "border-viral-accent bg-viral-accent/10"
                    : "border-viral-border/40 hover:border-viral-border"
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

        {/* RESUMO + BOTAO */}
        <div className="card p-5">
          <div className="text-xs text-viral-muted mb-3">
            <strong>Resumo:</strong>{" "}
            {selectedObjects.length > 0
              ? `${getObjectNames().join(", ")} · ${getFinalTopic() || "sem tópico"} · ${tone} · ${duration}s`
              : "Selecione personagens e tópico acima"}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Gerando…" : "Gerar vídeo →"}
            </button>
            {!loading && (
              <Link href="/app" className="btn-secondary">
                Cancelar
              </Link>
            )}
          </div>
        </div>

        {/* PROGRESSO */}
        {loading && status && (
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-300 font-medium">{status}</p>
              <p className="text-xs text-blue-400/70 mt-1">
                Isso pode levar até 2 minutos. Não feche esta página.
              </p>
            </div>
          </div>
        )}

        {/* ERRO */}
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
