import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit2, Trash2, X, Save, Users } from 'lucide-react';

export default function Clients() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      setIsEditing(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      setIsEditing(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['clients'])
  });

  const handleSave = () => {
    if (isEditing === 'new') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate({ id: isEditing, data: formData });
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-500" />
            ניהול לקוחות
          </h1>
          <p className="text-slate-500">הקמה וניהול של לקוחות המערכת</p>
        </div>
        <button
          onClick={() => { setIsEditing('new'); setFormData({}); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          לקוח חדש
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isEditing === 'new' && (
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-md">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="שם הלקוח"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="איש קשר"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={formData.contact_person || ''}
                onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
              />
              <input
                type="email"
                placeholder="דוא״ל"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="טלפון"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> שמור
                </button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors">
                  <X className="w-4 h-4" /> בטל
                </button>
              </div>
            </div>
          </div>
        )}

        {clients?.map(client => (
          <div key={client.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 hover:shadow-md transition-all shadow-sm group">
            {isEditing === client.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  value={formData.contact_person || ''}
                  onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl flex justify-center items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> שמור
                  </button>
                  <button onClick={() => setIsEditing(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl flex justify-center items-center gap-2 transition-colors">
                    <X className="w-4 h-4" /> בטל
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-800">{client.name}</h3>
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setIsEditing(client.id); setFormData(client); }} className="text-slate-400 hover:text-emerald-500 p-1">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(client.id)} className="text-slate-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-slate-500">
                  <p><span className="text-slate-400">איש קשר:</span> {client.contact_person || '-'}</p>
                  <p><span className="text-slate-400">דוא״ל:</span> {client.email || '-'}</p>
                  <p><span className="text-slate-400">טלפון:</span> {client.phone || '-'}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}