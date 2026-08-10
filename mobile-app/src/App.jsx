import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DeviceMockup from './components/DeviceMockup';
import MainLayout from './components/MainLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Onboarding from './pages/onboarding/Onboarding';
import Dashboard from './pages/dashboard/Dashboard';
import RecoverySprint from './pages/recovery/RecoverySprint';
import Analytics from './pages/analytics/Analytics';
import Profile from './pages/profile/Profile';
import NewRejection from './pages/rejection/NewRejection';
import DiagnosisResult from './pages/rejection/DiagnosisResult';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1e293b',
              color: '#fff',
              fontSize: '11px',
              fontWeight: '800',
              borderRadius: '16px',
              fontFamily: 'Outfit, sans-serif',
              border: '1px solid rgba(255,255,255,0.08)'
            }
          }}
        />
        <DeviceMockup>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes with Bottom Tab bar & Branded Header */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/recovery" element={<RecoverySprint />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/rejection/new/step1" element={<NewRejection />} />
              <Route path="/rejection/diagnosis/:id" element={<DiagnosisResult />} />
            </Route>

            {/* Onboarding Flow (Full Screen inside Mockup) */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

            {/* Fallback Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DeviceMockup>
      </AuthProvider>
    </Router>
  );
}
