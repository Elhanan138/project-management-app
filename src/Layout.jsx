import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, CheckSquare, Briefcase, Users, Menu, X, Layers, Search, Bell, Settings, ChevronDown } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.classList.remove('dark');
  }, []);

  const navItems = [
    { name: 'Home', label: 'דשבורד ראשי', icon: LayoutDashboard },
    { name: 'ControlPanel', label: 'עמוד שליטה', icon: LayoutDashboard },
    { name: 'Timeline', label: 'מעקב שלבים', icon: Layers },
    { name: 'Clients', label: 'ניהול פרויקטים ולקוחות', icon: Users },
    { name: 'Tasks', label: 'ניהול משימות', icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans rtl">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a59f1c1b4a544303ab2e4e/dab183c0c_blossom-favicon.png" alt="Logo" className="w-6 h-6" />
          ניהול פרויקטים
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 w-64 h-screen bg-white border-l border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 shadow-lg md:shadow-none`}>
        <div className="p-6 border-b border-slate-200 hidden md:block">
          <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a59f1c1b4a544303ab2e4e/dab183c0c_blossom-favicon.png" alt="Logo" className="w-6 h-6" />
            ניהול פרויקטים
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPageName === item.name;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 font-semibold shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="md:mr-64 flex flex-col min-h-screen">
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="חיפוש מהיר..." 
                className="w-full bg-slate-100 border-none rounded-full pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8 pt-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}