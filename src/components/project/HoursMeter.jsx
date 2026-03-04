import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, Pencil, Check, X, FileText } from 'lucide-react';

export default function HoursMeter({ totalUsed, totalPurchased, projectId }) {
  const [showReport, setShowReport] = useState(false);

  const { data: phases } = useQuery({
    queryKey: ['phases-report', projectId],
    queryFn: () => base44.entities.Phase.filter({ project_id: projectId }),
    enabled: showReport
  });
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [hours, setHours] = useState(totalPurchased);

  const updateMutation = useMutation({
    mutationFn: (val) => base44.entities.Project.update(projectId, { total_hours_purchased: val }),
    onSuccess: () => {
      queryClient.invalidateQueries(['project', projectId]);
      queryClient.invalidateQueries(['projects']);
      setIsEditing(false);
    }
  });

  const percentage = totalPurchased > 0 ? Math.min((totalUsed / totalPurchased) * 100, 100) : 0;
  const isOver = totalPurchased > 0 && totalUsed > totalPurchased;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 h-full flex flex-col justify-center">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span className="text-base font-bold text-slate-800">שעות הטמעה</span>
        </div>
        {!isEditing ? (
          <button onClick={() => { setIsEditing(true); setHours(totalPurchased); }} className="text-slate-400 hover:text-emerald-500 p-1 rounded-lg hover:bg-white transition-colors" title="הגדר שעות שנרכשו">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-1">
            <input
              type="number"
              step="0.5"
              min="0"
              className="w-16 text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-emerald-400"
              value={hours}
              onChange={e => setHours(parseFloat(e.target.value) || 0)}
              autoFocus
            />
            <button onClick={() => updateMutation.mutate(hours)} className="text-emerald-500 hover:text-emerald-600 p-1"><Check className="w-4 h-4" /></button>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="flex justify-center my-3">
        <div className="relative w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={isOver ? '#ef4444' : '#10b981'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold leading-tight ${isOver ? 'text-red-600' : 'text-slate-800'}`}>{totalUsed}</span>
            <span className="text-sm text-slate-400">/ {totalPurchased > 0 ? totalPurchased : '—'}</span>
          </div>
        </div>
      </div>
      {isOver && (
        <p className="text-xs text-red-500 mt-2 text-center">חריגה של {(totalUsed - totalPurchased).toFixed(1)} שעות</p>
      )}

      <button
        onClick={() => setShowReport(true)}
        className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-emerald-600 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl py-2 transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        דוח פגישות
      </button>

      {showReport && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReport(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                דוח פגישות
              </h3>
              <button onClick={() => setShowReport(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!phases ? (
              <p className="text-sm text-slate-400 text-center py-4">טוען...</p>
            ) : (
              <>
                {phases.filter(p => p.meeting_date && p.duration_hours > 0).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">אין פגישות רשומות</p>
                ) : (
                  <div className="space-y-0 divide-y divide-slate-100">
                    {phases
                      .filter(p => p.meeting_date && p.duration_hours > 0)
                      .sort((a, b) => new Date(a.meeting_date) - new Date(b.meeting_date))
                      .map(phase => (
                        <div key={phase.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-800">{phase.name}</p>
                            <p className="text-xs text-slate-400">{new Date(phase.meeting_date).toLocaleDateString('he-IL')}</p>
                          </div>
                          <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                            {phase.duration_hours} שעות
                          </span>
                        </div>
                      ))}
                  </div>
                )}
                <div className="border-t border-slate-200 mt-3 pt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">סה״כ</span>
                  <span className="text-sm font-bold text-slate-800">{totalUsed} שעות</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}