import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { 
  CheckCircle2, ArrowRight, ArrowLeft, UploadCloud, 
  CheckCircle, Loader2, Plus, X, Building2, BookOpen, Award 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BRANCHES = [
  { id: 'CSE', label: 'Computer Science' },
  { id: 'IT', label: 'Info Tech' },
  { id: 'ECE', label: 'Electronics' },
  { id: 'EE', label: 'Electrical' },
  { id: 'MECH', label: 'Mechanical' },
  { id: 'OTHER', label: 'Other' }
];

const YEARS = [2024, 2025, 2026, 2027];

const SKILL_CATEGORIES = {
  'Programming': ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go'],
  'Web Dev': ['React', 'Node.js', 'Next.js', 'FastAPI', 'Tailwind', 'Django'],
  'Databases': ['SQL', 'PostgreSQL', 'MongoDB', 'Redis'],
  'Cloud/DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
  'AI/ML': ['TensorFlow', 'PyTorch', 'Pandas', 'Scikit-Learn']
};

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
  'JPMorgan', 'Goldman Sachs', 'Zomato', 'Atlassian', 'Uber'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Profile States
  const [cgpa, setCgpa] = useState(8.0);
  const [internships, setInternships] = useState(0);
  const [projects, setProjects] = useState(0);
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState(2025);

  // Step 2: Resume States
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Step 3: Skills States
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [customSkill, setCustomSkill] = useState('');

  // Step 4: Target States
  const [role, setRole] = useState('Software Engineer');
  const [targetCompanies, setTargetCompanies] = useState(new Set());
  const [customCompany, setCustomCompany] = useState('');

  // ----------------------------------------------------
  // SUBMISSION LOGIC PER STEP
  // ----------------------------------------------------

  const nextStep = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        // Save Step 1: Academic details
        await api.put('/users/onboarding', {
          cgpa,
          internship_count: internships,
          project_count: projects,
          branch,
          graduation_year: year
        });
        setStep(2);
      } else if (step === 2) {
        // Save Step 2: Resume PDF Upload
        if (!file) {
          toast.error('Please upload your resume to continue.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('file', file);
        await api.post('/users/resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setStep(3);
      } else if (step === 3) {
        // Save Step 3: Technical Skills
        if (selectedSkills.size < 3) {
          toast.error('Please select at least 3 skills to continue.');
          setLoading(false);
          return;
        }
        await api.put('/users/onboarding', {
          skills: Array.from(selectedSkills)
        });
        setStep(4);
      } else if (step === 4) {
        // Save Step 4: Target Roles and Companies
        if (targetCompanies.size === 0) {
          toast.error('Please select at least 1 target company.');
          setLoading(false);
          return;
        }
        await api.put('/users/onboarding', {
          target_companies: Array.from(targetCompanies),
          target_roles: [role]
        });
        setStep(5);
      }
    } catch (err) {
      const msg = err.response?.data?.detail 
        ? (typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail))
        : (err.message === 'Network Error' ? 'Cannot connect to backend server. Make sure backend is running.' : 'Failed to update onboarding profile. Please try again.');
      toast.error(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // ----------------------------------------------------
  // HANDLERS FOR MULTI-SELECTION
  // ----------------------------------------------------

  const toggleSkill = (skill) => {
    const next = new Set(selectedSkills);
    if (next.has(skill)) {
      next.delete(skill);
    } else {
      next.add(skill);
    }
    setSelectedSkills(next);
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !selectedSkills.has(customSkill.trim())) {
      toggleSkill(customSkill.trim());
      setCustomSkill('');
    }
  };

  const toggleCompany = (company) => {
    const next = new Set(targetCompanies);
    if (next.has(company)) {
      next.delete(company);
    } else {
      next.add(company);
    }
    setTargetCompanies(next);
  };

  const handleAddCustomCompany = (e) => {
    e.preventDefault();
    if (customCompany.trim() && !targetCompanies.has(customCompany.trim())) {
      toggleCompany(customCompany.trim());
      setCustomCompany('');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error('Only PDF resumes are supported.');
    }
  };

  // ----------------------------------------------------
  // CARD RENDERERS
  // ----------------------------------------------------

  return (
    <div className="flex-1 flex flex-col justify-between px-6 py-6 bg-slate-50/50 min-h-screen">
      
      {/* Progress Bar & Header */}
      {step < 5 && (
        <div className="w-full shrink-0 select-none">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mb-2.5">
            <span>Setup Profile</span>
            <span className="text-brand-600">Step {step} of 4</span>
          </div>
          <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Slide Container */}
      <div className="flex-1 flex flex-col justify-center my-6">
        <AnimatePresence mode="wait">
          
          {step === 1 && (
            /* Step 1: Academic Profile */
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.02)] space-y-5"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 font-syne">Academic Profile</h3>
                <p className="text-slate-400 text-xs font-semibold">Enter your current GPA, projects, and stream details.</p>
              </div>

              {/* CGPA */}
              <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <label className="flex justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  <span>Current CGPA</span>
                  <span className="text-brand-600 font-black text-sm">{cgpa.toFixed(1)}</span>
                </label>
                <input 
                  type="range" 
                  min="0" max="10" step="0.1" 
                  value={cgpa} 
                  onChange={(e) => setCgpa(parseFloat(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-1"
                />
              </div>

              {/* Internships & Projects Count */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 flex flex-col justify-between h-20">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Internships</span>
                  <div className="flex items-center justify-between mt-1">
                    <button type="button" onClick={() => setInternships(Math.max(0, internships - 1))} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-650 cursor-pointer active:scale-90">-</button>
                    <span className="font-extrabold text-sm text-slate-800">{internships}</span>
                    <button type="button" onClick={() => setInternships(internships + 1)} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-650 cursor-pointer active:scale-90">+</button>
                  </div>
                </div>
                <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/50 flex flex-col justify-between h-20">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Projects</span>
                  <div className="flex items-center justify-between mt-1">
                    <button type="button" onClick={() => setProjects(Math.max(0, projects - 1))} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-650 cursor-pointer active:scale-90">-</button>
                    <span className="font-extrabold text-sm text-slate-800">{projects}</span>
                    <button type="button" onClick={() => setProjects(projects + 1)} className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-650 cursor-pointer active:scale-90">+</button>
                  </div>
                </div>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Branch / Major</label>
                <div className="grid grid-cols-3 gap-2">
                  {BRANCHES.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBranch(b.id)}
                      className={`py-2 px-1 text-center rounded-xl border text-[10px] font-black uppercase transition-all cursor-pointer ${
                        branch === b.id 
                          ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-xs' 
                          : 'bg-slate-50/50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {b.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Graduation Year */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Graduation Year</label>
                <div className="flex gap-2">
                  {YEARS.map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYear(y)}
                      className={`flex-1 py-2 text-center rounded-xl border text-[11px] font-black transition-all cursor-pointer ${
                        year === y 
                          ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-xs' 
                          : 'bg-slate-50/50 border-slate-200 text-slate-400'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            /* Step 2: Resume PDF Upload */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.02)] space-y-6"
            >
              <div className="text-center">
                <BookOpen className="w-10 h-10 text-brand-500 mx-auto mb-2" />
                <h3 className="text-lg font-black text-slate-900 font-syne">Upload Resume</h3>
                <p className="text-slate-400 text-xs font-semibold px-4 leading-relaxed mt-1">
                  We'll use our ML analyzer to extract your skills, gaps, and projects instantly.
                </p>
              </div>

              {/* Upload Drop/Click Box */}
              <div 
                onClick={() => !file && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer h-52 ${
                  file ? 'border-emerald-450 bg-emerald-50/10' : 'border-slate-350 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf" 
                  className="hidden" 
                />
                
                {file ? (
                  <div className="text-center space-y-2">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto fill-emerald-50" />
                    <p className="text-xs font-black text-slate-900 truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-[10px] text-rose-500 hover:text-rose-700 font-black uppercase tracking-wider underline cursor-pointer mt-1"
                    >
                      Remove PDF
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <UploadCloud className="w-10 h-10 text-brand-500 mx-auto" />
                    <p className="text-xs font-extrabold text-slate-700">Tap to upload your resume</p>
                    <p className="text-[10px] text-slate-400 font-semibold">PDF format only, max 5MB</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            /* Step 3: Technical Skills Selection */
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.02)] space-y-4"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 font-syne">Technical Skills</h3>
                <p className="text-slate-400 text-xs font-semibold">Select at least 3 core tech capabilities you possess.</p>
              </div>

              {/* Scrollable Categories List */}
              <div className="max-h-[300px] overflow-y-auto no-scrollbar space-y-4 pr-1">
                {Object.entries(SKILL_CATEGORIES).map(([cat, skills]) => (
                  <div key={cat} className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest pl-1">{cat}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map(skill => {
                        const isSelected = selectedSkills.has(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-brand-500 text-white border border-brand-400 shadow-xs'
                                : 'bg-slate-50 border border-slate-200 text-slate-650 hover:bg-slate-100'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom skill input */}
              <div className="pt-3 border-t border-slate-100">
                <form onSubmit={handleAddCustomSkill} className="flex gap-2">
                  <input 
                    type="text" 
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add other skill (e.g. Git, Figma)..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-brand-500 font-bold placeholder-slate-400 text-xs"
                  />
                  <button 
                    type="submit"
                    className="px-3 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center cursor-pointer shadow-sm"
                  >
                    <Plus size={15} className="text-slate-600" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            /* Step 4: Target Companies & Roles */
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_25px_rgba(0,0,0,0.02)] space-y-5"
            >
              <div>
                <h3 className="text-lg font-black text-slate-900 font-syne">Target Career</h3>
                <p className="text-slate-400 text-xs font-semibold">Select your primary role and target organizations.</p>
              </div>

              {/* Target Role Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Primary Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl p-3 focus:outline-none focus:border-brand-500 font-bold text-xs"
                >
                  <option>Software Engineer</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Data Scientist</option>
                  <option>Product Manager</option>
                  <option>UI/UX Designer</option>
                  <option>Data Analyst</option>
                </select>
              </div>

              {/* Target Companies Quick Pills */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">Target Companies</label>
                <div className="max-h-[140px] overflow-y-auto no-scrollbar flex flex-wrap gap-1.5 pr-1 py-1">
                  {POPULAR_COMPANIES.map(company => {
                    const isSelected = targetCompanies.has(company);
                    return (
                      <button
                        key={company}
                        type="button"
                        onClick={() => toggleCompany(company)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-650'
                        }`}
                      >
                        <Building2 size={11} />
                        {company}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Company */}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <input 
                  type="text" 
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  placeholder="Add custom company..."
                  className="flex-1 bg-slate-50/50 border border-slate-250 border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-brand-500 font-bold placeholder-slate-400 text-xs"
                />
                <button 
                  type="button"
                  onClick={handleAddCustomCompany}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[11px] rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            /* Step 5: Complete Screen */
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_8px_25px_rgba(0,0,0,0.02)] text-center flex flex-col items-center justify-center min-h-[350px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100/60 shadow-inner"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>

              <h2 className="text-xl font-black text-slate-900 font-syne mb-2">Setup Complete! 🎉</h2>
              <p className="text-slate-400 text-xs font-semibold max-w-[250px] leading-relaxed mb-8">
                Your career benchmark profile is fully established! We've processed your GPA, skills, and target roles successfully.
              </p>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all cursor-pointer font-extrabold uppercase tracking-widest gap-2"
              >
                Enter Dashboard <ArrowRight size={14} />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Wizard Buttons (Back & Next) */}
      {step < 5 && (
        <div className="flex gap-3 mt-4 shrink-0 select-none">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl font-extrabold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={loading || (step === 2 && !file) || (step === 3 && selectedSkills.size < 3)}
            className="flex-grow py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-brand-500/15 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <span className="flex items-center gap-1 font-extrabold uppercase tracking-wider">
                {step === 4 ? 'Complete Setup' : 'Next Step'} <ArrowRight size={14} />
              </span>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
