import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import InteractiveWeb from './InteractiveWeb.jsx';
import Login from './auth/Login.jsx';
import SignUp from './auth/SignUp.jsx';
import PasswordReset from './auth/PasswordReset.jsx';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#050714] text-white flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Animated Background Element */}
      <InteractiveWeb />
      
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-cyan-500/[0.07] rounded-full blur-[160px] animate-pulse-slow" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] bg-teal-500/[0.07] rounded-full blur-[180px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Auth Routes */}
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="reset" element={<PasswordReset />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>

      {/* Security Footer */}
      <div className="fixed bottom-10 left-0 right-0 pointer-events-none">
        <div className="flex flex-col items-center gap-2 opacity-20">
          <div className="flex gap-4">
            <div className="w-12 h-px bg-white/20" />
            <span className="text-[8px] font-black tracking-[0.5em] uppercase">AES-256 ENCRYPTION ACTIVE</span>
            <div className="w-12 h-px bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
