import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, Clock, X, Loader2, Database, Layers } from 'lucide-react';
import { uploadNote, explainText } from '../api/noteVaultApi';
import { useTheme } from '../context/ThemeContext.jsx';

export default function NotesViewer({ onTextSelect, onNoteUpload, currentNoteId: propNoteId }) {
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
    <div className="flex flex-col h-full gap-6">
      
      {/* Upload Console - Glass Bento */}
      <div className="premium-glass rounded-[32px] p-6 border border-premium bg-surface-lowest/40">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Synchronize Artifacts</h2>
           <Layers className="w-4 h-4 text-text-muted" />
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".txt,.pdf,.docx" className="hidden" />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border-ghost rounded-2xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer bg-surface-low/30 hover:bg-surface-low/50 hover:border-primary/40 group"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[10px] font-black text-primary uppercase tracking-widest">Encrypting Node...</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <p className="text-[11px] font-black text-text-primary uppercase tracking-[0.15em] mb-1">Push to Manifest</p>
              <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest text-center max-w-[200px] leading-relaxed">System supports PDF, DOCX, and YAML/Text clusters</p>
            </>
          )}
        </div>
      </div>

      {/* Main Panel Area - Kinetic Layout */}
      <div className="flex-1 flex flex-col overflow-hidden relative premium-glass rounded-[32px] border border-premium bg-surface-lowest/40 p-8 shadow-2xl" onMouseUp={handleMouseUp}>
        
        {/* Floating Explain Button */}
        {showTooltip && (
          <button 
            onClick={handleExplain}
            disabled={explaining}
            style={{ left: tooltipPos.x, top: tooltipPos.y, transform: 'translate(-50%, 0)' }}
            className="absolute z-20 flex items-center gap-3 px-5 py-3 bg-primary text-surface-lowest rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(208,188,255,0.4)] intelligence-pulse"
          >
            {explaining ? <Loader2 className="w-4 h-4 animate-spin text-surface-lowest" /> : <Sparkles className="w-4 h-4 text-surface-lowest" />}
            {explaining ? 'Processing...' : 'Neural Map'}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-primary" />
          </button>
        )}

        {/* Explanation Overlay */}
        {explanation && (
          <div className="absolute inset-0 z-30 p-10 overflow-y-auto bg-surface-lowest/95 backdrop-blur-2xl border-l-[6px] border-primary animate-in fade-in slide-in-from-right-10 duration-700">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                    <h3 className="font-black text-text-primary text-[11px] tracking-[0.2em] uppercase leading-none">Synthetic Output</h3>
                    <p className="text-[9px] font-bold text-primary/50 uppercase tracking-widest mt-1.5">Intelligence Matrix v4.2</p>
                 </div>
              </div>
              <button 
                onClick={() => setExplanation(null)} 
                className="w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-white/5 text-text-muted hover:text-text-primary transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-10 max-w-2xl mx-auto">
              <div>
                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <div className="w-1 h-3 bg-secondary rounded-full" />
                   Input Fragment
                </p>
                <div className="text-[14px] font-medium text-text-secondary p-8 rounded-3xl bg-surface-container/50 border border-border-ghost italic leading-relaxed">
                  "{selectedTextForExplain}"
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <div className="w-1 h-3 bg-primary rounded-full" />
                   Neural Mapping
                </p>
                <div className="text-[15px] text-text-primary leading-[1.8] p-8 rounded-3xl bg-surface-container/30 border border-border-ghost shadow-inner">
                  {explanation}
                </div>
              </div>
            </div>
            <div className="mt-16 text-[9px] text-center text-text-muted font-bold uppercase tracking-widest">
               Generated by high-manifold convergence protocol
            </div>
          </div>
        )}

        {!hasFile ? (
          <div className="h-full overflow-y-auto w-full no-scrollbar">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-3">
                 <Database className="w-4 h-4 text-primary/40" />
                 Local Data Clusters
               </h3>
               {uploadedFiles.length > 0 && <span className="px-3 py-1 rounded-full bg-primary/10 text-[9px] font-black text-primary uppercase tracking-[0.15em] border border-primary/20">{uploadedFiles.length} Nodes Online</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uploadedFiles.length > 0 ? (
                uploadedFiles.map((file) => (
                  <div key={file.id} className="flex flex-col gap-4 p-6 rounded-[24px] border border-border-ghost bg-surface-container/30 transition-all cursor-pointer group hover:bg-surface-container/60 hover:border-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                        className="p-2 opacity-0 group-hover:opacity-100 transition-all text-text-muted hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/10 group-hover:bg-primary/20 transition-all">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-black text-[13px] text-text-primary tracking-widest uppercase truncate mb-1">{file.name}</p>
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{file.uploadedAt}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                       <div className="w-1 h-3 bg-secondary/40 rounded-full" />
                       <span className="text-[9px] font-black text-secondary/60 uppercase tracking-widest">Knowledge Mapped</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full h-full flex flex-col items-center justify-center opacity-30 py-20">
                   <Clock className="w-16 h-16 mb-6 text-text-muted" />
                   <p className="text-[12px] font-black uppercase tracking-[0.25em] text-text-muted">No Active Data Clusters</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto w-full max-w-2xl mx-auto h-full text-base no-scrollbar text-text-secondary">
            <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-10 leading-[0.9] uppercase font-display">Neural Architecture Overview</h1>
            <p className="text-[18px] leading-[1.8] mb-10 font-medium">
              Machine learning algorithms build a model based on sample data, known as <span className="text-secondary font-bold">training data</span>, in order to make predictions or decisions without being explicitly programmed to do so.
            </p>
            <h2 className="text-[12px] font-black text-primary uppercase tracking-[0.25em] mt-16 mb-8 flex items-center gap-4">
               <div className="w-12 h-[2px] bg-primary/30 rounded-full" />
               Foundational Manifolds
            </h2>
            <p className="text-[18px] leading-[1.8] mb-10 font-medium">
              A core objective of a learner is to <span className="text-text-primary italic font-semibold">generalize from its experience</span>. Generalization in this context is the ability of a learning machine to perform accurately on new, unseen examples/tasks.
            </p>
            <div className="p-10 rounded-[32px] bg-primary/5 border border-primary/10 border-l-[6px] border-l-primary mt-12 mb-12 shadow-inner">
               <p className="text-[15px] font-bold text-primary italic leading-relaxed">
                  Note: Latent space complexity increases exponentially as neural depth increases. Proceed with high-confidence protocols only.
               </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
