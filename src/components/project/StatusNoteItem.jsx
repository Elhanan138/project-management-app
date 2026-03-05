import React from 'react';
import { Edit2, Trash2, CheckCircle2, Circle, Clock, AlertTriangle } from 'lucide-react';

const statusConfig = {
  open: { label: 'פתוח', icon: Circle, bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-400' },
  in_progress: { label: 'בתהליך', icon: Clock, bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400' },
  done: { label: 'הושלם', icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
};

const priorityConfig = {
  high: { label: 'גבוהה', color: 'text-red-600 bg-red-50' },
  medium: { label: 'בינונית', color: 'text-amber-600 bg-amber-50' },
  low: { label: 'נמוכה', color: 'text-slate-500 bg-slate-50' },
};

export default function StatusNoteItem({ note, onEdit, onDelete, onStatusChange }) {
  const status = statusConfig[note.status] || statusConfig.open;
  const priority = priorityConfig[note.priority] || priorityConfig.medium;
  const StatusIcon = status.icon;

  const nextStatus = note.status === 'open' ? 'in_progress' : note.status === 'in_progress' ? 'done' : 'open';

  const isOverdue = note.target_date && note.status !== 'done' && new Date(note.target_date) < new Date();

  return (
    <div className={`px-5 py-3.5 flex items-start gap-3 group hover:bg-slate-50/50 transition-colors ${note.status === 'done' ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onStatusChange(nextStatus)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          note.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 
          note.status === 'in_progress' ? 'border-blue-400 bg-blue-50' : 
          'border-slate-300 hover:border-emerald-400'
        }`}
        title={`שנה ל${statusConfig[nextStatus].label}`}
      >
        {note.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
        {note.status === 'in_progress' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${note.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {note.content}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${priority.color}`}>{priority.label}</span>
          {note.target_date && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${isOverdue ? 'bg-red-50 text-red-600 font-medium' : 'bg-slate-100 text-slate-500'}`}>
              {isOverdue && <AlertTriangle className="w-3 h-3" />}
              {new Date(note.target_date).toLocaleDateString('he-IL')}
            </span>
          )}
          {note.meeting_date && (
            <span className="text-[10px] bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded">
              סטטוס {new Date(note.meeting_date).toLocaleDateString('he-IL')}
            </span>
          )}
          {note.notes && (
            <span className="text-[10px] text-slate-400 truncate max-w-[200px]" title={note.notes}>
              💬 {note.notes}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={onEdit} className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={onDelete} className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}