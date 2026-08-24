import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Register() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Verification States
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  // Check if unverified redirect from login
  useEffect(() => {
    if (location.state?.showOtpOnly && location.state?.email) {
      setVerificationEmail(location.state.email);
      setShowVerification(true);
    }
  }, [location]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName) return setErrorMsg('Full name is required.');
    if (!email) return setErrorMsg('Gmail address is required.');
    if (!email.toLowerCase().trim().endsWith('@gmail.com')) return setErrorMsg('Only valid Gmail addresses (@gmail.com) are allowed.');
    if (!password) return setErrorMsg('Password is required.');
    if (password.length < 8) return setErrorMsg('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setErrorMsg('Passwords do not match.');

    setIsLoading(true);
    try {
      const result = await register({
        full_name: fullName,
        email,
        password
      });

      if (result.success) {
        if (result.verificationPending) {
          setVerificationEmail(result.email);
          setShowVerification(true);
          toast.success('Verification code sent! Check your inbox.');
        } else {
          toast.success('Account created! Welcome.');
          navigate('/onboarding');
        }
      } else {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setErrorMsg('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otpVal];
    newOtp[index] = element.value;
    setOtpVal(newOtp);

    // Auto-focus next input
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

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const otpCode = otpVal.join('');

    if (otpCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(verificationEmail, otpCode);
      if (result.success) {
        toast.success('Email verified successfully! 🎉');
        navigate('/onboarding');
      } else {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setErrorMsg('Verification failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');

    try {
      const result = await resendOtp(verificationEmail);
      if (result.success) {
        setResendCooldown(60);
        toast.success('Verification code resent!');
      } else {
        setErrorMsg(result.error);
      }
    } catch (err) {
      setErrorMsg('Failed to resend code.');
    }
  };

  const handleBackToRegister = () => {
    setShowVerification(false);
    setErrorMsg('');
    setOtpVal(['', '', '', '', '', '']);
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-6 bg-slate-50/50 min-h-screen">
      
      {showVerification ? (
        /* OTP Verification Screen */
        <div className="flex-grow flex flex-col justify-between">
          <div className="mt-4">
            <button 
              onClick={handleBackToRegister}
              className="flex items-center gap-1 text-[11px] font-black text-brand-600 uppercase tracking-widest cursor-pointer hover:text-brand-700 active:scale-95"
            >
              <ArrowLeft size={13} /> Back to Register
            </button>
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-black text-slate-900 font-syne">Verify email</h2>
              <p className="text-slate-400 text-xs font-bold mt-1.5 px-4 leading-relaxed">
                Enter the 6-digit code sent to <br />
                <span className="font-extrabold text-brand-500">{verificationEmail}</span>
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-100/80 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] mt-8">
            <form onSubmit={handleVerify} className="space-y-6">
              
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold animate-scale-in">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">6-Digit Verification Code</label>
                <div className="flex justify-between gap-1.5 py-2">
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
                      className="w-10.5 h-13 text-center text-lg font-black border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3 mt-8">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider">
                      Verify & Login <ArrowRight size={14} />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={handleResend}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl font-extrabold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

            </form>
          </div>
          <div className="h-10" />
        </div>
      ) : (
        /* Normal Register Screen */
        <div className="flex-grow flex flex-col justify-between">
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-black text-slate-900 font-syne">Create Account</h2>
            <p className="text-slate-400 text-xs font-bold mt-1">
              Join thousands of developers tracking career rebounds.
            </p>
          </div>

          <div className="bg-white border border-slate-100/80 rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] mt-5">
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold animate-scale-in">
                  {errorMsg}
                </div>
              )}

              {/* Name */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={15} />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10.5 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Gmail Address</label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10.5 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Password</label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10.5 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Confirm Password</label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10.5 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider">
                    Sign Up <ArrowRight size={14} />
                  </span>
                )}
              </button>

            </form>
          </div>

          {/* Sign In Redirect */}
          <div className="text-center mt-5">
            <p className="text-slate-400 text-[11px] font-bold">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-brand-500 hover:text-brand-600 underline">
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
      )}
      
    </div>
  );
}
