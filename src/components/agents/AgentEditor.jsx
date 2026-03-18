import React, { useState } from 'react';
import { ArrowRight, Save, Loader2, Upload, X, FileText, Sparkles, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import KnowledgeManager from './KnowledgeManager';

const COLOR_OPTIONS = [
  { value: 'emerald', label: 'ירוק', class: 'bg-emerald-500' },
  { value: 'blue', label: 'כחול', class: 'bg-blue-500' },
  { value: 'purple', label: 'סגול', class: 'bg-purple-500' },
  { value: 'amber', label: 'כתום', class: 'bg-amber-500' },
  { value: 'red', label: 'אדום', class: 'bg-red-500' },
  { value: 'pink', label: 'ורוד', class: 'bg-pink-500' },
  { value: 'cyan', label: 'תכלת', class: 'bg-cyan-500' },
];

const EMOJI_OPTIONS = ['🤖', '💡', '📚', '🎯', '⚡', '🔮', '🧠', '💬', '🛠️', '📋', '🎓', '🔍'];

export default function AgentEditor({ agent, onSave, onCancel, isSaving }) {
  const [formData, setFormData] = useState({
    name: agent?.name || '',
    description: agent?.description || '',
    system_prompt: agent?.system_prompt || '',
    icon: agent?.icon || '🤖',
    color: agent?.color || 'emerald',
    knowledge_files: agent?.knowledge_files || []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFileName: '' });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length, currentFileName: files[0].name });
    
    const uploadedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i, total: files.length, currentFileName: file.name });
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedFiles.push({
          name: file.name,
          url: file_url,
          uploaded_at: new Date().toISOString()
        });
        
        // Update immediately after each file
        setFormData(prev => ({
          ...prev,
          knowledge_files: [...prev.knowledge_files, {
            name: file.name,
            url: file_url,
            uploaded_at: new Date().toISOString()
          }]
        }));
        
        setUploadProgress({ current: i + 1, total: files.length, currentFileName: file.name });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0, currentFileName: '' });
    e.target.value = ''; // Reset input
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      knowledge_files: prev.knowledge_files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.system_prompt.trim()) return;
    onSave(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {agent ? 'עריכת סוכן' : 'סוכן חדש'}
          </h1>
          <p className="text-slate-500 text-sm">הגדר את ההנחיות ובסיס הידע של הסוכן</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-800 mb-4">פרטי הסוכן</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">שם הסוכן</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="לדוגמה: מסייע למענה בטיקטים"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">תיאור קצר</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="מה הסוכן עושה?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">אייקון</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          formData.icon === emoji
                            ? 'bg-emerald-100 ring-2 ring-emerald-500'
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">צבע</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-10 h-10 rounded-lg ${color.class} transition-all ${
                          formData.color === color.value
                            ? 'ring-2 ring-offset-2 ring-slate-400'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-800 mb-4">הנחיות מערכת (System Prompt)</h2>
            <textarea
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              placeholder="הזן את ההנחיות המפורטות לסוכן... כלול הקשר, זהות, קהל יעד, סגנון תשובה, ועיצוב."
              className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
              dir="rtl"
            />
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            {agent?.id ? (
              <KnowledgeManager agentId={agent.id} />
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">שמור את הסוכן קודם כדי להעלות קבצי ידע</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.name.trim() || !formData.system_prompt.trim()}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                שמור סוכן
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}