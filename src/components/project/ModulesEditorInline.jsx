import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Pencil, Plus, X, Check } from 'lucide-react';

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

export default function ModulesEditorInline({ modules, projectId }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentModules, setCurrentModules] = useState(modules);
  const [newModule, setNewModule] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setCurrentModules(modules);
  }, [modules]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateMutation = useMutation({
    mutationFn: (newModules) => base44.entities.Project.update(projectId, { purchased_modules: newModules }),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['projects']);
      setIsEditing(false);
    }
  });

  const removeModule = (mod) => {
    setCurrentModules(prev => prev.filter(m => m !== mod));
  };

  const addModule = (mod) => {
    const trimmed = mod.trim();
    if (!trimmed || currentModules.includes(trimmed)) return;
    setCurrentModules(prev => [...prev, trimmed]);
    setNewModule('');
    setShowSuggestions(false);
  };

  const handleSave = () => {
    updateMutation.mutate(currentModules);
  };

  const handleCancel = () => {
    setCurrentModules(modules);
    setIsEditing(false);
    setNewModule('');
  };

  const suggestions = DEFAULT_MODULES.filter(m => !currentModules.includes(m));

  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {modules.map((m, i) => (
          <span key={i} className="bg-cyan-50 text-cyan-700 border border-cyan-100 px-3 py-1 rounded-lg text-sm font-medium">
            {m}
          </span>
        ))}
        <button
          onClick={() => setIsEditing(true)}
          className="text-slate-400 hover:text-emerald-500 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          title="ערוך מודולים"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex flex-wrap gap-2">
        {currentModules.map((m, i) => (
          <span key={i} className="bg-cyan-50 text-cyan-700 border border-cyan-100 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5">
            {m}
            <button onClick={() => removeModule(m)} className="text-cyan-400 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="הוסף מודול..."
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-400"
            value={newModule}
            onChange={e => { setNewModule(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addModule(newModule); } }}
          />
          <button onClick={() => addModule(newModule)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto py-1">
            {suggestions.map(s => (
              <button key={s} onClick={() => addModule(s)} className="w-full text-right px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={updateMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors">
          <Check className="w-4 h-4" /> שמור
        </button>
        <button onClick={handleCancel} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg flex items-center gap-1.5 text-sm transition-colors">
          <X className="w-4 h-4" /> בטל
        </button>
      </div>
    </div>
  );
}