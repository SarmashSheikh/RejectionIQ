import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BarChart3, Target, CheckCircle, TrendingUp, Sparkles, Filter, Award, Activity, Smile, Calendar, Flame, X } from 'lucide-react';
import api from '../../api/axios';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_rejections: 0, interviews_reached: 0, tasks_done: 0, tasks_total: 0 });
  const [rejections, setRejections] = useState([]);
  const [pattern, setPattern] = useState({ pattern_type: "None", dominant_stage: "N/A", avg_days: 0, recommendation: "" });
  const [loading, setLoading] = useState(true);

  // Success modal and message states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successForm, setSuccessForm] = useState({ company_name: '', role: '', salary: '', notes: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestones, setMilestones] = useState([]);
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
      if (pRes && pRes.data) {
        setPattern(pRes.data);
      }
      if (mRes && mRes.data) {
        setMilestones(mRes.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
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
      setSuccessMessage(`Successfully logged your cracked offer at ${successForm.company_name}! 🎉`);
      setSuccessForm({ company_name: '', role: '', salary: '', notes: '' });
      await fetchAllData();
      
      // Auto-hide success message banner after 6 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 6000);
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const totalApplied = stats.total_applied ?? 0;
  
  // Calculate average SBERT match score from DB or fall back to 0
  const validScores = rejections.filter(r => r.gap_score !== null && r.gap_score > 0).map(r => r.gap_score);
  const avgMatchScore = validScores.length > 0 
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
    : 0;

  // Calculate dynamic success and rejection percentage
  const totalSuccesses = milestones.length;
  const totalRejectionsCount = stats.total_rejections;
  const totalOutcomes = totalSuccesses + totalRejectionsCount;
  const successPct = totalOutcomes > 0 ? Math.round((totalSuccesses / totalOutcomes) * 100) : 0;
  const rejectionPct = totalOutcomes > 0 ? Math.round((totalRejectionsCount / totalOutcomes) * 100) : 0;

  const funnelStages = stats.rejection_funnel || {
    "Resume Screening": 0,
    "Online Assessment / Aptitude": 0,
    "Communication Assessment": 0,
    "Coding Challenge": 0,
    "Technical Interview Round 1": 0,
    "Technical Interview Round 2": 0,
    "Group Discussion (Optional)": 0,
    "Managerial Interview": 0,
    "HR Interview": 0,
    "Background Verification": 0,
    "Offer Approval / Final Selection": 0
  };

  // Shorten premium stage names for beautiful compact rendering in the funnel
  const getShortStageName = (stage) => {
    const map = {
      "Resume Screening": "Resume Screen",
      "ATS Filter": "ATS Filter",
      "Online Assessment / Aptitude": "Online Test",
      "OA Rejection": "OA Test",
      "Communication Assessment": "Comm Screen",
      "Coding Challenge": "Coding Test",
      "Technical Interview Round 1": "Technical R1",
      "Technical Round": "Tech R1",
      "Technical Interview Round 2": "Technical R2",
      "Group Discussion (Optional)": "Group Disc.",
      "Managerial Interview": "Managerial",
      "HR Interview": "HR Round",
      "HR Screen": "HR Screen",
      "Background Verification": "Verification",
      "Offer Approval / Final Selection": "Offer Stage",
      "Final Round": "Final Round"
    };
    return map[stage] || stage;
  };

  // Tone color mapper for stage pills
  const getStageBadgeClass = (stage) => {
    if (!stage) return "bg-slate-100 text-slate-600";
    if (stage.includes("ATS") || stage.includes("Resume")) return "bg-rose-50 border border-rose-100 text-rose-600 font-extrabold text-[10px]";
    if (stage.includes("OA") || stage.includes("Assessment") || stage.includes("Aptitude") || stage.includes("Challenge")) return "bg-amber-50 border border-amber-100 text-amber-600 font-extrabold text-[10px]";
    if (stage.includes("HR") || stage.includes("Communication") || stage.includes("Discussion") || stage.includes("Group")) return "bg-violet-50 border border-violet-100 text-violet-755 text-violet-750 font-extrabold text-[10px]";
    if (stage.includes("Tech") || stage.includes("Coding")) return "bg-indigo-50 border border-indigo-100 text-indigo-750 font-extrabold text-[10px]";
    if (stage.includes("Offer") || stage.includes("Final") || stage.includes("Verification") || stage.includes("Managerial")) return "bg-emerald-50 border border-emerald-100 text-emerald-750 font-extrabold text-[10px]";
    return "bg-slate-50 border border-slate-100 text-slate-700 font-extrabold text-[10px]";
  };

  // Color mapper for match scores
  const getScoreColorClass = (score) => {
    if (score >= 75) return "text-emerald-600 font-bold";
    if (score >= 55) return "text-amber-600 font-bold";
    return "text-rose-600 font-bold";
  };

  // Safe username extraction
  const userName = user?.email ? user.email.split('@')[0] : "Technologist";

  // Recovery progress math
  const progressRatio = stats.tasks_total ? Math.round((stats.tasks_done / stats.tasks_total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* Success Message Banner */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 font-extrabold text-sm flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700 cursor-pointer p-1">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        
        {/* Welcome Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">Welcome back, {userName}! 👋</h1>
            <p className="text-slate-500 font-semibold text-sm">Here is a diagnostic overview of your job search re-bouncing analytics.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Log Success / Cracked Job! Action Button */}
            <button
              onClick={() => setShowSuccessModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-amber-250 cursor-pointer"
            >
              <Award className="w-4 h-4" /> Log Success 🎉
            </button>
            
            <button
              onClick={() => navigate('/rejection/new/step1')}
              className="flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-violet-250 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Rejection
            </button>
          </div>
        </div>

        {/* 4 Stat Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
        >
          {/* Card 1: Total Applied */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-lg text-slate-650 shrink-0">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <TrendingUp className="w-3 h-3" /> +6 this week
              </span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Applied</span>
              <span className="text-3xl font-extrabold text-slate-900">{loading ? '—' : totalApplied}</span>
            </div>
          </div>

          {/* Card 2: Rejections */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 shrink-0">
                <Filter className="w-5 h-5 text-rose-500" />
              </div>
              <span className="flex items-center gap-1 text-[10px] text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                <TrendingUp className="w-3 h-3" /> +3 this week
              </span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Rejections</span>
              <span className="text-3xl font-extrabold text-slate-900">{loading ? '—' : stats.total_rejections}</span>
            </div>
          </div>

          {/* Card 3: Avg Match Score & Outcome % */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-violet-50 border border-violet-100 rounded-lg text-violet-650 shrink-0">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                🎯 {successPct}% Success
              </span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Avg. Match Score</span>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-extrabold text-violet-600">{loading ? '—' : `${avgMatchScore}%`}</span>
                <span className="text-[10px] text-slate-400 font-semibold">Match alignment</span>
              </div>
              
              {/* Outcome split ratio bar */}
              <div className="h-2 w-full bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden flex mb-1.5 shadow-inner">
                {totalOutcomes > 0 ? (
                  <>
                    <div 
                      className="h-full bg-emerald-500 rounded-l-full transition-all"
                      style={{ width: `${successPct}%` }}
                      title={`Success: ${successPct}%`}
                    />
                    <div 
                      className="h-full bg-rose-500 rounded-r-full transition-all"
                      style={{ width: `${rejectionPct}%` }}
                      title={`Rejection: ${rejectionPct}%`}
                    />
                  </>
                ) : (
                  <div className="h-full w-full bg-slate-200" title="No outcomes logged" />
                )}
              </div>
              <div className="flex items-center justify-between text-[9px] font-extrabold uppercase text-slate-500">
                <span className="text-emerald-600">Success: {successPct}%</span>
                <span className="text-rose-600">Rejection: {rejectionPct}%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Streak */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-600 shrink-0">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-750 text-[10px] font-extrabold rounded-full">
                Active Streak
              </span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">Rebound Streak</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-slate-900">{loading ? '—' : (stats.rebound_streak ?? 0)}</span>
                <span className="text-xs font-extrabold text-slate-400 uppercase">Days Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Core Sections: Funnel & Recent Applications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Rejection Funnel Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Filter className="w-4 h-4 text-violet-650" /> Rejection Funnel
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Where you get cut</span>
              </div>

              {/* Vertical Stack Funnel Bars */}
              <div className="space-y-4 mb-6">
                {Object.entries(funnelStages).map(([stage, pct]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase shadow-sm ${getStageBadgeClass(stage)}`}>
                      {getShortStageName(stage)}
                    </span>
                    <div className="flex-1 mx-4 h-5 bg-slate-50 border border-slate-200/50 rounded-lg overflow-hidden flex items-center relative">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute right-2.5 text-[10px] font-extrabold text-slate-650">{pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insight banner */}
            <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-violet-650 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-violet-750 uppercase tracking-widest font-extrabold mb-1">AI Bottleneck Insight</p>
                <p className="text-slate-750 text-slate-700 text-xs font-bold leading-relaxed">
                  {pattern.recommendation ? pattern.recommendation : "72% ATS rejection is your biggest bottleneck. Your resume is not passing keyword filters for Software Engineering roles. Priority: restructure layouts + add missing keywords from JDs."}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Recent Applications Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between p-6 border-b border-slate-200/60">
                <h3 className="font-extrabold text-slate-900 text-base">Recent Applications</h3>
                <button
                  onClick={() => navigate('/analytics')}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-extrabold transition-all"
                >
                  View All
                </button>
              </div>

              {/* Table rendering recent logs */}
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
                </div>
              ) : rejections.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <p className="mb-4 font-bold text-slate-500">No rejections logged yet.</p>
                  <button
                    onClick={() => navigate('/rejection/new/step1')}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-750 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Log Your First Rejection
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">
                        <th className="py-3 px-6">Company</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3 text-center">Stage</th>
                        <th className="py-3 px-6 text-right">SBERT Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {rejections.slice(0, 5).map((r, idx) => {
                        // Generate color palette based on first letter of company
                        const firstChar = r.company_name.charAt(0).toUpperCase();
                        const colorCode = firstChar.charCodeAt(0) % 5;
                        const avatarColors = [
                          "bg-purple-100 text-purple-700 border-purple-200",
                          "bg-emerald-100 text-emerald-700 border-emerald-200",
                          "bg-amber-100 text-amber-700 border-amber-200",
                          "bg-rose-100 text-rose-700 border-rose-200",
                          "bg-indigo-100 text-indigo-700 border-indigo-200"
                        ][colorCode];

                        const roundedScore = r.gap_score ? Math.round(r.gap_score) : 63;

                        return (
                          <tr key={idx} className="hover:bg-slate-50/30 transition-colors text-xs font-bold text-slate-800">
                            <td className="py-4 px-6 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-extrabold text-sm ${avatarColors}`}>
                                {firstChar}
                              </div>
                              <span className="font-extrabold text-slate-900">{r.company_name}</span>
                            </td>
                            <td className="py-4 px-3 text-slate-500 font-semibold">{r.role}</td>
                            <td className="py-4 px-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full ${getStageBadgeClass(r.rejection_stage)}`}>
                                {r.rejection_stage || "ATS Filter"}
                              </span>
                            </td>
                            <td className={`py-4 px-6 text-right ${getScoreColorClass(roundedScore)}`}>
                              {roundedScore}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/45 text-center text-[10px] text-slate-400 font-semibold">
              Showing your most recent job applications. Keep logging rejections to map comprehensive funnel details.
            </div>
          </motion.div>
        </div>

        {/* Bottom Metrics: Resilience & Sprint Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Resilience Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Resilience Score</h3>
                <span className="text-slate-400 text-xs font-semibold">Composite wellness metric</span>
              </div>

              <div className="flex items-center gap-6 mb-6">
                {/* Radial Resilience Score gauge */}
                <div className="relative w-24 h-24 flex items-center justify-center bg-slate-50 border border-slate-200/50 rounded-full shadow-inner">
                  <span className="text-4xl font-extrabold text-violet-650">{loading ? '—' : (stats.resilience_score ?? 0)}</span>
                  <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 border-t-violet-600 animate-spin-slow" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 flex-1">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Task Rate</span>
                    <span className="text-base font-extrabold text-emerald-600">{loading ? '—' : `${stats.task_rate ?? 0}%`}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Day Streak</span>
                    <span className="text-base font-extrabold text-slate-800">{loading ? '—' : `${stats.rebound_streak ?? 0} Days`}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-extrabold uppercase mb-0.5">Today's Mood</span>
                    <span className="text-base font-bold flex items-center gap-1">😊 <span className="text-[10px] text-slate-400 font-bold">{loading ? '—' : (stats.today_mood ?? 'N/A')}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-Day Activity Grid Blocks & Milestones */}
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-4">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-extrabold">
                <span>7-Day Checkins</span>
                <span>Milestones & Offers</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Checkins */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {(!loading && stats.activity_logs ? stats.activity_logs : [false, false, false, false, false, false, false]).map((active, index) => {
                      const activeClass = active 
                        ? "bg-violet-600 border-violet-700 shadow-sm" 
                        : "bg-slate-200 border-slate-300";
                      return (
                        <div 
                          key={index} 
                          className={`w-6 h-6 rounded-md border flex items-center justify-center text-[9px] font-bold text-white transition-transform hover:scale-105 ${activeClass}`}
                        >
                          {index + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Milestones list */}
                <div className="max-h-[85px] overflow-y-auto pr-1">
                  {milestones.length > 0 ? (
                    <div className="space-y-1.5">
                      {milestones.slice(0, 3).map((m, i) => (
                        <div key={i} className="flex items-center gap-1.5 p-1.5 bg-amber-50/50 border border-amber-100 rounded-lg text-[9px] font-extrabold text-amber-700 shadow-sm animate-pulse">
                          <Award className="w-3.5 h-3.5 shrink-0 text-amber-500 fill-amber-500" />
                          <span className="truncate">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-400 italic font-semibold leading-relaxed">
                      No offers cracked yet. Double your resilience prep!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sprint Progress Widget Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">Sprint Progress</h3>
                <button
                  onClick={() => navigate('/recovery')}
                  className="px-3.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-250 text-slate-650 rounded-lg text-xs font-extrabold transition-all cursor-pointer border-slate-200"
                >
                  Open Plan
                </button>
              </div>

              <div className="flex items-center gap-6 mb-4">
                {/* Ring indicator */}
                <div className="relative w-20 h-20 flex items-center justify-center bg-slate-50 border border-slate-200/50 rounded-full shrink-0">
                  <span className="text-xl font-extrabold text-slate-800">{progressRatio}%</span>
                  <div className="absolute inset-0 rounded-full border-4 border-slate-150 border-r-emerald-500" />
                </div>
                
                <div>
                  <p className="text-[10px] text-violet-750 uppercase tracking-widest font-extrabold mb-1">Active Bottleneck Track</p>
                  <p className="text-slate-800 font-bold text-sm mb-1">
                    {pattern.pattern_type && pattern.pattern_type !== "None" ? `${pattern.pattern_type} Bottleneck recovery track` : "No active bottleneck track"}
                  </p>
                  <div className="flex items-center gap-2">
                    {stats.tasks_total > 0 ? (
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-[9px] rounded-full">
                        Week 1 Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-extrabold text-[9px] rounded-full">
                        No Active Sprint
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="pt-4 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-extrabold uppercase">
                <div className={`p-2 rounded-lg border ${progressRatio >= 25 ? 'bg-emerald-50/50 text-emerald-750 border-emerald-100' : 'bg-slate-50/60 text-slate-400 border-slate-200/50'}`}>
                  Week 1: Focus {progressRatio >= 25 ? '✅' : '⚡'}
                </div>
                <div className={`p-2 rounded-lg border ${progressRatio >= 50 ? 'bg-emerald-50/50 text-emerald-750 border-emerald-100' : 'bg-slate-50/60 text-slate-400 border-slate-200/50'}`}>
                  Week 2: Practice {progressRatio >= 50 ? '✅' : '⚡'}
                </div>
                <div className={`p-2 rounded-lg border ${progressRatio >= 100 ? 'bg-emerald-50/50 text-emerald-750 border-emerald-100' : 'bg-slate-50/60 text-slate-400 border-slate-200/50'}`}>
                  Week 3-4: Rebound {progressRatio >= 100 ? '✅' : '⚡'}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Log Success / Cracked Job Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-md w-full p-6 relative overflow-hidden animate-fade-in">
            <button 
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-600">
                <Award className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-syne">Log Cracked Job Offer! 🎉</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Celebrate your success and log your dream offer!</p>
              </div>
            </div>

            <form onSubmit={handleCrackSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              {/* Company Name */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Company Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Google, TCS, Stripe"
                  value={successForm.company_name}
                  onChange={(e) => setSuccessForm({ ...successForm, company_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Role Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Fullstack Engineer, Data Analyst"
                  value={successForm.role}
                  onChange={(e) => setSuccessForm({ ...successForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Salary */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Salary / CTC Package (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. $120,000 / 12 LPA"
                  value={successForm.salary}
                  onChange={(e) => setSuccessForm({ ...successForm, salary: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Celebration Notes (Optional)</label>
                <textarea 
                  placeholder="e.g. Cracked technical design round! Resilience pays off!"
                  value={successForm.notes}
                  onChange={(e) => setSuccessForm({ ...successForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-violet-500 transition-colors h-20 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-3 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
                >
                  {isSubmitting ? 'Saving Offer...' : 'Crack This Job! 🎉'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Dynamic Keyframes for Confetti Fall & Animations */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0.3;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
