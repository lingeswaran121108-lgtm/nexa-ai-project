import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { PLANS, type PlanConfig } from "@/lib/stripe/plans";

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  currentUsage: number;
  monthlyLimit: number;
  remaining: number;
  planId: string;
}

/**
 * Server-side quota check and plan permission validation.
 */
export async function verifyUserQuota(userId: string, toolType: string): Promise<QuotaCheckResult> {
  const adminDb = getAdminSupabaseClient();

  // 1. Fetch user active subscription
  const { data: subscription } = await adminDb
    .from("subscriptions")
    .select("plan_id, status, current_period_start, current_period_end")
    .eq("user_id", userId)
    .single();

  const planId = (subscription?.status === "active" || subscription?.status === "trialing")
    ? (subscription.plan_id || "free")
    : "free";

  const planConfig: PlanConfig = PLANS[planId] || PLANS.free;

  // 2. Validate tool access for current plan
  if (!planConfig.enabledTools.includes(toolType)) {
    return {
      allowed: false,
      reason: `The tool "${toolType}" is not included in the ${planConfig.name} plan. Please upgrade to Pro or Business.`,
      currentUsage: 0,
      monthlyLimit: planConfig.monthlyLimit,
      remaining: 0,
      planId,
    };
  }

  // 3. Calculate start of current billing window
  const periodStart = subscription?.current_period_start
    ? new Date(subscription.current_period_start).toISOString()
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  // 4. Query total usage events count
  const { count, error } = await adminDb
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", periodStart);

  if (error) {
    console.error("[verifyUserQuota] Error querying usage:", error);
  }

  const currentUsage = count || 0;
  const remaining = Math.max(0, planConfig.monthlyLimit - currentUsage);

  if (currentUsage >= planConfig.monthlyLimit) {
    return {
      allowed: false,
      reason: `You have reached your monthly quota of ${planConfig.monthlyLimit} generations on the ${planConfig.name}. Please upgrade to increase your limits.`,
      currentUsage,
      monthlyLimit: planConfig.monthlyLimit,
      remaining: 0,
      planId,
    };
  }

  return {
    allowed: true,
    currentUsage,
    monthlyLimit: planConfig.monthlyLimit,
    remaining,
    planId,
  };
}

/**
 * Atomically records generation output and consumes 1 quota unit.
 * Called ONLY AFTER successful AI completion.
 */
export async function recordGenerationAndUsage(params: {
  userId: string;
  toolType: string;
  title: string;
  prompt: string;
  output: string;
  tokenUsage: number;
  metadata?: Record<string, any>;
}) {
  const adminDb = getAdminSupabaseClient();

  // 1. Insert generation record
  const { data: generation, error: genError } = await adminDb
    .from("generations")
    .insert({
      user_id: params.userId,
      tool_type: params.toolType,
      title: params.title,
      prompt: params.prompt,
      output: params.output,
      token_usage: params.tokenUsage,
      status: "completed",
      metadata: params.metadata || {},
    })
    .select("id")
    .single();

  if (genError) {
    console.error("[recordGenerationAndUsage] Error saving generation:", genError);
    throw genError;
  }

  // 2. Insert usage event linked to generation
  const { error: usageError } = await adminDb.from("usage_events").insert({
    user_id: params.userId,
    tool_type: params.toolType,
    usage_quantity: 1,
    generation_id: generation.id,
    billing_period_start: new Date().toISOString(),
  });

  if (usageError) {
    console.error("[recordGenerationAndUsage] Error saving usage event:", usageError);
  }

  return generation.id;
}
