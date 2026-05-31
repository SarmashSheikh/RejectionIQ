import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';

import OnboardingLayout from './pages/onboarding/OnboardingLayout';
import Step1Profile from './pages/onboarding/Step1Profile';
import Step2Resume from './pages/onboarding/Step2Resume';
import Step3Skills from './pages/onboarding/Step3Skills';
import Step4Targets from './pages/onboarding/Step4Targets';
import Step5Complete from './pages/onboarding/Step5Complete';

import NewRejection from './pages/rejection/NewRejection';
import DiagnosisResult from './pages/rejection/DiagnosisResult';
import RecoverySprint from './pages/recovery/RecoverySprint';
import Analytics from './pages/analytics/Analytics';
import Profile from './pages/profile/Profile';
import MainLayout from './components/MainLayout';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes with Sidebar Layout */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/recovery" element={<RecoverySprint />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Navigate to="/profile?tab=security" replace />} />
            
            <Route path="/rejection/new/step1" element={<NewRejection />} />
            <Route path="/rejection/diagnosis/:id" element={<DiagnosisResult />} />
          </Route>

          {/* Onboarding Flow (Separate Layout) */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingLayout />
              </ProtectedRoute>
            }
          >
            <Route path="step1" element={<Step1Profile />} />
            <Route path="step2" element={<Step2Resume />} />
            <Route path="step3" element={<Step3Skills />} />
            <Route path="step4" element={<Step4Targets />} />
            <Route path="step5" element={<Step5Complete />} />
            <Route index element={<Navigate to="step1" replace />} />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
