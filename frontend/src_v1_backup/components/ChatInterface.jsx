import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, Sparkles, Cpu, ShieldCheck } from 'lucide-react';
import { askChat, uploadCameraCapture } from '../api/noteVaultApi';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ChatInterface({ selectedText, noteId: propNoteId, onNoteCreated }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'NODE INITIALIZED. Protocol standing by for knowledge extraction.' }
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
      setInput(`[EXTRACT]: "${selectedText}"`);
    }
  }, [selectedText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const targetNoteId = getNoteId();
      if (!targetNoteId) throw new Error('No node identified. Upload a note first.');
      
      const response = await askChat(targetNoteId, userMessage);
      const responseText = response.success === false ? (response.error || 'ERROR_RETRIEVAL_FAILED') : (response.answer || response.message || 'NULL_RESPONSE');
      
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', text: `[CRITICAL_FAILURE]: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden premium-glass rounded-[32px] border border-premium relative bg-surface-lowest/40 shadow-2xl">
      {/* Header - Kinetic Design */}
      <div className="p-6 border-b border-border-ghost flex items-center justify-between bg-surface-container/30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-[0_0_15px_rgba(76,215,246,0.2)]">
            <Cpu className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-[0.15em] uppercase text-text-primary leading-none">Sidekick AI</h3>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
               <span className="text-[9px] text-secondary/70 font-black uppercase tracking-widest leading-none">Synthesizer Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-white/5 text-text-muted transition-colors">
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar p-6">
        {messages.map((msg) => {
          const isAI = msg.type === 'ai';
          return (
            <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} group`}>
              <div 
                className={`relative max-w-[85%] rounded-3xl px-6 py-5 text-[13px] font-medium leading-relaxed transition-all ${
                  isAI 
                    ? 'bg-surface-container-high/50 border border-border-ghost text-text-primary rounded-tl-none pt-8 shadow-sm' 
                    : 'btn-primary text-surface-lowest rounded-tr-none shadow-xl'
                }`}
              >
                {isAI && (
                  <div className="absolute top-3 left-6 text-[9px] font-black uppercase tracking-[0.2em] text-secondary/60 flex items-center gap-1.5">
                    <Bot className="w-3 h-3" /> Oracle Response
                  </div>
                )}
                <div className={isAI ? 'font-sans' : 'font-sans font-bold italic'}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 pt-2 bg-gradient-to-t from-surface-lowest/60 to-transparent">
        <form onSubmit={handleSend} className="relative flex items-center group">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="COMMAND_PROMPT..." 
            className="w-full text-[11px] font-black py-4 px-8 rounded-2xl bg-surface-container/50 border border-border-ghost text-text-primary placeholder-text-muted focus:outline-none focus:border-secondary/40 focus:ring-4 focus:ring-secondary/5 transition-all pr-[70px] tracking-widest uppercase outline-none"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3 w-12 h-12 rounded-xl bg-secondary text-surface-lowest flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95 shadow-lg shadow-secondary/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-surface-lowest/30 border-t-surface-lowest rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="mt-4 flex justify-between px-2">
           <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Protocol: Neural-Llama-3</span>
           <span className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Conf: 98.4%</span>
        </div>
      </div>
    </div>
  );
}
