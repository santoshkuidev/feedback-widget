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

// Get all feedback with pagination and filters
export const getAllFeedback = async (
  page = 1,
  limit = 10,
  filters: Record<string, any> = {}
) => {
  try {
    const params = {
      page,
      limit,
      ...filters,
    };

    const response = await api.get('/feedback', { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to get feedback');
    }
    throw new Error('Failed to get feedback');
  }
};

// Get feedback by ID
export const getFeedbackById = async (id: string) => {
  try {
    const response = await api.get(`/feedback/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to get feedback');
    }
    throw new Error('Failed to get feedback');
  }
};

// Delete feedback
export const deleteFeedback = async (id: string) => {
  try {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to delete feedback');
    }
    throw new Error('Failed to delete feedback');
  }
};

// Get feedback statistics
export const getFeedbackStats = async () => {
  try {
    const response = await api.get('/feedback/stats');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Failed to get statistics');
    }
    throw new Error('Failed to get statistics');
  }
};

// Export feedback as CSV
export const exportFeedbackCsv = () => {
  const apiKey = localStorage.getItem('apiKey');
  const url = `${API_URL}/feedback/export`;
  
  // Create a link element to trigger download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'feedback-export.csv');
  
  // Add API key to URL as query parameter
  if (apiKey) {
    link.href = `${url}?apiKey=${apiKey}`;
  }
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
