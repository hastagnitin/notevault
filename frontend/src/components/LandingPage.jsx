import React, { useEffect, useRef } from 'react';
import { Search, Plus, Bell, MoreHorizontal, FileText, Calendar, Clock, ChevronRight, Activity, Zap, Shield, Command } from 'lucide-react';
import gsap from 'gsap';
import SidebarPreview from './SidebarPreview';

const LandingPage = ({ onOpenAuth, isAuthOpen }) => {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isAuthOpen) {
      gsap.to(contentRef.current, {
        scale: 0.95,
        filter: 'blur(10px)',
        opacity: 0.5,
        duration: 0.8,
        ease: "power4.out"
      });
    } else {
      gsap.to(contentRef.current, {
        scale: 1,
        filter: 'blur(0px)',
        opacity: 1,
        duration: 0.8,
        ease: "power4.out"
      });
    }
  }, [isAuthOpen]);

  useEffect(() => {
    // Entrance animations for panels
    const panels = containerRef.current.querySelectorAll('.premium-surface');
    gsap.fromTo(panels, 
      { opacity: 0, y: 30, scale: 0.98 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 1.2, 
        stagger: 0.1, 
        ease: "power3.out",
        delay: 0.5 
      }
    );
  }, []);

  const handleMouseMove = (e) => {
    if (isAuthOpen) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const moveX = (clientX - innerWidth / 2) / 50;
    const moveY = (clientY - innerHeight / 2) / 50;

    gsap.to('.parallax-panel', {
      x: moveX,
      y: moveY,
      duration: 1,
      ease: "power2.out",
      stagger: 0.02
    });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-black overflow-hidden"
    >
      <div ref={contentRef} className="flex w-full h-full">
        {/* Sidebar Frame */}
        <SidebarPreview />

        {/* Modular Workspace Hub */}
        <main className="flex-1 flex flex-col h-full bg-transparent relative z-10 p-6 gap-6">
          
          {/* Top Command Center */}
          <header className="flex items-center justify-between gap-6 h-14">
            <div className="flex-1 flex items-center gap-4 premium-surface px-4 h-full">
              <Command size={16} className="text-white/20" />
              <div className="flex items-center gap-2 text-xs text-white/20 flex-1">
                <span>Search Workspace</span>
                <span className="px-1.5 py-0.5 rounded border border-white/5 bg-white/5 text-[9px]">⌘K</span>
              </div>
              <div className="flex items-center gap-4 border-l border-white/5 pl-4">
                <span className="text-[10px] text-white/40">Status: Nodes Active</span>
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={onOpenAuth}
                className="mono-button mono-button-primary"
              >
                Access Vault
              </button>
            </div>
          </header>

          {/* Main Modular Grid */}
          <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
            
            {/* Knowledge Hub Panel */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-hidden">
              <div className="premium-surface flex-1 p-8 flex flex-col gap-8 relative overflow-hidden transition-all hover:bg-white/[0.01] group parallax-panel">
                <div className="scanning-line" />
                <div className="flex items-center justify-between z-10">
                  <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold font-headings tracking-tighter">Knowledge Retrieval</h1>
                    <p className="text-xs text-white/30">Select a neural node to begin interactive synthesis.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 z-10 overflow-y-auto no-scrollbar pb-4 text-left">
                  {[
                    { title: "System Architecture v4.0", type: "Protocol", time: "12m ago" },
                    { title: "Encoded Memory Structures", type: "Secure", time: "1h ago" },
                    { title: "Neural Link Documentation", type: "Utility", time: "3h ago" },
                    { title: "Interface Rhythm Analysis", type: "Design", time: "5h ago" }
                  ].map((note, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:translate-y-[-2px] cursor-default">
                      <div className="flex items-center justify-between mb-4">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                            <FileText size={14} className="text-white/60" />
                         </div>
                         <span className="text-[10px] font-mono text-white/20">{note.time}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white/80 mb-1">{note.title}</h3>
                      <div className="flex gap-2">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-white/30">{note.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats / Activity Bar */}
              <div className="h-40 grid grid-cols-3 gap-6">
                 {[
                   { label: "Storage", value: "84%", icon: Activity },
                   { label: "Links", value: "1,242", icon: Zap },
                   { label: "Shield", value: "Optimal", icon: Shield }
                 ].map((stat, i) => (
                   <div key={i} className="premium-surface p-6 flex flex-col justify-between group overflow-hidden parallax-panel">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="flex items-center justify-between text-white/20 group-hover:text-white/40 transition-colors z-10">
                        <stat.icon size={16} />
                        <span className="text-[9px] font-mono uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-bold font-headings z-10">{stat.value}</span>
                   </div>
                 ))}
              </div>
            </div>

            {/* AI Co-Pilot Panel */}
            <div className="col-span-12 lg:col-span-4 flex flex-col">
              <div className="premium-surface flex-1 p-8 flex flex-col relative overflow-hidden group parallax-panel">
                 <div className="flex items-center gap-2 mb-8 z-10">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                    <h2 className="text-sm font-semibold tracking-wide">Neural Co-Pilot</h2>
                 </div>
                 
                 <div className="flex-1 flex flex-col gap-6 z-10">
                    <div className="flex flex-col gap-2">
                      <div className="w-1/3 h-1.5 bg-white/10 rounded-full" />
                      <div className="w-2/3 h-1.5 bg-white/10 rounded-full" />
                      <div className="w-full h-1.5 bg-white/10 rounded-full opacity-50" />
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 italic text-xs text-white/40 leading-relaxed">
                      "I'm analyzing your current workspace layout. Establish a secure link to begin interactive neural processing."
                    </div>
                 </div>

                 <div className="mt-auto space-y-4 z-10">
                    <div className="h-px bg-white/5 w-full" />
                    <div className="flex items-center justify-between text-[10px] text-white/20 font-mono">
                      <span>SYNC STATUS</span>
                      <span>WAITING...</span>
                    </div>
                    <button 
                      onClick={onOpenAuth}
                      className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                    >
                      Authenticate
                    </button>
                 </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
