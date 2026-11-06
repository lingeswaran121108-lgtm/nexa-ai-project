"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, CreditCard, BarChart3, MessageSquare, Activity, ShieldCheck,
  Search, ChevronDown, CheckCircle2, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatDate, truncate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role !== "admin") {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);

      // Load admin data from server API
      const [usersRes, contactsRes] = await Promise.all([
        fetch("/api/admin/users?limit=20"),
        fetch("/api/admin/contacts"),
      ]);

      if (usersRes.ok) {
        const userData = await usersRes.json();
        setUsers(userData.users || []);
      }

      if (contactsRes.ok) {
        const contactData = await contactsRes.json();
        setContacts(contactData.submissions || []);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleUpdateContactStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    }
  };

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <ShieldCheck className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Administrative privileges are required to access this panel. Your account has not been granted admin access.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      search === "" ||
      u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    open: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
    resolved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    closed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Control Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Server-side access controlled — all operations are audit-logged.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <Users className="w-5 h-5 text-indigo-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <CreditCard className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {users.filter((u) => u.subscriptions?.[0]?.plan_id !== "free").length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Paid Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <MessageSquare className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {contacts.filter((c) => c.status === "open").length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Open Tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Activity className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {users.filter((u) => u.role === "admin").length}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <div className="relative w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-8 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="pb-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="pb-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                    <th className="pb-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => {
                    const sub = user.subscriptions?.[0];
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">
                              {user.display_name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{truncate(user.display_name, 25)}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant={user.role === "admin" ? "purple" : "default"} className="text-[10px] capitalize">
                            {user.role || "user"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge variant={sub?.plan_id === "free" ? "default" : "indigo"} className="text-[10px] capitalize">
                            {sub?.plan_id || "free"}
                          </Badge>
                        </td>
                        <td className="py-3 text-xs text-slate-500">
                          {formatDate(user.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Support Inbox</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No contact submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 10).map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{c.name}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{c.email}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          statusColors[c.status] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status?.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">{c.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{truncate(c.message, 90)}</p>
                  </div>

                  <div>
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateContactStatus(c.id, e.target.value)}
                      className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
