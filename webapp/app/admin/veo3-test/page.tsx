"use client";

import { useState } from "react";

interface DebugResult {
  success: boolean;
  elapsedMs?: number;
  diagnostics?: Record<string, unknown>;
  videoUrl?: string | null;
  rawResponse?: unknown;
  errorDetails?: Record<string, unknown>;
  error?: string;
}

const PRESETS = [
  {
    label: "Cacto falante (imagem real de prod)",
    imageUrl: "https://v3b.fal.media/files/b/0a974914/qxb3ehpxdCmugveyh6XgJ_4184e23fa511401595815390ba63c505.jpg",
    speechText: "Eu sou o Cacto, resistente no calor do Brasil.",
  },
  {
    label: "Sem áudio (só imagem → vídeo mudo)",
    imageUrl: "https://v3b.fal.media/files/b/0a974914/qxb3ehpxdCmugveyh6XgJ_4184e23fa511401595815390ba63c505.jpg",
    speechText: "",
    generateAudio: false,
  },
  {
    label: "Duração curta (4s)",
    imageUrl: "https://v3b.fal.media/files/b/0a974914/qxb3ehpxdCmugveyh6XgJ_4184e23fa511401595815390ba63c505.jpg",
    speechText: "Oi!",
    duration: "4s" as const,
  },
];

export default function Veo3TestPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [log, setLog] = useState<string[]>([]);

  async function runTest(preset: typeof PRESETS[number]) {
    setRunning(true);
    setResult(null);
    const ts = new Date().toLocaleTimeString("pt-BR");
    setLog((prev) => [...prev, `[${ts}] Iniciando: ${preset.label}...`]);

    try {
      const res = await fetch("/api/debug/veo3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const data = await res.json();
      setResult(data);
      const ts2 = new Date().toLocaleTimeString("pt-BR");
      setLog((prev) => [
        ...prev,
        `[${ts2}] ${data.success ? "✓ SUCESSO" : "✗ FALHA"} em ${data.elapsedMs}ms`,
      ]);
    } catch (err) {
      setResult({ success: false, error: err instanceof Error ? err.message : String(err) });
      setLog((prev) => [...prev, `[err] ${err}`]);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <header>
        <h1 className="text-xl font-bold text-viral-text">Veo 3 Fast — Debug Console</h1>
        <p className="text-xs text-viral-muted mt-1">
          Testa a API do Fal.ai Veo 3 isoladamente. Isola bugs de wizard vs provider.
        </p>
      </header>

      <div className="card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-viral-muted mb-3">
          Presets de teste
        </h2>
        <div className="space-y-2">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => runTest(p)}
              disabled={running}
              className="btn-primary w-full justify-start disabled:opacity-50 text-sm"
            >
              {running ? "⏳ Rodando..." : "▶"} {p.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-viral-muted mt-3">
          ⏱ Cada teste demora 60–120s. Cenas com <code>generate_audio=true</code> podem chegar a 3min.
        </p>
      </div>

      {log.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-viral-muted mb-3">
            Log
          </h2>
          <div className="space-y-1 font-mono text-[11px] text-viral-muted">
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}

      {result && (
        <>
          <div className={`card p-5 border-2 ${result.success ? "border-emerald-500/40" : "border-red-500/40"}`}>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3">
              {result.success ? "✓ Sucesso" : "✗ Falha"}
              {result.elapsedMs && <span className="ml-2 text-viral-muted">· {(result.elapsedMs / 1000).toFixed(1)}s</span>}
            </h2>
            {result.videoUrl && (
              <div className="mb-3">
                <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-1">Video URL</div>
                <a href={result.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-viral-accent hover:underline break-all">
                  {result.videoUrl}
                </a>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video controls src={result.videoUrl} className="w-full max-w-xs mt-2 rounded border border-viral-border/40" />
              </div>
            )}
            {result.errorDetails && (
              <div>
                <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-1">Error</div>
                <pre className="text-[10px] font-mono text-red-400 bg-red-500/5 p-3 rounded overflow-x-auto whitespace-pre-wrap">
{JSON.stringify(result.errorDetails, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <details className="card p-5">
            <summary className="text-sm font-semibold uppercase tracking-wider text-viral-muted cursor-pointer">
              Diagnostics
            </summary>
            <pre className="text-[10px] font-mono text-viral-muted bg-viral-bg/60 p-3 rounded mt-3 overflow-x-auto">
{JSON.stringify(result.diagnostics, null, 2)}
            </pre>
          </details>

          {result.rawResponse !== undefined && (
            <details className="card p-5">
              <summary className="text-sm font-semibold uppercase tracking-wider text-viral-muted cursor-pointer">
                Raw Response (Fal)
              </summary>
              <pre className="text-[10px] font-mono text-viral-muted bg-viral-bg/60 p-3 rounded mt-3 overflow-x-auto max-h-96">
{JSON.stringify(result.rawResponse, null, 2)}
              </pre>
            </details>
          )}
        </>
      )}
    </div>
  );
}
