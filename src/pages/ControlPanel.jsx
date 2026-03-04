import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Map } from 'lucide-react';
import ProgressStepper from '../components/ProgressStepper';

export default function ControlPanel() {
  const { data: projects, isLoading: pLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const { data: clients, isLoading: cLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: phases, isLoading: phLoading } = useQuery({
    queryKey: ['phases'],
    queryFn: () => base44.entities.Phase.list()
  });

  if (pLoading || cLoading || phLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
          <Map className="w-8 h-8 text-emerald-500" />
          עמוד שליטה - סטטוס פרויקטים
        </h1>
        <p className="text-slate-500">תצוגה ויזואלית של התקדמות השלבים בכל פרויקט</p>
      </header>

      <div className="space-y-6">
        {projects?.map(project => {
          const client = clients?.find(c => c.id === project.client_id);
          const projectPhases = phases?.filter(p => p.project_id === project.id) || [];
          const sortedPhases = [...projectPhases].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
          
          return (
            <div key={project.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">{client?.name || 'לקוח לא ידוע'} - {project.name}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {sortedPhases.length} שלבים מוגדרים
                </p>
              </div>
              <div className="overflow-x-auto pb-4">
                <ProgressStepper phases={sortedPhases} />
              </div>
            </div>
          );
        })}
        {projects?.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">אין פרויקטים פעילים.</p>
          </div>
        )}
      </div>
    </div>
  );
}