"use client";

import { useState, useEffect, useCallback } from "react";

type Severity = "blocker" | "bug" | "suggestion";
type Status = "new" | "investigating" | "fixed" | "wont_fix";

interface BugReport {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  severity: Severity;
  status: Status;
  context: {
    url?: string;
    route?: string;
    user_agent?: string;
    viewport?: { width: number; height: number };
    api_log?: Array<{
      method: string;
      path: string;
      status: number;
      error?: string;
      timestamp: string;
      duration_ms: number;
    }>;
    timestamp?: string;
  };
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user: { email: string; full_name: string } | null;
}

const SEVERITY_BADGE: Record<Severity, { label: string; cls: string }> = {
  blocker: { label: "Bloqueador", cls: "bg-red-500/10 text-red-400 border-red-500/30" },
  bug: { label: "Bug", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  suggestion: { label: "Sugestão", cls: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
};

const STATUS_BADGE: Record<Status, { label: string; cls: string }> = {
  new: { label: "Novo", cls: "bg-viral-accent/10 text-viral-accent border-viral-accent/30" },
  investigating: { label: "Investigando", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  fixed: { label: "Resolvido", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  wont_fix: { label: "Não será corrigido", cls: "bg-viral-muted/10 text-viral-muted border-viral-border" },
};

const STATUS_TRANSITIONS: Record<Status, Status[]> = {
  new: ["investigating", "fixed", "wont_fix"],
  investigating: ["fixed", "wont_fix", "new"],
  fixed: ["new"],
  wont_fix: ["new"],
};

export default function AdminBugsPage() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<Severity | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterSeverity) params.set("severity", filterSeverity);
    if (filterStatus) params.set("status", filterStatus);

    const res = await fetch(`/api/bugs?${params.toString()}`);
    if (res.status === 403) {
      setForbidden(true);
      setLoading(false);
      return;
    }
    const json = await res.json();
    setReports(json.data ?? []);
    setLoading(false);
  }, [filterSeverity, filterStatus]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateStatus = async (id: string, newStatus: Status) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/bugs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
        );
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (forbidden) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-viral-text mb-2">Acesso restrito</h1>
        <p className="text-sm text-viral-muted">Esta página é restrita a administradores.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-viral-text">Bug Reports</h1>
          <p className="text-xs text-viral-muted mt-1">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchReports(); }}
          className="text-xs text-viral-accent hover:underline"
        >
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-viral-muted uppercase tracking-wider">Severidade:</span>
          {(["blocker", "bug", "suggestion"] as Severity[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(filterSeverity === s ? null : s)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                filterSeverity === s
                  ? SEVERITY_BADGE[s].cls
                  : "text-viral-muted border-viral-border/40 hover:border-viral-border"
              }`}
            >
              {SEVERITY_BADGE[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-viral-muted uppercase tracking-wider">Status:</span>
          {(["new", "investigating", "fixed", "wont_fix"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? null : s)}
              className={`text-[10px] px-2.5 py-1 rounded-full border transition ${
                filterStatus === s
                  ? STATUS_BADGE[s].cls
                  : "text-viral-muted border-viral-border/40 hover:border-viral-border"
              }`}
            >
              {STATUS_BADGE[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-6 h-6 border-2 border-viral-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-viral-muted">Carregando reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-sm text-viral-muted">Nenhum bug report encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const isExpanded = expanded === r.id;
            return (
              <div key={r.id} className="card overflow-hidden">
                {/* Header — clicável */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : r.id)}
                  className="w-full p-4 text-left flex items-start gap-3 hover:bg-viral-border/10 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${SEVERITY_BADGE[r.severity].cls}`}>
                        {SEVERITY_BADGE[r.severity].label}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_BADGE[r.status].cls}`}>
                        {STATUS_BADGE[r.status].label}
                      </span>
                      <span className="text-[10px] text-viral-muted">
                        {new Date(r.created_at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-viral-text truncate">{r.title}</h3>
                    <p className="text-[10px] text-viral-muted truncate mt-0.5">
                      {r.user?.full_name ?? "Usuário"} · {r.user?.email ?? r.user_id.slice(0, 8)}
                      {r.context.route ? ` · ${r.context.route}` : ""}
                    </p>
                  </div>
                  <span className="text-viral-muted text-xs mt-1">{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Detalhes expandidos */}
                {isExpanded && (
                  <div className="border-t border-viral-border/40 p-4 space-y-4">
                    {/* Descrição */}
                    {r.description && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-1">Descrição</div>
                        <p className="text-xs text-viral-text whitespace-pre-wrap leading-relaxed bg-viral-bg/60 rounded p-3">
                          {r.description}
                        </p>
                      </div>
                    )}

                    {/* Contexto */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-1">Contexto</div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        {r.context.url && (
                          <div className="bg-viral-bg/60 rounded p-2">
                            <span className="text-viral-muted">URL:</span>{" "}
                            <span className="text-viral-text break-all">{r.context.url}</span>
                          </div>
                        )}
                        {r.context.route && (
                          <div className="bg-viral-bg/60 rounded p-2">
                            <span className="text-viral-muted">Rota:</span>{" "}
                            <span className="text-viral-text">{r.context.route}</span>
                          </div>
                        )}
                        {r.context.viewport && (
                          <div className="bg-viral-bg/60 rounded p-2">
                            <span className="text-viral-muted">Viewport:</span>{" "}
                            <span className="text-viral-text">{r.context.viewport.width}×{r.context.viewport.height}</span>
                          </div>
                        )}
                        {r.context.user_agent && (
                          <div className="bg-viral-bg/60 rounded p-2 col-span-2">
                            <span className="text-viral-muted">UA:</span>{" "}
                            <span className="text-viral-text break-all">{r.context.user_agent}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline de requisições */}
                    {r.context.api_log && r.context.api_log.length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-1">
                          Últimas requisições ({r.context.api_log.length})
                        </div>
                        <div className="space-y-1">
                          {r.context.api_log.map((log, i) => {
                            const isError = log.status >= 400 || log.status === 0;
                            return (
                              <div
                                key={i}
                                className={`flex items-center gap-2 text-[10px] px-2 py-1.5 rounded ${
                                  isError
                                    ? "bg-red-500/5 border border-red-500/20 text-red-400"
                                    : "bg-viral-bg/60 text-viral-muted"
                                }`}
                              >
                                <span className="font-mono font-medium w-10">{log.method}</span>
                                <span className="flex-1 truncate">{log.path}</span>
                                <span className={`font-mono ${isError ? "text-red-400 font-bold" : ""}`}>
                                  {log.status}
                                </span>
                                <span className="text-viral-muted/60">{log.duration_ms}ms</span>
                                {log.error && (
                                  <span className="text-red-400 truncate max-w-[120px]" title={log.error}>
                                    {log.error}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Triage buttons */}
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-viral-muted mb-2">Triage</div>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_TRANSITIONS[r.status].map((target) => (
                          <button
                            key={target}
                            onClick={() => updateStatus(r.id, target)}
                            disabled={updatingId === r.id}
                            className={`text-[10px] px-3 py-1.5 rounded-lg border transition disabled:opacity-50 ${STATUS_BADGE[target].cls} hover:ring-1 hover:ring-current`}
                          >
                            → {STATUS_BADGE[target].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
