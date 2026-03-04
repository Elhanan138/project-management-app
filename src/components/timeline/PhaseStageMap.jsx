import React from 'react';
import { Users, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PhaseStageMap({ phases, projects, clients }) {
  // Group phases by name, then collect clients/projects for each
  const phaseNameGroups = {};
  (phases || []).forEach(phase => {
    const name = phase.name;
    if (!name) return;
    if (!phaseNameGroups[name]) phaseNameGroups[name] = [];
    
    const project = projects?.find(p => p.id === phase.project_id);
    if (!project) return;
    const client = clients?.find(c => c.id === project.client_id);
    
    // Avoid duplicates (same project)
    if (!phaseNameGroups[name].find(item => item.projectId === project.id)) {
      phaseNameGroups[name].push({
        projectId: project.id,
        projectName: project.name || client?.name || 'ללא שם',
        clientName: client?.name || '',
        status: phase.status
      });
    }
  });

  const stageNames = Object.keys(phaseNameGroups);

  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-cyan-100 text-cyan-700',
    late: 'bg-red-100 text-red-700',
    not_started: 'bg-slate-100 text-slate-600'
  };

  const statusLabels = {
    completed: 'הושלם',
    in_progress: 'בתהליך',
    late: 'מאחר',
    not_started: 'טרם התחיל'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-emerald-500" />
        <h2 className="text-lg font-bold text-slate-800">מפת שלבים ולקוחות</h2>
      </div>

      {stageNames.length === 0 && (
        <p className="text-slate-400 text-sm py-4">אין שלבים משויכים ללקוחות.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stageNames.map(stageName => {
          const items = phaseNameGroups[stageName];
          return (
            <div key={stageName} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">{stageName}</h3>
                <span className="text-xs text-slate-400">{items.length} לקוחות</span>
              </div>
              <div className="divide-y divide-slate-100">
                {items.map(item => (
                  <Link
                    key={item.projectId}
                    to={createPageUrl('ProjectDetails') + `?id=${item.projectId}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-700">{item.clientName || item.projectName}</p>
                      {item.clientName && item.projectName !== item.clientName && (
                        <p className="text-xs text-slate-400">{item.projectName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status] || statusColors.not_started}`}>
                        {statusLabels[item.status] || statusLabels.not_started}
                      </span>
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}