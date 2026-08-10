import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, ToggleLeft, ToggleRight } from 'lucide-react';

export default function DeviceMockup({ children }) {
  const [isFrameMode, setIsFrameMode] = useState(true);
  const [time, setTime] = useState('');

  // Update virtual clock every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 12-hour format
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 transition-all duration-300 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Glows for Premium Vibe */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-android-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Responsive Mode Toggle Panel (Hidden on actual mobile viewports) */}
      <div className="hidden md:flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-full px-5 py-2.5 mb-6 z-20 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
          <Monitor size={14} className={!isFrameMode ? 'text-android-accent' : ''} />
          <span>Full Mobile View</span>
        </div>
        <button 
          onClick={() => setIsFrameMode(!isFrameMode)}
          className="text-slate-350 hover:text-white transition-all transform active:scale-95 cursor-pointer"
        >
          {isFrameMode ? (
            <ToggleRight size={38} className="text-android-accent" />
          ) : (
            <ToggleLeft size={38} className="text-slate-500" />
          )}
        </button>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
          <Smartphone size={14} className={isFrameMode ? 'text-android-accent' : ''} />
          <span>Android Frame</span>
        </div>
      </div>

      {/* Frame Container */}
      <div className={`transition-all duration-500 z-10 flex items-center justify-center ${
        isFrameMode 
          ? 'relative w-[385px] h-[780px] bg-slate-900 rounded-[50px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] border-[4px] border-slate-800'
          : 'w-full max-w-[430px] h-screen bg-slate-950 p-0 shadow-none border-none'
      }`}>
        
        {/* Physical Side Buttons on Mockup (Only visible in frame mode) */}
        {isFrameMode && (
          <>
            {/* Volume Up */}
            <div className="absolute left-[-4px] top-[140px] w-[4px] h-[55px] bg-slate-700 rounded-l-md" />
            {/* Volume Down */}
            <div className="absolute left-[-4px] top-[205px] w-[4px] h-[55px] bg-slate-700 rounded-l-md" />
            {/* Power Button */}
            <div className="absolute right-[-4px] top-[180px] w-[4px] h-[70px] bg-slate-700 rounded-r-md" />
          </>
        )}

        {/* Screen Container */}
        <div className={`w-full h-full flex flex-col bg-android-bg text-android-text relative overflow-hidden select-none ${
          isFrameMode 
            ? 'rounded-[36px] border-[6px] border-slate-950' 
            : 'rounded-none'
        }`}>
          
          {/* Top Speaker & Punch Hole Notch (Only in frame mode) */}
          {isFrameMode && (
            <>
              {/* Speaker Grill */}
              <div className="absolute top-[8px] left-1/2 transform -translate-x-1/2 w-24 h-1 bg-slate-900 rounded-full z-30" />
              {/* Selfie Camera Punch Hole */}
              <div className="absolute top-[16px] left-1/2 transform -translate-x-1/2 w-4.5 h-4.5 bg-slate-950 rounded-full border border-slate-800 z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-indigo-950 rounded-full opacity-60" />
              </div>
            </>
          )}

          {/* Virtual Status Bar */}
          <div className={`w-full bg-white border-b border-slate-100 flex items-center justify-between px-6 z-20 select-none ${
            isFrameMode ? 'pt-6.5 pb-2.5 h-14' : 'pt-3 pb-3 h-12'
          }`}>
            <span className="text-[11px] font-black text-slate-850 tracking-tight">{time}</span>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Signal size={12} className="stroke-[3]" />
              <Wifi size={12} className="stroke-[3]" />
              <div className="flex items-center gap-0.5 bg-slate-105 px-1 py-0.5 rounded-sm">
                <span className="text-[8px] font-black">98%</span>
                <Battery size={13} className="stroke-[2.5] fill-slate-800" />
              </div>
            </div>
          </div>

          {/* Core Content Area */}
          <div className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col relative bg-slate-50/50">
            {children}
          </div>

          {/* Home Gesture Indicator Bar */}
          <div className="w-full bg-white py-2 flex items-center justify-center z-20 select-none border-t border-slate-50">
            <div className="w-28 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full transition-colors cursor-pointer" />
          </div>

        </div>
      </div>
    </div>
  );
}
