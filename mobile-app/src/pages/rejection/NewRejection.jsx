import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Briefcase, Calendar, Code, FileText, 
  Sparkles, ArrowLeft, ArrowRight, Loader2, Info 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function NewRejection() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pollingStatus, setPollingStatus] = useState('');

  // Default dates to today for seamless mobile UX
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    company_name: '',
    role: '',
    application_date: today,
    rejection_date: today,
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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.company_name || !formData.role) {
        toast.error('Please enter the Company Name and Role.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.jd_text.trim()) {
        toast.error('Please enter the Job Description.');
        return;
      }
      setStep(3);
    }
  };

  const submitRejection = async () => {
    if (!formData.email_body.trim()) {
      toast.error('Please paste the rejection email or feedback text.');
      return;
    }

    setLoading(true);
    setPollingStatus('Submitting intake data...');
    try {
      const res = await api.post('/rejections/submit', formData);
      const rejectionId = res.data.id;
      
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds total
      
      setPollingStatus('Feeding hybrid NLP engine...');

      const checkStatus = async () => {
        if (attempts >= maxAttempts) {
          toast.error('AI Analysis timed out');
          setLoading(false);
          return;
        }
        
        try {
          const statusRes = await api.get(`/rejections/${rejectionId}/status`);
          if (statusRes.data.status === 'completed') {
            toast.success('Diagnosis completed successfully! 🧠');
            navigate(`/rejection/diagnosis/${rejectionId}`);
          } else if (statusRes.data.status === 'failed') {
            toast.error('Analysis failed during processing.');
            setLoading(false);
          } else {
            attempts++;
            setPollingStatus(`Computing semantic gaps... (${attempts * 2}s)`);
            setTimeout(checkStatus, 2000);
          }
        } catch (e) {
          toast.error('Failed to parse diagnostic status');
          setLoading(false);
        }
      };
      
      setTimeout(checkStatus, 1500);
      
    } catch (e) {
      toast.error('Failed to initiate diagnostic');
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-6 bg-slate-50/50 min-h-screen relative">
      
      {/* Loading Overlay Drawer */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-center p-6 rounded-[36px]"
          >
            <div className="w-18 h-18 bg-brand-500/10 border border-brand-500/20 text-brand-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-pulse-subtle">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
            <h3 className="text-white font-black text-base font-syne mb-2">Analyzing Rejection</h3>
            <p className="text-slate-400 text-xs font-bold max-w-[200px] leading-relaxed">
              {pollingStatus}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Track */}
      <div className="w-full shrink-0 select-none">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-2.5">
          <span>Rejection Diagnostic</span>
          <span className="text-brand-600">Step {step} of 3</span>
        </div>
        <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main card containing step contents */}
      <div className="flex-grow flex flex-col justify-center my-6">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            /* Step 1: Company and Role params */
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.015)] space-y-4"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 font-syne flex items-center gap-1.5">
                  <Building2 size={18} className="text-brand-500" /> Company Parameters
                </h3>
                <p className="text-slate-400 text-xs font-semibold">Feed us target company and role boundaries.</p>
              </div>

              {/* Company Name */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Company Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Stripe"
                  value={formData.company_name}
                  onChange={e => updateForm({ company_name: e.target.value })}
                  className="block w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50/50 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                />
              </div>

              {/* Role Title */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Target Role</label>
                <input 
                  type="text"
                  placeholder="e.g. Backend Engineer"
                  value={formData.role}
                  onChange={e => updateForm({ role: e.target.value })}
                  className="block w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50/50 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs"
                />
              </div>

              {/* Company type selector */}
              <div className="space-y-2 pt-1">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Company Segment</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Product Based', 'Service Based', 'Start Up'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateForm({ company_type: type })}
                      className={`py-2 px-1 rounded-xl border text-[10px] font-black uppercase text-center cursor-pointer transition-all active:scale-95 ${
                        formData.company_type === type
                          ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-xs'
                          : 'bg-slate-50/50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {type.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            /* Step 2: Interview Round and JD */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.015)] space-y-4"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 font-syne flex items-center gap-1.5">
                  <Code size={18} className="text-brand-500" /> Stage Parameters
                </h3>
                <p className="text-slate-400 text-xs font-semibold">Select the round and enter JD details.</p>
              </div>

              {/* Round Dropdown */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Rejection Round</label>
                <select 
                  value={formData.selected_round}
                  onChange={e => updateForm({ selected_round: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-3 focus:outline-none focus:border-brand-500 font-bold text-xs"
                >
                  <option value="Resume Screening">Resume Screening</option>
                  <option value="Online Assessment / Aptitude">Online Assessment</option>
                  <option value="Communication Assessment">Communication Round</option>
                  <option value="Coding Challenge">Coding Assessment</option>
                  <option value="Technical Interview Round 1">Technical Round 1</option>
                  <option value="Technical Interview Round 2">Technical Round 2</option>
                  <option value="HR Interview">HR Interview Round</option>
                  <option value="Offer Approval / Final Selection">Final Offer Stage</option>
                </select>
              </div>

              {/* JD Text */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Job Description Requirements</label>
                <textarea 
                  rows={6} 
                  value={formData.jd_text}
                  onChange={e => updateForm({ jd_text: e.target.value })}
                  placeholder="Paste the target job description details to compute skill alignment gaps..."
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold placeholder-slate-400 text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all text-xs h-36 resize-none"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            /* Step 3: Context Notice Email */
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.015)] space-y-4"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 font-syne flex items-center gap-1.5">
                  <FileText size={18} className="text-brand-500" /> Evidence Intake
                </h3>
                <p className="text-slate-400 text-xs font-semibold">Paste the rejection email or recruiter feedback note.</p>
              </div>

              {/* Email Body */}
              <div className="space-y-0.5">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Rejection Wording Text</label>
                <textarea 
                  rows={8} 
                  value={formData.email_body}
                  onChange={e => updateForm({ email_body: e.target.value })}
                  placeholder="Paste the email: 'Thank you for your interest in the position... Unfortunately, we have decided to move forward with other candidates...'"
                  className="block w-full px-3 py-2 bg-slate-900 border border-slate-850 rounded-2xl font-mono text-[10px] text-emerald-400 placeholder-slate-650 focus:outline-none focus:border-brand-500 transition-all h-44 resize-none leading-relaxed"
                />
              </div>

              {/* Tiny Tip */}
              <div className="bg-brand-50 border border-brand-100/60 rounded-xl p-3 flex items-start gap-2.5">
                <Info size={14} className="text-brand-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                  We use NLP models to analyze the notice sentiment. Wording styles tell us if it was a generic ATS dump or an close manual evaluation cut!
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Button controls */}
      <div className="flex gap-3 shrink-0 select-none">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer animate-scale-in"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <button
          onClick={step === 3 ? submitRejection : handleNext}
          className="flex-grow py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/15 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-extrabold uppercase tracking-wider"
        >
          {step === 3 ? (
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} /> Run Diagnostic
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              Next Step <ArrowRight size={14} />
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
