import React, { useState, useEffect } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../firebase/authService.js';
import { Sparkles, Mail, Lock, User, LogIn, Chrome, ChevronRight } from 'lucide-react';
import InteractiveWeb from './InteractiveWeb.jsx';

export default function AuthPage() {
  const [mode, setMode]         = useState('login');   // 'login' | 'signup'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  function parseError(err) {
    const msg = err.message || '';
    if (msg.includes('after') && msg.includes('seconds')) {
      const seconds = msg.match(/\d+/)?.[0] || '60';
      setCooldown(parseInt(seconds));
      return `Please wait ${seconds} seconds before trying again.`;
    }
    if (msg.includes('already registered') || msg.includes('already exists')) {
      return 'Account already exists. Try signing in.';
    }
    if (msg.includes('Invalid login')) {
      return 'Invalid credentials. Please try again.';
    }
    return msg || 'Authentication failed.';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (cooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050714] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <InteractiveWeb />
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px]" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/20 mb-4 shadow-lg shadow-cyan-500/20 border border-cyan-500/20">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase">NoteVault</h1>
          <p className="text-cyan-400/60 text-xs tracking-widest uppercase font-bold mt-2">Neural Intelligence System</p>
        </div>

        {/* Card */}
        <div className="premium-glass rounded-[32px] p-10 border border-white/5 bg-white/[0.02]">

          {/* Tab toggle */}
          <div className="flex rounded-2xl bg-white/[0.03] p-1.5 mb-8 border border-white/5">
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  mode === m
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Join Node'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="IDENTITY"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-medium"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="email"
                placeholder="NODE ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-medium"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="password"
                placeholder="ACCESS KEY"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-medium"
              />
            </div>

            {error && (
              <p className="text-cyan-400 text-[10px] font-bold tracking-widest uppercase bg-cyan-400/5 border border-cyan-400/20 rounded-xl px-4 py-3">
                [ERROR]: {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-cyan-400 hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {cooldown > 0 
                ? `RETRY IN ${cooldown}S` 
                : loading 
                  ? 'COMMUNICATING...' 
                  : mode === 'login' 
                    ? 'AUTHORIZE' 
                    : 'INITIALIZE'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">OR EXTERNAL SIGN-IN</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-30 flex items-center justify-center gap-3"
          >
            <Chrome className="w-4 h-4 text-cyan-400" />
            Sign in with Hyperledger
          </button>
        </div>

        <p className="text-center text-[10px] font-bold text-gray-700 tracking-widest uppercase mt-8 leading-relaxed">
          SECURE CONNECTION ESTABLISHED. ALL DATA <br />ENCRYPTED BY EXPERT-LEVEL PROTOCOLS.
        </p>
      </div>
    </div>
  );
}
