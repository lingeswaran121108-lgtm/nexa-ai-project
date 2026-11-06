"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles, PenTool, MessageSquare, FileText, RefreshCw,
  BarChart2, Clock, Settings, CreditCard, Shield, LogOut,
  Menu, X, ChevronLeft, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart2 },
  { label: "AI Tools", href: "/dashboard/tools", icon: Sparkles },
  { label: "AI Writer", href: "/dashboard/tools/writer", icon: PenTool },
  { label: "AI Chat", href: "/dashboard/tools/chat", icon: MessageSquare, badge: "Pro" },
  { label: "Summarizer", href: "/dashboard/tools/summarizer", icon: FileText },
  { label: "Idea Engine", href: "/dashboard/tools/ideas", icon: Sparkles },
  { label: "Rewriter", href: "/dashboard/tools/rewriter", icon: RefreshCw, badge: "Pro" },
  { label: "History", href: "/dashboard/history", icon: Clock },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminItems = [
  { label: "Admin Dashboard", href: "/admin", icon: Shield },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ displayName: string; email: string; role: string } | null>(null);
  const [subscription, setSubscription] = useState<{ planId: string; status: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient();
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (!supabaseUser) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, role")
        .eq("id", supabaseUser.id)
        .single();

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_id, status")
        .eq("user_id", supabaseUser.id)
        .single();

      setUser({
        displayName: profile?.display_name || "User",
        email: supabaseUser.email || "",
        role: profile?.role || "user",
      });

      setSubscription({
        planId: sub?.plan_id || "free",
        status: sub?.status || "active",
      });
    };

    loadUserData();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const SidebarContent = () => (
    <aside
      className={`flex flex-col h-full transition-all duration-200 ${sidebarOpen ? "w-60" : "w-16"}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        {sidebarOpen && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              Nexa<span className="text-indigo-600">AI</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant="purple" className="text-[10px] py-0 px-1.5">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}

        {/* Admin section */}
        {user?.role === "admin" && (
          <>
            <div className="pt-4 pb-1">
              {sidebarOpen && (
                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-600 px-3">
                  Administration
                </div>
              )}
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Plan badge + Logout */}
      {sidebarOpen && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {subscription && (
            <Link href="/dashboard/billing">
              <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/40 border border-indigo-200/70 dark:border-indigo-900/60 text-xs">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 capitalize">{subscription.planId} Plan</span>
                  <Badge variant={subscription.status === "active" ? "emerald" : "amber"} className="text-[9px] py-0">
                    {subscription.status}
                  </Badge>
                </div>
                {subscription.planId === "free" && (
                  <span className="text-indigo-600/80 dark:text-indigo-400/80 text-[11px]">Upgrade for more power</span>
                )}
              </div>
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Overlay Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            <SidebarContent />
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-slate-400 dark:text-slate-500 hidden sm:block">
              {user ? `Welcome back, ${user.displayName.split(" ")[0]} 👋` : "Loading..."}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
              <Bell className="w-5 h-5" />
            </button>
            <Link href="/dashboard/settings">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm cursor-pointer">
                {user?.displayName?.[0]?.toUpperCase() || "U"}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
