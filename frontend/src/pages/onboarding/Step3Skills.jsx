import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { X, Plus } from 'lucide-react';

const CATEGORIES = {
  'Programming': ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Go'],
  'Web': ['React', 'Node.js', 'Next.js', 'HTML/CSS', 'Tailwind', 'Django', 'FastAPI'],
  'Database': ['SQL', 'PostgreSQL', 'MongoDB', 'Redis'],
  'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
  'ML/AI': ['TensorFlow', 'PyTorch', 'Scikit-Learn', 'Pandas', 'NLP']
};

export default function Step3Skills() {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [customSkill, setCustomSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    const next = new Set(selectedSkills);
    if (next.has(skill)) {
      next.delete(skill);
    } else {
      next.add(skill);
    }
    setSelectedSkills(next);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !selectedSkills.has(customSkill.trim())) {
      toggleSkill(customSkill.trim());
      setCustomSkill('');
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      await api.put('/users/onboarding', {
        skills: Array.from(selectedSkills)
      });
      navigate('/onboarding/step4');
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
      <h2 className="text-2xl font-syne font-bold mb-2 text-slate-900">What are your technical skills?</h2>
      <p className="text-slate-500 font-medium mb-8">Select at least 3 skills to proceed.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(CATEGORIES).map(([cat, skills]) => (
            <div key={cat}>
              <h3 className="text-sm font-bold text-slate-700 mb-3">{cat}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedSkills.has(skill)
                        ? 'bg-violet-600 text-white border border-violet-500 shadow-sm shadow-violet-100'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 hover:border-slate-350'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Add Custom Skill</h3>
            <form onSubmit={handleAddCustom} className="flex gap-2">
              <input 
                type="text" 
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Type and press enter"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-slate-800 focus:outline-none focus:border-violet-500 font-medium text-sm"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-white hover:bg-slate-50 rounded-lg text-slate-700 font-bold border border-slate-200 shadow-sm transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Selected Skills Panel */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 h-fit sticky top-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Your Skills ({selectedSkills.size})</h3>
          {selectedSkills.size === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-8">No skills selected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedSkills).map(skill => (
                <div 
                  key={skill}
                  className="bg-white border border-slate-200 rounded-md px-3 py-1.5 flex items-center gap-2 text-sm text-slate-850 font-bold shadow-sm"
                >
                  {skill}
                  <button 
                    onClick={() => toggleSkill(skill)}
                    className="text-slate-450 hover:text-red-500 transition-colors"
                  >
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
          onClick={() => navigate('/onboarding/step2')}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={selectedSkills.size < 3 || loading}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm shadow-violet-200"
        >
          {loading ? 'Saving...' : 'Next Step'}
        </button>
      </div>
    </motion.div>
  );
}
