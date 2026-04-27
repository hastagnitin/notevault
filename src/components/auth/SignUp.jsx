import React, { useState } from 'react';
import { signUpWithEmail, signInWithGoogle } from '../../firebase/authService';
import { Mail, Lock, User, UserPlus, Chrome, ChevronRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Access keys do not match.');
    }
    if (!terms) {
      return setError('Accept terminal protocols to proceed.');
    }
    
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Initialization failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-teal-500/10 mb-6 shadow-2xl shadow-teal-500/20 border border-teal-500/20 group">
          <UserPlus className="w-10 h-10 text-teal-400 group-hover:scale-110 transition-transform duration-500" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase mb-2">Initialize</h1>
        <p className="text-teal-400/60 text-[10px] tracking-[0.4em] uppercase font-black">Provision New Intelligence Node</p>
      </div>

      <div className="premium-glass rounded-[40px] p-10 border border-white/5 bg-white/[0.01]">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-teal-400 transition-colors" />
            <input
              type="text"
              placeholder="ENTITY DESIGNATION"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full pl-14 pr-6 py-4 rounded-xl border border-white/5 bg-white/[0.02] text-white placeholder-gray-700 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all text-sm font-bold tracking-wider"
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-teal-400 transition-colors" />
            <input
              type="email"
              placeholder="NETWORK ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-14 pr-6 py-4 rounded-xl border border-white/5 bg-white/[0.02] text-white placeholder-gray-700 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all text-sm font-bold tracking-wider"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-teal-400 transition-colors" />
            <input
              type="password"
              placeholder="ACCESS KEY"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-14 pr-6 py-4 rounded-xl border border-white/5 bg-white/[0.02] text-white placeholder-gray-700 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all text-sm font-bold tracking-wider"
            />
          </div>

          <div className="relative group">
            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-teal-400 transition-colors" />
            <input
              type="password"
              placeholder="CONFIRM KEY"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-14 pr-6 py-4 rounded-xl border border-white/5 bg-white/[0.02] text-white placeholder-gray-700 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all text-sm font-bold tracking-wider"
            />
          </div>

          <div className="flex items-start gap-3 px-2 py-2">
            <input 
              type="checkbox" 
              id="terms" 
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-teal-500 focus:ring-teal-500/50" 
            />
            <label htmlFor="terms" className="text-[10px] text-gray-500 font-medium leading-tight">
              I AGREE TO THE <span className="text-teal-400/80">NEURAL PROTOCOLS</span> AND DATA SOVEREIGNTY TERMS.
            </label>
          </div>

          {error && (
            <div className="px-5 py-3 rounded-xl bg-red-500/5 border border-red-500/20">
              <p className="text-red-400 text-[10px] font-black tracking-widest uppercase">
                [INIT_ERR]: {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-teal-500 text-black font-black text-xs uppercase tracking-[0.25em] transition-all hover:scale-[1.02] hover:bg-teal-400 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl shadow-teal-500/20"
          >
            {loading ? 'INITIALIZING...' : 'START PROTOCOL'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-gray-600 font-bold tracking-widest uppercase">
            Existing Entity? <Link to="/auth/login" className="text-teal-400 hover:underline">Revive Session</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
