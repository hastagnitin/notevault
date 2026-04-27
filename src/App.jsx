import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import Dashboard from './components/Dashboard.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopNavigation from './components/TopNavigation.jsx';
import NotesViewer from './components/NotesViewer.jsx';
import ChatInterface from './components/ChatInterface.jsx';
import QuickActions from './components/QuickActions.jsx';
import PremiumShowcase from './components/PremiumShowcase.jsx';
import CheatSheetGenerator from './components/CheatSheetGenerator.jsx';
import QuizGenerator from './components/QuizGenerator.jsx';
import StudyRoom from './components/StudyRoom.jsx';
import GSAPBackground from './components/GSAPBackground.jsx';
import InteractiveWeb from './components/InteractiveWeb.jsx';
import { BookOpen, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedText, setSelectedText] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (user && mainRef.current) {
      gsap.fromTo(mainRef.current, 
        { scale: 0.9, opacity: 0, rotationY: -10 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 1.2, ease: "power4.out" }
      );
    }
  }, [user, activeView]);

  if (authLoading) return (
    <div className="h-screen w-full bg-[#050714] flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <PremiumShowcase />;

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'ai': return <ChatInterface selectedText={selectedText} />;
      case 'notes': return <NotesViewer onTextSelect={setSelectedText} currentNoteId={currentNoteId} />;
      case 'cheatsheet': return <CheatSheetGenerator noteId={currentNoteId} />;
      case 'quiz': return <QuizGenerator noteId={currentNoteId} />;
      case 'rooms': return <StudyRoom />;
      default: return <Dashboard />;
    }
  };

  const handleNoteUpload = (id) => {
    setCurrentNoteId(id);
    setActiveView('notes');
  };

  return (
    <div className="relative h-screen w-full bg-[#050714] text-white overflow-hidden font-inter selection:bg-cyan-500/30">
      {/* Background Visualization - Kept very subtle */}
      <GSAPBackground />
      {/* <InteractiveWeb /> */}
      
      {/* HUD Layer */}
      <div className="flex h-full w-full relative z-10">
        
        {/* Navigation Blade */}
        <div className="h-full flex-shrink-0 z-50">
          <Sidebar activeView={activeView} onViewChange={setActiveView} />
        </div>

        {/* Content Console */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          <TopNavigation />
          
          <div className="flex-1 w-full p-6 lg:p-10 relative overflow-hidden flex flex-col items-center">
            {/* The Main Dynamic Page */}
            <div 
              ref={mainRef}
              className="w-full max-w-[1500px] h-full overflow-y-auto no-scrollbar premium-glass rounded-[40px] border border-white/5 relative shadow-2xl bg-black/20"
              style={{ perspective: '2000px' }}
            >
               {renderMainContent()}
            </div>

            {/* Floating Action HUD - Optional secondary interaction point */}
            <div className="fixed bottom-10 right-10 z-20">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
