import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Sparkles, Brain, Zap, Shield, ChevronRight, Menu, X } from 'lucide-react';
import InteractiveWeb from './InteractiveWeb.jsx';
import { signInWithGoogle } from '../firebase/authService';

const PremiumShowcase = () => {
  const containerRef = useRef(null);
  const heroTextRef = useRef(null);
  const cardContainerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
      tl.from(".nav-anim", { y: -20, opacity: 0, stagger: 0.1 })
        .from(heroTextRef.current.children, { x: -100, opacity: 0, stagger: 0.15 }, "-=0.5")
        .from(imageRef.current, { scale: 0.8, opacity: 0, duration: 1.5 }, "-=1")
        .from(".feature-card", { y: 60, opacity: 0, stagger: 0.2, duration: 1 }, "-=1.2");

      gsap.to(imageRef.current, { 
        y: -15, 
        rotationZ: 2,
        duration: 3, 
        repeat: -1, 
        yoyo: true, 
        ease: "sine.inOut" 
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const features = [
    { title: "Chanakya Intelligence", desc: "Native Gemini 1.5 Flash integration for high-rigor semantic synthesis.", icon: <Brain className="w-6 h-6" /> },
    { title: "Neural Synchronization", desc: "Real-time edge processing for your entire knowledge manifest.", icon: <Zap className="w-6 h-6" /> },
    { title: "Encrypted Vault", desc: "Zero-knowledge architecture ensuring your study data remains private.", icon: <Shield className="w-6 h-6" /> }
  ];

  const handleEnterVault = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Auth Protocol Error:", err);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050714] text-white overflow-x-hidden relative font-inter">
      <InteractiveWeb />
      
      {/* Background Ambience */}
      <div className="absolute top-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[60vw] h-[60vw] bg-teal-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Responsive Navigation */}
      <nav className="fixed top-0 w-full z-50 p-6 md:px-12 flex justify-between items-center bg-black/40 backdrop-blur-xl border-b border-white/5 nav-anim">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-400/20">
            <Sparkles className="text-black w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">NoteVault</span>
        </div>
        
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          <a href="#" className="hover:text-cyan-400 transition-colors">Workspace</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Intelligence</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Vault</a>
        </div>

        <button 
          onClick={handleEnterVault}
          className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-cyan-400 hover:scale-105 transition-all shadow-2xl shadow-white/5"
        >
          Enter Vault
        </button>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-48 md:pt-64 pb-20 flex flex-col lg:flex-row items-center gap-20 relative z-10">
        <div ref={heroTextRef} className="flex-1 space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 text-[10px] font-black tracking-[0.3em] uppercase mx-auto lg:mx-0">
             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
             v2.4 Neural Release
          </div>
          <h1 className="text-6xl md:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] uppercase selection:bg-cyan-500/30">
            Evolution <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-500">of Mind.</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-xl leading-relaxed font-medium mx-auto lg:mx-0">
            NoteVault is a decentralized intelligence console designed to synchronize your consciousness with your knowledge manifest.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-6 justify-center lg:justify-start">
            <button 
              onClick={handleEnterVault}
              className="px-12 py-6 bg-cyan-500 text-black font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-cyan-400 hover:scale-105 transition-all shadow-2xl shadow-cyan-500/20 uppercase tracking-[0.2em] text-xs"
            >
              Enter Workspace <ChevronRight className="w-6 h-6" />
            </button>
            <button className="px-12 py-6 bg-white/5 text-white border border-white/10 font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-xs backdrop-blur-md">
              Review Whitepaper
            </button>
          </div>
        </div>

        <div className="flex-1 relative w-full max-w-2xl">
          <div className="absolute inset-0 bg-cyan-500/10 blur-[120px] opacity-40 rounded-full" />
          <div className="relative z-10 p-4 rounded-[60px] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl">
            <img 
              ref={imageRef}
              src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1000" 
              alt="Neural Interface" 
              className="w-full h-auto rounded-[45px] opacity-80 mix-blend-screen"
            />
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-40 bg-transparent relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10" ref={cardContainerRef}>
          {features.map((f, i) => (
            <div key={i} className="feature-card p-12 rounded-[40px] bg-white/[0.02] border border-white/5 backdrop-blur-2xl hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all group overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all" />
              <div className="mb-10 p-5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 w-fit text-cyan-400 group-hover:scale-110 transition-all group-hover:bg-cyan-500/10 shadow-2xl">
                {f.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="py-20 border-t border-white/5 bg-black/20 text-center">
         <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.5em]">Antigravity Protocol © 2026</p>
      </footer>
    </div>
  );
};

export default PremiumShowcase;
