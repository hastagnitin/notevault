import React, { useState } from 'react';
import { auth } from '../../firebase/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, RefreshCw, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Key recovery failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-purple-500/10 mb-6 shadow-2xl shadow-purple-500/20 border border-purple-500/20 group">
          <RefreshCw className={`w-10 h-10 text-purple-400 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase mb-2">Recovery</h1>
        <p className="text-purple-400/60 text-[10px] tracking-[0.4em] uppercase font-black">Re-access Neural Archive</p>
      </div>

      <div className="premium-glass rounded-[40px] p-10 border border-white/5 bg-white/[0.01]">
        {sent ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Signal Transmitted</h3>
            <p className="text-sm text-gray-500 font-medium">Check your network address for recovery instructions.</p>
            <Link to="/auth/login" className="inline-block w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02]">
              Return to Port
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-[11px] text-gray-500 font-medium text-center uppercase tracking-widest leading-relaxed">
              Enter your network address to receive <br />a new cryptographic access secondary key.
            </p>

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="email"
                placeholder="NETWORK ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-14 pr-6 py-5 rounded-2xl border border-white/5 bg-white/[0.02] text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm font-bold tracking-wider"
              />
            </div>

            {error && (
              <div className="px-5 py-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                <p className="text-red-400 text-[10px] font-black tracking-widest uppercase">
                  [RECOVERY_ERR]: {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-purple-600 text-white font-black text-xs uppercase tracking-[0.25em] transition-all hover:scale-[1.02] hover:bg-purple-500 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20"
            >
              {loading ? 'TRANSMITTING...' : 'RECOVER ACCESS'}
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="text-center mt-6">
              <Link to="/auth/login" className="text-[10px] text-gray-600 hover:text-white font-bold tracking-widest uppercase transition-colors">
                Abat Recovery
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
