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
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">דשבורד פרויקטים</h1>
          <p className="text-zinc-400">מבט על לכלל הטמעות ה-LMS הפעילות</p>
        </div>
        <button
          onClick={() => { setIsEditing('new'); setFormData({}); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          פרויקט חדש
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isEditing === 'new' && (
          <div className="bg-zinc-900 border border-purple-500/50 rounded-xl p-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <div className="space-y-4">
              <input type="text" placeholder="שם הפרויקט" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none" value={formData.client_id || ''} onChange={e => setFormData({ ...formData, client_id: e.target.value })}>
                <option value="">בחר לקוח...</option>
                {clients?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none" value={formData.start_date || ''} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
              <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none" value={formData.target_date || ''} onChange={e => setFormData({ ...formData, target_date: e.target.value })} />
              <input type="text" placeholder="מודולים נרכשים (מופרדים בפסיק)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none" value={formData.purchased_modules || ''} onChange={e => setFormData({ ...formData, purchased_modules: e.target.value })} />
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex justify-center items-center gap-2"><Save className="w-4 h-4" /> שמור</button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg flex justify-center items-center gap-2"><X className="w-4 h-4" /> בטל</button>
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
            <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Note: Edit is complex for ProjectCard, we'll just allow delete for now to keep it simple, or add a small edit button */}
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteMutation.mutate(project.id); }} className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/30 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {projects?.length === 0 && (
          <div className="col-span-full text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
            <p className="text-zinc-500">אין פרויקטים פעילים כרגע.</p>
          </div>
        )}
      </div>
    </div>
  );
}