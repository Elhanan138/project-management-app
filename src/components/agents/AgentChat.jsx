import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Send, Loader2, Copy, CheckCircle2, Settings, Sparkles, FileText, Plus, Trash2, User, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const COLOR_STYLES = {
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  pink: 'bg-pink-50 text-pink-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};

export default function AgentChat({ agent, onBack, onEdit }) {
  const [messages, setMessages] = useState([]);
  const [conversationInputs, setConversationInputs] = useState([{ role: 'customer', content: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addConversationInput = () => {
    const lastRole = conversationInputs[conversationInputs.length - 1]?.role;
    const nextRole = lastRole === 'customer' ? 'me' : 'customer';
    setConversationInputs(prev => [...prev, { role: nextRole, content: '' }]);
  };

  const removeConversationInput = (index) => {
    if (conversationInputs.length === 1) return;
    setConversationInputs(prev => prev.filter((_, i) => i !== index));
  };

  const updateConversationInput = (index, content) => {
    setConversationInputs(prev => prev.map((item, i) => 
      i === index ? { ...item, content } : item
    ));
  };

  const toggleRole = (index) => {
    setConversationInputs(prev => prev.map((item, i) => 
      i === index ? { ...item, role: item.role === 'customer' ? 'me' : 'customer' } : item
    ));
  };

  const handleSend = async () => {
    const hasContent = conversationInputs.some(input => input.content.trim());
    if (!hasContent || isLoading) return;

    // Build conversation text
    const conversationText = conversationInputs
      .filter(input => input.content.trim())
      .map(input => `${input.role === 'customer' ? 'לקוח/ה' : 'אני'}: ${input.content.trim()}`)
      .join('\n\n');

    setMessages(prev => [...prev, { role: 'user', content: conversationText, inputs: [...conversationInputs] }]);
    setConversationInputs([{ role: 'customer', content: '' }]);
    setIsLoading(true);

    // Build context from knowledge files
    const knowledgeContext = agent.knowledge_files?.length > 0
      ? `\n\nבסיס ידע זמין (קבצים שהועלו):\n${agent.knowledge_files.map(f => `- ${f.name}: ${f.url}`).join('\n')}`
      : '';

    const prompt = `${agent.system_prompt}${knowledgeContext}\n\n---\n\nשיחה עם לקוח/ה:\n${conversationText}\n\n---\n\nאנא ספק תשובה מקצועית על פי ההנחיות שלך:`;

    try {
      const fileUrls = agent.knowledge_files?.map(f => f.url) || [];
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrls.length > 0 ? fileUrls : undefined,
        add_context_from_internet: false,
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (error) {
      console.error('Agent error:', error);
      let errorMessage = 'אירעה שגיאה בעיבוד הבקשה. אנא נסה שוב.';
      if (error?.message?.includes('10MB') || error?.message?.includes('file size')) {
        errorMessage = 'אחד או יותר מקבצי הידע גדולים מדי (יותר מ-10MB). נסה להסיר קבצים גדולים מהגדרות הסוכן.';
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyPress = (e, isLast) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const colorStyle = COLOR_STYLES[agent.color] || COLOR_STYLES.emerald;
  const knowledgeCount = agent.knowledge_files?.length || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${colorStyle}`}>
            {agent.icon || <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{agent.name}</h1>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileText className="w-3 h-3" />
              <span>{knowledgeCount} קבצי ידע</span>
            </div>
          </div>
        </div>
        <button
          onClick={onEdit}
          className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${colorStyle}`}>
              {agent.icon || <Sparkles className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">מוכן לעזור!</h3>
            <p className="text-slate-500 text-sm max-w-md">{agent.description || 'שלח הודעה כדי להתחיל שיחה'}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.role === 'assistant' && (
                <div className="flex justify-end mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleCopy(message.content, index)}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {copiedIndex === index ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        הועתק
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        העתק
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-end">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 pt-4">
        <div className="space-y-3">
          {conversationInputs.map((input, index) => (
            <div key={index} className="flex gap-2 items-start">
              <button
                onClick={() => toggleRole(index)}
                className={`flex-shrink-0 w-20 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                  input.role === 'customer' 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
                title="לחץ להחלפת תפקיד"
              >
                {input.role === 'customer' ? (
                  <span className="flex items-center gap-1 justify-center">
                    <Users className="w-3 h-3" />
                    לקוח/ה
                  </span>
                ) : (
                  <span className="flex items-center gap-1 justify-center">
                    <User className="w-3 h-3" />
                    אני
                  </span>
                )}
              </button>
              <textarea
                value={input.content}
                onChange={(e) => updateConversationInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, index === conversationInputs.length - 1)}
                placeholder={input.role === 'customer' ? 'הדבק כאן את פניית הלקוח/ה...' : 'מה ענית?'}
                rows={2}
                className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none resize-none ${
                  input.role === 'customer'
                    ? 'bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20'
                    : 'bg-emerald-50/50 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20'
                }`}
                dir="rtl"
              />
              {conversationInputs.length > 1 && (
                <button
                  onClick={() => removeConversationInput(index)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          <div className="flex gap-2 items-center">
            <button
              onClick={addConversationInput}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              הוסף הודעה נוספת
            </button>
            <span className="text-xs text-slate-400">Ctrl+Enter לשליחה</span>
            <div className="flex-1" />
            <button
              onClick={handleSend}
              disabled={isLoading || !conversationInputs.some(i => i.content.trim())}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  שלח
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}