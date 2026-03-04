import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';

export default function ProgressStepper({ phases }) {
  const sortedPhases = [...phases].sort((a, b) => {
    const aDate = a.meeting_date || a.start_date || '';
    const bDate = b.meeting_date || b.start_date || '';
    return new Date(aDate) - new Date(bDate);
  });

  const completedCount = sortedPhases.filter(p => p.status === 'completed').length;
  const total = sortedPhases.length;

  return (
    <div className="w-full">
      {/* Summary bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: total > 0 ? `${(completedCount / total) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
          {completedCount}/{total} הושלמו
        </span>
      </div>

      {/* Phase list */}
      <div className="space-y-0">
        {sortedPhases.map((phase, index) => {
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';
          const isLate = phase.status === 'late';
          const isLast = index === sortedPhases.length - 1;

          return (
            <div key={phase.id} className="flex items-stretch gap-3">
              {/* Icon column with connector line */}
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isInProgress
                    ? 'bg-white border-cyan-500 text-cyan-500'
                    : isLate
                    ? 'bg-white border-red-500 text-red-500'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : isLate ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[16px] ${
                    isCompleted ? 'bg-emerald-300' : 'bg-slate-200'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-3 pt-0.5 ${isLast ? '' : ''}`}>
                <p className={`text-sm leading-tight ${
                  isCompleted
                    ? 'text-emerald-700 font-semibold'
                    : isInProgress
                    ? 'text-cyan-700 font-semibold'
                    : isLate
                    ? 'text-red-600 font-semibold'
                    : 'text-slate-500'
                }`}>
                  {phase.name}
                </p>
                {phase.meeting_date && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(phase.meeting_date).toLocaleDateString('he-IL')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {total === 0 && (
        <p className="text-sm text-slate-400 text-center py-2">אין שלבים עדיין</p>
      )}
    </div>
  );
}