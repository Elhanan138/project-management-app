import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProgressStepper from '../components/ProgressStepper';
import { Loader2, ArrowRight, Calendar, AlertCircle, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProjectDetails() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  const [isEditingPhase, setIsEditingPhase] = useState(null);
  const [phaseFormData, setPhaseFormData] = useState({});

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

  const sortedPhases = [...(phases || [])].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  
  // Basic Gantt calculations
  const projectStart = new Date(project.start_date);
  const projectEnd = new Date(project.target_date);
  const totalDuration = projectEnd.getTime() - projectStart.getTime();

  return (
    <div>
      <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors">
        <ArrowRight className="w-4 h-4" />
        חזרה לדשבורד
      </Link>

      <header className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.name || client?.name || project.client_name || 'פרויקט ללא שם'}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> התחלה: {new Date(project.start_date).toLocaleDateString('he-IL')}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> יעד: {new Date(project.target_date).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.purchased_modules?.map((m, i) => (
              <span key={i} className="bg-cyan-50 text-cyan-700 border border-cyan-100 px-3 py-1 rounded-lg text-sm font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="px-2 md:px-8 pb-4 overflow-x-auto">
          <ProgressStepper phases={sortedPhases} />
        </div>
      </header>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
            תצוגת גאנט (Gantt) ושלבים
          </h2>
          <button
            onClick={() => { setIsEditingPhase('new'); setPhaseFormData({ status: 'not_started' }); }}
            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-2 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            שלב חדש
          </button>
        </div>
        
        <div className="relative mt-8 overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Timeline header */}
            <div className="flex justify-between text-xs text-slate-400 mb-4 px-2 border-b border-slate-100 pb-2">
              <span>{new Date(project.start_date).toLocaleDateString('he-IL')}</span>
              <span>{new Date(project.target_date).toLocaleDateString('he-IL')}</span>
            </div>

            <div className="space-y-4">
              {isEditingPhase === 'new' && (
                <div className="bg-slate-50 border border-emerald-200 rounded-xl p-4 mb-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" placeholder="שם השלב" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.name || ''} onChange={e => setPhaseFormData({...phaseFormData, name: e.target.value})} />
                    <input type="date" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.start_date || ''} onChange={e => setPhaseFormData({...phaseFormData, start_date: e.target.value})} />
                    <input type="date" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.expected_end_date || ''} onChange={e => setPhaseFormData({...phaseFormData, expected_end_date: e.target.value})} />
                    <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.status || 'not_started'} onChange={e => setPhaseFormData({...phaseFormData, status: e.target.value})}>
                      <option value="not_started">טרם התחיל</option>
                      <option value="in_progress">בתהליך</option>
                      <option value="completed">הושלם</option>
                      <option value="late">מאחר</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={handleSavePhase} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                    <button onClick={() => setIsEditingPhase(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
                  </div>
                </div>
              )}
            
            {sortedPhases.map(phase => {
              const phaseStart = new Date(phase.start_date);
              const phaseEnd = new Date(phase.expected_end_date);
              
              const leftPercent = Math.max(0, ((phaseStart.getTime() - projectStart.getTime()) / totalDuration) * 100);
              const widthPercent = Math.min(100 - leftPercent, ((phaseEnd.getTime() - phaseStart.getTime()) / totalDuration) * 100);

              const statusColors = {
                completed: 'bg-emerald-500',
                in_progress: 'bg-cyan-400',
                late: 'bg-red-500',
                not_started: 'bg-slate-300'
              };

              const phaseTasks = tasks?.filter(t => t.phase_id === phase.id) || [];
              const completedTasks = phaseTasks.filter(t => t.is_completed).length;

              if (isEditingPhase === phase.id) {
                return (
                  <div key={phase.id} className="bg-slate-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <input type="text" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.name || ''} onChange={e => setPhaseFormData({...phaseFormData, name: e.target.value})} />
                      <input type="date" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.start_date || ''} onChange={e => setPhaseFormData({...phaseFormData, start_date: e.target.value})} />
                      <input type="date" className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.expected_end_date || ''} onChange={e => setPhaseFormData({...phaseFormData, expected_end_date: e.target.value})} />
                      <select className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={phaseFormData.status || 'not_started'} onChange={e => setPhaseFormData({...phaseFormData, status: e.target.value})}>
                        <option value="not_started">טרם התחיל</option>
                        <option value="in_progress">בתהליך</option>
                        <option value="completed">הושלם</option>
                        <option value="late">מאחר</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={handleSavePhase} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"><Save className="w-4 h-4" /> שמור</button>
                      <button onClick={() => setIsEditingPhase(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"><X className="w-4 h-4" /> בטל</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={phase.id} className="relative h-12 flex items-center group">
                  <div className="w-48 text-sm font-medium text-slate-700 truncate pr-4 flex items-center gap-2">
                    {phase.status === 'late' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {phase.name}
                    <div className="flex gap-1 mr-auto opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setIsEditingPhase(phase.id); setPhaseFormData(phase); }} className="text-slate-400 hover:text-emerald-500 p-1"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => deletePhaseMutation.mutate(phase.id)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="flex-1 relative h-full bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                    <div 
                      className={`absolute top-2 bottom-2 rounded-md ${statusColors[phase.status]} opacity-90 transition-all duration-500 hover:opacity-100 flex items-center px-3 text-xs font-bold text-white shadow-sm`}
                      style={{ right: `${leftPercent}%`, width: `${widthPercent}%` }}
                    >
                      <span className="truncate">{completedTasks}/{phaseTasks.length} משימות</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}