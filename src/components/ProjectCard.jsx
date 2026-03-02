import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function ProjectCard({ project, phases, tasks, client }) {
  // Calculate progress based on tasks
  const projectTasks = tasks.filter(t => t.project_id === project.id);
  const completedTasks = projectTasks.filter(t => t.is_completed).length;
  const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  // Current phase
  const projectPhases = phases.filter(p => p.project_id === project.id);
  const currentPhase = projectPhases.find(p => p.status === 'in_progress' || p.status === 'late') || projectPhases[0];
  
  const isLate = currentPhase?.status === 'late';

  return (
    <Link to={`${createPageUrl('ProjectDetails')}?id=${project.id}`} className="block">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-50 mb-1 group-hover:text-purple-400 transition-colors">
              {project.name || client?.name || project.client_name || 'פרויקט ללא שם'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span>יעד: {new Date(project.target_date).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
          {isLate && (
            <div className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium border border-red-500/20">
              <AlertCircle className="w-4 h-4" />
              עיכוב
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">התקדמות</span>
            <span className="font-medium text-slate-200">{progress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isLate ? 'bg-red-500' : 'bg-purple-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.purchased_modules?.map((module, idx) => (
            <span key={idx} className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-md">
              {module}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">שלב נוכחי:</span>
            <span className={`font-medium ${isLate ? 'text-red-400' : 'text-purple-400'}`}>
              {currentPhase?.name || 'לא הוגדר'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-zinc-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{completedTasks}/{projectTasks.length} משימות</span>
          </div>
        </div>
      </div>
    </Link>
  );
}