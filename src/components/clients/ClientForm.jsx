import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';

const DEFAULT_MODULES = [
  'ניהול משתמשים',
  'קורסים מקוונים',
  'מבחנים והסמכות',
  'דוחות ואנליטיקה',
  'ניהול אירועי הדרכה',
  'משחוק',
  'אוטומציות',
  'התממשקות HR'
];

const ModulesEditor = ({ selected = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newModule, setNewModule] = useState('');
  const containerRef = useRef(null);

  // Close on outside click using ref — avoids the fixed overlay that interferes with button events
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const allOptions = [...new Set([...DEFAULT_MODULES, ...selected])];

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const addCustomModule = () => {
    const trimmed = newModule.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    onChange([...selected, trimmed]);
    setNewModule('');
  };

  const removeModule = (option) => {
    // Work directly on the current selected array — no async state issues
    const next = selected.filter(item => item !== option);
    onChange(next);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 cursor-pointer flex justify-between items-center min-h-[40px]"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="truncate text-sm">
          {selected.length > 0 ? selected.join(', ') : 'בחר מודולים...'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-72 overflow-y-auto py-1">
          <div className="px-3 pt-2 pb-1">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="הוסף מודול חדש..."
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-400"
                value={newModule}
                onChange={e => setNewModule(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomModule(); } }}
              />
              <button
                type="button"
                onClick={() => addCustomModule()}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-1">
            {allOptions.map(option => (
              <div key={option} className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors group/item">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-emerald-500 rounded border-slate-300"
                    checked={selected.includes(option)}
                    onChange={() => toggleOption(option)}
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeModule(option); }}
                  className="text-slate-300 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ClientForm({ formData, setFormData }) {
  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none";

  return (
    <div className="space-y-6">
      {/* פרטי לקוח */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-700 border-b pb-2">פרטי לקוח</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="שם הלקוח"
            className={inputClass}
            value={formData.client_name || ''}
            onChange={e => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
          />
          <input
            type="text"
            placeholder="איש קשר"
            className={inputClass}
            value={formData.contact_person || ''}
            onChange={e => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
          />
          <input
            type="email"
            placeholder="דוא״ל"
            className={inputClass}
            value={formData.email || ''}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="text"
            placeholder="טלפון"
            className={inputClass}
            value={formData.phone || ''}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      {/* פרטי פרויקט */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-700 border-b pb-2">פרטי פרויקט</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">תאריך Kickoff</label>
            <input
              type="date"
              lang="he"
              className={inputClass}
              value={formData.start_date || ''}
              onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">צפי עלייה לאוויר</label>
            <input
              type="month"
              lang="he"
              className={inputClass}
              value={formData.target_date || ''}
              onChange={e => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">מודולים שנרכשו</label>
          <ModulesEditor
            selected={Array.isArray(formData.purchased_modules) ? formData.purchased_modules : []}
            onChange={val => setFormData(prev => ({ ...prev, purchased_modules: val }))}
          />
        </div>
      </div>
    </div>
  );
}