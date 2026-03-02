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
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;
  }

  if (!project) return <div>Project not found</div>;

  const sortedPhases = [...(phases || [])].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
  
  // Basic Gantt calculations
  const projectStart = new Date(project.start_date);
  const projectEnd = new Date(project.target_date);
  const totalDuration = projectEnd.getTime() - projectStart.getTime();

  return (
    <div>
      <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-zinc-400 hover:text-purple-400 mb-6 transition-colors">
        <ArrowRight className="w-4 h-4" />
        חזרה לדשבורד
      </Link>

      <header className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 mb-2">{project.name || client?.name || project.client_name || 'פרויקט ללא שם'}</h1>
            <div className="flex gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> התחלה: {new Date(project.start_date).toLocaleDateString('he-IL')}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> יעד: {new Date(project.target_date).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {project.purchased_modules?.map((m, i) => (
              <span key={i} className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-md text-sm">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="px-8 pb-4">
          <ProgressStepper phases={sortedPhases} />
        </div>
      </header>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            תצוגת גאנט (Gantt) ושלבים
          </h2>
          <button
            onClick={() => { setIsEditingPhase('new'); setPhaseFormData({ status: 'not_started' }); }}
            className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            שלב חדש
          </button>
        </div>
        
        <div className="relative mt-8">
          {/* Timeline header */}
          <div className="flex justify-between text-xs text-zinc-500 mb-4 px-2 border-b border-zinc-800 pb-2">
            <span>{new Date(project.start_date).toLocaleDateString('he-IL')}</span>
            <span>{new Date(project.target_date).toLocaleDateString('he-IL')}</span>
          </div>

          <div className="space-y-4">
            {isEditingPhase === 'new' && (
              <div className="bg-zinc-950 border border-purple-500/50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-4 gap-4">
                  <input type="text" placeholder="שם השלב" className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white" value={phaseFormData.name || ''} onChange={e => setPhaseFormData({...phaseFormData, name: e.target.value})} />
                  <input type="date" className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white" value={phaseFormData.start_date || ''} onChange={e => setPhaseFormData({...phaseFormData, start_date: e.target.value})} />
                  <input type="date" className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white" value={phaseFormData.expected_end_date || ''} onChange={e => setPhaseFormData({...phaseFormData, expected_end_date: e.target.value})} />
                  <select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white" value={phaseFormData.status || 'not_started'} onChange={e => setPhaseFormData({...phaseFormData, status: e.target.value})}>
                    <option value="not_started">טרם התחיל</option>
                    <option value="in_progress">בתהליך</option>
                    <option value="completed">הושלם</option>
                    <option value="late">מאחר</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={handleSavePhase} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2"><Save className="w-4 h-4" /> שמור</button>
                  <button onClick={() => setIsEditingPhase(null)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2"><X className="w-4 h-4" /> בטל</button>
                </div>
              </div>
            )}
            
            {sortedPhases.map(phase => {
              const phaseStart = new Date(phase.start_date);
              const phaseEnd = new Date(phase.expected_end_date);
              
              const leftPercent = Math.max(0, ((phaseStart.getTime() - projectStart.getTime()) / totalDuration) * 100);
              const widthPercent = Math.min(100 - leftPercent, ((phaseEnd.getTime() - phaseStart.getTime()) / totalDuration) * 100);

              const statusColors = {
                completed: 'bg-green-500',
                in_progress: 'bg-purple-500',
                late: 'bg-red-500',
                not_started: 'bg-zinc-700'
              };

              const phaseTasks = tasks?.filter(t => t.phase_id === phase.id) || [];
              const completedTasks = phaseTasks.filter(t => t.is_completed).length;

              if (isEditingPhase === phase.id) {
                return (
                  <div key={phase.id} className="bg-zinc-950 border border-purple-500/50 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4">
                      <input type="text" className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white" value={phaseFormData.name || ''} onChange={e => setPhaseFormData({...phaseFormData, name: e.target.value})} />
                      <input type="date" className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white" value={phaseFormData.start_date || ''} onChange={e => setPhaseFormData({...phaseFormData, start_date: e.target.value})} />
                      <input type="date" className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white" value={phaseFormData.expected_end_date || ''} onChange={e => setPhaseFormData({...phaseFormData, expected_end_date: e.target.value})} />
                      <select className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white" value={phaseFormData.status || 'not_started'} onChange={e => setPhaseFormData({...phaseFormData, status: e.target.value})}>
                        <option value="not_started">טרם התחיל</option>
                        <option value="in_progress">בתהליך</option>
                        <option value="completed">הושלם</option>
                        <option value="late">מאחר</option>
                      </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={handleSavePhase} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2"><Save className="w-4 h-4" /> שמור</button>
                      <button onClick={() => setIsEditingPhase(null)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2"><X className="w-4 h-4" /> בטל</button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={phase.id} className="relative h-12 flex items-center group">
                  <div className="w-48 text-sm font-medium text-slate-300 truncate pr-4 flex items-center gap-2">
                    {phase.status === 'late' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {phase.name}
                    <div className="flex gap-1 mr-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setIsEditingPhase(phase.id); setPhaseFormData(phase); }} className="text-zinc-500 hover:text-purple-400 p-1"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={() => deletePhaseMutation.mutate(phase.id)} className="text-zinc-500 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="flex-1 relative h-full bg-zinc-950/50 rounded-lg overflow-hidden border border-zinc-800/50">
                    <div 
                      className={`absolute top-2 bottom-2 rounded-md ${statusColors[phase.status]} opacity-80 transition-all duration-500 group-hover:opacity-100 flex items-center px-3 text-xs font-bold text-white shadow-sm`}
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