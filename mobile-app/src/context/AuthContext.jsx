import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const DEMO_USER = {
    id: 1,
    full_name: 'Arjun Shaik',
    email: 'demo@rejectioniq.com',
    cgpa: 8.1,
    college: 'BITS Pilani',
    branch: 'Computer Science',
    graduation_year: 2025,
    internship_count: 1,
    project_count: 3,
    skills: ['Python', 'React', 'SQL', 'Git', 'FastAPI'],
    target_companies: ['Google', 'Microsoft', 'Amazon', 'Flipkart'],
    target_roles: ['Software Engineer', 'Backend Developer'],
    is_onboarded: true,
    is_verified: true,
    streak_count: 5,
    total_rejections: 8,
    resilience_score: 7.2
  };

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token === 'demo_access_token_rejectioniq') {
        setUser(DEMO_USER);
        setLoading(false);
        return;
      }
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Session check failed:", error);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    
    // Instant fallback for demo account
    if (cleanEmail === 'demo@rejectioniq.com' && (password === 'demo1234' || !password)) {
      localStorage.setItem('token', 'demo_access_token_rejectioniq');
      setUser(DEMO_USER);
      return { success: true };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('username', cleanEmail);
      formData.append('password', password);
      
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      // Store token from real backend
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      
      // Fetch exact user data stored in the backend database
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(userRes.data);
      return { success: true };
    } catch (error) {
      console.error("Login attempt failed:", error);
      const detailMsg = error.response?.data?.detail;
      return { 
        success: false, 
        error: detailMsg || 'Login failed. Please check your credentials or network connection.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const cleanData = { ...userData, email: (userData.email || '').toLowerCase().trim() };
      const res = await api.post('/auth/register', cleanData);
      if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        return { success: true };
      }
      if (res.data && res.data.status === 'verification_pending') {
        return { success: true, verificationPending: true, email: res.data.email };
      }
      return await login(cleanData.email, cleanData.password);
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const cleanEmail = (email || '').toLowerCase().trim();
      const res = await api.post('/auth/verify-otp', { email: cleanEmail, otp });
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      
      // Fetch exact user profile from database
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'OTP verification failed'
      };
    }
  };

  const resendOtp = async (email) => {
    try {
      const cleanEmail = (email || '').toLowerCase().trim();
      await api.post('/auth/resend-otp', { email: cleanEmail });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to resend OTP'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
