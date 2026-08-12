import axios from 'axios';

// Linked directly to live production backend on Render
const baseURL = import.meta.env.VITE_API_URL || 'https://rejectioniq.onrender.com/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

// Interceptor to include token on requests
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

// Interceptor to handle 401 unauthorized errors cleanly without page reload
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
