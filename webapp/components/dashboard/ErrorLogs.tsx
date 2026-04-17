"use client";

import { useErrorLogs } from "@/hooks/useDashboardData";

const stepLabels: Record<string, string> = {
  ingest: "Ingest",
  image_generation: "Image Gen",
  audio_generation: "Audio Gen",
  timeline_build: "Timeline",
  video_render: "Video Render",
};

export function ErrorLogs() {
  const { data, isLoading } = useErrorLogs(20, 30000);

  const errors = data?.failedSteps ?? [];
  const totalErrors = data?.totalErrors ?? 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Error Logs</h3>
        {totalErrors > 0 && (
          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
            {totalErrors}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : errors.length === 0 ? (
        <div className="text-sm text-emerald-600 text-center py-8">
          Nenhum erro recente.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {errors.map((err) => (
            <div key={err.id} className="border border-red-100 bg-red-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-red-800">
                  {stepLabels[err.step] ?? err.step}
                </span>
                <span className="text-xs text-red-400">
                  {new Date(err.created_at).toLocaleString("pt-BR", {
                    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-xs text-red-700 truncate" title={err.error}>
                {err.error}
              </p>
              <code className="text-[10px] text-red-400 font-mono">
                job: {err.job_id?.substring(0, 8)}...
              </code>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
