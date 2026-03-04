import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit2, Trash2, X, Save, Briefcase, ImagePlus } from 'lucide-react';
import ClientForm from '../components/clients/ClientForm';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const formatMonthYear = (value) => {
  if (!value) return '-';
  const parts = value.split('-');
  if (parts.length >= 2) {
    const date = new Date(parts[0], parseInt(parts[1]) - 1);
    return date.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
  }
  return value;
};

export default function Clients() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({});

  const { data: clients, isLoading: cLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.list()
  });

  const { data: projects, isLoading: pLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const createClientMutation = useMutation({ mutationFn: (data) => base44.entities.Client.create(data) });
  const updateClientMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Client.update(id, data) });
  const deleteClientMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
      queryClient.invalidateQueries(['projects']);
    }
  });
  const createProjectMutation = useMutation({ mutationFn: (data) => base44.entities.Project.create(data) });
  const updateProjectMutation = useMutation({ mutationFn: ({ id, data }) => base44.entities.Project.update(id, data) });

  const handleSave = async () => {
    const clientData = {
      name: formData.client_name,
      contact_person: formData.contact_person,
      email: formData.email,
      phone: formData.phone
    };

    let clientId = formData.client_id;

    if (isEditing === 'new') {
      const newClient = await createClientMutation.mutateAsync(clientData);
      clientId = newClient.id;
      await createProjectMutation.mutateAsync({
        client_id: clientId,
        name: formData.client_name,
        start_date: formData.start_date,
        target_date: formData.target_date,
        purchased_modules: formData.purchased_modules || []
      });
    } else {
      await updateClientMutation.mutateAsync({ id: clientId, data: clientData });
      if (formData.project_id) {
        await updateProjectMutation.mutateAsync({
          id: formData.project_id,
          data: {
            name: formData.client_name,
            start_date: formData.start_date,
            target_date: formData.target_date,
            purchased_modules: formData.purchased_modules || []
          }
        });
      }
    }

    queryClient.invalidateQueries(['clients']);
    queryClient.invalidateQueries(['projects']);
    setIsEditing(null);
  };

  if (cLoading || pLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

  const combinedData = clients?.map(client => {
    const project = projects?.find(p => p.client_id === client.id);
    return { client, project };
  }) || [];

  const orphanedProjects = projects?.filter(p => p.client_id && !clients?.find(c => c.id === p.client_id)) || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-emerald-500" />
            ניהול פרויקטים ולקוחות
          </h1>
          <p className="text-slate-500 text-sm">הקמה וניהול של לקוחות ופרויקטים במקום אחד</p>
        </div>
        <button
          onClick={() => { setIsEditing('new'); setFormData({}); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm w-full md:w-auto justify-center text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          לקוח ופרויקט חדש
        </button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isEditing === 'new' && (
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-md lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-800 mb-4">יצירת לקוח ופרויקט חדש</h2>
            <ClientForm formData={formData} setFormData={setFormData} />
            <div className="flex gap-2 pt-6 mt-4 border-t">
              <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors">
                <Save className="w-4 h-4" /> שמור הכל
              </button>
              <button onClick={() => setIsEditing(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl flex items-center gap-2 transition-colors">
                <X className="w-4 h-4" /> בטל
              </button>
            </div>
          </div>
        )}

        {orphanedProjects.map(project => (
          <div key={`orphan-${project.id}`} className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-amber-500 text-xs font-semibold bg-amber-100 px-2 py-1 rounded-full">⚠️ לקוח חסר</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{project.name || project.client_name || 'פרויקט ללא שם'}</h3>
            <p className="text-slate-500 text-sm mt-1">פרויקט זה מקושר ל-ID לקוח שאינו קיים במערכת</p>
          </div>
        ))}

        {combinedData.map(({ client, project }) => (
          <div key={client.id} className="relative border border-slate-200/60 rounded-lg shadow-[0_1px_8px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_-6px_rgba(16,185,129,0.12)] hover:border-emerald-200/60 transition-all duration-300 group overflow-hidden bg-white">
            {(
              <Link to={project ? createPageUrl(`ProjectDetails?id=${project.id}`) : '#'} className="block aspect-square flex flex-col relative">
                {/* תמונה בחצי העליון */}
                <div className="h-1/2 bg-slate-100 relative overflow-hidden">
                  {client.image ? (
                    <img src={client.image} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer text-slate-300 hover:text-emerald-400 transition-colors"
                      >
                        <ImagePlus className="w-8 h-8" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const { file_url } = await base44.integrations.Core.UploadFile({ file });
                            await base44.entities.Client.update(client.id, { image: file_url });
                            queryClient.invalidateQueries(['clients']);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
                {/* שם בחצי התחתון */}
                <div className="h-1/2 flex items-center justify-center text-center px-3">
                  <span className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {client.name}
                  </span>
                </div>
                <div className="absolute top-2 left-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(client.id);
                      setFormData({
                        client_id: client.id,
                        client_name: client.name,
                        contact_person: client.contact_person,
                        email: client.email,
                        phone: client.phone,
                        project_id: project?.id,
                        start_date: project?.start_date,
                        target_date: project?.target_date,
                        purchased_modules: project?.purchased_modules || []
                      });
                    }}
                    className="text-slate-400 hover:text-emerald-500 p-1.5 bg-white/70 hover:bg-white rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteClientMutation.mutate(client.id);
                    }}
                    className="text-slate-400 hover:text-red-500 p-1.5 bg-white/70 hover:bg-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}