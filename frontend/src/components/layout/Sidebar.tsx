import Link from 'next/link';
import { Home, MessageSquare, Folder, Plus, Settings } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Projects', href: '/dashboard', icon: Folder },
  { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Settings', href: '#', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col glass-panel border-r border-white/10 text-white shadow-xl transition-all duration-300 z-20 relative">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/20">
            <span className="text-white text-lg">K</span>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">KBase</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-2 px-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <Icon
                  className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-500 group-hover:text-primary transition-colors"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>
    </div>
  );
}
