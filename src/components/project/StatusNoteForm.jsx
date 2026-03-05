import React from 'react';
import { Save, X } from 'lucide-react';

export default function StatusNoteForm({ formData, setFormData, onSave, onCancel, isNew }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">{isNew ? 'פריט חדש' : 'עריכת פריט'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">קטגוריה</label>
            <select
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              value={formData.category || 'action_item'}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="action_item">פריט עבודה</option>
              <option value="discussion_topic">נושא לדיון בסטטוס</option>
              <option value="status_update">עדכון סטטוס</option>
              <option value="summary">סיכום / החלטה</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">תוכן</label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none min-h-[80px] resize-none"
              value={formData.content || ''}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
              placeholder="תאר את הפריט..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">עדיפות</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                value={formData.priority || 'medium'}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="high">גבוהה</option>
                <option value="medium">בינונית</option>
                <option value="low">נמוכה</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">סטטוס</label>
              <select
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                value={formData.status || 'open'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="open">פתוח</option>
                <option value="in_progress">בתהליך</option>
                <option value="done">הושלם</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">תאריך יעד</label>
              <input
                type="date"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                value={formData.target_date || ''}
                onChange={e => setFormData({ ...formData, target_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">סטטוס שבועי (תאריך)</label>
              <input
                type="date"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                value={formData.meeting_date || ''}
                onChange={e => setFormData({ ...formData, meeting_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">הערות</label>
            <textarea
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none min-h-[60px] resize-none"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הערות נוספות..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={onSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors">
              <Save className="w-4 h-4" /> שמור
            </button>
            <button onClick={onCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors">
              <X className="w-4 h-4" /> בטל
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}