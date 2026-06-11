import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthMe, loginAuth, logoutAuth } from '../services/adminApi';

const AuthContext = createContext(null);
const ADMIN_USER_KEY = 'admin_user';

function readStoredAdminUser() {
  try {
    const value = localStorage.getItem(ADMIN_USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredAdminUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const publicAdminPaths = ['/admin/login', '/admin/unauthorized'];
    if (publicAdminPaths.includes(window.location.pathname)) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await getAuthMe();
      const nextUser = response.data?.user || response.data;
      if (nextUser?.role === 'admin') {
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      } else {
        setUser(null);
        localStorage.removeItem(ADMIN_USER_KEY);
      }
    } catch (err) {
      const hasAdminSession = Boolean(localStorage.getItem('admin_token') || readStoredAdminUser());
      if (!hasAdminSession) {
        setUser(null);
        localStorage.removeItem(ADMIN_USER_KEY);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ username, password }) => {
    const response = await loginAuth({ username, password });
    const loggedInUser = response.data?.user;
    if (!loggedInUser || loggedInUser.role !== 'admin') {
      setUser(null);
      throw new Error('Admin access required.');
    }
    if (response.data?.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_role', loggedInUser.role);
    }
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return response.data;
  };

  const logout = async () => {
    try {
      await logoutAuth();
    } catch {
      // Session may already be expired; local admin state still needs clearing.
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_role');
    localStorage.removeItem(ADMIN_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
