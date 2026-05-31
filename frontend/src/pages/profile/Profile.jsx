import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  User, Shield, FileText, Plus, X, Loader2, Trash2, Save, 
  Award, Sparkles, Flame, Building, GraduationCap, Briefcase, 
  BookOpen, KeyRound, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
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
      const val = !prev[key];
      toast.success("Platform preference updated! ⚙️");
      return { ...prev, [key]: val };
    });
  };

  // Handle Tab Detection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['profile', 'resume', 'security'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  // Form States (Combining Baseline Profile & Target Dream Company Benchmarks)
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
        full_name: profileForm.full_name,
        college: profileForm.college,
        branch: profileForm.branch,
        graduation_year: parseInt(profileForm.graduation_year) || null,
        cgpa: parseFloat(profileForm.cgpa) || null,
        internship_count: parseInt(profileForm.internship_count) || 0,
        project_count: parseInt(profileForm.project_count) || 0,
        skills: profileForm.skills,
        target_companies: profileForm.target_companies,
        dream_company: profileForm.dream_company,
        dream_cgpa: parseFloat(profileForm.dream_cgpa) || 8.5,
        dream_internships: parseInt(profileForm.dream_internships) || 2,
        dream_projects: parseInt(profileForm.dream_projects) || 3,
        dream_skills: profileForm.dream_skills
      });
      toast.success('Career profile & target benchmarks updated! 🎉');
      setTimeout(() => window.location.reload(), 1000);
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

  // Skill Additions & Removals (Your Profile)
  const addSkill = () => {
    if (skillInput.trim() && !profileForm.skills.includes(skillInput.trim())) {
      setProfileForm({ ...profileForm, skills: [...profileForm.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };
  const removeSkill = (skill) => {
    setProfileForm({ ...profileForm, skills: profileForm.skills.filter(s => s !== skill) });
  };

  // Target Company Additions & Removals (Your Profile)
  const addCompany = () => {
    if (companyInput.trim() && !profileForm.target_companies.includes(companyInput.trim())) {
      setProfileForm({ ...profileForm, target_companies: [...profileForm.target_companies, companyInput.trim()] });
      setCompanyInput('');
    }
  };
  const removeCompany = (company) => {
    setProfileForm({ ...profileForm, target_companies: profileForm.target_companies.filter(c => c !== company) });
  };

  // Dream Skill Additions & Removals (Dream Company Target)
  const addDreamSkill = () => {
    if (dreamSkillInput.trim() && !profileForm.dream_skills.includes(dreamSkillInput.trim())) {
      setProfileForm({ ...profileForm, dream_skills: [...profileForm.dream_skills, dreamSkillInput.trim()] });
      setDreamSkillInput('');
    }
  };
  const removeDreamSkill = (skill) => {
    setProfileForm({ ...profileForm, dream_skills: profileForm.dream_skills.filter(s => s !== skill) });
  };

  // User details parsed
  const userName = user?.full_name || "Technologist";
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "IQ";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-10">

        {/* 🌟 Premium Hero Cover Card */}
        <div className="bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-3xl overflow-hidden mb-8 relative">
          {/* Gradient Banner with Sparks */}
          <div className="h-44 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 relative flex items-center p-8 overflow-hidden select-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent opacity-60" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 right-20 w-44 h-44 bg-pink-500/20 rounded-full blur-xl" />
            
            <div className="relative text-white z-10 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="text-[10px] tracking-widest uppercase font-extrabold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                Career Command Center
              </span>
            </div>
          </div>

          {/* Overlapping Initials Avatar & Info */}
          <div className="px-8 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 sm:-mt-12 relative z-15">
              {/* Glass initials avatar bubble */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-gradient-to-tr from-violet-500 to-indigo-600 flex items-center justify-center font-extrabold text-white text-3xl sm:text-4xl shadow-xl shadow-violet-250 select-none">
                {userInitials}
              </div>
              <div className="pb-1">
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mb-1">{userName}</h2>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>{user?.email}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="text-violet-650 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md font-bold">
                    Rebound Active 🏃‍♂️
                  </span>
                </div>
              </div>
            </div>

            {/* Quick KPI Stats Row */}
            <div className="flex flex-wrap gap-3 md:pb-1">
              {/* Resilience Score Gauge */}
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-3 shadow-inner">
                <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
                <div>
                  <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Resilience</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {user?.resilience_score !== null && user?.resilience_score !== undefined ? `${user.resilience_score}/10` : "5.0/10"}
                  </span>
                </div>
              </div>

              {/* Active checkin streak */}
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-3 shadow-inner">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-50 shrink-0" />
                <div>
                  <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Active Streak</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {user?.streak_count || 0} Days
                  </span>
                </div>
              </div>

              {/* Total logged rejections */}
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center gap-3 shadow-inner">
                <Briefcase className="w-4 h-4 text-pink-600 shrink-0" />
                <div>
                  <span className="block text-[8px] text-slate-400 font-extrabold uppercase">Rejections</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {user?.total_rejections || 0} Logs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 Segment Selector Tab Controller */}
        <div className="flex justify-between items-center mb-8 gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
            {[
              { id: 'profile', icon: User, label: 'Career Profile' },
              { id: 'resume', icon: FileText, label: 'Resume Vault' },
              { id: 'security', icon: Shield, label: 'Access & Security' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-violet-655 bg-violet-600 text-white shadow-sm font-black' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon size={14} className="shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-all cursor-pointer"
          >
            ← Return to Dashboard
          </button>
        </div>

        {/* 📚 Active Content Tab Panes */}
        <AnimatePresence mode="wait">
          
          {/* PROFILE CONTROL PANE */}
          {activeTab === 'profile' && (
            <motion.div 
              key="profile" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }} 
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm shadow-slate-100/50"
            >
              <form onSubmit={handleProfileSave} className="space-y-8">
                
                {/* 2-Column Responsive Layout: Baseline Profile vs Dream Benchmarks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  
                  {/* Left Column: Academic & Technical Standing (Baseline Profile) */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                      <GraduationCap className="w-4.5 h-4.5 text-violet-600 shrink-0" /> Baseline Credentials
                    </h3>
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Candidate Full Name</label>
                      <input
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                        value={profileForm.full_name}
                        onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* College Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">College / University</label>
                        <input
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                          value={profileForm.college}
                          onChange={e => setProfileForm({ ...profileForm, college: e.target.value })}
                        />
                      </div>
                      {/* Branch Name */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Branch / Degree</label>
                        <input
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                          value={profileForm.branch}
                          onChange={e => setProfileForm({ ...profileForm, branch: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* CGPA */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current CGPA</label>
                        <input
                          type="number" step="0.01"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                          value={profileForm.cgpa}
                          onChange={e => setProfileForm({ ...profileForm, cgpa: e.target.value })}
                        />
                      </div>
                      {/* Internships */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Internships</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                          value={profileForm.internship_count}
                          onChange={e => setProfileForm({ ...profileForm, internship_count: e.target.value })}
                        />
                      </div>
                      {/* Projects */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Projects</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                          value={profileForm.project_count}
                          onChange={e => setProfileForm({ ...profileForm, project_count: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Graduation Year */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Graduation Year</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold"
                          value={profileForm.graduation_year}
                          onChange={e => setProfileForm({ ...profileForm, graduation_year: e.target.value })}
                        />
                      </div>
                      {/* Baseline target company listings */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Companies of Interest</label>
                        <div className="flex gap-2">
                          <input
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-violet-500 outline-none"
                            placeholder="Add tag"
                            value={companyInput}
                            onChange={e => setCompanyInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCompany())}
                          />
                          <button type="button" onClick={addCompany} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all cursor-pointer">
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Companies tags cloud */}
                    {profileForm.target_companies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {profileForm.target_companies.map(c => (
                          <span key={c} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                            {c}
                            <X size={10} className="cursor-pointer text-emerald-500 hover:text-emerald-950" onClick={() => removeCompany(c)} />
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Baseline technical skills list */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Baseline Tools & Competencies</label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-violet-500 outline-none"
                          placeholder="Add skill (e.g. AWS, React)"
                          value={skillInput}
                          onChange={e => setSkillInput(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <button type="button" onClick={addSkill} className="bg-violet-50 text-violet-600 border border-violet-200 px-3 rounded-xl hover:bg-violet-600 hover:text-white transition-all cursor-pointer">
                          <Plus size={16} />
                        </button>
                      </div>
                      {profileForm.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {profileForm.skills.map(s => (
                            <span key={s} className="bg-violet-50 text-violet-750 border border-violet-100 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                              {s}
                              <X size={10} className="cursor-pointer text-violet-500 hover:text-violet-955" onClick={() => removeSkill(s)} />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No skills registered yet. Add baseline tools above.</p>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Custom Dream Company Target Benchmarks */}
                  <div className="space-y-6 bg-slate-50/50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-inner">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-2 border-b border-slate-200 pb-3 mb-2">
                      <Award className="w-4.5 h-4.5 text-violet-650 shrink-0" /> Dream Target Benchmarks
                    </h3>

                    {/* Dream Company Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Dream Company Target</label>
                      <input
                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold shadow-sm"
                        value={profileForm.dream_company}
                        onChange={e => setProfileForm({ ...profileForm, dream_company: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Dream CGPA Target */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Dream CGPA</label>
                        <input
                          type="number" step="0.01"
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold shadow-sm"
                          value={profileForm.dream_cgpa}
                          onChange={e => setProfileForm({ ...profileForm, dream_cgpa: e.target.value })}
                        />
                      </div>
                      {/* Dream Internships */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Dream Interns</label>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold shadow-sm"
                          value={profileForm.dream_internships}
                          onChange={e => setProfileForm({ ...profileForm, dream_internships: e.target.value })}
                        />
                      </div>
                      {/* Dream Projects */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Dream Projects</label>
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-xs text-slate-800 font-bold shadow-sm"
                          value={profileForm.dream_projects}
                          onChange={e => setProfileForm({ ...profileForm, dream_projects: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Dream Required Skills Tag Input */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Required Tools & Competencies</label>
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-violet-500 outline-none shadow-sm"
                          placeholder="Add required skill (e.g. PyTorch, Kubernetes)"
                          value={dreamSkillInput}
                          onChange={e => setDreamSkillInput(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addDreamSkill())}
                        />
                        <button type="button" onClick={addDreamSkill} className="bg-violet-550 bg-violet-50 text-violet-650 border border-violet-200 px-3 rounded-xl hover:bg-violet-600 hover:text-white transition-all cursor-pointer">
                          <Plus size={16} />
                        </button>
                      </div>
                      {profileForm.dream_skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {profileForm.dream_skills.map(s => (
                            <span key={s} className="bg-violet-50 text-violet-750 border border-violet-100 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                              {s}
                              <X size={10} className="cursor-pointer text-violet-500 hover:text-violet-955" onClick={() => removeDreamSkill(s)} />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400 italic">No specific dream tools added yet. Configure baseline parameters.</p>
                      )}
                    </div>

                    <div className="pt-4 p-3 bg-violet-50/50 border border-violet-100 rounded-xl flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-violet-650 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                        * Target benchmarks are used inside the **Benchmarks page** to calculate dynamic comparisons, gap severities, and sprint actions against successfully placed peers.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Submit Actions */}
                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    disabled={loading}
                    className="flex items-center gap-2 px-10 py-3.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-xs shadow-sm shadow-violet-200 cursor-pointer animate-fade-in"
                  >
                    {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    Save Platform Profile 🎯
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* RESUME VAULT PANE */}
          {activeTab === 'resume' && (
            <motion.div 
              key="resume" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }} 
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm shadow-slate-100/50"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl mb-8">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100 shrink-0">
                    <FileText size={26} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">Primary Document Vault</h3>
                    <p className="text-slate-500 text-xs font-bold mt-1">
                      {user?.resume_path ? `Uploaded: ${user.resume_path.split('/').pop()}` : 'No resume file cataloged.'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/onboarding/step2')} 
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus size={14} /> Re-upload PDF
                </button>
              </div>

              {/* Grid Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Extracted tool tags cloud */}
                <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Extracted Skill Index
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.skills?.length > 0 ? user.skills.map(skill => (
                      <span key={skill} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 shadow-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {skill}
                      </span>
                    )) : (
                      <p className="text-slate-400 text-xs italic font-semibold leading-relaxed">
                        Log rejections or complete onboarding to parse semantic resume properties.
                      </p>
                    )}
                  </div>
                </div>

                {/* Compatibility gauge block */}
                <div className="bg-violet-50/50 rounded-2xl p-6 border border-violet-100 flex flex-col items-center justify-center text-center">
                  <h4 className="text-[10px] font-extrabold text-violet-650 uppercase tracking-widest mb-4">Baseline Match</h4>
                  <div className="text-4xl font-extrabold text-violet-700 mb-2 font-syne animate-pulse">84%</div>
                  <p className="text-[10px] text-violet-500 font-extrabold leading-normal">
                    Aggregate Compatibility
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1 italic leading-normal">
                    Compared against cohort metrics
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACCESS & SECURITY PANE */}
          {activeTab === 'security' && (
            <motion.div 
              key="security" 
              initial={{ opacity: 0, y: 12 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }} 
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
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
