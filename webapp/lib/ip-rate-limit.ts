import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";

export function getClientIp(): string {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

const CRITICAL_BUCKETS = new Set(["signup", "login", "generate_package"]);

export async function checkIpRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
  ip?: string
): Promise<{ allowed: boolean; ip: string }> {
  const clientIp = ip ?? getClientIp();
  const isProd = process.env.NODE_ENV === "production";
  const isCritical = CRITICAL_BUCKETS.has(bucket);

  if (clientIp === "unknown") {
    if (isProd && isCritical) {
      console.warn(`[ip-rate-limit] fail-closed: missing IP on bucket=${bucket}`);
      return { allowed: false, ip: clientIp };
    }
    return { allowed: true, ip: clientIp };
  }

  const svc = createServiceClient();
  const { data, error } = await svc.rpc("check_ip_rate_limit", {
    p_ip: clientIp,
    p_bucket: bucket,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    console.error(`[ip-rate-limit] RPC error bucket=${bucket}:`, error.message);
    if (isProd && isCritical) return { allowed: false, ip: clientIp };
    return { allowed: true, ip: clientIp };
  }
  return { allowed: data === true, ip: clientIp };
}
