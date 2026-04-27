import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width, height;
    const motes = [];
    const numMotes = 60; 

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initMotes();
    };

    const initMotes = () => {
      motes.length = 0;
      for (let i = 0; i < numMotes; i++) {
        motes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3 + 0.5,
          vx: (Math.random() - 0.5) * 0.1,
          vy: -Math.random() * 0.2 - 0.05, // Slowly drift upwards
          alpha: Math.random() * 0.5 + 0.1,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulseOffset: Math.random() * Math.PI * 2
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const time = Date.now();

      motes.forEach(p => {
        // Update positions
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries smoothly
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Create a subtle pulsing effect
        const currentAlpha = p.alpha + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        // Add a soft glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(240, 248, 255, ${Math.max(0, currentAlpha)})`;
        ctx.fillStyle = `rgba(240, 248, 255, ${Math.max(0, currentAlpha * 0.6)})`;
        
        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#0A0D14] overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
      <div className="vignette-overlay" />
    </div>
  );
};

export default Background;
