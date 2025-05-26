import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include API key in headers
api.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register a new user
export const register = async (name: string, email: string, password: string) => {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Registration failed');
  }
};

// Login user
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to get user');
    }
    throw new Error('Failed to get user');
  }
};

// Generate new API key
export const generateApiKey = async (userId: string) => {
  try {
    const response = await api.post(`/auth/api-key/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to generate API key');
    }
    throw new Error('Failed to generate API key');
  }
};
