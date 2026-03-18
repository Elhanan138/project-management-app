import React, { useState } from 'react';
import { Upload, Loader2, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const MAX_CHUNK_SIZE = 50000; // ~50K characters per chunk

export default function KnowledgeUploader({ agentId, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, currentFile: '', status: '' });
  const [results, setResults] = useState([]);

  const extractTextFromFile = async (fileUrl, fileName) => {
    try {
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: "object",
          properties: {
            text_content: {
              type: "string",
              description: "The full text content extracted from the document"
            }
          }
        }
      });
      
      if (result.status === 'success' && result.output?.text_content) {
        return result.output.text_content;
      }
      return null;
    } catch (error) {
      console.error(`Error extracting text from ${fileName}:`, error);
      return null;
    }
  };

  const splitIntoChunks = (text, maxSize = MAX_CHUNK_SIZE) => {
    if (text.length <= maxSize) return [text];
    
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      let end = start + maxSize;
      // Try to break at a paragraph or sentence
      if (end < text.length) {
        const paragraphBreak = text.lastIndexOf('\n\n', end);
        const sentenceBreak = text.lastIndexOf('. ', end);
        if (paragraphBreak > start + maxSize * 0.5) {
          end = paragraphBreak + 2;
        } else if (sentenceBreak > start + maxSize * 0.5) {
          end = sentenceBreak + 2;
        }
      }
      chunks.push(text.slice(start, end));
      start = end;
    }
    return chunks;
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    setResults([]);
    const newResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length, currentFile: file.name, status: 'uploading' });

      try {
        // Step 1: Upload file
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        setProgress(p => ({ ...p, status: 'extracting' }));
        
        // Step 2: Extract text
        const textContent = await extractTextFromFile(file_url, file.name);
        
        if (!textContent) {
          newResults.push({ name: file.name, success: false, error: 'לא ניתן לחלץ טקסט' });
          continue;
        }

        setProgress(p => ({ ...p, status: 'saving' }));

        // Step 3: Split into chunks and save
        const chunks = splitIntoChunks(textContent);
        
        for (let j = 0; j < chunks.length; j++) {
          await base44.entities.KnowledgeChunk.create({
            agent_id: agentId,
            file_name: file.name,
            file_url: file_url,
            content: chunks[j],
            chunk_index: j
          });
        }

        newResults.push({ 
          name: file.name, 
          success: true, 
          chunks: chunks.length,
          chars: textContent.length 
        });

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        newResults.push({ name: file.name, success: false, error: error.message });
      }
    }

    setResults(newResults);
    setIsProcessing(false);
    setProgress({ current: 0, total: 0, currentFile: '', status: '' });
    e.target.value = '';
    
    if (onComplete) onComplete();
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'uploading': return 'מעלה...';
      case 'extracting': return 'מחלץ טקסט...';
      case 'saving': return 'שומר...';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <div className={`border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all ${isProcessing ? 'pointer-events-none bg-slate-50' : ''}`}>
          {isProcessing ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  מעבד {progress.current} מתוך {progress.total}
                </p>
                <p className="text-xs text-slate-500 mt-1 truncate max-w-full px-2">
                  {progress.currentFile}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  {getStatusText(progress.status)}
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">לחץ להעלאת קבצי ידע</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOC, TXT, Excel - ללא הגבלת גודל</p>
            </>
          )}
        </div>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.csv,.json,.html"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isProcessing}
        />
      </label>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">תוצאות עיבוד:</p>
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                result.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="truncate flex-1">{result.name}</span>
              {result.success && (
                <span className="text-xs text-emerald-600">
                  {result.chunks} חלקים, {(result.chars / 1000).toFixed(1)}K תווים
                </span>
              )}
              {!result.success && (
                <span className="text-xs">{result.error}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}