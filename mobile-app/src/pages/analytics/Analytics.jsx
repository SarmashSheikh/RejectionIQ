import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, Target, Sparkles, Building, BookOpen, 
  ShieldCheck, AlertCircle, Award, Plus, X, Loader2, ChevronRight 
} from 'lucide-react';
import api from '../../api/axios';
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

  const targetCompanies = [
    "Google", "Stripe", "Atlassian", "Microsoft", "Amazon", "Meta", "Uber"
  ];

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
      toast.error("Failed to load metrics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyBenchmark = async (companyName) => {
    setCompanyLoading(true);
    try {
      const res = await api.get(`/analysis/company/${companyName}`);
      setCompanyBenchmark(res.data);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to load peer data for ${companyName}`);
    } finally {
      setCompanyLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneralAnalytics();
    fetchCompanyBenchmark("Google");
  }, []);

  const handleDreamSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', {
        dream_company: dreamForm.dream_company,
        dream_cgpa: parseFloat(dreamForm.dream_cgpa) || 0.0,
        dream_internships: parseInt(dreamForm.dream_internships) || 0,
        dream_projects: parseInt(dreamForm.dream_projects) || 0,
        dream_skills: dreamForm.dream_skills
      });
      toast.success("Dream targets saved! 🎯");
      setIsEditingDream(false);
      
      const userRes = await api.get('/auth/me');
      setProfile(userRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save targets.");
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

  const handleCompanyChange = (e) => {
    const name = e.target.value;
    setSelectedCompany(name);
    fetchCompanyBenchmark(name);
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 min-h-screen rounded-[36px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
        <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Calculating Peer Diagnostics...</p>
      </div>
    );
  }

  const totalRejections = analyticsData?.stage_distribution 
    ? Object.values(analyticsData.stage_distribution).reduce((a, b) => a + b, 0) 
    : 0;

  return (
    <div className="space-y-4 select-none pb-4">
      
      {/* Title */}
      <div>
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Peer Diagnostics</span>
        <h2 className="text-xl font-black text-slate-800 font-syne">Career Benchmarks</h2>
      </div>

      {/* Detected Bottleneck */}
      <div className="bg-rose-50 border border-rose-100 rounded-3xl p-4.5 flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-[8px] text-rose-600 font-black uppercase tracking-widest block">Primary Pipeline Bottleneck</span>
          <h3 className="text-base font-black text-rose-700 leading-tight mt-0.5">
            {analyticsData?.bottleneck_stage || 'ATS Screen'}
          </h3>
          <p className="text-[10px] text-slate-500 leading-normal mt-1 font-semibold">
            Most of your application exits occur here. We recommend dedicating the majority of your recovery checklist to this area.
          </p>
        </div>
      </div>

      {/* Stage distributions bar graphs */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-xs space-y-3.5">
        <span className="text-[9px] font-black text-slate-805 uppercase tracking-widest block">Exit Stage Distributions</span>
        <div className="space-y-3">
          {analyticsData?.stage_distribution && Object.entries(analyticsData.stage_distribution).length > 0 ? (
            Object.entries(analyticsData.stage_distribution).slice(0, 4).map(([stage, count]) => {
              const pct = totalRejections > 0 ? Math.round((count / totalRejections) * 100) : 0;
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                    <span className="truncate max-w-[150px]">{stage}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 border border-slate-200/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[10px] text-slate-400 italic text-center py-2">No exit distribution data logged yet.</p>
          )}
        </div>
      </div>

      {/* Benchmarking comparator panel */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-xs space-y-4">
        
        {/* Toggle Nav */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-805 uppercase tracking-widest">Compare Benchmarks</span>
            
            {dreamMode === 'custom' && !isEditingDream && (
              <button
                onClick={() => setIsEditingDream(true)}
                className="text-[9px] font-black text-brand-600 uppercase tracking-widest cursor-pointer active:scale-90"
              >
                ⚙️ Adjust
              </button>
            )}
          </div>

          <div className="bg-slate-100 p-1 rounded-2xl flex text-[10px] font-black uppercase text-center select-none shadow-inner">
            <button
              onClick={() => { setDreamMode('custom'); setIsEditingDream(false); }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                dreamMode === 'custom' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-400'
              }`}
            >
              🎯 Dream Goals
            </button>
            <button
              onClick={() => { setDreamMode('cohort'); setIsEditingDream(false); }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                dreamMode === 'cohort' ? 'bg-white text-brand-600 shadow-xs' : 'text-slate-400'
              }`}
            >
              👥 Placed Peers
            </button>
          </div>
        </div>

        {/* Form to Edit custom targets */}
        {isEditingDream ? (
          <form onSubmit={handleDreamSave} className="space-y-3.5 text-xs font-bold text-slate-700">
            {/* Dream Company */}
            <div className="space-y-0.5">
              <label className="block text-[9px] text-slate-400 font-black uppercase tracking-wider pl-1">Target Company</label>
              <input 
                type="text" 
                required
                value={dreamForm.dream_company}
                onChange={(e) => setDreamForm({ ...dreamForm, dream_company: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-850 text-xs"
              />
            </div>

            {/* Grid for GPA, Projects, Internships */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-0.5">
                <label className="block text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-wider text-center">CGPA Target</label>
                <input 
                  type="number" 
                  step="0.1" 
                  required
                  value={dreamForm.dream_cgpa}
                  onChange={(e) => setDreamForm({ ...dreamForm, dream_cgpa: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                />
              </div>
              <div className="space-y-0.5">
                <label className="block text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-wider text-center">Projects</label>
                <input 
                  type="number" 
                  required
                  value={dreamForm.dream_projects}
                  onChange={(e) => setDreamForm({ ...dreamForm, dream_projects: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                />
              </div>
              <div className="space-y-0.5">
                <label className="block text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-wider text-center">Interns</label>
                <input 
                  type="number" 
                  required
                  value={dreamForm.dream_internships}
                  onChange={(e) => setDreamForm({ ...dreamForm, dream_internships: e.target.value })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center text-xs"
                />
              </div>
            </div>

            {/* Skills tag deck */}
            <div className="space-y-1">
              <label className="block text-[9px] text-slate-400 font-black uppercase tracking-wider pl-1">Target Skillsets</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {dreamForm.dream_skills.map((skill, idx) => (
                  <span key={idx} className="bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1">
                    {skill}
                    <X size={9} className="cursor-pointer text-brand-450 hover:text-brand-700" onClick={() => removeDreamSkill(skill)} />
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Add skill (e.g. AWS)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDreamSkill())}
                  className="flex-grow px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                />
                <button 
                  type="button" 
                  onClick={addDreamSkill} 
                  className="px-3 bg-brand-50 border border-brand-150 text-brand-600 rounded-xl hover:bg-brand-500 hover:text-white transition-all cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingDream(false)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-extrabold text-[10px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-black uppercase tracking-wider text-[10px] shadow-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          /* Normal Comparison Display */
          <div className="space-y-4">
            {dreamMode === 'cohort' && (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-450 font-bold">Placed peer averages at:</span>
                <select
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  className="bg-white border border-slate-250 border-slate-200 rounded-xl p-1.5 text-[10px] text-slate-700 font-black focus:outline-none cursor-pointer"
                >
                  {targetCompanies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {companyLoading ? (
              <div className="py-8 text-center animate-pulse flex flex-col items-center">
                <Loader2 className="w-5 h-5 animate-spin text-brand-500 mb-1" />
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Loading averages...</span>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Metric comparators list */}
                <div className="space-y-2.5">
                  {/* CGPA */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">CGPA Standing</span>
                      <span className="text-xs font-black text-slate-800">You: {profile?.cgpa ? parseFloat(profile.cgpa).toFixed(1) : '8.0'}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-200" />
                    <div className="text-right">
                      <span className="text-[8px] text-brand-505 text-brand-500 font-black uppercase tracking-wider block">Target Average</span>
                      <span className="text-xs font-black text-brand-655 text-brand-600">
                        {dreamMode === 'custom' 
                          ? (profile?.dream_cgpa ? parseFloat(profile.dream_cgpa).toFixed(1) : '8.5')
                          : (companyBenchmark?.average_cgpa ? parseFloat(companyBenchmark.average_cgpa).toFixed(1) : '8.5')}
                      </span>
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Portfolio Projects</span>
                      <span className="text-xs font-black text-slate-800">You: {profile?.project_count ?? 0}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-200" />
                    <div className="text-right">
                      <span className="text-[8px] text-brand-505 text-brand-500 font-black uppercase tracking-wider block">Target Average</span>
                      <span className="text-xs font-black text-brand-655 text-brand-600">
                        {dreamMode === 'custom'
                          ? (profile?.dream_projects ?? 3)
                          : (companyBenchmark?.average_projects ? Math.round(companyBenchmark.average_projects) : 3)}
                      </span>
                    </div>
                  </div>

                  {/* Internships */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Internship Count</span>
                      <span className="text-xs font-black text-slate-800">You: {profile?.internship_count ?? 0}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-200" />
                    <div className="text-right">
                      <span className="text-[8px] text-brand-505 text-brand-500 font-black uppercase tracking-wider block">Target Average</span>
                      <span className="text-xs font-black text-brand-655 text-brand-600">
                        {dreamMode === 'custom'
                          ? (profile?.dream_internships ?? 2)
                          : (companyBenchmark?.average_internships ? Math.round(companyBenchmark.average_internships) : 2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Placed Placed Skills Pills */}
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <span className="text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-widest block pl-0.5">Required Skills Benchmark</span>
                  <div className="flex flex-wrap gap-1">
                    {dreamMode === 'custom' ? (
                      profile?.dream_skills?.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-600 font-extrabold text-[9px] rounded-full shadow-xs flex items-center gap-1">
                          <ShieldCheck size={10} className="text-brand-500" /> {skill}
                        </span>
                      ))
                    ) : (
                      companyBenchmark?.common_skills?.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-600 font-extrabold text-[9px] rounded-full shadow-xs flex items-center gap-1">
                          <ShieldCheck size={10} className="text-brand-500" /> {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
