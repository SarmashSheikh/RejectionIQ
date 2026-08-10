import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, Plus, BarChart2, User } from 'lucide-react';

export default function BottomNavBar() {
  const location = useLocation();
  const activePath = location.pathname;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Recovery', path: '/recovery' },
    { isFloating: true, path: '/rejection/new/step1' },
    { icon: BarChart2, label: 'Benchmarks', path: '/analytics' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 bg-white/85 backdrop-blur-md border-t border-slate-100/80 px-4 py-2 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.03)] h-18">
      {navItems.map((item, index) => {
        if (item.isFloating) {
          const isPlusActive = activePath.includes('/rejection/new');
          return (
            <div key={index} className="relative -top-5 flex flex-col items-center">
              <NavLink 
                to={item.path}
                className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-90 hover:scale-105 border-4 border-white ${
                  isPlusActive 
                    ? 'bg-brand-600 text-white shadow-brand-500/35' 
                    : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25'
                }`}
              >
                <Plus size={24} className="stroke-[2.5]" />
              </NavLink>
              <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest mt-1">LOG REJ</span>
            </div>
          );
        }

        const Icon = item.icon;
        const isActive = activePath === item.path;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex-1 flex flex-col items-center justify-center py-1 transition-all relative"
          >
            {/* Active Highlight Dot Indicator */}
            {isActive && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute top-0 w-6 h-1 bg-brand-500 rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}

            <motion.div
              animate={{ scale: isActive ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className={`p-1.5 rounded-xl ${
                isActive 
                  ? 'text-brand-600 bg-brand-50' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={20} className="stroke-[2]" />
            </motion.div>
            
            <span className={`text-[9px] font-bold tracking-tight mt-0.5 ${
              isActive ? 'text-brand-600 font-extrabold' : 'text-slate-400'
            }`}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </div>
  );
}
