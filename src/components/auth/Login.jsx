import React, { useState } from 'react';
import { signInWithEmail, signInWithGoogle } from '../../firebase/authService';
import { Mail, Lock, LogIn, Chrome, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Access denied. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-cyan-500/10 mb-6 shadow-2xl shadow-cyan-500/20 border border-cyan-500/20 group">
          <Sparkles className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase mb-2">NoteVault</h1>
        <p className="text-cyan-400/60 text-[10px] tracking-[0.4em] uppercase font-black">Authorized Personnel Only</p>
      </div>

      {/* Card */}
      <div className="premium-glass rounded-[40px] p-10 border border-white/5 bg-white/[0.01]">
        <h2 className="text-xl font-black text-white uppercase tracking-widest mb-8 text-center">Identity Verification</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="email"
              placeholder="NETWORK ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-white/5 bg-white/[0.02] text-white placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-bold tracking-wider"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="password"
              placeholder="ACCESS KEY"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-white/5 bg-white/[0.02] text-white placeholder-gray-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm font-bold tracking-wider"
            />
          </div>

          <div className="flex justify-end">
            <Link to="/auth/reset" className="text-[10px] font-black text-cyan-400/50 hover:text-cyan-400 uppercase tracking-widest transition-colors">
              Access Lost?
            </Link>
          </div>

          {error && (
            <div className="px-5 py-4 rounded-2xl bg-red-500/5 border border-red-500/20">
              <p className="text-red-400 text-[10px] font-black tracking-widest uppercase">
                [SYSTEM_ERR]: {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-cyan-500 text-black font-black text-xs uppercase tracking-[0.25em] transition-all hover:scale-[1.02] hover:bg-cyan-400 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/20"
          >
            {loading ? 'SYNCHRONIZING...' : 'AUTHORIZE'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center gap-6 my-10">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[9px] text-gray-600 font-bold tracking-[0.3em] uppercase">EXTERNAL NODES</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full py-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-white text-xs font-black tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-4 group"
        >
          <Chrome className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          Sign in with Google
        </button>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">
            New Entity? <Link to="/auth/signup" className="text-cyan-400 hover:underline">Request Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
