import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, CheckSquare, Briefcase, Users, Menu, X, Layers } from 'lucide-react';

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
        <Link to={createPageUrl('Home')} className="text-xl font-bold text-emerald-600 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a59f1c1b4a544303ab2e4e/dab183c0c_blossom-favicon.png" alt="Logo" className="w-6 h-6" />
          ניהול פרויקטים
        </Link>
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
          <Link to={createPageUrl('Home')} className="text-xl font-bold text-emerald-600 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a59f1c1b4a544303ab2e4e/dab183c0c_blossom-favicon.png" alt="Logo" className="w-6 h-6" />
            ניהול פרויקטים
          </Link>
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

        <div className="flex-1 p-4 md:p-8 pt-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}