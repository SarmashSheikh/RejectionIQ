import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, FileText, Plus, X, Loader2, Trash2, Save, 
  Award, Sparkles, Flame, KeyRound, LogOut, ChevronRight, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'profile', 'resume', 'security', 'preferences'
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    weekly_reports: true,
    auto_sprint: true
  });

  const togglePreference = (key) => {
    setPreferences(prev => {
      const next = !prev[key];
      toast.success("Preference updated! ⚙️");
      return { ...prev, [key]: next };
    });
  };

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    college: '',
    branch: '',
    graduation_year: '',
    cgpa: '',
    internship_count: '',
    project_count: '',
    skills: [],
    target_companies: [],
    dream_company: 'Google',
    dream_cgpa: 8.5,
    dream_internships: 2,
    dream_projects: 3,
    dream_skills: []
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [dreamSkillInput, setDreamSkillInput] = useState('');

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        college: user.college || '',
        branch: user.branch || '',
        graduation_year: user.graduation_year || '',
        cgpa: user.cgpa || '',
        internship_count: user.internship_count !== null ? user.internship_count : 0,
        project_count: user.project_count !== null ? user.project_count : 0,
        skills: user.skills || [],
        target_companies: user.target_companies || [],
        dream_company: user.dream_company || 'Google',
        dream_cgpa: user.dream_cgpa !== null ? user.dream_cgpa : 8.5,
        dream_internships: user.dream_internships !== null ? user.dream_internships : 2,
        dream_projects: user.dream_projects !== null ? user.dream_projects : 3,
        dream_skills: user.dream_skills || []
      });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', {
        ...profileForm,
        graduation_year: parseInt(profileForm.graduation_year) || null,
        cgpa: parseFloat(profileForm.cgpa) || null,
        internship_count: parseInt(profileForm.internship_count) || 0,
        project_count: parseInt(profileForm.project_count) || 0,
        dream_cgpa: parseFloat(profileForm.dream_cgpa) || 8.5,
        dream_internships: parseInt(profileForm.dream_internships) || 2,
        dream_projects: parseInt(profileForm.dream_projects) || 3
      });
      toast.success('Profile target benchmarks updated! 🎉');
      setActiveTab('menu');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.put('/auth/password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      toast.success('Access credentials updated! 🔒');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setActiveTab('menu');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await api.delete('/auth/account');
      toast.success('Account permanently deleted.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profileForm.skills.includes(skillInput.trim())) {
      setProfileForm({ ...profileForm, skills: [...profileForm.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };
  const removeSkill = (skill) => {
    setProfileForm({ ...profileForm, skills: profileForm.skills.filter(s => s !== skill) });
  };

  const addCompany = () => {
    if (companyInput.trim() && !profileForm.target_companies.includes(companyInput.trim())) {
      setProfileForm({ ...profileForm, target_companies: [...profileForm.target_companies, companyInput.trim()] });
      setCompanyInput('');
    }
  };
  const removeCompany = (company) => {
    setProfileForm({ ...profileForm, target_companies: profileForm.target_companies.filter(c => c !== company) });
  };

  const addDreamSkill = () => {
    if (dreamSkillInput.trim() && !profileForm.dream_skills.includes(dreamSkillInput.trim())) {
      setProfileForm({ ...profileForm, dream_skills: [...profileForm.dream_skills, dreamSkillInput.trim()] });
      setDreamSkillInput('');
    }
  };
  const removeDreamSkill = (skill) => {
    setProfileForm({ ...profileForm, dream_skills: profileForm.dream_skills.filter(s => s !== skill) });
  };

  const userName = user?.full_name || "Technologist";
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-4 select-none pb-4">
      
      {/* 🌟 Profile Cover Header (Standard Mobile Cover Layout) */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
        {/* Avatar circle */}
        <div className="w-16 h-16 bg-gradient-to-tr from-brand-500 to-brand-600 rounded-full flex items-center justify-center font-black text-white text-xl border-2 border-white shadow-md shadow-brand-500/10 shrink-0">
          {userInitials}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-slate-800 truncate leading-tight">{userName}</h2>
          <p className="text-[10px] text-slate-450 truncate font-semibold leading-none mt-0.5">{user?.email}</p>
          <div className="flex gap-2 items-center mt-2.5">
            <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100 shadow-xs shrink-0">
              <Flame size={10} className="fill-amber-500 text-amber-500" /> {user?.streak_count || 0} Streak
            </span>
            <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-brand-50 text-brand-655 text-brand-600 px-2 py-0.5 rounded-md border border-brand-100 shadow-xs shrink-0">
              <Sparkles size={9} /> {user?.resilience_score ? `${user.resilience_score}/10` : '5.0/10'} Resilience
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Pane Switcher */}
      <AnimatePresence mode="wait">
        
        {activeTab === 'menu' && (
          /* SECTION A: MAIN SETTINGS MENU LIST (Apple-style list group) */
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-4"
          >
            {/* Setting Category Group */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-50">
              
              {/* Profile details */}
              <button 
                onClick={() => setActiveTab('profile')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-slate-850">
                  <User size={16} className="text-brand-500" />
                  <span className="text-xs font-bold">Edit Career Profile</span>
                </div>
                <ChevronRight size={14} className="text-slate-350" />
              </button>

              {/* Resume Vault */}
              <button 
                onClick={() => setActiveTab('resume')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-slate-850">
                  <FileText size={16} className="text-brand-550 text-brand-500" />
                  <span className="text-xs font-bold">Resume Document Vault</span>
                </div>
                <ChevronRight size={14} className="text-slate-350" />
              </button>

              {/* Security */}
              <button 
                onClick={() => setActiveTab('security')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-slate-850">
                  <Shield size={16} className="text-brand-500" />
                  <span className="text-xs font-bold">Security Credentials</span>
                </div>
                <ChevronRight size={14} className="text-slate-350" />
              </button>

              {/* Preferences */}
              <button 
                onClick={() => setActiveTab('preferences')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-slate-850">
                  <Sparkles size={16} className="text-brand-500" />
                  <span className="text-xs font-bold">AI Platform Preferences</span>
                </div>
                <ChevronRight size={14} className="text-slate-350" />
              </button>

            </div>

            {/* Logout Trigger */}
            <button 
              onClick={handleLogoutClick}
              className="w-full bg-rose-50 hover:bg-rose-100/80 border border-rose-100 rounded-3xl py-3.5 flex items-center justify-center gap-2 text-rose-600 font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <LogOut size={15} /> Sign Out Account
            </button>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          /* SECTION B: PROFILE EDITOR */
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-805 uppercase tracking-widest">Career Credentials</span>
              <button 
                onClick={() => setActiveTab('menu')}
                className="text-[9px] font-black text-brand-600 uppercase tracking-widest cursor-pointer"
              >
                Back
              </button>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs font-bold text-slate-700">
              
              {/* Full name */}
              <div className="space-y-0.5">
                <label className="block text-[9px] text-slate-400 font-black uppercase tracking-wider pl-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.full_name}
                  onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  required
                />
              </div>

              {/* College & Branch */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-wider text-center">College</label>
                  <input 
                    type="text"
                    value={profileForm.college}
                    onChange={e => setProfileForm({ ...profileForm, college: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-wider text-center">Branch / Major</label>
                  <input 
                    type="text"
                    value={profileForm.branch}
                    onChange={e => setProfileForm({ ...profileForm, branch: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                  />
                </div>
              </div>

              {/* CGPA, Projects, Interns */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-wider text-center">CGPA</label>
                  <input 
                    type="number" step="0.1"
                    value={profileForm.cgpa}
                    onChange={e => setProfileForm({ ...profileForm, cgpa: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-wider text-center">Projects</label>
                  <input 
                    type="number"
                    value={profileForm.project_count}
                    onChange={e => setProfileForm({ ...profileForm, project_count: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-wider text-center">Internships</label>
                  <input 
                    type="number"
                    value={profileForm.internship_count}
                    onChange={e => setProfileForm({ ...profileForm, internship_count: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                  />
                </div>
              </div>

              {/* Dream Target Company */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <span className="text-[9px] font-black text-brand-605 text-brand-500 uppercase tracking-widest block pl-0.5">Dream Targets</span>
                
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider pl-1">Target Company</label>
                  <input 
                    type="text" 
                    value={profileForm.dream_company}
                    onChange={e => setProfileForm({ ...profileForm, dream_company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-0.5">
                    <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider text-center">Dream CGPA</label>
                    <input 
                      type="number" step="0.1"
                      value={profileForm.dream_cgpa}
                      onChange={e => setProfileForm({ ...profileForm, dream_cgpa: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider text-center">Dream Proj</label>
                    <input 
                      type="number"
                      value={profileForm.dream_projects}
                      onChange={e => setProfileForm({ ...profileForm, dream_projects: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider text-center">Dream Interns</label>
                    <input 
                      type="number"
                      value={profileForm.dream_internships}
                      onChange={e => setProfileForm({ ...profileForm, dream_internships: e.target.value })}
                      className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-550 rounded-2xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-md shadow-brand-500/10 flex items-center justify-center"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : 'Save Profiles'}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {activeTab === 'resume' && (
          /* SECTION C: RESUME VAULT */
          <motion.div
            key="resume"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-805 uppercase tracking-widest">Document Vault</span>
              <button 
                onClick={() => setActiveTab('menu')}
                className="text-[9px] font-black text-brand-600 uppercase tracking-widest cursor-pointer"
              >
                Back
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3.5">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-500 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Uploaded PDF</span>
                <p className="text-xs font-black text-slate-805 truncate mt-0.5">
                  {user?.resume_path ? user.resume_path.split('/').pop() : 'No PDF cataloged.'}
                </p>
              </div>
            </div>

            {/* Upload link redirection */}
            <button 
              onClick={() => navigate('/onboarding/step2')}
              className="w-full py-3 bg-brand-50 hover:bg-brand-100/60 border border-brand-100 text-brand-600 rounded-2xl font-black uppercase tracking-wider text-[10px] active:scale-95 transition-all cursor-pointer"
            >
              Re-upload PDF Resume
            </button>

            {/* Extracted skills pills */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest pl-0.5">Parsed Skill Gaps Index</span>
              <div className="flex flex-wrap gap-1 max-h-[220px] overflow-y-auto no-scrollbar py-0.5">
                {user?.skills?.length > 0 ? (
                  user.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-655 text-slate-600 text-[10px] font-extrabold rounded-xl shadow-xs">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 italic font-semibold pl-0.5 leading-normal">
                    Complete onboarding and parse your resume to index gaps parameters.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'security' && (
          /* SECTION D: PASSWORD MANAGER & Erase account */
          <motion.div
            key="security"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Credentials block */}
            <div className="bg-white border border-slate-105 border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[10px] font-black text-slate-805 uppercase tracking-widest">Credentials Control</span>
                <button 
                  onClick={() => setActiveTab('menu')}
                  className="text-[9px] font-black text-brand-600 uppercase tracking-widest cursor-pointer"
                >
                  Back
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-bold text-slate-700">
                {/* Current */}
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider pl-1">Current Password</label>
                  <input 
                    type="password"
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                    required
                  />
                </div>
                {/* New */}
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider pl-1">New Password</label>
                  <input 
                    type="password"
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                    required
                  />
                </div>
                {/* Confirm */}
                <div className="space-y-0.5">
                  <label className="block text-[8px] text-slate-400 font-black uppercase tracking-wider pl-1">Confirm Password</label>
                  <input 
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-black uppercase tracking-wider text-xs shadow-md shadow-brand-500/10 flex items-center justify-center"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : 'Update Credentials'}
                </button>
              </form>
            </div>

            {/* Danger Account Purge Box */}
            <div className="bg-rose-50 border border-rose-100 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-rose-700">
                <Trash2 size={16} className="shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest font-syne">Permanent Purge Zone</span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                Deleting your account deletes all logged diagnostic rejections, ensembled recovery sprint checklists, CGPA target history, and uploaded PDF document indices forever.
              </p>
              
              <div className="space-y-2 pt-1.5">
                <input 
                  type="text" 
                  placeholder="Type DELETE to purge account"
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl font-bold text-xs shadow-sm placeholder-slate-350"
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== 'DELETE' || isDeleting}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] disabled:opacity-40 cursor-pointer flex items-center justify-center"
                >
                  {isDeleting ? <Loader2 size={13} className="animate-spin" /> : 'Erase Account Permanently'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'preferences' && (
          /* SECTION E: PLATFORM PREFERENCES & AI SWITCHERS */
          <motion.div
            key="preferences"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-805 uppercase tracking-widest">Platform Toggles</span>
              <button 
                onClick={() => setActiveTab('menu')}
                className="text-[9px] font-black text-brand-600 uppercase tracking-widest cursor-pointer"
              >
                Back
              </button>
            </div>

            {/* Preferences Switch lists */}
            <div className="space-y-3">
              
              {/* Sprint Reminders Switch */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-xs">
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 leading-tight">Sprint Reminders</h4>
                  <p className="text-[9px] text-slate-450 font-semibold leading-normal mt-0.5">
                    Receive pushes and emails for due tasks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference('email_notifications')}
                  className="text-slate-400 hover:text-brand-500 transition-colors shrink-0 cursor-pointer"
                >
                  {preferences.email_notifications ? (
                    <ToggleRight size={38} className="text-brand-500" />
                  ) : (
                    <ToggleLeft size={38} className="text-slate-350" />
                  )}
                </button>
              </div>

              {/* Progress Reports Switch */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-xs">
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 leading-tight">Progress Reports</h4>
                  <p className="text-[9px] text-slate-455 text-slate-450 font-semibold leading-normal mt-0.5">
                    Weekly digests of spaCy/SBERT exit stats.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference('weekly_reports')}
                  className="text-slate-400 hover:text-brand-500 transition-colors shrink-0 cursor-pointer"
                >
                  {preferences.weekly_reports ? (
                    <ToggleRight size={38} className="text-brand-500" />
                  ) : (
                    <ToggleLeft size={38} className="text-slate-350" />
                  )}
                </button>
              </div>

              {/* Auto-heuristics Switch */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-xs">
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 leading-tight">Auto-heuristics</h4>
                  <p className="text-[9px] text-slate-455 text-slate-450 font-semibold leading-normal mt-0.5">
                    Compile sprints immediately upon log.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference('auto_sprint')}
                  className="text-slate-400 hover:text-brand-500 transition-colors shrink-0 cursor-pointer"
                >
                  {preferences.auto_sprint ? (
                    <ToggleRight size={38} className="text-brand-500" />
                  ) : (
                    <ToggleLeft size={38} className="text-slate-350" />
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
