import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Download, AlertCircle } from 'lucide-react';

const NoteViewer = ({ noteId, onSelectText }) => {
  const [zoom, setZoom] = useState(100);
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!noteId) return;
    setIsLoading(true);
    fetch(`http://localhost:5000/api/notes/${noteId}`)
      .then(res => res.json())
      .then(data => {
        setNote(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load note:", err);
        setIsLoading(false);
      });
  }, [noteId]);

  const displayContent = note?.content || 'No content available.';
  const displayTitle = note?.title || 'Loading...';

  const handleMouseUp = () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 5) {
      onSelectText(selection);
    }
  };

  return (
    <div className="h-full flex flex-col cinematic-glass rounded-3xl overflow-hidden premium-surface">
      <div className="h-14 border-b border-white/[0.05] flex items-center justify-between px-6">
        <h2 className="text-sm font-semibold text-slate-200">{displayTitle}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 border border-white/[0.02]">
            <button className="p-1.5 hover:bg-white/[0.1] rounded-md transition text-slate-400 hover:text-white" onClick={() => setZoom(Math.max(50, zoom - 10))}>
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-mono text-slate-300 w-12 text-center">{zoom}%</span>
            <button className="p-1.5 hover:bg-white/[0.1] rounded-md transition text-slate-400 hover:text-white" onClick={() => setZoom(Math.min(200, zoom + 10))}>
              <ZoomIn size={16} />
            </button>
          </div>
          <button className="p-2 hover:bg-white/[0.05] rounded-lg transition text-slate-400 hover:text-white">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-[#0a0f18] flex justify-center">
        <div 
          className="bg-slate-900 border border-slate-700/50 shadow-2xl p-10 min-h-[1000px] text-slate-300 whitespace-pre-wrap font-sans text-sm outline-none"
          style={{ width: `${zoom}%`, maxWidth: '800px', transition: 'width 0.2s ease' }}
          onMouseUp={handleMouseUp}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-slate-500 h-64">
               <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
               Loading your note...
            </div>
          ) : (
            displayContent
          )}
        </div>
      </div>
      
      <div className="h-8 bg-black/40 flex items-center px-4 gap-2 text-[10px] text-slate-500 uppercase tracking-widest border-t border-white/[0.02]">
        <AlertCircle size={12} /> Highlight any text to instantly explain it with AI.
      </div>
    </div>
  );
};

export default NoteViewer;
