import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProjectCard from '../components/ProjectCard';
import { Loader2, Plus, X, Save, Edit2, Trash2 } from 'lucide-react';

export default function Home() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['projects']); setIsEditing(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['projects']); setIsEditing(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['projects'])
  });

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      purchased_modules: typeof formData.purchased_modules === 'string' 
        ? formData.purchased_modules.split(',').map(m => m.trim()).filter(Boolean)
        : formData.purchased_modules
    };
    if (isEditing === 'new') createMutation.mutate(dataToSave);
    else updateMutation.mutate({ id: isEditing, data: dataToSave });
  };

  const { data: phases, isLoading: phasesLoading } = useQuery({
    queryKey: ['phases'],
    queryFn: () => base44.entities.Phase.list()
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list()
  });

  if (projectsLoading || phasesLoading || tasksLoading || clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const activeProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.is_completed)?.length || 0;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const latePhases = phases?.filter(p => p.status === 'late')?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">דשבורד פרויקטים</h1>
          <p className="text-slate-500 text-sm">מבט על לכלל הטמעות ה-LMS הפעילות</p>
        </div>
        <button
          onClick={() => { setIsEditing('new'); setFormData({}); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm w-full md:w-auto justify-center text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          פרויקט חדש
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-sm font-medium mb-4">פרויקטים פעילים</div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">{activeProjects}</div>
            <div className="text-emerald-500 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-md">+2 החודש</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-sm font-medium mb-4">התקדמות משימות כוללת</div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">{taskProgress}%</div>
            <div className="text-slate-400 text-sm">{completedTasks} מתוך {totalTasks}</div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${taskProgress}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 text-sm font-medium mb-4">שלבים בעיכוב</div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-slate-900">{latePhases}</div>
            {latePhases > 0 ? (
              <div className="text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded-md">דורש התייחסות</div>
            ) : (
              <div className="text-emerald-500 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-md">הכל תקין</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isEditing && (
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-md">
            <div className="space-y-4">
              <input type="text" placeholder="שם הפרויקט" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.client_id || ''} onChange={e => setFormData({ ...formData, client_id: e.target.value })}>
                <option value="">בחר לקוח...</option>
                {clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.start_date || ''} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
              <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.target_date || ''} onChange={e => setFormData({ ...formData, target_date: e.target.value })} />
              <input type="text" placeholder="מודולים נרכשים (מופרדים בפסיק)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.purchased_modules || ''} onChange={e => setFormData({ ...formData, purchased_modules: e.target.value })} />
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
              </div>
            </div>
          </div>
        )}

        {projects?.map(project => (
          <div key={project.id} className="relative group">
            <ProjectCard 
              project={project} 
              phases={phases || []} 
              tasks={tasks || []} 
              client={clients?.find(c => c.id === project.client_id)}
            />
            <div className="absolute top-4 left-4 flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(project.id); setFormData({ ...project, purchased_modules: project.purchased_modules?.join(', ') || '' }); }} className="bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteMutation.mutate(project.id); }} className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors border border-red-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {projects?.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
            <p className="text-slate-500">אין פרויקטים פעילים כרגע.</p>
          </div>
        )}
      </div>
    </div>
  );
}