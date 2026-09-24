"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import {
  Users, Search, Loader2, ShieldCheck, UserX, UserCheck,
  RefreshCw, ChevronLeft, ChevronRight, Crown, User as UserIcon,
  Mail, Calendar, ToggleLeft, ToggleRight, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ADMIN: {
    label: "Admin",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: <ShieldCheck size={12} />,
  },
  OWNER: {
    label: "Owner",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: <Crown size={12} />,
  },
  USER: {
    label: "User",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: <UserIcon size={12} />,
  },
};

export default function UserManagementPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 10;

  // Redirect guards
  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "ADMIN") { router.push("/dashboard"); return; }
  }, [user, hasHydrated, router]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await api.get(`/users?${params}`);
      setUsersList(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (hasHydrated && user?.role === "ADMIN") fetchUsers();
  }, [fetchUsers, hasHydrated, user]);

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    setToggling(userId);
    try {
      await api.patch(`/users/${userId}/toggle-active`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentActive } : u))
      );
    } catch (err) {
      console.error("Failed to toggle user", err);
    } finally {
      setToggling(null);
    }
  };

  const handleLogout = () => { logout(); router.push("/login"); };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  if (!hasHydrated || !user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-zinc-950/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/dashboard")} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-zinc-400 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Admin Panel</h1>
              <p className="text-xs text-zinc-500">User Management</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400 hidden sm:block">{user.fullName}</span>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm transition-colors">
            <LogOut size={15} />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Users", value: totalElements, color: "from-blue-500 to-indigo-600", icon: <Users size={20} /> },
            { label: "Active", value: usersList.filter(u => u.isActive).length, color: "from-emerald-500 to-teal-600", icon: <UserCheck size={20} /> },
            { label: "Inactive", value: usersList.filter(u => !u.isActive).length, color: "from-rose-500 to-red-600", icon: <UserX size={20} /> },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white flex-shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/60 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <button onClick={fetchUsers} disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">
              Registered Accounts
            </h2>
            <span className="text-xs text-zinc-500">{totalElements} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : usersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
              <Users size={40} className="mb-3 opacity-30" />
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["User", "Email", "Role", "Status", "Joined", "Action"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {usersList.map((u, i) => {
                      const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.USER;
                      return (
                        <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                          className="hover:bg-white/[0.02] transition-colors">
                          {/* User */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-600/30 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                                {u.fullName?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <span className="text-sm font-medium text-white">{u.fullName}</span>
                            </div>
                          </td>
                          {/* Email */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                              <Mail size={13} className="flex-shrink-0" />
                              {u.email}
                            </div>
                          </td>
                          {/* Role */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${roleConf.color}`}>
                              {roleConf.icon}
                              {roleConf.label}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                              : "bg-zinc-800 text-zinc-500 border border-zinc-700"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-zinc-600"}`} />
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          {/* Joined */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                              <Calendar size={13} className="flex-shrink-0" />
                              {formatDate(u.createdAt)}
                            </div>
                          </td>
                          {/* Action */}
                          <td className="px-6 py-4">
                            {u.role === "ADMIN" ? (
                              <span className="text-xs text-zinc-600 italic">Protected</span>
                            ) : (
                              <button
                                onClick={() => handleToggleActive(u.id, u.isActive)}
                                disabled={toggling === u.id}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${u.isActive
                                  ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"}`}
                              >
                                {toggling === u.id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : u.isActive ? (
                                  <ToggleRight size={14} />
                                ) : (
                                  <ToggleLeft size={14} />
                                )}
                                {u.isActive ? "Deactivate" : "Activate"}
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs transition-colors ${p === page ? "bg-primary text-white" : "text-zinc-400 hover:bg-white/10"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 disabled:opacity-30 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
