import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit2, Trash2, Save, X, Calendar, Clock, LayoutList, KanbanSquare, GitCommit } from 'lucide-react';

export default function Timeline() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [view, setView] = useState('timeline');

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: phases, isLoading: phasesLoading } = useQuery({
    queryKey: ['phases'],
    queryFn: () => base44.entities.Phase.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Phase.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['phases']); setIsEditing(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Phase.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['phases']); setIsEditing(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Phase.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['phases'])
  });

  const handleSave = () => {
    if (isEditing === 'new') createMutation.mutate(formData);
    else updateMutation.mutate({ id: isEditing, data: formData });
  };

  if (projectsLoading || clientsLoading || phasesLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  const sortedPhases = [...(phases || [])].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));



  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Clock className="w-8 h-8 text-emerald-500" />
            מעקב שלבים
          </h1>
          <p className="text-slate-500">מעקב אחר כלל שלבי ההטמעה בכל הפרויקטים</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => { setIsEditing('new'); setFormData({ status: 'not_started' }); }}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm w-full md:w-auto justify-center text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            שלב חדש
          </button>
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm w-full md:w-auto">
            <button onClick={() => setView('timeline')} className={`flex-1 md:flex-none p-2 rounded-lg transition-colors flex justify-center ${view === 'timeline' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="טיימליין"><GitCommit className="w-5 h-5" /></button>
            <button onClick={() => setView('list')} className={`flex-1 md:flex-none p-2 rounded-lg transition-colors flex justify-center ${view === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="רשימה"><LayoutList className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">עדכון סטטוס שלב</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם השלב</label>
                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 outline-none" value={formData.name || ''} disabled />
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'timeline' && (
        <div className="relative border-r-2 border-emerald-200 mr-4 pr-6 space-y-8 py-4">
          {sortedPhases.map((phase, index) => {
          const project = projects?.find(p => p.id === phase.project_id);
          const client = clients?.find(c => c.id === project?.client_id);
          const clientName = client?.name || project?.name;

          return (
            <div key={phase.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -right-[35px] top-4 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-emerald-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{phase.name}</h3>
                    {clientName && <p className="text-emerald-600 font-medium">{clientName}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setIsEditing(phase.id); setFormData(phase); }} className="text-slate-400 hover:text-emerald-500 p-1.5 bg-slate-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteMutation.mutate(phase.id)} className="text-slate-400 hover:text-red-500 p-1.5 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
          {sortedPhases.length === 0 && (
            <div className="text-slate-500 py-8">אין שלבים להצגה.</div>
          )}
        </div>
      )}

      {view === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-medium">שם השלב</th>
                <th className="p-4 font-medium">לקוחות שבשלב זה</th>
                <th className="p-4 font-medium w-24">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPhases.map(phase => {
                const project = projects?.find(p => p.id === phase.project_id);
                const client = clients?.find(c => c.id === project?.client_id);
                const clientName = client?.name || project?.name;
                return (
                  <tr key={phase.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-slate-800 font-medium cursor-pointer hover:text-emerald-600" onClick={() => { setIsEditing(phase.id); setFormData(phase); }}>{phase.name}</td>
                    <td className="p-4 text-slate-500">{clientName || ''}</td>
                    <td className="p-4">
                      <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setIsEditing(phase.id); setFormData(phase); }} className="text-slate-400 hover:text-emerald-500"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteMutation.mutate(phase.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}


    </div>
  );
}