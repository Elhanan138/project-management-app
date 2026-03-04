import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Edit2, Trash2, X, Save, Briefcase, ChevronDown } from 'lucide-react';

// Default modules list
const DEFAULT_MODULES = [
  'ניהול משתמשים',
  'קורסים מקוונים',
  'מבחנים והסמכות',
  'דוחות ואנליטיקה',
  'ניהול אירועי הדרכה',
  'משחוק',
  'אוטומציות',
  'התממשקות HR'
];

const ModulesEditor = ({ selected = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newModule, setNewModule] = useState('');

  // Merge default modules with any custom ones that might already be selected
  const allOptions = [...new Set([...DEFAULT_MODULES, ...selected])];

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const addCustomModule = () => {
    const trimmed = newModule.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    onChange([...selected, trimmed]);
    setNewModule('');
  };

  const removeModule = (option) => {
    onChange(selected.filter(item => item !== option));
  };

  return (
    <div className="relative">
      <div
        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 cursor-pointer flex justify-between items-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[40px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate text-sm">
          {selected.length > 0 ? selected.join(', ') : 'בחר מודולים...'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-72 overflow-y-auto py-1">
            {allOptions.map(option => (
              <div key={option} className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 transition-colors group/item">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-emerald-500 rounded border-slate-300"
                    checked={selected.includes(option)}
                    onChange={() => toggleOption(option)}
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
                {!DEFAULT_MODULES.includes(option) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeModule(option); }}
                    className="text-slate-300 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity p-0.5"
                    title="מחק מודול"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <div className="border-t border-slate-100 mt-1 pt-1 px-3 pb-2">
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="הוסף מודול חדש..."
                  className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-emerald-400"
                  value={newModule}
                  onChange={e => setNewModule(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomModule(); } }}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); addCustomModule(); }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Format target_date (YYYY-MM) for display as "חודש שנה"
const formatMonthYear = (value) => {
  if (!value) return '-';
  // Handle both YYYY-MM and YYYY-MM-DD formats
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

  const FormFields = ({ isNew }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-medium text-slate-700 border-b pb-2">פרטי לקוח</h3>
        <input type="text" placeholder="שם הלקוח" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.client_name || ''} onChange={e => setFormData({ ...formData, client_name: e.target.value })} />
        <input type="text" placeholder="איש קשר" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.contact_person || ''} onChange={e => setFormData({ ...formData, contact_person: e.target.value })} />
        <input type="email" placeholder="דוא״ל" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        <input type="text" placeholder="טלפון" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
      </div>
      <div className="space-y-4">
        <h3 className="font-medium text-slate-700 border-b pb-2">פרטי פרויקט</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">תאריך Kickoff</label>
            <input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.start_date || ''} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">צפי עלייה לאוויר</label>
            <input type="month" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={formData.target_date || ''} onChange={e => setFormData({ ...formData, target_date: e.target.value })} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="block text-xs text-slate-500">מודולים נרכשים</label>
          <ModulesEditor
            selected={Array.isArray(formData.purchased_modules) ? formData.purchased_modules : []}
            onChange={val => setFormData({ ...formData, purchased_modules: val })}
          />
        </div>
      </div>
    </div>
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isEditing === 'new' && (
          <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-md lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-800 mb-4">יצירת לקוח ופרויקט חדש</h2>
            <FormFields isNew />
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
          <div key={client.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-md transition-all duration-300 shadow-sm group">
            {isEditing === client.id ? (
              <div className="space-y-6">
                <FormFields />
                <div className="flex gap-2 pt-4 border-t">
                  <button onClick={handleSave} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> שמור
                  </button>
                  <button onClick={() => setIsEditing(null)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl flex items-center gap-2 transition-colors">
                    <X className="w-4 h-4" /> בטל
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{client.name}</h3>
                  </div>
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
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
                      className="text-slate-400 hover:text-emerald-500 p-1 bg-slate-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteClientMutation.mutate(client.id)} className="text-slate-400 hover:text-red-500 p-1 bg-slate-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">איש קשר</p>
                    <p>{client.contact_person || '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-1">טלפון</p>
                    <p>{client.phone || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-slate-400 text-xs mb-1">דוא״ל</p>
                    <p>{client.email || '-'}</p>
                  </div>
                  {project && (
                    <>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">תאריך Kickoff</p>
                        <p>{project.start_date ? new Date(project.start_date).toLocaleDateString('he-IL') : '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-1">צפי עלייה לאוויר</p>
                        <p>{formatMonthYear(project.target_date)}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}