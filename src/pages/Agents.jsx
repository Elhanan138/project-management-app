import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Sparkles, Bot, Settings, Trash2, MessageSquare } from 'lucide-react';
import AgentCard from '@/components/agents/AgentCard';
import AgentEditor from '@/components/agents/AgentEditor';
import AgentChat from '@/components/agents/AgentChat';

export default function Agents() {
  const queryClient = useQueryClient();
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: () => base44.entities.Agent.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Agent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      setIsEditing(false);
      setEditingAgent(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Agent.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      setIsEditing(false);
      setEditingAgent(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Agent.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      if (selectedAgent?.id === editingAgent?.id) {
        setSelectedAgent(null);
      }
    }
  });

  const handleSave = (agentData) => {
    if (editingAgent?.id) {
      updateMutation.mutate({ id: editingAgent.id, data: agentData });
    } else {
      createMutation.mutate(agentData);
    }
  };

  const handleNewAgent = () => {
    setEditingAgent(null);
    setIsEditing(true);
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Show editor
  if (isEditing) {
    return (
      <AgentEditor
        agent={editingAgent}
        onSave={handleSave}
        onCancel={() => { setIsEditing(false); setEditingAgent(null); }}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  // Show chat with selected agent
  if (selectedAgent) {
    return (
      <AgentChat
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
        onEdit={() => handleEditAgent(selectedAgent)}
      />
    );
  }

  // Show agents list
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-3">
            <Bot className="w-8 h-8 text-emerald-500" />
            סוכנים
          </h1>
          <p className="text-slate-500 text-sm">צור וניהל סוכני AI מותאמים אישית עם בסיס ידע ייעודי</p>
        </div>
        <button
          onClick={handleNewAgent}
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          סוכן חדש
        </button>
      </header>

      {agents.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">אין סוכנים עדיין</h3>
          <p className="text-slate-500 text-sm mb-6">צור את הסוכן הראשון שלך עם הנחיות מותאמות ובסיס ידע ייחודי</p>
          <button
            onClick={handleNewAgent}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl inline-flex items-center gap-2 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            צור סוכן ראשון
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={() => setSelectedAgent(agent)}
              onEdit={() => handleEditAgent(agent)}
              onDelete={() => deleteMutation.mutate(agent.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}