/**
 * Tipos mínimos do schema nexoominx + viralobj usados pelo webapp.
 * Não é o schema completo gerado pelo CLI — só o que o app usa.
 */

export type PlanType = "trial" | "starter" | "pro" | "pro_plus" | "enterprise";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  plan_expires_at: string | null;
  addon_talking_objects: boolean;
  is_active: boolean;
  trial_ends_at: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export interface Generation {
  id: string;
  tenant_id: string;
  profile_id: string;
  niche: string;
  objects: string[];
  topic: string;
  tone: string;
  duration: number;
  lang: string;
  provider_used: string | null;
  package: Record<string, unknown>;
  created_at: string;
}

export interface UsageMonthly {
  tenant_id: string;
  month: string; // YYYY-MM-01
  packages_count: number;
  videos_count: number;
  posts_count: number;
  updated_at: string;
}

export interface PlanLimits {
  packages: number;
  videos: number;
  posts: number;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  trial: { packages: 5, videos: 0, posts: 0 },
  starter: { packages: 30, videos: 10, posts: 10 },
  pro: { packages: 100, videos: 50, posts: 50 },
  pro_plus: { packages: 300, videos: 150, posts: 150 },
  enterprise: { packages: 999999, videos: 999999, posts: 999999 },
};

export const PLAN_LABELS: Record<PlanType, string> = {
  trial: "Trial",
  starter: "Starter",
  pro: "Pro",
  pro_plus: "Pro+",
  enterprise: "Enterprise",
};
