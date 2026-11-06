import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/permissions";
import { stripe, isStripeConfigured } from "@/lib/stripe/client";
import { PLANS, type PlanConfig } from "@/lib/stripe/plans";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Please log in to upgrade." }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error: "Stripe payments are not configured in this environment.",
          code: "STRIPE_NOT_CONFIGURED",
          details: "Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in .env.local to activate payments.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { planId, interval = "month" } = body;

    const plan: PlanConfig | undefined = PLANS[planId];
    if (!plan || plan.id === "free") {
      return NextResponse.json({ error: "Invalid plan selected for checkout." }, { status: 400 });
    }

    const priceId = interval === "year" ? plan.stripePriceAnnualId : plan.stripePriceMonthlyId;
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID for plan ${planId} (${interval}) is not configured.` },
        { status: 400 }
      );
    }

    const adminDb = getAdminSupabaseClient();
    const { data: subData } = await adminDb
      .from("subscriptions")
      .select("provider_customer_id")
      .eq("user_id", session.id)
      .single();

    let customerId = subData?.provider_customer_id;

    // Create Stripe customer if none exists
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.email,
        name: session.displayName,
        metadata: {
          supabaseUserId: session.id,
        },
      });
      customerId = customer.id;

      await adminDb
        .from("subscriptions")
        .upsert({
          user_id: session.id,
          provider_customer_id: customerId,
          plan_id: "free",
          status: "active",
        });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.id,
        planId: plan.id,
        interval,
      },
      success_url: `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err: any) {
    console.error("[API:stripe/checkout] Error:", err);
    return NextResponse.json({ error: err.message || "Checkout creation failed" }, { status: 500 });
  }
}
