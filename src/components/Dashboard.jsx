import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../api/noteVaultApi';
import { 
  FileText, Clock, RefreshCw, BarChart3, 
  MessageSquare, Calendar, Sparkles, ChevronRight,
  TrendingUp, Users, Database, Globe
} from 'lucide-react';
import gsap from 'gsap';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentNotes, setRecentNotes] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, notesRes, discRes] = await Promise.all([
          fetch(`${BASE_URL}/dashboard/user/stats`),
          fetch(`${BASE_URL}/dashboard/notes/recent`),
          fetch(`${BASE_URL}/discussions/active`)
        ]);
        const statsData = await statsRes.json();
        const notesData = await notesRes.json();
        const discData = await discRes.json();

        setStats(statsData);
        setRecentNotes(notesData.recent || []);
        setDiscussions(discData.discussions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return null; // Let the parent skeleton handle it

  return (
    <div className="flex-1 p-10 space-y-12 animate-fade-in overflow-hidden">
      
      {/* Precision Header */}
      <div className="flex items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-cyan-400 tracking-[0.4em] uppercase">Sector: Dashboard</p>
          <h1 className="text-5xl font-light text-white tracking-tighter">
            Intelligence <span className="font-medium text-white/40">Hub</span>
          </h1>
        </div>
        <div className="flex items-center gap-8 text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-2">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#10B981]" />
              Sync Active
           </div>
           <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" /> Node: Primary-Alpha
           </div>
        </div>
      </div>

      {/* Metrics Row - Minimalist & Sleek */}
      <div className="grid grid-cols-4 gap-12">
        {[
          { label: 'Total Archives', value: stats?.totalNotes || '0', icon: FileText },
          { label: 'Neural Uplink', value: stats?.totalStudyHours || '0', icon: Clock },
          { label: 'Synchronized', value: stats?.filesSynced || '0', icon: RefreshCw },
          { label: 'Aptitude Avg', value: stats?.avgQuizScore ? `${stats.avgQuizScore}%` : '0%', icon: TrendingUp },
        ].map((m, i) => (
          <div key={i} className="space-y-4 group">
             <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                {m.label}
                <m.icon className="w-3 h-3 text-cyan-500/40 group-hover:text-cyan-400 transition-colors" />
             </div>
             <p className="text-4xl font-light text-white tracking-tighter group-hover:text-cyan-400 transition-all">{m.value}</p>
             <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-cyan-500/20 group-hover:w-full transition-all duration-700" />
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-16 pt-10">
        {/* Main Activity */}
        <div className="col-span-8 space-y-10">
           <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white tracking-[0.2em] uppercase">Recent Sequence</h2>
              <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Full Directory →</button>
           </div>
           
           <div className="space-y-1">
             {recentNotes.length > 0 ? recentNotes.map((note) => (
               <div key={note.id} className="group flex items-center justify-between py-6 border-b border-white/[0.03] hover:bg-white/[0.01] transition-all px-4 rounded-xl -mx-4 cursor-pointer">
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono text-gray-700">0{note.id}</span>
                    <h4 className="text-sm font-medium text-white/80 group-hover:text-cyan-400 transition-colors tracking-tight">{note.title}</h4>
                  </div>
                  <div className="flex items-center gap-12">
                     <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{note.fileType}</span>
                     <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{new Date(note.createdAt).toLocaleDateString()}</span>
                     <ChevronRight className="w-4 h-4 text-gray-800 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
               </div>
             )) : (
               <div className="py-20 border border-dashed border-white/5 rounded-3xl flex flex-col items-center opacity-30">
                  <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Knowledge Input</p>
               </div>
             )}
           </div>
        </div>

        {/* Intelligence Snippet */}
        <div className="col-span-4 space-y-10">
           <h2 className="text-xs font-bold text-white tracking-[0.2em] uppercase">Intelligence Node</h2>
           <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-all">
                 <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Chanakya Insight</p>
                <p className="text-sm text-gray-400 leading-relaxed font-light italic">
                  "Your retention across <span className="text-white">Neural Networks</span> has spiked. Tactical review suggested in 4 hours."
                </p>
              </div>
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                   <span className="text-gray-500">Learning Index</span>
                   <span className="text-white">Optimum</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-teal-400" />
                </div>
              </div>
           </div>

           <div className="p-8 rounded-[32px] bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/30 transition-all cursor-pointer group">
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Active Study Room</p>
              <h3 className="text-lg font-medium text-white tracking-tight mb-4">Physics Optimization II</h3>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-black bg-gray-800" />)}
                </div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Join Sequence →</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
