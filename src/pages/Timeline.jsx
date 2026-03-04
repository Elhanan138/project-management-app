import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit2, Trash2, Save, X, Calendar, Clock } from 'lucide-react';

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

  const statusColors = {
    not_started: 'bg-slate-100 text-slate-600 border-slate-200',
    in_progress: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    late: 'bg-red-50 text-red-600 border-red-200'
  };

  const statusLabels = {
    not_started: 'טרם התחיל',
    in_progress: 'בתהליך',
    completed: 'הושלם',
    late: 'מאחר'
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Clock className="w-8 h-8 text-emerald-500" />
            טיימליין שלבים
          </h1>
          <p className="text-slate-500">מעקב אחר כלל שלבי ההטמעה בכל הפרויקטים</p>
        </div>
        <button
          onClick={() => { setIsEditing('new'); setFormData({ status: 'not_started' }); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          שלב חדש
        </button>
      </header>

      {isEditing && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <input type="text" placeholder="שם השלב" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.project_id || ''} onChange={e => setFormData({ ...formData, project_id: e.target.value })}>
              <option value="">בחר פרויקט...</option>
              {projects?.map(p => {
                const client = clients?.find(c => c.id === p.client_id);
                return <option key={p.id} value={p.id}>{p.name || client?.name || 'פרויקט ללא שם'}</option>;
              })}
            </select>
            <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.start_date || ''} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
            <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.expected_end_date || ''} onChange={e => setFormData({ ...formData, expected_end_date: e.target.value })} />
            <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all" value={formData.status || 'not_started'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
              <option value="not_started">טרם התחיל</option>
              <option value="in_progress">בתהליך</option>
              <option value="completed">הושלם</option>
              <option value="late">מאחר</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
            <button onClick={() => setIsEditing(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
          </div>
        </div>
      )}

      <div className="relative border-r-2 border-emerald-200 mr-4 pr-6 space-y-8 py-4">
        {sortedPhases.map((phase, index) => {
          const project = projects?.find(p => p.id === phase.project_id);
          const client = clients?.find(c => c.id === project?.client_id);
          const clientName = client?.name || project?.name || 'לקוח לא ידוע';

          return (
            <div key={phase.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -right-[35px] top-4 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-emerald-300">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{phase.name}</h3>
                    <p className="text-emerald-600 font-medium">{clientName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusColors[phase.status]}`}>
                      {statusLabels[phase.status]}
                    </span>
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setIsEditing(phase.id); setFormData(phase); }} className="text-slate-400 hover:text-emerald-500 p-1.5 bg-slate-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteMutation.mutate(phase.id)} className="text-slate-400 hover:text-red-500 p-1.5 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>התחלה: {new Date(phase.start_date).toLocaleDateString('he-IL')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>סיום צפוי: {new Date(phase.expected_end_date).toLocaleDateString('he-IL')}</span>
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
    </div>
  );
}