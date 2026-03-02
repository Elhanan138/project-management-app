import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProgressStepper from '../components/ProgressStepper';
import { Loader2, ArrowRight, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProjectDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const { data: project, isLoading: pLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.get(projectId),
    enabled: !!projectId
  });

  const { data: phases, isLoading: phLoading } = useQuery({
    queryKey: ['phases', projectId],
    queryFn: () => base44.entities.Phase.filter({ project_id: projectId })
  });

  const { data: tasks, isLoading: tLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => base44.entities.Task.filter({ project_id: projectId })
  });

  if (pLoading || phLoading || tLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  }

  if (!project) return <div>Project not found</div>;

  const sortedPhases = [...(phases || [])].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  
  // Basic Gantt calculations
  const projectStart = new Date(project.start_date);
  const projectEnd = new Date(project.target_date);
  const totalDuration = projectEnd.getTime() - projectStart.getTime();

  return (
    <div>
      <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-400 hover:text-purple-400 mb-6 transition-colors">
        <ArrowRight className="w-4 h-4" />
        חזרה לדשבורד
      </Link>

      <header className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 mb-2">{project.client_name}</h1>
            <div className="flex gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> התחלה: {new Date(project.start_date).toLocaleDateString('he-IL')}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> יעד: {new Date(project.target_date).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {project.purchased_modules?.map((m, i) => (
              <span key={i} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-md text-sm">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="px-8 pb-4">
          <ProgressStepper phases={sortedPhases} />
        </div>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          תצוגת גאנט (Gantt)
        </h2>
        
        <div className="relative mt-8">
          {/* Timeline header */}
          <div className="flex justify-between text-xs text-zinc-500 mb-4 px-2 border-b border-zinc-800 pb-2">
            <span>{new Date(project.start_date).toLocaleDateString('he-IL')}</span>
            <span>{new Date(project.target_date).toLocaleDateString('he-IL')}</span>
          </div>

          <div className="space-y-4">
            {sortedPhases.map(phase => {
              const phaseStart = new Date(phase.start_date);
              const phaseEnd = new Date(phase.expected_end_date);
              
              const leftPercent = Math.max(0, ((phaseStart.getTime() - projectStart.getTime()) / totalDuration) * 100);
              const widthPercent = Math.min(100 - leftPercent, ((phaseEnd.getTime() - phaseStart.getTime()) / totalDuration) * 100);

              const statusColors = {
                completed: 'bg-green-500',
                in_progress: 'bg-purple-500',
                late: 'bg-red-500',
                not_started: 'bg-zinc-700'
              };

              const phaseTasks = tasks?.filter(t => t.phase_id === phase.id) || [];
              const completedTasks = phaseTasks.filter(t => t.is_completed).length;

              return (
                <div key={phase.id} className="relative h-12 flex items-center group">
                  <div className="w-48 text-sm font-medium text-slate-300 truncate pr-4 flex items-center gap-2">
                    {phase.status === 'late' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {phase.name}
                  </div>
                  <div className="flex-1 relative h-full bg-zinc-950/50 rounded-lg overflow-hidden border border-zinc-800/50">
                    <div 
                      className={`absolute top-2 bottom-2 rounded-md ${statusColors[phase.status]} opacity-80 transition-all duration-500 group-hover:opacity-100 flex items-center px-3 text-xs font-bold text-white shadow-sm`}
                      style={{ right: `${leftPercent}%`, width: `${widthPercent}%` }}
                    >
                      <span className="truncate">{completedTasks}/{phaseTasks.length} משימות</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}