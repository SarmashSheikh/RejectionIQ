import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showVerifyLink, setShowVerifyLink] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setShowVerifyLink(false);

    // Gmail checks
    if (!email) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome to RejectionIQ! 👋');
        navigate('/dashboard');
      } else {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          setShowVerifyLink(true);
          setErrorMsg('Your email has not been verified yet.');
        } else {
          setErrorMsg(result.error);
        }
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 bg-slate-50/50 min-h-screen">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col items-center text-center mt-6">
        <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 mb-4">
          <Zap size={28} color="#fff" fill="#fff" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-syne">Welcome back</h2>
        <p className="text-slate-400 text-xs font-bold mt-1 max-w-[250px]">
          Enter your Gmail address to access your diagnostic career suite.
        </p>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-white border border-slate-100/80 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] mt-6">
        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold flex flex-col gap-1.5 animate-scale-in">
              <span>{errorMsg}</span>
              {showVerifyLink && (
                <button
                  type="button"
                  onClick={() => navigate('/register', { state: { email, showOtpOnly: true } })}
                  className="text-brand-600 hover:text-brand-700 text-[10px] font-black underline text-left cursor-pointer"
                >
                  Enter your 6-digit OTP code to verify now.
                </button>
              )}
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Gmail Address</label>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10.5 pr-3 py-3 border border-slate-200 bg-slate-50/50 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Password</label>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10.5 pr-3 py-3 border border-slate-200 bg-slate-50/50 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link 
              to="/forgot-password" 
              className="text-[10px] font-extrabold text-brand-500 hover:text-brand-600 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 hover:from-brand-700 hover:to-brand-600 transition-all cursor-pointer disabled:opacity-50 mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider">
                Sign In <ArrowRight size={14} />
              </span>
            )}
          </button>

        </form>
      </div>

      {/* Footer Register Link */}
      <div className="text-center mt-6">
        <p className="text-slate-400 text-[11px] font-bold">
          Don't have an account?{' '}
          <Link to="/register" className="font-extrabold text-brand-500 hover:text-brand-600 underline">
            Register Here
          </Link>
        </p>
      </div>

    </div>
  );
}
