export interface PlanConfig {
  id: "free" | "pro" | "business";
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  monthlyLimit: number;
  features: string[];
  enabledTools: string[];
  stripePriceMonthlyId?: string;
  stripePriceAnnualId?: string;
  popular?: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: "free",
    name: "Free Starter",
    tagline: "Ideal for experimenting with generative AI and everyday personal tasks.",
    priceMonthly: 0,
    priceAnnual: 0,
    monthlyLimit: 25,
    features: [
      "25 AI generations per month",
      "Access to AI Writer, Summarizer & Ideas",
      "Standard generation speed",
      "Personal history up to 30 days",
      "Community support",
    ],
    enabledTools: ["writer", "summarizer", "ideas"],
  },
  pro: {
    id: "pro",
    name: "Pro Creator",
    tagline: "For creators, freelancers, and marketers demanding high-speed AI output.",
    priceMonthly: 19,
    priceAnnual: 180,
    monthlyLimit: 500,
    features: [
      "500 AI generations per month",
      "Full access: Writer, Chat, Summarizer, Ideas, Rewriter",
      "Ultra-fast priority generation speeds",
      "Unlimited history storage & export",
      "Custom tone & creativity parameters",
      "Priority email support",
    ],
    enabledTools: ["writer", "chat", "summarizer", "ideas", "rewriter"],
    stripePriceMonthlyId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    stripePriceAnnualId: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID,
    popular: true,
  },
  business: {
    id: "business",
    name: "Business Suite",
    tagline: "For growing teams, agencies, and heavy production workloads.",
    priceMonthly: 49,
    priceAnnual: 468,
    monthlyLimit: 2500,
    features: [
      "2,500 AI generations per month",
      "All AI tools with maximal context window",
      "Highest compute priority with zero queueing",
      "Team workspace collaboration",
      "Audit logging & usage export",
      "Dedicated 24/7 account manager",
    ],
    enabledTools: ["writer", "chat", "summarizer", "ideas", "rewriter"],
    stripePriceMonthlyId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    stripePriceAnnualId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_ANNUAL_PRICE_ID,
  },
};

export function getPlanById(planId: string): PlanConfig {
  return PLANS[planId] || PLANS.free;
}
