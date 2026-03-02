import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, CheckSquare, Briefcase } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.classList.add('dark');
  }, []);

  const navItems = [
    { name: 'Home', label: 'דשבורד ראשי', icon: LayoutDashboard },
    { name: 'DailyExecution', label: 'ביצוע יומי', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-50 font-sans rtl">
      {/* Sidebar */}
      <aside className="fixed top-0 right-0 w-64 h-screen bg-zinc-900 border-l border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            <Briefcase className="w-6 h-6" />
            LMS Tracker
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentPageName === item.name;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="mr-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}