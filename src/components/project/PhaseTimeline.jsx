import React from 'react';
import { Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';

const statusConfig = {
  completed: { color: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'הושלם' },
  in_progress: { color: 'bg-cyan-500', border: 'border-cyan-200', text: 'text-cyan-700', bg: 'bg-cyan-50', label: 'בתהליך' },
  late: { color: 'bg-red-500', border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50', label: 'מאחר' },
  not_started: { color: 'bg-slate-400', border: 'border-slate-200', text: 'text-slate-600', bg: 'bg-slate-50', label: 'טרם התחיל' }
};

// Timeline View - vertical timeline with meeting dates
export function TimelineView({ phases, tasks, onEdit, onDelete }) {
  return (
    <div className="relative border-r-2 border-emerald-200 mr-6 pr-8 space-y-6 py-2">
      {phases.map((phase) => {
        const cfg = statusConfig[phase.status] || statusConfig.not_started;
        const phaseTasks = tasks?.filter(t => t.phase_id === phase.id) || [];
        const completedTasks = phaseTasks.filter(t => t.is_completed).length;

        return (
          <div key={phase.id} className="relative group">
            <div className={`absolute -right-[13px] top-5 w-6 h-6 rounded-full ${cfg.color} border-4 border-white shadow-md z-10`} />
            <div className={`bg-white border ${cfg.border} rounded-xl p-4 shadow-sm hover:shadow-md transition-all`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-slate-800">{phase.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} font-medium`}>{cfg.label}</span>
                  </div>
                  {phase.meeting_date && (
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      פגישה: {new Date(phase.meeting_date).toLocaleDateString('he-IL')}
                    </p>
                  )}
                  {phaseTasks.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">{completedTasks}/{phaseTasks.length} משימות הושלמו</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEdit(phase)} className="text-slate-400 hover:text-emerald-600 p-1.5 rounded-lg hover:bg-slate-50"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete(phase.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-50"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {phases.length === 0 && <p className="text-slate-400 text-sm py-4">אין שלבים להצגה</p>}
    </div>
  );
}

// Table View
export function TableView({ phases, tasks, onEdit, onDelete }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-right">
        <thead className="bg-slate-50 text-slate-500 text-xs">
          <tr>
            <th className="px-4 py-3 font-medium">שלב</th>
            <th className="px-4 py-3 font-medium">סטטוס</th>
            <th className="px-4 py-3 font-medium">תאריך פגישה</th>
            <th className="px-4 py-3 font-medium">משימות</th>
            <th className="px-4 py-3 font-medium w-20">פעולות</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {phases.map(phase => {
            const cfg = statusConfig[phase.status] || statusConfig.not_started;
            const phaseTasks = tasks?.filter(t => t.phase_id === phase.id) || [];
            const completedTasks = phaseTasks.filter(t => t.is_completed).length;
            return (
              <tr key={phase.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{phase.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} font-medium`}>{cfg.label}</span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {phase.meeting_date ? new Date(phase.meeting_date).toLocaleDateString('he-IL') : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{completedTasks}/{phaseTasks.length}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(phase)} className="text-slate-400 hover:text-emerald-600 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDelete(phase.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {phases.length === 0 && <p className="text-slate-400 text-sm py-6 text-center">אין שלבים להצגה</p>}
    </div>
  );
}

// Cards View
export function CardsView({ phases, tasks, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {phases.map(phase => {
        const cfg = statusConfig[phase.status] || statusConfig.not_started;
        const phaseTasks = tasks?.filter(t => t.phase_id === phase.id) || [];
        const completedTasks = phaseTasks.filter(t => t.is_completed).length;
        const progress = phaseTasks.length > 0 ? (completedTasks / phaseTasks.length) * 100 : 0;

        return (
          <div key={phase.id} className={`bg-white border ${cfg.border} rounded-xl p-5 shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">{phase.name}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} font-medium`}>{cfg.label}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(phase)} className="text-slate-400 hover:text-emerald-600 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => onDelete(phase.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {phase.meeting_date && (
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-3">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(phase.meeting_date).toLocaleDateString('he-IL')}
              </p>
            )}
            {phaseTasks.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{completedTasks}/{phaseTasks.length} משימות</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`${cfg.color} h-1.5 rounded-full transition-all`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        );
      })}
      {phases.length === 0 && <p className="text-slate-400 text-sm py-4 col-span-full text-center">אין שלבים להצגה</p>}
    </div>
  );
}