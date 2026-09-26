import { Search, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 glass-panel px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 z-20">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1 items-center" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute left-0 h-5 w-5 text-zinc-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-10 w-full border-0 py-0 pl-8 pr-0 bg-transparent text-white placeholder:text-zinc-500 focus:ring-0 sm:text-sm"
            placeholder="Search projects, documents, or knowledge..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative flex items-center gap-x-4">
            <button type="button" className="-m-1.5 flex items-center p-1.5 gap-x-3 text-sm font-semibold leading-6 text-white hover:bg-white/5 rounded-full transition-colors">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-lg">
                D
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 font-medium">Demo User</span>
              </span>
            </button>
            
            <Link 
              href="/login"
              className="ml-4 flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20"
            >
              <LogOut size={16} />
              Logout
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
