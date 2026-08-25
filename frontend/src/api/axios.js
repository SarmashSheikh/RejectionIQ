import axios from 'axios';

// Dynamic API endpoint pointing to live Render backend by default
const baseURL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api'
    : 'https://rejectioniq.onrender.com/api'
);

const api = axios.create({
  baseURL,
  timeout: 35000, // 35 seconds to allow Render free-tier cold starts
});

// Add a request interceptor to include the JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 globally and retry cold-start timeouts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response && error.response.status === 401) {
      // Clear token if it's invalid/expired
      localStorage.removeItem('token');
      // Only redirect if not already on login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Auto-retry once on timeout or network error (handles Render backend cold starts)
    if (config && !config._isRetry && (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('Network Error'))) {
      config._isRetry = true;
      console.warn('[API Cold Start Retry] Backend server spinning up, retrying request...');
      return new Promise((resolve) => {
        setTimeout(() => resolve(api(config)), 2000);
      });
    }

    return Promise.reject(error);
  }
);

export default api;

