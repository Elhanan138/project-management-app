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

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-500" />
            ניהול לקוחות
          </h1>
          <p className="text-zinc-400">הקמה וניהול של לקוחות המערכת</p>
        </div>
        <button
          onClick={() => { setIsEditing('new'); setFormData({}); }}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          לקוח חדש
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isEditing === 'new' && (
          <div className="bg-zinc-900 border border-purple-500/50 rounded-xl p-6 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="שם הלקוח"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="איש קשר"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                value={formData.contact_person || ''}
                onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
              />
              <input
                type="email"
                placeholder="דוא״ל"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="טלפון"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex justify-center items-center gap-2">
                  <Save className="w-4 h-4" /> שמור
                </button>
                <button onClick={() => setIsEditing(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg flex justify-center items-center gap-2">
                  <X className="w-4 h-4" /> בטל
                </button>
              </div>
            </div>
          </div>
        )}

        {clients?.map(client => (
          <div key={client.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors group">
            {isEditing === client.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                  value={formData.contact_person || ''}
                  onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex justify-center items-center gap-2">
                    <Save className="w-4 h-4" /> שמור
                  </button>
                  <button onClick={() => setIsEditing(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg flex justify-center items-center gap-2">
                    <X className="w-4 h-4" /> בטל
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-50">{client.name}</h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setIsEditing(client.id); setFormData(client); }} className="text-zinc-400 hover:text-purple-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(client.id)} className="text-zinc-400 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-zinc-400">
                  <p><span className="text-zinc-500">איש קשר:</span> {client.contact_person || '-'}</p>
                  <p><span className="text-zinc-500">דוא״ל:</span> {client.email || '-'}</p>
                  <p><span className="text-zinc-500">טלפון:</span> {client.phone || '-'}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}