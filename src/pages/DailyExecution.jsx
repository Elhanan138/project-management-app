import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import TaskItem from '../components/TaskItem';
import { Loader2, LayoutList, KanbanSquare, Save, X } from 'lucide-react';

export default function DailyExecution() {
  const queryClient = useQueryClient();
  const [view, setView] = useState('list'); // 'list' or 'kanban'
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: projects, isLoading: pLoading } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });
  const { data: phases, isLoading: phLoading } = useQuery({ queryKey: ['phases'], queryFn: () => base44.entities.Phase.list() });
  const { data: tasks, isLoading: tLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list() });
  const { data: clients, isLoading: cLoading } = useQuery({ queryKey: ['clients'], queryFn: () => base44.entities.Client.list() });

  if (pLoading || phLoading || tLoading || cLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const openTasks = tasks?.filter(t => !t.is_completed) || [];
  
  // Sort by priority (high -> medium -> low) then by due date
  const priorityWeight = { high: 1, medium: 2, low: 3 };
  const sortedTasks = [...openTasks].sort((a, b) => {
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    }
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const getProject = (id) => projects?.find(p => p.id === id);
  const getPhase = (id) => phases?.find(p => p.id === id);
  const getClient = (projectId) => {
    const project = getProject(projectId);
    return clients?.find(c => c.id === project?.client_id);
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['tasks']); setIsEditing(null); }
  });

  const handleSave = () => {
    updateMutation.mutate({ id: isEditing, data: formData });
  };

  return (
    <div>
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">עריכת משימה</h2>
            <div className="space-y-4">
              <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.priority || 'medium'} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="high">גבוהה</option>
                <option value="medium">בינונית</option>
                <option value="low">נמוכה</option>
              </select>
              <input type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.due_date || ''} onChange={e => setFormData({...formData, due_date: e.target.value})} />
              <div className="flex gap-2 pt-4">
                <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">ביצוע יומי</h1>
          <p className="text-slate-500">ניהול משימות רוחבי לכלל הפרויקטים</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm w-full md:w-auto">
          <button 
            onClick={() => setView('list')}
            className={`flex-1 md:flex-none p-2 rounded-lg transition-colors flex justify-center ${view === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setView('kanban')}
            className={`flex-1 md:flex-none p-2 rounded-lg transition-colors flex justify-center ${view === 'kanban' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <KanbanSquare className="w-5 h-5" />
          </button>
        </div>
      </header>

      {view === 'list' ? (
        <div className="space-y-4 max-w-4xl">
          {sortedTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              project={getProject(task.project_id)} 
              phase={getPhase(task.phase_id)} 
              client={getClient(task.project_id)}
              onEdit={(t) => { setIsEditing(t.id); setFormData(t); }}
            />
          ))}
          {sortedTasks.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">אין משימות פתוחות! 🎉</div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['high', 'medium', 'low'].map(priority => {
            const priorityTasks = sortedTasks.filter(t => t.priority === priority);
            const titles = { high: 'עדיפות גבוהה', medium: 'עדיפות בינונית', low: 'עדיפות נמוכה' };
            const colors = { high: 'border-red-200 text-red-700', medium: 'border-amber-200 text-amber-700', low: 'border-cyan-200 text-cyan-700' };
            const bgColors = { high: 'bg-red-50/50', medium: 'bg-amber-50/50', low: 'bg-cyan-50/50' };
            
            return (
              <div key={priority} className={`bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col h-[calc(100vh-200px)] shadow-sm`}>
                <h3 className={`font-bold mb-4 pb-3 border-b ${colors[priority]} flex justify-between items-center`}>
                  <span>{titles[priority]}</span>
                  <span className="bg-white shadow-sm text-xs px-2.5 py-1 rounded-full border border-slate-100">{priorityTasks.length}</span>
                </h3>
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar pb-4">
                  {priorityTasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      project={getProject(task.project_id)} 
                      phase={getPhase(task.phase_id)} 
                      client={getClient(task.project_id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}