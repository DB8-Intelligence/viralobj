"use client";

import { usePerformanceMetrics } from "@/hooks/useDashboardData";

const stepLabels: Record<string, string> = {
  ingest: "Ingest",
  image_generation: "Image Gen",
  audio_generation: "Audio Gen",
  timeline_build: "Timeline",
  video_render: "Video Render",
};

const stepColors: Record<string, string> = {
  ingest: "bg-slate-400",
  image_generation: "bg-blue-500",
  audio_generation: "bg-amber-500",
  timeline_build: "bg-emerald-500",
  video_render: "bg-purple-500",
};

export function PerformanceMetrics() {
  const { data, isLoading } = usePerformanceMetrics(30, 60000);

  const metrics = data?.metrics ?? [];
  const maxAvg = Math.max(...metrics.map((m) => m.avgSec), 1);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Performance Metrics</h3>
        <span className="text-xs text-slate-400">
          {data?.totalCompletedSteps ?? 0} steps
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : metrics.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-8">
          Metricas disponiveis apos primeiros jobs completos.
        </div>
      ) : (
        <div className="space-y-3">
          {metrics.map((m) => {
            const pct = Math.round((m.avgSec / maxAvg) * 100);
            return (
              <div key={m.step}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">
                    {stepLabels[m.step] ?? m.step}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">
                    avg {m.avgSec}s ({m.count}x)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${stepColors[m.step] ?? "bg-slate-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>min: {Math.round(m.minMs / 100) / 10}s</span>
                  <span>p50: {Math.round(m.p50Ms / 100) / 10}s</span>
                  <span>p95: {Math.round(m.p95Ms / 100) / 10}s</span>
                  <span>max: {Math.round(m.maxMs / 100) / 10}s</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
