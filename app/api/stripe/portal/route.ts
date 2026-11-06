import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/permissions";
import { stripe, isStripeConfigured } from "@/lib/stripe/client";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured in this environment." },
        { status: 503 }
      );
    }

    const adminDb = getAdminSupabaseClient();
    const { data: subData } = await adminDb
      .from("subscriptions")
      .select("provider_customer_id")
      .eq("user_id", session.id)
      .single();

    if (!subData?.provider_customer_id) {
      return NextResponse.json(
        { error: "No active Stripe customer found for this account." },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subData.provider_customer_id,
      return_url: `${appUrl}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: any) {
    console.error("[API:stripe/portal] Error:", err);
    return NextResponse.json({ error: err.message || "Customer portal creation failed" }, { status: 500 });
  }
}
