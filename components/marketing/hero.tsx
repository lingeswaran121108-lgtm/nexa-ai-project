"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2, Play, Copy, Check, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const [copied, setCopied] = useState(false);

  const sampleOutput = `## The Future of Autonomous AI Agents in Enterprise
1. Autonomous Workflows: Moving beyond passive chatbots to self-orchestrating task runners.
2. Verified Memory: Preserving stateful context across multi-session operations.
3. Quantifiable ROI: Reducing executive turnaround on synthesis and strategy drafts by 82%.`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(sampleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-slate-50/50 dark:bg-slate-950">
      {/* Background radial glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/80 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-8 animate-fade-in shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Announcing NexaAI 2.0 — Powered by Next-Gen Multimodal Engines</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
          Your Ideas, <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">
            Powered by AI.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Supercharge your output. Write authoritative copy, summarize extensive documents, generate creative breakthroughs, and manage saved results in a unified, professional workspace.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 px-7 shadow-lg shadow-indigo-500/25">
              <span>Start for Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#tools" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-7">
              <span>Explore AI Tools</span>
            </Button>
          </Link>
        </div>

        {/* Benefit bullet points */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>25 Free Monthly Generations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Instant Cloud Sync & History</span>
          </div>
        </div>

        {/* Realistic Interactive Product Workspace Preview */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-left">
            {/* Window Top Bar Mockup */}
            <div className="px-4 py-3 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  nexa-ai.io/dashboard/tools/writer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="indigo" className="text-[11px] py-0 px-2 font-mono">
                  Quota: 24/25 remaining
                </Badge>
              </div>
            </div>

            {/* Split Screen Workspace Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
              {/* Left Column: Prompt Input Form */}
              <div className="p-5 md:col-span-5 bg-slate-50/40 dark:bg-slate-900/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tool: AI Writer</span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Tone: Executive</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">Prompt</p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Write an executive brief on autonomous AI agents in enterprise and measurable ROI.
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Target: ~300 words</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Model: GPT-4o Mini
                  </span>
                </div>
                <div className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generated in 1.4s
                </div>
              </div>

              {/* Right Column: High Quality Formatted AI Result */}
              <div className="p-6 md:col-span-7 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Generated Output</span>
                      <Badge variant="emerald" className="text-[10px] py-0">Completed</Badge>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="mt-4 text-xs font-sans text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {sampleOutput}
                  </pre>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tokens used: 142</span>
                  <span>Saved to your workspace</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
