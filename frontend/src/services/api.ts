import axios from 'axios';

// When deployed on Vercel or any non-localhost URL, don't attempt to ping dead localhost:8000
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:8000/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  timeout: 3000, // Fast 3s timeout so offline fallback activates immediately without hanging
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillchain_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear token if backend explicitly returned a 401 Unauthorized
    // Never clear token on Network Error (when backend is offline)
    if (error.response?.status === 401) {
      localStorage.removeItem('skillchain_token');
      localStorage.removeItem('skillchain_user');
      if (window.location.pathname.startsWith('/student') || window.location.pathname.startsWith('/institution') || window.location.pathname.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
