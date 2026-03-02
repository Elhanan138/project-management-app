import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function TaskItem({ task, project, phase, client }) {
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

  return (
    <div className={`bg-zinc-900 border rounded-lg p-4 transition-all ${hasAlert ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-zinc-800 hover:border-zinc-700'}`}>
      <div className="flex items-start gap-3">
        <button 
          onClick={() => toggleTaskMutation.mutate(!task.is_completed)}
          className={`mt-1 flex-shrink-0 transition-colors ${task.is_completed ? 'text-green-500' : 'text-zinc-500 hover:text-purple-400'}`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium mb-1 ${task.is_completed ? 'text-zinc-500 line-through' : 'text-slate-200'}`}>
            {task.name}
          </h4>
          
          <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
            <span className="text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
              {project?.name || client?.name || project?.client_name || 'פרויקט'}
            </span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">
              {phase?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md border ${priorityColors[task.priority]}`}>
              <Flag className="w-3 h-3" />
              {priorityLabels[task.priority]}
            </div>
            
            <div className={`flex items-center gap-1 text-xs ${hasAlert ? 'text-red-400 font-medium' : 'text-zinc-500'}`}>
              <Clock className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString('he-IL')}
            </div>

            {isLatePhase && (
              <div className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-md ml-auto">
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