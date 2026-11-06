import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAdminAction } from "@/lib/auth/permissions";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const adminDb = getAdminSupabaseClient();

    const { data, error } = await adminDb
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ submissions: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const body = await req.json();
    const { id, status } = body;

    if (!id || !["open", "in_progress", "resolved", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status parameters" }, { status: 400 });
    }

    const adminDb = getAdminSupabaseClient();

    const { error } = await adminDb
      .from("contact_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logAdminAction({
      adminUserId: adminSession.id,
      action: "UPDATE_CONTACT_STATUS",
      targetType: "contact_submission",
      targetId: id,
      metadata: { newStatus: status },
    });

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 403 });
  }
}
