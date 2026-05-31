import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const schema = yup.object({
  full_name: yup.string().required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .matches(/@gmail\.com$/, 'Only Gmail addresses are allowed')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
}).required();

export default function Register() {
  const { register: registerUser, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  
  const [otpVal, setOtpVal] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (location.state?.showOtpOnly && location.state?.email) {
      setVerificationEmail(location.state.email);
      setShowVerification(true);
    }
  }, [location]);

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

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    const result = await registerUser({
      full_name: data.full_name,
      email: data.email,
      password: data.password
    });
    
    if (result.success) {
      if (result.verificationPending) {
        setVerificationEmail(result.email);
        setShowVerification(true);
        toast.success('Verification code sent to your email!');
      } else {
        navigate('/onboarding');
      }
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

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otpVal.join('');
    if (otpCode.length < 6) {
      setServerError('Please enter the complete 6-digit code.');
      return;
    }
    setIsLoading(true);
    setServerError('');
    const result = await verifyOtp(verificationEmail, otpCode);
    if (result.success) {
      toast.success('Email verified successfully!');
      navigate('/onboarding');
    } else {
      setServerError(result.error);
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setServerError('');
    const result = await resendOtp(verificationEmail);
    if (result.success) {
      setResendCooldown(60);
      toast.success('Verification code resent successfully!');
    } else {
      setServerError(result.error);
    }
  };

  const handleBackToRegister = () => {
    setShowVerification(false);
    setServerError('');
    setOtpVal(['', '', '', '', '', '']);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Left Visual Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 relative overflow-hidden items-center justify-center border-r border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5" />
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-lg p-8"
        >
          <div className="bg-white/85 backdrop-blur-xl border border-slate-200 p-8 rounded-2xl shadow-xl shadow-slate-100/50">
            <h3 className="text-3xl font-extrabold text-slate-900 mb-6 font-syne">Stop Guessing. Start Improving.</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-650 shrink-0 font-bold">1</div>
                <div>
                  <h4 className="text-slate-900 font-bold">Diagnose the Cause</h4>
                  <p className="text-sm text-slate-500 font-medium">Our local ML engine identifies exactly why you were rejected.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 shrink-0 font-bold">2</div>
                <div>
                  <h4 className="text-slate-900 font-bold">Find Pattern Gaps</h4>
                  <p className="text-sm text-slate-500 font-medium">Benchmark your resume against peers who got offers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-fuchsia-50 flex items-center justify-center text-fuchsia-600 shrink-0 font-bold">3</div>
                <div>
                  <h4 className="text-slate-900 font-bold">Auto-Recovery Plan</h4>
                  <p className="text-sm text-slate-500 font-medium">Get a 30-day task-by-task sprint to fix the gaps.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {showVerification ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-syne">
                  Verify your email
                </h2>
                <p className="mt-2 text-sm text-slate-500 font-semibold">
                  We've sent a 6-digit verification code to <span className="font-bold text-violet-600">{verificationEmail}</span>. Please enter it below.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleVerify}>
                {serverError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <span className="text-red-650 text-sm font-semibold">{serverError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 text-center">6-Digit Verification Code</label>
                  <div className="flex justify-between gap-2 my-2">
                    {otpVal.map((data, index) => (
                      <input
                        key={index}
                        type="text"
                        name="otp"
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

                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-violet-600 hover:bg-violet-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-50 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Verify & Login <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0}
                    onClick={handleResend}
                    className="w-full flex justify-center py-3 px-4 border border-slate-200 text-sm font-bold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none transition-all disabled:opacity-50 shadow-sm"
                  >
                    {resendCooldown > 0
                      ? `Resend Code in ${resendCooldown}s`
                      : "Resend Code"}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToRegister}
                    className="w-full text-center text-sm text-slate-500 hover:text-slate-850 font-bold transition-colors pt-2"
                  >
                    Back to Register
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-syne">
                  Create your account
                </h2>
                <p className="mt-2 text-sm text-slate-500 font-semibold">
                  Join thousands of students turning rejections into offers.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {serverError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <span className="text-red-650 text-sm font-semibold">{serverError}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Full Name</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        {...register('full_name')}
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors font-medium text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.full_name && <p className="mt-1 text-sm text-red-500 font-semibold">{errors.full_name.message}</p>}
                  </div>

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

                  <div>
                    <label className="block text-sm font-bold text-slate-700">Confirm Password</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        {...register('confirm_password')}
                        type="password"
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors font-medium text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.confirm_password && <p className="mt-1 text-sm text-red-500 font-semibold">{errors.confirm_password.message}</p>}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-violet-600 hover:bg-violet-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-50 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
                
                <p className="text-center text-sm text-slate-500 font-semibold mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-violet-600 hover:text-violet-750">
                    Sign in
                  </Link>
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
