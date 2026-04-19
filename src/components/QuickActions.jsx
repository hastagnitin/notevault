import React, { useState, useEffect } from 'react';
import { Target, FileText, MonitorPlay, Layers, Hash, X, Loader2 } from 'lucide-react';
import { generateQuiz, generateCheatsheet } from '../api/noteVaultApi';
import { useTheme } from '../context/ThemeContext.jsx';

export default function QuickActions({ noteId: propNoteId, activeView: parentActiveView }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeView, setActiveView] = useState(null); // null, 'quiz', 'cheatsheet'
  const [quizData, setQuizData] = useState(null);
  const [cheatsheetData, setCheatsheetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizCount, setQuizCount] = useState(5);
  const [generatingType, setGeneratingType] = useState(null); // 'quiz', 'cheatsheet', or null

  const getNoteId = () => {
    if (propNoteId) return propNoteId;
    const saved = localStorage.getItem('nv_current_note_id');
    return saved;
  };

  const handleGenerateQuiz = async () => {
    const noteId = getNoteId();
    if (!noteId) {
      setError('Please upload a note first!');
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
      setError('Failed to generate quiz: ' + err.message);
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
      setError('Please upload a note first!');
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
      setError('Failed to generate cheatsheet: ' + err.message);
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
        <div className="bg-card rounded-xl shadow-card border border-borderLight p-6 flex-1 overflow-y-auto hover-antigravity-card border-t-[3px] border-t-primary transition-all">
          <div className="flex items-center justify-between mb-4 border-b border-borderLight pb-3">
            <h3 className="font-bold text-textMain text-sm uppercase flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Generated Quiz
            </h3>
            <button onClick={closeView} className="p-1 hover:bg-bgSecondary rounded text-textSub">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {quizData.questions?.map((q, idx) => (
              <div key={idx} className="border border-borderLight rounded-lg p-4 bg-bgSecondary transition-colors">
                <p className="font-medium text-sm text-textMain mb-3">{idx + 1}. {q.question}</p>
                <div className="space-y-2 ml-4">
                  {q.options?.map((opt, optIdx) => (
                    <p key={optIdx} className="text-sm text-textSub">{String.fromCharCode(65 + optIdx)}. {opt}</p>
                  ))}
                </div>
                <p className="text-xs text-[var(--success)] mt-4 font-medium flex items-center before:content-['✓'] before:mr-1 before:font-bold">Answer: {q.correctAnswer}</p>
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
        <div className="bg-card rounded-xl shadow-card border border-borderLight p-6 flex-1 overflow-y-auto hover-antigravity-card border-t-[3px] border-t-primary transition-all">
          <div className="flex items-center justify-between mb-4 border-b border-borderLight pb-3">
            <h3 className="font-bold text-textMain text-sm uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Cheat Sheet
            </h3>
            <button onClick={closeView} className="p-1 hover:bg-bgSecondary rounded text-textSub">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="prose prose-sm max-w-none text-textMain">
            <pre className="whitespace-pre-wrap text-sm text-textMain font-sans bg-bgSecondary p-4 rounded-lg border border-borderLight transition-colors">
              {cheatsheetData.cheatsheet || cheatsheetData.summary || 'No content generated'}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  // Default View with Buttons
  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      
      {/* Error Message */}
      {error && (
        <div className="bg-[var(--error)] bg-opacity-10 border border-[var(--error)] text-[var(--error)] px-4 py-3 rounded-lg text-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Quick Actions Card */}
      <div className="bg-card rounded-2xl shadow-xl border border-borderSubtle p-8 hover-antigravity-card transition-all"
        style={{ boxShadow: !isLight ? '0 8px 32px rgba(2,132,199,0.1)' : undefined }}
      >
        <h3 className="font-bold text-textMain border-b border-borderLight pb-4 mb-6 text-sm uppercase tracking-wider">⚡ Quick Actions</h3>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button 
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 bg-cyan text-white px-5 py-3.5 rounded-xl disabled:opacity-50 font-medium text-sm hover-antigravity-btn shadow-md hover:shadow-cyan/40 hover:bg-cyanDark transition-all"
            >
              {generatingType === 'quiz' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating {quizCount}...</span>
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
            <select
              value={quizCount}
              onChange={(e) => setQuizCount(Number(e.target.value))}
              disabled={loading}
              className="px-4 py-3.5 bg-bgSecondary border border-borderLight rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan text-textMain disabled:opacity-50 min-w-[80px] text-center font-medium shadow-sm"
            >
              <option value={3}>3 Qs</option>
              <option value={5}>5 Qs</option>
              <option value={7}>7 Qs</option>
              <option value={10}>10 Qs</option>
            </select>
          </div>

          <button 
            onClick={handleGenerateCheatsheet}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-transparent text-cyan border-2 border-cyan px-5 py-3 rounded-xl disabled:opacity-50 transition-all font-medium text-sm hover:bg-cyan/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-95"
          >
            {generatingType === 'cheatsheet' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating sheet...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Create Cheat Sheet</span>
              </>
            )}
          </button>

          <button className="w-full flex items-center justify-center gap-3 bg-bgSecondary border border-borderHover text-textMain px-5 py-3.5 rounded-xl hover:bg-bgTertiary transition-colors font-medium text-sm shadow-sm group">
            <MonitorPlay className="w-5 h-5 text-cyan group-hover:scale-110 transition-transform" />
            Study Room <span className="text-xs bg-cyan/20 text-cyan px-2 py-0.5 rounded-full ml-1">Beta</span>
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-card rounded-[12px] border border-borderLight p-[20px] hover-antigravity-card transition-all animate-fade-in-up"
        style={{ 
          animationDelay: '100ms',
          borderTop: isLight ? '3px solid #17A2B8' : '3px solid #1DD9BF',
          boxShadow: isLight ? '0 4px 12px rgba(0, 0, 0, 0.08)' : '0 0 16px rgba(0, 212, 255, 0.15)'
        }}
      >
        <div className="flex items-center gap-2 mb-2 text-textMain">
          <span className="text-[20px]">📊</span>
          <h3 className="font-headings font-bold text-[14px]">Statistics</h3>
        </div>
        
        <div className="mb-4">
          <p className="font-headings font-bold text-[28px] mb-2"
            style={{ 
              color: isLight ? '#00A8CC' : '#00D4FF',
              textShadow: isLight ? 'none' : '0 0 8px rgba(0, 212, 255, 0.3)'
            }}
          >
            {getNoteId() ? '4,636' : '0'}
          </p>
          <p className="font-sans text-[12px] uppercase text-textSub">Total Notes</p>
        </div>

        <div className="mb-4">
           <p className="font-sans text-[12px] uppercase text-textSub mb-1">Monthly Trend:</p>
           {/* Chart Placeholder */}
           <div className="h-[80px] w-full flex items-end opacity-80"
             style={{ 
               filter: isLight ? 'none' : 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.4))'
             }}>
             <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
                   <stop offset="0%" stopColor={isLight ? "#00A8CC" : "#00D4FF"} />
                   <stop offset="100%" stopColor={isLight ? "#17A2B8" : "#1DD9BF"} />
                 </linearGradient>
               </defs>
               <path d="M0,35 Q10,25 20,30 T40,20 T60,10 T80,25 T100,5" fill="none" stroke="url(#chartGrad)" strokeWidth="2" strokeLinecap="round" />
             </svg>
           </div>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div className="flex flex-col">
            <span className="font-sans text-[12px] uppercase text-textSub">Avg. per day</span>
            <span className="font-bold text-[18px]" style={{ color: isLight ? '#00A8CC' : '#00D4FF' }}>470</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-sans text-[12px] uppercase text-textSub">This Month</span>
            <span className="font-bold text-[18px]" style={{ color: isLight ? '#00A8CC' : '#00D4FF' }}>333</span>
          </div>
        </div>

      </div>

    </div>
  );
}
