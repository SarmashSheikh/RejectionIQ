import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Circle, Target, BookOpen, Briefcase, 
  ChevronRight, BarChart2, Star, Calendar, Info, Loader2 
} from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function RecoverySprint() {
  const [plan, setPlan] = useState({});
  const [availableSprints, setAvailableSprints] = useState([]);
  const [activeRejection, setActiveRejection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ done: 0, total: 0 });
  const [openWeeks, setOpenWeeks] = useState(['Week 1']);

  const categoryIcon = (cat) => {
    if (cat === 'Practice') return <BookOpen size={10} className="text-brand-500" />;
    if (cat === 'Resume') return <Star size={10} className="text-amber-500 fill-amber-500" />;
    if (cat === 'Application') return <Briefcase size={10} className="text-emerald-500" />;
    return <Target size={10} className="text-slate-400" />;
  };

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleSprintChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      fetchPlan(selectedId);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    // Optimistic UI Update
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
    setStats({ ...stats, done: newDone });

    try {
      await api.put(`/recovery/task/${taskId}`, { completed: !currentStatus });
      toast.success(currentStatus ? 'Task active!' : 'Task completed! 🎉');
    } catch (err) {
      toast.error('Failed to sync checklist.');
      // Revert if error
      fetchPlan(activeRejection?.id);
    }
  };

  const toggleWeek = (week) => {
    setOpenWeeks(prev => prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]);
  };

  const progress = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-4 select-none pb-4">
      
      {/* Title */}
      <div>
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">Resilience Accelerator</span>
        <h2 className="text-xl font-black text-slate-800 font-syne">Recovery Sprint</h2>
      </div>

      {/* Active Sprint dropdown panel */}
      {availableSprints.length > 0 && (
        <div className="bg-white border border-slate-105 border-slate-100 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-[0_8px_20px_rgba(0,0,0,0.01)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 border border-brand-100 rounded-xl text-brand-500">
              <Target size={16} />
            </div>
            <div>
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider block">Sprint Target</span>
              <span className="text-xs font-black text-slate-800 leading-none truncate max-w-[150px] block mt-0.5">
                {activeRejection ? activeRejection.company_name : 'Select target...'}
              </span>
            </div>
          </div>
          <select
            value={activeRejection?.id || ""}
            onChange={handleSprintChange}
            className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-[10px] text-slate-700 font-black focus:outline-none cursor-pointer max-w-[120px]"
          >
            {availableSprints.map(s => (
              <option key={s.id} value={s.id}>
                {s.company_name} ({s.role.slice(0, 10)}...)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Progress Card */}
      {activeRejection && (
        <div className="bg-gradient-to-tr from-brand-600 to-brand-500 text-white rounded-3xl p-5 shadow-lg shadow-brand-500/15 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[8px] text-brand-100 font-black uppercase tracking-widest block">Active Sprint Progress</span>
            <h3 className="text-base font-black leading-tight">{activeRejection.company_name}</h3>
            <span className="text-[10px] text-brand-100 font-semibold leading-none block">{activeRejection.role}</span>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[8px] font-extrabold backdrop-blur-sm">
              Stage: {activeRejection.rejection_stage || 'ATS Screen'}
            </span>
          </div>
          {/* Circular Progress Ring */}
          <div className="relative w-16 h-16 bg-white/10 border border-white/10 rounded-full flex items-center justify-center backdrop-blur-md shrink-0 shadow-inner">
            <span className="text-sm font-black">{progress}%</span>
            <div className="absolute inset-0 rounded-full border-2 border-white/20 border-r-white animate-spin-slow pointer-events-none" />
          </div>
        </div>
      )}

      {/* Interactive progress bar info card */}
      {activeRejection && (
        <div className="bg-white border border-slate-100 rounded-3xl p-4.5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between text-[10px] font-extrabold">
            <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><BarChart2 size={13} className="text-brand-500" /> Task completion</span>
            <span className="text-slate-600">{stats.done} of {stats.total} done</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="h-full bg-brand-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Week accordions */}
      {loading ? (
        <div className="space-y-3 py-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-1" />
          <p className="text-[9px] text-slate-400 font-extrabold uppercase">Loading checklist plan...</p>
        </div>
      ) : Object.keys(plan).length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <p className="text-[11px] text-slate-450 italic font-semibold">No active recovery sprint logged.</p>
          <p className="text-[10px] text-slate-400 px-4 font-semibold leading-relaxed">
            Log a job rejection and let our precision AI career diagnostic construct your custom 30-day timeline checklist sprint!
          </p>
          <button 
            onClick={() => navigate('/rejection/new/step1')}
            className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md shadow-brand-500/15"
          >
            Log Rejection
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(plan).map(([week, tasks]) => {
            const isOpened = openWeeks.includes(week);
            const doneCount = tasks.filter(t => t.completed).length;
            
            return (
              <div key={week} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                
                {/* Accordion header */}
                <button
                  onClick={() => toggleWeek(week)}
                  className="w-full px-4.5 py-4 flex items-center justify-between bg-white cursor-pointer select-none active:bg-slate-50 transition-colors"
                >
                  <span className="font-extrabold text-slate-800 text-xs tracking-wide">{week}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 border border-slate-100/50 px-2.5 py-0.5 rounded-full shrink-0">
                      {doneCount}/{tasks.length} Completed
                    </span>
                    <ChevronRight size={14} className={`text-slate-400 transition-transform ${isOpened ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {/* Tasks list checklist */}
                {isOpened && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50 bg-slate-50/15 select-none">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={`flex items-start gap-3 p-3.5 cursor-pointer active:bg-slate-50 hover:bg-slate-50/40 transition-all ${
                          task.completed ? 'bg-emerald-50/5' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {task.completed ? (
                            <CheckCircle size={17} className="text-emerald-500 fill-emerald-50" />
                          ) : (
                            <Circle size={17} className="text-slate-350 hover:text-brand-500 transition-colors" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-black text-slate-805 text-slate-850">
                              Day {task.day}:
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 bg-brand-50 text-brand-700 font-extrabold rounded-full flex items-center gap-1 border border-brand-100 shadow-xs`}>
                              {categoryIcon(task.category)} {task.category}
                            </span>
                          </div>
                          <p className={`text-xs font-bold leading-snug ${
                            task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}>
                            {task.title}
                          </p>
                          <p className={`text-[10px] leading-relaxed mt-0.5 font-semibold ${
                            task.completed ? 'text-slate-405 text-slate-400' : 'text-slate-450 text-slate-500'
                          }`}>
                            {task.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
