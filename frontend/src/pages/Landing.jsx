import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

// Minimalist, elegant animated Open Book SVG
const AcademicLogo = ({ svgRef }) => (
  <svg 
    ref={svgRef}
    width="80" 
    height="80" 
    viewBox="0 0 100 100" 
    fill="none" 
    className="mb-8"
  >
    {/* Left Page */}
    <path 
      className="logo-path"
      d="M20 30 Q 35 25, 50 40 L 50 85 Q 35 70, 20 75 Z" 
      stroke="url(#goldGradient)" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(255,255,255,0.02)"
    />
    {/* Right Page */}
    <path 
      className="logo-path"
      d="M80 30 Q 65 25, 50 40 L 50 85 Q 65 70, 80 75 Z" 
      stroke="url(#goldGradient)" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(255,255,255,0.02)"
    />
    {/* Center Spine */}
    <line 
      className="logo-core"
      x1="50" y1="40" x2="50" y2="85" 
      stroke="rgba(255,255,255,0.8)" 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    {/* Pen / Bookmark Element */}
    <path
      className="logo-inner-path"
      d="M50 20 L55 30 L50 40 L45 30 Z"
      fill="rgba(212, 175, 55, 0.4)"
      stroke="#D4AF37"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.3" />
      </linearGradient>
    </defs>
  </svg>
);

const Landing = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  
  const logoRef = useRef(null);
  const quoteRef = useRef(null);
  const authorRef = useRef(null);
  const buttonRef = useRef(null);
  const watermarkRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      // Watermark slow scale and fade
      tl.fromTo(watermarkRef.current,
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 4, ease: "power2.out" }
      );

      // Elegant Drawing Animation
      gsap.fromTo(".logo-path", 
        { strokeDasharray: "200", strokeDashoffset: "200", opacity: 0 },
        { strokeDashoffset: "0", opacity: 1, duration: 2.5, ease: "power3.inOut", stagger: 0.2 }
      );
      gsap.fromTo(".logo-core", 
        { scaleY: 0, transformOrigin: "bottom" },
        { scaleY: 1, opacity: 1, duration: 1.5, delay: 1.2, ease: "back.out(1.5)" }
      );
      gsap.fromTo(".logo-inner-path", 
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, delay: 1.5, ease: "power3.out" }
      );

      // Content Stagger
      tl.fromTo(logoRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 2 },
          "-=3.5"
        )
        .fromTo(quoteRef.current, 
          { y: 30, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 2 },
          "-=1.5"
        )
        .fromTo(authorRef.current, 
          { opacity: 0 }, 
          { opacity: 1, duration: 2 }, 
          "-=1.2"
        )
        .fromTo(buttonRef.current, 
          { y: 20, opacity: 0, filter: "blur(5px)" }, 
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 2 }, 
          "-=1.0"
        );

      // Corner Labels Fade
      gsap.fromTo(".hud-element", 
        { opacity: 0 }, 
        { opacity: 1, duration: 3, stagger: 0.3, delay: 1.5 }
      );
    }, containerRef); 

    return () => ctx.revert(); 
  }, []);

  const handleAccess = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => navigate('/dashboard')
    });
  };

  return (
    <div 
      ref={containerRef}
      className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden"
    >
      {/* Massive Background Watermark */}
      <div 
        ref={watermarkRef}
        className="display-huge absolute top-1/2 left-[50%] -translate-x-[50%] -translate-y-[50%] z-0"
      >
        LIBRARY
      </div>

      {/* Elegant Academic Corner Labels */}
      <div className="hud-element absolute top-10 left-10 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase hidden md:block">
        NoteVault <span className="text-slate-400 font-normal ml-2">Digital Atelier</span>
      </div>
      <div className="hud-element absolute top-10 right-10 text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase text-right hidden md:block flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] inline-block mb-0.5 animate-pulse" /> Focus Mode Ready
      </div>
      <div className="hud-element absolute bottom-10 left-10 text-[10px] tracking-widest text-slate-600 uppercase hidden md:block">
        Curated Knowledge • Distraction Free
      </div>

      {/* Main Content Payload */}
      <div className="relative z-20 flex flex-col items-center gap-10 max-w-3xl px-4">
        
        <div ref={logoRef} className="flex flex-col items-center">
          <AcademicLogo />
        </div>

        <div className="flex flex-col items-center gap-10">
          <h1 
            ref={quoteRef} 
            className="text-4xl md:text-5xl lg:text-6xl text-slate-100 leading-[1.2] font-medium italic"
            style={{ textWrap: 'balance', fontFamily: 'var(--font-quote)' }}
          >
            A dedicated space for deep focus. Master concepts, organize your notes, and compound your knowledge.
          </h1>
          <div className="w-[1px] h-16 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>

        <button 
          ref={buttonRef}
          onClick={handleAccess}
          className="mono-button mono-button-solid border border-slate-700 mt-6 shadow-[0_0_40px_rgba(255,255,255,0.05)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]"
        >
          <span>Open Dashboard</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
        </button>

      </div>
    </div>
  );
};

export default Landing;
