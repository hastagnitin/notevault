import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import MonochromeLogin from './MonochromeLogin';

const AuthDrawer = ({ isOpen, onClose, onLogin }) => {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.6,
        ease: "power3.out"
      });
      gsap.to(panelRef.current, {
        x: "0%",
        duration: 0.8,
        ease: "power4.out"
      });
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.6,
        ease: "power3.in"
      });
      gsap.to(panelRef.current, {
        x: "100%",
        duration: 0.6,
        ease: "power4.in"
      });
    }
  }, [isOpen]);

  return (
    <>
      {/* Dim overlay */}
      <div 
        ref={overlayRef}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm pointer-events-none opacity-0"
      />

      {/* Sliding Panel */}
      <div 
        ref={panelRef}
        className="fixed top-0 right-0 h-full w-full sm:w-[500px] z-50 bg-[#050505] border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col transform translate-x-full"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 z-20"
        >
          ✕
        </button>
        
        {/* Removed excessive padding so MonochromeLogin can take full width naturally */}
        <div className="flex-1 w-full flex items-center justify-center p-4">
            <MonochromeLogin onLogin={onLogin} />
        </div>
      </div>
    </>
  );
};

export default AuthDrawer;
