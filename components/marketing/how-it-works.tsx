import React from "react";
import { SlidersHorizontal, Sparkles, CheckCheck } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: SlidersHorizontal,
      title: "Choose Your Specialized Tool",
      description: "Pick from the AI Writer, Text Summarizer, Idea Generator, or Chat. Each tool is engineered with precision system prompts.",
    },
    {
      num: "02",
      icon: Sparkles,
      title: "Set Your Prompt & Options",
      description: "Input your requirements, choose target tone (Executive, Conversational, Technical), and select output length.",
    },
    {
      num: "03",
      icon: CheckCheck,
      title: "Generate, Refine & Export",
      description: "Watch real-time generation streamed from state-of-the-art models. Copy to clipboard, save to your cloud workspace, or iterate.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest font-bold text-indigo-600 dark:text-indigo-400 mb-2">
            Frictionless Workflow
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            From raw thought to finished asset in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-start"
              >
                <div className="flex items-center justify-between w-full mb-6">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-3xl font-black text-slate-300 dark:text-slate-700">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
