import { createClient } from "@/lib/supabase/server";
import type { Profile, Tenant, UsageMonthly, PlanType } from "@/lib/supabase/types";
import { PLAN_LIMITS } from "@/lib/supabase/types";

export interface SessionContext {
  userId: string;
  email: string;
  profile: Profile;
  tenant: Tenant;
  usage: UsageMonthly;
  limits: {
    packages: { used: number; max: number; remaining: number };
    videos: { used: number; max: number; remaining: number };
    posts: { used: number; max: number; remaining: number };
  };
}

/**
 * Fetches the full session context for the currently authenticated user.
 * Returns null if user is not authenticated or doesn't have a profile.
 */
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Load profile + tenant in parallel via a join
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("*, tenant:tenants(*)")
    .eq("id", user.id)
    .single();

  if (profileErr || !profile) return null;

  const tenant = (profile as unknown as { tenant: Tenant }).tenant;
  const tenantId = tenant.id;

  // Load current-month usage
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthStr = currentMonth.toISOString().slice(0, 10);

  const { data: usageRow } = await supabase
    .from("usage_monthly")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("month", monthStr)
    .maybeSingle();

  const usage: UsageMonthly = usageRow ?? {
    tenant_id: tenantId,
    month: monthStr,
    packages_count: 0,
    videos_count: 0,
    posts_count: 0,
    updated_at: new Date().toISOString(),
  };

  const planLimits = PLAN_LIMITS[tenant.plan as PlanType];

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile: profile as unknown as Profile,
    tenant,
    usage,
    limits: {
      packages: {
        used: usage.packages_count,
        max: planLimits.packages,
        remaining: Math.max(0, planLimits.packages - usage.packages_count),
      },
      videos: {
        used: usage.videos_count,
        max: planLimits.videos,
        remaining: Math.max(0, planLimits.videos - usage.videos_count),
      },
      posts: {
        used: usage.posts_count,
        max: planLimits.posts,
        remaining: Math.max(0, planLimits.posts - usage.posts_count),
      },
    },
  };
}
