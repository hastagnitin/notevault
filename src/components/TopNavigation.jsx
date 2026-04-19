import React, { useState, useRef, useEffect } from 'react';
import { Search, UploadCloud, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { logOut } from '../firebase/authService.js';
import gsap from 'gsap';

export default function TopNavigation() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  async function handleSignOut() {
    setMenuOpen(false);
    await logOut();
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const isDark = theme === 'dark';

  return (
    <header 
      className="h-[72px] border-b px-8 flex items-center justify-between flex-shrink-0 relative z-30"
      style={{ backgroundColor: '#050714', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      
      {/* Search Bar - Systematic Design */}
      <div className="flex items-center gap-6">
        <div className="relative group w-[300px]">
          <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="SEARCH_DATA..."
            className="w-full text-[10px] font-black tracking-widest uppercase py-3.5 pl-10 pr-4 rounded-xl bg-white/[0.03] border border-white/5 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-white placeholder-gray-700"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5">

        {/* Theme Toggle - Techy Style */}
        <button 
          onClick={(e) => {
             gsap.to(e.currentTarget, { duration: 0.4, rotation: "+=180", ease: "back.out" });
             toggleTheme();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          onMouseOver={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
          onMouseOut={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
        >
          {theme === 'light' ? '☼' : '☾'}
        </button>

        {/* Upload Button - Command Style */}
        <button 
          className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-black font-black text-[10px] tracking-[0.15em] uppercase hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-white/5"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          Synchronize
        </button>

        {/* User Hub */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-3 pl-4 pr-3 py-1.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-white tracking-widest uppercase leading-none">{displayName}</p>
              <p className="text-[8px] font-bold text-cyan-400 uppercase mt-1">Level 4 Node</p>
            </div>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-10 h-10 rounded-xl object-cover border border-cyan-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[10px] font-black text-cyan-400">
                {initials}
              </div>
            )}
            <ChevronDown className="w-3 h-3 text-gray-600" />
          </button>

          {/* Dropdown - Glassmorphic */}
          {menuOpen && (
            <div className="absolute right-0 mt-4 w-60 rounded-2xl premium-glass border border-white/10 shadow-2xl py-2 z-50 overflow-hidden bg-black/80">
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{displayName}</p>
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-1 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-red-500 hover:bg-red-500/10 transition-all uppercase tracking-widest"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Terminate Link
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
