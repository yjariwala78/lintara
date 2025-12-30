import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },
};

export const userService = {
  register: async (email: string, username: string, password: string) => {
    const response = await api.post('/users/', { email, username, password });
    return response.data;
  },
};

export const analysisService = {
  create: async (title: string, code_content: string, language: string) => {
    const response = await api.post('/analysis/', { title, code_content, language });
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/analysis/');
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/analysis/${id}`);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/analysis/${id}`);
  },

  reanalyze: async (id: number) => {
    const response = await api.post(`/analysis/${id}/reanalyze`);
    return response.data;
  },
};

export default api;
