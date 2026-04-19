import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, Sparkles, Cpu, ShieldCheck } from 'lucide-react';
import { askChat, uploadCameraCapture } from '../api/noteVaultApi';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ChatInterface({ selectedText, noteId: propNoteId, onNoteCreated }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', text: 'NODE INITIALIZED. Protocol standing by for knowledge extraction.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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
    <div className="flex flex-col h-full overflow-hidden premium-glass rounded-[24px] border border-white/5 relative bg-white/[0.01]">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-[0.1em] uppercase text-white leading-none">Intelligence Engine</h3>
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
               <ShieldCheck className="w-2.5 h-2.5" /> High-Confidence Protocol
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-lg shadow-cyan-500/50" />
           <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar p-6">
        {messages.map((msg) => {
          const isAI = msg.type === 'ai';
          return (
            <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} group`}>
              <div 
                className={`relative max-w-[85%] rounded-[18px] px-5 py-4 text-sm font-medium leading-relaxed transition-all ${
                  isAI 
                    ? 'bg-white/[0.03] border border-white/5 text-gray-200 rounded-tl-none pt-7' 
                    : 'bg-cyan-500 text-black shadow-xl shadow-cyan-500/10 rounded-tr-none'
                }`}
              >
                {isAI && (
                  <div className="absolute top-2 left-4 text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/60 flex items-center gap-1.5">
                    <Bot className="w-2.5 h-2.5" /> System Output
                  </div>
                )}
                {!isAI && (
                   <div className="absolute top-[-1.2rem] right-0 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      Manual Input
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
      <div className="p-6 pt-2 bg-gradient-to-t from-black/20 to-transparent">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="INPUT_QUERY_HERE..." 
            className="w-full text-xs font-bold py-4 px-6 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all pr-[60px] tracking-widest uppercase"
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3 w-10 h-10 rounded-xl bg-cyan-500 text-black flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
        <div className="mt-3 text-[9px] text-center text-gray-600 font-bold uppercase tracking-[0.2em]">
           Processing knowledge via latent manifold convergence
        </div>
      </div>
    </div>
  );
}
