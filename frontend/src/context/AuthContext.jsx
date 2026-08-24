import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const formatErrorMessage = (error, defaultMsg = 'An unexpected error occurred') => {
  if (!error) return defaultMsg;
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(item => item.msg || item.detail || JSON.stringify(item)).join(', ');
    }
    if (typeof detail === 'object') return detail.msg || JSON.stringify(detail);
  }
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Connection timed out. Please try again.';
  }
  if (!error.response || error.message === 'Network Error') {
    return 'Unable to connect to backend server. Please verify the server is running.';
  }
  return error.message || defaultMsg;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Token invalid or expired", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // OAuth2PasswordRequestForm expects form data
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', res.data.access_token);
      
      // Fetch user profile
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: formatErrorMessage(error, 'Login failed') 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data && res.data.status === 'verification_pending') {
        return { success: true, verificationPending: true, email: res.data.email };
      }
      // Auto login after register (fallback)
      if (res.data) {
        return await login(userData.email, userData.password);
      }
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: formatErrorMessage(error, 'Registration failed') 
      };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', res.data.access_token);
      
      // Fetch user profile
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: formatErrorMessage(error, 'OTP verification failed')
      };
    }
  };

  const requestOtp = async (email) => {
    try {
      await api.post('/auth/request-otp', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: formatErrorMessage(error, 'Failed to send OTP code')
      };
    }
  };

  const resendOtp = async (email) => {
    try {
      await api.post('/auth/resend-otp', { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: formatErrorMessage(error, 'Failed to resend OTP')
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
    requestOtp,
    resendOtp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
