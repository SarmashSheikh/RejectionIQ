import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function OnboardingLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  let step = 1;
  if (currentPath.includes('step2')) step = 2;
  else if (currentPath.includes('step3')) step = 3;
  else if (currentPath.includes('step4')) step = 4;
  else if (currentPath.includes('step5')) step = 5;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-sm">R</div>
            <span className="font-bold text-lg text-slate-900">RejectionIQ</span>
          </div>
          <p className="text-slate-500 font-bold text-sm">Step {step} of 5</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-200">
        <div
          className="h-full bg-violet-600 transition-all duration-500"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
