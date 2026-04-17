import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export interface DashboardStats {
  totalJobs: number;
  completed: number;
  failed: number;
  running: number;
  queued: number;
  successRate: number;
  avgDurationSec: number;
  failedSteps: number;
  totalSteps: number;
}

export interface QueueJob {
  id: string;
  status: string;
  progress: number;
  error: string | null;
  created_at: string;
  updated_at: string;
  durationSec: number | null;
  steps: Array<{
    id: string;
    step: string;
    status: string;
    error: string | null;
  }>;
}

export interface CostBreakdown {
  breakdown: Record<string, { count: number; estimatedCost: number }>;
  totalCost: number;
  totalArtifacts: number;
}

export interface ErrorLog {
  id: string;
  job_id: string;
  step: string;
  error: string;
  created_at: string;
}

export interface StepMetric {
  step: string;
  count: number;
  avgSec: number;
  minMs: number;
  maxMs: number;
  p50Ms: number;
  p95Ms: number;
}

export function useDashboardStats(days = 30, refreshMs = 10000) {
  return useSWR<DashboardStats>(
    `/api/dashboard/stats?days=${days}`,
    fetcher,
    { refreshInterval: refreshMs }
  );
}

export function useGenerationQueue(limit = 10, refreshMs = 10000) {
  return useSWR<{ jobs: QueueJob[]; total: number }>(
    `/api/dashboard/generation-queue?limit=${limit}`,
    fetcher,
    { refreshInterval: refreshMs }
  );
}

export function useCostBreakdown(days = 30, refreshMs = 30000) {
  return useSWR<CostBreakdown>(
    `/api/dashboard/cost-breakdown?days=${days}`,
    fetcher,
    { refreshInterval: refreshMs }
  );
}

export function useErrorLogs(limit = 20, refreshMs = 30000) {
  return useSWR<{ failedSteps: ErrorLog[]; failedJobs: Array<Record<string, unknown>>; totalErrors: number }>(
    `/api/dashboard/error-logs?limit=${limit}`,
    fetcher,
    { refreshInterval: refreshMs }
  );
}

export function usePerformanceMetrics(days = 30, refreshMs = 60000) {
  return useSWR<{ metrics: StepMetric[]; totalCompletedSteps: number }>(
    `/api/dashboard/performance?days=${days}`,
    fetcher,
    { refreshInterval: refreshMs }
  );
}
