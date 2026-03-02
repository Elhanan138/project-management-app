import React from 'react';
import { Check } from 'lucide-react';

export default function ProgressStepper({ phases }) {
  // Sort phases by start date
  const sortedPhases = [...phases].sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-zinc-800 -z-10" />
        
        {sortedPhases.map((phase, index) => {
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';
          const isLate = phase.status === 'late';
          
          let bgColor = 'bg-zinc-900 border-zinc-700';
          let textColor = 'text-zinc-500';
          
          if (isCompleted) {
            bgColor = 'bg-green-500 border-green-500 text-white';
            textColor = 'text-green-500';
          } else if (isInProgress) {
            bgColor = 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]';
            textColor = 'text-purple-400 font-bold';
          } else if (isLate) {
            bgColor = 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]';
            textColor = 'text-red-400 font-bold';
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