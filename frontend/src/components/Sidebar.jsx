import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSearch, Calendar, BarChart2, User, Settings, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileSearch, label: 'New Diagnosis', path: '/rejection/new/step1' },
  { icon: Calendar, label: 'Recovery Sprint', path: '/recovery' },
  { icon: BarChart2, label: 'Benchmarks', path: '/analytics' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{ position: 'fixed', left: 0, top: 0, height: '100vh', width: 260, background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', zIndex: 50, fontFamily: 'Inter, sans-serif' }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.2)' }}>
          <Zap size={17} color="#fff" fill="#fff" />
        </div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px', color: '#0f172a' }}>
          Rejection<span style={{ color: '#7c3aed' }}>IQ</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink key={path} to={path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600,
              transition: 'all 0.15s ease',
              color: isActive ? '#7c3aed' : '#64748b',
              background: isActive ? 'rgba(124,58,237,0.07)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(124,58,237,0.15)' : 'transparent'}`,
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ padding: 16, borderRadius: 12, background: '#fafafa', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', fontWeight: 700, fontSize: 15 }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
              <p style={{ fontSize: 10, color: '#7c3aed', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Pro Member</p>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
            onMouseOut={e => e.currentTarget.style.background='rgba(239,68,68,0.05)'}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
