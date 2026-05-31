import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

export default function Step2Resume() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Only PDF files are supported');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error('Only PDF files are supported');
    }
  };

  const handleNext = async () => {
    if (!file) {
      toast.error('Please upload your resume first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/users/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/onboarding/step3');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to parse resume');
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
      <h2 className="text-2xl font-syne font-bold mb-2 text-slate-900">Upload your resume</h2>
      <p className="text-slate-500 font-medium mb-8">We'll use our ML engine to extract your skills and experience.</p>
      
      <div 
        className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all ${
          file ? 'border-green-550 border-green-500/50 bg-green-50/20' : 'border-slate-300 bg-slate-50 hover:border-violet-500 hover:bg-white'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="application/pdf" 
          className="hidden" 
        />
        
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <p className="text-lg font-bold text-slate-900 mb-2">{file.name}</p>
            <p className="text-sm text-slate-500 mb-6 font-semibold">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-sm text-red-500 hover:text-red-750 font-bold transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mb-4">
              <UploadCloud className="w-8 h-8" />
            </div>
            <p className="text-lg font-bold text-slate-800 mb-2">Drag and drop your resume</p>
            <p className="text-sm text-slate-500 mb-6 font-semibold">PDF only, maximum 5MB</p>
            <button className="px-6 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-bold shadow-sm">
              Browse Files
            </button>
          </div>
        )}
      </div>

      <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between">
        <button
          onClick={() => navigate('/onboarding/step1')}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-205 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border border-slate-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!file || loading}
          className="px-8 py-3 bg-violet-600 hover:bg-violet-750 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-violet-200"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Parsing PDF...' : 'Next Step'}
        </button>
      </div>
    </motion.div>
  );
}
