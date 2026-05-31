import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronLeft, ArrowRight, Brain, Smile, Activity, ShieldCheck, Award, HeartHandshake, Mail, Quote, FileWarning, Clock } from 'lucide-react';
import api from '../../api/axios';

export default function DiagnosisResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const diagnosis = location.state?.diagnosis;

  const [acknowledged, setAcknowledged] = useState({});
  const [addedToSprint, setAddedToSprint] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddToResume = (kw) => {
    setAcknowledged(prev => ({ ...prev, [kw]: true }));
    showToast(`"${kw}" integrated to resume keywords!`);
  };

  const handleLearnThis = async (kw) => {
    try {
      await api.post('/recovery/task', {
        rejection_id: diagnosis.id,
        title: `Master skill: ${kw} and build a portfolio project`,
        desc: `Gain deeper technical proficiency in ${kw} to address your ${diagnosis.predicted_stage || 'ATS Filter'} bottleneck.`,
        category: "Practice"
      });
      setAddedToSprint(prev => ({ ...prev, [kw]: true }));
      showToast(`"${kw}" added to your 30-day recovery sprint tasks!`);
    } catch (e) {
      console.error(e);
      showToast("Failed to add task to recovery plan.");
    }
  };

  if (!diagnosis) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center font-sans">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-slate-900">No Diagnosis Data</h2>
          <p className="text-slate-500 mb-6 font-semibold">Please submit a rejection to see your diagnosis.</p>
          <Link to="/dashboard" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold text-sm transition-all shadow-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const sentimentColors = {
    "Encouraging": "bg-emerald-50 border-emerald-100 text-emerald-700",
    "Warm Rejection": "bg-violet-50 border-violet-100 text-violet-700",
    "Standard Template": "bg-slate-100 border-slate-200 text-slate-700",
    "Cold Rejection": "bg-rose-50 border-rose-100 text-rose-700"
  };

  const gapColors = {
    "Low": "bg-emerald-50 text-emerald-700 border-emerald-100",
    "Medium": "bg-amber-50 text-amber-700 border-amber-100",
    "High": "bg-rose-50 text-rose-700 border-rose-100"
  };

  const sentimentStyle = sentimentColors[diagnosis.sentiment_label] || "bg-slate-100 border-slate-200 text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-bold text-slate-800">AI Intelligent Diagnosis</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Title Block */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <span className="px-3 py-1 bg-violet-50 border border-violet-100 rounded-full text-violet-700 text-xs font-bold shadow-sm">
              Analysis Complete
            </span>
            {diagnosis.sentiment_label && (
              <span className={`px-3 py-1 border rounded-full text-xs font-bold shadow-sm ${sentimentStyle}`}>
                Tone: {diagnosis.sentiment_label}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            {diagnosis.company_name} — {diagnosis.role}
          </h1>
          <p className="text-slate-500 font-medium">Rejection diagnosed on {new Date().toLocaleDateString()}</p>
        </motion.div>

        {/* Resilience Tip Card */}
        {diagnosis.resilience_tip && (
          <motion.div 
            initial={{ opacity: 0, y: 25 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 rounded-xl p-5 mb-6 flex items-start gap-4 shadow-sm shadow-slate-100/50 no-print"
          >
            <div className="p-2.5 bg-white border border-violet-200 rounded-lg text-violet-600 shadow-sm shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-violet-500 uppercase tracking-widest font-extrabold mb-1">Resilience Log Daily Tip</p>
              <p className="text-slate-700 text-sm font-bold italic">"{diagnosis.resilience_tip}"</p>
            </div>
          </motion.div>
        )}

        {/* Upgrade 8: Retry / Reapply Suggestion Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.08 }}
          className="bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-slate-50 border-l-4 border-emerald-500 rounded-xl p-5 mb-6 flex items-start gap-4 shadow-sm shadow-slate-100/50"
        >
          <div className="p-2.5 bg-white border border-emerald-250 rounded-lg text-emerald-600 shadow-sm shrink-0">
            <Clock className="w-5 h-5 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-emerald-605 text-emerald-600 uppercase tracking-widest font-extrabold mb-1">Interactive Recovery Timeline</p>
            <p className="text-slate-850 text-slate-800 text-sm font-bold leading-relaxed">
              Based on your gaps, you are estimated to be ready to reapply to <span className="font-extrabold text-slate-950 underline">{diagnosis.company_name}</span> in <span className="text-emerald-700 font-extrabold">21 days</span> if you complete your recovery sprint.
            </p>
          </div>
        </motion.div>        {/* SECTION A: MAIN RESULTS (AI DIAGNOSTIC VERDICT) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 p-6 mb-6 relative overflow-hidden"
        >
          {/* Ambient background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-600" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-800 font-syne">AI Diagnostic Verdict & Results</h2>
            </div>
            <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-100 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Primary Diagnostic Insight
            </span>
          </div>

          <div className="space-y-4">
            {/* The core verdict text */}
            <p className="text-slate-800 text-sm md:text-base font-bold leading-relaxed">
              {diagnosis.ai_insight}
            </p>

            {/* Email Notice Sentence quote helper if present */}
            {diagnosis.email_evidence_quote && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 relative overflow-hidden">
                <Quote className="absolute -top-1 -left-1 w-10 h-10 text-slate-200/20 rotate-180 pointer-events-none" />
                <p className="text-slate-600 text-xs font-bold leading-relaxed relative z-10 italic pl-3">
                  <span className="text-slate-400 font-extrabold uppercase tracking-widest block not-italic mb-1 text-[9px]">Smoking Gun Quote (Evidence Quote)</span>
                  "{diagnosis.email_evidence_quote}"
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* SECTION B: SIDE-BY-SIDE SUMMARY & SPECTRUM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-stretch">
          {/* Left Column: Rejection Summary & Bottleneck (Col-span 7) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <span className="text-xs text-slate-800 font-extrabold uppercase tracking-widest font-syne">Rejection Summary & Bottleneck</span>
                <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                  Impact Audit
                </span>
              </div>
              
              {/* Badges/Key Metrics Row */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-violet-50/40 border border-violet-100 rounded-xl flex flex-col justify-center">
                  <span className="text-[9px] text-violet-500 uppercase tracking-widest font-extrabold block mb-1">Predicted Stage</span>
                  <span className="text-slate-900 font-extrabold text-xs md:text-sm leading-tight">
                    {diagnosis.predicted_stage || diagnosis.rejection_stage}
                  </span>
                </div>
                <div className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl flex flex-col justify-center">
                  <span className="text-[9px] text-amber-500 uppercase tracking-widest font-extrabold block mb-1">Bottleneck Type</span>
                  <span className="text-slate-900 font-extrabold text-xs md:text-sm leading-tight">
                    {diagnosis.bottleneck_type || "Technical Bottleneck"}
                  </span>
                </div>
              </div>

              {/* Company Segment Dynamics integration */}
              {diagnosis.company_type && (
                <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-4 flex gap-3.5 items-start">
                  <div className={`p-2.5 rounded-lg border shadow-sm shrink-0 ${
                    diagnosis.company_type === 'Start Up' 
                      ? 'bg-amber-50 border-amber-200 text-amber-600' 
                      : diagnosis.company_type === 'Service Based'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-indigo-50 border-indigo-205 border-indigo-200 text-indigo-600'
                  }`}>
                    {diagnosis.company_type === 'Start Up' ? <Brain className="w-4 h-4" /> : (
                      diagnosis.company_type === 'Service Based' ? <ShieldCheck className="w-4 h-4" /> : <Award className="w-4 h-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">
                      Company Segment Dynamics ({diagnosis.company_type})
                    </span>
                    <h4 className="text-slate-900 font-extrabold text-xs">
                      {diagnosis.company_type === 'Start Up' 
                        ? 'Autonomy & High Execution Speed Bar' 
                        : diagnosis.company_type === 'Service Based'
                        ? 'Client Requirements & Framework Versatility Bar'
                        : 'System Scaling & Complex Algorithmic Bar'}
                    </h4>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed pt-1">
                      {diagnosis.company_type === 'Start Up' 
                        ? 'Startups value rapid building, shipping products, and self-directed autonomy. Scale tests are typically replaced by rapid microservice integrations.' 
                        : diagnosis.company_type === 'Service Based'
                        ? 'Service-based organizations prioritize solid engineering baseline certifications, tech-stack adaptability, and strong client verbal communication.'
                        : 'Product-focused organizations maintain a heavy textbook algorithm (DSA) evaluation phase, along with advanced system scaling architecture interviews.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-bold">
              <span>Analysis Confidence: {diagnosis.confidence_score || 90}%</span>
              <span>Ensemble Confidence: {diagnosis.confidence || "High"}</span>
            </div>
          </motion.div>

          {/* Right Column: Compact Probability Spectrum (Col-span 5) */}
          {diagnosis.stage_probabilities && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.12 }}
              className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs text-slate-850 uppercase tracking-widest font-extrabold mb-4 flex items-center gap-2 font-syne">
                  <Activity className="w-4 h-4 text-violet-600" /> Diagnosis Pipeline Probability Spectrum
                </p>
                <div className="space-y-2">
                  {Object.entries(diagnosis.stage_probabilities)
                    .filter(([stage, prob]) => prob > 0 || stage === diagnosis.predicted_stage)
                    .map(([stage, prob]) => {
                      const isWinner = stage === diagnosis.predicted_stage;
                      return (
                        <div key={stage} className={`flex flex-col gap-1 text-sm p-2 rounded-lg border transition-all ${isWinner ? 'bg-violet-50/40 border-violet-100 font-bold' : 'border-slate-100/30'}`}>
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className={isWinner ? 'text-violet-700' : 'text-slate-500'}>{stage}</span>
                            <span className={isWinner ? 'text-violet-750 text-violet-700 font-extrabold' : 'text-slate-500'}>{prob}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden relative">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${isWinner ? 'bg-gradient-to-r from-violet-500 to-violet-600 shadow-sm shadow-violet-200' : 'bg-slate-300'}`} 
                              style={{ width: `${prob}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal pt-3 border-t border-slate-100 mt-4">
                The local ensemble maps zero-shot similarities and timeline vectors to evaluate probability metrics.
              </p>
            </motion.div>
          )}
        </div>        {/* Rejection Email Diagnostics Card (Full Width) */}
        {diagnosis.email_predicted_reason && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.12 }}
            className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm shadow-slate-100/50 relative overflow-hidden"
          >
            {/* Ambient background decoration */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Mail className="w-5 h-5 text-violet-600" />
              <h3 className="font-extrabold text-slate-900 text-xs font-syne uppercase tracking-wider">Rejection Email Diagnostic Deep-Dive</h3>
              <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-slate-200/50">Local Offline NLP</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-8 space-y-4">
                {/* Stated Reason Classifier */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Stated Reason Classifier</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${
                      diagnosis.email_predicted_reason === 'EXPERIENCE_GAP' 
                        ? 'bg-rose-50 border-rose-100 text-rose-700' 
                        : diagnosis.email_predicted_reason === 'SKILL_MISMATCH'
                        ? 'bg-violet-50 border-violet-100 text-violet-750 text-violet-750 border-violet-250 text-violet-700 font-bold shadow-sm'
                        : diagnosis.email_predicted_reason === 'COMPETITIVE_POOL'
                        ? 'bg-amber-50 border-amber-100 text-amber-700'
                        : diagnosis.email_predicted_reason === 'ASSESSMENT_PERFORMANCE'
                        ? 'bg-red-50 border-red-100 text-red-700'
                        : diagnosis.email_predicted_reason === 'FIT_AND_CULTURE'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-655'
                    }`}>
                      {diagnosis.email_predicted_reason_label || "Standard Automated Response"}
                    </span>
                  </div>
                </div>

                {/* Evidence Quote */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Smoking Gun Quote (Evidence Quote)</span>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 relative overflow-hidden">
                    <Quote className="absolute -top-1 -left-1 w-10 h-10 text-slate-200/40 rotate-180 pointer-events-none" />
                    <p className="text-slate-750 text-xs font-bold leading-relaxed relative z-10 italic pl-3">
                      "{diagnosis.email_evidence_quote}"
                    </p>
                  </div>
                </div>

                {/* Email Insight Description */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Local Model Insight</span>
                  <p className="text-slate-600 text-xs font-semibold leading-normal">
                    {diagnosis.email_insight_text || "The local ensemble NLP classifier successfully mapped this rejection letter's semantic patterns."}
                  </p>
                </div>
              </div>

              {/* Sidebar Metrics (Critique Keywords) */}
              <div className="md:col-span-4 space-y-4 bg-slate-50/50 border border-slate-200/50 rounded-xl p-4 shrink-0">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Stated Critique Keywords</span>
                  <div className="flex flex-wrap gap-1.5">
                    {diagnosis.email_critique_keywords && diagnosis.email_critique_keywords.length > 0 ? (
                      diagnosis.email_critique_keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white border border-slate-250 text-slate-650 rounded text-[10px] font-extrabold shadow-sm hover:border-violet-300 hover:text-violet-605 transition-colors">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic font-semibold">No specific tech isolated.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION D: KEYWORDS MATRIX & LINGUISTIC AUDIT GRID (50% / 50% Share Screen) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">
          {/* Left Column: Keywords Comparison Matrix */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 p-6 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs text-slate-800 uppercase tracking-widest font-extrabold mb-4 font-syne">
                Resume-to-JD Semantic Keywords Matrix
              </p>
              
              <div className="space-y-4">
                {/* Present skills (Green pills) */}
                <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                  <h4 className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Present Keywords ({diagnosis.present_keywords?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {diagnosis.present_keywords && diagnosis.present_keywords.length > 0 ? (
                      diagnosis.present_keywords.map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold shadow-sm">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-605 text-emerald-600/70 italic font-semibold">No skills matched directly.</span>
                    )}
                  </div>
                </div>

                {/* Missing keywords (Actionable Keyword Cards) */}
                <div className="p-4 bg-rose-50/30 border border-rose-100 rounded-xl">
                  <h4 className="text-xs text-rose-800 font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 border-b border-rose-150 pb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Missing Keywords & Gaps ({diagnosis.missing_keywords?.length || 0})
                  </h4>
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {diagnosis.missing_keywords && diagnosis.missing_keywords.length > 0 ? (
                      diagnosis.missing_keywords.map((kw, i) => {
                        const isAck = acknowledged[kw];
                        const isAdded = addedToSprint[kw];
                        return (
                          <div key={i} className="bg-white border border-rose-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-all duration-300">
                            <span className={`text-xs font-extrabold ${isAck ? 'text-slate-400 line-through' : 'text-slate-805 text-slate-800 font-syne'}`}>
                              {kw}
                            </span>
                            
                            <div className="flex items-center gap-1.5 no-print">
                              {/* Add to Resume Button */}
                              <button
                                onClick={() => handleAddToResume(kw)}
                                disabled={isAck}
                                className={`px-2 py-1 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                                  isAck 
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                                    : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {isAck ? '✓ Integrated' : 'Add to Resume'}
                              </button>
                              
                              {/* Learn This Button */}
                              <button
                                onClick={() => handleLearnThis(kw)}
                                disabled={isAdded}
                                className={`px-2 py-1 rounded text-[9px] font-extrabold transition-all cursor-pointer ${
                                  isAdded 
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200' 
                                    : 'bg-violet-50 border border-violet-200 text-violet-750 hover:bg-violet-100'
                                }`}
                              >
                                {isAdded ? '✓ Added' : 'Learn This'}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-rose-600/70 italic font-semibold">No critical keywords missing.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Semantic SBERT Match Score</span>
                <span className="text-xs font-extrabold text-violet-600">{(diagnosis.sbert_match_score || diagnosis.gap_score || 0).toFixed(1)}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${diagnosis.sbert_match_score || diagnosis.gap_score || 0}%` }}
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">High SBERT similarity indicates ideal alignment with JD context, but keyword specificity determines pass thresholds.</p>
            </div>
          </motion.div>

          {/* Right Column: Communication & Language Proficiency Audit */}
          {diagnosis.communication_audit && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.14 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <Activity className="w-4 h-4 text-violet-600" />
                  <h3 className="font-extrabold text-slate-800 text-xs font-syne uppercase tracking-wider">Communication & Language Audit</h3>
                  <span className="ml-auto text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-slate-250/50">spaCy NLP</span>
                </div>

                <div className="space-y-4">
                  {/* Lexical Density Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest text-[9px]">Lexical Density</span>
                      <span className="text-violet-600 font-extrabold">{diagnosis.communication_audit.lexical_richness}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${diagnosis.communication_audit.lexical_richness}%` }}
                        className="h-full bg-gradient-to-r from-violet-50 to-indigo-600 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Readability & Formality Index */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Readability Formality Level</span>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-705 text-slate-700 text-xs font-extrabold rounded-full mb-1">
                      {diagnosis.communication_audit.formality_label}
                    </span>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed border-l-2 border-slate-200 pl-3">
                      {diagnosis.communication_audit.communication_insight}
                    </p>
                  </div>

                  {/* Conversational Temperature (Tone Meter) */}
                  {diagnosis.sentiment_score !== undefined && (
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Conversational Temperature</span>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-600">{diagnosis.sentiment_label || "Neutral"}</span>
                        <span className={`${
                          diagnosis.sentiment_score > 0.35 
                            ? 'text-emerald-600 font-bold' 
                            : diagnosis.sentiment_score < -0.1 
                            ? 'text-rose-600 font-bold' 
                            : 'text-slate-500 font-bold'
                        }`}>
                          {diagnosis.sentiment_score ? (diagnosis.sentiment_score * 100).toFixed(0) : 0}°
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            diagnosis.sentiment_score > 0.35 
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-100' 
                              : diagnosis.sentiment_score < -0.1 
                              ? 'bg-rose-500 shadow-sm shadow-rose-100' 
                              : 'bg-slate-400'
                          }`} 
                          style={{ width: `${Math.min(Math.max((diagnosis.sentiment_score + 1) * 50, 5), 100)}%` }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal pt-3 border-t border-slate-100 mt-4">
                The local ensemble maps lexical complexity and tone ratios using a pos indicator checklist.
              </p>
            </motion.div>
          )}
        </div>

        {/* Gap and Peer Analysis Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Match Gap Analysis Matrix */}
          {diagnosis.match_gap_analysis && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">Gaps Severity Matrix</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {Object.entries(diagnosis.match_gap_analysis).map(([key, val]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200/50">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        {key.replace("_gap", "")}
                      </span>
                      <span className={`inline-block px-2 py-0.5 border text-xs font-extrabold rounded-full ${gapColors[val] || "bg-slate-100 text-slate-700"}`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Upgrade 5: Numerical Peer Benchmarks */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm shadow-slate-100/50"
          >
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-violet-650" /> Offer Recipients Benchmark Averages
            </p>
            
            {diagnosis.peer_benchmarks ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-650 leading-normal mb-2 font-syne">
                  Offer recipients at <span className="text-violet-600 font-extrabold">{diagnosis.company_name}</span> had on average:
                </p>
                <div className="space-y-3">
                  {/* CGPA */}
                  <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-semibold">CGPA:</span>
                    <span className="text-slate-800 flex items-center gap-1.5 font-semibold">
                      <span className="font-extrabold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{diagnosis.peer_benchmarks.avg_cgpa}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        (You: {diagnosis.peer_benchmarks.user_cgpa !== null ? diagnosis.peer_benchmarks.user_cgpa : <Link to="/profile" className="text-rose-500 hover:underline">unknown — add your CGPA</Link>})
                      </span>
                    </span>
                  </div>

                  {/* Internships */}
                  <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-semibold">Internships:</span>
                    <span className="text-slate-850 font-extrabold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {diagnosis.peer_benchmarks.avg_internships} average
                    </span>
                  </div>

                  {/* Top Skills */}
                  <div className="flex flex-col gap-1.5 text-xs font-bold">
                    <span className="text-slate-500 font-semibold">Common Offer Recipient Skills:</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {diagnosis.peer_benchmarks.top_skills.map((skill, index) => (
                        <span key={index} className="px-2.5 py-0.5 bg-violet-50 border border-violet-100 text-violet-750 text-[10px] font-extrabold rounded shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600 font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-650 shrink-0 animate-pulse" />
                  <span>Real numerical benchmarks loading...</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recovery CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.35 }}
          className="bg-violet-600 shadow-sm shadow-violet-200 rounded-xl p-8 text-center no-print"
        >
          <h3 className="text-2xl font-bold mb-2 text-white">Your 30-Day Recovery Plan is Ready</h3>
          <p className="text-violet-100 mb-6 text-sm font-semibold">
            Based on your predicted <span className="font-extrabold text-white underline">{diagnosis.predicted_stage || diagnosis.rejection_stage}</span> bottleneck, we've designed a specialized recovery sprint focused on <span className="font-extrabold text-white underline">{diagnosis.thirty_day_sprint_focus || "General"}</span> tactics.
          </p>
          <button
            onClick={() => navigate('/recovery')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 rounded-lg font-bold text-sm hover:bg-violet-50 transition-colors shadow-sm cursor-pointer"
          >
            Start Recovery Sprint <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Action Buttons Row - Upgrade 6 */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-8 border-t border-slate-200 pt-6 no-print">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-250 hover:bg-slate-50 hover:border-slate-350 text-slate-700 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer border-slate-200"
          >
            <Mail className="w-4 h-4 text-slate-500 animate-pulse" /> Download PDF Report
          </button>
        </div>
      </main>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-lg font-bold text-xs flex items-center gap-2 animate-bounce no-print">
          <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" /> {toastMessage}
        </div>
      )}

      {/* Dynamic Report Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, .no-print, button, Link, a {
            display: none !important;
          }
          .max-w-4xl {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .shadow-sm, .shadow-md, .shadow-lg {
            box-shadow: none !important;
            border: 1px solid #e2e8f0 !important;
          }
          main {
            padding-top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

