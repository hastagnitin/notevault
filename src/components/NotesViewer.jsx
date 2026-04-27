import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileText, Sparkles, Clock, X, 
  Loader2, Database, Layers, Search, Trash2, 
  FileCode, FileImage, ExternalLink
} from 'lucide-react';
import { uploadNote, explainText, BASE_URL } from '../api/noteVaultApi';
import gsap from 'gsap';

export default function NotesViewer({ onTextSelect, onNoteUpload, currentNoteId: propNoteId }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [selectedTextForExplain, setSelectedTextForExplain] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const saved = localStorage.getItem('nv_uploaded_files');
    return saved ? JSON.parse(saved) : [];
  });
  const fileInputRef = useRef(null);

  // Auto-load current note if propNoteId changes
  useEffect(() => {
    if (propNoteId) {
      fetchNote(propNoteId);
    }
  }, [propNoteId]);

  async function fetchNote(id) {
    try {
      const res = await fetch(`${BASE_URL}/notes/${id}`);
      const data = await res.json();
      setCurrentNote(data);
    } catch (err) {
      console.error('Failed to fetch note:', err);
    }
  }

  const removeFile = async (e, fileId) => {
    e.stopPropagation();
    try {
      await fetch(`${BASE_URL}/notes/${fileId}`, { method: 'DELETE' });
      const updated = uploadedFiles.filter(f => f.id !== fileId);
      setUploadedFiles(updated);
      localStorage.setItem('nv_uploaded_files', JSON.stringify(updated));
      if (currentNote?.id === fileId) {
        setCurrentNote(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleMouseUp = (e) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const viewerRect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({
        x: rect.left - viewerRect.left + (rect.width / 2),
        y: rect.top - viewerRect.top - 40,
      });
      setShowTooltip(true);
      onTextSelect(selection.toString());
    } else {
      setShowTooltip(false);
      onTextSelect('');
    }
  };

  const handleExplain = async () => {
    const text = window.getSelection()?.toString();
    if (!text || !currentNote) return;
    
    setShowTooltip(false);
    setSelectedTextForExplain(text);
    setExplaining(true);
    
    try {
      const result = await explainText(currentNote.id, text);
      setExplanation(result.explanation || result.answer || 'No explanation generated');
    } catch (err) {
      setExplanation('Error: ' + err.message);
    } finally {
      setExplaining(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadNote(file, file.name);
      const newNoteId = result.id || result.noteId;
      const newFile = { 
        id: newNoteId, 
        name: file.name, 
        type: file.type,
        size: (file.size / 1024 / 1024).toFixed(1) + 'MB',
        uploadedAt: new Date().toLocaleString() 
      };
      
      const updatedFiles = [newFile, ...uploadedFiles];
      setUploadedFiles(updatedFiles);
      localStorage.setItem('nv_uploaded_files', JSON.stringify(updatedFiles));
      
      await fetchNote(newNoteId);
      if (onNoteUpload) onNoteUpload(newNoteId);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = uploadedFiles.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* Upload Console */}
      <div className="premium-glass rounded-[32px] p-6 border border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between mb-5 px-2">
           <h2 className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">Synchronize Artifacts</h2>
           <Layers className="w-3.5 h-3.5 text-cyan-500/50" />
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".txt,.pdf,.docx,.png,.jpg" className="hidden" />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/30 group relative overflow-hidden"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Encrypting Packet...</p>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <UploadCloud className="w-10 h-10 mb-4 text-cyan-500 transition-transform group-hover:-translate-y-1" />
              <p className="text-[11px] font-black text-white uppercase tracking-[0.25em] mb-1">Upload to Knowledge Base</p>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Supports PDF, DOCX, TXT, Images</p>
            </>
          )}
        </div>
      </div>

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative premium-glass rounded-[40px] border border-white/5 bg-white/[0.01] p-8" onMouseUp={handleMouseUp}>
        
        {!currentNote ? (
          <div className="h-full flex flex-col no-scrollbar">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Knowledge Base</h3>
               </div>
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
                  <input 
                    type="text" 
                    placeholder="FILTER NODES..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-bold text-white placeholder-gray-700 focus:outline-none focus:border-cyan-500/30 transition-all uppercase tracking-widest"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <div 
                    key={file.id} 
                    onClick={() => fetchNote(file.id)}
                    className="flex items-center gap-5 p-5 rounded-3xl border border-white/5 bg-white/[0.02] transition-all cursor-pointer group hover:bg-white/[0.06] hover:border-cyan-500/20"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 flex items-center justify-center border border-cyan-500/10 group-hover:bg-cyan-500/10 transition-all">
                      {file.type?.includes('pdf') ? <FileText className="w-7 h-7 text-cyan-400" /> : 
                       file.type?.includes('image') ? <FileImage className="w-7 h-7 text-teal-400" /> :
                       <FileCode className="w-7 h-7 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[13px] text-white tracking-widest uppercase truncate">{file.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{file.uploadedAt}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-800" />
                        <span className="text-[9px] font-black text-cyan-400/60 uppercase tracking-widest">{file.size || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={(e) => removeFile(e, file.id)}
                        className="p-3 rounded-xl hover:bg-red-500/10 text-gray-700 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-cyan-400 transition-all" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                   <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center mb-6">
                      <Database className="w-8 h-8 text-gray-500" />
                   </div>
                   <p className="text-[11px] font-black uppercase tracking-[0.3em]">Knowledge Cluster Empty</p>
                   <p className="text-[9px] font-bold uppercase tracking-widest mt-2">Initialize synchronization to begin</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col no-scrollbar">
            {/* Note Header */}
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentNote(null)} className="p-2 hover:bg-white/5 rounded-xl transition-all text-gray-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-black text-white uppercase tracking-tighter">{currentNote.title}</h1>
                  <p className="text-[9px] font-black text-cyan-400/60 uppercase tracking-widest mt-1">Status: Active Archive Node</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white hover:bg-white/[0.08] transition-all uppercase tracking-widest flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" /> Source
                </button>
                <div className="w-px h-6 bg-white/5 mx-2" />
                <Layers className="w-5 h-5 text-gray-700" />
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-y-auto pr-4 no-scrollbar">
              <div className="prose prose-invert max-w-none">
                <div className="text-[17px] leading-[1.8] text-gray-300 font-medium whitespace-pre-wrap selection:bg-cyan-500/30">
                  {currentNote.content}
                </div>
              </div>
            </div>

            {/* Floating Explain Button */}
            {showTooltip && (
              <button 
                onClick={handleExplain}
                disabled={explaining}
                style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translate(-50%, -100%)' }}
                className="absolute z-20 flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-cyan-500/40"
              >
                {explaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {explaining ? 'Mapping...' : 'Neural Map'}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-cyan-500" />
              </button>
            )}

            {/* Explanation Overlay */}
            {explanation && (
              <div className="absolute inset-x-8 bottom-8 top-24 z-30 p-10 overflow-y-auto premium-glass rounded-[40px] border border-cyan-500/30 bg-black/90 animate-in fade-in zoom-in-95 duration-300 shadow-2xl shadow-cyan-500/10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                     </div>
                     <div>
                        <h3 className="font-black text-white text-[11px] tracking-[0.25em] uppercase">Synthetic Intelligence Node</h3>
                        <p className="text-[8px] font-bold text-cyan-400/50 uppercase tracking-widest mt-1">High-manifold convergence protocol</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setExplanation(null)} 
                    className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-10">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 rounded-full bg-cyan-400/30" />
                      <p className="text-[10px] font-black text-cyan-400/50 uppercase tracking-[0.2em]">Source Fragment</p>
                    </div>
                    <div className="text-[14px] font-medium text-gray-400 p-8 rounded-[32px] bg-white/[0.02] border border-white/5 italic leading-relaxed">
                      "{selectedTextForExplain}"
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Semantic Expansion</p>
                    </div>
                    <div className="text-[16px] text-gray-200 leading-[1.8] p-8 rounded-[32px] bg-white/[0.04] border border-white/5 shadow-inner selection:bg-cyan-500/30">
                      {explanation}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
