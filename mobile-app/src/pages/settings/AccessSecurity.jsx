import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { getBaseURL, setCustomApiUrl } from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  KeyRound, Sparkles, Trash2, Shield, Loader2, Lock, ChevronLeft, Save,
  Database, Server, RefreshCw, CheckCircle2, AlertCircle, HardDrive
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

  // Server & Database Sync states
  const [currentApiUrl, setCurrentApiUrl] = useState(getBaseURL());
  const [customIpInput, setCustomIpInput] = useState('');
  const [dbStatus, setDbStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [checkingSync, setCheckingSync] = useState(false);

  const checkBackendHealth = async () => {
    setCheckingSync(true);
    setDbStatus('checking');
    try {
      const res = await api.get('/health', { timeout: 5000 });
      if (res.data && res.data.status === 'ok') {
        setDbStatus('online');
        toast.success('Database & Backend API synchronized! 🟢');
      } else {
        setDbStatus('offline');
      }
    } catch (err) {
      console.error(err);
      setDbStatus('offline');
      toast.error('Backend connection timed out. Check local server or network.');
    } finally {
      setCheckingSync(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, [currentApiUrl]);

  const handleSaveCustomServer = (urlToSet) => {
    setCustomApiUrl(urlToSet);
    const updated = getBaseURL();
    setCurrentApiUrl(updated);
    toast.success(`Connected to backend: ${updated}`);
  };

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Mobile Top Header Navigation */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <span className="text-xs font-extrabold text-white tracking-wide">Access & Sync Settings</span>
        <div className="w-6" />
      </div>

      <div className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto">
        {/* Header Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-600 p-5 shadow-lg border border-violet-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
          <div className="relative z-10 flex items-center gap-3">
            <Shield className="w-6 h-6 text-yellow-300 shrink-0" />
            <div>
              <span className="text-[10px] tracking-wider uppercase font-extrabold bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-md inline-block">
                Security & Sync Hub
              </span>
              <h1 className="text-xl font-extrabold text-white mt-0.5">Access & Database Sync</h1>
            </div>
          </div>
        </div>

        {/* 🌐 Backend & Database Synchronization Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
              <Database size={16} className="text-emerald-400" /> 
              Shared Backend & Database Sync
            </h3>
            <button 
              onClick={checkBackendHealth}
              disabled={checkingSync}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors cursor-pointer"
              title="Test Backend Connection"
            >
              <RefreshCw size={14} className={checkingSync ? 'animate-spin text-emerald-400' : ''} />
            </button>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server size={12} /> Target Server URL
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                dbStatus === 'online' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                dbStatus === 'checking' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {dbStatus === 'online' ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                {dbStatus === 'online' ? 'DB Connected' : dbStatus === 'checking' ? 'Checking...' : 'Offline'}
              </span>
            </div>

            <p className="text-xs font-mono font-bold text-violet-300 truncate">
              {currentApiUrl}
            </p>

            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Logins, profile edits, rejections, and resumes created on the Web app are automatically synchronized to this Android app via this shared database endpoint.
            </p>
          </div>

          {/* Connection Preset Selectors */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Quick Server Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSaveCustomServer('http://10.0.2.2:8000/api')}
                className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-[11px] font-bold text-slate-200 cursor-pointer"
              >
                <div className="text-[9px] text-slate-500 font-black uppercase">Android Studio</div>
                Local Host (10.0.2.2)
              </button>
              <button
                type="button"
                onClick={() => handleSaveCustomServer('https://rejectioniq.onrender.com/api')}
                className="py-2 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left text-[11px] font-bold text-slate-200 cursor-pointer"
              >
                <div className="text-[9px] text-emerald-400 font-black uppercase">Production Cloud</div>
                Live Database API
              </button>
            </div>
          </div>

          {/* Custom Wi-Fi IP input */}
          <div className="space-y-1 pt-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Custom PC Wi-Fi IP (For Physical Phone Testing)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. http://192.168.1.10:8000"
                value={customIpInput}
                onChange={e => setCustomIpInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={() => handleSaveCustomServer(customIpInput)}
                className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Connect
              </button>
            </div>
          </div>
        </motion.div>

        {/* Change Password Block */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold flex items-center gap-2 text-white border-b border-slate-800 pb-3">
            <KeyRound size={16} className="text-violet-400" /> 
            Modify Password & Credentials
          </h3>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:border-violet-500 outline-none transition-all text-xs text-white font-bold"
                value={passwordForm.current_password}
                onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:border-violet-500 outline-none transition-all text-xs text-white font-bold"
                value={passwordForm.new_password}
                onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:border-violet-500 outline-none transition-all text-xs text-white font-bold"
                value={passwordForm.confirm_password}
                onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-700 active:scale-98 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : 'Update Access Credentials'}
            </button>
          </form>
        </div>

        {/* Preferences & AI Automations */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold flex items-center gap-2 text-white border-b border-slate-800 pb-3">
            <Sparkles size={16} className="text-violet-400" /> 
            Preferences & AI Automations
          </h3>
          
          <div className="space-y-3">
            {/* Email Notifications Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-white">Sprint Reminders</h4>
                <p className="text-[10px] text-slate-400 font-medium">Daily alerts for recovery tasks</p>
              </div>
              <button 
                type="button"
                onClick={() => togglePreference('email_notifications')}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${preferences.email_notifications ? 'bg-violet-600 justify-end' : 'bg-slate-700 justify-start'}`}
              >
                <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-sm" />
              </button>
            </div>

            {/* Weekly Digest Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-white">Linguistic Audit Digests</h4>
                <p className="text-[10px] text-slate-400 font-medium">Weekly AI sentiment digests</p>
              </div>
              <button 
                type="button"
                onClick={() => togglePreference('weekly_reports')}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${preferences.weekly_reports ? 'bg-violet-600 justify-end' : 'bg-slate-700 justify-start'}`}
              >
                <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-sm" />
              </button>
            </div>

            {/* Auto Sprint Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-white">Auto-Heuristics Mapping</h4>
                <p className="text-[10px] text-slate-400 font-medium">Instant 30-day sprint creation</p>
              </div>
              <button 
                type="button"
                onClick={() => togglePreference('auto_sprint')}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${preferences.auto_sprint ? 'bg-violet-600 justify-end' : 'bg-slate-700 justify-start'}`}
              >
                <motion.div layout className="bg-white w-4 h-4 rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone account deletion */}
        <div className="bg-rose-950/40 border border-rose-900/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-400 shrink-0">
              <Trash2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-300">Danger Zone: Permanent Account Purge</h3>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                Wiping your account is permanent. All historic logged rejections, diagnostics, and sprints will be erased.
              </p>
            </div>
          </div>
          
          <div className="space-y-2 pt-1">
            <p className="text-[10px] text-rose-400 font-extrabold uppercase tracking-wider">
              Type <span className="underline text-rose-200">DELETE</span> to authorize:
            </p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-950 border border-rose-900/80 rounded-xl px-3 py-2.5 text-white outline-none focus:border-rose-500 text-xs font-bold shadow-sm"
                placeholder="Type DELETE"
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || isDeleting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs cursor-pointer"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={14} /> : 'Purge'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
