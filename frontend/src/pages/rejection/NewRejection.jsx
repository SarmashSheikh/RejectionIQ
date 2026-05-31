import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Building2, Briefcase, Calendar, PhoneCall, Code, Users, 
  BookOpen, Sparkles, ArrowLeft, ArrowRight, HelpCircle, FileText, CheckCircle2 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function NewRejection() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    application_date: '',
    rejection_date: '',
    application_mode: 'LinkedIn',
    oa_completed: false,
    recruiter_call: false,
    technical_round: false,
    hr_round: false,
    jd_text: '',
    email_body: '',
    company_type: 'Product Based',
    selected_round: 'Resume Screening'
  });

  const updateForm = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const submitRejection = async () => {
    setLoading(true);
    try {
      const res = await api.post('/rejections/submit', formData);
      const rejectionId = res.data.id;
      
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds
      
      const checkStatus = async () => {
        if (attempts >= maxAttempts) {
          toast.error('Analysis timed out');
          setLoading(false);
          return;
        }
        
        try {
          const statusRes = await api.get(`/rejections/${rejectionId}/status`);
          if (statusRes.data.status === 'completed') {
            navigate(`/rejection/diagnosis/${rejectionId}`, { state: { diagnosis: statusRes.data } });
          } else if (statusRes.data.status === 'failed') {
            toast.error('Analysis failed during processing');
            setLoading(false);
          } else {
            attempts++;
            setTimeout(checkStatus, 2000);
          }
        } catch (e) {
          toast.error('Failed to check status');
          setLoading(false);
        }
      };
      
      setTimeout(checkStatus, 2000);
      
    } catch (e) {
      toast.error('Failed to analyze rejection');
      console.error(e);
      setLoading(false);
    }
  };

  const currentStepProgress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-violet-50 border border-violet-100 rounded-full text-violet-700 text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> High-Fidelity Intake Console
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 font-syne">Precision AI Rejection Diagnosis</h1>
          <p className="text-slate-500 font-semibold text-sm">Feed our hybrid NLP ensemble your application timeline and rejection notices to unlock custom recovery sprints.</p>
        </div>

        {/* Form Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Interactive Progress Panel */}
          <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5" />
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base mb-1">Diagnostic Progress</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Follow steps to load intake data</p>
              </div>

              {/* Steps Progress Track */}
              <div className="space-y-4">
                {[
                  { label: "Role Parameters", desc: "Position & target metadata" },
                  { label: "Timeline Milestones", desc: "Assessments & interview rounds" },
                  { label: "Contextual Evidence", desc: "Intake rejection notification" }
                ].map((s, idx) => {
                  const sNum = idx + 1;
                  const isActive = step === sNum;
                  const isCompleted = step > sNum;
                  
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border transition-all ${
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-100" 
                          : (isActive 
                              ? "bg-violet-600 border-violet-750 text-white shadow-md shadow-violet-200" 
                              : "bg-slate-50 border-slate-200 text-slate-400")
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : sNum}
                      </div>
                      <div>
                        <p className={`text-sm font-bold leading-none mb-1 ${isActive ? "text-slate-900" : (isCompleted ? "text-slate-500" : "text-slate-400")}`}>
                          {s.label}
                        </p>
                        <p className="text-xs text-slate-400 font-semibold">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress Line */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <span>Intake completion</span>
                  <span className="text-violet-600">{Math.round(currentStepProgress)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${currentStepProgress}%` }}
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
                  />
                </div>
              </div>

              {/* Info Tips Banner */}
              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-violet-650 shrink-0 mt-0.5" />
                <p className="text-[11px] text-violet-700 font-bold leading-relaxed">
                  Our custom SBERT keyword processor performs semantic gap checks relative to typical offers. Providing exact job description text yields highly accurate diagnostic reports.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Sleek Step forms */}
          <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-2xl p-8 min-h-[460px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-syne mb-1">Company & Role Parameters</h2>
                    <p className="text-slate-400 text-xs font-semibold">Tell us where you applied and under what metadata bounds.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-violet-650" /> Company Name
                        </label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-sm font-medium text-slate-800"
                          placeholder="e.g. Stripe"
                          value={formData.company_name} 
                          onChange={e => updateForm({ company_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-violet-650" /> Target Role
                        </label>
                        <input 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-sm font-medium text-slate-800"
                          placeholder="e.g. Software Engineer (Backend)"
                          value={formData.role} 
                          onChange={e => updateForm({ role: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-violet-650" /> Application Date
                        </label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-sm font-medium text-slate-700 cursor-pointer"
                          value={formData.application_date} 
                          onChange={e => updateForm({ application_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-violet-650" /> Rejection Date
                        </label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-55 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-sm font-medium text-slate-700 cursor-pointer"
                          value={formData.rejection_date} 
                          onChange={e => updateForm({ rejection_date: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    {/* Company Type Selector */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-violet-650" /> Target Company Segment
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { value: 'Product Based', label: 'Product Based', desc: 'Google, Stripe, etc. — DSA & scale algorithms' },
                          { value: 'Service Based', label: 'Service Based', desc: 'TCS, Infosys, etc. — Tech versatility & delivery' },
                          { value: 'Start Up', label: 'Start Up', desc: 'Fast-paced, high ownership, rapid deployment' }
                        ].map((item) => (
                          <div
                            key={item.value}
                            onClick={() => updateForm({ company_type: item.value })}
                            className={`p-3.5 border rounded-xl cursor-pointer select-none transition-all flex flex-col justify-between gap-1.5 text-left hover:scale-[1.01] ${
                              formData.company_type === item.value
                                ? "bg-violet-50 border-violet-500 shadow-sm ring-2 ring-violet-500/20"
                                : "bg-slate-50 border-slate-200 hover:border-slate-350"
                            }`}
                          >
                            <span className="text-xs font-extrabold text-slate-900 leading-tight">{item.label}</span>
                            <span className="text-[10px] text-slate-400 font-semibold leading-tight">{item.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={() => setStep(2)} 
                      disabled={!formData.company_name || !formData.role} 
                      className="flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-xl disabled:opacity-50 shadow-sm shadow-violet-250 cursor-pointer transition-all text-sm"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-syne mb-1">Timeline & Gap Parameters</h2>
                    <p className="text-slate-400 text-xs font-semibold">Select the exact interview round and paste the job description to map gaps.</p>
                  </div>

                  {/* Rejection Stage Selector */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-violet-650" /> Select Rejection Round / Stage
                    </label>
                    <select 
                      value={formData.selected_round}
                      onChange={e => updateForm({ selected_round: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:border-violet-500 outline-none transition-all text-sm font-semibold text-slate-800 cursor-pointer"
                    >
                      {[
                        "Resume Screening",
                        "Online Assessment / Aptitude",
                        "Communication Assessment",
                        "Coding Challenge",
                        "Technical Interview Round 1",
                        "Technical Interview Round 2",
                        "Group Discussion (Optional)",
                        "Managerial Interview",
                        "HR Interview",
                        "Background Verification",
                        "Offer Approval / Final Selection"
                      ].map((round) => (
                        <option key={round} value={round}>{round}</option>
                      ))}
                    </select>
                  </div>

                  {/* JD Area */}
                  <div className="space-y-1.5 pt-4">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-violet-650" /> Job Description (Required for Semantic Match Gap checks)
                    </label>
                    <textarea 
                      rows={4} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-800 placeholder-slate-400 focus:border-violet-500 outline-none resize-none transition-all"
                      value={formData.jd_text} 
                      onChange={e => updateForm({ jd_text: e.target.value })}
                      placeholder="Paste the job requirements description to benchmark keyword gaps..."
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-between">
                    <button 
                      onClick={() => setStep(1)} 
                      className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold transition-all text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      onClick={() => setStep(3)} 
                      disabled={!formData.jd_text.trim()}
                      className="flex items-center gap-2 px-8 py-3.5 bg-violet-600 hover:bg-violet-755 hover:bg-violet-700 text-white font-bold rounded-xl disabled:opacity-50 shadow-sm shadow-violet-250 cursor-pointer transition-all text-sm"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-syne mb-1">Contextual Notice Intake</h2>
                    <p className="text-slate-400 text-xs font-semibold">Paste the rejection email text so our sentiment modules analyze the wording patterns.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-violet-650" /> Rejection Email Content
                    </label>
                    <textarea 
                      rows={7} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400/90 placeholder-slate-600 focus:border-violet-500 outline-none resize-none transition-all shadow-inner leading-relaxed"
                      value={formData.email_body} 
                      onChange={e => updateForm({ email_body: e.target.value })}
                      placeholder="Unfortunately, we have decided to move forward with other candidates whose profiles align more closely with..."
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-between">
                    <button 
                      onClick={() => setStep(2)} 
                      className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-xl font-bold transition-all text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      onClick={submitRejection} 
                      disabled={loading || !formData.email_body.trim()} 
                      className="flex items-center gap-2.5 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 shadow-sm shadow-emerald-200 cursor-pointer transition-all text-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Running NLP Engine...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Diagnose Rejection
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
