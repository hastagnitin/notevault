import React, { useState } from 'react';
import { 
  Home, FileText, MessageSquare, LogOut, 
  Settings, BarChart2, Shield, Activity, 
  Menu, X, Target, Users
} from 'lucide-react';
import { logOut } from '../firebase/authService.js';

const topMenuItems = [
  { name: 'DASHBOARD',     icon: Home,          id: 'dashboard' },
  { name: 'KNOWLEDGE BASE', icon: FileText,       id: 'notes' },
  { name: 'CHAS SHEET',     icon: Target,        id: 'cheatsheet' },
  { name: 'EVALUATION',    icon: MessageSquare, id: 'quiz' },
  { name: 'STUDY NODE',     icon: Users,         id: 'rooms' },
];

export default function Sidebar({ activeView = 'dashboard', onViewChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNav = (id) => {
    onViewChange && onViewChange(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-2xl bg-cyan-500 text-black shadow-2xl shadow-cyan-500/40 flex items-center justify-center animate-bounce hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[60] w-72 h-full flex flex-col transition-all duration-500 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#050714', borderColor: 'rgba(255,255,255,0.1)', borderRightWidth: '1px' }}
      >
        {/* Branding */}
        <div className="p-10">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                <Shield className="w-4 h-4 text-cyan-400" />
             </div>
             <h1 className="text-lg font-black text-white tracking-widest">NOTEVALULT</h1>
          </div>
          <p className="text-[10px] font-black tracking-[0.3em] text-cyan-400/50 uppercase ml-11">v2.0.4-Alpha</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 space-y-3 overflow-y-auto no-scrollbar">
          {topMenuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[20px] text-[10px] font-black tracking-[0.2em] transition-all group ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10' 
                    : 'text-gray-600 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-all ${isActive ? 'text-cyan-400 scale-110' : 'group-hover:text-white group-hover:scale-110'}`} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22D3EE]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status */}
        <div className="p-8 px-6">
           <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                 <span className="text-[9px] font-black text-white uppercase tracking-widest">System Health</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                 <div className="w-[94%] h-full bg-gradient-to-r from-cyan-500 to-teal-400" />
              </div>
           </div>

           <button
             onClick={logOut}
             className="w-full flex items-center gap-4 px-6 py-4 rounded-[20px] text-[10px] font-black tracking-[0.2em] text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
           >
             <LogOut className="w-4 h-4" />
             TERMINATE LINK
           </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" 
        />
      )}
    </>
  );
}
