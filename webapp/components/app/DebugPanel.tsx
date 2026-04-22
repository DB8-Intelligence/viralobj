"use client";

import { useState } from "react";

interface SceneReport {
  sceneId: string;
  sceneType: string;
  status: "success" | "failed" | "skipped";
  videoUrl?: string;
  durationMs?: number;
  costUsd?: number;
  error?: string;
  promptPreview?: string;
}

export interface RenderReport {
  scenes_requested: number;
  scenes_rendered: number;
  total_cost_usd: number;
  elapsed_ms: number;
  scene_reports: SceneReport[];
  skip_reason?: string;
}

const STATUS_COLOR: Record<SceneReport["status"], string> = {
  success: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  failed: "text-red-400 bg-red-500/10 border-red-500/30",
  skipped: "text-viral-muted bg-viral-border/20 border-viral-border/40",
};

const STATUS_ICON: Record<SceneReport["status"], string> = {
  success: "✓",
  failed: "✗",
  skipped: "—",
};

export default function DebugPanel({ report, provider }: { report: RenderReport; provider?: string }) {
  const [open, setOpen] = useState(true);
  const successCount = report.scene_reports.filter((s) => s.status === "success").length;
  const failedCount = report.scene_reports.filter((s) => s.status === "failed").length;
  const skippedCount = report.scene_reports.filter((s) => s.status === "skipped").length;

  return (
    <div className="card p-0 overflow-hidden border-viral-accent/30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full p-4 text-left flex items-center gap-3 hover:bg-viral-border/10 transition"
      >
        <span className="text-lg">🔬</span>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-viral-accent">
            Debug · Render Report
          </div>
          <div className="text-[10px] text-viral-muted mt-0.5">
            {successCount} sucesso · {failedCount} falha · {skippedCount} pulada ·{" "}
            ${report.total_cost_usd.toFixed(2)} · {(report.elapsed_ms / 1000).toFixed(1)}s
            {provider && ` · via ${provider}`}
          </div>
        </div>
        <span className="text-viral-muted text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-viral-border/40 p-4 space-y-3">
          {report.skip_reason && (
            <div className="p-3 rounded bg-amber-500/5 border border-amber-500/30 text-xs text-amber-400">
              <strong>⚠️ Skip reason:</strong> {report.skip_reason}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat label="Solicitadas" value={String(report.scenes_requested)} />
            <Stat label="Renderizadas" value={String(report.scenes_rendered)} />
            <Stat label="Custo" value={`$${report.total_cost_usd.toFixed(2)}`} />
            <Stat label="Tempo" value={`${(report.elapsed_ms / 1000).toFixed(1)}s`} />
          </div>

          {report.scene_reports.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-viral-muted">
                Cenas ({report.scene_reports.length})
              </div>
              {report.scene_reports.map((s, i) => (
                <div
                  key={i}
                  className={`rounded p-2.5 border text-[11px] ${STATUS_COLOR[s.status]}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold">{STATUS_ICON[s.status]}</span>
                    <span className="font-mono text-[10px] font-semibold truncate flex-1">
                      {s.sceneId}
                    </span>
                    <span className="text-[9px] uppercase opacity-70">{s.sceneType}</span>
                    {s.durationMs && (
                      <span className="text-[9px] opacity-70">{(s.durationMs / 1000).toFixed(0)}s</span>
                    )}
                    {s.costUsd !== undefined && (
                      <span className="text-[9px] opacity-70">${s.costUsd.toFixed(2)}</span>
                    )}
                  </div>
                  {s.error && (
                    <div className="font-mono text-[10px] opacity-90 break-all mt-1">
                      {s.error}
                    </div>
                  )}
                  {s.promptPreview && s.status === "failed" && (
                    <details className="mt-1">
                      <summary className="text-[10px] cursor-pointer opacity-70 hover:opacity-100">
                        Ver prompt
                      </summary>
                      <div className="font-mono text-[10px] opacity-80 mt-1 p-1.5 rounded bg-black/20">
                        {s.promptPreview}...
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-viral-bg/60 rounded p-2 text-center">
      <div className="text-sm font-bold text-viral-text">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-viral-muted">{label}</div>
    </div>
  );
}
