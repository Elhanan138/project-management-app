import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, Pencil, Check, X } from 'lucide-react';

export default function HoursMeter({ totalUsed, totalPurchased, projectId }) {
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
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-slate-700">מד שעות הטמעה</span>
        </div>
        {!isEditing ? (
          <button onClick={() => { setIsEditing(true); setHours(totalPurchased); }} className="text-slate-400 hover:text-emerald-500 p-1 rounded-lg hover:bg-white transition-colors" title="הגדר שעות שנרכשו">
            <Pencil className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">שעות שנרכשו:</label>
            <input
              type="number"
              step="0.5"
              min="0"
              className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-emerald-400"
              value={hours}
              onChange={e => setHours(parseFloat(e.target.value) || 0)}
              autoFocus
            />
            <button onClick={() => updateMutation.mutate(hours)} className="text-emerald-500 hover:text-emerald-600 p-1"><Check className="w-4 h-4" /></button>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 p-1"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className={`text-sm font-bold whitespace-nowrap ${isOver ? 'text-red-600' : 'text-slate-700'}`}>
          {totalUsed} / {totalPurchased > 0 ? totalPurchased : '—'} שעות
        </span>
      </div>
      {isOver && (
        <p className="text-xs text-red-500 mt-1">חריגה של {(totalUsed - totalPurchased).toFixed(1)} שעות</p>
      )}
    </div>
  );
}