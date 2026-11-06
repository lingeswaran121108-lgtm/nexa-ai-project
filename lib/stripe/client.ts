import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-09-30.acacia" as any,
  appInfo: {
    name: "NexaAI SaaS",
    version: "1.0.0",
  },
});

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("placeholder")
  );
}
