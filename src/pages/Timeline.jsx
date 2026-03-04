import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit2, Trash2, Save, X, Calendar, Clock, LayoutList, KanbanSquare, GitCommit } from 'lucide-react';
import PhaseStageMap from '@/components/timeline/PhaseStageMap';

export default function Timeline() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});


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

  // Get unique phase names (generic stages)
  const uniquePhaseNames = [...new Set((phases || []).map(p => p.name).filter(Boolean))];



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

        </div>
      </header>

      {/* Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditing === 'new' ? 'שלב חדש' : 'עריכת שלב'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">שם השלב</label>
                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" value={formData.name || ''} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} autoFocus />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* חלק ראשון: ניהול שלבים גנריים */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">שלבי הטמעה</h2>
        <div className="flex flex-wrap gap-2">
          {uniquePhaseNames.map(name => (
            <span key={name} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-medium">
              {name}
            </span>
          ))}
          {uniquePhaseNames.length === 0 && (
            <p className="text-slate-400 text-sm">אין שלבים עדיין. הוסף שלב חדש.</p>
          )}
        </div>
      </div>

      {/* חלק שני: מפת שלבים-לקוחות */}
      <PhaseStageMap phases={phases} projects={projects} clients={clients} />


    </div>
  );
}