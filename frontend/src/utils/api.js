import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('hn_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// FIXED: Only redirect on 401 if user was previously logged in
// Prevents redirect loop when backend is not running
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const wasLoggedIn = !!localStorage.getItem('hn_token');
      localStorage.removeItem('hn_token');
      localStorage.removeItem('hn_user');
      if (wasLoggedIn) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/me', data),
};

export const propertiesAPI = {
  list:   (params) => api.get('/properties', { params }),
  get:    (id)     => api.get(`/properties/${id}`),
  create: (data)   => api.post('/properties', data),
  update: (id, data) => api.patch(`/properties/${id}`, data),
  delete: (id)     => api.delete(`/properties/${id}`),
  save:   (id)     => api.post(`/properties/${id}/save`),
};

export const applicationsAPI = {
  submit: (data)       => api.post('/applications', data),
  mine:   ()           => api.get('/applications/mine'),
  all:    ()           => api.get('/applications'),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
};

export const paymentsAPI = {
  createCheckout: (data) => api.post('/payments/create-checkout', data),
  history:        ()     => api.get('/payments/history'),
};

export const adminAPI = {
  stats:          ()           => api.get('/admin/stats'),
  users:          ()           => api.get('/admin/users'),
  payments:       ()           => api.get('/admin/payments'),
  updateUserRole: (id, role)   => api.patch(`/admin/users/${id}/role`, { role }),
};

export default api;