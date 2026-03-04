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
  const sortedPhases = [...projectPhases].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  const currentPhase = sortedPhases.find(p => p.status !== 'completed') || sortedPhases[sortedPhases.length - 1];
  
  const isLate = currentPhase?.status === 'late';

  return (
    <Link to={`${createPageUrl('ProjectDetails')}?id=${project.id}`} className="block h-full">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-emerald-400 hover:shadow-md transition-all duration-300 group shadow-sm h-full flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="pl-8">
            <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-2">
              {project.name || client?.name || project.client_name || 'פרויקט ללא שם'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>יעד: {new Date(project.target_date).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
          {isLate && (
            <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium border border-red-100 shrink-0">
              <AlertCircle className="w-3 h-3" />
              עיכוב
            </div>
          )}
        </div>

        <div className="mb-6 flex-1">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">התקדמות</span>
            <span className="font-medium text-slate-700">{progress}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isLate ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {project.purchased_modules?.map((module, idx) => (
            <span key={idx} className="bg-cyan-50 text-cyan-700 border border-cyan-100 text-xs px-2.5 py-1 rounded-lg font-medium">
              {module}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">שלב נוכחי:</span>
            <span className={`font-medium ${isLate ? 'text-red-500' : 'text-emerald-600'}`}>
              {currentPhase?.name || 'לא הוגדר'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{completedTasks}/{projectTasks.length}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}