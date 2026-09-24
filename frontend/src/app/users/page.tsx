"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { Users, Search, Loader2, ShieldAlert, UserX, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UserManagementPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const router = useRouter();

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/dashboard"); // Redirect non-admins
      return;
    }
    fetchUsers();
  }, [user, hasHydrated, router]);

  const fetchUsers = async (searchQuery = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/users?search=${searchQuery}`);
      setUsersList(res.data.content || []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const toggleUserActive = async (userId: number) => {
    try {
      await api.patch(`/users/${userId}/toggle-active`);
      // Update local state
      setUsersList((prev) => 
        prev.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u)
      );
    } catch (error) {
      console.error("Failed to toggle user status", error);
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-zinc-400 hover:text-white text-sm mb-4 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
          </div>
          <p className="text-zinc-400 mt-2">Manage all system users and their access</p>
        </div>
      </header>

      <div className="glass-panel rounded-2xl p-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-500 outline-none transition-all"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 text-sm">
                <th className="pb-4 font-medium">User</th>
                <th className="pb-4 font-medium">Role</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Joined Date</th>
                <th className="pb-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <motion.tr 
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.fullName}</p>
                          <p className="text-zinc-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        u.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' :
                        u.role === 'OWNER' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1 text-xs ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => toggleUserActive(u.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 ml-auto transition-colors ${
                            u.isActive 
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.isActive ? <><UserX size={14}/> Deactivate</> : <><UserCheck size={14}/> Activate</>}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
