"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      q: "How does the monthly generation quota work?",
      a: "Every subscription plan includes a dedicated monthly generation quota (25 on Free, 500 on Pro, 2,500 on Business). One generation represents a single completion call across our AI tools. Quotas reset automatically at the beginning of each billing cycle.",
    },
    {
      q: "Can I cancel or change my plan anytime?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time with a single click in your Billing settings via our secure Stripe Customer Portal. When you cancel, you retain access until the end of your current paid billing period.",
    },
    {
      q: "Is my data and intellectual property kept private?",
      a: "Absolutely. We do not use your proprietary inputs or generated results to train public models. Furthermore, your account data is strictly isolated using PostgreSQL Row Level Security (RLS) policies.",
    },
    {
      q: "Which AI models power NexaAI?",
      a: "NexaAI integrates with frontier generative foundation models, primarily OpenAI's latest GPT-4o series and Anthropic Claude 3.5 Sonnet, engineered with domain-specific prompting for factual, concise, and executive outputs.",
    },
    {
      q: "What happens if I exceed my monthly generation limit?",
      a: "Once you reach your monthly limit, you will see a notification inside the generation workspace. You can seamlessly upgrade to Pro or Business to instantly replenish and expand your capacity.",
    },
    {
      q: "Do you offer team and enterprise workspaces?",
      a: "Yes! Our Business plan supports multi-user collaboration, higher rate limits, custom tool presets, and priority 24/7 dedicated support.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-xs uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400 mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Everything you need to know about NexaAI
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden bg-slate-50/40 dark:bg-slate-800/20 transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-5 text-left font-semibold text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-600" : "text-slate-400"
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
