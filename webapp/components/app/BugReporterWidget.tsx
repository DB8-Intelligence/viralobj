"use client";

import { useState, useCallback } from "react";
import { usePathname } from "next/navigation";

interface ApiLogEntry {
  method: string;
  path: string;
  status: number;
  error?: string;
  timestamp: string;
  duration_ms: number;
}

// Ring buffer — últimas 10 requisições (in-memory, reseta em refresh)
const API_LOG_BUFFER: ApiLogEntry[] = [];
const MAX_LOG_SIZE = 10;

function recordApiCall(entry: ApiLogEntry) {
  API_LOG_BUFFER.push(entry);
  if (API_LOG_BUFFER.length > MAX_LOG_SIZE) API_LOG_BUFFER.shift();
}

/** Wrapper de fetch que registra no ring buffer */
export async function trackedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const start = Date.now();
  const method = init?.method?.toUpperCase() ?? "GET";
  const path = typeof input === "string" ? input : input.toString();

  try {
    const res = await fetch(input, init);
    recordApiCall({
      method,
      path,
      status: res.status,
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - start,
    });
    return res;
  } catch (err) {
    recordApiCall({
      method,
      path,
      status: 0,
      error: err instanceof Error ? err.message : "Network error",
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - start,
    });
    throw err;
  }
}

export function getApiLog(): ApiLogEntry[] {
  return [...API_LOG_BUFFER];
}

type Severity = "blocker" | "bug" | "suggestion";

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; icon: string }> = {
  blocker: { label: "Bloqueador", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: "🔴" },
  bug: { label: "Bug", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: "🟡" },
  suggestion: { label: "Sugestão", color: "text-blue-400 bg-blue-500/10 border-blue-500/30", icon: "🔵" },
};

export default function BugReporterWidget({ userEmail }: { userEmail?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("bug");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const pathname = usePathname();

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setSeverity("bug");
    setSuccess(false);
  }, []);

  const handleSubmit = async () => {
    if (title.trim().length < 3 || submitting) return;
    setSubmitting(true);

    try {
      const context = {
        url: window.location.href,
        route: pathname,
        user_agent: navigator.userAgent,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        api_log: getApiLog(),
        timestamp: new Date().toISOString(),
      };

      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), severity, context }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          reset();
        }, 1400);
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao enviar report");
      }
    } catch {
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!userEmail) return null;

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-viral-accent/90 text-white shadow-lg hover:bg-viral-accent hover:scale-105 transition-all flex items-center justify-center text-lg"
        title="Reportar bug"
      >
        🐛
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { if (!submitting) { setOpen(false); reset(); } }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {success ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">✅</div>
                <p className="text-sm text-viral-text font-medium">Report enviado!</p>
                <p className="text-xs text-viral-muted mt-1">Obrigado pelo feedback.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-viral-text uppercase tracking-wider">
                    Reportar Bug
                  </h3>
                  <button
                    onClick={() => { setOpen(false); reset(); }}
                    className="text-viral-muted hover:text-viral-text transition text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Título */}
                <div className="mb-4">
                  <label className="block text-xs text-viral-muted mb-1.5">
                    Título <span className="text-viral-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                    placeholder="Ex: Botão de gerar não responde"
                    className="input"
                    autoFocus
                  />
                  <span className="text-[10px] text-viral-muted/60 mt-0.5 block">
                    {title.length}/200
                  </span>
                </div>

                {/* Descrição */}
                <div className="mb-4">
                  <label className="block text-xs text-viral-muted mb-1.5">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 4000))}
                    placeholder="Passos para reproduzir, o que esperava vs o que aconteceu..."
                    rows={3}
                    className="input resize-none"
                  />
                  <span className="text-[10px] text-viral-muted/60 mt-0.5 block">
                    {description.length}/4000
                  </span>
                </div>

                {/* Severidade */}
                <div className="mb-5">
                  <label className="block text-xs text-viral-muted mb-2">Severidade</label>
                  <div className="flex gap-2">
                    {(Object.entries(SEVERITY_CONFIG) as [Severity, typeof SEVERITY_CONFIG.bug][]).map(
                      ([key, cfg]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSeverity(key)}
                          className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition ${
                            severity === key
                              ? cfg.color + " ring-1 ring-current"
                              : "text-viral-muted bg-viral-bg/60 border-viral-border/40 hover:border-viral-border"
                          }`}
                        >
                          {cfg.icon} {cfg.label}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Info contexto */}
                <div className="mb-5 p-3 rounded-lg bg-viral-bg/60 border border-viral-border/30">
                  <p className="text-[10px] text-viral-muted">
                    📎 Contexto automático será incluído: URL, rota, navegador, viewport e últimas {MAX_LOG_SIZE} requisições da API.
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={title.trim().length < 3 || submitting}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Enviar report"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
