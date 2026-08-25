import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  KeyRound, Sparkles, Trash2, Shield, Loader2, Save, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AccessSecurity() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    weekly_reports: true,
    auto_sprint: true
  });

  const togglePreference = (key) => {
    setPreferences(prev => {
      const val = !prev[key];
      toast.success("Platform preference updated! ⚙️");
      return { ...prev, [key]: val };
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.put('/auth/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      toast.success("Access credentials updated successfully! 🔒");
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await api.delete('/auth/account');
      toast.success('Account purged permanently.');
      logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-10">

        {/* 🌟 Header Banner */}
        <div className="bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-3xl overflow-hidden mb-8 relative">
          <div className="h-36 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 relative flex items-center p-8 overflow-hidden select-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent opacity-60" />
            <div className="relative text-white z-10 flex items-center gap-3">
              <Shield className="w-6 h-6 text-yellow-300" />
              <div>
                <span className="text-[10px] tracking-widest uppercase font-extrabold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                  Security Hub
                </span>
                <h1 className="text-2xl font-extrabold mt-1">Access & Security Settings</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Space */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* Change Password Block */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm shadow-slate-100/50">
            <h3 className="text-base font-extrabold mb-6 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
              <KeyRound size={18} className="text-violet-600" /> 
              Modify Access Credentials
            </h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                  value={passwordForm.current_password}
                  onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                  value={passwordForm.new_password}
                  onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                  value={passwordForm.confirm_password}
                  onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  required
                />
              </div>
              <button
                disabled={loading}
                className="w-full mt-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-xs shadow-sm cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={14} /> : 'Update Access Credentials'}
              </button>
            </form>
          </div>

          {/* Platform Preferences & AI Automations */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm shadow-slate-100/50">
            <h3 className="text-base font-extrabold mb-6 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
              <Sparkles size={18} className="text-violet-650" /> 
              Platform Preferences & AI Automations
            </h3>
            
            <div className="space-y-4 max-w-xl">
              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-0.5">Sprint Reminders</h4>
                  <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                    Receive daily email alerts and pushes when sprint recovery tasks are due.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => togglePreference('email_notifications')}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${preferences.email_notifications ? 'bg-violet-600 justify-end' : 'bg-slate-300 justify-start'}`}
                >
                  <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-sm" />
                </button>
              </div>

              {/* Weekly Progress Reports Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-0.5">Linguistic Audit Digests</h4>
                  <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                    Get weekly compiled summaries of spaCy vocabulary insights and sentiment tone metrics.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => togglePreference('weekly_reports')}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${preferences.weekly_reports ? 'bg-violet-600 justify-end' : 'bg-slate-300 justify-start'}`}
                >
                  <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-sm" />
                </button>
              </div>

              {/* Auto-Sprint Generation Toggle */}
              <div className="flex items-center justify-between gap-4 p-4 bg-slate-50/50 border border-slate-200 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-0.5">Auto-Heuristics Mapping</h4>
                  <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                    Instantly compile and activate a customized 30-day recovery sprint upon logging a new rejection.
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => togglePreference('auto_sprint')}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${preferences.auto_sprint ? 'bg-violet-600 justify-end' : 'bg-slate-300 justify-start'}`}
                >
                  <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone account deletion */}
          <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-800 mb-1">Danger Zone: Permanent Account Purge</h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">
                  Wiping your account is a terminal operation. All historic logged rejections, ensembled diagnostics metrics, active sprints, and targets will be completely erased.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3.5 max-w-md pt-2">
              <p className="text-[10px] text-rose-700 font-extrabold uppercase tracking-widest">
                Type <span className="underline font-black text-rose-900">DELETE</span> inside the validator to authorize deletion:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 bg-white border border-rose-200 rounded-xl px-4 py-3 text-slate-800 outline-none focus:border-rose-500 text-xs font-bold shadow-sm"
                  placeholder="Type DELETE"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE' || isDeleting}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed transition-all text-xs cursor-pointer shadow-sm shadow-rose-200"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Erase Profile Permanently'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
