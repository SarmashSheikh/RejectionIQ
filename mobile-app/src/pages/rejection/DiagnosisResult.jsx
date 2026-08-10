import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, ChevronLeft, ArrowRight, Brain, Smile, 
  Activity, ShieldCheck, Award, HeartHandshake, Mail, Quote, 
  Clock, CheckCircle, Info 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function DiagnosisResult() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acknowledged, setAcknowledged] = useState({});
  const [addedToSprint, setAddedToSprint] = useState({});

  const fetchDiagnosis = async () => {
    try {
      const res = await api.get(`/rejections/${id}/status`);
      setDiagnosis(res.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load diagnosis details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDiagnosis();
  }, [id]);

  const handleAddToResume = (kw) => {
    setAcknowledged(prev => ({ ...prev, [kw]: true }));
    toast.success(`"${kw}" integrated to resume keywords!`);
  };

  const handleLearnThis = async (kw) => {
    try {
      await api.post('/recovery/task', {
        rejection_id: parseInt(id),
        title: `Master skill: ${kw} and build a portfolio project`,
        desc: `Gain deeper technical proficiency in ${kw} to address your ${diagnosis.rejection_stage || 'ATS Filter'} bottleneck.`,
        category: "Practice"
      });
      setAddedToSprint(prev => ({ ...prev, [kw]: true }));
      toast.success(`"${kw}" added to your recovery checklist! ⚡`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to add task to recovery sprint.");
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 min-h-screen rounded-[36px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
        <p className="text-xs text-slate-400 font-extrabold uppercase tracking-widest">Loading report...</p>
      </div>
    );
  }

  if (!diagnosis) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 min-h-screen rounded-[36px]">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-base font-black text-slate-900 font-syne mb-1">No Diagnosis Loaded</h2>
        <p className="text-xs text-slate-400 font-semibold mb-6 px-6">Please submit or select a logged rejection first.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-500/15"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const sentimentColors = {
    "Encouraging": "bg-emerald-50 border-emerald-100/60 text-emerald-700",
    "Warm Rejection": "bg-brand-50 border-brand-100/60 text-brand-600",
    "Standard Template": "bg-slate-100 border-slate-200/50 text-slate-650",
    "Cold Rejection": "bg-rose-50 border-rose-100/60 text-rose-650"
  };

  const gapColors = {
    "Low": "bg-emerald-50 border-emerald-100/60 text-emerald-700",
    "Medium": "bg-amber-50 border-amber-100/60 text-amber-700",
    "High": "bg-rose-50 border-rose-100/60 text-rose-700"
  };

  const sentimentStyle = sentimentColors[diagnosis.sentiment_label] || "bg-slate-50 border-slate-200/50 text-slate-600";

  return (
    <div className="space-y-4 select-none pb-4">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-[11px] font-black text-brand-605 text-brand-600 uppercase tracking-widest cursor-pointer hover:text-brand-700 active:scale-95"
        >
          <ChevronLeft size={14} className="stroke-[2.5]" /> Dashboard
        </button>
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Report Complete</span>
      </div>

      {/* Main Hero Header Info Card */}
      <div className="bg-white border border-slate-105 border-slate-100 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.015)] space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-600 font-extrabold text-[8px] rounded-full uppercase tracking-wider">
            Analysis Verified
          </span>
          {diagnosis.sentiment_label && (
            <span className={`px-2 py-0.5 border rounded-full text-[8px] font-extrabold uppercase tracking-wider ${sentimentStyle}`}>
              Tone: {diagnosis.sentiment_label}
            </span>
          )}
        </div>

        <div>
          <h2 className="text-xl font-black text-slate-800 leading-tight font-syne">{diagnosis.company_name}</h2>
          <span className="text-xs text-slate-450 font-bold leading-none">{diagnosis.role}</span>
        </div>

        {/* Timed reapply progress banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs">
          <Clock size={16} className="text-emerald-500 animate-pulse shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block">Reapply timeline target</span>
            <p className="text-[11px] text-slate-750 text-slate-750 text-slate-700 font-bold leading-normal">
              Estimated ready to reapply to <span className="font-extrabold text-slate-900">{diagnosis.company_name}</span> in <span className="text-emerald-700 font-black">21 Days</span> if recovery task checklists are fulfilled!
            </p>
          </div>
        </div>
      </div>

      {/* Primary AI Insight Verdict Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
          <Brain size={16} className="text-brand-550 text-brand-500" />
          <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">AI Introspective Diagnostic</span>
        </div>
        <p className="text-slate-750 text-slate-700 text-xs font-bold leading-relaxed">
          {diagnosis.ai_insight || diagnosis.diagnosed_cause}
        </p>

        {/* Smoking Gun Quote Notice */}
        {diagnosis.email_evidence_quote && (
          <div className="mt-3.5 bg-slate-50 border border-slate-200/50 rounded-2xl p-3 relative overflow-hidden">
            <Quote className="absolute -top-1 -left-1 w-8 h-8 text-slate-200/30 rotate-180 pointer-events-none" />
            <div className="relative z-10 pl-2">
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Smoking Gun Quote</span>
              <p className="text-[10px] text-slate-600 font-extrabold italic leading-relaxed">
                "{diagnosis.email_evidence_quote}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Semantic Keyword Gaps Panel */}
      <div className="bg-white border border-slate-105 border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">JD Match & Keywords Gaps</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-brand-600 font-black">
              {(diagnosis.sbert_match_score || diagnosis.gap_score || 0).toFixed(0)}% Similarity
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
              style={{ width: `${diagnosis.sbert_match_score || diagnosis.gap_score || 0}%` }}
            />
          </div>
        </div>

        {/* Present Skills Tags */}
        {diagnosis.present_keywords && diagnosis.present_keywords.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest block pl-0.5">Present Match Skills</span>
            <div className="flex flex-wrap gap-1">
              {diagnosis.present_keywords.map((kw, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-[9px] rounded-full shadow-xs">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords Actions deck */}
        {diagnosis.missing_keywords && diagnosis.missing_keywords.length > 0 && (
          <div className="space-y-2">
            <span className="text-[8px] text-slate-405 text-slate-400 font-black uppercase tracking-widest block pl-0.5">Missing Skills & Gaps</span>
            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
              {diagnosis.missing_keywords.map((kw, idx) => {
                const isAck = acknowledged[kw];
                const isAdded = addedToSprint[kw];
                return (
                  <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-2.5 flex items-center justify-between gap-3 shadow-xs">
                    <span className={`text-xs font-extrabold ${isAck ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{kw}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAddToResume(kw)}
                        disabled={isAck}
                        className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isAck 
                            ? 'bg-slate-150 border border-slate-200 text-slate-450' 
                            : 'bg-emerald-50 border border-emerald-150 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isAck ? '✓ Added' : 'Add CV'}
                      </button>
                      <button
                        onClick={() => handleLearnThis(kw)}
                        disabled={isAdded}
                        className={`px-2 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isAdded 
                            ? 'bg-slate-150 border border-slate-200 text-slate-450' 
                            : 'bg-brand-50 border border-brand-150 text-brand-600 hover:bg-brand-100'
                        }`}
                      >
                        {isAdded ? '✓ Sprint' : 'Learn'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* spaCy communication insights */}
      {diagnosis.communication_audit && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Activity size={14} className="text-brand-500" />
            <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest"> spaCy NLP Wording Audit</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-extrabold">
            <span className="text-slate-400 uppercase tracking-widest pl-0.5">Lexical Richness</span>
            <span className="text-brand-600">{diagnosis.communication_audit.lexical_richness}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${diagnosis.communication_audit.lexical_richness}%` }}
            />
          </div>
          <p className="text-slate-600 text-xs font-bold leading-normal border-l-2 border-slate-200 pl-3.5 py-0.5">
            {diagnosis.communication_audit.communication_insight}
          </p>
        </div>
      )}

      {/* Probability Funnel Map */}
      {diagnosis.stage_probabilities && (
        <div className="bg-white border border-slate-105 border-slate-100 rounded-3xl p-5 shadow-xs space-y-3">
          <span className="text-[9px] font-black text-slate-850 uppercase tracking-widest block font-syne">Pipeline Probability Map</span>
          <div className="space-y-2">
            {Object.entries(diagnosis.stage_probabilities)
              .filter(([stage, prob]) => prob > 0 || stage === diagnosis.rejection_stage)
              .map(([stage, prob]) => {
                const isWinner = stage === diagnosis.rejection_stage;
                return (
                  <div key={stage} className={`p-2.5 rounded-2xl border ${isWinner ? 'bg-brand-50/50 border-brand-200 font-bold' : 'border-slate-100 bg-slate-50/30'}`}>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase mb-1">
                      <span className={isWinner ? 'text-brand-600' : 'text-slate-500'}>{getShortStageName(stage)}</span>
                      <span className={isWinner ? 'text-brand-700 font-black' : 'text-slate-500'}>{prob}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isWinner ? 'bg-brand-500' : 'bg-slate-350'}`}
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Peer benchmarks list */}
      {diagnosis.peer_benchmarks && (
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-3">
          <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest block flex items-center gap-1.5 font-syne">
            <Award size={14} className="text-amber-500" /> Historical Offer Recipients
          </span>
          <p className="text-[10px] text-slate-450 font-bold">
            Average traits for candidates cracking offers at <span className="font-extrabold text-slate-700">{diagnosis.company_name}</span>:
          </p>
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs font-bold text-slate-600">
              <span>Average CGPA:</span>
              <span className="text-slate-800 font-extrabold">{diagnosis.peer_benchmarks.avg_cgpa}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-xs font-bold text-slate-600">
              <span>Internship Count:</span>
              <span className="text-slate-800 font-extrabold">{diagnosis.peer_benchmarks.avg_internships} average</span>
            </div>
            <div className="space-y-1.5">
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest block">Recipient Top Skills:</span>
              <div className="flex flex-wrap gap-1">
                {diagnosis.peer_benchmarks.top_skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-600 font-extrabold text-[8px] rounded uppercase shadow-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Sprint CTA */}
      <div className="bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-3xl p-5 shadow-lg shadow-brand-500/15 text-center relative overflow-hidden select-none">
        <h3 className="text-base font-black font-syne mb-1 text-white">30-Day Recovery Sprint Active</h3>
        <p className="text-[11px] text-brand-100 font-semibold px-2 leading-relaxed mb-5">
          Based on your predicted <span className="font-black text-white underline">{getShortStageName(diagnosis.rejection_stage)}</span> bottleneck, we've loaded a specialized recovery task sequence.
        </p>
        <button
          onClick={() => navigate('/recovery')}
          className="w-full flex items-center justify-center py-3 bg-white text-brand-600 rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer font-extrabold uppercase tracking-widest gap-2"
        >
          Open Recovery Sprint <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}
