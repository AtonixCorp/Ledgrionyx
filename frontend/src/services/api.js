import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/expenses/'),
  getById: (id) => api.get(`/expenses/${id}/`),
  create: (data) => api.post('/expenses/', data),
  update: (id, data) => api.put(`/expenses/${id}/`, data),
  delete: (id) => api.delete(`/expenses/${id}/`),
  getTotal: () => api.get('/expenses/total/'),
  getByCategory: () => api.get('/expenses/by_category/'),
};

// Income API
export const incomeAPI = {
  getAll: () => api.get('/income/'),
  getById: (id) => api.get(`/income/${id}/`),
  create: (data) => api.post('/income/', data),
  update: (id, data) => api.put(`/income/${id}/`, data),
  delete: (id) => api.delete(`/income/${id}/`),
  getTotal: () => api.get('/income/total/'),
};

// Budgets API
export const budgetsAPI = {
  getAll: () => api.get('/budgets/'),
  getById: (id) => api.get(`/budgets/${id}/`),
  create: (data) => api.post('/budgets/', data),
  update: (id, data) => api.put(`/budgets/${id}/`, data),
  delete: (id) => api.delete(`/budgets/${id}/`),
  getSummary: () => api.get('/budgets/summary/'),
};

export default api;
