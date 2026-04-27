import React, { useState } from 'react';
import { 
  FileText, Download, Printer, Copy, 
  Sparkles, FileCode, CheckCircle, Loader2,
  Settings, Layout, Type, Palette
} from 'lucide-react';
import { BASE_URL } from '../api/noteVaultApi';

export default function CheatSheetGenerator({ noteId }) {
  const [loading, setLoading] = useState(false);
  const [cheatsheet, setCheatsheet] = useState(null);
  const [options, setOptions] = useState({
    format: 'pdf',
    layout: '2-column',
    fontSize: 'medium',
    theme: 'dark'
  });

  const generate = async () => {
    if (!noteId) return alert('Select a knowledge node first.');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/cheatsheet/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId })
      });
      const data = await res.json();
      if (data.success) {
        setCheatsheet(data.cheatsheet);
      } else {
        alert(data.error || 'Generation failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Cheat Sheet Protocol</h2>
          <p className="text-cyan-400/60 font-black text-[10px] uppercase tracking-widest mt-1">High-density knowledge extraction</p>
        </div>
        {!cheatsheet && (
          <button 
            onClick={generate}
            disabled={loading}
            className="px-8 py-4 bg-cyan-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-30 flex items-center gap-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Synthesizing...' : 'Generate Master Sheet'}
          </button>
        )}
      </div>

      {!cheatsheet ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="premium-glass rounded-[40px] p-10 border border-white/5 bg-white/[0.01]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Settings className="w-4 h-4 text-cyan-400" /> Configuration
            </h3>
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 block">Layout Architecture</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Single Column', '2-Column Grid'].map((opt) => (
                    <button 
                      key={opt}
                      onClick={() => setOptions({ ...options, layout: opt === 'Single Column' ? '1-column' : '2-column' })}
                      className={`p-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                        (options.layout === '1-column' && opt === 'Single Column') || (options.layout === '2-column' && opt === '2-Column Grid')
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white' 
                        : 'bg-white/[0.02] border-white/5 text-gray-600 hover:border-white/10'
                      }`}
                    >
                      <Layout className="w-4 h-4 mb-2 mx-auto" />
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 block">Density Level</label>
                <div className="flex gap-4">
                  {['Small', 'Medium', 'Large'].map((size) => (
                    <button 
                      key={size}
                      onClick={() => setOptions({ ...options, fontSize: size.toLowerCase() })}
                      className={`flex-1 py-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                        options.fontSize === size.toLowerCase()
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-white' 
                        : 'bg-white/[0.02] border-white/5 text-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="premium-glass rounded-[40px] p-10 border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-gray-700" />
            </div>
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-relaxed mb-10 max-w-sm">
              Synthesize a professional study sheet <br />optimized for rapid recall.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end gap-3">
            <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-white transition-all group">
              <Printer className="w-4 h-4 group-hover:text-cyan-400" />
            </button>
            <button className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] text-white transition-all group">
              <Download className="w-4 h-4 group-hover:text-teal-400" />
            </button>
            <button onClick={() => setCheatsheet(null)} className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/[0.08]">
              New Protocol
            </button>
          </div>
          
          <div className={`premium-glass rounded-[40px] p-12 border border-white/10 bg-black/40 shadow-2xl ${options.layout === '2-column' ? 'columns-2 gap-12' : ''}`}>
             <div className="inline-block break-inside-avoid w-full">
                <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                   <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                   </div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Master Cheat Sheet</h2>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">
                  {cheatsheet}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
