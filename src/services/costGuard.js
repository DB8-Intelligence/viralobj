/**
 * Cost guard — daily limits enforced before any paid Veo call.
 *
 * Two gates:
 *   1. Per-user scene count   (USER_DAILY_SCENE_LIMIT)
 *   2. Global Veo USD spend   (DAILY_VEO_BUDGET_USD)
 *
 * Both read reel_jobs in Firestore. Pre-check happens in /api/generate-reel
 * BEFORE the Gemini call so a blocked request never wastes money on text
 * generation either. The estimate used for the global budget is
 *   estimated_cost_for_this_request = scenes_to_charge × $/sec × duration
 * which matches what the bridge writes to estimated_veo_cost on the new
 * job — i.e. we are checking "will adding this job push us over the cap".
 *
 * Day boundary is UTC midnight to keep it operator-deterministic. Flip
 * to a tz config later if billing reports get more sophisticated.
 */
import { firestore } from "../infrastructure/firebase.js";

const JOBS_COLLECTION = "reel_jobs";

function startOfTodayUtc() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Sum reel_jobs.actual_veo_cost (or estimated_veo_cost as fallback) across
 * every job created since UTC midnight. Operator-wide; not user-scoped.
 *
 * @returns {Promise<{spent_usd: number, jobs_today: number}>}
 */
export async function getDailyVeoSpend() {
  const fs = firestore();
  const start = startOfTodayUtc();
  const snap = await fs
    .collection(JOBS_COLLECTION)
    .where("created_at", ">=", start)
    .get();
  let spent = 0;
  let count = 0;
  snap.forEach((doc) => {
    const d = doc.data();
    // Prefer actual_veo_cost once it lands. Fallback to estimated for
    // jobs still in flight so we don't undercount in-flight spend.
    const cost =
      typeof d.actual_veo_cost === "number"
        ? d.actual_veo_cost
        : typeof d.estimated_veo_cost === "number"
        ? d.estimated_veo_cost
        : 0;
    spent += cost;
    count++;
  });
  return {
    spent_usd: Math.round(spent * 100) / 100,
    jobs_today: count,
  };
}

/**
 * Count scenes a user has rendered today (sum of reel_jobs.scene_count
 * for all jobs created since UTC midnight by user_id).
 *
 * Single-field index only (where user_id == X). The created_at filter
 * runs in memory because Firestore would need a composite index for
 * `user_id == X AND created_at >= Y`. Acceptable: per-user job counts
 * are tiny (caps at USER_DAILY_SCENE_LIMIT and most users have 0).
 *
 * @returns {Promise<{scenes_used: number, jobs_today: number}>}
 */
export async function getUserDailyScenes(userId) {
  if (!userId) return { scenes_used: 0, jobs_today: 0 };
  const fs = firestore();
  const start = startOfTodayUtc().getTime();
  const snap = await fs
    .collection(JOBS_COLLECTION)
    .where("user_id", "==", userId)
    .get();
  let scenes = 0;
  let count = 0;
  snap.forEach((doc) => {
    const d = doc.data();
    const ts = d.created_at?.toMillis?.() ?? 0;
    if (ts >= start) {
      scenes += typeof d.scene_count === "number" ? d.scene_count : 0;
      count++;
    }
  });
  return { scenes_used: scenes, jobs_today: count };
}

/**
 * Pre-flight gate. Computes whether *this* request would push either limit
 * over. Returns a denial payload (to be sent as 429) when blocked, or null
 * when the request is free to proceed.
 *
 * @param {object} args
 * @param {string} args.userId
 * @param {number} args.scenesToCharge   — how many scenes this request asks for
 * @param {number} args.estimatedCostUsd — what those scenes are predicted to cost
 * @param {number} [args.userDailyLimit] — defaults to env USER_DAILY_SCENE_LIMIT or 3
 * @param {number} [args.dailyBudgetUsd] — defaults to env DAILY_VEO_BUDGET_USD or 20
 * @returns {Promise<null | {error: string, message: string, [k: string]: any}>}
 */
export async function evaluateCostGate({
  userId,
  scenesToCharge,
  estimatedCostUsd,
  userDailyLimit,
  dailyBudgetUsd,
} = {}) {
  const userLimit =
    typeof userDailyLimit === "number"
      ? userDailyLimit
      : parseInt(process.env.USER_DAILY_SCENE_LIMIT || "3", 10);
  const budget =
    typeof dailyBudgetUsd === "number"
      ? dailyBudgetUsd
      : parseFloat(process.env.DAILY_VEO_BUDGET_USD || "20");

  // Per-user gate first — cheaper read scope.
  const userUsage = await getUserDailyScenes(userId);
  if (userUsage.scenes_used + scenesToCharge > userLimit) {
    return {
      error: "USER_DAILY_LIMIT_EXCEEDED",
      message: `Daily scene limit reached for user ${userId} (${userUsage.scenes_used}/${userLimit}). Try again after UTC midnight.`,
      user_id: userId,
      scenes_used_today: userUsage.scenes_used,
      scenes_requested: scenesToCharge,
      user_daily_limit: userLimit,
    };
  }

  // Global budget gate.
  const global = await getDailyVeoSpend();
  if (global.spent_usd + estimatedCostUsd > budget) {
    return {
      error: "DAILY_BUDGET_EXCEEDED",
      message: `Operator daily Veo budget reached ($${global.spent_usd}/${budget}). Try again after UTC midnight.`,
      spent_usd_today: global.spent_usd,
      estimated_request_cost_usd: estimatedCostUsd,
      daily_budget_usd: budget,
      jobs_today: global.jobs_today,
    };
  }

  return null;
}

export default { getDailyVeoSpend, getUserDailyScenes, evaluateCostGate };
