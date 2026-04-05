import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('apm_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 — token expired or invalid
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('apm_token');
            localStorage.removeItem('apm_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (data) => API.post('/auth/login', data),
    changePassword: (data) => API.put('/auth/change-password', data),
    getMe: () => API.get('/auth/me'),
};

// Users
export const userAPI = {
    getAll: (params) => API.get('/users', { params }),
    create: (data) => API.post('/users', data),
    getById: (id) => API.get(`/users/${id}`),
    update: (id, data) => API.put(`/users/${id}`, data),
    delete: (id) => API.delete(`/users/${id}`),
};

// Policies
export const policyAPI = {
    getAll: (params) => API.get('/policies', { params }),
    getById: (id) => API.get(`/policies/${id}`),
    create: (data) => API.post('/policies', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => API.put(`/policies/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    submit: (id) => API.put(`/policies/${id}/submit`),
    approve: (id, data) => API.put(`/policies/${id}/approve`, data),
    reject: (id, data) => API.put(`/policies/${id}/reject`, data),
    archive: (id) => API.delete(`/policies/${id}`),
    getHistory: (id) => API.get(`/policies/${id}/history`),
};

// Requests
export const requestAPI = {
    getAll: (params) => API.get('/requests', { params }),
    getById: (id) => API.get(`/requests/${id}`),
    create: (data) => API.post('/requests', data),
    updateStatus: (id, data) => API.put(`/requests/${id}`, data),
};

// Audit
export const auditAPI = {
    getLogs: (params) => API.get('/audit', { params }),
};

// Dashboard
export const dashboardAPI = {
    getAdmin: () => API.get('/dashboard/admin'),
    getFaculty: () => API.get('/dashboard/faculty'),
};

// Academic Info
export const academicInfoAPI = {
    get: () => API.get('/academic-info'),
    update: (data) => API.put('/academic-info', data),
};

export default API;
