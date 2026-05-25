import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axios.defaults.withCredentials = true;

// Attach admin token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    if (error.response?.status === 401 && requestUrl !== '/auth/login') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_role');
      window.location.href = '/admin/login';
    }
    if (error.response?.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_role');
      window.location.href = '/admin/unauthorized';
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginAuth = (payload) => apiClient.post('/auth/login', payload);
export const getAuthMe = () => apiClient.get('/auth/me');
export const logoutAuth = () => apiClient.post('/auth/logout');

// Dashboard
export const getDashboardSummary = (filter = 'all') =>
  apiClient.get('/admin/dashboard-summary', { params: { filter } });

// Users
export const getUsers = (params = {}) =>
  apiClient.get('/admin/users', { params });

export const getUserById = (id) =>
  apiClient.get(`/admin/users/${id}`);

export const deleteUser = (id) =>
  apiClient.delete(`/admin/users/${id}`);

// Activity Logs
export const getUserActivityLogs = (userId, params = {}) =>
  apiClient.get(`/admin/users/${userId}/activity-logs`, { params });

export const getActivityLogs = (params = {}) =>
  apiClient.get('/admin/activity-logs', { params });

export const updateActivityLog = (id, payload) =>
  apiClient.put(`/admin/activity-logs/${id}`, payload);

export const deleteActivityLog = (id) =>
  apiClient.delete(`/admin/activity-logs/${id}`);

// Custom Green Actions
export const getUserCustomGreenActions = (userId, params = {}) =>
  apiClient.get(`/admin/users/${userId}/custom-green-actions`, { params });

export const getCustomGreenActions = () =>
  apiClient.get('/admin/custom-green-actions');

export const createCustomGreenAction = (payload) =>
  apiClient.post('/admin/custom-green-actions', payload);

export const updateCustomGreenAction = (id, payload) =>
  apiClient.put(`/admin/custom-green-actions/${id}`, payload);

export const deleteCustomGreenAction = (id) =>
  apiClient.delete(`/admin/custom-green-actions/${id}`);

// Progress (milestones, badges, quests)
export const getUserProgress = (userId) =>
  apiClient.get(`/admin/users/${userId}/progress`);

// Rank Logs
export const getUserRankLogs = (userId) =>
  apiClient.get(`/admin/users/${userId}/rank-logs`);

export const getRankLogs = () =>
  apiClient.get('/admin/rank-logs');

// Leaderboard
export const getLeaderboard = (params = {}) =>
  apiClient.get('/admin/leaderboard', { params });

export const getMilestones = () => apiClient.get('/admin/milestones');
export const createMilestone = (payload) => apiClient.post('/admin/milestones', payload);
export const updateMilestone = (id, payload) => apiClient.put(`/admin/milestones/${id}`, payload);
export const deleteMilestone = (id) => apiClient.delete(`/admin/milestones/${id}`);

export const getEcoBadges = () => apiClient.get('/admin/eco-badges');
export const createEcoBadge = (payload) => apiClient.post('/admin/eco-badges', payload);
export const updateEcoBadge = (id, payload) => apiClient.put(`/admin/eco-badges/${id}`, payload);
export const deleteEcoBadge = (id) => apiClient.delete(`/admin/eco-badges/${id}`);

export const getQuests = () => apiClient.get('/admin/quests');
export const createQuest = (payload) => apiClient.post('/admin/quests', payload);
export const updateQuest = (id, payload) => apiClient.put(`/admin/quests/${id}`, payload);
export const deleteQuest = (id) => apiClient.delete(`/admin/quests/${id}`);

export default apiClient;
