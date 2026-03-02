import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit2, Trash2, X, Save, CheckSquare } from 'lucide-react';

export default function Tasks() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: tasks, isLoading: tasksLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list() });
  const { data: projects, isLoading: projectsLoading } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });
  const { data: phases, isLoading: phasesLoading } = useQuery({ queryKey: ['phases'], queryFn: () => base44.entities.Phase.list() });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
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

  if (tasksLoading || projectsLoading || phasesLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

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
              {isEditing === 'new' && (
                <tr className="bg-emerald-50/50">
                  <td className="p-4">
                    <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" placeholder="שם המשימה" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </td>
                  <td className="p-4">
                    <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.project_id || ''} onChange={e => setFormData({...formData, project_id: e.target.value})}>
                      <option value="">בחר פרויקט...</option>
                      {projects?.map(p => <option key={p.id} value={p.id}>{p.name || p.client_name}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.phase_id || ''} onChange={e => setFormData({...formData, phase_id: e.target.value})}>
                      <option value="">בחר שלב...</option>
                      {phases?.filter(p => p.project_id === formData.project_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.priority || 'medium'} onChange={e => setFormData({...formData, priority: e.target.value})}>
                      <option value="high">גבוהה</option>
                      <option value="medium">בינונית</option>
                      <option value="low">נמוכה</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <input type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                  </td>
                  <td className="p-4">
                    <input type="checkbox" checked={formData.is_completed || false} onChange={e => setFormData({...formData, is_completed: e.target.checked})} className="w-4 h-4 accent-emerald-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={handleSave} className="text-emerald-500 hover:text-emerald-600"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-slate-500"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )}
              
              {tasks?.map(task => (
                <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                  {isEditing === task.id ? (
                    <>
                      <td className="p-4"><input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></td>
                      <td className="p-4">
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.project_id || ''} onChange={e => setFormData({...formData, project_id: e.target.value})}>
                          <option value="">בחר פרויקט...</option>
                          {projects?.map(p => <option key={p.id} value={p.id}>{p.name || p.client_name}</option>)}
                        </select>
                      </td>
                      <td className="p-4">
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.phase_id || ''} onChange={e => setFormData({...formData, phase_id: e.target.value})}>
                          <option value="">בחר שלב...</option>
                          {phases?.filter(p => p.project_id === formData.project_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="p-4">
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.priority || 'medium'} onChange={e => setFormData({...formData, priority: e.target.value})}>
                          <option value="high">גבוהה</option>
                          <option value="medium">בינונית</option>
                          <option value="low">נמוכה</option>
                        </select>
                      </td>
                      <td className="p-4"><input type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} /></td>
                      <td className="p-4"><input type="checkbox" checked={formData.is_completed || false} onChange={e => setFormData({...formData, is_completed: e.target.checked})} className="w-4 h-4 accent-emerald-500" /></td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button onClick={handleSave} className="text-emerald-500 hover:text-emerald-600"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setIsEditing(null)} className="text-slate-400 hover:text-slate-500"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-slate-800 font-medium">{task.name}</td>
                      <td className="p-4 text-slate-500">{projects?.find(p => p.id === task.project_id)?.name || projects?.find(p => p.id === task.project_id)?.client_name || '-'}</td>
                      <td className="p-4 text-slate-500">{phases?.find(p => p.id === task.phase_id)?.name || '-'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs border ${task.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-cyan-50 text-cyan-600 border-cyan-100'}`}>
                          {task.priority === 'high' ? 'גבוהה' : task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : '-'}</td>
                      <td className="p-4">
                        {task.is_completed ? <span className="text-emerald-500 text-sm font-medium">הושלם</span> : <span className="text-slate-500 text-sm">פתוח</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setIsEditing(task.id); setFormData(task); }} className="text-slate-400 hover:text-emerald-500"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => deleteMutation.mutate(task.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}