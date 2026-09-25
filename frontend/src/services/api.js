import axios from 'axios';

// Dynamically determine API base URL
// In production browser (non-localhost), force relative '/api' so it always hits the same server
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '';
  }
  return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
};

export const BASE_URL = getBaseUrl();
const API_BASE_URL = BASE_URL ? (BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`) : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors (401, 403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // If unauthorized, check role to determine login portal redirect
      const role = localStorage.getItem('role');
      localStorage.clear();
      
      if (role === 'ROLE_ADMIN') {
        window.location.href = '/admin/login';
      } else if (role === 'ROLE_DOCTOR') {
        window.location.href = '/doctor/login';
      } else if (role === 'ROLE_PATIENT') {
        window.location.href = '/patient/login';
      } else {
        window.location.href = '/patient/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password, role) => api.post('/auth/login', { email, password, role }),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

export default api;
