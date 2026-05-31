import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { Building2, X } from 'lucide-react';

const POPULAR_COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple',
  'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture',
  'Deloitte', 'JPMorgan', 'Goldman Sachs', 'Morgan Stanley',
  'Flipkart', 'Swiggy', 'Zomato', 'Atlassian', 'Uber'
];

export default function Step4Targets() {
  const navigate = useNavigate();
  const [targetCompanies, setTargetCompanies] = useState(new Set());
  const [customCompany, setCustomCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);

  const toggleCompany = (company) => {
    const next = new Set(targetCompanies);
    if (next.has(company)) {
      next.delete(company);
    } else {
      next.add(company);
    }
    setTargetCompanies(next);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customCompany.trim() && !targetCompanies.has(customCompany.trim())) {
      toggleCompany(customCompany.trim());
      setCustomCompany('');
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      await api.put('/users/onboarding', {
        target_companies: Array.from(targetCompanies),
        target_roles: [role]
      });
      navigate('/onboarding/step5');
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm shadow-slate-100/50"
    >
      <h2 className="text-2xl font-syne font-bold mb-2 text-slate-900">Target Companies & Roles</h2>
      <p className="text-slate-500 font-medium mb-8">This helps us benchmark you against peers who received offers.</p>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">Primary Target Role</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-3 focus:outline-none focus:border-violet-500 font-medium text-sm"
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

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">Target Companies</label>
          
          <div className="flex flex-wrap gap-3 mb-6">
            {POPULAR_COMPANIES.map(company => (
              <button
                key={company}
                onClick={() => toggleCompany(company)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border flex items-center gap-2 ${
                  targetCompanies.has(company)
                    ? 'bg-violet-50 border-violet-500 text-violet-750 font-bold shadow-sm shadow-violet-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-350'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {company}
              </button>
            ))}
          </div>

          <form onSubmit={handleAddCustom} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              placeholder="Add another company..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-800 focus:outline-none focus:border-violet-500 font-medium text-sm"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-bold shadow-sm transition-colors"
            >
              Add
            </button>
          </form>

          {/* Selected Companies Tags */}
          {targetCompanies.size > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-wrap gap-2">
              {Array.from(targetCompanies).map(company => (
                <div key={company} className="bg-white text-slate-805 text-slate-800 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-2 border border-slate-200 shadow-sm">
                  {company}
                  <button onClick={() => toggleCompany(company)} className="text-slate-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between">
        <button
          onClick={() => navigate('/onboarding/step3')}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading || targetCompanies.size === 0}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-violet-200"
        >
          {loading ? 'Saving...' : 'Next Step'}
        </button>
      </div>
    </motion.div>
  );
}
