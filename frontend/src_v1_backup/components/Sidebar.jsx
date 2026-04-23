import React from 'react';
import { Home, FileText, MessageSquare, LogOut, Settings, BarChart2, Shield, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { logOut } from '../firebase/authService.js';

const topMenuItems = [
  { name: 'DASHBOARD',     icon: Home,          id: 'dashboard' },
  { name: 'KNOWLEDGE BASE', icon: FileText,       id: 'notes' },
  { name: 'NEURAL CO-PILOT', icon: MessageSquare,  id: 'ai' },
  { name: 'ANALYTICS',      icon: BarChart2,      id: 'statistics' },
];

const bottomMenuItems = [
  { name: 'SYSTEM CONFIG',   icon: Settings,   id: 'settings-bottom' },
];

export default function Sidebar({ activeView = 'dashboard', onViewChange }) {
  return (
    <aside 
      className="w-64 h-full flex flex-col flex-shrink-0 transition-all py-8 bg-sidebar border-r border-premium relative z-50"
    >
      {/* Branding / Status */}
      <div className="px-8 mb-12">
        <div className="flex items-center gap-2 mb-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-all">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase block leading-none">NoteVault</span>
            <span className="text-[8px] font-bold tracking-[0.2em] text-primary/50 uppercase mt-1">v4.0 Protocol</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 px-1">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(76,215,246,0.6)]" />
          <span className="text-[9px] font-black tracking-[0.2em] text-secondary/60 uppercase">Node Active</span>
        </div>
      </div>

      {/* Navigation Top */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
        {topMenuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange && onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black tracking-[0.15em] transition-all group relative overflow-hidden ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'group-hover:text-text-primary group-hover:scale-105'}`} />
              {item.name}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_12px_rgba(208,188,255,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Navigation Bottom & Logout */}
      <nav className="px-4 space-y-2 mt-auto">
        <div className="h-px bg-border-ghost w-full mb-6 mx-2" />
        {bottomMenuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange && onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black tracking-[0.15em] transition-all ${
                isActive 
                  ? 'bg-white/10 text-text-primary' 
                  : 'text-text-muted hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
        <button
          onClick={logOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black tracking-[0.15em] text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20 mt-4 group"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          TERMINATE LINK
        </button>
      </nav>
    </aside>
  );
}
