import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import { 
  FileText, Plus, CheckCircle2, Sparkles, Award, 
  UploadCloud, FileCheck, ArrowRight, ShieldCheck, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ResumeVault() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const userName = user?.full_name || "Technologist";
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "IQ";

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-10">

        {/* 🌟 Header Banner */}
        <div className="bg-white border border-slate-200 shadow-sm shadow-slate-100/50 rounded-3xl overflow-hidden mb-8 relative">
          <div className="h-36 bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 relative flex items-center p-8 overflow-hidden select-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/15 via-transparent to-transparent opacity-60" />
            <div className="relative text-white z-10 flex items-center gap-3">
              <FileText className="w-6 h-6 text-yellow-300" />
              <div>
                <span className="text-[10px] tracking-widest uppercase font-extrabold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                  Document Intelligence
                </span>
                <h1 className="text-2xl font-extrabold mt-1">Resume Vault & ATS Engine</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Pane */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm shadow-slate-100/50 space-y-8"
        >
          {/* Primary Document Card */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100 shrink-0">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">Active Primary Document</h3>
                <p className="text-slate-500 text-xs font-bold mt-1">
                  {user?.resume_path ? `Cataloged: ${user.resume_path.split('/').pop()}` : 'No resume file uploaded yet.'}
                </p>
              </div>
            </div>
            
            <label className="px-5 py-3 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-bold border border-violet-600 shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer">
              <UploadCloud size={16} /> 
              <span>Select New PDF</span>
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Pending Upload Banner */}
          {selectedFile && (
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <FileCheck size={20} className="text-violet-600" />
                <div>
                  <p className="text-xs font-extrabold text-violet-900">{selectedFile.name}</p>
                  <p className="text-[10px] text-violet-600 font-semibold">Ready for backend NLP parsing</p>
                </div>
              </div>
              <button 
                onClick={handleUploadSubmit} 
                disabled={uploading}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold hover:bg-violet-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                Upload & Parse Now
              </button>
            </div>
          )}

          {/* Grid Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Extracted Tool Tags Cloud */}
            <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Extracted Skill & Keyword Index
              </h4>
              <div className="flex flex-wrap gap-2">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map(s => (
                    <span key={s} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic">
                    Upload your resume PDF to extract and index technical skills automatically.
                  </p>
                )}
              </div>

              {/* Parsed Resume Text Snapshot */}
              {user?.resume_text && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                    Parsed Text Extract Preview
                  </h4>
                  <div className="max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
                    {user.resume_text}
                  </div>
                </div>
              )}
            </div>

            {/* Resume Quality Score */}
            <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-black opacity-80">ATS Readiness Score</span>
                  <ShieldCheck size={18} />
                </div>
                <div className="text-4xl font-extrabold mb-1">
                  {user?.skills?.length ? Math.min(95, 60 + user.skills.length * 4) : 60}/100
                </div>
                <p className="text-xs opacity-90 font-medium leading-normal mt-2">
                  High keyword density detected across core software engineering frameworks.
                </p>
              </div>

              <div className="pt-6 border-t border-white/20 mt-6">
                <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80 mb-1">Optimization Status</span>
                <span className="text-xs font-extrabold bg-white/20 px-2.5 py-1 rounded-md inline-block">
                  Ready for AI Diagnosis
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
