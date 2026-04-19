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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <aside 
      className="w-64 border-r h-full flex flex-col flex-shrink-0 transition-all py-8"
      style={{ backgroundColor: '#050714', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      {/* Branding / Status */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">Secure Link</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-teal-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 uppercase">Live Metrics</span>
        </div>
      </div>

      {/* Navigation Top */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {topMenuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange && onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black tracking-[0.15em] transition-all group ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/5' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 transition-all ${isActive ? 'text-cyan-400 scale-110' : 'group-hover:text-white'}`} />
              {item.name}
              {isActive && (
                <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-6 my-6">
        <div className="h-px bg-white/5 w-full" />
      </div>

      {/* Navigation Bottom & Logout */}
      <nav className="px-4 space-y-2">
        {bottomMenuItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange && onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black tracking-[0.15em] transition-all ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-600 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </button>
          );
        })}
        <button
          onClick={logOut}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[10px] font-black tracking-[0.15em] text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20 mt-4"
        >
          <LogOut className="w-4 h-4" />
          TERMINATE LINK
        </button>
      </nav>

    </aside>
  );
}
