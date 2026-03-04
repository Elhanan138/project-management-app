import React, { useState } from 'react';
import { Users, ChevronLeft, LayoutGrid, LayoutList, Table2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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

function buildGroups(phases, projects, clients) {
  const phaseNameGroups = {};
  (phases || []).forEach(phase => {
    const name = phase.name;
    if (!name) return;
    if (!phaseNameGroups[name]) phaseNameGroups[name] = [];
    const project = projects?.find(p => p.id === phase.project_id);
    if (!project) return;
    const client = clients?.find(c => c.id === project.client_id);
    if (!phaseNameGroups[name].find(item => item.projectId === project.id)) {
      phaseNameGroups[name].push({
        projectId: project.id,
        projectName: project.name || client?.name || 'ללא שם',
        clientName: client?.name || '',
        status: phase.status
      });
    }
  });
  return phaseNameGroups;
}

// Cards view (original)
function CardsView({ stageNames, groups }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {stageNames.map(stageName => {
        const items = groups[stageName];
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.clientName || item.projectName}</p>
                    {item.clientName && item.projectName !== item.clientName && (
                      <p className="text-xs text-slate-400 truncate">{item.projectName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
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
  );
}

// Table view
function TableView({ stageNames, groups }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-x-auto">
      <table className="w-full text-right min-w-[500px]">
        <thead className="bg-slate-50 text-slate-500 text-xs">
          <tr>
            <th className="px-4 py-3 font-medium">שלב</th>
            <th className="px-4 py-3 font-medium">לקוח</th>
            <th className="px-4 py-3 font-medium">פרויקט</th>
            <th className="px-4 py-3 font-medium">סטטוס</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stageNames.flatMap(stageName =>
            groups[stageName].map(item => (
              <tr key={`${stageName}-${item.projectId}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{stageName}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <Link to={createPageUrl('ProjectDetails') + `?id=${item.projectId}`} className="hover:text-emerald-600 transition-colors">
                    {item.clientName || item.projectName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{item.projectName}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status] || statusColors.not_started}`}>
                    {statusLabels[item.status] || statusLabels.not_started}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// List view - flat list grouped by stage
function ListView({ stageNames, groups }) {
  return (
    <div className="space-y-4">
      {stageNames.map(stageName => {
        const items = groups[stageName];
        return (
          <div key={stageName}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">{stageName}</h3>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map(item => (
                <Link
                  key={item.projectId}
                  to={createPageUrl('ProjectDetails') + `?id=${item.projectId}`}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-slate-700">{item.clientName || item.projectName}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[item.status] || statusColors.not_started}`}>
                    {statusLabels[item.status] || statusLabels.not_started}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PhaseStageMap({ phases, projects, clients }) {
  const [view, setView] = useState('cards');
  const groups = buildGroups(phases, projects, clients);
  const stageNames = Object.keys(groups);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">מפת שלבים ולקוחות</h2>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
          <button onClick={() => setView('cards')} className={`p-1.5 rounded-md transition-colors ${view === 'cards' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="כרטיסיות"><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView('table')} className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="טבלה"><Table2 className="w-4 h-4" /></button>
          <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="רשימה"><LayoutList className="w-4 h-4" /></button>
        </div>
      </div>

      {stageNames.length === 0 && (
        <p className="text-slate-400 text-sm py-4">אין שלבים משויכים ללקוחות.</p>
      )}

      {stageNames.length > 0 && view === 'cards' && <CardsView stageNames={stageNames} groups={groups} />}
      {stageNames.length > 0 && view === 'table' && <TableView stageNames={stageNames} groups={groups} />}
      {stageNames.length > 0 && view === 'list' && <ListView stageNames={stageNames} groups={groups} />}
    </div>
  );
}