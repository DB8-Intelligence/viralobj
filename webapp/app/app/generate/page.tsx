"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NICHES } from "@/lib/niches-data";
import type { ObjectTone } from "@/lib/viral-objects/object-bible";

const TONE_OPTIONS: Array<{ label: string; value: ObjectTone }> = [
  { label: "Angry", value: "dramatic" },
  { label: "Educational", value: "motivational" },
  { label: "Cute", value: "funny" },
  { label: "Dramatic", value: "dramatic" },
  { label: "Funny", value: "funny" },
  { label: "Emotional", value: "emotional" },
  { label: "Sarcastic", value: "sarcastic" },
  { label: "Motivational", value: "motivational" },
];

export default function AppGeneratePage() {
  const router = useRouter();
  const [niche, setNiche] = useState("casa");
  const [objects, setObjects] = useState("água sanitária, lixeira, celular");
  const [topic, setTopic] = useState("erros de higiene doméstica");
  const [tone, setTone] = useState<ObjectTone>("dramatic");
  const [duration, setDuration] = useState(30);
  const [provider, setProvider] = useState("auto");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus("Criando roteiro com IA...");

    try {
      const statusSteps = [
        "Criando roteiro com IA...",
        "Gerando identidade visual dos objetos...",
        "Montando cenas e prompts...",
        "Gerando imagens 3D (FLUX Pro)...",
        "Gerando narração (ElevenLabs)...",
        "Montando timeline do vídeo...",
        "Finalizando...",
      ];

      // Simular progresso visual enquanto a API processa
      let stepIdx = 0;
      const progressTimer = setInterval(() => {
        stepIdx = Math.min(stepIdx + 1, statusSteps.length - 1);
        setStatus(statusSteps[stepIdx]);
      }, 8000);

      const res = await fetch("/api/app/generate-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          objects: objects.split(",").map((s) => s.trim()).filter(Boolean),
          topic,
          tone,
          duration,
          lang: "both",
          provider,
        }),
      });

      clearInterval(progressTimer);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");

      setStatus("Pronto! Redirecionando...");
      router.push(`/app/history`);
      router.refresh();
    } catch (err: unknown) {
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
          Preencha e a IA monta o pacote completo. Salva automaticamente no seu histórico.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Nicho</label>
          <select className="input" value={niche} onChange={(e) => setNiche(e.target.value)}>
            {NICHES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Objetos (separados por vírgula)</label>
          <input
            type="text"
            className="input"
            value={objects}
            onChange={(e) => setObjects(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Tópico</label>
          <input
            type="text"
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tom</label>
            <select
              className="input"
              value={tone}
              onChange={(e) => setTone(e.target.value as ObjectTone)}
            >
              {TONE_OPTIONS.map((opt, i) => (
                <option key={`${opt.label}-${i}`} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Duração (s)</label>
            <select
              className="input"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={45}>45s</option>
              <option value={60}>60s</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Gerando…" : "Gerar pacote →"}
          </button>
          {!loading && (
            <Link href="/app" className="btn-secondary">
              Cancelar
            </Link>
          )}
        </div>

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

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
