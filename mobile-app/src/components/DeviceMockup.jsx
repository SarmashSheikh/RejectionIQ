import React from 'react';

export default function DeviceMockup({ children }) {
  return (
    <div className="min-h-screen w-full bg-slate-100 flex flex-col font-sans">
      <div className="flex-1 w-full flex flex-col max-w-md mx-auto min-h-screen bg-white shadow-sm relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
