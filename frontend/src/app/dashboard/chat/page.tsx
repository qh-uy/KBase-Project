"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MoreHorizontal, Sparkles, Folder, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi there! I'm KBase AI. I can help you search through your projects, analyze documents, and answer questions based on your knowledge base. What would you like to explore today?",
    timestamp: new Date().toISOString()
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Mock AI Response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I found some information related to "${userMessage.content}" in your "Website Redesign" project documents. The new design system uses a dark mode primary theme according to Design_System.fig.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-white/10 flex items-center px-6 bg-white/5 backdrop-blur-md z-10 shrink-0 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white font-bold tracking-tight">KBase AI Assistant</h2>
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-zinc-700 text-white' 
                    : 'bg-gradient-to-br from-primary to-purple-600 text-white'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                </div>
                
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-zinc-800/80 border border-white/10 text-zinc-200 rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-[80%]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-800/80 border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-zinc-900/80 border-t border-white/10 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-4xl mx-auto">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask anything about your projects or documents..."
              className="w-full bg-zinc-950 border border-white/10 rounded-2xl pl-4 pr-12 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none min-h-[56px] max-h-32 shadow-inner"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-3 bottom-3 p-2 bg-primary hover:bg-primary/90 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl transition-colors shadow-lg"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[11px] text-zinc-500">AI can make mistakes. Consider verifying important information.</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Context/Suggested) */}
      <div className="w-80 hidden lg:flex flex-col gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Sparkles className="text-primary w-4 h-4" />
            Suggested Prompts
          </h3>
          <div className="space-y-2">
            {[
              "Summarize the latest API specs",
              "Who uploaded the Figma design?",
              "Generate a status report for Mobile App V2",
              "Find onboarding documents"
            ].map((prompt, i) => (
              <button 
                key={i}
                onClick={() => setInput(prompt)}
                className="w-full text-left p-3 rounded-xl bg-zinc-800/50 hover:bg-white/10 border border-white/5 text-sm text-zinc-300 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex-1">
          <h3 className="text-white font-bold mb-4">Current Context</h3>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Folder size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">All Projects</p>
                <p className="text-xs text-zinc-500">Searching across 2 projects</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <FileText size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Documents</p>
                <p className="text-xs text-zinc-500">Indexing 14 files</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
