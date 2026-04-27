import React, { useState } from 'react';
import { 
  Target, CheckCircle2, XCircle, ChevronRight, 
  RefreshCw, Award, Brain, Timer, HelpCircle,
  Sparkles, Loader2
} from 'lucide-react';
import { BASE_URL } from '../api/noteVaultApi';

export default function QuizGenerator({ noteId }) {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerState, setAnswerState] = useState(null); // 'correct', 'incorrect', null

  const startQuiz = async () => {
    if (!noteId) return alert('Identify a knowledge node first.');
    setLoading(true);
    setQuiz(null);
    setShowResults(false);
    setCurrentQuestion(0);
    setScore(0);
    try {
      const res = await fetch(`${BASE_URL}/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, questionCount: 5 })
      });
      const data = await res.json();
      if (data.success) {
        setQuiz(data.questions);
      } else {
        alert(data.error || 'Initialization failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (opt) => {
    if (answerState) return;
    setSelectedOption(opt);
    const correct = quiz[currentQuestion].correctAnswer;
    const isCorrect = opt === correct || opt[0] === correct;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setAnswerState('correct');
    } else {
      setAnswerState('incorrect');
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < quiz.length) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setAnswerState(null);
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-20 text-center">
        <div className="w-24 h-24 rounded-[32px] bg-purple-500/10 flex items-center justify-center mb-8 relative">
           <Brain className="w-10 h-10 text-purple-400 animate-pulse" />
           <div className="absolute inset-0 border-2 border-purple-500/20 rounded-[32px] animate-ping" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2">Synthesizing Evaluation</h2>
        <p className="text-[10px] text-purple-400/60 font-black uppercase tracking-[0.4em]">Constructing MCQ Protocol...</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="premium-glass rounded-[40px] p-12 text-center animate-fade-in border border-white/5">
        <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
           <Award className="w-12 h-12 text-amber-400" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Evaluation Complete</h2>
        <div className="text-6xl font-black text-cyan-400 mb-8 tracking-tighter">
           {Math.round((score / quiz.length) * 100)}%
        </div>
        <div className="flex justify-center gap-12 mb-12">
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Score</p>
              <p className="text-xl font-black text-white">{score} / {quiz.length}</p>
           </div>
           <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Proficiency</p>
              <p className="text-xl font-black text-white">{score >= 4 ? 'Master' : score >= 3 ? 'Adept' : 'Initiate'}</p>
           </div>
        </div>
        <button 
          onClick={startQuiz}
          className="px-10 py-5 bg-cyan-500 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-cyan-500/20 flex items-center gap-3 mx-auto"
        >
          <RefreshCw className="w-4 h-4" /> Restart Protocol
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="premium-glass rounded-[40px] p-20 flex flex-col items-center justify-center text-center border border-white/5 bg-white/[0.01]">
        <div className="w-20 h-20 rounded-[28px] bg-purple-500/10 flex items-center justify-center mb-8 border border-purple-500/20">
          <HelpCircle className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Neural Evaluation</h2>
        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-10 max-w-sm">
          Test your comprehension mastery through an AI-generated cognitive challenge.
        </p>
        <button 
          onClick={startQuiz}
          className="px-10 py-5 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-500 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-purple-500/20 flex items-center gap-3"
        >
          <Target className="w-4 h-4" /> Initialize Quiz
        </button>
      </div>
    );
  }

  const q = quiz[currentQuestion];

  return (
    <div className="space-y-8 animate-fade-in h-auto">
      {/* Progress */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-5">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Query {currentQuestion + 1} / {quiz.length}</span>
            <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden">
               <div 
                className="h-full bg-purple-500 transition-all duration-500" 
                style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }} 
              />
            </div>
         </div>
         <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
            <Timer className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-[10px] font-black text-white tracking-widest">EST. 4M REMAINING</span>
         </div>
      </div>

      {/* Question Card */}
      <div className="premium-glass rounded-[40px] p-10 border border-white/5 bg-white/[0.01]">
        <h3 className="text-xl font-black text-white leading-relaxed mb-10 selection:bg-purple-500/20">
           {q.question}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {q.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = selectedOption === opt || selectedOption === letter;
            const isCorrect = q.correctAnswer === letter || q.correctAnswer === opt;
            
            let statusClasses = "bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/[0.05] hover:border-white/10";
            if (answerState) {
              if (isSelected) {
                statusClasses = answerState === 'correct' 
                  ? "bg-green-500/10 border-green-500/50 text-green-400" 
                  : "bg-red-500/10 border-red-500/50 text-red-400";
              } else if (isCorrect) {
                 statusClasses = "bg-green-500/5 border-green-500/20 text-green-500/60";
              } else {
                 statusClasses = "bg-white/[0.01] border-white/5 text-gray-700 opacity-40";
              }
            }

            return (
              <button 
                key={i}
                onClick={() => handleOptionSelect(opt)}
                disabled={!!answerState}
                className={`flex items-center gap-6 p-6 rounded-3xl border transition-all text-left group ${statusClasses}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors shrink-0 ${
                  isSelected ? 'bg-current text-black' : 'bg-white/5 text-gray-500'
                }`}>
                  {letter}
                </div>
                <span className="text-[15px] font-bold flex-1">{opt}</span>
                {answerState && isSelected && (
                  answerState === 'correct' ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />
                )}
              </button>
            );
          })}
        </div>

        {answerState && (
          <div className="mt-10 p-8 rounded-3xl bg-white/[0.02] border border-white/5 animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Chanakya Insight</span>
             </div>
             <p className="text-sm text-gray-400 font-medium leading-relaxed">
               {q.explanation}
             </p>
             <button 
              onClick={nextQuestion}
              className="mt-8 px-8 py-3.5 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
               Proceed to next node <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
