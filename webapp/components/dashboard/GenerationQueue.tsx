"use client";

import { useGenerationQueue } from "@/hooks/useDashboardData";

const statusColors: Record<string, string> = {
  queued: "bg-slate-100 text-slate-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export function GenerationQueue() {
  const { data, isLoading } = useGenerationQueue(10, 10000);
  const jobs = data?.jobs ?? [];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Generation Queue</h3>
        <span className="text-xs text-slate-400">Auto-refresh 10s</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-8">
          Nenhum job encontrado. Gere um reel para ver aqui.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="border border-slate-100 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <code className="text-xs text-slate-500 font-mono">
                  {job.id.substring(0, 8)}...
                </code>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[job.status] ?? statusColors.queued}`}>
                  {job.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${job.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{job.progress}%</span>
                <span>{job.durationSec ? `${job.durationSec}s` : "—"}</span>
                <span>{new Date(job.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              {job.error && (
                <p className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2 truncate">
                  {job.error}
                </p>
              )}

              {/* Steps mini-view */}
              {job.steps.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {job.steps.map((s) => (
                    <div
                      key={s.id}
                      title={`${s.step}: ${s.status}`}
                      className={`h-1.5 flex-1 rounded-full ${
                        s.status === "completed" ? "bg-emerald-400" :
                        s.status === "running" ? "bg-blue-400" :
                        s.status === "failed" ? "bg-red-400" :
                        "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
