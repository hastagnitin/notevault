import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Sparkles, Brain, Zap, Shield, ChevronRight } from 'lucide-react';
import InteractiveWeb from './InteractiveWeb.jsx';

const PremiumShowcase = () => {
  const containerRef = useRef(null);
  const heroTextRef = useRef(null);
  const cardContainerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1 } });
      tl.from(heroTextRef.current.children, { y: 100, opacity: 0, stagger: 0.1 })
        .from(imageRef.current, { scale: 1.2, opacity: 0, duration: 1.5 }, "-=0.8")
        .from(".feature-card", { y: 50, opacity: 0, stagger: 0.2, duration: 0.8 }, "-=1");

      gsap.to(imageRef.current, { y: -20, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const features = [
    { title: "AI Intelligence", desc: "Powered by Claude & Gemini for deep contextual understanding.", icon: <Brain className="w-6 h-6" /> },
    { title: "Lightning Fast", desc: "Optimized retrieval with Pinecone and Supabase integration.", icon: <Zap className="w-6 h-6" /> },
    { title: "Military Grade", desc: "End-to-end encryption for all your private study notes.", icon: <Shield className="w-6 h-6" /> }
  ];

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden relative force-obsidian">
      <InteractiveWeb />
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-teal-500/10 rounded-full blur-[180px]" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/40">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white uppercase">NoteVault</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-cyan-400">Workspace</a>
          <a href="#" className="hover:text-cyan-400">Intelligence</a>
          <a href="#" className="hover:text-cyan-400">Vault</a>
        </div>
        <button className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-all text-sm shadow-lg shadow-white/10">
          Enter Vault
        </button>
      </nav>

      <main className="container mx-auto px-6 pt-40 min-h-screen flex flex-col md:flex-row items-center gap-12 relative z-10">
        <div ref={heroTextRef} className="flex-1 space-y-8 z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase">
            v2.0 Experience Live
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-tight text-white">
            THINK <br />
            <span className="text-cyan-400">BEYOND</span> <br />
            NOTES.
          </h1>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            NoteVault is a high-dimensional learning engine that evolves with your consciousness.
          </p>
          <div className="flex gap-4 pt-4">
            <button className="px-10 py-5 bg-cyan-500 text-black font-black rounded-2xl flex items-center gap-2 hover:bg-cyan-400 hover:scale-105 transition-all shadow-xl shadow-cyan-500/20">
              INITIALIZE SYSTEM <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-[120px] opacity-30" />
          <img 
            ref={imageRef}
            src="/hero_abstract.png" 
            alt="Intelligence Hub" 
            className="relative z-10 w-full max-w-md mx-auto rounded-[40px] shadow-2xl shadow-cyan-500/20 border border-white/10"
          />
        </div>
      </main>

      <section className="container mx-auto px-6 py-32 bg-transparent relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" ref={cardContainerRef}>
          {features.map((f, i) => (
            <div key={i} className="feature-card p-10 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.05] transition-all group">
              <div className="mb-6 p-4 rounded-2xl bg-cyan-500/10 w-fit text-cyan-400 group-hover:bg-cyan-500/20 transition-all">
                {f.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">{f.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-64" /> {/* Spacer for bottom scroll */}
    </div>
  );
};

export default PremiumShowcase;
