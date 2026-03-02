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

  if (tasksLoading || projectsLoading || phasesLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2 flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-purple-500" />
            ניהול משימות
          </h1>
          <p className="text-zinc-400">הקמה ועריכה של כלל המשימות במערכת</p>
        </div>
        <button
          onClick={() => { setIsEditing('new'); setFormData({ priority: 'medium', is_completed: false }); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          משימה חדשה
        </button>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-sm">
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
          <tbody className="divide-y divide-zinc-800/50">
            {isEditing === 'new' && (
              <tr className="bg-purple-900/10">
                <td className="p-4">
                  <input type="text" className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" placeholder="שם המשימה" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </td>
                <td className="p-4">
                  <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.project_id || ''} onChange={e => setFormData({...formData, project_id: e.target.value})}>
                    <option value="">בחר פרויקט...</option>
                    {projects?.map(p => <option key={p.id} value={p.id}>{p.name || p.client_name}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.phase_id || ''} onChange={e => setFormData({...formData, phase_id: e.target.value})}>
                    <option value="">בחר שלב...</option>
                    {phases?.filter(p => p.project_id === formData.project_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.priority || 'medium'} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="high">גבוהה</option>
                    <option value="medium">בינונית</option>
                    <option value="low">נמוכה</option>
                  </select>
                </td>
                <td className="p-4">
                  <input type="date" className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                </td>
                <td className="p-4">
                  <input type="checkbox" checked={formData.is_completed || false} onChange={e => setFormData({...formData, is_completed: e.target.checked})} className="w-4 h-4 accent-purple-500" />
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="text-green-400 hover:text-green-300"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setIsEditing(null)} className="text-zinc-400 hover:text-zinc-300"><X className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            )}
            
            {tasks?.map(task => (
              <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors group">
                {isEditing === task.id ? (
                  <>
                    <td className="p-4"><input type="text" className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></td>
                    <td className="p-4">
                      <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.project_id || ''} onChange={e => setFormData({...formData, project_id: e.target.value})}>
                        <option value="">בחר פרויקט...</option>
                        {projects?.map(p => <option key={p.id} value={p.id}>{p.name || p.client_name}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.phase_id || ''} onChange={e => setFormData({...formData, phase_id: e.target.value})}>
                        <option value="">בחר שלב...</option>
                        {phases?.filter(p => p.project_id === formData.project_id).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <select className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.priority || 'medium'} onChange={e => setFormData({...formData, priority: e.target.value})}>
                        <option value="high">גבוהה</option>
                        <option value="medium">בינונית</option>
                        <option value="low">נמוכה</option>
                      </select>
                    </td>
                    <td className="p-4"><input type="date" className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white" value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} /></td>
                    <td className="p-4"><input type="checkbox" checked={formData.is_completed || false} onChange={e => setFormData({...formData, is_completed: e.target.checked})} className="w-4 h-4 accent-purple-500" /></td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={handleSave} className="text-green-400 hover:text-green-300"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setIsEditing(null)} className="text-zinc-400 hover:text-zinc-300"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-slate-200">{task.name}</td>
                    <td className="p-4 text-zinc-400">{projects?.find(p => p.id === task.project_id)?.name || projects?.find(p => p.id === task.project_id)?.client_name || '-'}</td>
                    <td className="p-4 text-zinc-400">{phases?.find(p => p.id === task.phase_id)?.name || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs ${task.priority === 'high' ? 'bg-red-500/10 text-red-400' : task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {task.priority === 'high' ? 'גבוהה' : task.priority === 'medium' ? 'בינונית' : 'נמוכה'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-400">{task.due_date ? new Date(task.due_date).toLocaleDateString('he-IL') : '-'}</td>
                    <td className="p-4">
                      {task.is_completed ? <span className="text-green-500 text-sm">הושלם</span> : <span className="text-zinc-500 text-sm">פתוח</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setIsEditing(task.id); setFormData(task); }} className="text-zinc-400 hover:text-purple-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteMutation.mutate(task.id)} className="text-zinc-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
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
  );
}