import axios from 'axios';

// Determine API base URL
const getBaseURL = () => {
  // In development, use /api proxy (Vite forwards to backend)
  if (import.meta.env.MODE === 'development') {
    return '/api';
  }
  // In production, use environment variable or construct from window location
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  return `${window.location.protocol}//${window.location.host}/api`;
};

const baseURL = getBaseURL();

const axiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
