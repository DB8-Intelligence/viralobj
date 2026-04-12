"use client";

import { useState } from "react";
import { NICHES } from "@/lib/niches-data";

interface GenerateResult {
  meta?: {
    topic_pt?: string;
    topic_en?: string;
    niche?: string;
    tone?: string;
  };
  characters?: Array<{
    name_pt?: string;
    name_en?: string;
    emoji?: string;
    personality?: string;
    voice_script_pt?: string;
  }>;
  post_copy?: {
    caption_pt?: string;
    caption_en?: string;
    hashtags_pt?: string[];
    hashtags_en?: string[];
  };
  provider_used?: string;
}

export default function GeneratePage() {
  const [niche, setNiche] = useState("casa");
  const [objects, setObjects] = useState("água sanitária, lixeira, celular");
  const [topic, setTopic] = useState("erros de higiene doméstica");
  const [tone, setTone] = useState("angry");
  const [duration, setDuration] = useState(30);
  const [provider, setProvider] = useState("auto");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-package", {
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro desconhecido");
      setResult(data.package);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Gerar Reel</h1>
        <p className="text-viral-muted">
          Preencha os campos e a IA monta o pacote completo: roteiro, prompts visuais, legendas e hashtags.
        </p>
      </header>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 h-fit space-y-4">
          <div>
            <label className="label">Nicho</label>
            <select
              className="input"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            >
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
              placeholder="água sanitária, lixeira, celular"
            />
          </div>

          <div>
            <label className="label">Tópico</label>
            <input
              type="text"
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="erros de higiene doméstica"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tom</label>
              <select
                className="input"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="angry">angry</option>
                <option value="funny">funny</option>
                <option value="educational">educational</option>
                <option value="dramatic">dramatic</option>
                <option value="cute">cute</option>
                <option value="sarcastic">sarcastic</option>
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

          <div>
            <label className="label">LLM Provider</label>
            <select
              className="input"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="auto">auto (fallback chain)</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="openai">OpenAI GPT</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Gerando…" : "Gerar pacote →"}
          </button>

          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}
        </form>

        {/* Result */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="card p-10 text-center text-viral-muted text-sm">
              O pacote gerado vai aparecer aqui.
            </div>
          )}

          {loading && (
            <div className="card p-10 text-center text-viral-muted text-sm">
              <div className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-viral-accent animate-pulse" />
                Gerando pacote com IA… (5–30s)
              </div>
            </div>
          )}

          {result && (
            <>
              <div className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-viral-muted mb-1">
                      {result.meta?.niche} · {result.meta?.tone}
                    </div>
                    <h2 className="text-2xl font-bold">{result.meta?.topic_pt}</h2>
                    <p className="text-sm text-viral-muted">{result.meta?.topic_en}</p>
                  </div>
                  {result.provider_used && (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-viral-accent2/10 text-viral-accent2 font-mono">
                      {result.provider_used}
                    </span>
                  )}
                </div>
              </div>

              {result.characters && result.characters.length > 0 && (
                <div className="card p-6">
                  <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-viral-muted">
                    Personagens ({result.characters.length})
                  </h3>
                  <div className="space-y-4">
                    {result.characters.map((c, i) => (
                      <div key={i} className="border-l-2 border-viral-accent/60 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{c.emoji ?? "●"}</span>
                          <span className="font-semibold">{c.name_pt}</span>
                          <span className="text-xs text-viral-muted">— {c.name_en}</span>
                        </div>
                        {c.personality && (
                          <div className="text-xs text-viral-muted italic mb-1">
                            {c.personality}
                          </div>
                        )}
                        {c.voice_script_pt && (
                          <div className="text-sm text-viral-text/90 mt-2">
                            {c.voice_script_pt}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.post_copy && (
                <div className="card p-6">
                  <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-viral-muted">
                    Post Copy
                  </h3>
                  {result.post_copy.caption_pt && (
                    <div className="mb-4">
                      <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-1">
                        Caption PT
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {result.post_copy.caption_pt}
                      </p>
                    </div>
                  )}
                  {result.post_copy.hashtags_pt && result.post_copy.hashtags_pt.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-1">
                        Hashtags ({result.post_copy.hashtags_pt.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {result.post_copy.hashtags_pt.map((h, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-viral-accent/10 text-viral-accent"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <details className="card p-6">
                <summary className="cursor-pointer font-semibold text-sm uppercase tracking-wider text-viral-muted">
                  JSON completo
                </summary>
                <pre className="mt-4 text-[11px] text-viral-muted overflow-x-auto bg-viral-bg/60 rounded-lg p-4 max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
