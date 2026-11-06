"use client";

import React, { useEffect, useState } from "react";
import { PenTool, MessageSquare, FileText, Sparkles, RefreshCw, Search, Trash2, Copy, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatDate, truncate } from "@/lib/utils";

const toolIcons: Record<string, React.ElementType> = {
  writer: PenTool,
  chat: MessageSquare,
  summarizer: FileText,
  ideas: Sparkles,
  rewriter: RefreshCw,
};

const toolBadgeVariants: Record<string, "default" | "indigo" | "purple" | "emerald"> = {
  writer: "indigo",
  chat: "purple",
  summarizer: "default",
  ideas: "emerald",
  rewriter: "default",
};

export default function HistoryPage() {
  const [generations, setGenerations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterTool, setFilterTool] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("generations")
        .select("id, title, tool_type, prompt, output, token_usage, created_at, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (filterTool !== "all") {
        query = query.eq("tool_type", filterTool);
      }

      const { data } = await query;
      setGenerations(data || []);
      setLoading(false);
    };

    loadHistory();
  }, [filterTool]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("generations").delete().eq("id", id).eq("user_id", user.id);
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  };

  const filtered = generations.filter(
    (g) =>
      search === "" ||
      g.title?.toLowerCase().includes(search.toLowerCase()) ||
      g.prompt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Generation History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Browse and manage all your saved AI outputs.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search generations by title or prompt..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {["all", "writer", "chat", "summarizer", "ideas", "rewriter"].map((tool) => (
            <button
              key={tool}
              onClick={() => setFilterTool(tool)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filterTool === tool
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tool === "all" ? "All Tools" : tool.charAt(0).toUpperCase() + tool.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-16 text-center">
          <CardContent>
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No history found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Your generated outputs will appear here after your first successful generation.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((gen) => {
            const ToolIcon = toolIcons[gen.tool_type] || Sparkles;
            const isExpanded = expanded === gen.id;

            return (
              <Card
                key={gen.id}
                className="overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
                        <ToolIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {truncate(gen.title, 60)}
                          </p>
                          <Badge variant={toolBadgeVariants[gen.tool_type] || "default"} className="text-[10px] capitalize">
                            {gen.tool_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatDate(gen.created_at)} · {gen.token_usage} tokens
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(gen.id, gen.output)}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        title="Copy output"
                      >
                        {copiedId === gen.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(gen.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete generation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : gen.id)}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {isExpanded ? "Collapse" : "View"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Prompt</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{gen.prompt}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Output</p>
                        <pre className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                          {gen.output}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
