import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function Step5Complete() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-slate-200/80 p-12 shadow-sm shadow-slate-100/50 text-center flex flex-col items-center justify-center min-h-[400px]"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6"
      >
        <CheckCircle2 className="w-12 h-12" />
      </motion.div>

      <h2 className="text-3xl font-syne font-bold mb-4 text-slate-900">Your Profile is Ready!</h2>
      <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">
        We've successfully processed your resume and skills. You're now ready to start diagnosing rejections and recovering your confidence.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm shadow-violet-200 group"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
