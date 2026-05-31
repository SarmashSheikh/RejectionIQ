import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const BRANCHES = [
  { id: 'CSE', label: 'Computer Science' },
  { id: 'IT', label: 'Info Tech' },
  { id: 'ECE', label: 'Electronics' },
  { id: 'EEE', label: 'Electrical' },
  { id: 'MECH', label: 'Mechanical' },
  { id: 'OTHER', label: 'Other' }
];

const YEARS = [2024, 2025, 2026, 2027];

export default function Step1Profile() {
  const navigate = useNavigate();
  const [cgpa, setCgpa] = useState(8.0);
  const [internships, setInternships] = useState(0);
  const [projects, setProjects] = useState(0);
  const [branch, setBranch] = useState('CSE');
  const [year, setYear] = useState(2025);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      await api.put('/users/onboarding', {
        cgpa,
        internship_count: internships,
        project_count: projects,
        branch,
        graduation_year: year
      });
      navigate('/onboarding/step2');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm shadow-slate-100/50"
    >
      <h2 className="text-2xl font-syne font-bold mb-6 text-slate-900">Let's setup your profile</h2>
      
      <div className="space-y-8">
        {/* CGPA Slider */}
        <div>
          <label className="flex justify-between text-sm font-bold text-slate-700 mb-4">
            <span>CGPA</span>
            <span className="text-violet-600 font-mono text-lg font-bold">{cgpa.toFixed(1)}</span>
          </label>
          <input 
            type="range" 
            min="0" max="10" step="0.1" 
            value={cgpa} 
            onChange={(e) => setCgpa(parseFloat(e.target.value))}
            className="w-full accent-violet-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Counters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-700 font-bold text-sm">Internships</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setInternships(Math.max(0, internships - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-800">-</button>
              <span className="w-4 text-center font-mono font-bold text-slate-900">{internships}</span>
              <button onClick={() => setInternships(internships + 1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-800">+</button>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-700 font-bold text-sm">Projects</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setProjects(Math.max(0, projects - 1))} className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-800">-</button>
              <span className="w-4 text-center font-mono font-bold text-slate-900">{projects}</span>
              <button onClick={() => setProjects(projects + 1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-800">+</button>
            </div>
          </div>
        </div>

        {/* Branch Selection */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">Branch</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {BRANCHES.map(b => (
              <button
                key={b.id}
                onClick={() => setBranch(b.id)}
                className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all ${
                  branch === b.id 
                    ? 'bg-violet-50 border-violet-500 text-violet-750 font-bold shadow-sm shadow-violet-100' 
                    : 'bg-slate-50 border-slate-200 text-slate-650 hover:border-slate-400 hover:bg-white'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Graduation Year */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">Graduation Year</label>
          <div className="flex gap-3">
            {YEARS.map(y => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all ${
                  year === y 
                    ? 'bg-fuchsia-50 border-fuchsia-500 text-fuchsia-750 font-bold shadow-sm shadow-fuchsia-100' 
                    : 'bg-slate-50 border-slate-200 text-slate-650 hover:border-slate-400 hover:bg-white'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleNext}
            disabled={loading}
            className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-sm shadow-violet-200"
          >
            {loading ? 'Saving...' : 'Next Step'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
