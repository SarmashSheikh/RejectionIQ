import axios from 'axios';

const RENDER_URL = 'https://rejectioniq.onrender.com/api';

// Candidate URL list builder in priority order
export const getCandidateUrls = () => {
  const candidates = [];
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  // 1. Explicit env variable
  if (import.meta.env.VITE_API_URL) {
    candidates.push(import.meta.env.VITE_API_URL);
  }
  
  // 2. Custom storage override if user set a custom IP in settings
  if (typeof window !== 'undefined' && localStorage.getItem('custom_api_url')) {
    candidates.push(localStorage.getItem('custom_api_url'));
  }

  // 3. Render cloud production backend (primary database for cross-device sync)
  candidates.push(RENDER_URL);

  // 4. Local dev fallbacks (only if not on HTTPS web deployment to avoid Mixed Content errors)
  if (typeof window !== 'undefined' && !isHttps) {
    const isCapacitorNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    const userAgent = navigator.userAgent || '';
    const isAndroid = isCapacitorNative || /android/i.test(userAgent) || window.location.href.startsWith('capacitor://');

    if (isAndroid) {
      candidates.push('http://10.0.2.2:8000/api');
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      candidates.push('http://localhost:8000/api');
    }
  }

  // Return deduplicated array
  return Array.from(new Set(candidates));
};

export const getBaseURL = () => {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('custom_api_url') : null;
  if (custom) return custom;
  
  const candidates = getCandidateUrls();
  return candidates[0] || RENDER_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 35000, // 35 seconds to support Render cloud backend cold starts
});

export const setCustomApiUrl = (url) => {
  if (!url) {
    localStorage.removeItem('custom_api_url');
  } else {
    let cleanUrl = url.trim().replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl += '/api';
    }
    localStorage.setItem('custom_api_url', cleanUrl);
  }
  api.defaults.baseURL = getBaseURL();
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (!config.baseURL || config.baseURL === 'undefined') {
      config.baseURL = getBaseURL();
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with automatic retry failover through all candidate URLs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      return Promise.reject(error);
    }

    // Network error or timeout retry failover logic through ALL candidates
    if (config && (!error.response || error.code === 'ECONNABORTED' || error.message?.includes('Network Error'))) {
      const candidates = getCandidateUrls();
      const currentRetry = config._retryCount || 0;

      if (currentRetry < candidates.length - 1) {
        const currentIndex = candidates.indexOf(config.baseURL);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % candidates.length : (currentRetry + 1) % candidates.length;
        const nextUrl = candidates[nextIndex];

        if (nextUrl && nextUrl !== config.baseURL) {
          console.warn(`[API Failover Retry ${currentRetry + 1}] Server ${config.baseURL} unreachable. Retrying with ${nextUrl}...`);
          config._retryCount = currentRetry + 1;
          config.baseURL = nextUrl;
          api.defaults.baseURL = nextUrl;
          return api(config);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

