import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit2, Trash2, X, Save, CheckSquare, Filter } from 'lucide-react';

export default function Tasks() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [filters, setFilters] = useState({ project_id: '', phase_id: '', status: '' });

  const { data: tasks, isLoading: tasksLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list() });
  const { data: projects, isLoading: projectsLoading } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });
  const { data: phases, isLoading: phasesLoading } = useQuery({ queryKey: ['phases'], queryFn: () => base44.entities.Phase.list() });

  const syncPhaseStatus = async (phaseId) => {
    if (!phaseId) return;
    try {
      const phaseTasks = await base44.entities.Task.filter({ phase_id: phaseId });
      if (phaseTasks.length === 0) return;
      const allCompleted = phaseTasks.every(t => t.is_completed);
      const anyCompleted = phaseTasks.some(t => t.is_completed);
      const phase = await base44.entities.Phase.get(phaseId);
      if (!phase) return;
      
      let newStatus = phase.status;
      if (allCompleted) newStatus = 'completed';
      else if (anyCompleted && phase.status === 'not_started') newStatus = 'in_progress';
      else if (!allCompleted && phase.status === 'completed') newStatus = 'in_progress';
      
      if (newStatus !== phase.status) {
        await base44.entities.Phase.update(phaseId, { status: newStatus });
        queryClient.invalidateQueries(['phases']);
      }
    } catch (error) {
      console.error("Error syncing phase status:", error);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: async (data, variables) => { 
      await syncPhaseStatus(variables.phase_id);
      queryClient.invalidateQueries(['tasks']); 
      setIsEditing(null); 
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: async (data, variables) => { 
      // We need the phase_id, if it's not in data, find it from the task
      const taskPhaseId = variables.data.phase_id || tasks.find(t => t.id === variables.id)?.phase_id;
      await syncPhaseStatus(taskPhaseId);
      queryClient.invalidateQueries(['tasks']); 
      setIsEditing(null); 
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: async (data, id) => {
      const taskPhaseId = tasks.find(t => t.id === id)?.phase_id;
      queryClient.invalidateQueries(['tasks']);
      if (taskPhaseId) {
        // Wait a bit for the delete to propagate, then sync
        setTimeout(() => syncPhaseStatus(taskPhaseId), 500);
      }
    }
  });

  const handleSave = () => {
    if (isEditing === 'new') createMutation.mutate(formData);
    else updateMutation.mutate({ id: isEditing, data: formData });
  };

  if (tasksLoading || projectsLoading || phasesLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const filteredTasks = tasks?.filter(task => {
    if (filters.project_id && task.project_id !== filters.project_id) return false;
    if (filters.phase_id && task.phase_id !== filters.phase_id) return false;
    if (filters.status === 'completed' && !task.is_completed) return false;
    if (filters.status === 'open' && task.is_completed) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-emerald-500" />
            ניהול משימות
          </h1>
          <p className="text-slate-500">הקמה ועריכה של כלל המשימות במערכת</p>
        </div>
        <button
          onClick={() => { setIsEditing('new'); setFormData({ priority: 'medium', is_completed: false }); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          משימה חדשה
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Filter className="w-4 h-4" />
          סינון:
        </div>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 outline-none"
          value={filters.project_id}
          onChange={e => setFilters({...filters, project_id: e.target.value, phase_id: ''})}
        >
          <option value="">כל הפרויקטים</option>
          {projects?.map(p => <option key={p.id} value={p.id}>{p.name || p.client_name}</option>)}
        </select>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 outline-none"
          value={filters.phase_id}
          onChange={e => setFilters({...filters, phase_id: e.target.value})}
          disabled={!filters.project_id}
        >
          <option value="">כל השלבים</option>
          {phases?.filter(p => p.project_id === filters.project_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select 
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 outline-none"
          value={filters.status}
          onChange={e => setFilters({...filters, status: e.target.value})}
        >
          <option value="">כל הסטטוסים</option>
          <option value="open">פתוחות</option>
          <option value="completed">הושלמו</option>
        </select>
      </div>

      {/* Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditing === 'new' ? 'משימה חדשה' : 'עריכת משימה'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם המשימה</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">פרויקט</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.project_id || ''} onChange={e => setFormData({...formData, project_id: e.target.value, phase_id: ''})}>
                  <option value="">בחר פרויקט...</option>
                  {projects?.map(p => <option key={p.id} value={p.id}>{p.name || p.client_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שלב</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.phase_id || ''} onChange={e => setFormData({...formData, phase_id: e.target.value})}>
                  <option value="">בחר שלב...</option>
                  {phases?.filter(p => p.project_id === formData.project_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
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
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_completed" checked={formData.is_completed || false} onChange={e => setFormData({...formData, is_completed: e.target.checked})} className="w-4 h-4 accent-emerald-500" />
                <label htmlFor="is_completed" className="text-sm font-medium text-slate-700">משימה הושלמה</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
        <div className="min-w-[800px]">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-medium">שם המשימה</th>
                <th className="p-4 font-medium">פרויקט</th>
                <th className="p-4 font-medium">שלב</th>
                <th className="p-4 font-medium">עדיפות</th>
                <th className="p-4 font-medium">תאריך יעד</th>
                <th className="p-4 font-medium">סטטוס</th>
                <th className="p-4 font-medium w-24">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks?.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 text-slate-800 font-medium cursor-pointer hover:text-emerald-600" onClick={() => { setIsEditing(task.id); setFormData(task); }}>{task.name}</td>
                  <td className="p-4 text-slate-500">{projects?.find(p => p.id === task.project_id)?.name || projects?.find(p => p.id === task.project_id)?.client_name || '-'}</td>
                  <td className="p-4 text-slate-500">{phases?.find(p => p.id === task.phase_id)?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs border ${task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-cyan-50 text-cyan-600 border-cyan-100'}`}>
                      {task.priority === 'high' ? 'גבוהה' : task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : '-'}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => updateMutation.mutate({ id: task.id, data: { is_completed: !task.is_completed, phase_id: task.phase_id } })}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${task.is_completed ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {task.is_completed ? 'הושלם' : 'פתוח'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setIsEditing(task.id); setFormData(task); }} className="text-slate-400 hover:text-emerald-500"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteMutation.mutate(task.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks?.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">לא נמצאו משימות תואמות לסינון.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}