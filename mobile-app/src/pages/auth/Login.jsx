import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, Zap, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const { login, requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showVerifyLink, setShowVerifyLink] = useState(false);

  // OTP specific states
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateGmail = (emailStr) => {
    const clean = (emailStr || '').trim().toLowerCase();
    if (!clean) {
      return 'Gmail address is required.';
    }
    if (!clean.endsWith('@gmail.com')) {
      return 'Only valid Gmail addresses (@gmail.com) are allowed.';
    }
    return '';
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setShowVerifyLink(false);

    const emailErr = validateGmail(email);
    if (emailErr) {
      setErrorMsg(emailErr);
      return;
    }

    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), password);
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

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    const emailErr = validateGmail(email);
    if (emailErr) {
      setErrorMsg(emailErr);
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestOtp(email.trim().toLowerCase());
      if (result.success) {
        setOtpSent(true);
        setResendCooldown(60);
        toast.success('Verification code sent to your Gmail address!');
      } else {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setErrorMsg('Failed to send OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otpVal];
    newOtp[index] = element.value;
    setOtpVal(newOtp);
    
    // Auto focus next input
    if (element.value !== '' && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otpVal[index] === '' && index > 0) {
        otpRefs.current[index - 1].focus();
      }
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otpVal.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await verifyOtp(email.trim().toLowerCase(), code);
      if (result.success) {
        toast.success('Successfully logged in! 👋');
        navigate('/dashboard');
      } else {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setErrorMsg('OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-8 bg-slate-50/50 min-h-screen">
      
      {/* Top Welcome Title */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 mb-3">
          <Zap size={24} color="#fff" fill="#fff" />
        </div>
        <h2 className="text-xl font-black text-slate-900 font-syne">Welcome back</h2>
        <p className="text-slate-400 text-xs font-bold mt-1 max-w-[250px]">
          Enter your Gmail address to access your diagnostic career suite.
        </p>
      </div>

      {/* Main Login Form Card */}
      <div className="bg-white border border-slate-100/80 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] mt-4">
        
        {/* Auth Mode Toggle Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'password'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Lock size={13} /> Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'otp'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <KeyRound size={13} /> OTP Code
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold flex flex-col gap-1.5 animate-scale-in mb-4">
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

        {authMode === 'password' ? (
          /* Password Login Mode */
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            
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
              <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Password (Min 8 chars)</label>
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
              className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 hover:from-brand-700 hover:to-brand-600 transition-all cursor-pointer disabled:opacity-50 mt-4"
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
        ) : (
          /* OTP Login Mode */
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 hover:from-brand-700 hover:to-brand-600 transition-all cursor-pointer disabled:opacity-50 mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider">
                      Send OTP Code <ArrowRight size={14} />
                    </span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-2xl text-[11px] font-bold text-brand-700 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-brand-600 shrink-0" />
                  <span>OTP sent to <strong>{email}</strong></span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <div className="flex justify-between gap-1.5 my-2">
                    {otpVal.map((data, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength="1"
                        ref={(el) => (otpRefs.current[index] = el)}
                        value={data}
                        onChange={(e) => handleOtpChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onFocus={(e) => e.target.select()}
                        className="w-10 h-12 text-center text-lg font-black border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 hover:from-brand-700 hover:to-brand-600 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider">
                        Verify & Sign In <ArrowRight size={14} />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleSendOtp}
                    className="w-full flex justify-center py-2.5 text-[11px] font-bold rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpVal(['', '', '', '', '', '']);
                      setErrorMsg('');
                    }}
                    className="w-full text-center text-[10px] text-slate-400 hover:text-slate-700 font-extrabold transition-colors pt-1 cursor-pointer"
                  >
                    Change Email Address
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>

      {/* Footer Register Link */}
      <div className="text-center mt-4">
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
