import React from 'react';

export default function DeviceMockup({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col font-sans">
      <div className="flex-1 w-full flex flex-col max-w-md mx-auto min-h-screen bg-slate-950 relative overflow-hidden sm:border-x sm:border-slate-800/80 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
