import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { CheckCircle, Circle, Target, BookOpen, Briefcase, ChevronRight, BarChart2, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const categoryIcon = (cat) => {
  if (cat === 'Practice') return <BookOpen className="w-4 h-4 text-violet-600" />;
  if (cat === 'Resume') return <Star className="w-4 h-4 text-amber-500" />;
  if (cat === 'Application') return <Briefcase className="w-4 h-4 text-emerald-600" />;
  return <Target className="w-4 h-4 text-slate-500" />;
};

export default function RecoverySprint() {
  const [plan, setPlan] = useState({});
  const [availableSprints, setAvailableSprints] = useState([]);
  const [activeRejection, setActiveRejection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ done: 0, total: 0 });
  const [openWeeks, setOpenWeeks] = useState(['Week 1']);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async (rejectionId = null) => {
    setLoading(true);
    try {
      const url = rejectionId ? `/recovery/plan?rejection_id=${rejectionId}` : '/recovery/plan';
      const res = await api.get(url);
      
      setPlan(res.data.plan || {});
      setAvailableSprints(res.data.available_sprints || []);
      setActiveRejection(res.data.active_rejection || null);

      let done = 0, total = 0;
      Object.values(res.data.plan || {}).forEach(tasks => {
        tasks.forEach(t => { total++; if (t.completed) done++; });
      });
      setStats({ done, total });
    } catch (e) {
      console.error(e);
      toast.error("Failed to load recovery sprint details.");
    }
    setLoading(false);
  };

  const handleSprintChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      fetchPlan(selectedId);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    const newPlan = { ...plan };
    let newDone = stats.done;
    for (const week in newPlan) {
      newPlan[week] = newPlan[week].map(t => {
        if (t.id === taskId) {
          const next = !currentStatus;
          newDone = next ? newDone + 1 : newDone - 1;
          return { ...t, completed: next };
        }
        return t;
      });
    }
    setPlan(newPlan);
    setStats(prev => ({ ...prev, done: newDone }));
    try {
      await api.put(`/recovery/task/${taskId}`, { completed: !currentStatus });
    } catch {
      fetchPlan(activeRejection?.id);
    }
  };

  const toggleWeek = (week) => {
    setOpenWeeks(prev => prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]);
  };

  const progress = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <main className="max-w-4xl mx-auto px-6 py-10">
        
        {/* Header Block */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-violet-50 border border-violet-100 rounded-full text-violet-700 text-xs font-bold mb-3 shadow-sm">
            Interactive Resilience Accelerator
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">30-Day Recovery Sprint</h1>
          <p className="text-slate-500 font-semibold text-sm">AI-personalized daily tasks to close technical skill gaps and rebound stronger.</p>
        </div>

        {/* Sprint Selector Panel */}
        {availableSprints.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-50 border border-violet-100 rounded-lg text-violet-650 shrink-0">
                <Target className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-extrabold">Active Recovery Target</p>
                <p className="text-sm font-extrabold text-slate-800">
                  {activeRejection ? `${activeRejection.company_name} — ${activeRejection.role}` : "Select a sprint..."}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <select
                value={activeRejection?.id || ""}
                onChange={handleSprintChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 font-bold focus:border-violet-500 focus:outline-none shadow-sm cursor-pointer"
              >
                {availableSprints.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.company_name} — {s.role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Sprint Detail Summary Banner */}
        {activeRejection && (
          <div className="bg-gradient-to-r from-violet-600 to-indigo-650 rounded-xl p-6 text-white mb-6 shadow-sm shadow-violet-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] text-violet-200 uppercase tracking-widest font-extrabold mb-1">Sprint Overview Details</p>
              <h2 className="text-xl font-bold">{activeRejection.company_name}</h2>
              <p className="text-violet-100 text-sm font-semibold mb-2">{activeRejection.role}</p>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-extrabold backdrop-blur-sm">
                  Stage: {activeRejection.rejection_stage || "Unknown"}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-violet-150 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-violet-200" /> 30-Day Track
                </span>
              </div>
            </div>
            <div className="px-4 py-3 bg-white/10 rounded-lg backdrop-blur-md border border-white/10 shrink-0 text-center w-full sm:w-auto">
              <span className="block text-[10px] text-violet-200 uppercase tracking-widest font-extrabold mb-0.5">Active Sprint Progress</span>
              <span className="text-2xl font-extrabold text-white">{progress}%</span>
            </div>
          </div>
        )}

        {/* Progress Bar Card */}
        {activeRejection && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm shadow-slate-100/50 p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-violet-650" /> Overall Progress
              </p>
              <p className="text-sm text-slate-500 font-extrabold">{stats.done} / {stats.total} tasks completed</p>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2.5 font-bold">{progress}% completed successfully</p>
          </div>
        )}

        {/* Week Accordions Checklist */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-200 animate-pulse" />)}
          </div>
        ) : Object.keys(plan).length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-sm shadow-slate-100/50">
            <p className="mb-4 font-bold text-slate-500">No active recovery sprint yet.</p>
            <p className="text-xs text-slate-400 mb-6 font-semibold max-w-sm mx-auto">Log a job rejection and let our precision career intelligence engine design a 30-day recovery sprint for you.</p>
            <Link to="/rejection/new/step1" className="px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm shadow-violet-200 inline-flex items-center gap-2">
              Log a Rejection <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(plan).map(([week, tasks]) => (
              <div key={week} className="bg-white rounded-xl border border-slate-200/80 shadow-sm shadow-slate-100/50 overflow-hidden">
                <button
                  onClick={() => toggleWeek(week)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-none bg-transparent"
                >
                  <span className="font-extrabold text-slate-900 text-sm tracking-wide">{week}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs font-bold px-2 py-0.5 bg-slate-100 rounded-full">
                      {tasks.filter(t => t.completed).length} / {tasks.length} completed
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${openWeeks.includes(week) ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {openWeeks.includes(week) && (
                  <div className="border-t border-slate-100 divide-y divide-slate-100">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50/60 transition-all duration-200 ${task.completed ? 'bg-slate-50/30' : ''}`}
                      >
                        <div className="mt-0.5 shrink-0 select-none">
                          {task.completed
                            ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                            : <Circle className="w-5 h-5 text-slate-300 hover:text-violet-500 transition-colors" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className={`text-sm font-bold text-slate-800 ${task.completed ? 'line-through text-slate-450 text-slate-400' : ''}`}>
                              Day {task.day}: {task.title}
                            </p>
                            <span className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-700 font-extrabold rounded-full flex items-center gap-1 shadow-sm border border-violet-100">
                              {categoryIcon(task.category)} {task.category}
                            </span>
                          </div>
                          <p className={`text-xs font-semibold ${task.completed ? 'text-slate-400' : 'text-slate-500'}`}>{task.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
