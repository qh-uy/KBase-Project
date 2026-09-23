"use client";

import { useState, useCallback, use } from "react";
import { UploadCloud, File, FileText, FileImage, Trash2, Download, Search, X } from "lucide-react";
import { motion } from "framer-motion";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

const MOCK_DOCS: Document[] = [
  { id: "1", name: "Requirements.pdf", type: "pdf", size: "2.4 MB", uploadedAt: "2026-09-22", uploadedBy: "Demo User" },
  { id: "2", name: "Design_System.fig", type: "fig", size: "15.1 MB", uploadedAt: "2026-09-23", uploadedBy: "Alice Smith" },
  { id: "3", name: "API_Specs.docx", type: "docx", size: "1.2 MB", uploadedAt: "2026-09-20", uploadedBy: "Demo User" },
];

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCS);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      const newDocs = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: "Demo User"
      }));
      setDocuments(prev => [...newDocs, ...prev]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newDocs = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: "Demo User"
      }));
      setDocuments(prev => [...newDocs, ...prev]);
    }
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const filteredDocs = documents.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FileText className="text-red-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg': return <FileImage className="text-emerald-400" />;
      default: return <File className="text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Project Documents</h1>
        <p className="text-zinc-400">Manage all files and assets for Project #{id}</p>
      </div>

      {/* Drag & Drop Upload Area */}
      <div 
        className={`glass-panel border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${
          isDragging ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Drag & Drop files here</h3>
        <p className="text-zinc-400 text-sm mb-6">or click to browse from your computer</p>
        
        <label className="cursor-pointer">
          <span className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-primary/25">
            Select Files
          </span>
          <input type="file" multiple className="hidden" onChange={handleFileInput} />
        </label>
      </div>

      {/* Document List */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-lg font-bold text-white">Uploaded Files ({documents.length})</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900/50 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors w-64"
            />
            {search && (
              <X 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 cursor-pointer" 
                onClick={() => setSearch("")} 
              />
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500 bg-black/20">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Format</th>
                <th className="p-4 font-medium">Size</th>
                <th className="p-4 font-medium">Uploaded By</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    No documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={doc.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                          {getFileIcon(doc.type)}
                        </div>
                        <span className="font-medium text-white">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-400 uppercase">{doc.type}</td>
                    <td className="p-4 text-sm text-zinc-400">{doc.size}</td>
                    <td className="p-4 text-sm text-zinc-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                          {doc.uploadedBy.charAt(0)}
                        </div>
                        {doc.uploadedBy}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-zinc-400">{doc.uploadedAt}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => removeDoc(doc.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
