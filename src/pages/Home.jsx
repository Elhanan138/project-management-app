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

        </div>

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


        {projects?.map(project => (
          <div key={project.id} className="relative group">
            <ProjectCard 
              project={project} 
              phases={phases || []} 
              tasks={tasks || []} 
              client={clients?.find(c => c.id === project.client_id)}
            />

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