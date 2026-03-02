import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProjectCard from '../components/ProjectCard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const { data: phases, isLoading: phasesLoading } = useQuery({
    queryKey: ['phases'],
    queryFn: () => base44.entities.Phase.list()
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.Task.list()
  });

  if (projectsLoading || phasesLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50 mb-2">דשבורד פרויקטים</h1>
        <p className="text-zinc-400">מבט על לכלל הטמעות ה-LMS הפעילות</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            phases={phases || []} 
            tasks={tasks || []} 
          />
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