"use client";

import { useCostBreakdown } from "@/hooks/useDashboardData";

const typeLabels: Record<string, string> = {
  scene_image: "Imagens (FLUX)",
  scene_audio: "Audio (TTS)",
  rendered_video: "Video (Render)",
  other: "Outros",
};

const typeColors: Record<string, string> = {
  scene_image: "bg-blue-500",
  scene_audio: "bg-amber-500",
  rendered_video: "bg-purple-500",
  other: "bg-slate-400",
};

export function CostBreakdown() {
  const { data, isLoading } = useCostBreakdown(30, 30000);

  const breakdown = data?.breakdown ?? {};
  const totalCost = data?.totalCost ?? 0;
  const entries = Object.entries(breakdown).filter(([, v]) => v.count > 0);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Cost Breakdown</h3>
        <span className="text-xs text-slate-400">30 dias</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-slate-500 text-center py-8">
          Dados de custo disponiveis apos primeiros jobs reais.
        </div>
      ) : (
        <>
          {/* Total */}
          <div className="mb-4 p-3 bg-slate-50 rounded-lg text-center">
            <p className="text-xs text-slate-500">Custo Total Estimado</p>
            <p className="text-2xl font-bold text-slate-900">${totalCost.toFixed(2)}</p>
            <p className="text-xs text-slate-400">~R$ {(totalCost * 5).toFixed(2)}</p>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-3">
            {entries.map(([type, info]) => {
              const pct = totalCost > 0 ? Math.round((info.estimatedCost / totalCost) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700">{typeLabels[type] ?? type}</span>
                    <span className="text-slate-500 font-mono text-xs">
                      ${info.estimatedCost.toFixed(2)} ({info.count})
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${typeColors[type] ?? "bg-slate-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
