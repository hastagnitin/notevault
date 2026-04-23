import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx';
import AuthPage from './components/AuthPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopNavigation from './components/TopNavigation.jsx';
import NotesViewer from './components/NotesViewer.jsx';
import ChatInterface from './components/ChatInterface.jsx';
import QuickActions from './components/QuickActions.jsx';
import PremiumShowcase from './components/PremiumShowcase.jsx';
import { BookOpen, ChevronRight } from 'lucide-react';

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-cyan/10 animate-pulse-glow">
          <BookOpen className="w-8 h-8 text-cyan" />
        </div>
        <p className="text-textSub text-sm tracking-widest uppercase font-semibold">Initializing NoteVault…</p>
      </div>
    </div>
  );
}

import GSAPBackground from './components/GSAPBackground.jsx';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ─── Authenticated Dashboard ──────────────────────────────────────────────────
function Dashboard() {
  const { theme } = useTheme();
  const [selectedText, setSelectedText] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState(() => {
    const saved = localStorage.getItem('nv_current_note_id');
    return saved;
  });
  const [activeView, setActiveView] = useState('dashboard');
  
  const pagesRef = useRef([]);
  const bookRef = useRef(null);

  useEffect(() => {
    // Parallax Effect
    if (bookRef.current && pagesRef.current.length > 0) {
      const matchMedia = gsap.matchMedia();
      matchMedia.add("(min-width: 1024px)", () => {
        gsap.to(pagesRef.current, {
          y: window.innerHeight * 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: bookRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1
          }
        });

        // Entrance animation
        gsap.from(pagesRef.current, {
          duration: 0.8,
          y: 50,
          opacity: 0,
          stagger: 0.2,
          ease: 'back.out'
        });
      });
      return () => matchMedia.revert();
    }
  }, [activeView]);

  // Subtle 3D mouse parallax on desktop
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth < 1024) return;
      const x = (e.clientX / window.innerWidth) * 10 - 5;
      const y = (e.clientY / window.innerHeight) * 10 - 5;
      
      gsap.to(pagesRef.current, {
        duration: 0.5,
        rotationX: y * 0.5,
        rotationY: x * 0.5,
        transformPerspective: 1000,
        ease: 'power1.out'
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNoteUpload = (noteId) => {
    setCurrentNoteId(noteId);
    localStorage.setItem('nv_current_note_id', noteId);
  };

  const handleViewChange = (viewId) => {
    setActiveView(viewId);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
      case 'ai':
        return (
          <div className="bento-grid w-full min-h-0 flex-1">
            {/* Main Stats / Notes Cluster */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              <div className="flex-1 flex flex-col gap-6">
                <NotesViewer onTextSelect={setSelectedText} onNoteUpload={handleNoteUpload} currentNoteId={currentNoteId} />
                <QuickActions noteId={currentNoteId} activeView={activeView} />
              </div>
            </div>
            
            {/* AI Context / Sidekick */}
            <div className="col-span-12 lg:col-span-5 flex flex-col h-full">
              <ChatInterface selectedText={selectedText} noteId={currentNoteId} />
            </div>
          </div>
        );
      case 'notes':
        return (
          <div className="book-container flex w-full" ref={bookRef}>
            <div className="page w-full flex flex-col h-full" ref={el => pagesRef.current[0] = el}>
              <div className="bg-card/80 backdrop-blur-xl rounded-[12px] border border-borderLight p-8 flex-1 hover-antigravity-card transition-all">
                <h2 className="text-xl font-headings font-bold text-textMain mb-6 tracking-wide">My Notes</h2>
                <NotesViewer onTextSelect={setSelectedText} onNoteUpload={handleNoteUpload} currentNoteId={currentNoteId} />
              </div>
            </div>
          </div>
        );
      case 'quiz':
      case 'study':
      case 'statistics':
      case 'settings':
        return (
          <div className="book-container flex w-full items-center justify-center h-full" ref={bookRef}>
             <div className="page w-full max-w-2xl" ref={el => pagesRef.current[0] = el}>
                <div className="bg-card/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center hover-antigravity-card transition-all duration-300 transform hover:-translate-y-2">
                  <span className="text-6xl mb-6 block animate-bounce">🚧</span>
                  <h2 className="text-3xl font-headings font-bold text-textMain mb-4">Under Construction</h2>
                  <p className="text-textSub font-sans">This page is still evolving.</p>
                </div>
             </div>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans relative z-0" style={{ backgroundColor: '#050714', color: '#FFFFFF' }}>
      <GSAPBackground />
      
      <div className="h-full z-40 animate-slide-in-right" style={{ animationFillMode: 'both', animationDuration: '0.5s' }}>
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <div className="z-30 flex-shrink-0">
          <TopNavigation />
        </div>

        <main className="flex-1 flex flex-col p-6 lg:p-8 gap-6 overflow-hidden w-full max-w-[1600px] mx-auto">
          {renderMainContent()}
        </main>
        
        {/* Antigravity FAB */}
        <button 
          id="fab"
          onClick={(e) => {
            gsap.timeline()
              .to(e.currentTarget, { duration: 0.1, scale: 0.85, ease: 'power2.inOut' })
              .to(e.currentTarget, { duration: 0.3, scale: 1.1, ease: 'elastic.out(1, 0.5)' });

            const shadowColor = theme === 'light' ? 'rgba(0, 168, 204, 0.5)' : 'rgba(0, 212, 255, 0.8)';
            const origShadow = theme === 'light' ? '0 8px 16px rgba(0, 168, 204, 0.25)' : '0 0 16px rgba(0, 212, 255, 0.4)';
            
            gsap.fromTo(e.currentTarget, 
              { boxShadow: origShadow }, 
              { duration: 0.6, boxShadow: `0 0 24px ${shadowColor}`, ease: 'power2.out', yoyo: true, repeat: 1, onComplete: () => {
                 gsap.to(e.currentTarget, { boxShadow: origShadow, duration: 0.2 });
              } }
            );
          }}
          className="fixed bottom-8 right-8 w-[56px] h-[56px] rounded-full flex items-center justify-center z-50 transition-all hover-antigravity-fab invisible"
          style={{ 
            backgroundColor: 'var(--accent-cyan)',
            color: 'var(--bg-primary)',
            boxShadow: theme === 'light' ? '0 8px 16px rgba(0, 168, 204, 0.25)' : '0 0 16px rgba(0, 212, 255, 0.4)'
          }}
          title="Create"
          ref={(el) => {
            if (el && !el.dataset.animated) {
              el.dataset.animated = 'true';
              gsap.fromTo(el, 
                { scale: 0, autoAlpha: 0, y: 100 }, 
                { scale: 1, autoAlpha: 1, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 1 }
              );
            }
          }}
        >
          <span className="text-[24px] mb-[2px] transition-transform duration-200 group-hover:rotate-180">+</span>
        </button>
      </div>
    </div>
  );
}

// ─── Root — guards with auth state ────────────────────────────────────────────
function AppInner() {
  const { user, loading } = useAuth();
  const [showPremium, setShowPremium] = useState(true);

  if (loading) return <LoadingScreen />;
  
  if (showPremium) {
    return (
      <div className="relative">
        <PremiumShowcase />
        <button 
          onClick={() => setShowPremium(false)}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full border border-white/20 backdrop-blur-md transition-all font-bold group"
        >
          Skip to Workspace <ChevronRight className="inline w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  if (!user) return <AuthPage />;
  return <Dashboard />;
}

export default function App() {
  useEffect(() => {
    fetch('http://localhost:5000/health')
      .then(r => r.json())
      .then(data => console.log('✅ Backend Connected:', data))
      .catch(err => console.error('❌ Backend Error:', err));
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </AuthProvider>
  );
}
