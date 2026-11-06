"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PenTool, MessageSquare, FileText, Sparkles, RefreshCw, TrendingUp, Clock, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { formatDate, truncate } from "@/lib/utils";

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [recentGenerations, setRecentGenerations] = useState<any[]>([]);
  const [usageStats, setUsageStats] = useState({ total: 0, thisMonth: 0, remaining: 25 });
  const [loading, setLoading] = useState(true);

  const toolQuickLinks = [
    { id: "writer", label: "AI Writer", icon: PenTool, href: "/dashboard/tools/writer" },
    { id: "chat", label: "AI Chat", icon: MessageSquare, href: "/dashboard/tools/chat", badge: "Pro" },
    { id: "summarizer", label: "Summarizer", icon: FileText, href: "/dashboard/tools/summarizer" },
    { id: "ideas", label: "Idea Engine", icon: Sparkles, href: "/dashboard/tools/ideas" },
    { id: "rewriter", label: "Rewriter", icon: RefreshCw, href: "/dashboard/tools/rewriter", badge: "Pro" },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, subRes, genRes, usageRes] = await Promise.all([
        supabase.from("profiles").select("display_name, role").eq("id", user.id).single(),
        supabase.from("subscriptions").select("plan_id, status, monthly_usage_limit, current_period_start").eq("user_id", user.id).single(),
        supabase.from("generations").select("id, title, tool_type, created_at, status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      setUserData({
        displayName: profileRes.data?.display_name || user.email?.split("@")[0],
        role: profileRes.data?.role,
        plan: subRes.data?.plan_id || "free",
        planStatus: subRes.data?.status || "active",
      });

      const totalUsage = usageRes.count || 0;
      setUsageStats({
        total: totalUsage,
        thisMonth: totalUsage,
        remaining: Math.max(0, (subRes.data?.monthly_usage_limit || 25) - totalUsage),
      });

      setRecentGenerations(genRes.data || []);
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const toolIcons: Record<string, React.ElementType> = {
    writer: PenTool,
    chat: MessageSquare,
    summarizer: FileText,
    ideas: Sparkles,
    rewriter: RefreshCw,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
          <div className="h-64 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Good day, {userData?.displayName || "User"}! 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Here's your AI workspace overview for today.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-700 text-white shadow-lg shadow-indigo-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-100">Current Plan</p>
              <Badge className="bg-white/20 text-white border-none text-[10px] capitalize">
                {userData?.planStatus}
              </Badge>
            </div>
            <p className="text-2xl font-black capitalize text-white">{userData?.plan || "Free"}</p>
            <Link href="/dashboard/billing" className="text-xs text-indigo-100 hover:text-white mt-1 inline-block">
              {userData?.plan === "free" ? "Upgrade →" : "Manage billing →"}
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">This Month</p>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{usageStats.thisMonth}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total AI generations</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quota Left</p>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{usageStats.remaining}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generations remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">All Time</p>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{usageStats.total}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total outputs saved</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent History */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Generations</CardTitle>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-400 gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentGenerations.length === 0 ? (
              <div className="text-center py-10">
                <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No generations yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                  Pick a tool from the sidebar and start creating!
                </p>
                <Link href="/dashboard/tools" className="mt-4 inline-block">
                  <Button size="sm" className="gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Explore AI Tools
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentGenerations.map((gen) => {
                  const ToolIcon = toolIcons[gen.tool_type] || Sparkles;
                  return (
                    <div
                      key={gen.id}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center shrink-0 mt-0.5">
                        <ToolIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {truncate(gen.title, 50)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="default" className="text-[9px] capitalize">{gen.tool_type}</Badge>
                          <span className="text-[11px] text-slate-400">{formatDate(gen.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {toolQuickLinks.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <Link key={tool.id} href={tool.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 group transition-colors border border-transparent hover:border-indigo-200/60 dark:hover:border-indigo-900/60 cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/70 transition-colors">
                      <ToolIcon className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                        {tool.label}
                      </span>
                      {tool.badge && (
                        <Badge variant="purple" className="text-[9px] py-0 px-1.5">
                          {tool.badge}
                        </Badge>
                      )}
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
