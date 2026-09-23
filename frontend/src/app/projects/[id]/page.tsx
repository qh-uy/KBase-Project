"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { 
  Folder, ArrowLeft, Users, FileText, Settings, 
  Plus, Loader2, Search, FileUp, X, Mail, Image as ImageIcon, Video, Trash2, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: number;
  name: string;
  description: string;
  coverUrl: string | null;
  owner: {
    id: number;
    fullName: string;
    email: string;
  };
  memberCount: number;
  documentCount: number;
  createdAt: string;
}

interface DocumentItem {
  id: number;
  originalName: string;
  fileType: string;
  fileSizeFormatted: string;
  downloadUrl: string;
  createdAt: string;
  uploadedBy: {
    fullName: string;
    email: string;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id;
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "documents">("overview");

  // Members state
  const [members, setMembers] = useState<any[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const isOwnerOrAdmin = user?.role === 'ADMIN' || (user?.role === 'OWNER' && project?.owner.id === user?.id);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchProjectDetails();
  }, [user, router, projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
      if (activeTab === "members") {
        fetchMembers();
      } else if (activeTab === "documents") {
        fetchDocuments();
      }
    } catch (error) {
      console.error("Failed to fetch project details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setMembers(res.data.content || []);
    } catch (error) {
      console.error("Failed to fetch members", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/documents`);
      setDocuments(res.data.content || []);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    }
  };

  useEffect(() => {
    if (activeTab === "members" && project) fetchMembers();
    if (activeTab === "documents" && project) fetchDocuments();
  }, [activeTab]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");
    setIsInviting(true);
    
    try {
      await api.post(`/projects/${projectId}/members`, { email: inviteEmail });
      setInviteSuccess("Member invited successfully!");
      setInviteEmail("");
      fetchMembers(); // Refresh members list
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess("");
      }, 2000);
    } catch (error: any) {
      setInviteError(error.response?.data?.message || "Failed to invite member.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadError("");
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    if (fileDescription) formData.append("description", fileDescription);

    try {
      await api.post(`/projects/${projectId}/documents`, formData);
      setSelectedFile(null);
      setFileDescription("");
      setIsUploadModalOpen(false);
      fetchDocuments(); // Refresh docs
      // Update local project state stats if needed
      setProject(prev => prev ? { ...prev, documentCount: prev.documentCount + 1 } : prev);
    } catch (error: any) {
      setUploadError(error.response?.data?.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/projects/${projectId}/documents/${docId}`);
      fetchDocuments();
      setProject(prev => prev ? { ...prev, documentCount: Math.max(0, prev.documentCount - 1) } : prev);
    } catch (error) {
      console.error("Failed to delete document", error);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
          <Folder className="text-zinc-500 w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Project Not Found</h1>
        <p className="text-zinc-400 mb-6 max-w-md">The project you are looking for does not exist or you do not have permission to view it.</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }


  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <button 
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-6 transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
        
        <div className="glass-panel p-8 rounded-2xl relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Folder className="text-white w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
              <p className="text-zinc-400 text-sm max-w-2xl">{project.description || "No description provided."}</p>
              
              <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  Created by <strong className="text-zinc-300">{project.owner.fullName}</strong>
                </span>
                <span>•</span>
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {isOwnerOrAdmin && (
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-colors border border-white/5">
              <Settings size={18} />
              Settings
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-white/10 pb-px relative z-10">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "overview" 
              ? "border-primary text-primary" 
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "documents" 
              ? "border-primary text-primary" 
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Documents
          <span className="bg-white/10 text-zinc-300 py-0.5 px-2 rounded-full text-xs">
            {project.documentCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "members" 
              ? "border-primary text-primary" 
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Members
          <span className="bg-white/10 text-zinc-300 py-0.5 px-2 rounded-full text-xs">
            {project.memberCount}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="relative z-10">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-panel p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Project Activity</h3>
              <div className="py-12 text-center text-zinc-500">
                No recent activity to display.
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 flex items-center gap-2"><FileText size={16}/> Documents</span>
                    <span className="text-white font-medium">{project.documentCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400 flex items-center gap-2"><Users size={16}/> Members</span>
                    <span className="text-white font-medium">{project.memberCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-500 outline-none"
                />
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all"
              >
                <FileUp size={18} />
                Upload
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No documents found</h3>
                <p className="text-zinc-400 text-sm">Upload your first document to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 text-sm">
                      <th className="pb-4 font-medium">Name</th>
                      <th className="pb-4 font-medium">Type</th>
                      <th className="pb-4 font-medium">Size</th>
                      <th className="pb-4 font-medium">Uploaded By</th>
                      <th className="pb-4 font-medium">Date</th>
                      <th className="pb-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center text-zinc-400">
                              {doc.fileType === 'IMAGE' ? <ImageIcon size={20} /> :
                               doc.fileType === 'VIDEO' ? <Video size={20} /> :
                               <FileText size={20} />}
                            </div>
                            <p className="font-medium text-white line-clamp-1 max-w-[200px]">{doc.originalName}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                            {doc.fileType}
                          </span>
                        </td>
                        <td className="py-4 text-zinc-400">{doc.fileSizeFormatted}</td>
                        <td className="py-4 text-zinc-400">{doc.uploadedBy.fullName}</td>
                        <td className="py-4 text-zinc-400">{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a 
                              href={doc.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download size={16} />
                            </a>
                            {(isOwnerOrAdmin || user.email === doc.uploadedBy.email) && (
                              <button 
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Project Members</h3>
              {isOwnerOrAdmin && (
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all"
                >
                  <Plus size={18} />
                  Invite Member
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 text-sm">
                    <th className="pb-4 font-medium">User</th>
                    <th className="pb-4 font-medium">Role / Status</th>
                    <th className="pb-4 font-medium">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* Show Owner first */}
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                          {project.owner.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{project.owner.fullName}</p>
                          <p className="text-zinc-500 text-xs">{project.owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
                        Owner
                      </span>
                    </td>
                    <td className="py-4 text-zinc-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                  
                  {/* Show other members */}
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                            {m.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{m.fullName}</p>
                            <p className="text-zinc-500 text-xs">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-4 text-zinc-400">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsInviteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Invite Member</h3>
                <button 
                  onClick={() => setIsInviteModalOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                {inviteError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                    {inviteError}
                  </div>
                )}
                {inviteSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm text-center">
                    {inviteSuccess}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-500 outline-none"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 bg-transparent hover:bg-white/5 text-zinc-300 font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isUploading && setIsUploadModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-md p-6 rounded-2xl relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Upload Document</h3>
                <button 
                  onClick={() => !isUploading && setIsUploadModalOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  disabled={isUploading}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFileUpload} className="space-y-4">
                {uploadError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                    {uploadError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Select File</label>
                  <div className="relative border-2 border-dashed border-white/20 rounded-xl p-6 hover:border-primary/50 transition-colors text-center cursor-pointer group">
                    <input 
                      type="file" 
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isUploading}
                    />
                    <FileUp className="w-8 h-8 text-zinc-500 group-hover:text-primary mx-auto mb-2 transition-colors" />
                    {selectedFile ? (
                      <p className="text-primary font-medium text-sm line-clamp-1 px-4">{selectedFile.name}</p>
                    ) : (
                      <p className="text-zinc-400 text-sm">Drag & drop or click to browse</p>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Max size: 500MB. Allowed: PDF, DOCX, XLSX, Images, Videos.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-300">Description (Optional)</label>
                  <textarea
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    className="w-full p-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-500 outline-none resize-none"
                    placeholder="Briefly describe this document..."
                    rows={3}
                    disabled={isUploading}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 bg-transparent hover:bg-white/5 text-zinc-300 font-medium rounded-xl transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Background decorations */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
      </div>
    </div>
  );
}
