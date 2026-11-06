import React from "react";
import { Zap, Clock, Compass, ShieldCheck } from "lucide-react";

export function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: "Save 10+ Hours Every Week",
      description: "Automate first drafts, synthesis, proofreading, and ideation so you can focus on high-leverage strategic decisions.",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: Compass,
      title: "Generate Breakthrough Ideas",
      description: "Never start with a blank page again. Unlock viral hooks, product features, and marketing campaigns in seconds.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Elevate Writing Polish",
      description: "Eliminate passive voice, clarify complex explanations, and shift tone seamlessly from casual to executive.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Data Isolation",
      description: "Your prompts and generated intellectual property are strictly isolated with PostgreSQL Row Level Security (RLS).",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400 mb-2">
            Why Choose NexaAI
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for professionals who refuse to compromise on quality
          </p>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            A purpose-built suite of generative AI tools configured for real daily productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${b.gradient} flex items-center justify-center text-white mb-5 shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {b.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
