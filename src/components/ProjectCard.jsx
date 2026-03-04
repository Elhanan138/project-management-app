import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

import { MoreHorizontal } from 'lucide-react';

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
    <Link to={`${createPageUrl('ProjectDetails')}?id=${project.id}`} className="block h-full outline-none">
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group h-full flex flex-col relative">
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 pl-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {client?.name || project.client_name || 'לקוח לא מוגדר'}
              </span>
              {isLate && (
                <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> עיכוב
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors truncate">
              {project.name || 'פרויקט ללא שם'}
            </h3>
          </div>
          <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>יעד: {new Date(project.target_date).toLocaleDateString('he-IL')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{currentPhase?.name || 'אין שלב פעיל'}</span>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">התקדמות משימות</span>
            <span className="font-semibold text-slate-700">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${isLate ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {project.purchased_modules?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-slate-100">
            {project.purchased_modules.slice(0, 3).map((module, idx) => (
              <span key={idx} className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] px-2 py-0.5 rounded font-medium">
                {module}
              </span>
            ))}
            {project.purchased_modules.length > 3 && (
              <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] px-2 py-0.5 rounded font-medium">
                +{project.purchased_modules.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}