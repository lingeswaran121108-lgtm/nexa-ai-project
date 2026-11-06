import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export interface UserSession {
  id: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  avatarUrl?: string;
}

/**
 * Retrieves the authenticated session from cookies and loads profile data.
 */
export async function getAuthSession(): Promise<UserSession | null> {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Fetch user profile to read actual server-enforced role
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, role, avatar_url")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email || "",
      displayName: profile?.display_name || user.email?.split("@")[0] || "User",
      role: (profile?.role === "admin" ? "admin" : "user"),
      avatarUrl: profile?.avatar_url,
    };
  } catch (err) {
    console.error("[getAuthSession] Error fetching session:", err);
    return null;
  }
}

/**
 * Enforces authenticated user. Throws Error if not logged in.
 */
export async function requireAuth(): Promise<UserSession> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Authentication required to access this resource.");
  }
  return session;
}

/**
 * Enforces administrator role. Throws Error if not an authorized admin.
 */
export async function requireAdmin(): Promise<UserSession> {
  const session = await requireAuth();
  if (session.role !== "admin") {
    throw new Error("FORBIDDEN: Administrative privileges required.");
  }
  return session;
}

/**
 * Securely writes an entry to admin_audit_logs table.
 */
export async function logAdminAction(params: {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}) {
  try {
    const adminDb = getAdminSupabaseClient();
    await adminDb.from("admin_audit_logs").insert({
      admin_user_id: params.adminUserId,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      metadata: params.metadata || {},
      ip_address: params.ipAddress,
    });
  } catch (err) {
    console.error("[logAdminAction] Audit logging failed:", err);
  }
}
