import React from "react";
import { notFound } from "next/navigation";
import { ToolWorkspace } from "@/components/dashboard/tool-workspace";
import { AI_TOOLS, type ToolType } from "@/lib/ai/prompts";
import { Badge } from "@/components/ui/badge";

interface ToolPageProps {
  params: { tool: string };
}

export async function generateStaticParams() {
  return Object.keys(AI_TOOLS).map((tool) => ({ tool }));
}

export function generateMetadata({ params }: ToolPageProps) {
  const toolDef = AI_TOOLS[params.tool as ToolType];
  if (!toolDef) return { title: "Tool Not Found" };
  return {
    title: `${toolDef.title} — NexaAI`,
    description: toolDef.description,
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const toolType = params.tool as ToolType;
  const toolDef = AI_TOOLS[toolType];

  if (!toolDef) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tool Header */}
      <div className="px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">{toolDef.title}</h1>
              {toolDef.badge && <Badge variant="purple">{toolDef.badge}</Badge>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{toolDef.description}</p>
          </div>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="flex-1 max-w-6xl mx-auto w-full border-x border-slate-200/60 dark:border-slate-800/60">
        <ToolWorkspace toolType={toolType} />
      </div>
    </div>
  );
}
