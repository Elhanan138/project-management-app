import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { FileText, Trash2, Loader2, Database } from 'lucide-react';
import KnowledgeUploader from './KnowledgeUploader';

export default function KnowledgeManager({ agentId }) {
  const queryClient = useQueryClient();

  const { data: chunks, isLoading } = useQuery({
    queryKey: ['knowledge-chunks', agentId],
    queryFn: () => base44.entities.KnowledgeChunk.filter({ agent_id: agentId }),
    enabled: !!agentId
  });

  const deleteMutation = useMutation({
    mutationFn: (chunkId) => base44.entities.KnowledgeChunk.delete(chunkId),
    onSuccess: () => queryClient.invalidateQueries(['knowledge-chunks', agentId])
  });

  const deleteAllForFile = async (fileName) => {
    const fileChunks = chunks?.filter(c => c.file_name === fileName) || [];
    for (const chunk of fileChunks) {
      await base44.entities.KnowledgeChunk.delete(chunk.id);
    }
    queryClient.invalidateQueries(['knowledge-chunks', agentId]);
  };

  // Group chunks by file name
  const fileGroups = chunks?.reduce((acc, chunk) => {
    if (!acc[chunk.file_name]) {
      acc[chunk.file_name] = { chunks: [], totalChars: 0 };
    }
    acc[chunk.file_name].chunks.push(chunk);
    acc[chunk.file_name].totalChars += chunk.content?.length || 0;
    return acc;
  }, {}) || {};

  const fileNames = Object.keys(fileGroups);
  const totalChars = chunks?.reduce((sum, c) => sum + (c.content?.length || 0), 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          בסיס ידע
        </h3>
        {chunks?.length > 0 && (
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {fileNames.length} קבצים • {(totalChars / 1000).toFixed(0)}K תווים
          </span>
        )}
      </div>

      <KnowledgeUploader 
        agentId={agentId} 
        onComplete={() => queryClient.invalidateQueries(['knowledge-chunks', agentId])}
      />

      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
        </div>
      )}

      {fileNames.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">קבצים שעובדו ({fileNames.length})</p>
          {fileNames.map((fileName) => {
            const fileData = fileGroups[fileName];
            return (
              <div
                key={fileName}
                className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-slate-700 truncate">{fileName}</span>
                  <span className="text-xs text-slate-400">
                    ({fileData.chunks.length} חלקים, {(fileData.totalChars / 1000).toFixed(1)}K)
                  </span>
                </div>
                <button
                  onClick={() => deleteAllForFile(fileName)}
                  className="text-slate-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                  title="מחק קובץ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && fileNames.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">
          אין קבצי ידע. העלה קבצים כדי שהסוכן יוכל להשתמש בהם.
        </p>
      )}
    </div>
  );
}