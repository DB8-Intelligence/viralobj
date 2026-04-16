"use client";

export function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ViralObj Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time pipeline monitoring</p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
          Production
        </span>
      </div>
    </header>
  );
}
