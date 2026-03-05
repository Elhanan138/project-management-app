import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, X, Save, CheckSquare, Filter } from 'lucide-react';

export default function GeneralTasksTab() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [filters, setFilters] = useState({ status: '' });

  const { data: tasks } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list() });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create({ ...data, task_type: 'general' }),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); setIsEditing(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); setIsEditing(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['tasks'])
  });

  const handleSave = () => {
    if (isEditing === 'new') createMutation.mutate(formData);
    else updateMutation.mutate({ id: isEditing, data: formData });
  };

  const generalTasks = tasks?.filter(t => t.task_type === 'general') || [];
  const filteredTasks = generalTasks.filter(task => {
    if (filters.status === 'completed' && !task.is_completed) return false;
    if (filters.status === 'open' && task.is_completed) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters + Add */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Filter className="w-4 h-4" />
          סינון:
        </div>
        <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 outline-none" value={filters.status} onChange={e => setFilters({ status: e.target.value })}>
          <option value="">כל הסטטוסים</option>
          <option value="open">פתוחות</option>
          <option value="completed">הושלמו</option>
        </select>
        <button
          onClick={() => { setIsEditing('new'); setFormData({ priority: 'medium', is_completed: false }); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all shadow-sm text-sm font-medium mr-auto"
        >
          <Plus className="w-4 h-4" />
          משימה כללית חדשה
        </button>
      </div>

      {/* Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditing === 'new' ? 'משימה כללית חדשה' : 'עריכת משימה'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם המשימה</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">עדיפות</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.priority || 'medium'} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option value="high">גבוהה</option>
                  <option value="medium">בינונית</option>
                  <option value="low">נמוכה</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תאריך יעד</label>
                <input type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="min-w-[600px]">
          <table className="w-full text-right">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">שם המשימה</th>
                <th className="px-6 py-4 font-semibold">עדיפות</th>
                <th className="px-6 py-4 font-semibold">תאריך יעד</th>
                <th className="px-6 py-4 font-semibold">סטטוס</th>
                <th className="px-6 py-4 font-semibold w-24">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTasks.map(task => (
                <tr key={task.id} className={`hover:bg-slate-50/80 transition-colors group ${task.is_completed ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => updateMutation.mutate({ id: task.id, data: { is_completed: !task.is_completed } })}
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${task.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'}`}
                      >
                        {task.is_completed && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-sm font-medium cursor-pointer hover:text-emerald-600 transition-colors ${task.is_completed ? 'text-slate-500 line-through' : 'text-slate-900'}`} onClick={() => { setIsEditing(task.id); setFormData(task); }}>
                        {task.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                      <span className="text-xs font-medium text-slate-600">
                        {task.priority === 'high' ? 'גבוהה' : task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${task.is_completed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                      {task.is_completed ? 'הושלם' : 'פתוח'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setIsEditing(task.id); setFormData(task); }} className="text-slate-400 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteMutation.mutate(task.id)} className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">לא נמצאו משימות כלליות.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}