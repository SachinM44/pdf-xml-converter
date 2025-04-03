import axios from 'axios';

// Set API URL (fallback to localhost if undefined)
export const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL 
  : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Conversion services
export const conversionService = {
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/conversions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  getHistory: async (page = 1, limit = 10) => {
    const response = await api.get('/conversions', {
      params: { page, limit }
    });
    return response.data;
  },
  
  getConversion: async (id) => {
    const response = await api.get(`/conversions/${id}`);
    return response.data;
  },
  
  downloadXML: async (id) => {
    try {
      const response = await api.get(`/conversions/${id}/download`, {
        responseType: 'blob',
        headers: {
          Accept: 'application/xml',
        },
        timeout: 10000 // 10-second timeout
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Download failed with status: ${error.response.status}`);
      } else if (error.request) {
        throw new Error('No response received from server');
      } else {
        throw new Error(error.message || 'Unknown error during download');
      }
    }
  },
};

// Add health check function
export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
