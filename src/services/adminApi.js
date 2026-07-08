import axios from 'axios';

function resolveApiBase() {
  const envBase = import.meta.env.VITE_API_BASE_URL;
  if (envBase && !envBase.includes('localhost') && !envBase.includes('127.0.0.1')) {
    return envBase;
  }
  return '/api';
}

const API_BASE = resolveApiBase();
const LOCAL_FALLBACK_BASES = [];

function fallbackBases() {
  return [];
}

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axios.defaults.withCredentials = true;

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  const language = localStorage.getItem('admin_language') || 'id';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Language'] = language;
  config.headers['X-Admin-Client'] = 'true';

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const isNetworkError = !error.response;
    const isRouteNotFound = error.response?.status === 404 && /route not found/i.test(error.response?.data?.message || '');
    const isAdminAuthRequest = String(config.url || '').startsWith('/admin-auth/');
    const triedBases = config.__triedBases || [config.baseURL || API_BASE];
    const nextBase = (isNetworkError && !isAdminAuthRequest)
      ? fallbackBases().find((base) => !triedBases.includes(base))
      : null;

    if (nextBase) {
      return apiClient.request({
        ...config,
        baseURL: nextBase,
        __triedBases: [...triedBases, nextBase]
      });
    }

    return Promise.reject(error);
  }
);

// Auth
// Keep dashboard compatible with currently running backend builds.
// The admin session is separated by storing the returned admin token locally
// and sending it as Bearer token on every admin request.
export const loginAuth = (payload) => apiClient.post('/auth/login', payload);
export const getAuthMe = () => apiClient.get('/auth/me');
export const logoutAuth = () => Promise.resolve({ data: { message: 'Admin local session cleared' } });

// Dashboard
export const getDashboardSummary = (filter = 'all') =>
  apiClient.get('/admin/dashboard-summary', { params: { filter } });

export const getDashboardPointSummary = (group = 'daily') =>
  apiClient.get('/admin/dashboard-point-summary', { params: { group } });

// Users
export const getUsers = (params = {}) =>
  apiClient.get('/admin/users', { params });

export const getUserById = (id) =>
  apiClient.get(`/admin/users/${id}`);

export const deleteUser = (id) =>
  apiClient.delete(`/admin/users/${id}`);

export const getSurveyLogs = (params = {}) =>
  apiClient.get('/admin/survey-logs', { params });

export const getUserSurveyLogs = (userId) =>
  apiClient.get(`/admin/users/${userId}/survey-logs`);

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

// Progress
export const getUserProgress = (userId) =>
  apiClient.get(`/admin/users/${userId}/progress`);

// Rank Logs
export const getUserRankLogs = (userId) =>
  apiClient.get(`/admin/users/${userId}/rank-logs`);

// Point Logs
export const getUserPointLogs = (userId) =>
  apiClient.get(`/admin/users/${userId}/point-logs`);

export const getRankLogs = () =>
  apiClient.get('/admin/rank-logs');

export const createRankLog = (payload) =>
  apiClient.post('/admin/rank-logs', payload);

export const updateRankLog = (id, payload) =>
  apiClient.put(`/admin/rank-logs/${id}`, payload);

export const deleteRankLog = (id) =>
  apiClient.delete(`/admin/rank-logs/${id}`);

// Leaderboard
export const getLeaderboard = (params = {}) =>
  apiClient.get('/admin/leaderboard', { params });

// Milestones
export const getMilestones = () =>
  apiClient.get('/admin/milestones');

export const createMilestone = (payload) =>
  apiClient.post('/admin/milestones', payload);

export const updateMilestone = (id, payload) =>
  apiClient.put(`/admin/milestones/${id}`, payload);

export const deleteMilestone = (id) =>
  apiClient.delete(`/admin/milestones/${id}`);

// Eco Badges
export const getEcoBadges = () =>
  apiClient.get('/admin/eco-badges');

export const createEcoBadge = (payload) =>
  apiClient.post('/admin/eco-badges', payload);

export const updateEcoBadge = (id, payload) =>
  apiClient.put(`/admin/eco-badges/${id}`, payload);

export const deleteEcoBadge = (id) =>
  apiClient.delete(`/admin/eco-badges/${id}`);

// Quests
export const getQuests = () =>
  apiClient.get('/admin/quests');

export const createQuest = (payload) =>
  apiClient.post('/admin/quests', payload);

export const updateQuest = (id, payload) =>
  apiClient.put(`/admin/quests/${id}`, payload);

export const deleteQuest = (id) =>
  apiClient.delete(`/admin/quests/${id}`);

export default apiClient;
