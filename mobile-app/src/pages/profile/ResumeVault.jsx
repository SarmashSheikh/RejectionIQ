import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  FileText, Plus, CheckCircle2, Sparkles, Award, 
  UploadCloud, FileCheck, ArrowRight, ShieldCheck, Loader2, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResumeVault() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const userName = user?.full_name || "Technologist";

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.pdf')) {
        toast.error('Only PDF documents are supported');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      await api.post('/users/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Resume PDF uploaded and parsed successfully! 🎉');
      setSelectedFile(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to upload resume PDF');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Mobile Top Header Navigation */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-30 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <span className="text-xs font-extrabold text-white tracking-wide">Resume Vault</span>
        <div className="w-6" /> {/* Spacer */}
      </div>

      <div className="p-4 sm:p-6 space-y-6 max-w-lg mx-auto">
        {/* Header Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 p-5 shadow-lg border border-violet-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />
          <div className="relative z-10">
            <span className="text-[10px] tracking-wider uppercase font-extrabold bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-md inline-block mb-2">
              Document Intelligence
            </span>
            <h1 className="text-xl font-extrabold text-white">Resume Vault & ATS Engine</h1>
            <p className="text-xs text-white/80 mt-1">Upload & index your CV for AI diagnosis</p>
          </div>
        </div>

        {/* Primary Document Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 border border-rose-500/20 shrink-0">
              <FileText size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-extrabold text-white truncate">Active Primary Document</h3>
              <p className="text-slate-400 text-xs font-medium truncate mt-0.5">
                {user?.resume_path ? `Cataloged: ${user.resume_path.split('/').pop()}` : 'No resume uploaded yet'}
              </p>
            </div>
          </div>
          
          <label className="w-full py-3 bg-violet-600 hover:bg-violet-700 active:scale-98 text-white rounded-xl text-xs font-bold border border-violet-500 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
            <UploadCloud size={16} /> 
            <span>Select PDF Document</span>
            <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </label>
        </motion.div>

        {/* Pending Upload Action */}
        {selectedFile && (
          <div className="p-4 bg-violet-950/60 border border-violet-800/60 rounded-2xl flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <FileCheck size={20} className="text-violet-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-white truncate">{selectedFile.name}</p>
                <p className="text-[10px] text-violet-300 font-medium">Ready for backend NLP extraction</p>
              </div>
            </div>
            <button 
              onClick={handleUploadSubmit} 
              disabled={uploading}
              className="w-full py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
              Upload & Parse Document Now
            </button>
          </div>
        )}

        {/* Skill Keyword Index Cloud */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Extracted Skill Index
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {user?.skills && user.skills.length > 0 ? (
              user.skills.map((s, idx) => (
                <span key={idx} className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-xl text-xs font-bold text-violet-300">
                  {s}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500 font-medium italic">
                Upload your resume PDF to extract and index technical skills automatically.
              </p>
            )}
          </div>

          {/* Parsed Resume Text Snapshot */}
          {user?.resume_text && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Parsed Text Extract Preview
              </h4>
              <div className="max-h-40 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {user.resume_text}
              </div>
            </div>
          )}
        </div>

        {/* ATS Readiness Card */}
        <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-indigo-700/40 rounded-2xl p-5 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-black text-indigo-300">ATS Readiness Score</span>
            <ShieldCheck size={18} className="text-indigo-300" />
          </div>
          <div className="text-3xl font-black">
            {user?.skills?.length ? Math.min(95, 60 + user.skills.length * 4) : 60}/100
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Automatic Keyword Index matches top engineering framework requirements.
          </p>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase">Optimization Status</span>
            <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              Ready for AI Diagnosis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
