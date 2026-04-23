import React, { useState, useEffect } from 'react';
import { Target, FileText, MonitorPlay, Layers, Hash, X, Loader2 } from 'lucide-react';
import { generateQuiz, generateCheatsheet } from '../api/noteVaultApi';
import { useTheme } from '../context/ThemeContext.jsx';

export default function QuickActions({ noteId: propNoteId, activeView: parentActiveView }) {
  const [activeView, setActiveView] = useState(null); // null, 'quiz', 'cheatsheet'
  const [quizData, setQuizData] = useState(null);
  const [cheatsheetData, setCheatsheetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizCount, setQuizCount] = useState(5);
  const [generatingType, setGeneratingType] = useState(null); // 'quiz', 'cheatsheet', or null

  const getNoteId = () => {
    if (propNoteId) return propNoteId;
    return localStorage.getItem('nv_current_note_id');
  };

  const handleGenerateQuiz = async () => {
    const noteId = getNoteId();
    if (!noteId) {
      setError('CRITICAL: NO NODE IDENTIFIED');
      return;
    }
    setLoading(true);
    setGeneratingType('quiz');
    setError('');
    try {
      const quiz = await generateQuiz(noteId, quizCount);
      setQuizData(quiz);
      setActiveView('quiz');
    } catch (err) {
      setError('NODE_PROTOCOL_FAILURE: ' + err.message);
    } finally {
      setLoading(false);
      setGeneratingType(null);
    }
  };

  useEffect(() => {
    const activeNoteId = getNoteId();
    if (parentActiveView === 'quiz' && activeNoteId && !quizData && !loading) {
      handleGenerateQuiz();
    }
  }, [parentActiveView, propNoteId]);

  const handleGenerateCheatsheet = async () => {
    const noteId = getNoteId();
    if (!noteId) {
      setError('CRITICAL: NO NODE IDENTIFIED');
      return;
    }
    setLoading(true);
    setGeneratingType('cheatsheet');
    setError('');
    try {
      const sheet = await generateCheatsheet(noteId);
      setCheatsheetData(sheet);
      setActiveView('cheatsheet');
    } catch (err) {
      setError('NODE_PROTOCOL_FAILURE: ' + err.message);
    } finally {
      setLoading(false);
      setGeneratingType(null);
    }
  };

  const closeView = () => {
    setActiveView(null);
    setQuizData(null);
    setCheatsheetData(null);
    setError('');
  };

  // Render Quiz View
  if (activeView === 'quiz' && quizData) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="premium-glass rounded-[24px] border border-primary/20 p-6 flex-1 overflow-y-auto no-scrollbar shadow-[0_0_40px_rgba(208,188,255,0.05)]">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h3 className="font-black text-text-primary text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
              <Target className="w-4 h-4 text-primary" />
              Neural Proficiency Quiz
            </h3>
            <button onClick={closeView} className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            {quizData.questions?.map((q, idx) => (
              <div key={idx} className="border border-white/5 rounded-2xl p-5 bg-surface-low/30 hover:border-primary/20 transition-all">
                <p className="font-bold text-[13px] text-text-primary mb-4 leading-relaxed">{idx + 1}. {q.question}</p>
                <div className="space-y-3 ml-2">
                  {q.options?.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3 group">
                      <div className="w-6 h-6 rounded-md bg-surface-container flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:text-surface transition-all">
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <p className="text-[12px] text-text-secondary group-hover:text-text-primary transition-all">{opt}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                   <p className="text-[10px] text-primary font-black uppercase tracking-widest">Expected Output: {q.correctAnswer}</p>
                   <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Cheatsheet View
  if (activeView === 'cheatsheet' && cheatsheetData) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="premium-glass rounded-[24px] border border-primary/20 p-8 flex-1 overflow-y-auto no-scrollbar shadow-[0_0_40px_rgba(208,188,255,0.05)]">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <h3 className="font-black text-text-primary text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
              <FileText className="w-4 h-4 text-primary" />
              Accelerated Mapping
            </h3>
            <button onClick={closeView} className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="text-[14px] text-text-secondary font-medium leading-[1.8] bg-surface-low/30 p-8 rounded-3xl border border-white/5 whitespace-pre-wrap">
              {cheatsheetData.cheatsheet || cheatsheetData.summary || 'No content generated'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Quick Actions Card */}
      <div className="premium-glass rounded-[32px] border border-premium p-8 bg-surface-lowest/40 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <h3 className="font-black text-text-primary border-b border-white/5 pb-5 mb-8 text-[11px] uppercase tracking-[0.25em] flex items-center justify-between">
           <span>⚡ Intelligence Tasks</span>
           {error && <span className="text-red-400 normal-case tracking-normal font-bold">[{error}]</span>}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="flex-1 btn-primary flex items-center justify-center gap-3 disabled:opacity-50 h-[52px]"
              >
                {generatingType === 'quiz' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SYNTHESIZING...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Run Evaluation</span>
                  </>
                )}
              </button>
              <select
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
                disabled={loading}
                className="w-16 h-[52px] bg-surface-low border border-border-ghost rounded-xl text-[11px] font-black focus:outline-none focus:border-primary/40 text-text-primary disabled:opacity-50 text-center tracking-widest transition-all hover:bg-surface-container"
              >
                <option value={3}>03</option>
                <option value={5}>05</option>
                <option value={10}>10</option>
              </select>
            </div>

            <button 
              onClick={handleGenerateCheatsheet}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-surface-container border border-border-ghost text-text-primary px-5 py-3.5 rounded-xl disabled:opacity-50 transition-all font-black text-[11px] tracking-widest uppercase hover:bg-white/5 hover:border-secondary/40 active:scale-95 group h-[52px]"
            >
              {generatingType === 'cheatsheet' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>MAPPING...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-secondary group-hover:scale-110 transition-transform" />
                  <span>Cheat Sheet</span>
                </>
              )}
            </button>

            <button className="col-span-full flex items-center justify-center gap-3 bg-white/5 border border-white/5 text-text-muted px-5 py-4 rounded-2xl hover:bg-primary/10 hover:border-primary/30 hover:text-text-primary transition-all font-black text-[10px] tracking-[0.3em] uppercase group">
              <MonitorPlay className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              Initialize Study Room
              <span className="text-[8px] bg-primary/20 text-primary px-3 py-1 rounded-full ml-auto font-black tracking-widest">BETA_ACCESS</span>
            </button>
        </div>
      </div>

      {/* Stats Card - Bento Style */}
      <div className="premium-glass rounded-[32px] border border-premium p-8 flex flex-col justify-between bg-surface-lowest/40 relative overflow-hidden h-[300px]">
        <div className="flex items-center gap-3 text-text-primary relative z-10">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
             <Layers className="w-5 h-5 text-secondary" />
          </div>
          <div>
             <h3 className="font-black text-[11px] uppercase tracking-[0.2em] leading-none">Cluster Metrics</h3>
             <p className="text-[9px] font-bold text-text-muted uppercase mt-1.5 tracking-widest">Global Synaptic Load</p>
          </div>
        </div>
        
        <div className="relative z-10 px-2 mt-4 flex items-end justify-between">
          <div>
            <p className="font-black text-[56px] text-text-primary tracking-tighter leading-none mb-2 font-display">
              {getNoteId() ? '4,636' : '0000'}
            </p>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(76,215,246,0.6)]" />
               <p className="text-[10px] font-black uppercase text-secondary/70 tracking-widest">Nodes Indexed</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-[20px] font-black text-primary leading-none mb-1">+24%</p>
             <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Monthly Growth</p>
          </div>
        </div>

        {/* Dynamic Chart Overlay */}
        <div className="absolute inset-0 top-1/2 opacity-20 pointer-events-none">
           <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
             <defs>
               <linearGradient id="glowGrad" x1="0" y1="1" x2="0" y2="0">
                 <stop offset="0%" stopColor="transparent" />
                 <stop offset="100%" stopColor="var(--secondary)" />
               </linearGradient>
             </defs>
             <path d="M0,200 Q50,150 100,180 T200,120 T300,160 T400,80 L400,200 L0,200 Z" fill="url(#glowGrad)" />
             <path d="M0,200 Q50,150 100,180 T200,120 T300,160 T400,80" fill="none" stroke="var(--secondary)" strokeWidth="4" />
           </svg>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 relative z-10 flex justify-between">
            <div className="text-center">
               <p className="text-[14px] font-black text-text-primary leading-none">470</p>
               <p className="text-[8px] font-black text-text-muted uppercase mt-2 tracking-widest">Avg Daily</p>
            </div>
            <div className="text-center">
               <p className="text-[14px] font-black text-text-primary leading-none">333</p>
               <p className="text-[8px] font-black text-text-muted uppercase mt-2 tracking-widest">New Connections</p>
            </div>
            <div className="text-center">
               <p className="text-[14px] font-black text-text-primary leading-none">98.2%</p>
               <p className="text-[8px] font-black text-text-muted uppercase mt-2 tracking-widest">Confidence</p>
            </div>
        </div>
      </div>

    </div>
  );
}
