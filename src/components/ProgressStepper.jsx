import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressStepper({ phases }) {
  // Sort phases by start date
  const sortedPhases = [...phases].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative min-w-[500px]">
        {/* Connecting Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-10" />
        
        {sortedPhases.map((phase, index) => {
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';
          const isLate = phase.status === 'late';
          
          let bgColor = 'bg-white border-slate-300 text-slate-500';
          let textColor = 'text-slate-400';
          
          if (isCompleted) {
            bgColor = 'bg-emerald-500 border-emerald-500 text-white';
            textColor = 'text-emerald-600 font-medium';
          } else if (isInProgress) {
            bgColor = 'bg-cyan-400 border-cyan-400 text-white shadow-md shadow-cyan-400/30';
            textColor = 'text-cyan-600 font-bold';
          } else if (isLate) {
            bgColor = 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/30';
            textColor = 'text-red-600 font-bold';
          }

          return (
            <div key={phase.id} className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${bgColor}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs">{index + 1}</span>}
              </div>
              <div className={`absolute top-10 whitespace-nowrap text-sm ${textColor}`}>
                {phase.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}