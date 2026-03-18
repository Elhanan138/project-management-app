import React from 'react';
import { MessageSquare, Settings, Trash2, FileText, Sparkles } from 'lucide-react';

const COLOR_STYLES = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  pink: 'bg-pink-50 text-pink-600 border-pink-200',
  cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
};

export default function AgentCard({ agent, onSelect, onEdit, onDelete }) {
  const colorStyle = COLOR_STYLES[agent.color] || COLOR_STYLES.emerald;
  const knowledgeCount = agent.knowledge_files?.length || 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorStyle}`}>
          {agent.icon || <Sparkles className="w-6 h-6" />}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-slate-800 mb-1">{agent.name}</h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{agent.description || 'ללא תיאור'}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <FileText className="w-3.5 h-3.5" />
          <span>{knowledgeCount} קבצי ידע</span>
        </div>
        <button
          onClick={onSelect}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          התחל שיחה
        </button>
      </div>
    </div>
  );
}