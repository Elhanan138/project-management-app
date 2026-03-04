import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function TaskItem({ task, project, phase, client, onEdit }) {
  const queryClient = useQueryClient();
  
  const toggleTaskMutation = useMutation({
    mutationFn: (isCompleted) => base44.entities.Task.update(task.id, { is_completed: isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    }
  });

  const isLatePhase = phase?.status === 'late';
  const isOverdue = new Date(task.due_date) < new Date() && !task.is_completed;
  const hasAlert = isLatePhase || isOverdue;

  const priorityColors = {
    high: 'text-red-400 bg-red-400/10 border-red-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    low: 'text-blue-400 bg-blue-400/10 border-blue-400/20'
  };

  const priorityLabels = {
    high: 'גבוהה',
    medium: 'בינונית',
    low: 'נמוכה'
  };

  const lightPriorityColors = {
    high: 'text-red-600 bg-red-50 border-red-100',
    medium: 'text-amber-600 bg-amber-50 border-amber-100',
    low: 'text-cyan-600 bg-cyan-50 border-cyan-100'
  };

  return (
    <div className={`bg-white border rounded-xl p-4 transition-all shadow-sm ${hasAlert ? 'border-red-200 shadow-red-100/50' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}>
      <div className="flex items-start gap-3">
        <button 
          onClick={() => toggleTaskMutation.mutate(!task.is_completed)}
          className={`mt-1 flex-shrink-0 transition-colors ${task.is_completed ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'}`}
        >
          <CheckCircle2 className="w-6 h-6" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 
            className={`font-medium mb-1.5 ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-800'} ${onEdit ? 'cursor-pointer hover:text-emerald-600 transition-colors' : ''}`}
            onClick={() => onEdit && onEdit(task)}
          >
            {task.name}
          </h4>
          
          <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
            <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
              {project?.name || client?.name || project?.client_name || 'פרויקט'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              {phase?.name}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${lightPriorityColors[task.priority]}`}>
              <Flag className="w-3 h-3" />
              {priorityLabels[task.priority]}
            </div>
            
            <div className={`flex items-center gap-1 text-xs ${hasAlert ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
              <Clock className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString('he-IL')}
            </div>

            {isLatePhase && (
              <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md ml-auto border border-red-100">
                <AlertCircle className="w-3 h-3" />
                שלב בעיכוב
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}