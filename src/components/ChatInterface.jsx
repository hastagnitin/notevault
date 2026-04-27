import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, User, X, Sparkles, Cpu, 
  ShieldCheck, FileText, List, HelpCircle, Link2,
  BrainCircuit, Zap, Terminal
} from 'lucide-react';
import { askChat } from '../api/noteVaultApi';

export default function ChatInterface({ selectedText, noteId: propNoteId }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'I am Chanakya AI. My wisdom is at your service. Select a fragment of knowledge or ask a question to begin.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  const getNoteId = () => {
    if (propNoteId) return propNoteId;
    return localStorage.getItem('nv_current_note_id');
  };

  useEffect(() => {
    if (selectedText) {
      setInput(`Summarize this fragment: "${selectedText}"`);
    }
  }, [selectedText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e, forcedInput = null) => {
    if (e) e.preventDefault();
    const query = forcedInput || input;
    if (!query.trim() || loading) return;

    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: query }]);
    if (!forcedInput) setInput('');
    setLoading(true);

    try {
      const targetNoteId = getNoteId();
      if (!targetNoteId) throw new Error('Identify a knowledge node first (upload a note).');
      
      const response = await askChat(targetNoteId, query);
      const responseText = response.answer || response.message || 'The archive yielded no response.';
      
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: `System Alert: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Summarize', icon: FileText, query: 'Give me a concise summary of this note.', color: 'text-cyan-400' },
    { label: 'Key Points', icon: List, query: 'Extract the 5 most important points from these notes.', color: 'text-teal-400' },
    { label: 'Quiz Me', icon: HelpCircle, query: 'Generate 3 hard questions based on this content.', color: 'text-purple-400' },
    { label: 'Connections', icon: Link2, query: 'How does this relate to other foundational concepts?', color: 'text-amber-400' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden premium-glass rounded-[40px] border border-white/5 relative bg-white/[0.01]">
      {/* Header */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[18px] bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-2xl shadow-cyan-500/20 group">
            <BrainCircuit className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tighter uppercase text-white leading-none flex items-center gap-2">
              Chanakya AI <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            </h3>
            <span className="text-[10px] text-cyan-400/60 font-black uppercase tracking-[0.2em] flex items-center gap-1.5 mt-2">
               <ShieldCheck className="w-2.5 h-2.5" /> Strategist Protocol Active
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-lg shadow-cyan-500/50" />
           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Neural Link Est.</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar p-8">
        {messages.map((msg) => {
          const isAI = msg.type === 'ai';
          return (
            <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} group`}>
              <div 
                className={`relative max-w-[90%] rounded-[28px] px-7 py-6 text-[15px] font-medium leading-relaxed transition-all ${
                  isAI 
                    ? 'bg-white/[0.02] border border-white/5 text-gray-200 rounded-tl-none pt-10' 
                    : 'bg-cyan-500 text-black shadow-2xl shadow-cyan-500/20 rounded-tr-none'
                }`}
              >
                {isAI && (
                  <div className="absolute top-4 left-7 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400/50 flex items-center gap-2">
                    <Terminal className="w-2.5 h-2.5" /> Intelligence Output
                  </div>
                )}
                <div className={isAI ? 'font-sans' : 'font-sans font-bold select-all'}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.02] border border-white/5 rounded-[28px] rounded-tl-none px-7 py-6 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
              <span className="text-[10px] font-black text-cyan-400/40 uppercase tracking-widest">Consulting Archives...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions Footer */}
      <div className="px-8 pb-4">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(null, action.query)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-cyan-500/20 transition-all group disabled:opacity-30"
            >
              <action.icon className={`w-3.5 h-3.5 ${action.color} group-hover:scale-110 transition-transform`} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-8 pt-4 bg-gradient-to-t from-black/20 to-transparent">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Transmit query to Chanakya..." 
            className="w-full text-sm font-bold py-5 px-8 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all pr-[80px] tracking-wider selection:bg-cyan-500/30"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3 w-12 h-12 rounded-xl bg-cyan-500 text-black flex items-center justify-center transition-all disabled:opacity-30 hover:bg-cyan-400 hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="mt-4 text-[9px] text-center text-gray-700 font-bold uppercase tracking-[0.3em]">
           Guided by the principles of infinite learning and strategic wisdom
        </div>
      </div>
    </div>
  );
}
