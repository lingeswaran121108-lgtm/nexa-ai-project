"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Check, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setSubscription(sub);
      setLoading(false);
    };
    loadSubscription();
  }, []);

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, interval: billingInterval }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Checkout failed. Please try again.");
      setCheckoutLoading(null);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    } else {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Unable to open billing portal.");
      setPortalLoading(false);
    }
  };

  const currentPlanId = subscription?.plan_id || "free";
  const currentPlan = PLANS[currentPlanId];

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Billing & Subscription</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Manage your subscription and generation quota.
        </p>
      </div>

      {/* Current Subscription Status */}
      {!loading && (
        <Card className="mb-8 border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/40 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 dark:text-white">{currentPlan?.name || "Free"}</span>
                  <Badge variant={subscription?.status === "active" ? "emerald" : "amber"} className="capitalize">
                    {subscription?.status || "active"}
                  </Badge>
                </div>
                {subscription?.cancel_at_period_end && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Subscription cancels on {formatDate(subscription.current_period_end)}
                  </div>
                )}
                {subscription?.current_period_end && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {subscription.cancel_at_period_end ? "Access ends" : "Next renewal"}:{" "}
                    {formatDate(subscription.current_period_end)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentPlanId !== "free" && (
                  <Button
                    onClick={handlePortal}
                    isLoading={portalLoading}
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    Manage Billing
                  </Button>
                )}
                {currentPlanId === "free" && (
                  <Button size="sm" className="gap-1.5" onClick={() => handleCheckout("pro")}>
                    <Sparkles className="w-4 h-4" />
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison Table */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Available Plans</h2>
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingInterval === "month"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                billingInterval === "year"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Annual
              <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 px-1 py-0.5 rounded">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.values(PLANS).map((plan) => {
            const price = billingInterval === "year" ? Math.round(plan.priceAnnual / 12) : plan.priceMonthly;
            const isCurrent = currentPlanId === plan.id;

            return (
              <Card
                key={plan.id}
                className={`flex flex-col transition-all ${
                  plan.popular
                    ? "border-indigo-500 dark:border-indigo-600 shadow-lg ring-1 ring-indigo-500/20"
                    : ""
                } ${isCurrent ? "ring-2 ring-emerald-400 dark:ring-emerald-600" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {isCurrent && <Badge variant="emerald" className="text-[10px]">Current</Badge>}
                    {plan.popular && !isCurrent && <Badge variant="indigo" className="text-[10px]">Popular</Badge>}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">${price}</span>
                    <span className="text-sm text-slate-400 ml-1">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.monthlyLimit} generations / month</p>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col justify-between">
                  <ul className="space-y-2 mb-5">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full text-xs">
                      ✓ Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button variant="outline" disabled className="w-full text-xs">
                      Downgrade to Free
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckout(plan.id)}
                      isLoading={checkoutLoading === plan.id}
                      variant={plan.popular ? "primary" : "outline"}
                      className="w-full text-xs gap-1.5"
                    >
                      <span>Upgrade to {plan.name.split(" ")[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
