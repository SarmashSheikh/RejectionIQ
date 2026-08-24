import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, BarChart3, Target, CheckCircle, TrendingUp, Sparkles, 
  Filter, Award, Activity, Calendar, Flame, X, User, ArrowRight 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ total_rejections: 0, interviews_reached: 0, tasks_done: 0, tasks_total: 0 });
  const [rejections, setRejections] = useState([]);
  const [pattern, setPattern] = useState({ pattern_type: "None", dominant_stage: "N/A", avg_days: 0, recommendation: "" });
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState([]);

  // Success modal and message states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successForm, setSuccessForm] = useState({ company_name: '', role: '', salary: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllData = async () => {
    try {
      const [sRes, rRes, pRes, mRes] = await Promise.all([
        api.get('/rejections/stats'),
        api.get('/rejections/'),
        api.get('/analysis/pattern').catch(() => ({ data: null })),
        api.get('/rejections/milestones').catch(() => ({ data: [] }))
      ]);
      setStats(sRes.data);
      setRejections(rRes.data || []);
      if (pRes && pRes.data) setPattern(pRes.data);
      if (mRes && mRes.data) setMilestones(mRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCrackSubmit = async (e) => {
    e.preventDefault();
    if (!successForm.company_name || !successForm.role) return;
    setIsSubmitting(true);
    try {
      await api.post('/rejections/crack', successForm);
      setShowSuccessModal(false);
      toast.success(`Cracked offer logged at ${successForm.company_name}! 🎉`, {
        duration: 5000,
        position: 'top-center'
      });
      setSuccessForm({ company_name: '', role: '', salary: '', notes: '' });
      await fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to log offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalApplied = stats.total_applied ?? 0;
  
  // Calculate average SBERT match score
  const validScores = rejections.filter(r => r.gap_score !== null && r.gap_score > 0).map(r => r.gap_score);
  const avgMatchScore = validScores.length > 0 
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
    : 0;

  // Calculate dynamic success splits
  const totalSuccesses = milestones.length;
  const totalRejectionsCount = stats.total_rejections;
  const totalOutcomes = totalSuccesses + totalRejectionsCount;
  const successPct = totalOutcomes > 0 ? Math.round((totalSuccesses / totalOutcomes) * 100) : 0;
  const rejectionPct = totalOutcomes > 0 ? Math.round((totalRejectionsCount / totalOutcomes) * 100) : 0;

  const funnelStages = stats.rejection_funnel || {
    "Resume Screening": 0,
    "Online Assessment": 0,
    "Technical Interview": 0,
    "HR Interview": 0
  };

  const getStageBadgeClass = (stage) => {
    if (!stage) return "bg-slate-100 text-slate-500 border border-slate-200/50";
    if (stage.includes("ATS") || stage.includes("Resume")) return "bg-rose-50 border border-rose-100/60 text-rose-600";
    if (stage.includes("Assessment") || stage.includes("Challenge") || stage.includes("Test")) return "bg-amber-50 border border-amber-100/60 text-amber-600";
    if (stage.includes("Interview") || stage.includes("Round")) return "bg-indigo-50 border border-indigo-100/60 text-indigo-650";
    if (stage.includes("Offer") || stage.includes("Final")) return "bg-emerald-50 border border-emerald-100/60 text-emerald-650";
    return "bg-slate-50 border border-slate-200/60 text-slate-600";
  };

  const getShortStageName = (stage) => {
    const map = {
      "Resume Screening": "Resume Screen",
      "ATS Filter": "ATS Filter",
      "Online Assessment / Aptitude": "Online Test",
      "Online Assessment": "Online Test",
      "Technical Interview Round 1": "Technical R1",
      "Technical Interview Round 2": "Technical R2",
      "Technical Interview": "Tech Round",
      "HR Interview": "HR Round"
    };
    return map[stage] || stage;
  };

  const userName = user?.full_name || (user?.email ? user.email.split('@')[0] : "Technologist");
  const progressRatio = stats.tasks_total ? Math.round((stats.tasks_done / stats.tasks_total) * 100) : 0;

  return (
    <div className="space-y-5 select-none pb-4">
      
      {/* Quick Dashboard Header Banner */}
      <div className="flex items-center justify-between bg-white border border-slate-100 rounded-3xl p-4.5 shadow-[0_8px_30px_rgba(0,0,0,0.015)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-50 border border-brand-100 text-brand-600 font-extrabold text-sm flex items-center justify-center rounded-2xl">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 leading-tight">Hey, {userName}!</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pro Career Member</span>
          </div>
        </div>
        
        {/* Active Streak */}
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-2xl shadow-inner shrink-0">
          <Flame size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-xs font-black text-amber-700">{stats.rebound_streak ?? 0} Days</span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => navigate('/rejection/new/step1')}
          className="flex items-center justify-center gap-1.5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-md shadow-brand-500/20 active:scale-95 transition-transform cursor-pointer"
        >
          <Plus size={14} className="stroke-[2.5]" /> Log Rejection
        </button>
        <button
          onClick={() => setShowSuccessModal(true)}
          className="flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-md shadow-amber-500/15 active:scale-95 transition-transform cursor-pointer"
        >
          <Award size={14} className="stroke-[2.5]" /> Log Success 🎉
        </button>
      </div>

      {/* Swipeable / Scrollable Stats cards */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5 select-none shrink-0 snap-x">
        {/* Applied */}
        <div className="snap-start min-w-[145px] bg-white border border-slate-100 p-3.5 rounded-2xl flex flex-col justify-between h-24 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <Calendar size={15} />
            <span className="text-[8px] bg-emerald-50 text-emerald-600 font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-100">+6 wk</span>
          </div>
          <div>
            <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Total Applied</span>
            <span className="text-xl font-black text-slate-800">{loading ? '—' : totalApplied}</span>
          </div>
        </div>

        {/* Rejections */}
        <div className="snap-start min-w-[145px] bg-white border border-slate-100 p-3.5 rounded-2xl flex flex-col justify-between h-24 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <Filter size={15} className="text-rose-500" />
            <span className="text-[8px] bg-rose-50 text-rose-600 font-extrabold px-1.5 py-0.5 rounded-full border border-rose-100">+3 wk</span>
          </div>
          <div>
            <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Rejections</span>
            <span className="text-xl font-black text-slate-800">{loading ? '—' : stats.total_rejections}</span>
          </div>
        </div>

        {/* Match score */}
        <div className="snap-start min-w-[155px] bg-white border border-slate-100 p-3.5 rounded-2xl flex flex-col justify-between h-24 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <BarChart3 size={15} className="text-brand-500" />
            <span className="text-[8px] bg-brand-50 text-brand-600 font-extrabold px-1.5 py-0.5 rounded-full border border-brand-100">{successPct}% Success</span>
          </div>
          <div>
            <span className="block text-[8px] font-black uppercase text-slate-400 tracking-wider">Avg Match Score</span>
            <span className="text-xl font-black text-brand-500">{loading ? '—' : `${avgMatchScore}%`}</span>
          </div>
        </div>
      </div>

      {/* AI Bottleneck & Insights */}
      <div className="bg-brand-500 text-white rounded-3xl p-5 shadow-lg shadow-brand-500/15 relative overflow-hidden select-none">
        {/* Glow backdrop */}
        <div className="absolute right-[-20px] top-[-20px] w-28 h-28 bg-white/10 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse-subtle shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-100">AI Bottleneck Diagnostic</span>
        </div>
        <p className="text-sm font-black leading-tight text-white mb-2">
          {pattern.pattern_type && pattern.pattern_type !== "None" ? `${pattern.pattern_type} Detected` : "ATS Screen Bottleneck"}
        </p>
        <p className="text-[11px] text-brand-100 font-semibold leading-relaxed">
          {pattern.recommendation ? pattern.recommendation : "72% of rejections occur during the ATS screening stage. Restructure your resume template and align keywords to pass resume parsers."}
        </p>
      </div>

      {/* Funnel Progress */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-xs space-y-4 select-none">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
            <Filter size={14} className="text-brand-500" /> Drop Funnel
          </h3>
          <span className="text-[8px] text-slate-400 font-extrabold uppercase">Failing stage drop</span>
        </div>

        {/* Funnel Bars */}
        <div className="space-y-3.5">
          {Object.entries(funnelStages).slice(0, 4).map(([stage, pct]) => (
            <div key={stage} className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-inner ${getStageBadgeClass(stage)}`}>
                {getShortStageName(stage)}
              </span>
              <div className="flex-1 mx-3.5 h-3.5 bg-slate-50 border border-slate-200/50 rounded-md overflow-hidden relative flex items-center shadow-inner">
                <div
                  className="h-full bg-brand-500 rounded-md transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute right-2 text-[8px] font-black text-slate-500">{pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications Card List */}
      <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-xs space-y-3 select-none">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Recent Applications</h3>
          <button 
            onClick={() => navigate('/analytics')}
            className="text-[9px] font-black text-brand-600 uppercase tracking-widest cursor-pointer active:scale-95"
          >
            See All
          </button>
        </div>

        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : rejections.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[11px] text-slate-400 italic font-semibold">No rejections logged yet.</p>
            <button 
              onClick={() => navigate('/rejection/new/step1')}
              className="text-[10px] text-brand-600 font-black uppercase tracking-widest underline mt-1.5 cursor-pointer"
            >
              Log First Rejection
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {rejections.slice(0, 3).map((r, idx) => {
              const char = r.company_name.charAt(0).toUpperCase();
              const colors = [
                "bg-purple-100 text-purple-700",
                "bg-indigo-100 text-indigo-750",
                "bg-amber-100 text-amber-700",
                "bg-rose-100 text-rose-700",
                "bg-emerald-100 text-emerald-700"
              ][char.charCodeAt(0) % 5];

              return (
                <div 
                  key={idx} 
                  onClick={() => navigate(`/rejection/diagnosis/${r.id}`)}
                  className="flex items-center justify-between p-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-100/60 rounded-2xl transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-black text-xs ${colors} border border-white`}>
                      {char}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 leading-tight">{r.company_name}</p>
                      <span className="text-[9px] text-slate-450 font-semibold">{r.role}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${getStageBadgeClass(r.rejection_stage)}`}>
                    {getShortStageName(r.rejection_stage || 'ATS Filter')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Cracked Success Modal (Overlay Drawer) */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center"
          >
            <motion.div
              initial={{ translateY: "100%" }}
              animate={{ translateY: "0%" }}
              exit={{ translateY: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white border-t border-slate-200 rounded-t-[32px] w-full max-w-[430px] p-5 shadow-2xl space-y-4 pb-8 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-500">
                    <Award size={18} className="fill-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 font-syne">Log Cracked Offer! 🎉</h3>
                    <span className="text-[9px] text-slate-400 font-semibold">Celebrate and record your triumph!</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer hover:text-slate-650"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleCrackSubmit} className="space-y-4 text-xs font-bold text-slate-700">
                {/* Company */}
                <div className="space-y-1">
                  <label className="block text-[9px] text-slate-400 font-black uppercase tracking-wider pl-1">Company Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Google, Stripe, Netflix"
                    value={successForm.company_name}
                    onChange={(e) => setSuccessForm({ ...successForm, company_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="block text-[9px] text-slate-400 font-black uppercase tracking-wider pl-1">Role Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Software Engineer, Tech Lead"
                    value={successForm.role}
                    onChange={(e) => setSuccessForm({ ...successForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                {/* Salary */}
                <div className="space-y-1">
                  <label className="block text-[9px] text-slate-400 font-black uppercase tracking-wider pl-1">CTC Package / Salary (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. $130,000 / 15 LPA"
                    value={successForm.salary}
                    onChange={(e) => setSuccessForm({ ...successForm, salary: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 text-xs"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="block text-[9px] text-slate-400 font-black uppercase tracking-wider pl-1">Notes & Celebration Words (Optional)</label>
                  <textarea 
                    placeholder="e.g. Resilience pays off! Interview diagnostic helped me fix system design gaps!"
                    value={successForm.notes}
                    onChange={(e) => setSuccessForm({ ...successForm, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 text-xs h-18 resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-100 mt-5">
                  <button
                    type="button"
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl font-bold transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? 'Saving Offer...' : 'Save Triumph! 🏆'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
