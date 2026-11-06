"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PenTool, MessageSquare, FileText, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ToolsShowcase() {
  const tools = [
    {
      id: "writer",
      icon: PenTool,
      name: "AI Writer & Blog Generator",
      tag: "Writing",
      desc: "Transform simple outlines into structured long-form articles, persuasive marketing pages, and essays.",
      samplePrompt: "Write an in-depth guide on zero-trust cloud architectures.",
      sampleResult: "Zero-Trust Architecture treats every internal and external connection as potentially hostile...",
    },
    {
      id: "chat",
      icon: MessageSquare,
      name: "Nexa Intelligence Chat",
      tag: "Conversation",
      badge: "Pro",
      desc: "Engage in multi-turn reasoning, solve hard technical problems, debug code, and analyze market trends.",
      samplePrompt: "Explain the tradeoff between read-replicas and sharding in Postgres.",
      sampleResult: "Read replicas scale read throughput linearly with minimal complexity, whereas sharding...",
    },
    {
      id: "summarizer",
      icon: FileText,
      name: "Executive Text Summarizer",
      tag: "Productivity",
      desc: "Distill dense whitepapers, investor updates, transcripts, and articles into actionable bullet points.",
      samplePrompt: "Summarize a 12-page earnings call transcript into key takeaways.",
      sampleResult: "• Q3 ARR grew 41% YoY to $28.4M\n• Gross margins expanded 300bps due to infra optimization...",
    },
    {
      id: "ideas",
      icon: Sparkles,
      name: "Idea & Brainstorming Engine",
      tag: "Creative",
      desc: "Never run out of inspiration. Generate viral hooks, newsletter angles, and new SaaS product concepts.",
      samplePrompt: "Brainstorm 5 B2B SaaS ideas that solve SOC2 compliance pain points.",
      sampleResult: "1. AuditTrail: Automated screenshot and log collection for audit prep\n2. PolicySync...",
    },
    {
      id: "rewriter",
      icon: RefreshCw,
      name: "Content Tone Rewriter",
      tag: "Editing",
      badge: "Pro",
      desc: "Rephrase rough drafts, eliminate grammatical fluff, adjust reading grade level, and sound executive-ready.",
      samplePrompt: "Make this email sound polite but firm regarding the unpaid invoice.",
      sampleResult: "Following up on our earlier note regarding Invoice #1042, which is now 14 days overdue...",
    },
  ];

  const [activeTab, setActiveTab] = useState(tools[0].id);
  const activeTool = tools.find((t) => t.id === activeTab) || tools[0];
  const Icon = activeTool.icon;

  return (
    <section id="tools" className="py-24 bg-slate-50/50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="indigo" className="mb-3">
            Modular Tool Ecosystem
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Specialized tools for every generative workflow
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
            Each tool is pre-tuned with custom domain instructions for maximum accuracy and zero generic fluff.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            const isSelected = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                }`}
              >
                <ToolIcon className="w-4 h-4" />
                <span>{tool.name.split(" ")[0]} {tool.name.split(" ")[1]}</span>
                {tool.badge && (
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                    }`}
                  >
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tool Showcase Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {activeTool.name}
                  {activeTool.badge && <Badge variant="purple">{activeTool.badge}</Badge>}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{activeTool.desc}</p>
              </div>
            </div>
            <Link href={`/dashboard/tools/${activeTool.id}`}>
              <Button size="sm" className="gap-1.5 shrink-0">
                <span>Launch in App</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-2">Input Prompt</div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium italic">
                "{activeTool.samplePrompt}"
              </p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Real AI Output</div>
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {activeTool.sampleResult}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
