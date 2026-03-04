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
            מעקב שלבים
          </h1>
          <p className="text-slate-500">מעקב אחר כלל שלבי ההטמעה בכל הפרויקטים</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm w-full md:w-auto">
            <button onClick={() => setView('timeline')} className={`flex-1 md:flex-none p-2 rounded-lg transition-colors flex justify-center ${view === 'timeline' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="טיימליין"><GitCommit className="w-5 h-5" /></button>
            <button onClick={() => setView('list')} className={`flex-1 md:flex-none p-2 rounded-lg transition-colors flex justify-center ${view === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="רשימה"><LayoutList className="w-5 h-5" /></button>
            <button onClick={() => setView('kanban')} className={`flex-1 md:flex-none p-2 rounded-lg transition-colors flex justify-center ${view === 'kanban' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="קנבן"><KanbanSquare className="w-5 h-5" /></button>
          </div>
          <button
            onClick={() => { setIsEditing('new'); setFormData({ status: 'not_started' }); }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
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
                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">פרויקט</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.project_id || ''} onChange={e => setFormData({...formData, project_id: e.target.value})}>
                  <option value="">בחר פרויקט...</option>
                  {projects?.map(p => {
                    const client = clients?.find(c => c.id === p.client_id);
                    return <option key={p.id} value={p.id}>{p.name || client?.name || 'פרויקט ללא שם'}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תאריך התחלה</label>
                <input type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.start_date || ''} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">תאריך סיום צפוי</label>
                <input type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.expected_end_date || ''} onChange={e => setFormData({...formData, expected_end_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">סטטוס</label>
                <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.status || 'not_started'} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="not_started">טרם התחיל</option>
                  <option value="in_progress">בתהליך</option>
                  <option value="completed">הושלם</option>
                  <option value="late">מאחר</option>
                </select>
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
      )}

      {view === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-medium">שם השלב</th>
                <th className="p-4 font-medium">פרויקט / לקוח</th>
                <th className="p-4 font-medium">סטטוס</th>
                <th className="p-4 font-medium">התחלה</th>
                <th className="p-4 font-medium">סיום צפוי</th>
                <th className="p-4 font-medium w-24">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedPhases.map(phase => {
                const project = projects?.find(p => p.id === phase.project_id);
                const client = clients?.find(c => c.id === project?.client_id);
                const clientName = client?.name || project?.name || 'לקוח לא ידוע';
                return (
                  <tr key={phase.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-slate-800 font-medium cursor-pointer hover:text-emerald-600" onClick={() => { setIsEditing(phase.id); setFormData(phase); }}>{phase.name}</td>
                    <td className="p-4 text-slate-500">{clientName}</td>
                    <td className="p-4"><span className={`px-2.5 py-1 rounded-md text-xs border ${statusColors[phase.status]}`}>{statusLabels[phase.status]}</span></td>
                    <td className="p-4 text-slate-500">{new Date(phase.start_date).toLocaleDateString('he-IL')}</td>
                    <td className="p-4 text-slate-500">{new Date(phase.expected_end_date).toLocaleDateString('he-IL')}</td>
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

      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {['not_started', 'in_progress', 'completed', 'late'].map(status => {
            const statusPhases = sortedPhases.filter(p => p.status === status);
            return (
              <div key={status} className="bg-slate-100/50 rounded-xl p-3 border border-slate-200 flex flex-col max-h-[calc(100vh-250px)]">
                <h3 className={`font-semibold mb-3 flex justify-between items-center text-sm ${statusColors[status].split(' ')[1]}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[0]}`}></div>
                    <span>{statusLabels[status]}</span>
                  </div>
                  <span className="bg-slate-200/50 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">{statusPhases.length}</span>
                </h3>
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 custom-scrollbar pb-2">
                  {statusPhases.map(phase => {
                    const project = projects?.find(p => p.id === phase.project_id);
                    const client = clients?.find(c => c.id === project?.client_id);
                    const clientName = client?.name || project?.name || 'לקוח לא ידוע';
                    return (
                      <div key={phase.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group cursor-pointer" onClick={() => { setIsEditing(phase.id); setFormData(phase); }}>
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="font-semibold text-slate-900 text-sm leading-tight">{phase.name}</h4>
                          <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(phase.id); }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <p className="text-slate-500 text-xs font-medium mb-3">{clientName}</p>
                        <div className="flex flex-col gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-md">
                          <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> התחלה: {new Date(phase.start_date).toLocaleDateString('he-IL')}</div>
                          <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> יעד: {new Date(phase.expected_end_date).toLocaleDateString('he-IL')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}