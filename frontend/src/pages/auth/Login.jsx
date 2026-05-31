import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .matches(/@gmail\.com$/, 'Only Gmail addresses are allowed')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
}).required();

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationLink, setShowVerificationLink] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    setShowVerificationLink(false);
    
    const result = await login(data.email, data.password);
    if (result.success) {
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

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight font-syne">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Enter your Gmail address to access RejectionIQ.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-2">
                <span className="text-red-650 text-sm font-semibold">{serverError}</span>
                {showVerificationLink && (
                  <button
                    type="button"
                    onClick={() => navigate('/register', { state: { email: unverifiedEmail, showOtpOnly: true } })}
                    className="text-violet-650 hover:text-violet-850 text-xs font-bold underline text-left mt-1"
                  >
                    Click here to enter your verification code and verify your email.
                  </button>
                )}
              </div>
            )}
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
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-slate-50 transition-all disabled:opacity-50 shadow-sm"
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
            
            <p className="text-center text-sm text-slate-500 font-semibold mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-violet-600 hover:text-violet-750">
                Register
              </Link>
            </p>
          </form>
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
