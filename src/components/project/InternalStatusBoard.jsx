import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Save, X, Edit2, Trash2, CheckCircle2, Circle, Clock, MessageSquare, Zap, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import StatusNoteItem from './StatusNoteItem';
import StatusNoteForm from './StatusNoteForm';

const CATEGORIES = [
  { value: 'action_item', label: 'פריטי עבודה', icon: Zap, color: 'emerald' },
  { value: 'discussion_topic', label: 'נושאים לדיון בסטטוס', icon: MessageSquare, color: 'blue' },
  { value: 'status_update', label: 'עדכוני סטטוס', icon: Clock, color: 'amber' },
  { value: 'summary', label: 'סיכומים והחלטות', icon: FileText, color: 'purple' },
];

export default function InternalStatusBoard({ projectId }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [filterStatus, setFilterStatus] = useState('');

  const { data: notes = [] } = useQuery({
    queryKey: ['statusNotes', projectId],
    queryFn: () => base44.entities.StatusNote.filter({ project_id: projectId }),
    enabled: !!projectId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StatusNote.create({ ...data, project_id: projectId }),
    onSuccess: () => { queryClient.invalidateQueries(['statusNotes', projectId]); setIsEditing(null); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StatusNote.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['statusNotes', projectId]); setIsEditing(null); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StatusNote.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['statusNotes', projectId])
  });

  const handleSave = () => {
    if (isEditing === 'new') createMutation.mutate(formData);
    else updateMutation.mutate({ id: isEditing, data: formData });
  };

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredNotes = filterStatus
    ? notes.filter(n => n.status === filterStatus)
    : notes;

  const openCount = notes.filter(n => n.status === 'open').length;
  const inProgressCount = notes.filter(n => n.status === 'in_progress').length;
  const doneCount = notes.filter(n => n.status === 'done').length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterStatus ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          הכל ({notes.length})
        </button>
        <button onClick={() => setFilterStatus('open')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === 'open' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
          <span className="flex items-center gap-1"><Circle className="w-3 h-3" /> פתוח ({openCount})</span>
        </button>
        <button onClick={() => setFilterStatus('in_progress')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> בתהליך ({inProgressCount})</span>
        </button>
        <button onClick={() => setFilterStatus('done')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === 'done' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> הושלם ({doneCount})</span>
        </button>
        <button
          onClick={() => { setIsEditing('new'); setFormData({ category: 'action_item', status: 'open', priority: 'medium' }); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium shadow-sm mr-auto"
        >
          <Plus className="w-4 h-4" />
          פריט חדש
        </button>
      </div>

      {/* Category sections */}
      {CATEGORIES.map(cat => {
        const catNotes = filteredNotes.filter(n => n.category === cat.value);
        const isCollapsed = collapsedCategories[cat.value];
        const Icon = cat.icon;
        const colorMap = {
          emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          blue: 'bg-blue-50 text-blue-700 border-blue-200',
          amber: 'bg-amber-50 text-amber-700 border-amber-200',
          purple: 'bg-purple-50 text-purple-700 border-purple-200',
        };

        return (
          <div key={cat.value} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleCategory(cat.value)}
              className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-slate-50 ${isCollapsed ? 'bg-white' : 'bg-slate-50/50'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[cat.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-slate-800 text-sm">{cat.label}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{catNotes.length}</span>
              </div>
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
            </button>

            {!isCollapsed && (
              <div className="border-t border-slate-100">
                {catNotes.length === 0 ? (
                  <div className="px-5 py-6 text-center text-sm text-slate-400">
                    אין פריטים בקטגוריה זו
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {catNotes.map(note => (
                      <StatusNoteItem
                        key={note.id}
                        note={note}
                        onEdit={() => { setIsEditing(note.id); setFormData(note); }}
                        onDelete={() => deleteMutation.mutate(note.id)}
                        onStatusChange={(newStatus) => updateMutation.mutate({ id: note.id, data: { status: newStatus } })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Modal */}
      {isEditing && (
        <StatusNoteForm
          formData={formData}
          setFormData={setFormData}
          onSave={handleSave}
          onCancel={() => setIsEditing(null)}
          isNew={isEditing === 'new'}
        />
      )}
    </div>
  );
}