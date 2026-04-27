import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AuthCard = ({ children }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    
    // Entrance Animation
    gsap.fromTo(card,
      { opacity: 0, scale: 0.95, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power4.out", delay: 0.2 }
    );

    // Mouse Parallax
    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / 25;
      const y = (e.clientY - rect.top - rect.height / 2) / 25;

      gsap.to(card, {
        rotationY: x,
        rotationX: -y,
        transformPerspective: 1000,
        duration: 0.6,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className="premium-glass relative w-full max-w-md rounded-[32px] p-8 lg:p-12 overflow-hidden hairline-border"
    >
      {/* Internal Glitchy Scanning Line */}
      <div className="scan-line" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/20 rounded-tl-[32px]" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/20 rounded-tr-[32px]" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/20 rounded-bl-[32px]" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/20 rounded-br-[32px]" />
    </div>
  );
};

export default AuthCard;
