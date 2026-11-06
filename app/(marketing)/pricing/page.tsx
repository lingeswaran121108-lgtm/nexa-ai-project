import React from "react";
import { Navbar } from "@/components/marketing/navbar";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQ } from "@/components/marketing/faq";
import { Footer } from "@/components/marketing/footer";

export const metadata = {
  title: "Pricing — NexaAI",
  description: "Simple transparent pricing for every generation workload. Free, Pro, and Business plans with Stripe-backed subscriptions.",
};

export default function PricingPage() {
  return (
    <main>
      <Navbar />
      <div className="py-12 text-center bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Pricing & Plans</h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
          Start free, grow without limits. Monthly or annual billing — you decide.
        </p>
      </div>
      <PricingSection />
      <FAQ />
      <Footer />
    </main>
  );
}
