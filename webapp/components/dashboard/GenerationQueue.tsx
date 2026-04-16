"use client";

export function GenerationQueue() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Generation Queue</h3>
      <div className="text-sm text-slate-500 text-center py-8">
        Nenhum job na fila. Gere um reel para ver aqui.
      </div>
    </div>
  );
}
