import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext.jsx';

const textArray = [
  'NOTEVAULT', 'INNOVATION', 'KNOWLEDGE', 'FLOW', 'CREATE', 'INSPIRE',
  'DYNAMIC', 'DIGITAL', 'FUTURE', 'SMART', 'CONNECT', 'IMAGINE',
  'EVOLVE', 'DESIGN', 'BUILD', 'DREAM', 'ACCELERATE', 'TRANSFORM',
  'AMPLIFY', 'CULTIVATE', 'GENERATE', 'SPARK', 'MOMENTUM', 'VISION'
];

export default function GSAPBackground() {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use a flag to stop the spawning loop when component unmounts
    let isActive = true;

    function spawner() {
      if (!isActive) return;
      
      const text = textArray[Math.floor(Math.random() * textArray.length)];
      const element = document.createElement('div');
      
      element.className = 'text-flow absolute whitespace-nowrap pointer-events-none uppercase';
      // Inline visual style matching the specs
      element.style.fontFamily = '"Courier New", "Fira Code", monospace';
      element.style.fontSize = '14px';
      element.style.fontWeight = '500';
      element.style.letterSpacing = '2px';
      // Colors are handled by inherited context or custom properties
      element.style.color = theme === 'light' ? '#00A8CC' : '#00D4FF';
      element.style.textShadow = theme === 'dark' ? '0 0 8px rgba(0,212,255,0.4)' : 'none';
      
      element.textContent = text;
      element.style.top = Math.random() * 100 + 'vh';
      element.style.left = '100vw'; // start hidden on right
      // Opacity starts slightly randomized to feel organic, but governed by container
      element.style.opacity = '1';
      
      container.appendChild(element);
      
      const duration = 8 + Math.random() * 12;
      
      gsap.to(element, {
        duration: duration,
        x: '-200vw', // Move past the left edge relative to its start position
        opacity: 0,
        ease: 'none',
        onComplete: () => {
          if (element.parentNode) element.remove();
        }
      });
    }

    // Initial batch
    for (let i = 0; i < 5; i++) {
      setTimeout(spawner, i * 300);
    }
    
    // Continuous spawning every 1.5s
    const interval = setInterval(spawner, 1500);

    return () => {
      isActive = false;
      clearInterval(interval);
      // Clean up children
      if (container) {
          container.innerHTML = '';
      }
    };
  }, [theme]); // Re-run if theme changes to update color, or handle via CSS variables.

  return (
    <div 
      id="textBg" 
      ref={containerRef}
      className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-opacity duration-400`}
      style={{
        opacity: theme === 'light' ? 0.08 : 0.12,
      }}
    />
  );
}
