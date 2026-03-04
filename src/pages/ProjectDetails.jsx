import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProgressStepper from '@/components/ProgressStepper';
import { Loader2, ArrowRight, Calendar, AlertCircle, Plus, Edit2, Trash2, Save, X, GitCommit, LayoutList, LayoutGrid, Pencil, Clock } from 'lucide-react';
import { TimelineView, TableView, CardsView } from '../components/project/PhaseTimeline';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ModulesEditorInline from '@/components/project/ModulesEditorInline';
import HoursMeter from '@/components/project/HoursMeter';

export default function ProjectDetails() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const [isEditingPhase, setIsEditingPhase] = useState(null);
  const [phaseFormData, setPhaseFormData] = useState({});
  const [ganttView, setGanttView] = useState('timeline');
  const [editingModules, setEditingModules] = useState(false);

  const { data: project, isLoading: pLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => base44.entities.Project.get(projectId),
    enabled: !!projectId
  });

  const { data: client } = useQuery({
    queryKey: ['client', project?.client_id],
    queryFn: () => base44.entities.Client.get(project.client_id),
    enabled: !!project?.client_id
  });

  const { data: phases, isLoading: phLoading } = useQuery({
    queryKey: ['phases', projectId],
    queryFn: () => base44.entities.Phase.filter({ project_id: projectId })
  });

  // All phases (from מעקב שלבים) for the dropdown
  const { data: allPhases } = useQuery({
    queryKey: ['allPhases'],
    queryFn: () => base44.entities.Phase.list()
  });

  // Get unique phase names from the global phases list
  const phaseNames = [...new Set((allPhases || []).map(p => p.name).filter(Boolean))];

  const { data: tasks, isLoading: tLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => base44.entities.Task.filter({ project_id: projectId })
  });

  const createPhaseMutation = useMutation({
    mutationFn: (data) => base44.entities.Phase.create({ ...data, project_id: projectId }),
    onSuccess: () => { queryClient.invalidateQueries(['phases', projectId]); setIsEditingPhase(null); }
  });

  const updatePhaseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Phase.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['phases', projectId]); setIsEditingPhase(null); }
  });

  const deletePhaseMutation = useMutation({
    mutationFn: (id) => base44.entities.Phase.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['phases', projectId])
  });

  const handleSavePhase = () => {
    if (isEditingPhase === 'new') createPhaseMutation.mutate(phaseFormData);
    else updatePhaseMutation.mutate({ id: isEditingPhase, data: phaseFormData });
  };

  if (pLoading || phLoading || tLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (!project) return <div>Project not found</div>;

  const totalHoursUsed = (phases || []).reduce((sum, p) => sum + (p.duration_hours || 0), 0);
  const totalHoursPurchased = project.total_hours_purchased || 0;

  const sortedPhases = [...(phases || [])].sort((a, b) => {
    const aDate = a.meeting_date || a.start_date || '';
    const bDate = b.meeting_date || b.start_date || '';
    return new Date(aDate) - new Date(bDate);
  });

  return (
    <div>
      <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
        <ArrowRight className="w-4 h-4" />
        חזרה לדשבורד
      </Link>

      <header className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.name || client?.name || project.client_name || 'פרויקט ללא שם'}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> התחלה: {new Date(project.start_date).toLocaleDateString('he-IL')}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> יעד: {new Date(project.target_date).toLocaleDateString('he-IL')}</span>
                </div>
              </div>
              <ModulesEditorInline
                modules={project.purchased_modules || []}
                projectId={project.id}
              />
            </div>
            <div className="px-2 md:px-8 pb-4 overflow-x-auto">
              <ProgressStepper phases={sortedPhases} />
            </div>
          </div>
          <div className="md:w-56 flex-shrink-0">
            <HoursMeter
              totalUsed={totalHoursUsed}
              totalPurchased={totalHoursPurchased}
              projectId={project.id}
            />
          </div>
        </div>
      </header>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            ציר זמן שלבים
          </h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => { setIsEditingPhase('new'); setPhaseFormData({ status: 'not_started' }); }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              הוסף שלב
            </button>
            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button onClick={() => setGanttView('timeline')} className={`p-1.5 rounded-md transition-colors ${ganttView === 'timeline' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="ציר זמן"><GitCommit className="w-4 h-4" /></button>
              <button onClick={() => setGanttView('table')} className={`p-1.5 rounded-md transition-colors ${ganttView === 'table' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="טבלה"><LayoutList className="w-4 h-4" /></button>
              <button onClick={() => setGanttView('cards')} className={`p-1.5 rounded-md transition-colors ${ganttView === 'cards' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`} title="כרטיסיות"><LayoutGrid className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isEditingPhase && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-4">{isEditingPhase === 'new' ? 'שלב חדש' : 'עריכת שלב'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">שם השלב</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.name || ''} onChange={e => setPhaseFormData({...phaseFormData, name: e.target.value})}>
                    <option value="">בחר שלב...</option>
                    {phaseNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">תאריך פגישה</label>
                  <input type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.meeting_date || ''} onChange={e => setPhaseFormData({...phaseFormData, meeting_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">משך פגישה (שעות)</label>
                  <input type="number" step="0.5" min="0" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.duration_hours || ''} onChange={e => setPhaseFormData({...phaseFormData, duration_hours: parseFloat(e.target.value) || 0})} placeholder="לדוגמה: 1.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">סטטוס</label>
                  <select className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.status || 'not_started'} onChange={e => setPhaseFormData({...phaseFormData, status: e.target.value})}>
                    <option value="not_started">מתוכנן</option>
                    <option value="completed">הושלם</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <button onClick={handleSavePhase} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                  <button onClick={() => setIsEditingPhase(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {ganttView === 'timeline' && (
          <TimelineView
            phases={sortedPhases}
            tasks={tasks}
            onEdit={(phase) => { setIsEditingPhase(phase.id); setPhaseFormData(phase); }}
            onDelete={(id) => deletePhaseMutation.mutate(id)}
            onStatusChange={(id, status) => updatePhaseMutation.mutate({ id, data: { status } })}
          />
        )}
        {ganttView === 'table' && (
          <TableView
            phases={sortedPhases}
            tasks={tasks}
            onEdit={(phase) => { setIsEditingPhase(phase.id); setPhaseFormData(phase); }}
            onDelete={(id) => deletePhaseMutation.mutate(id)}
            onStatusChange={(id, status) => updatePhaseMutation.mutate({ id, data: { status } })}
          />
        )}
        {ganttView === 'cards' && (
          <CardsView
            phases={sortedPhases}
            tasks={tasks}
            onEdit={(phase) => { setIsEditingPhase(phase.id); setPhaseFormData(phase); }}
            onDelete={(id) => deletePhaseMutation.mutate(id)}
            onStatusChange={(id, status) => updatePhaseMutation.mutate({ id, data: { status } })}
          />
        )}
      </div>
    </div>
  );
}