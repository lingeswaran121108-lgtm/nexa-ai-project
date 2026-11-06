import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/auth/permissions";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = (page - 1) * limit;

    const adminDb = getAdminSupabaseClient();

    let query = adminDb
      .from("profiles")
      .select(`
        id,
        display_name,
        avatar_url,
        role,
        created_at,
        subscriptions (
          plan_id,
          status,
          current_period_end
        )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike("display_name", `%${search}%`);
    }

    const { data: users, count, error } = await query;

    if (error) {
      console.error("[API:admin/users] Fetch failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid user update parameters" }, { status: 400 });
    }

    const adminDb = getAdminSupabaseClient();

    const { error } = await adminDb
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Record administrative audit trail
    await logAdminAction({
      adminUserId: adminSession.id,
      action: "UPDATE_USER_ROLE",
      targetType: "user",
      targetId: userId,
      metadata: { newRole: role, updatedBy: adminSession.email },
    });

    return NextResponse.json({ success: true, updatedRole: role });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 403 });
  }
}
