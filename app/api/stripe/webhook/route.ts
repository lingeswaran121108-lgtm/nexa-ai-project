import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

// Disable Next.js body parser so we get raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const adminDb = getAdminSupabaseClient();

  // 1. Idempotency Check: prevent processing duplicate webhook deliveries
  const { data: existingEvent } = await adminDb
    .from("webhook_events")
    .select("id, processing_status")
    .eq("provider_event_id", event.id)
    .single();

  if (existingEvent && existingEvent.processing_status === "processed") {
    console.log(`[Stripe Webhook] Duplicate event ignored: ${event.id}`);
    return NextResponse.json({ received: true, note: "Already processed" });
  }

  // Record webhook receipt
  await adminDb.from("webhook_events").upsert({
    provider: "stripe",
    provider_event_id: event.id,
    event_type: event.type,
    processing_status: "received",
    payload: event as any,
    received_at: new Date().toISOString(),
  });

  try {
    switch (event.type) {
      // User successfully completed Stripe Checkout
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const subscriptionId = session.subscription as string;

        if (userId && planId) {
          await adminDb.from("subscriptions").upsert({
            user_id: userId,
            provider_customer_id: session.customer as string,
            provider_subscription_id: subscriptionId,
            plan_id: planId,
            status: "active",
            billing_interval: session.metadata?.interval || "month",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          });
          console.log(`[Stripe Webhook] User ${userId} upgraded to ${planId}`);
        }
        break;
      }

      // Subscription updated (renewed, upgraded, downgraded)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customer id
        const { data: subRecord } = await adminDb
          .from("subscriptions")
          .select("user_id")
          .eq("provider_customer_id", customerId)
          .single();

        if (subRecord?.user_id) {
          const statusMap: Record<string, string> = {
            active: "active",
            trialing: "trialing",
            past_due: "past_due",
            canceled: "canceled",
            unpaid: "unpaid",
          };

          await adminDb
            .from("subscriptions")
            .update({
              status: statusMap[subscription.status] || "active",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", subRecord.user_id);
        }
        break;
      }

      // Subscription canceled or terminated
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await adminDb
          .from("subscriptions")
          .update({
            plan_id: "free",
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("provider_customer_id", customerId);
        break;
      }

      // Payment failed (grace period or retry)
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await adminDb
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("provider_customer_id", customerId);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Mark event processed
    await adminDb
      .from("webhook_events")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("provider_event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (procErr: any) {
    console.error("[Stripe Webhook] Processing failed:", procErr);
    await adminDb
      .from("webhook_events")
      .update({ processing_status: "failed" })
      .eq("provider_event_id", event.id);

    return NextResponse.json({ error: procErr.message }, { status: 500 });
  }
}
