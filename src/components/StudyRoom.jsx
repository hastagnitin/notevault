import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Send, ShieldCheck, Cpu, 
  Bot, User, MessageSquare, Plus,
  Hash, Clock, Activity, Loader2
} from 'lucide-react';
import { BASE_URL } from '../api/noteVaultApi';

export default function StudyRoom() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${BASE_URL}/discussions/active`);
      const data = await res.json();
      setRooms(data.discussions);
    } catch (err) {
      console.error(err);
    }
  };

  const selectRoom = async (room) => {
    setActiveRoom(room);
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/discussions/${room.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeRoom) return;
    
    const text = input;
    setInput('');
    try {
      const res = await fetch(`${BASE_URL}/discussions/${activeRoom.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sender: 'You' })
      });
      const data = await res.json();
      setMessages(data.messages);
      fetchRooms(); // update summaries
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full flex gap-8 animate-fade-in">
      {/* Sidebar - Room List */}
      <div className="w-80 flex flex-col gap-6 h-full">
        <div className="premium-glass rounded-[32px] p-8 border border-white/5 flex flex-col h-full bg-white/[0.01]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Hash className="w-4 h-4 text-cyan-400" /> Active Nodes
            </h3>
            <button className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500 transition-all hover:text-black">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-2">
            {rooms.map((room) => (
              <div 
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                  activeRoom?.id === room.id 
                  ? 'bg-cyan-500/10 border-cyan-500/30 shadow-lg shadow-cyan-500/5' 
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`text-sm font-bold uppercase tracking-tight ${activeRoom?.id === room.id ? 'text-cyan-400' : 'text-white'}`}>{room.title}</h4>
                  <div className="flex items-center gap-1 text-[9px] text-gray-600 font-black">
                    <Users className="w-3 h-3" /> {room.members}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 line-clamp-1 italic">"{room.lastMessage}"</p>
                {room.unread > 0 && <span className="mt-3 inline-block bg-cyan-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Update</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col premium-glass rounded-[40px] border border-white/5 overflow-hidden bg-white/[0.01]">
        {activeRoom ? (
          <>
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-2xl shadow-cyan-500/20">
                     <MessageSquare className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-white uppercase tracking-tighter">{activeRoom.title}</h3>
                     <p className="text-[10px] font-black text-cyan-400/60 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Activity className="w-3 h-3" /> Real-time Synchronized Study Node
                     </p>
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className="flex -space-x-3 overflow-hidden p-1">
                    {[1,2,3].map(i => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-black bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        U{i}
                      </div>
                    ))}
                    <div className="inline-block h-8 w-8 rounded-full ring-2 ring-black bg-cyan-500/20 flex items-center justify-center text-[10px] font-black text-cyan-400 border border-cyan-500/30">
                      +
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 no-scrollbar">
              {messages.map((msg, i) => {
                const isAI = msg.sender === 'Chanakya AI';
                const isYou = msg.sender === 'You';
                return (
                  <div key={i} className={`flex ${isYou ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2`}>
                    <div className={`relative max-w-[80%] rounded-[28px] px-7 py-6 ${
                      isAI ? 'bg-amber-400/5 border border-amber-400/20 text-gray-200 rounded-tl-none pt-10' :
                      isYou ? 'bg-cyan-500 text-black rounded-tr-none shadow-2xl shadow-cyan-500/20' :
                      'bg-white/[0.03] border border-white/5 text-gray-300 rounded-tl-none pt-10'
                    }`}>
                      {!isYou && (
                        <div className={`absolute top-4 left-7 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5 ${isAI ? 'text-amber-400' : 'text-gray-500'}`}>
                           {isAI ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                           {msg.sender}
                        </div>
                      )}
                      <p className="text-[15px] font-medium leading-relaxed">{msg.text}</p>
                      <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest mt-4 block text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-10 pt-4 bg-gradient-to-t from-black/20 to-transparent">
              <form onSubmit={sendMessage} className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Share knowledge or ask Chanakya..."
                  className="w-full text-sm font-bold py-5 px-8 rounded-3xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 transition-all pr-[80px]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-3 w-12 h-12 rounded-2xl bg-cyan-500 text-black flex items-center justify-center transition-all hover:bg-cyan-400 shadow-2xl shadow-cyan-500/20 disabled:opacity-30"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-20 text-center opacity-30">
            <div className="w-24 h-24 rounded-[32px] border-2 border-dashed border-gray-500 flex items-center justify-center mb-10">
               <Users className="w-12 h-12 text-gray-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Select Study Node</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">Collaborative synchronization standby.</p>
          </div>
        )}
      </div>
    </div>
  );
}
