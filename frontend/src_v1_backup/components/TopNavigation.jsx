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

  return (
    <header 
      className="h-[72px] px-8 flex items-center justify-between flex-shrink-0 relative z-30 transition-all bg-surface border-b border-premium"
    >
      
      {/* Search Bar - Systematic Design */}
      <div className="flex items-center gap-6">
        <div className="relative group w-[340px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-secondary transition-colors" />
          <input
            type="text"
            placeholder="SEARCH_VAULT..."
            className="w-full text-[11px] font-black tracking-[0.1em] uppercase py-3 pl-11 pr-4 rounded-xl bg-surface-low border border-border-ghost focus:outline-none focus:border-secondary/40 focus:ring-1 focus:ring-secondary/20 transition-all text-text-primary placeholder-text-muted"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">

        {/* Sync Button - High Confidence Profile */}
        <button 
          className="btn-primary flex items-center gap-2.5"
        >
          <UploadCloud className="w-4 h-4" />
          Synchronize
        </button>

        {/* User Hub */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-3 pl-1 pr-1.5 py-1 rounded-2xl bg-surface-container border border-border-ghost hover:bg-surface-container-high transition-all"
          >
            <div className="w-9 h-9 rounded-[10px] bg-primary/10 border border-primary/20 flex items-center justify-center text-[11px] font-black text-primary">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="w-full h-full rounded-[10px] object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[10px] font-black text-text-primary tracking-widest uppercase leading-none">{displayName}</p>
              <p className="text-[9px] font-bold text-secondary uppercase mt-1 tracking-widest">Level 4 Node</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown - Premium Glass */}
          {menuOpen && (
            <div className="absolute right-0 mt-4 w-60 rounded-2xl premium-glass border border-white/10 shadow-2xl py-2 z-50 overflow-hidden bg-surface-container-highest/90">
              <div className="px-5 py-4 border-b border-border-ghost">
                <p className="text-[10px] font-black text-text-primary uppercase tracking-widest">{displayName}</p>
                <p className="text-[9px] font-bold text-text-muted uppercase mt-1 truncate">{user?.email}</p>
              </div>
              <div className="p-2 space-y-1">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all uppercase tracking-widest"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Upgrade Protocol
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black text-red-400 hover:bg-red-400/10 transition-all uppercase tracking-widest"
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
