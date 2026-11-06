import React from "react";
import Link from "next/link";
import { PenTool, MessageSquare, FileText, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const tools = [
  {
    id: "writer",
    title: "AI Writer & Blog Generator",
    description: "Generate structured articles, blog posts, and marketing copy in any tone.",
    icon: PenTool,
    category: "Writing",
  },
  {
    id: "chat",
    title: "Nexa Intelligence Chat",
    description: "Multi-turn AI reasoning for analysis, debugging, and brainstorming.",
    icon: MessageSquare,
    category: "Conversation",
    badge: "Pro",
  },
  {
    id: "summarizer",
    title: "Executive Text Summarizer",
    description: "Extract key takeaways and concise briefs from dense source material.",
    icon: FileText,
    category: "Productivity",
  },
  {
    id: "ideas",
    title: "Idea & Brainstorming Engine",
    description: "Generate hooks, startup ideas, feature concepts, and viral angles.",
    icon: Sparkles,
    category: "Creative",
  },
  {
    id: "rewriter",
    title: "Content Tone Rewriter",
    description: "Rephrase, polish, and shift the tone of any draft to your exact specifications.",
    icon: RefreshCw,
    category: "Editing",
    badge: "Pro",
  },
];

export default function ToolsPage() {
  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI Tool Workspace</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Select a specialized tool to begin generating. Each is pre-tuned for its domain.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} href={`/dashboard/tools/${tool.id}`}>
              <Card className="h-full hover:border-indigo-400/60 dark:hover:border-indigo-700 hover:shadow-md group cursor-pointer transition-all duration-200">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950 transition-colors">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="default" className="text-[10px]">{tool.category}</Badge>
                      {tool.badge && <Badge variant="purple" className="text-[10px]">{tool.badge}</Badge>}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex-1 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <span>Open tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
