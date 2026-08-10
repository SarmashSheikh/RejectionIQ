import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNavBar from './BottomNavBar';

export default function MainLayout() {
  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-slate-50/50">
      {/* Top Header */}
      <Header />
      
      {/* Scrollable Page Body */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20 px-4 pt-4">
        <Outlet />
      </main>

      {/* Floating Bottom Nav */}
      <BottomNavBar />
    </div>
  );
}
