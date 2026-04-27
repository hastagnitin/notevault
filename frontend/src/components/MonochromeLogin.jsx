import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { signIn, signUp } from '../api/auth';

const MonochromeLogin = ({ onLogin }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const containerRef = useRef(null);

  useEffect(() => {
    // Elegant, smooth entrance animation
    const elements = containerRef.current.querySelectorAll('.reveal-anim');
    gsap.fromTo(elements,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1.2, 
        stagger: 0.15, 
        ease: "power4.out",
        clearProps: "all"
      }
    );
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        const data = await signIn(email, password);
        onLogin(data.user);
      } else {
        const data = await signUp(email, password, { full_name: name });
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
      // Subtle color flash on error, no shaky animations
      gsap.fromTo(containerRef.current, 
        { borderColor: 'rgba(255,100,100,0.5)' },
        { borderColor: 'rgba(255,255,255,0.1)', duration: 1, ease: 'power2.out' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="cinematic-glass p-12 w-full max-w-md relative z-10 flex flex-col items-center"
    >
      <div className="flex flex-col items-center mb-12 reveal-anim">
        <h2 className="text-2xl font-bold text-white mb-2">{mode === 'login' ? 'Welcome Back' : 'Join the Library'}</h2>
        <p className="text-sm text-slate-400">Sync your notes and flashcards.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        {mode === 'signup' && (
          <div className="reveal-anim relative input-wrapper">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mono-input-line"
            />
            <div className="input-focus-line" />
          </div>
        )}

        <div className="reveal-anim relative input-wrapper">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mono-input-line"
          />
          <div className="input-focus-line" />
        </div>

        <div className="reveal-anim relative input-wrapper">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mono-input-line"
          />
          <div className="input-focus-line" />
        </div>

        {error && (
          <div className="reveal-anim text-xs font-semibold text-red-300 text-center bg-red-900/20 py-3 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <div className="reveal-anim pt-4">
          <button
            type="submit"
            disabled={loading}
            className="mono-button mono-button-solid w-full"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            <ChevronRight size={16} />
          </button>
        </div>
      </form>

      <div className="mt-8 pt-8 w-full border-t border-slate-700/50 flex justify-center reveal-anim">
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default MonochromeLogin;
