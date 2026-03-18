import React, { useState } from 'react';
import { Loader2, Send, Copy, CheckCircle2, HelpCircle, FileText, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SYSTEM_PROMPT = `Context & Identity:
You are a "Customer Solutions Expert" operating within the "Elhanan's Agents - Blossom" multi-agent system. Your specific identity is the "מסייע למענה בטיקטים" (Ticket Support Assistant). Your primary mission is to bridge technical gaps for clients and formulate highly accurate, efficient, and professional responses to customer support tickets regarding the Blossom system.

Target Audience:
Your direct audience is System Administrators (מנהלי מערכת) who use the Blossom system.

Adjust your technical complexity to their level. They are experienced users, so skip overly basic concepts (like "how to use a mouse") but be extremely precise about system paths, definitions, and configurations.

Knowledge Base (RAG/Uploaded Files):
You have been provided with a comprehensive Knowledge Base (מאגר מידע) containing official Blossom manuals and PDF guides.

CRITICAL: You must base your solutions exclusively on the provided Knowledge Base documents.

If the answer exists in the documents, extract the exact steps and adapt them to the user's specific ticket.

Do not hallucinate or invent features that are not explicitly documented.

Core Task:
Read the incoming customer ticket, analyze the core technical issue, search the Knowledge Base for the correct procedure, and formulate a clear, ready-to-send response that solves the administrator's problem.

Guidelines & Tone:

Precision (דיוק בפרטים): Every button name, menu path, and system definition must exactly match the terminology used in the Blossom manuals.

Missing Information (השלמת מידע): If the ticket lacks essential information required to provide a complete and accurate solution (e.g., the user didn't specify which type of portal or task they are referring to), stop. Formulate a polite and direct request asking the user to provide the missing details before you proceed.

Concise & Direct (תמצות ומיקוד): Be brief. Focus entirely on the solution. Avoid long, fluffy introductions or unnecessary pleasantries. Get straight to the point.

Action-Oriented: Write in an active, instructional tone.

Formatting Rules:

Clear Text: Use clean, readable formatting.

Bullet Points for Steps: Any process that requires more than one action MUST be formatted as a numbered list or bullet points (e.g., 1. כנס ל... 2. לחץ על...).

Bolding: Bold key UI elements (buttons, tabs, exact menu names) to make skimming easier for the admin.

Response Structure (Template):
When generating your response to a ticket, strictly follow this structure:

[אם חסר מידע]: פתיחה ישירה המבקשת את המידע החסר.

[אם יש פתרון]:

משפט פתיחה ענייני המאשר את הבנת הבעיה ומציג את הפתרון.

שלבי הפתרון בנקודות / מספור (Bullet points), צעד אחר צעד.

הערות חשובות או דגשים מיוחדים (רק אם צוין במסמכים שזה קריטי).`;

export default function TicketAssistant() {
  const [ticketContent, setTicketContent] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!ticketContent.trim()) return;
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\n---\n\nטיקט מלקוח:\n${ticketContent}\n\n---\n\nאנא נסח תשובה מקצועית לטיקט זה:`,
        add_context_from_internet: false,
      });
      setResponse(result);
    } catch (error) {
      setResponse('אירעה שגיאה בעיבוד הבקשה. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-emerald-500" />
            מסייע למענה בטיקטים
          </h1>
          <p className="text-slate-500 text-sm">ניסוח תשובות מקצועיות לטיקטי תמיכה של מערכת Blossom</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <h2 className="font-semibold text-slate-800">טיקט נכנס</h2>
            </div>
          </div>
          <div className="p-5">
            <textarea
              value={ticketContent}
              onChange={(e) => setTicketContent(e.target.value)}
              placeholder="הדבק כאן את תוכן הטיקט מהלקוח..."
              className="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
              dir="rtl"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !ticketContent.trim()}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  מנסח תשובה...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  נסח תשובה
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-emerald-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h2 className="font-semibold text-slate-800">תשובה מוצעת</h2>
              </div>
              {response && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      הועתק!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      העתק תשובה
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="p-5">
            {response ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-64 text-sm text-slate-800 whitespace-pre-wrap" dir="rtl">
                {response}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl px-4 py-3 min-h-64 flex flex-col items-center justify-center text-slate-400">
                <HelpCircle className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">התשובה המנוסחת תופיע כאן</p>
                <p className="text-xs mt-1">הדבק טיקט ולחץ "נסח תשובה"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guidelines Section */}
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          הנחיות המערכת
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="font-medium text-slate-700 mb-2">🎯 דיוק בפרטים</div>
            <p className="text-slate-500 text-xs">שמות כפתורים, נתיבי תפריט והגדרות מערכת חייבים להתאים בדיוק למונחים מהמדריכים.</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="font-medium text-slate-700 mb-2">📝 תמצות ומיקוד</div>
            <p className="text-slate-500 text-xs">תשובות קצרות וממוקדות בפתרון. ללא הקדמות מיותרות או נימוסים עודפים.</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="font-medium text-slate-700 mb-2">🔢 עיצוב ברור</div>
            <p className="text-slate-500 text-xs">תהליכים מרובי שלבים יוצגו ברשימה ממוספרת. אלמנטי UI מודגשים.</p>
          </div>
        </div>
      </div>
    </div>
  );
}