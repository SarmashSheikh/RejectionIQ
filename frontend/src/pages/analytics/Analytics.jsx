import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { BarChart3, TrendingUp, Users, Target, Sparkles, Building, BookOpen, ShieldCheck, AlertCircle, Award, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Analytics() {
  const [profile, setProfile] = useState(null);
  const [isEditingDream, setIsEditingDream] = useState(false);
  const [dreamMode, setDreamMode] = useState('custom'); // 'custom' or 'cohort'
  const [dreamForm, setDreamForm] = useState({
    dream_company: 'Google',
    dream_cgpa: 8.5,
    dream_internships: 2,
    dream_projects: 3,
    dream_skills: ['Python', 'System Design', 'React']
  });
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState('Google');
  const [companyBenchmark, setCompanyBenchmark] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);

  const targetCompanies = ["Google", "Stripe", "Atlassian", "JPMorgan Chase", "Razorpay", "Swiggy", "TechNova Global"];

  useEffect(() => {
    fetchGeneralAnalytics();
    fetchCompanyBenchmark("Google");
  }, []);

  const fetchGeneralAnalytics = async () => {
    try {
      const [res, userRes] = await Promise.all([
        api.get('/recovery/analytics'),
        api.get('/auth/me')
      ]);
      setAnalyticsData(res.data);
      setProfile(userRes.data);
      if (userRes.data) {
        setDreamForm({
          dream_company: userRes.data.dream_company || 'Google',
          dream_cgpa: userRes.data.dream_cgpa !== null ? userRes.data.dream_cgpa : 8.5,
          dream_internships: userRes.data.dream_internships !== null ? userRes.data.dream_internships : 2,
          dream_projects: userRes.data.dream_projects !== null ? userRes.data.dream_projects : 3,
          dream_skills: userRes.data.dream_skills || ['Python', 'System Design', 'React']
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load general bottleneck patterns or profile.");
    }
    setLoading(false);
  };

  const handleDreamSave = async (e) => {
    if (e) e.preventDefault();
    try {
      await api.put('/auth/profile', {
        dream_company: dreamForm.dream_company,
        dream_cgpa: parseFloat(dreamForm.dream_cgpa) || 0.0,
        dream_internships: parseInt(dreamForm.dream_internships) || 0,
        dream_projects: parseInt(dreamForm.dream_projects) || 0,
        dream_skills: dreamForm.dream_skills
      });
      toast.success("Dream company target benchmarks updated! 🎉");
      setIsEditingDream(false);
      
      // Reload profile
      const userRes = await api.get('/auth/me');
      setProfile(userRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save target benchmarks.");
    }
  };

  const addDreamSkill = () => {
    if (skillInput.trim() && !dreamForm.dream_skills.includes(skillInput.trim())) {
      setDreamForm({
        ...dreamForm,
        dream_skills: [...dreamForm.dream_skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const removeDreamSkill = (skill) => {
    setDreamForm({
      ...dreamForm,
      dream_skills: dreamForm.dream_skills.filter(s => s !== skill)
    });
  };

  const fetchCompanyBenchmark = async (companyName) => {
    setCompanyLoading(true);
    try {
      const res = await api.get(`/analysis/company/${companyName}`);
      setCompanyBenchmark(res.data);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to load peer data for ${companyName}.`);
    }
    setCompanyLoading(false);
  };

  const handleCompanyChange = (e) => {
    const compName = e.target.value;
    setSelectedCompany(compName);
    fetchCompanyBenchmark(compName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 font-bold">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Analyzing peer benchmarks...</p>
        </div>
      </div>
    );
  }

  // Calculate overall rejections to avoid dividing by zero
  const totalRejections = analyticsData?.stage_distribution 
    ? Object.values(analyticsData.stage_distribution).reduce((a, b) => a + b, 0) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Welcome Header */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-violet-50 border border-violet-100 rounded-full text-violet-755 text-violet-750 text-xs font-bold mb-3 shadow-sm">
            AI-Driven Peer Diagnostics
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Rejection Analytics & Benchmarking</h1>
          <p className="text-slate-500 font-semibold text-sm">Discover pipeline bottlenecks and compare your profile against successful candidates.</p>
        </div>

        {/* Dual Core Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Pattern Recognition */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:col-span-5 bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              <h2 className="text-lg font-extrabold mb-6 flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
                <BarChart3 className="w-5 h-5 text-violet-600 animate-pulse" /> Rejection Patterns
              </h2>
              
              {/* Primary Bottleneck Stage Banner */}
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-rose-600 uppercase tracking-widest font-extrabold mb-0.5">Detected Bottleneck Stage</p>
                  <h3 className="text-2xl font-extrabold text-rose-755 text-rose-700">
                    {analyticsData?.bottleneck_stage || "N/A"}
                  </h3>
                </div>
              </div>

              {/* Stage Progress Bars */}
              <div className="space-y-4 mb-6">
                <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Rejection Stage Distribution</p>
                {analyticsData?.stage_distribution && Object.entries(analyticsData.stage_distribution).length > 0 ? (
                  Object.entries(analyticsData.stage_distribution).map(([stage, count]) => {
                    const pct = totalRejections > 0 ? Math.round((count / totalRejections) * 100) : 0;
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        <div className="w-28 text-xs font-bold text-slate-600 truncate">{stage}</div>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div 
                            className="h-full bg-violet-600 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-8 text-right font-extrabold text-xs text-slate-900">{count}</div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-400 italic">No stage distributions logged yet.</p>
                )}
              </div>
            </div>

            {/* Strategy Recommendation */}
            <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-violet-650 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-violet-750 uppercase tracking-widest font-extrabold mb-1">Fit Strategy Guidance</p>
                <p className="text-slate-700 text-xs font-semibold leading-relaxed">
                  Based on your stage distribution patterns, our AI suggests dedicating 60% of your current recovery sprint actions to resolving formatting gaps and adding specific keywords.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Panel: Target Benchmarks (Fully Editable Dream Goals & Cohort Analytics) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="lg:col-span-7 bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-xl p-6 flex flex-col justify-between"
          >
            <div>
              {/* Header with Selector & Toggle Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
                <div>
                  <h2 className="text-lg font-extrabold flex items-center gap-2 text-slate-900 font-syne">
                    <Target className="w-5 h-5 text-violet-600 animate-pulse" /> Target Benchmarks
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                    {dreamMode === 'custom' 
                      ? `Targeting your custom Dream Company: ${profile?.dream_company || 'Google'}` 
                      : `Benchmarking cohort outcomes at: ${selectedCompany}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Mode Toggle Selector */}
                  <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex gap-1 text-[10px] font-bold">
                    <button
                      onClick={() => { setDreamMode('custom'); setIsEditingDream(false); }}
                      className={`px-3 py-1.5 rounded transition-all cursor-pointer ${dreamMode === 'custom' ? 'bg-white text-violet-650 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      🎯 Dream Targets
                    </button>
                    <button
                      onClick={() => { setDreamMode('cohort'); setIsEditingDream(false); }}
                      className={`px-3 py-1.5 rounded transition-all cursor-pointer ${dreamMode === 'cohort' ? 'bg-white text-violet-650 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      👥 Cohort Averages
                    </button>
                  </div>

                  {dreamMode === 'custom' && !isEditingDream && (
                    <button
                      onClick={() => setIsEditingDream(true)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-650 hover:text-slate-800 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border-slate-200 shadow-sm"
                    >
                      ⚙️ Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Editing Dream Goals Form Block */}
              {isEditingDream ? (
                <form onSubmit={handleDreamSave} className="space-y-4 text-xs font-bold text-slate-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Dream Company */}
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Dream Company Name</label>
                      <input 
                        type="text" 
                        required
                        value={dreamForm.dream_company}
                        onChange={(e) => setDreamForm({ ...dreamForm, dream_company: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    {/* Dream CGPA */}
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Required CGPA Target</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={dreamForm.dream_cgpa}
                        onChange={(e) => setDreamForm({ ...dreamForm, dream_cgpa: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Dream Internships */}
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Required Internships</label>
                      <input 
                        type="number" 
                        required
                        value={dreamForm.dream_internships}
                        onChange={(e) => setDreamForm({ ...dreamForm, dream_internships: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                    {/* Dream Projects */}
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Required Projects</label>
                      <input 
                        type="number" 
                        required
                        value={dreamForm.dream_projects}
                        onChange={(e) => setDreamForm({ ...dreamForm, dream_projects: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Dream Skills Required */}
                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Required Tools & Skills</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {dreamForm.dream_skills.map((skill, index) => (
                        <span key={index} className="bg-violet-50 text-violet-750 border border-violet-100 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1.5">
                          {skill}
                          <X size={10} className="cursor-pointer text-violet-500 hover:text-violet-900" onClick={() => removeDreamSkill(skill)} />
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add required skill (e.g. AWS, React)"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDreamSkill())}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={addDreamSkill} 
                        className="px-3 bg-violet-50 text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-600 hover:text-white transition-all cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditingDream(false)}
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-bold transition-all cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold transition-all shadow-sm cursor-pointer text-xs"
                    >
                      Save Target Benchmarks 🎯
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {dreamMode === 'cohort' && (
                    <div className="flex items-center gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <Building className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-500">Query Successful Peer averages at:</span>
                      <select
                        value={selectedCompany}
                        onChange={handleCompanyChange}
                        className="bg-white border border-slate-250 border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-bold focus:border-violet-500 focus:outline-none cursor-pointer shadow-sm select-none"
                      >
                        {targetCompanies.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {companyLoading ? (
                    <div className="py-12 text-center text-slate-500 font-semibold text-xs animate-pulse">
                      <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Updating company benchmarks...
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Grid Comparators: CGPA, Projects, and Internships */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        {/* CGPA */}
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-violet-600" /> Academic Standing (CGPA)
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="block text-[8px] text-slate-400 font-bold uppercase">You</span>
                              <span className="text-base font-extrabold text-slate-800">
                                {profile?.cgpa !== null && profile?.cgpa !== undefined ? parseFloat(profile.cgpa).toFixed(2) : "N/A"}
                              </span>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div>
                              <span className="block text-[8px] text-violet-500 font-bold uppercase">Target</span>
                              <span className="text-base font-extrabold text-violet-700">
                                {dreamMode === 'custom' 
                                  ? (profile?.dream_cgpa ? parseFloat(profile.dream_cgpa).toFixed(2) : "8.50")
                                  : (companyBenchmark?.average_cgpa ? parseFloat(companyBenchmark.average_cgpa).toFixed(2) : "8.50")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Projects */}
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Target className="w-3 h-3 text-violet-600" /> Portfolio Projects
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="block text-[8px] text-slate-400 font-bold uppercase">You</span>
                              <span className="text-base font-extrabold text-slate-800">
                                {profile?.project_count !== null && profile?.project_count !== undefined ? profile.project_count : "0"}
                              </span>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div>
                              <span className="block text-[8px] text-violet-500 font-bold uppercase">Target</span>
                              <span className="text-base font-extrabold text-violet-700">
                                {dreamMode === 'custom'
                                  ? (profile?.dream_projects !== null && profile?.dream_projects !== undefined ? profile.dream_projects : "3")
                                  : (companyBenchmark?.average_projects ? Math.round(companyBenchmark.average_projects) : "3")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Internships */}
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Award className="w-3 h-3 text-violet-600" /> Internships
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="block text-[8px] text-slate-400 font-bold uppercase">You</span>
                              <span className="text-base font-extrabold text-slate-800">
                                {profile?.internship_count !== null && profile?.internship_count !== undefined ? profile.internship_count : "0"}
                              </span>
                            </div>
                            <div className="h-6 w-px bg-slate-200" />
                            <div>
                              <span className="block text-[8px] text-violet-500 font-bold uppercase">Target</span>
                              <span className="text-base font-extrabold text-violet-700">
                                {dreamMode === 'custom'
                                  ? (profile?.dream_internships !== null && profile?.dream_internships !== undefined ? profile.dream_internships : "2")
                                  : (companyBenchmark?.average_internships ? Math.round(companyBenchmark.average_internships) : "2")}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Gap Analysis Summary Banner */}
                      <div className="p-3 bg-slate-50/45 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Gap Analysis</p>
                          <p className="text-slate-800 text-xs font-bold">
                            {(() => {
                              const yourProj = profile?.project_count || 0;
                              const targetProj = dreamMode === 'custom' 
                                ? (profile?.dream_projects ?? 3) 
                                : (companyBenchmark?.average_projects ?? 3);
                              return yourProj >= targetProj
                                ? "🎉 Your portfolio project count meets or exceeds target averages!"
                                : "⚠️ Your project portfolio count is slightly trailing target benchmarks.";
                            })()}
                          </p>
                        </div>
                        <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-extrabold shrink-0 shadow-sm ${
                          (() => {
                            const yourProj = profile?.project_count || 0;
                            const targetProj = dreamMode === 'custom' 
                              ? (profile?.dream_projects ?? 3) 
                              : (companyBenchmark?.average_projects ?? 3);
                            return yourProj >= targetProj
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-amber-50 text-amber-700 border-amber-100";
                          })()
                        }`}>
                          {(() => {
                            const yourProj = profile?.project_count || 0;
                            const targetProj = dreamMode === 'custom' 
                              ? (profile?.dream_projects ?? 3) 
                              : (companyBenchmark?.average_projects ?? 3);
                            return yourProj >= targetProj ? "Competitive" : "Action Needed";
                          })()}
                        </span>
                      </div>

                      {/* Target Required Skills Matrix */}
                      <div>
                        <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-violet-650" /> Required Core Competencies & Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {dreamMode === 'custom' ? (
                            profile?.dream_skills && profile.dream_skills.length > 0 ? (
                              profile.dream_skills.map((skill, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2.5 py-1 bg-violet-50 border border-violet-100 rounded-lg text-violet-750 text-[10px] font-bold shadow-sm flex items-center gap-1"
                                >
                                  <ShieldCheck className="w-3 h-3 text-violet-600" /> {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No custom dream skills added yet.</span>
                            )
                          ) : (
                            companyBenchmark?.common_skills && companyBenchmark.common_skills.length > 0 ? (
                              companyBenchmark.common_skills.map((skill, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2.5 py-1 bg-violet-50 border border-violet-100 rounded-lg text-violet-750 text-[10px] font-bold shadow-sm flex items-center gap-1"
                                >
                                  <ShieldCheck className="w-3 h-3 text-violet-600" /> {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No specific competency logs recorded.</span>
                            )
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold mt-3 italic">
                          {dreamMode === 'custom' 
                            ? "* Dream targets are fully customized and set by you to measure direct rebound goals."
                            : `* Benchmark data automatically aggregated from successfully placed candidate profiles (${companyBenchmark?.sample_size || 5} peers).`}
                        </p>
                      </div>

                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
