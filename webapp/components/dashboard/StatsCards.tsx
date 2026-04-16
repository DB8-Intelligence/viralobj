"use client";

interface Stats {
  totalJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalCost: number;
  avgDuration: number;
}

export function StatsCards({ stats }: { stats: Stats }) {
  const successRate = stats.totalJobs > 0
    ? Math.round((stats.successfulJobs / stats.totalJobs) * 100)
    : 0;

  const cards = [
    { label: "Total Jobs", value: stats.totalJobs, color: "text-slate-900" },
    { label: "Successful", value: stats.successfulJobs, color: "text-emerald-600" },
    { label: "Failed", value: stats.failedJobs, color: "text-red-600" },
    { label: "Success Rate", value: `${successRate}%`, color: "text-blue-600" },
    { label: "Total Cost", value: `$${stats.totalCost.toFixed(2)}`, color: "text-amber-600" },
    { label: "Avg Duration", value: `${stats.avgDuration.toFixed(1)}s`, color: "text-purple-600" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
