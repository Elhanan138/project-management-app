import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckSquare, Briefcase, ClipboardList } from 'lucide-react';
import ProjectTasksTab from '../components/tasks/ProjectTasksTab';
import GeneralTasksTab from '../components/tasks/GeneralTasksTab';

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('project');

  const { isLoading: tasksLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => base44.entities.Task.list() });
  const { isLoading: projectsLoading } = useQuery({ queryKey: ['projects'], queryFn: () => base44.entities.Project.list() });
  const { isLoading: phasesLoading } = useQuery({ queryKey: ['phases'], queryFn: () => base44.entities.Phase.list() });

  if (tasksLoading || projectsLoading || phasesLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const tabs = [
    { id: 'project', label: 'משימות פרויקטים', icon: Briefcase },
    { id: 'general', label: 'משימות כלליות', icon: ClipboardList },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-3">
          <CheckSquare className="w-7 h-7 text-emerald-500" />
          ניהול משימות
        </h1>
        <p className="text-slate-500 text-sm">ניהול ומעקב אחר כלל המשימות</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'project' && <ProjectTasksTab />}
      {activeTab === 'general' && <GeneralTasksTab />}
    </div>
  );
}