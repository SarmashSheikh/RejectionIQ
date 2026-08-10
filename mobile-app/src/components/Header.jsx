import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <header className="bg-white border-b border-slate-50 px-5 py-3.5 flex items-center justify-between shadow-xs z-20 select-none shrink-0">
      {/* Brand Logo */}
      <div className="flex items-center gap-2" onClick={() => navigate('/dashboard')}>
        <div className="w-8 h-8 bg-gradient-to-tr from-brand-600 to-brand-500 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20 active:scale-95 transition-transform cursor-pointer">
          <Zap size={14} color="#fff" fill="#fff" />
        </div>
        <span className="font-extrabold text-[15px] tracking-tight font-syne text-slate-800">
          Rejection<span className="text-brand-500">IQ</span>
        </span>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer active:scale-90">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {/* User Avatar Circle */}
        <button 
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 text-brand-600 font-extrabold text-xs flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
        >
          {userInitial}
        </button>
      </div>
    </header>
  );
}
