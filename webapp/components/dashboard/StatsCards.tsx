"use client";

import { useDashboardStats } from "@/hooks/useDashboardData";

export function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats(30, 10000);

  const cards = [
    { label: "Total Jobs", value: stats?.totalJobs ?? 0, color: "text-slate-900" },
    { label: "Completed", value: stats?.completed ?? 0, color: "text-emerald-600" },
    { label: "Failed", value: stats?.failed ?? 0, color: "text-red-600" },
    { label: "Running", value: stats?.running ?? 0, color: "text-blue-600" },
    { label: "Success Rate", value: `${stats?.successRate ?? 0}%`, color: "text-indigo-600" },
    { label: "Avg Duration", value: `${stats?.avgDurationSec ?? 0}s`, color: "text-purple-600" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-16 mb-2" />
            <div className="h-7 bg-slate-200 rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

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
