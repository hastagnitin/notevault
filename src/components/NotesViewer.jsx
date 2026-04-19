import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, Clock, X, Loader2, Database, Layers } from 'lucide-react';
import { uploadNote, explainText } from '../api/noteVaultApi';
import { useTheme } from '../context/ThemeContext.jsx';

export default function NotesViewer({ onTextSelect, onNoteUpload, currentNoteId: propNoteId }) {
  const { theme } = useTheme();
  
  const [hasFile, setHasFile] = useState(() => !!localStorage.getItem('nv_current_note_id'));
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [uploading, setUploading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(() => localStorage.getItem('nv_current_note_id'));
  const [explanation, setExplanation] = useState(null);
  const [selectedTextForExplain, setSelectedTextForExplain] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const saved = localStorage.getItem('nv_uploaded_files');
    return saved ? JSON.parse(saved) : [];
  });
  const fileInputRef = useRef(null);

  const removeFile = (fileId) => {
    const updated = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updated);
    localStorage.setItem('nv_uploaded_files', JSON.stringify(updated));
    if (currentNoteId === fileId) {
      setCurrentNoteId(null);
      setHasFile(false);
      localStorage.removeItem('nv_current_note_id');
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
    const selection = window.getSelection();
    const text = selection?.toString();
    const activeNoteId = currentNoteId || propNoteId;
    if (!text || !activeNoteId) return;
    
    setShowTooltip(false);
    setSelectedTextForExplain(text);
    setExplaining(true);
    
    try {
      const result = await explainText(activeNoteId, text);
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
      setCurrentNoteId(newNoteId);
      setHasFile(true);
      const newFile = { id: newNoteId, name: file.name, uploadedAt: new Date().toLocaleString() };
      const updatedFiles = [newFile, ...uploadedFiles].slice(0, 10);
      setUploadedFiles(updatedFiles);
      localStorage.setItem('nv_uploaded_files', JSON.stringify(updatedFiles));
      localStorage.setItem('nv_current_note_id', newNoteId);
      if (onNoteUpload) onNoteUpload(newNoteId);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-5">
      
      {/* Upload Console */}
      <div className="premium-glass rounded-[24px] p-6 border border-white/5 bg-white/[0.01]">
        <div className="flex items-center justify-between mb-5">
           <h2 className="text-[10px] font-black tracking-[0.2em] text-cyan-400 uppercase">Synchronize Artifacts</h2>
           <Layers className="w-3.5 h-3.5 text-gray-700" />
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".txt,.pdf,.docx" className="hidden" />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] hover:border-cyan-500/30 group"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Encrypting...</p>
            </div>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 mb-4 text-cyan-500 transition-transform group-hover:scale-110" />
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">Push to Manifest</p>
              <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">PDF, DOCX, TXT accepted</p>
            </>
          )}
        </div>
      </div>

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative premium-glass rounded-[24px] border border-white/5 bg-white/[0.01] p-6" onMouseUp={handleMouseUp}>
        
        {/* Floating Explain Button */}
        {showTooltip && (
          <button 
            onClick={handleExplain}
            disabled={explaining}
            style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translate(-50%, 0)' }}
            className="absolute z-20 flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-cyan-500/20"
          >
            {explaining ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-black" />}
            {explaining ? 'Processing...' : 'Neural Map'}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-cyan-500" />
          </button>
        )}

        {/* Explanation Overlay */}
        {explanation && (
          <div className="absolute inset-0 z-30 p-8 overflow-y-auto bg-black border-l-4 border-cyan-500 animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                 </div>
                 <h3 className="font-black text-white text-[10px] tracking-[0.2em] uppercase">Synthetic Intelligence Explanation</h3>
              </div>
              <button 
                onClick={() => setExplanation(null)} 
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-500 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-[9px] font-black text-cyan-400/50 uppercase tracking-[0.2em] mb-3">Input Fragment:</p>
                <div className="text-[13px] font-medium text-gray-400 p-6 rounded-2xl bg-white/[0.03] border border-white/5 italic">
                  "{selectedTextForExplain}"
                </div>
              </div>
              
              <div>
                <p className="text-[9px] font-black text-cyan-400/50 uppercase tracking-[0.2em] mb-3">Neural Output:</p>
                <div className="text-[14px] text-gray-200 leading-relaxed p-6 rounded-2xl bg-white/[0.03] border border-white/5 shadow-inner">
                  {explanation}
                </div>
              </div>
            </div>
            <div className="mt-12 text-[9px] text-center text-gray-700 font-bold uppercase tracking-widest">
               Generated by high-manifold convergence protocol
            </div>
          </div>
        )}

        {!hasFile ? (
          <div className="h-full overflow-y-auto w-full no-scrollbar">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Database className="w-3.5 h-3.5" />
                 Local Data Clusters
               </h3>
               {uploadedFiles.length > 0 && <span className="text-[10px] font-bold text-cyan-400/50">{uploadedFiles.length} Nodes</span>}
            </div>

            <div className="space-y-4">
              {uploadedFiles.length > 0 ? (
                uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] transition-all cursor-pointer group hover:bg-white/[0.05] hover:border-cyan-500/20">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/10 group-hover:bg-cyan-500/20 transition-all">
                      <FileText className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-[12px] text-white tracking-widest uppercase truncate">{file.name}</p>
                      <p className="text-[9px] font-bold text-gray-600 uppercase mt-1 tracking-widest">{file.uploadedAt}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                      className="p-2 opacity-0 group-hover:opacity-100 transition-all text-gray-700 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                   <Clock className="w-12 h-12 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cluster Empty</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto w-full max-w-2xl mx-auto h-full text-base no-scrollbar text-gray-300">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-8 leading-tight">THE ARCHITECTURE OF INTELLIGENCE</h1>
            <p className="text-[16px] leading-[1.8] mb-8 font-medium">
              Machine learning algorithms build a model based on sample data, known as <span className="text-cyan-400">training data</span>, in order to make predictions or decisions without being explicitly programmed to do so.
            </p>
            <h2 className="text-[12px] font-black text-cyan-400 uppercase tracking-[0.2em] mt-12 mb-6 flex items-center gap-3">
               <div className="w-8 h-[1px] bg-cyan-500/50" />
               Foundational Manifolds
            </h2>
            <p className="text-[16px] leading-[1.8] mb-8 font-medium">
              A core objective of a learner is to <span className="text-white italic">generalize from its experience</span>. Generalization in this context is the ability of a learning machine to perform accurately on new, unseen examples/tasks after having experienced a learning data set. 
            </p>
            <div className="p-8 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 border-l-4 border-l-cyan-500 mt-12 mb-12">
               <p className="text-[14px] font-bold text-cyan-400 italic">
                  Note: Latent space complexity increases exponentially as neural depth increases.
               </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
