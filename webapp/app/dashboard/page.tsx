"use client";

import React, { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { GenerationQueue } from "@/components/dashboard/GenerationQueue";
import { CostBreakdown } from "@/components/dashboard/CostBreakdown";
import { ErrorLogs } from "@/components/dashboard/ErrorLogs";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { Header } from "@/components/dashboard/Header";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    totalCost: 0,
    avgDuration: 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setStats({
        totalJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        totalCost: 0,
        avgDuration: 0,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">Beta Mode</h3>
            <p className="text-sm text-blue-800 mt-1">
              ViralObj em beta. Usando mock providers. Lote 7: FLUX.2 Pro real.
            </p>
          </div>
        </div>

        {!isLoading && <StatsCards stats={stats} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <GenerationQueue />
            <PerformanceMetrics />
          </div>

          <div className="space-y-6">
            <CostBreakdown />
            <ErrorLogs />
          </div>
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          <p>ViralObj Dashboard — Real-time Monitoring</p>
          <p className="mt-2">
            by{" "}
            <a
              href="https://db8intelligence.com.br"
              className="text-blue-600 hover:underline"
            >
              DB8 Intelligence
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
