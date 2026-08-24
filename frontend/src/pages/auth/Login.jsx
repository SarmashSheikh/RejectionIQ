import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .test('is-gmail', 'Only valid Gmail addresses (@gmail.com) are allowed', (value) =>
      !value || value.toLowerCase().trim().endsWith('@gmail.com')
    )
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
}).required();

export default function Login() {
  const { login, requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  
  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationLink, setShowVerificationLink] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  
  // OTP mode specific states
  const [otpEmail, setOtpEmail] = useState('');
  const [otpEmailError, setOtpEmailError] = useState('');
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

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    setShowVerificationLink(false);
    
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(data.email);
        setShowVerificationLink(true);
        setServerError('Your email has not been verified yet.');
      } else {
        setServerError(result.error);
      }
    }
    setIsLoading(false);
  };

  const validateGmail = (emailStr) => {
    const clean = (emailStr || '').trim().toLowerCase();
    if (!clean) {
      return 'Gmail address is required';
    }
    if (!clean.endsWith('@gmail.com')) {
      return 'Only valid Gmail addresses (@gmail.com) are allowed';
    }
    return '';
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setServerError('');
    setOtpEmailError('');
    
    const err = validateGmail(otpEmail);
    if (err) {
      setOtpEmailError(err);
      return;
    }
    
    setIsLoading(true);
    const result = await requestOtp(otpEmail.trim().toLowerCase());
    if (result.success) {
      setOtpSent(true);
      setResendCooldown(60);
      toast.success('Verification code sent to your Gmail address!');
    } else {
      setServerError(result.error);
    }
    setIsLoading(false);
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otpVal];
    newOtp[index] = element.value;
    setOtpVal(newOtp);
    
    // Auto focus next
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
      setServerError('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setServerError('');
    const result = await verifyOtp(otpEmail.trim().toLowerCase(), code);
    if (result.success) {
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } else {
      setServerError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-syne">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Access your diagnostic career suite with RejectionIQ.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setServerError('');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 ${
                authMode === 'password'
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setServerError('');
              }}
              className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 ${
                authMode === 'otp'
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" /> Sign in with OTP
            </button>
          </div>

          {serverError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-2 animate-fadeIn">
              <span className="text-red-600 text-sm font-semibold">{serverError}</span>
              {showVerificationLink && (
                <button
                  type="button"
                  onClick={() => navigate('/register', { state: { email: unverifiedEmail, showOtpOnly: true } })}
                  className="text-violet-600 hover:text-violet-800 text-xs font-bold underline text-left mt-1"
                >
                  Click here to enter your verification code and verify your email.
                </button>
              )}
            </div>
          )}

          {authMode === 'password' ? (
            /* Password Login Form */
            <form className="space-y-6" onSubmit={handleSubmit(onPasswordSubmit)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700">Gmail Address</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors font-medium text-sm"
                      placeholder="you@gmail.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500 font-semibold">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700">Password</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      {...register('password')}
                      type="password"
                      className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors font-medium text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-500 font-semibold">{errors.password.message}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-bold text-violet-600 hover:text-violet-750 transition-colors">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* OTP Login Form */
            <div className="space-y-6">
              {!otpSent ? (
                <form className="space-y-4" onSubmit={handleSendOtp}>
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Gmail Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={otpEmail}
                        onChange={(e) => {
                          setOtpEmail(e.target.value);
                          setOtpEmailError('');
                        }}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors font-medium text-sm"
                        placeholder="you@gmail.com"
                      />
                    </div>
                    {otpEmailError && <p className="mt-1 text-sm text-red-500 font-semibold">{otpEmailError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Send OTP Code <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleVerifyOtpSubmit}>
                  <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg text-xs font-semibold text-violet-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0" />
                    <span>OTP sent to <strong>{otpEmail}</strong></span>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 text-center">
                      Enter 6-Digit OTP Code
                    </label>
                    <div className="flex justify-between gap-2 my-2">
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
                          className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-lg bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Verify & Sign In <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isLoading}
                      onClick={handleSendOtp}
                      className="w-full flex justify-center py-2.5 px-4 border border-slate-200 text-xs font-bold rounded-lg text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpVal(['', '', '', '', '', '']);
                        setServerError('');
                      }}
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors pt-1 cursor-pointer"
                    >
                      Change Email Address
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-sm text-slate-500 font-semibold mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-violet-600 hover:text-violet-750">
              Register
            </Link>
          </p>
        </div>
      </div>

      {/* Right Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 relative overflow-hidden items-center justify-center border-l border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg p-8"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 p-8 rounded-2xl shadow-xl shadow-slate-100/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-50 text-violet-600 mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4 font-syne">Intelligence Driven Insights</h3>
            <p className="text-slate-500 font-medium mb-6">
              Diagnose exactly why you were rejected, identify your skill gaps, and get a personalized 30-day recovery plan to land your next offer.
            </p>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-slate-700 text-sm font-semibold">Pattern Detected: ATS Filter</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-700 text-sm font-semibold">Recovery Plan: Ready</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
