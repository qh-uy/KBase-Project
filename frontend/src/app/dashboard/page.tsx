"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Folder, Plus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";

interface Project {
  id: number;
  name: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  owner: {
    id: number;
    fullName: string;
    email: string;
  };
  isActive: boolean;
  memberCount: number;
  createdAt: string;
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchProjects();
  }, [user, router]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.data.content || []);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    try {
      setIsCreating(true);
      await api.post("/projects", {
        name: newProjectName,
        description: newProjectDesc,
      });
      setIsModalOpen(false);
      setNewProjectName("");
      setNewProjectDesc("");
      fetchProjects(); // Refresh real list from server
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Projects</h2>
          <p className="text-gray-500">
            {user.role === 'ADMIN' 
              ? 'Manage all projects in the system' 
              : 'Manage your knowledge base projects'}
          </p>
        </div>
        
        {/* Chỉ OWNER và ADMIN mới được tạo Project */}
        {(user.role === 'OWNER' || user.role === 'ADMIN') && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all"
          >
            <Plus size={20} />
            New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl">
            <Folder className="w-16 h-16 text-zinc-600 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
            <p className="text-zinc-400 max-w-md">Get started by creating a new project to organize your knowledge base.</p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-primary/50 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Folder className="text-blue-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{project.name}</h3>
              <p className="text-zinc-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                {project.description || "No description provided."}
              </p>
              
              <div className="flex flex-col gap-2 mt-auto text-xs text-zinc-500 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 font-medium bg-white/5 px-2 py-1 rounded-md">
                    By: {project.owner.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{project.memberCount} Members</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Create New Project</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Project Name</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-white placeholder-zinc-500 outline-none"
                    placeholder="e.g. KBase Documentation"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Description</label>
                  <textarea
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-white placeholder-zinc-500 outline-none resize-none h-24"
                    placeholder="Brief description of the project..."
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-transparent hover:bg-white/5 text-zinc-300 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
